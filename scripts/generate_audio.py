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
GEMINI_MODELS = ["gemini-2.5-flash-preview-tts", "gemini-3.1-flash-tts-preview", "gemini-3.8-flash-tts", "gemini-3.8-flash-lite-tts"]
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
    body = {
        "contents": [{"parts": [{"text": text}]}],
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
            with urllib.request.urlopen(req, timeout=20) as r:
                resp = json.loads(r.read())
            for part in resp["candidates"][0]["content"]["parts"]:
                if "inlineData" in part:
                    return base64.b64decode(part["inlineData"]["data"])
            raise RuntimeError("no audio in response")
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="replace")
            last_err = f"{model} HTTP {e.code}: {err_body}"
        except Exception as e:
            last_err = f"{model} error: {e}"
    raise RuntimeError(f"Gemini TTS failed: {last_err}")


def strip_eos_artifact(raw_bytes, sr=24000):
    """Removes neural audio codec EOS burst artifact (high-frequency buzz at end of stream)."""
    import numpy as np
    samples = np.frombuffer(raw_bytes, dtype=np.int16).astype(np.float32)
    total_len = len(samples)
    if total_len == 0:
        return raw_bytes

    win = int(0.01 * sr)
    hop = int(0.005 * sr)
    rms = []
    times = []
    for i in range(0, total_len - win, hop):
        w = samples[i:i+win]
        r = np.sqrt(np.mean(w**2))
        rms.append(r)
        times.append(i)

    rms = np.array(rms)
    speech_mask = rms > 350
    if not np.any(speech_mask):
        return raw_bytes

    speech_indices = np.where(speech_mask)[0]
    bursts = []
    cur_burst = [speech_indices[0]]
    for idx in speech_indices[1:]:
        if idx - cur_burst[-1] <= 24:  # gap <= 120ms belongs to same phrase
            cur_burst.append(idx)
        else:
            bursts.append(cur_burst)
            cur_burst = [idx]
    bursts.append(cur_burst)

    # Check if the final burst is an isolated end-of-stream artifact
    if len(bursts) > 1:
        last_b = bursts[-1]
        prev_b = bursts[-2]
        gap_samples = times[last_b[0]] - times[prev_b[-1]]
        last_samples = samples[times[last_b[0]]:times[last_b[-1]]]
        dur_ms = len(last_samples) / sr * 1000
        gap_ms = gap_samples / sr * 1000

        fft = np.abs(np.fft.rfft(last_samples))
        freqs = np.fft.rfftfreq(len(last_samples), 1/sr)
        dom_freq = freqs[np.argmax(fft)] if len(fft) > 0 else 0

        if (dur_ms < 150 and gap_ms > 70 and dom_freq > 1300) or (dur_ms < 100 and gap_ms > 120):
            bursts = bursts[:-1]

    start_sample = max(0, times[bursts[0][0]] - int(0.035 * sr))
    end_sample = min(total_len, times[bursts[-1][-1]] + int(0.040 * sr))

    out_samples = samples[start_sample:end_sample].copy()
    fade_len = int(0.02 * sr)
    if len(out_samples) > 2 * fade_len:
        out_samples[:fade_len] *= np.linspace(0, 1, fade_len)
        out_samples[-fade_len:] *= np.linspace(1, 0, fade_len)

    return out_samples.astype(np.int16).tobytes()


def pcm_to_mp3(pcm_bytes, out_path, bitrate="128k"):
    """24kHz 16-bit mono PCM -> studio MP3."""
    p = subprocess.Popen(
        ["ffmpeg", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", "pipe:0",
         "-b:a", bitrate, out_path],
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
        "-b:a", "128k", final_path
    ]
    res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if res.returncode != 0 or not os.path.exists(final_path) or os.path.getsize(final_path) == 0:
        os.replace(raw_path, final_path)
    else:
        if os.path.exists(raw_path):
            os.remove(raw_path)


async def generate_file(text, lang, gender, out_path, sem, force, engine='auto', retries=3):
    if not force and os.path.exists(out_path) and os.path.getsize(out_path) > 500:
        return 'skipped'
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    temp_path = out_path + ".raw.mp3"
    use_gemini = (engine == 'gemini') or (engine == 'auto' and lang in GEMINI_LANGS)
    gate = GEM_SEM if use_gemini else sem
    async with gate:
        for attempt in range(retries):
            try:
                if use_gemini:
                    gvoice = GEMINI_VOICES[(lang, gender)]
                    pcm = await asyncio.to_thread(gemini_pcm, text, lang, gvoice)
                    clean_pcm = strip_eos_artifact(pcm)
                    await asyncio.to_thread(pcm_to_mp3, clean_pcm, out_path, "128k")
                    if os.path.exists(out_path) and os.path.getsize(out_path) > 300:
                        print(f"Generated {lang}/{gender}: {os.path.basename(out_path)} ({text})", flush=True)
                        await asyncio.sleep(1.5)  # gentle pacing to avoid RPM limit
                        return 'ok'
                else:
                    voice = VOICES[(lang, gender)]
                    comm = edge_tts.Communicate(text, voice, proxy=PROXY)
                    await comm.save(temp_path)
                    if os.path.exists(temp_path) and os.path.getsize(temp_path) > 300:
                        trim_silence(temp_path, out_path)
                        return 'ok'
            except Exception as e:
                err_str = str(e)
                if "GenerateRequestsPerDay" in err_str:
                    print(f"\n[FATAL] Google Gemini daily free-tier quota exhausted (10 req/day).", file=sys.stderr)
                    print(f"Details: {err_str}", file=sys.stderr)
                    sys.exit(1)
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
    parser.add_argument('--genders', default='female,male', help='comma-separated: female,male')
    parser.add_argument('--limit', type=int, default=0, help='only first N numbers (0 = all 500)')
    parser.add_argument('--engine', choices=['auto', 'edge-tts', 'gemini'], default='auto', help='TTS engine')
    args = parser.parse_args()

    langs = [l.strip() for l in args.langs.split(',') if l.strip() in ('en', 'ne', 'pt')]
    genders = [g.strip() for g in args.genders.split(',') if g.strip() in ('female', 'male')]
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
            for gender in genders:
                p = os.path.join(BASE_DIR, lang, gender, f"{n}.mp3")
                tasks.append(generate_file(text, lang, gender, p, sem, args.force, args.engine))

        # Letters: en/pt use A-Z, ne uses the ka-kha set
        letters = EN_LETTERS if lang in ('en', 'pt') else NE_LETTERS
        if args.limit > 0:
            letters = letters[:args.limit]
        for idx, l in enumerate(letters):
            fname = f"alpha_{l}.mp3" if lang in ('en', 'pt') else f"alpha_{idx}.mp3"
            for gender in genders:
                p = os.path.join(BASE_DIR, lang, gender, fname)
                tasks.append(generate_file(l, lang, gender, p, sem, args.force, args.engine))

    total = len(tasks)
    print(f"Starting generation of {total} trimmed natural audio files (langs={','.join(langs)}, force={args.force})...")
    done = 0
    batch_size = 10
    for i in range(0, total, batch_size):
        batch = tasks[i:i + batch_size]
        await asyncio.gather(*batch)
        done += len(batch)
        print(f"Progress: {done}/{total} files ({(done/total*100):.1f}%)", flush=True)

    print("All audio files updated with natural voices and trimmed silence!")

if __name__ == '__main__':
    asyncio.run(main())
