#!/usr/bin/env python3
"""Post pins to Pinterest from your own computer (Pinterest API v5).

Login first (one time):  python3 auth_local.py
Token is read from ~/.pinterest/token.json (auto-refreshes when possible)
or from the PINTEREST_ACCESS_TOKEN environment variable.

The user's Pinterest account has Standard (Production) access.
Production API is used by default. Use --sandbox for trial/testing.

Commands:
  pin_local.py me                                            # verify login
  pin_local.py boards                                        # list your boards
  pin_local.py status                                        # repository vs Pinterest status
  pin_local.py plan [--category C] [--lang L] [--limit N]    # plan worksheets to pin (with review)
  pin_local.py worksheet --code CODE [--dry-run]             # pin a specific worksheet from the repo
  pin_local.py sync-pins                                     # sync live Pinterest pins to local history
  pin_local.py post --image PATH --board ID --title T ...    # post custom pin
  pin_local.py batch --csv queue.csv                         # batch post from CSV
"""

from __future__ import annotations

import argparse
import base64
import csv
import datetime
import glob
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

TOKEN_FILE = os.path.expanduser("~/.pinterest/token.json")
CONFIG_FILE = os.path.expanduser("~/.pinterest/config.json")
HERE = os.path.dirname(os.path.abspath(__file__))
HISTORY_FILE = os.path.join(HERE, "pinned_history.json")

SANDBOX = "https://api-sandbox.pinterest.com/v5"
PROD = "https://api.pinterest.com/v5"
MAX_IMAGE_BYTES = 20 * 1024 * 1024

# Pinterest Boards for freekidworksheets (52vagwan)
BOARDS = {
    "nepali": ("1127096312935264006", "Nepali Worksheets"),
    "nepali_pt2": ("1127096312935264228", "Nepali Worksheets PT2"),
    "tracing": ("1127096312935308490", "Line Tracing Activities for PreSchool and Nursery"),
    "tracing_pt2": ("1127096312935308509", "Tracing Activities for PreSchool and Nursery-P2"),
    "fun": ("1127096312935335073", "Fun Worksheets For Kids"),
    "kids_pt3": ("1127096312935264238", "Worksheets for kids PT3"),
    "products": ("1127096312935318799", "Products"),
    "social": ("1127096312935308598", "Social"),
}


class PinError(RuntimeError):
    pass


# ---------------------------------------------------------------------------
# Auth and API helpers
# ---------------------------------------------------------------------------

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
    if not os.path.exists(CONFIG_FILE):
        raise PinError("config file missing - run: python3 auth_local.py")
    with open(CONFIG_FILE, encoding="utf-8") as fh:
        cfg = json.load(fh)
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


# ---------------------------------------------------------------------------
# History and Duplicate Prevention
# ---------------------------------------------------------------------------

def load_history() -> dict:
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, encoding="utf-8") as fh:
                return json.load(fh)
        except Exception:
            return {}
    return {}


def save_history(history: dict) -> None:
    with open(HISTORY_FILE, "w", encoding="utf-8") as fh:
        json.dump(history, fh, indent=2, ensure_ascii=False)


def update_external_tracking(code: str, pin_id: str, board_name: str, pin_date: str) -> None:
    tracking_candidates = [
        "/home/fiftytwo/Desktop/GaNesh Khatiwada/Do not Delete/Code base/Newsheet-for-freekidworksheets/worksheet-upload-tracking.md",
        os.path.abspath(os.path.join(HERE, "..", "..", "Newsheet-for-freekidworksheets", "worksheet-upload-tracking.md")),
        os.path.abspath(os.path.join(HERE, "..", "worksheet-upload-tracking.md")),
    ]
    for target in tracking_candidates:
        if os.path.exists(target):
            try:
                with open(target, "r", encoding="utf-8") as fh:
                    lines = fh.readlines()
                updated = False
                new_lines = []
                for line in lines:
                    parts = [p.strip() for p in line.split("|")]
                    if len(parts) >= 15 and parts[1] == str(code):
                        line = re.sub(
                            r"\|\s*Not pinned\s*\|\s*—\s*\|\s*—\s*\|\s*—\s*\|",
                            f"| Pinned | {pin_id} | {board_name} | {pin_date} |",
                            line,
                        )
                        updated = True
                    new_lines.append(line)
                if updated:
                    with open(target, "w", encoding="utf-8") as fh:
                        fh.writelines(new_lines)
                    print(f"Updated tracking ledger: {target}")
            except Exception as e:
                print(f"Note: Could not update tracking ledger {target}: {e}")


