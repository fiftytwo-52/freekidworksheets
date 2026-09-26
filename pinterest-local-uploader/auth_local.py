#!/usr/bin/env python3
"""One-time Pinterest login for your own computer.

Run:  python3 auth_local.py

What it does:
  1. Asks for your Pinterest App ID and App secret (saved to
     ~/.pinterest/config.json, file permissions 0600, never printed).
  2. Opens Pinterest in your browser - approve access for your own account.
  3. Captures the login on http://localhost:8085/callback
     (make sure this exact URL is in your Pinterest app's Redirect URIs).
  4. Saves the access + refresh tokens to ~/.pinterest/token.json.

Re-run it any time pin_local.py says the token stopped working.
Requires: python3 (no extra packages).
"""

from __future__ import annotations

import base64
import json
import os
import threading
import time
import urllib.parse
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer

APP_ID = "1616080"  # freekidworksheets app; change if you use another app
REDIRECT_URI = "http://localhost:8085/callback"
SCOPES = "boards:read,boards:write,pins:read,pins:write,user_accounts:read"
CONFIG_DIR = os.path.expanduser("~/.pinterest")
CONFIG_FILE = os.path.join(CONFIG_DIR, "config.json")
TOKEN_FILE = os.path.join(CONFIG_DIR, "token.json")

_result: dict = {}


class CallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):  # noqa: N802
        query = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(query)
        if "code" in params:
            _result["code"] = params["code"][0]
            body = b"<h1>Done! You can close this tab and go back to the terminal.</h1>"
        else:
            body = b"<h1>Login failed - no code received. Try again.</h1>"
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):  # keep the terminal clean
        pass


def load_config() -> dict:
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, encoding="utf-8") as fh:
            return json.load(fh)
    return {}


def save_json(path: str, data: dict) -> None:
    os.makedirs(CONFIG_DIR, exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2)
    os.chmod(path, 0o600)


def exchange_code(app_id: str, app_secret: str, code: str) -> dict:
    payload = urllib.parse.urlencode({
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
    }).encode()
    req = urllib.request.Request(
        "https://api.pinterest.com/v5/oauth/token", data=payload, method="POST")
    basic = base64.b64encode(f"{app_id}:{app_secret}".encode()).decode()
    req.add_header("Authorization", f"Basic {basic}")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def main() -> int:
    cfg = load_config()
    app_id = cfg.get("app_id") or input(f"App ID [{APP_ID}]: ").strip() or APP_ID
    app_secret = cfg.get("app_secret") or input("App secret (paste, it stays on your machine): ").strip()
    if not app_secret:
        print("App secret is required.")
        return 1
    save_json(CONFIG_FILE, {"app_id": app_id, "app_secret": app_secret})

    server = HTTPServer(("127.0.0.1", 8085), CallbackHandler)
    thread = threading.Thread(target=server.handle_request, daemon=True)
    thread.start()

    params = urllib.parse.urlencode({
        "client_id": app_id,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": SCOPES,
        "state": os.urandom(8).hex(),
    })
    url = f"https://www.pinterest.com/oauth/?{params}"
    print("\nOpening Pinterest login in your browser...")
    print("If it doesn't open, paste this URL manually:\n")
    print(url + "\n")
    webbrowser.open(url)

    for _ in range(120):
        if "code" in _result:
            break
        time.sleep(1)
    server.server_close()
    if "code" not in _result:
        print("Timed out waiting for the Pinterest login (2 min). Run again.")
        return 1

    token = exchange_code(app_id, app_secret, _result["code"])
    token["expires_at"] = time.time() + int(token.get("expires_in", 2592000)) - 300
    save_json(TOKEN_FILE, token)
    print("\nLogged in! Token saved to ~/.pinterest/token.json")
    print("Try:  python3 pin_local.py boards")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
