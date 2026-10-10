import argparse
import asyncio
import base64
import json
import os
import sys
import subprocess
import time
import urllib.request
import xml.sax.saxutils as saxutils
import edge_tts

NE_WORDS_0_100 = [
    "शून्य","एक","दुई","तीन","चार","पाँच","छ","सात","आठ","नौ","दस",
    "एघार","बाह्र","तेह्र","चौध","पन्ध्र","सोह्र","सत्र","अठार","उन्नाइस","बीस",
    "एक्काइस","बाइस","तेइस","चौबिस","पच्चिस","छब्बीस","सत्ताइस","अट्ठाइस","उनन्तिस","तीस",
    "एकत्तिस","बत्तीस","तेत्तीस","चौँतीस","पैँतीस","छत्तीस","सैँतीस","अड्तीस","उनन्चालीस","चालीस",
    "एकचालीस","बयालीस","त्रिचालीस","चवालीस","पैँतालीस","छयालीस","सतचालीस","अठचालीस","उनन्पचास","पचास",
    "एकाउन्न","बाउन्न","त्रिपन्न","चउन्न","पचपन्न","छप्पन्न","सन्ताउन्न","अन्ठाउन्न","उनन्साठ्ठी","साठ्ठी",
    "एकसट्ठी","बाइसट्ठी","त्रिसट्ठी","चौँसट्ठी","पैँसट्ठी","छयसट्ठी","सडसट्ठी","अडसट्ठी","उनन्सत्तरी","सत्तरी",
    "एकहत्तर","बहत्तर","त्रिहत्तर","चौहत्तर","पचहत्तर","छयहत्तर","सतहत्तर","अठहत्तर","उननासी","असी",
    "एकासी","बयासी","त्रियासी","चौरासी","पचासी","छयासी","सतासी","अठासी","उनन्नब्बे","नब्बे",
    "एकानब्बे","बयानब्बे","त्रियानब्बे","चौरानब्बे","पन्चानब्बे","छयानब्बे","सन्तानब्बे","अन्ठानब्बे","उनान्सय","एक सय"
]

HUNDREDS = {
    1: "एक सय",
    2: "दुई सय",
    3: "तीन सय",
    4: "चार सय",
    5: "पाँच सय"
}

def get_ne_word(n):
    if n <= 100:
        return NE_WORDS_0_100[n]
    h = n // 100
    rem = n % 100
    if rem == 0:
        return HUNDREDS[h]
    return f"{HUNDREDS[h]} {NE_WORDS_0_100[rem]}"

EN_LETTERS = [chr(c) for c in range(ord('A'), ord('Z') + 1)]
NE_LETTERS = ['क','ख','ग','घ','ङ','च','छ','ज','झ','ञ','ट','ठ','ड','ढ','ण','त','थ','द','ध','न','प','फ','ब','भ','म','य','र','ल','व','श','ष','स','ह','क्ष','त्र','ज्ञ']

VOICES = {
    ('en', 'female'): 'en-GB-SoniaNeural',   # Clear British enunciation (matches spellbee2026 quality)
    ('en', 'male'):   'en-GB-RyanNeural',    # British male counterpart
    # ne/pt use Gemini TTS (see GEMINI_VOICES) — edge-tts entries kept as fallback
    ('ne', 'female'): 'ne-NP-HemkalaNeural',
    ('ne', 'male'):   'ne-NP-SagarNeural',
    ('pt', 'female'): 'pt-BR-FranciscaNeural',
    ('pt', 'male'):   'pt-BR-AntonioNeural',
}

