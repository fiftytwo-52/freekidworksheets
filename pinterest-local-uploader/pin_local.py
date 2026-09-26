#!/usr/bin/env python3
"""Post pins to Pinterest from your own computer (Pinterest API v5).

Login first (one time):  python3 auth_local.py
Token is read from ~/.pinterest/token.json (auto-refreshes when possible)
or from the PINTEREST_ACCESS_TOKEN environment variable.

Trial access posts to the SANDBOX (pins visible only to you).
Use --prod only after the app has Standard access.

Commands:
  pin_local.py me [--prod]                                   # verify login
  pin_local.py boards [--prod]                               # list your boards
  pin_local.py post --image PATH_OR_URL --board BOARD_ID \\
      --title "T" --description "D" --link URL [--tags "a,b,c"] [--prod]
  pin_local.py batch --csv queue.csv [--prod]                # image,title,description,link,board[,tags]

Tags are appended to the description as #hashtags (Pinterest indexes them as
topic tags). Use --prod once your app has Standard access.
"""

from __future__ import annotations

import argparse
import base64
import csv
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

TOKEN_FILE = os.path.expanduser("~/.pinterest/token.json")
CONFIG_FILE = os.path.expanduser("~/.pinterest/config.json")
SANDBOX = "https://api-sandbox.pinterest.com/v5"
PROD = "https://api.pinterest.com/v5"
MAX_IMAGE_BYTES = 20 * 1024 * 1024


class PinError(RuntimeError):
    pass


def load_token() -> dict:
    env = os.environ.get("PINTEREST_ACCESS_TOKEN")
    if env:
        return {"access_token": env}
    if not os.path.exists(TOKEN_FILE):
        raise PinError("not logged in - run: python3 auth_local.py")
    with open(TOKEN_FILE, encoding="utf-8") as fh:
        return json.load(fh)


def save_token(token: dict) -> None:
    with open(TOKEN_FILE, "w", encoding="utf-8") as fh:
        json.dump(token, fh, indent=2)
    os.chmod(TOKEN_FILE, 0o600)


def refresh_token(token: dict) -> dict:
    if "refresh_token" not in token:
        raise PinError("token expired and no refresh token - run: python3 auth_local.py")
    cfg = json.load(open(CONFIG_FILE, encoding="utf-8"))
    payload = urllib.parse.urlencode({
        "grant_type": "refresh_token",
        "refresh_token": token["refresh_token"],
    }).encode()
    req = urllib.request.Request(
        "https://api.pinterest.com/v5/oauth/token", data=payload, method="POST")
    basic = base64.b64encode(f"{cfg['app_id']}:{cfg['app_secret']}".encode()).decode()
    req.add_header("Authorization", f"Basic {basic}")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    with urllib.request.urlopen(req, timeout=30) as resp:
        new = json.load(resp)
    new["expires_at"] = time.time() + int(new.get("expires_in", 2592000)) - 300
    if "refresh_token" not in new:
        new["refresh_token"] = token["refresh_token"]
    save_token(new)
    return new


def access_token() -> str:
    token = load_token()
    if token.get("expires_at") and token["expires_at"] < time.time():
        token = refresh_token(token)
    return token["access_token"]


def api(method: str, url: str, payload: dict | None = None) -> dict:
    data = None
    headers = {"Accept": "application/json",
               "Authorization": f"Bearer {access_token()}"}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as exc:
        try:
            detail = exc.read().decode("utf-8", errors="replace")
        except Exception:
            detail = ""
        raise PinError(f"Pinterest API HTTP {exc.code}: {detail.strip()}")


def with_tags(description: str, tags: str) -> str:
    """Append comma separated tags to a description as #hashtags.

    A tag may contain spaces; they are joined so "connect the dots" becomes
    "#connectthedots". Split tags with commas, e.g. "apple, connect the dots".
    """
    parts = []
    for tag in (tags or '').split(','):
        clean = tag.strip().lstrip('#').replace(' ', '')
        if clean:
            parts.append(clean)
    if not parts:
        return description
    hashtags = ' '.join('#' + p for p in parts)
    return (description.rstrip() + ' ' + hashtags).strip()