def record_pinned(code: str, slug: str, pin_id: str, board_id: str,
                  board_name: str, title: str, link: str) -> None:
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    today_str = datetime.date.today().isoformat()
    hist = load_history()
    hist[str(code)] = {
        "code": str(code),
        "slug": slug,
        "pin_id": pin_id,
        "board_id": board_id,
        "board_name": board_name,
        "title": title,
        "link": link,
        "pinned_at": now_iso,
    }
    save_history(hist)
    update_external_tracking(code, pin_id, board_name, today_str)


def is_pinned(code: str, slug: str = "", hist: dict | None = None) -> dict | None:
    if hist is None:
        hist = load_history()
    if str(code) in hist:
        return hist[str(code)]
    if slug:
        for item in hist.values():
            if item.get("slug") == slug:
                return item
    return None


# ---------------------------------------------------------------------------
# Worksheet Repository Loader
# ---------------------------------------------------------------------------

def get_worksheets_dir() -> str:
    here = os.path.dirname(os.path.abspath(__file__))
    candidate = os.path.abspath(os.path.join(here, "..", "src", "content", "worksheets"))
    if os.path.isdir(candidate):
        return candidate
    cwd_candidate = os.path.abspath(os.path.join(os.getcwd(), "src", "content", "worksheets"))
    if os.path.isdir(cwd_candidate):
        return cwd_candidate
    return candidate


def parse_frontmatter(file_path: str) -> dict:
    with open(file_path, encoding="utf-8") as fh:
        content = fh.read()
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", content, re.DOTALL)
    if not match:
        return {}
    raw_yaml = match.group(1)

    # Use PyYAML if available
    try:
        import yaml
        data = yaml.safe_load(raw_yaml)
        if isinstance(data, dict):
            return data
    except Exception:
        pass

    # Fallback basic parser
    data = {}
    for line in raw_yaml.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" in line:
            key, val = line.split(":", 1)
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if val.startswith("[") and val.endswith("]"):
                items = [x.strip().strip('"').strip("'") for x in val[1:-1].split(",") if x.strip()]
                data[key] = items
            else:
                data[key] = val
    return data


def load_worksheet(md_path: str) -> dict:
    slug = os.path.splitext(os.path.basename(md_path))[0]
    fm = parse_frontmatter(md_path)
    worksheets_dir = os.path.dirname(md_path)

    raw_img = fm.get("image", "")
    if raw_img.startswith("./"):
        image_path = os.path.join(worksheets_dir, raw_img[2:])
    elif raw_img:
        image_path = os.path.join(worksheets_dir, raw_img)
    else:
        # Default code-based png
        code = str(fm.get("code", "")).strip()
        image_path = os.path.join(worksheets_dir, f"{code}.png")

    return {
        "slug": slug,
        "md_path": md_path,
        "code": str(fm.get("code", "")).strip(),
        "title": fm.get("title", slug.replace("-", " ").title()),
        "shortTitle": fm.get("shortTitle", ""),
        "category": fm.get("category", "General"),
        "ageGroup": fm.get("ageGroup", "3-6"),
        "language": (fm.get("language") or "en").lower(),
        "description": fm.get("description", ""),
        "about": fm.get("about", ""),
        "metaDescription": fm.get("metaDescription", ""),
        "tags": fm.get("tags") or [],
        "image_path": image_path,
        "url": f"https://freekidworksheets.com/worksheet/{slug}",
    }


def list_all_worksheets() -> list[dict]:
    ws_dir = get_worksheets_dir()
    md_files = sorted(glob.glob(os.path.join(ws_dir, "*.md")))
    results = []
    for f in md_files:
        try:
            results.append(load_worksheet(f))
        except Exception:
            pass
    return results


def find_worksheet(query: str) -> dict | None:
    query = str(query).strip().lower()
    for ws in list_all_worksheets():
        if ws["code"].lower() == query:
            return ws
        if ws["slug"].lower() == query:
            return ws
        if query in ws["slug"].lower():
            return ws
    return None


# ---------------------------------------------------------------------------
# Pin Generation & Board Resolution
# ---------------------------------------------------------------------------