# Gemini TTS (free API tier) for Nepali + Portuguese — user-auditioned 2026-10-10,
# all four test voices approved. Kore->female, Puck->male (Aoede/Charon are
# tested-good one-line swaps).
GEMINI_LANGS = ('ne', 'pt')
GEMINI_VOICES = {
    ('ne', 'female'): 'Kore',
    ('ne', 'male'):   'Puck',
    ('pt', 'female'): 'Kore',
    ('pt', 'male'):   'Puck',
}
GEMINI_LANG_NAME = {'ne': 'Nepali', 'pt': 'Brazilian Portuguese'}
# 2.5 models are restricted to previously-active projects; newer projects fall
# through to the 3.x TTS model automatically.
GEMINI_MODELS = ["gemini-2.5-flash-preview-tts", "gemini-3.1-flash-tts-preview"]
GEM_SEM = None  # set in main()

LOCALE = {'en': 'en-US', 'ne': 'ne-NP', 'pt': 'pt-BR'}

# Prosody tuning for a more natural tone (rate, pitch).
# Nepali gets the strongest lift: the stock ne-NP delivery drones/moans at the
# default rate and low pitch; quicker + brighter fixes it.
# English stays at +0%: en-GB-SoniaNeural is used plain, exactly as in
# spellbee2026 (the reference quality the user prefers).
PROSODY = {
    'en': ('+0%', '+0%'),
    'ne': ('+12%', '+8%'),
    'pt': ('+6%', '+4%'),
}

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "audio"))

# Egress proxy (VM); edge-tts only uses it when passed explicitly.
PROXY = os.environ.get("https_proxy") or os.environ.get("HTTPS_PROXY")


def ssml(text, lang, voice):
    rate, pitch = PROSODY[lang]
    safe = saxutils.escape(text)
    return (
        f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="{LOCALE[lang]}">'
        f'<voice name="{voice}"><prosody rate="{rate}" pitch="{pitch}">{safe}</prosody></voice></speak>'
    )


def load_dotenv():
    """Tiny .env loader (stdlib only). Never committed (.gitignore)."""
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
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")