def image_source(image: str) -> dict:
    if image.startswith(("http://", "https://")):
        return {"source_type": "image_url", "url": image}
    path = os.path.expanduser(image)
    size = os.path.getsize(path)
    if size > MAX_IMAGE_BYTES:
        raise PinError(f"image too large ({size} bytes > 20MB)")
    ext = os.path.splitext(path)[1].lower()
    content_type = {".jpg": "image/jpeg", ".jpeg": "image/jpeg",
                    ".png": "image/png", ".webp": "image/webp"}.get(ext)
    if not content_type:
        raise PinError("unsupported image type (use jpg/png/webp)")
    with open(path, "rb") as fh:
        data = base64.b64encode(fh.read()).decode("ascii")
    return {"source_type": "image_base64", "content_type": content_type, "data": data}


def create_pin(prod: bool, image: str, board: str, title: str,
               description: str, link: str) -> dict:
    base = PROD if prod else SANDBOX
    return api("POST", f"{base}/pins", {
        "board_id": board,
        "title": title[:100],
        "description": description,
        "link": link,
        "image_source": image_source(image),
    })


def main() -> int:
    parser = argparse.ArgumentParser(description="Post pins to Pinterest (API v5)")
    sub = parser.add_subparsers(dest="cmd", required=True)

    for name, help_text in (("me", "verify login"), ("boards", "list boards")):
        p = sub.add_parser(name, help=help_text)
        p.add_argument("--prod", action="store_true")

    post = sub.add_parser("post", help="create one pin")
    post.add_argument("--image", required=True, help="local path or public URL")
    post.add_argument("--board", required=True, help="board id")
    post.add_argument("--title", required=True)
    post.add_argument("--description", required=True)
    post.add_argument("--link", required=True, help="destination URL")
    post.add_argument("--tags", default="",
                      help="comma/space separated tags -> appended as #hashtags")
    post.add_argument("--prod", action="store_true")

    batch = sub.add_parser("batch", help="create pins from CSV")
    batch.add_argument("--csv", required=True,
                       help="CSV columns: image,title,description,link,board[,tags]")
    batch.add_argument("--prod", action="store_true")

    args = parser.parse_args()
    try:
        base = PROD if args.prod else SANDBOX
        if args.cmd == "me":
            print(json.dumps(api("GET", f"{base}/user_account"), indent=2))
        elif args.cmd == "boards":
            url = f"{base}/boards?page_size=50"
            while url:
                page = api("GET", url)
                for b in page.get("items", []):
                    print(f"{b['id']}\t{b.get('name', '')}")
                bm = page.get("bookmark")
                url = f"{base}/boards?page_size=50&bookmark={bm}" if bm else ""
        elif args.cmd == "post":
            pin = create_pin(args.prod, args.image, args.board, args.title,
                             with_tags(args.description, args.tags), args.link)
            print(f"created pin {pin.get('id')}  (sandbox={not args.prod})")
        elif args.cmd == "batch":
            ok = failed = 0
            with open(os.path.expanduser(args.csv), newline="", encoding="utf-8") as fh:
                for i, row in enumerate(csv.DictReader(fh), start=2):
                    try:
                        pin = create_pin(args.prod, row["image"].strip(),
                                         row["board"].strip(),
                                         row.get("title", "").strip(),
                                         with_tags(row.get("description", "").strip(),
                                                   row.get("tags", "").strip()),
                                         row.get("link", "").strip())
                        ok += 1
                        print(f"row {i}: OK {pin.get('id')}")
                    except Exception as exc:  # keep batch going
                        failed += 1
                        print(f"row {i}: FAILED {exc}")
            print(f"done: {ok} created, {failed} failed (sandbox={not args.prod})")
            return 1 if failed else 0
    except PinError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