def resolve_board(ws: dict, board_override: str | None = None) -> tuple[str, str]:
    if board_override:
        # Match by ID or name
        for b_id, b_name in BOARDS.values():
            if board_override == b_id or board_override.lower() == b_name.lower():
                return (b_id, b_name)
        return (board_override, "Custom Board")

    lang = ws.get("language", "en")
    cat = (ws.get("category") or "").strip().lower()

    if lang == "ne":
        return BOARDS["nepali"]
    if "tracing" in cat or "alphabet" in cat:
        return BOARDS["tracing"]
    return BOARDS["fun"]


def format_pin_for_worksheet(ws: dict, board_override: str | None = None) -> dict:
    board_id, board_name = resolve_board(ws, board_override)
    title = (ws.get("shortTitle") or ws.get("title") or "").strip()
    lang = ws.get("language", "en")

    # Title: Keep under 100 characters
    if lang == "ne":
        pin_title = f"{title} — Free Printable Worksheet"
        if len(pin_title) > 98:
            pin_title = f"{title[:75]} (Free Printable)"
    else:
        pin_title = f"{title} (Free Printable Worksheet)"
        if len(pin_title) > 98:
            pin_title = f"{title[:75]} — Free Worksheet"
    pin_title = pin_title[:100].strip()

    # Description: about or description + tags + site link
    desc_base = (ws.get("about") or ws.get("description") or "").strip()
    if not desc_base:
        desc_base = f"Free printable {title} worksheet for kids ages {ws.get('ageGroup', '3-6')}."

    # Hashtags based on language and category
    cat = (ws.get("category") or "").strip().lower()
    if lang == "ne":
        tags = ["nepaliworksheets", "kidsworksheets", "freeprintable", "preschool", "learningactivities"]
    elif "tracing" in cat:
        tags = ["tracingworksheets", "linetracing", "preschoolactivities", "freeprintable", "finemotorskills"]
    elif "coloring" in cat:
        tags = ["coloringpages", "kidscoloring", "preschool", "freeprintable", "earlylearning"]
    elif "math" in cat:
        tags = ["mathworksheets", "countingworksheets", "preschoolmath", "freeprintable", "kindergarten"]
    else:
        tags = ["kidsworksheets", "freeprintable", "preschoolactivities", "homeschool", "learningactivities"]

    hashtags_str = " ".join(f"#{t}" for t in tags)
    description = f"{desc_base} {hashtags_str} Download and print free A4 worksheets at freekidworksheets.com."

    return {
        "code": ws["code"],
        "slug": ws["slug"],
        "image": ws["image_path"],
        "board_id": board_id,
        "board_name": board_name,
        "title": pin_title,
        "description": description.strip(),
        "link": ws["url"],
    }


# ---------------------------------------------------------------------------
# Core Pin Creation
# ---------------------------------------------------------------------------

def image_source(image: str) -> dict:
    if image.startswith(("http://", "https://")):
        return {"source_type": "image_url", "url": image}
    path = os.path.expanduser(image)
    if not os.path.exists(path):
        raise PinError(f"image not found: {path}")
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


def create_pin(base_url: str, image: str, board: str, title: str,
               description: str, link: str) -> dict:
    return api("POST", f"{base_url}/pins", {
        "board_id": board,
        "title": title[:100],
        "description": description,
        "link": link,
        "media_source": image_source(image),
    })


def with_tags(description: str, tags: str) -> str:
    parts = []
    for tag in (tags or "").split(","):
        clean = tag.strip().lstrip("#").replace(" ", "")
        if clean:
            parts.append(clean)
    if not parts:
        return description
    hashtags = " ".join("#" + p for p in parts)
    return (description.rstrip() + " " + hashtags).strip()


# ---------------------------------------------------------------------------
# CLI Command Implementations
# ---------------------------------------------------------------------------

def get_base_url(args: argparse.Namespace) -> str:
    # If explicitly --prod, use PROD
    if getattr(args, "prod", False):
        return PROD
    # If explicitly --sandbox, use SANDBOX
    if getattr(args, "sandbox", False):
        return SANDBOX
    # Check token's is_sandbox flag
    try:
        token = load_token()
        if token.get("is_sandbox"):
            return SANDBOX
    except Exception:
        pass
    return SANDBOX

