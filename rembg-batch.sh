#!/bin/bash
# Batch remove background from all pet PNGs using rembg
# Usage: bash rembg-batch.sh

set -e

echo "=== Rembg Batch Background Removal ==="

# Process pets/ directory
echo ""
echo "--- Processing public/pets/ ---"
for f in public/pets/*.png; do
    [ -f "$f" ] || continue
    base=$(basename "$f" .png)
    tmpfile="${f}.tmp.png"
    
    echo -n "  $base ... "
    python3 -c "
from rembg import remove
from PIL import Image
import sys

input_path = '$f'
output_path = '$tmpfile'

with open(input_path, 'rb') as f:
    input_data = f.read()

output_data = remove(input_data)

with open(output_path, 'wb') as f:
    f.write(output_data)
" 2>/dev/null
    
    mv "$tmpfile" "$f"
    size=$(wc -c < "$f" | tr -d ' ')
    echo "✅ ${size} bytes"
done

# Process animations/ directory
echo ""
echo "--- Processing public/animations/ ---"
for f in public/animations/*.png; do
    [ -f "$f" ] || continue
    base=$(basename "$f" .png)
    tmpfile="${f}.tmp.png"
    
    echo -n "  $base ... "
    python3 -c "
from rembg import remove
from PIL import Image
import sys

input_path = '$f'
output_path = '$tmpfile'

with open(input_path, 'rb') as f:
    input_data = f.read()

output_data = remove(input_data)

with open(output_path, 'wb') as f:
    f.write(output_data)
" 2>/dev/null
    
    mv "$tmpfile" "$f"
    size=$(wc -c < "$f" | tr -d ' ')
    echo "✅ ${size} bytes"
done

echo ""
echo "🎉 Background removal complete!"
echo "Total files processed:"
ls public/pets/*.png 2>/dev/null | wc -l | tr -d ' '
echo " pet portraits"
ls public/animations/*.png 2>/dev/null | wc -l | tr -d ' '
echo " animation frames"
