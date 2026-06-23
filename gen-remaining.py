#!/usr/bin/env python3
"""Generate remaining pet art (cat/rabbit/fox + all animation frames)."""
import requests, time, os, io
from PIL import Image

STYLE = "flat 2D cartoon chibi illustration, thick warm brown outlines, big round head small body, simple clean style, warm tan and cream color palette, cute kawaii puppy, round eyes with sparkle, no shading, sticker style, white background, children book illustration"

SPECIES = {
    "cat": {
        "color": "orange tabby chibi cat",
        "states": {
            "from-box": f"cute chibi orange tabby cat peeking out of cardboard box, {STYLE}",
            "standing": f"cute chibi orange tabby cat standing, tail up, {STYLE}",
            "sitting": f"cute chibi orange tabby cat sitting, {STYLE}",
            "sleeping": f"cute chibi orange tabby cat curled up sleeping on pink cushion, zzz, {STYLE}",
            "ball": f"cute chibi orange tabby cat playing with yarn ball, {STYLE}",
            "drinking": f"cute chibi orange tabby cat drinking from blue bowl, {STYLE}",
            "eating": f"cute chibi orange tabby cat eating from red bowl, {STYLE}",
            "happy": f"cute chibi orange tabby cat happy with sparkles, {STYLE}",
            "angry": f"cute chibi orange tabby cat angry, {STYLE}",
            "sad": f"cute chibi orange tabby cat sad crying, {STYLE}",
            "thinking": f"cute chibi orange tabby cat thinking, question mark, {STYLE}",
        },
    },
    "rabbit": {
        "color": "white fluffy chibi bunny rabbit",
        "states": {
            "from-box": f"cute chibi white bunny rabbit peeking out of cardboard box, long ears, {STYLE}",
            "standing": f"cute chibi white bunny rabbit standing on hind legs, long ears, {STYLE}",
            "sitting": f"cute chibi white bunny rabbit sitting, long floppy ears, {STYLE}",
            "sleeping": f"cute chibi white bunny rabbit sleeping, zzz, long ears, {STYLE}",
            "eating": f"cute chibi white bunny rabbit eating carrot, {STYLE}",
            "happy": f"cute chibi white bunny rabbit happy with sparkles, {STYLE}",
            "sad": f"cute chibi white bunny rabbit sad, {STYLE}",
        },
    },
    "fox": {
        "color": "orange chibi fox with bushy tail",
        "states": {
            "from-box": f"cute chibi orange fox peeking out of cardboard box, bushy tail, {STYLE}",
            "standing": f"cute chibi orange fox standing, big bushy tail, {STYLE}",
            "sitting": f"cute chibi orange fox sitting, bushy tail curled, {STYLE}",
            "sleeping": f"cute chibi orange fox sleeping curled up, zzz, bushy tail, {STYLE}",
            "eating": f"cute chibi orange fox eating, {STYLE}",
            "happy": f"cute chibi orange fox happy with sparkles, bushy tail, {STYLE}",
            "sad": f"cute chibi orange fox sad, bushy tail down, {STYLE}",
        },
    },
}

def get_anim_prompts(sn, sc):
    return {
        "hatch-01": f"egg with cracks, {sc} inside, {STYLE}",
        "hatch-02": f"egg cracking open more, {sc} nose showing, {STYLE}",
        "hatch-03": f"broken egg shell, {sc} head popping out, {STYLE}",
        "hatch-04": f"split egg shell, {sc} half out, {STYLE}",
        "hatch-05": f"{sc} fully hatched from egg, happy sparkles, {STYLE}",
        "idle-01": f"{sc} sitting happily, {STYLE}",
        "idle-02": f"{sc} standing, tail wagging, {STYLE}",
        "idle-03": f"{sc} lying down relaxed, {STYLE}",
        "walk-01": f"{sc} walking right, side view, {STYLE}",
        "walk-02": f"{sc} walking left, side view, {STYLE}",
    }

tasks = []
for sp, d in SPECIES.items():
    for st, p in d["states"].items():
        tasks.append(("pet", sp, st, p))
    for st, p in get_anim_prompts(sp, d["color"]).items():
        tasks.append(("anim", sp, st, p))

total = len(tasks)
print(f"Remaining tasks: {total}", flush=True)
s = fail = 0
for i, (k, sp, st, p) in enumerate(tasks):
    out = f"public/pets/{sp}-{st}.png" if k == "pet" else f"public/animations/{sp}-{st}.png"
    if os.path.exists(out) and os.path.getsize(out) > 5000:
        continue
    seed = hash(f"{sp}-{st}") % 10000
    url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(p)}?width=256&height=256&seed={seed}&nologo=true&model=flux"
    try:
        r = requests.get(url, timeout=90)
        if r.status_code == 200 and len(r.content) > 3000:
            img = Image.open(io.BytesIO(r.content)).convert("RGBA")
            img = img.resize((256, 256), Image.LANCZOS)
            img.save(out, "PNG")
            s += 1
            print(f"[{i+1}/{total}] {sp}-{st} ✅", flush=True)
        else:
            fail += 1
            print(f"[{i+1}/{total}] {sp}-{st} ❌ {r.status_code}", flush=True)
    except Exception as e:
        fail += 1
        print(f"[{i+1}/{total}] {sp}-{st} ❌ {e}", flush=True)
    time.sleep(0.3)
print(f"\n🎉 Done! New={s} Failed={fail} Total={total}", flush=True)