def cmd_me(args: argparse.Namespace) -> int:
    base = get_base_url(args)
    user_info = api("GET", f"{base}/user_account")
    print(json.dumps(user_info, indent=2))
    return 0

def cmd_boards(args: argparse.Namespace) -> int:
    base = get_base_url(args)
    url = f"{base}/boards?page_size=50"
    while url:
        page = api("GET", url)
        for b in page.get("items", []):
            print(f"{b['id']}\t{b.get('name', '')}")
        bm = page.get("bookmark")
        url = f"{base}/boards?page_size=50&bookmark={bm}" if bm else ""
    return 0


def cmd_status(args: argparse.Namespace) -> int:
    base = get_base_url(args)
    user_info = api("GET", f"{base}/user_account")
    all_ws = list_all_worksheets()
    hist = load_history()

    nepali_ws = [w for w in all_ws if w.get("language") == "ne"]
    english_ws = [w for w in all_ws if w.get("language") != "ne"]

    pinned_count = len(hist)
    unpinned_count = max(0, len(all_ws) - pinned_count)

    print("\n=== Pinterest Account ===")
    print(f"User:          {user_info.get('business_name')} (@{user_info.get('username')})")
    print(f"Monthly Views: {user_info.get('monthly_views', 0):,}")
    print(f"Pin Count:     {user_info.get('pin_count', 0)}")
    print(f"Board Count:   {user_info.get('board_count', 0)}")

    print("\n=== Worksheet Repository ===")
    print(f"Total Sheets:  {len(all_ws)} (Nepali: {len(nepali_ws)}, English/Other: {len(english_ws)})")
    print(f"Pinned:        {pinned_count}")
    print(f"Pending/New:   {unpinned_count}")
    print(f"History File:  {HISTORY_FILE}")
    print()
    return 0


def cmd_plan(args: argparse.Namespace) -> int:
    all_ws = list_all_worksheets()
    hist = load_history()

    # Filter
    filtered = []
    for ws in all_ws:
        if getattr(args, "code", None) and ws["code"] != args.code:
            continue
        if getattr(args, "lang", None) and ws["language"] != args.lang.lower():
            continue
        if getattr(args, "category", None) and args.category.lower() not in ws["category"].lower():
            continue
        if not getattr(args, "all", False):  # unpinned only by default
            if is_pinned(ws["code"], ws["slug"], hist):
                continue
        filtered.append(ws)

    limit = getattr(args, "limit", 10)
    planned = filtered[:limit]

    if not planned:
        print("No worksheets matched your criteria (or all matching sheets are already pinned).")
        return 0

    print(f"\n=== Planned Pins ({len(planned)} worksheets) ===")
    plan_rows = []
    for i, ws in enumerate(planned, start=1):
        pin_data = format_pin_for_worksheet(ws, getattr(args, "board", None))
        plan_rows.append(pin_data)
        print(f"\n[{i}/{len(planned)}] Code {ws['code']} — {ws['title']}")
        print(f"  Board:       {pin_data['board_name']} ({pin_data['board_id']})")
        print(f"  Title:       {pin_data['title']}")
        print(f"  Image:       {pin_data['image']}")
        print(f"  Link:        {pin_data['link']}")
        print(f"  Description: {pin_data['description'][:120]}...")

    if getattr(args, "csv", None):
        csv_path = os.path.expanduser(args.csv)
        with open(csv_path, "w", newline="", encoding="utf-8") as fh:
            writer = csv.DictWriter(fh, fieldnames=["image", "title", "description", "link", "board"])
            writer.writeheader()
            for r in plan_rows:
                writer.writerow({
                    "image": r["image"],
                    "title": r["title"],
                    "description": r["description"],
                    "link": r["link"],
                    "board": r["board_id"],
                })
        print(f"\nSaved CSV batch queue to: {csv_path}")
        print(f"To post this batch after approval, run: python3 pin_local.py batch --csv {csv_path}")

    print("\n[NOTE] As per AGENT.md HARD RULE 1: Review the plan above with the user before posting.")
    return 0