def gemini_pcm(text, lang, voice):
    """Blocking: synthesize via Gemini TTS, return raw 24kHz 16-bit mono PCM bytes."""
    prompt = (
        f"Read aloud in {GEMINI_LANG_NAME[lang]}, exactly as written, "
        f"with no extra words. Clear, warm tone, natural pace: {text}"
    )
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}},
        },
    }
    data = json.dumps(body).encode()
    last_err = None
    for model in GEMINI_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        req = urllib.request.Request(
            url, data=data,
            headers={"x-goog-api-key": GEMINI_API_KEY, "Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                resp = json.loads(r.read())
            for part in resp["candidates"][0]["content"]["parts"]:
                if "inlineData" in part:
                    return base64.b64decode(part["inlineData"]["data"])
            raise RuntimeError("no audio in response")
        except Exception as e:
            last_err = e
    raise RuntimeError(f"Gemini TTS failed: {last_err}")


def pcm_to_mp3(pcm_bytes, out_path):
    """24kHz 16-bit mono PCM -> MP3 (untrimmed; trim_silence runs after)."""
    p = subprocess.Popen(
        ["ffmpeg", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", "pipe:0",
         "-b:a", "32k", out_path],
        stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    p.communicate(pcm_bytes)
    if p.returncode != 0 or not os.path.exists(out_path) or os.path.getsize(out_path) == 0:
        raise RuntimeError("ffmpeg PCM->MP3 failed")


def trim_silence(raw_path, final_path):
    # Trims silence from start and end so gap timers work accurately with zero dead air
    cmd = [
        "ffmpeg", "-y", "-i", raw_path,
        "-af", "silenceremove=start_periods=1:start_duration=0.01:start_threshold=-38dB:detection=peak,areverse,silenceremove=start_periods=1:start_duration=0.01:start_threshold=-38dB:detection=peak,areverse",
        "-b:a", "32k", final_path
    ]
    res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if res.returncode != 0 or not os.path.exists(final_path) or os.path.getsize(final_path) == 0:
        # Fallback to copy if trim filter fails
        os.replace(raw_path, final_path)
    else:
        if os.path.exists(raw_path):
            os.remove(raw_path)

async def generate_file(text, lang, gender, out_path, sem, force, retries=3):
    if not force and os.path.exists(out_path) and os.path.getsize(out_path) > 500:
        return 'skipped'
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    temp_path = out_path + ".raw.mp3"
    use_gemini = lang in GEMINI_LANGS
    gate = GEM_SEM if use_gemini else sem
    async with gate:
        for attempt in range(retries):
            try:
                if use_gemini:
                    gvoice = GEMINI_VOICES[(lang, gender)]
                    pcm = await asyncio.to_thread(gemini_pcm, text, lang, gvoice)
                    await asyncio.to_thread(pcm_to_mp3, pcm, temp_path)
                else:
                    voice = VOICES[(lang, gender)]
                    comm = edge_tts.Communicate(text, voice, proxy=PROXY)
                    await comm.save(temp_path)
                if os.path.exists(temp_path) and os.path.getsize(temp_path) > 300:
                    trim_silence(temp_path, out_path)
                    return 'ok'
            except Exception as e:
                if attempt == retries - 1:
                    print(f"Failed to generate {out_path}: {e}", file=sys.stderr)
                # Gemini rate limits need longer backoff (15s) than edge-tts
                await asyncio.sleep((15 if use_gemini else 0.4) * (attempt + 1))
            finally:
                if os.path.exists(temp_path):
                    try: os.remove(temp_path)
                    except: pass
    return 'failed'

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--force', action='store_true', help='regenerate existing files')
    parser.add_argument('--langs', default='en,ne,pt', help='comma-separated: en,ne,pt')
    parser.add_argument('--limit', type=int, default=0, help='only first N numbers (0 = all 500)')
    args = parser.parse_args()

    langs = [l.strip() for l in args.langs.split(',') if l.strip() in ('en', 'ne', 'pt')]
    max_n = args.limit if args.limit > 0 else 500

    global GEM_SEM
    GEM_SEM = asyncio.Semaphore(1)  # Gemini rate limits are strict; serialize requests
    sem = asyncio.Semaphore(18)
    tasks = []

    if any(l in GEMINI_LANGS for l in langs) and not GEMINI_API_KEY:
        sys.exit("Gemini TTS needs an API key: export GEMINI_API_KEY=... (free at "
                 "https://aistudio.google.com/apikey) or add it to your local .env")

    engines = ", ".join(f"{l}={'gemini' if l in GEMINI_LANGS else 'edge-tts'}" for l in langs)
    print(f"Target directory: {BASE_DIR} | engines: {engines}")

    for lang in langs:
        # Numbers 1..max_n (pt uses digit strings; the voice reads them natively)
        for n in range(1, max_n + 1):
            text = get_ne_word(n) if lang == 'ne' else str(n)
            for gender in ('female', 'male'):
                p = os.path.join(BASE_DIR, lang, gender, f"{n}.mp3")
                tasks.append(generate_file(text, lang, gender, p, sem, args.force))

        # Letters: en/pt use A-Z, ne uses the ka-kha set
        letters = EN_LETTERS if lang in ('en', 'pt') else NE_LETTERS
        if args.limit > 0:
            letters = letters[:args.limit]
        for idx, l in enumerate(letters):
            fname = f"alpha_{l}.mp3" if lang in ('en', 'pt') else f"alpha_{idx}.mp3"
            for gender in ('female', 'male'):
                p = os.path.join(BASE_DIR, lang, gender, fname)
                tasks.append(generate_file(l, lang, gender, p, sem, args.force))

    total = len(tasks)
    print(f"Starting generation of {total} trimmed natural audio files (langs={','.join(langs)}, force={args.force})...")
    done = 0
    batch_size = 60
    for i in range(0, total, batch_size):
        batch = tasks[i:i + batch_size]
        await asyncio.gather(*batch)
        done += len(batch)
        print(f"Progress: {done}/{total} files ({(done/total*100):.1f}%)", flush=True)

    print("All audio files updated with natural voices and trimmed silence!")

if __name__ == '__main__':
    asyncio.run(main())
