import argparse
import asyncio
import os
import sys
import subprocess
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
    ('en', 'female'): 'en-US-JennyNeural',   # Highly natural, warm American conversational voice
    ('en', 'male'):   'en-US-AndrewNeural',  # Highly natural, authentic American conversational voice
    ('ne', 'female'): 'ne-NP-HemkalaNeural',
    ('ne', 'male'):   'ne-NP-SagarNeural',
    ('pt', 'female'): 'pt-BR-FranciscaNeural',
    ('pt', 'male'):   'pt-BR-AntonioNeural',
}

LOCALE = {'en': 'en-US', 'ne': 'ne-NP', 'pt': 'pt-BR'}

# Prosody tuning for a more natural tone (rate, pitch).
# Nepali gets the strongest lift: the stock ne-NP delivery drones/moans at the
# default rate and low pitch; quicker + brighter fixes it.
PROSODY = {
    'en': ('+6%', '+3%'),
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

async def generate_file(text, lang, voice, out_path, sem, force, retries=3):
    if not force and os.path.exists(out_path) and os.path.getsize(out_path) > 500:
        return 'skipped'
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    temp_path = out_path + ".raw.mp3"
    async with sem:
        for attempt in range(retries):
            try:
                comm = edge_tts.Communicate(ssml(text, lang, voice), voice, proxy=PROXY)
                await comm.save(temp_path)
                if os.path.exists(temp_path) and os.path.getsize(temp_path) > 300:
                    trim_silence(temp_path, out_path)
                    return 'ok'
            except Exception as e:
                if attempt == retries - 1:
                    print(f"Failed to generate {out_path}: {e}", file=sys.stderr)
                await asyncio.sleep(0.4 * (attempt + 1))
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

    sem = asyncio.Semaphore(18)
    tasks = []

    print(f"Target directory: {BASE_DIR}")

    for lang in langs:
        # Numbers 1..max_n (pt uses digit strings; the pt-BR voice reads them natively)
        for n in range(1, max_n + 1):
            text = get_ne_word(n) if lang == 'ne' else str(n)
            for gender in ('female', 'male'):
                p = os.path.join(BASE_DIR, lang, gender, f"{n}.mp3")
                tasks.append(generate_file(text, lang, VOICES[(lang, gender)], p, sem, args.force))

        # Letters: en/pt use A-Z, ne uses the ka-kha set
        letters = EN_LETTERS if lang in ('en', 'pt') else NE_LETTERS
        for idx, l in enumerate(letters):
            fname = f"alpha_{l}.mp3" if lang in ('en', 'pt') else f"alpha_{idx}.mp3"
            for gender in ('female', 'male'):
                p = os.path.join(BASE_DIR, lang, gender, fname)
                tasks.append(generate_file(l, lang, VOICES[(lang, gender)], p, sem, args.force))

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