def cmd_worksheet(args: argparse.Namespace) -> int:
    query = args.code or args.slug
    if not query:
        print("error: --code or --slug required", file=sys.stderr)
        return 2

    ws = find_worksheet(query)
    if not ws:
        print(f"error: worksheet not found matching '{query}'", file=sys.stderr)
        return 1

    hist = load_history()
    existing = is_pinned(ws["code"], ws["slug"], hist)
    if existing and not getattr(args, "force", False):
        print(f"Worksheet {ws['code']} ({ws['slug']}) is already pinned!")
        print(f"Existing Pin ID: {existing.get('pin_id')} on board '{existing.get('board_name')}'")
        print("Pass --force to post again.")
        return 0

    pin_data = format_pin_for_worksheet(ws, getattr(args, "board", None))

    if getattr(args, "dry_run", False):
        print("\n=== DRY RUN (No pin created) ===")
        print(f"Code:        {ws['code']}")
        print(f"Slug:        {ws['slug']}")
        print(f"Board:       {pin_data['board_name']} ({pin_data['board_id']})")
        print(f"Title:       {pin_data['title']}")
        print(f"Image:       {pin_data['image']}")
        print(f"Link:        {pin_data['link']}")
        print(f"Description: {pin_data['description']}")
        return 0

    base = get_base_url(args)
    board_id = pin_data["board_id"]
    board_name = pin_data["board_name"]

    # In Sandbox environment, use sandbox board unless an explicit board override was passed
    if base == SANDBOX and not getattr(args, "board", None):
        board_id = "1127096312935342580"
        board_name = "Sandbox Test Worksheets"

    print(f"Posting worksheet {ws['code']} ({ws['title']}) to board '{board_name}'...")
    pin = create_pin(base, pin_data["image"], board_id,
                     pin_data["title"], pin_data["description"], pin_data["link"])

    pin_id = pin.get("id")
    print(f"SUCCESS: Created pin {pin_id}")
    print(f"Pin URL: https://www.pinterest.com/pin/{pin_id}/")

    # Record in history
    record_pinned(ws["code"], ws["slug"], pin_id, board_id,
                  board_name, pin_data["title"], pin_data["link"])
    print(f"Recorded in {HISTORY_FILE}")
    return 0


def cmd_sync_pins(args: argparse.Namespace) -> int:
    base = get_base_url(args)
    print("Fetching existing boards and pins from Pinterest...")
    boards_page = api("GET", f"{base}/boards?page_size=50")
    boards = boards_page.get("items", [])

    all_ws = list_all_worksheets()
    slug_map = {ws["slug"]: ws for ws in all_ws}
    code_map = {ws["code"]: ws for ws in all_ws}

    hist = load_history()
    matched = 0

    for b in boards:
        b_id = b["id"]
        b_name = b.get("name", "")
        url = f"{base}/boards/{b_id}/pins?page_size=100"
        while url:
            res = api("GET", url)
            items = res.get("items", [])
            for p in items:
                pin_id = p.get("id")
                link = p.get("link") or ""
                # Match /worksheet/<slug>
                match = re.search(r"/worksheet/([a-zA-Z0-9_-]+)", link)
                ws = None
                if match:
                    slug = match.group(1)
                    ws = slug_map.get(slug)
                if not ws:
                    # Try matching code in title or link
                    title = p.get("title") or ""
                    for c, item in code_map.items():
                        if c in title or c in link:
                            ws = item
                            break

                if ws:
                    hist[ws["code"]] = {
                        "code": ws["code"],
                        "slug": ws["slug"],
                        "pin_id": pin_id,
                        "board_id": b_id,
                        "board_name": b_name,
                        "title": p.get("title", ws["title"]),
                        "link": link or ws["url"],
                        "pinned_at": p.get("created_at") or datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    }
                    matched += 1
            bm = res.get("bookmark")
            url = f"{base}/boards/{b_id}/pins?page_size=100&bookmark={bm}" if bm else ""

    save_history(hist)
    print(f"Sync complete. Matched {matched} existing pins to repository worksheets.")
    print(f"Total pinned worksheets tracked in history: {len(hist)}")
    return 0


def cmd_post(args: argparse.Namespace) -> int:
    base = get_base_url(args)
    pin = create_pin(base, args.image, args.board, args.title,
                     with_tags(args.description, args.tags), args.link)
    print(f"created pin {pin.get('id')}")
    return 0


