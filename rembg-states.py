#!/usr/bin/env python3
"""Batch rembg for newly generated pet state PNGs."""
from rembg import remove
from PIL import Image
import os, glob

count = 0
for d in ['public/pets']:
    for f in sorted(glob.glob(os.path.join(d, '*.png'))):
        img = Image.open(f)
        if img.mode == 'RGBA':
            alpha = img.getchannel('A')
            extrema = alpha.getextrema()
            if extrema[0] == 255:  # Needs rembg
                pass
            else:
                continue  # Already transparent
        elif img.mode != 'RGBA':
            pass
        else:
            continue
        
        base = os.path.basename(f)
        print(f'  {base} ...', end=' ', flush=True)
        with open(f, 'rb') as fh:
            data = fh.read()
        out = remove(data)
        with open(f, 'wb') as fh:
            fh.write(out)
        sz = os.path.getsize(f)
        print(f'✅ {sz//1024}KB')
        count += 1

print(f'\nDone! Processed {count} files')
