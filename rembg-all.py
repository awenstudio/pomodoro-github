#!/usr/bin/env python3
"""Batch background removal for all pet/animation PNGs using rembg."""
import os, sys, glob

def main():
    dirs = ['public/pets', 'public/animations']
    files = []
    for d in dirs:
        for f in sorted(glob.glob(os.path.join(d, '*.png'))):
            files.append(f)
    
    if not files:
        print("No PNG files found.")
        return
    
    print(f"Found {len(files)} PNG files to process")
    
    from rembg import remove
    from PIL import Image
    import io
    
    done = 0
    for fpath in files:
        base = os.path.basename(fpath)
        print(f"  {base} ... ", end='', flush=True)
        try:
            with open(fpath, 'rb') as f:
                data = f.read()
            out = remove(data)
            with open(fpath, 'wb') as f:
                f.write(out)
            sz = os.path.getsize(fpath)
            print(f"✅ {sz//1024}KB")
            done += 1
        except Exception as e:
            print(f"❌ {e}")
    
    print(f"\nDone! Processed {done}/{len(files)} files")

if __name__ == '__main__':
    main()