def cmd_batch(args: argparse.Namespace) -> int:
    base = get_base_url(args)
    ok = failed = 0
    hist = load_history()
    csv_file = os.path.expanduser(args.csv)

    with open(csv_file, newline="", encoding="utf-8") as fh:
        for i, row in enumerate(csv.DictReader(fh), start=2):
            try:
                link = row.get("link", "").strip()
                title = row.get("title", "").strip()
                image = row["image"].strip()
                board = row["board"].strip()
                desc = with_tags(row.get("description", "").strip(), row.get("tags", "").strip())

                pin = create_pin(base, image, board, title, desc, link)
                pin_id = pin.get("id")
                ok += 1
                print(f"row {i}: OK {pin_id}")

                # If link points to worksheet slug, record history
                match = re.search(r"/worksheet/([a-zA-Z0-9_-]+)", link)
                if match:
                    slug = match.group(1)
                    code_match = re.search(r"-(\d{4,5})$", slug)
                    code = code_match.group(1) if code_match else slug
                    hist[code] = {
                        "code": code,
                        "slug": slug,
                        "pin_id": pin_id,
                        "board_id": board,
                        "board_name": "",
                        "title": title,
                        "link": link,
                        "pinned_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    }
                    save_history(hist)

            except Exception as exc:
                failed += 1
                print(f"row {i}: FAILED {exc}")

    print(f"\ndone: {ok} created, {failed} failed")
    return 1 if failed else 0


# ---------------------------------------------------------------------------
# Main Entry Point
# ---------------------------------------------------------------------------

def main() -> int:
    parser = argparse.ArgumentParser(description="Post pins to Pinterest (API v5) for freekidworksheets")
    parser.add_argument("--sandbox", action="store_true", help="use Pinterest Sandbox instead of Production")
    parser.add_argument("--prod", action="store_true", help="use Production (default)")

    sub = parser.add_subparsers(dest="cmd", required=True)

    # 1. Verification & diagnostics
    sub.add_parser("me", help="verify login and account details")
    sub.add_parser("boards", help="list Pinterest boards and IDs")
    sub.add_parser("status", help="overview of repository worksheets and Pinterest sync status")
    sub.add_parser("sync-pins", help="sync live Pinterest pins into local tracking ledger")

    # 2. Worksheet workflows
    ws_p = sub.add_parser("worksheet", help="upload one worksheet from the repository")
    ws_p.add_argument("--code", help="worksheet code (e.g. 4070)")
    ws_p.add_argument("--slug", help="worksheet slug")
    ws_p.add_argument("--board", help="optional board ID override")
    ws_p.add_argument("--dry-run", action="store_true", help="preview payload without posting")
    ws_p.add_argument("--force", action="store_true", help="post even if already recorded in history")

    plan_p = sub.add_parser("plan", help="draft a plan of worksheets to upload (for approval)")
    plan_p.add_argument("--code", help="filter by specific code")
    plan_p.add_argument("--category", help="filter by category (e.g. Coloring, Tracing, Math)")
    plan_p.add_argument("--lang", help="filter by language (ne, en)")
    plan_p.add_argument("--limit", type=int, default=5, help="max items to plan (default 5)")
    plan_p.add_argument("--all", action="store_true", help="include already-pinned worksheets")
    plan_p.add_argument("--csv", help="optional path to save plan as queue CSV")
    plan_p.add_argument("--board", help="optional board ID override")

    # 3. Manual & batch posting
    post_p = sub.add_parser("post", help="create arbitrary pin")
    post_p.add_argument("--image", required=True, help="local path or public URL")
    post_p.add_argument("--board", required=True, help="board id")
    post_p.add_argument("--title", required=True)
    post_p.add_argument("--description", required=True)
    post_p.add_argument("--link", required=True, help="destination URL")
    post_p.add_argument("--tags", default="", help="comma-separated tags")

    batch_p = sub.add_parser("batch", help="create pins from CSV")
    batch_p.add_argument("--csv", required=True, help="CSV columns: image,title,description,link,board")

    args = parser.parse_args()

    try:
        if args.cmd == "me":
            return cmd_me(args)
        elif args.cmd == "boards":
            return cmd_boards(args)
        elif args.cmd == "status":
            return cmd_status(args)
        elif args.cmd == "plan":
            return cmd_plan(args)
        elif args.cmd == "worksheet":
            return cmd_worksheet(args)
        elif args.cmd == "sync-pins":
            return cmd_sync_pins(args)
        elif args.cmd == "post":
            return cmd_post(args)
        elif args.cmd == "batch":
            return cmd_batch(args)
    except PinError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2

    return 0


if __name__ == "__main__":
    sys.exit(main())
