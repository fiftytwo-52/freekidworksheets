"""
Gemini TTS Nepali voice test for Suna.

Generates short Nepali samples with several Gemini voices so you can HEAR
them and pick a winner. Stdlib only (+ ffmpeg). Run on your local machine:

    1. Get a free API key: https://aistudio.google.com/apikey  (no card needed)
    2. export GEMINI_API_KEY="paste-your-key-here"
    3. python3 scripts/test_gemini_nepali.py

Listen to ./gemini-nepali-test/*.mp3 and tell me your pick, e.g. "Kore".
Then I'll wire the winner into scripts/generate_audio.py for the full
Nepali pack (female + male slots).

NOTE: never commit your API key. The script only reads it from the env var.
"""
import base64
import json
import os
import subprocess
import sys
import time
import urllib.request

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "gemini-nepali-test")

# Tried in order; 2.5 models are restricted to previously-active projects,
# so newer projects fall through to the 3.x TTS model automatically.
MODELS = ["gemini-2.5-flash-preview-tts", "gemini-3.1-flash-tts-preview"]

# Candidate voices to audition. Pick your favourite(s) by ear.
TEST_VOICES = ["Kore", "Puck", "Charon", "Aoede"]

# Same sample as the edge-tts test: counting + the hard words.
TEXT = "एक, दुई, तीन, चार, पाँच। सत्ताइस। एक सय। तीन सय पचास।"
PROMPT = (
    "Read aloud in Nepali, exactly as written, with no extra words. "
    "Clear, warm tone, natural pace: " + TEXT
)

API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")


def load_dotenv():
    """Tiny .env loader (stdlib only): reads KEY=VALUE lines from repo-root .env
    into os.environ without overriding real env vars. Never committed (.gitignore)."""
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    path = os.path.join(root, ".env")
    if not os.path.exists(path):
        return
    try:
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k, v = k.strip(), v.strip().strip('"').strip("'")
                if k and k not in os.environ:
                    os.environ[k] = v
    except Exception:
        pass


load_dotenv()
API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")


def tts_pcm(text, voice):
    body = {
        "contents": [{"parts": [{"text": text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}},
        },
    }
    data = json.dumps(body).encode()
    last_err = None
    for model in MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        req = urllib.request.Request(
            url, data=data,
            headers={"x-goog-api-key": API_KEY, "Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                resp = json.loads(r.read())
            for part in resp["candidates"][0]["content"]["parts"]:
                if "inlineData" in part:
                    return base64.b64decode(part["inlineData"]["data"])
            raise RuntimeError("no audio in response")
        except Exception as e:  # try next model
            last_err = e
    raise RuntimeError(f"all models failed: {last_err}")


def pcm_to_mp3(pcm, out_path):
    # 24kHz 16-bit mono PCM -> trimmed MP3 (same finish as studio pack)
    p1 = subprocess.Popen(
        ["ffmpeg", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", "pipe:0",
         "-af", "silenceremove=start_periods=1:start_duration=0.01:start_threshold=-38dB:detection=peak,"
                "areverse,silenceremove=start_periods=1:start_duration=0.01:start_threshold=-38dB:detection=peak,areverse",
         "-b:a", "32k", out_path],
        stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    p1.communicate(pcm)


def main():
    if not API_KEY:
        sys.exit("Set GEMINI_API_KEY first: export GEMINI_API_KEY=\"your-key\" "
                 "(get one free at https://aistudio.google.com/apikey)")
    os.makedirs(OUT_DIR, exist_ok=True)
    for voice in TEST_VOICES:
        out = os.path.join(OUT_DIR, f"gemini_{voice.lower()}.mp3")
        if os.path.exists(out):
            print(f"exists, skipping: {out}")
            continue
        print(f"generating {voice}...")
        try:
            pcm_to_mp3(tts_pcm(PROMPT, voice), out)
            print(f"wrote: {out}")
        except Exception as e:
            print(f"FAILED {voice}: {e}", file=sys.stderr)
        time.sleep(2)  # stay well under rate limits
    print(f"\nDone. Listen in {OUT_DIR} and tell me your pick.")


if __name__ == "__main__":
    main()
