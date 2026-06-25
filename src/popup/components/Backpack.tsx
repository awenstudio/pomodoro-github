/* ─────────────────────────────────────────────────────
 *  Backpack — View and use owned items.
 *
 *  Grid of inventory items with quantity badges,
 *  use buttons, and slot expansion.
 * ───────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react';
import { getInventory, useItem, expandInventory, getShopItem, RARITY_COLORS, type InventoryItem } from '@/lib/store';

/* ── Main Backpack Component ───────────────────────── */

interface BackpackProps {
  onUseFood: () => void;
  onUseToy: () => void;
}

export function Backpack({ onUseFood, onUseToy }: BackpackProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [maxSlots, setMaxSlots] = useState(20);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    const inv = await getInventory();
    setInventory(inv.items);
    setMaxSlots(inv.maxSlots);
  }, []);

  useEffect(() => { loadInventory(); }, [loadInventory]);

  const handleUse = async (itemId: string) => {
    const result = await useItem(itemId);
    if (result.success) {
      setMessage(result.message);
      const item = getShopItem(itemId);
      if (item?.category === 'food') onUseFood();
      else if (item?.category === 'toy') onUseToy();
      await loadInventory();
    } else {
      setMessage(result.message);
    }
    setSelectedItem(null);
    setTimeout(() => setMessage(null), 2000);
  };

  const handleExpand = async () => {
    const result = await expandInventory();
    setMessage(`+5 slots! Cost: ${result.cost} coins`);
    setMaxSlots(result.newMax);
    setTimeout(() => setMessage(null), 2000);
  };

  const emptySlots = maxSlots - inventory.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-cream-100 font-display font-bold text-sm">🎒 Backpack</span>
        <span className="text-cream-300/50 text-[10px] font-display">
          {inventory.length}/{maxSlots} slots
        </span>
      </div>

      {/* Slot expansion button */}
      <div className="px-3 mb-2">
        <button
          onClick={handleExpand}
          className="w-full py-1.5 rounded-xl text-[10px] font-display transition-all duration-200"
          style={{
            background: 'rgba(255,248,230,0.03)',
            border: '1px dashed rgba(255,248,230,0.1)',
            color: 'rgba(255,248,230,0.3)',
          }}
        >
          + Expand Slots (5)
        </button>
      </div>

      {/* Item Grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        <div className="grid grid-cols-3 gap-2">
          {/* Owned items */}
          {inventory.map((invItem) => {
            const shopItem = getShopItem(invItem.itemId);
            if (!shopItem) return null;
            const borderColor = RARITY_COLORS[shopItem.rarity];
            const isSelected = selectedItem === invItem.itemId;

            return (
              <button
                key={invItem.itemId}
                onClick={() => setSelectedItem(isSelected ? null : invItem.itemId)}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all duration-200 relative"
                style={{
                  background: isSelected ? 'rgba(255,248,230,0.06)' : 'rgba(255,248,230,0.03)',
                  border: `1.5px solid ${isSelected ? borderColor : `${borderColor}30`}`,
                  boxShadow: isSelected ? `0 0 12px ${borderColor}20` : 'none',
                }}
              >
                {/* Quantity badge */}
                <div
                  className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-display font-bold"
                  style={{
                    background: `${borderColor}40`,
                    color: '#FFF8E6',
                  }}
                >
                  ×{invItem.quantity}
                </div>

                <span className="text-xl">{shopItem.icon}</span>
                <span className="text-[9px] text-cream-300/60 font-display truncate w-full text-center">
                  {shopItem.name}
                </span>
              </button>
            );
          })}

          {/* Empty slots */}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center justify-center p-2.5 rounded-xl"
              style={{
                border: '1px dashed rgba(255,248,230,0.06)',
                minHeight: 64,
              }}
            >
              <span className="text-cream-400/10 text-[10px]">+</span>
            </div>
          ))}
        </div>
      </div>

      {/* Use Button (appears when item selected) */}
      {selectedItem && (
        <div className="px-3 pb-2">
          <button
            onClick={() => handleUse(selectedItem)}
            className="w-full py-2 rounded-xl text-[11px] font-display font-bold transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, rgba(90,175,94,0.8), rgba(77,139,62,0.8))',
              color: '#FFF8E6',
              boxShadow: '0 2px 8px rgba(90,175,94,0.2)',
            }}
          >
            Use {getShopItem(selectedItem)?.name}
          </button>
        </div>
      )}

      {/* Toast */}
      {message && (
        <div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-[11px] font-display"
          style={{
            background: 'linear-gradient(135deg, rgba(90,175,94,0.9), rgba(77,139,62,0.9))',
            color: '#FFF8E6',
            boxShadow: '0 4px 16px rgba(90,175,94,0.3)',
          }}
        >
          ✅ {message}
        </div>
      )}
    </div>
  );
}
