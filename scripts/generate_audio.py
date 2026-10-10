import asyncio
import os
import sys
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
    ('en', 'female'): 'en-US-AriaNeural',
    ('en', 'male'):   'en-US-GuyNeural',
    ('ne', 'female'): 'ne-NP-HemkalaNeural',
    ('ne', 'male'):   'ne-NP-SagarNeural'
}

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "audio"))

async def generate_file(text, voice, out_path, sem, retries=3):
    if os.path.exists(out_path) and os.path.getsize(out_path) > 500:
        return
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    async with sem:
        for attempt in range(retries):
            try:
                comm = edge_tts.Communicate(text, voice)
                await comm.save(out_path)
                if os.path.exists(out_path) and os.path.getsize(out_path) > 500:
                    return
            except Exception as e:
                if attempt == retries - 1:
                    print(f"Failed to generate {out_path}: {e}", file=sys.stderr)
                await asyncio.sleep(0.5 * (attempt + 1))

async def main():
    sem = asyncio.Semaphore(16)
    tasks = []

    print(f"Target directory: {BASE_DIR}")

    # Numbers 1 to 500
    for n in range(1, 501):
        # English
        for gender, voice in [('female', VOICES[('en', 'female')]), ('male', VOICES[('en', 'male')])]:
            p = os.path.join(BASE_DIR, 'en', gender, f"{n}.mp3")
            tasks.append(generate_file(str(n), voice, p, sem))

        # Nepali
        ne_text = get_ne_word(n)
        for gender, voice in [('female', VOICES[('ne', 'female')]), ('male', VOICES[('ne', 'male')])]:
            p = os.path.join(BASE_DIR, 'ne', gender, f"{n}.mp3")
            tasks.append(generate_file(ne_text, voice, p, sem))

    # Letters English
    for l in EN_LETTERS:
        for gender, voice in [('female', VOICES[('en', 'female')]), ('male', VOICES[('en', 'male')])]:
            p = os.path.join(BASE_DIR, 'en', gender, f"alpha_{l}.mp3")
            tasks.append(generate_file(l, voice, p, sem))

    # Letters Nepali
    for idx, l in enumerate(NE_LETTERS):
        for gender, voice in [('female', VOICES[('ne', 'female')]), ('male', VOICES[('ne', 'male')])]:
            p = os.path.join(BASE_DIR, 'ne', gender, f"alpha_{idx}.mp3")
            tasks.append(generate_file(l, voice, p, sem))

    total = len(tasks)
    print(f"Starting generation of {total} audio files with concurrency 16...")
    done = 0
    batch_size = 50
    for i in range(0, total, batch_size):
        batch = tasks[i:i + batch_size]
        await asyncio.gather(*batch)
        done += len(batch)
        print(f"Progress: {done}/{total} files ({(done/total*100):.1f}%)")

    print("All audio files generated successfully!")

if __name__ == '__main__':
    asyncio.run(main())
