"""
Nepali voice listening test for Suna.

Generates short comparison MP3s so you can HEAR the difference and pick
a winner. Run on your local machine (needs edge-tts + ffmpeg):

    python3 scripts/test_nepali_voices.py

Listen to the 6 files in ./nepali-voice-test/ and tell me which filename
sounds best, e.g. "hemkala_bright". I'll wire the winner into the pipeline.

Sample covers counting + the words where the old voice "moaned".
"""
import asyncio
import os
import xml.sax.saxutils as saxutils
import edge_tts

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "nepali-voice-test")

# Short sample: counting + moan-prone words
TEXT = "एक, दुई, तीन, चार, पाँच। सत्ताइस। एक सय। तीन सय पचास।"

VOICES = {
    "hemkala": "ne-NP-HemkalaNeural",
    "sagar": "ne-NP-SagarNeural",
}

# name -> (rate, pitch); None = plain, exactly like spellbee2026 did it
VARIANTS = {
    "plain": None,
    "bright": ("+12%", "+8%"),    # current Suna setting
    "crisp": ("+22%", "+12%"),    # extra fast + bright alternative
}

PROXY = os.environ.get("https_proxy") or os.environ.get("HTTPS_PROXY")


def payload(text, voice, variant):
    if VARIANTS[variant] is None:
        return text
    rate, pitch = VARIANTS[variant]
    safe = saxutils.escape(text)
    return (
        '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ne-NP">'
        f'<voice name="{voice}"><prosody rate="{rate}" pitch="{pitch}">{safe}</prosody></voice></speak>'
    )


async def make(name, voice, variant):
    out = os.path.join(OUT_DIR, f"{name}_{variant}.mp3")
    if os.path.exists(out):
        print(f"exists, skipping: {out}")
        return
    comm = edge_tts.Communicate(payload(TEXT, voice, variant), voice, proxy=PROXY)
    await comm.save(out)
    print(f"wrote: {out}")


async def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, voice in VOICES.items():
        for variant in VARIANTS:
            await make(name, voice, variant)
    print(f"\nDone. Listen to the files in {OUT_DIR} and pick your winner.")


if __name__ == "__main__":
    asyncio.run(main())
