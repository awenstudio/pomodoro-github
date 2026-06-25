/* ─────────────────────────────────────────────────────
 *  Shop — Buy items for your pet room.
 *
 *  Grid of items with category filter, rarity colors,
 *  purchase confirmation, and coin balance.
 * ───────────────────────────────────────────────────── */

import { useState, useEffect } from 'react';
import { getShopItems, buyItem, RARITY_COLORS, RARITY_GLOW, type ShopItem } from '@/lib/store';
import { cssIcon } from '@/lib/icons';

/* ── Category Tabs ─────────────────────────────────── */

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🏪' },
  { id: 'food', label: 'Food', icon: '🍖' },
  { id: 'furniture', label: 'Furn', icon: '🪑' },
  { id: 'toy', label: 'Toy', icon: '🧸' },
  { id: 'decoration', label: 'Decor', icon: '✨' },
  { id: 'special', label: 'Special', icon: '💎' },
] as const;

/* ── Item Detail Modal ─────────────────────────────── */

function ItemDetail({
  item,
  coins,
  level,
  onBuy,
  onClose,
}: {
  item: ShopItem;
  coins: number;
  level: number;
  onBuy: (id: string) => void;
  onClose: () => void;
}) {
  const canAfford = coins >= item.price;
  const unlocked = !item.unlockLevel || level >= item.unlockLevel;
  const borderColor = RARITY_COLORS[item.rarity];

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-4 w-[280px]"
        style={{
          background: 'linear-gradient(180deg, #3A3230 0%, #2E2A26 100%)',
          border: `1.5px solid ${borderColor}40`,
          boxShadow: `0 0 20px ${RARITY_GLOW[item.rarity]}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon + Name */}
        <div className="text-center mb-3">
          <div className="text-4xl mb-2">{item.icon}</div>
          <div className="text-cream-100 font-display font-bold text-sm">{item.name}</div>
          <div
            className="text-[10px] font-display uppercase tracking-wider mt-0.5"
            style={{ color: borderColor }}
          >
            {item.rarity}
          </div>
        </div>

        {/* Description */}
        <p className="text-cream-300/60 text-[11px] text-center mb-3">{item.description}</p>

        {/* Effects */}
        {item.effects && (
          <div className="flex flex-wrap gap-1.5 justify-center mb-3">
            {item.effects.hunger && (
              <span className="px-2 py-0.5 rounded-lg text-[10px]" style={{ background: 'rgba(255,158,74,0.1)', color: '#FF9E4A' }}>
                🍖 +{item.effects.hunger}
              </span>
            )}
            {item.effects.mood && (
              <span className="px-2 py-0.5 rounded-lg text-[10px]" style={{ background: 'rgba(90,175,94,0.1)', color: '#5AAF5E' }}>
                😊 +{item.effects.mood}
              </span>
            )}
            {item.effects.affinity && (
              <span className="px-2 py-0.5 rounded-lg text-[10px]" style={{ background: 'rgba(255,138,138,0.1)', color: '#FF8A8A' }}>
                ❤️ +{item.effects.affinity}
              </span>
            )}
            {item.effects.xp && (
              <span className="px-2 py-0.5 rounded-lg text-[10px]" style={{ background: 'rgba(255,217,122,0.1)', color: '#FFD97A' }}>
                ⚡ +{item.effects.xp} XP
              </span>
            )}
          </div>
        )}

        {/* Price + Buy */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-cream-200/50 text-[10px]">
            {unlocked ? '' : `🔒 Lv.${item.unlockLevel}`}
          </span>
          <button
            onClick={() => { if (canAfford && unlocked) onBuy(item.id); }}
            disabled={!canAfford || !unlocked}
            className="px-4 py-1.5 rounded-xl text-[11px] font-display font-bold transition-all duration-200"
            style={{
              background: canAfford && unlocked
                ? `linear-gradient(135deg, ${borderColor}80, ${borderColor})`
                : 'rgba(255,248,230,0.05)',
              color: canAfford && unlocked ? '#FFF8E6' : 'rgba(255,248,230,0.2)',
              cursor: canAfford && unlocked ? 'pointer' : 'not-allowed',
              boxShadow: canAfford && unlocked ? `0 2px 8px ${RARITY_GLOW[item.rarity]}` : 'none',
            }}
          >
            💰 {item.price}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Shop Component ───────────────────────────── */

interface ShopProps {
  coins: number;
  level: number;
  onBuy: (itemId: string, newBalance: number) => void;
}

export function Shop({ coins, level, onBuy }: ShopProps) {
  const [category, setCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [buyMessage, setBuyMessage] = useState<string | null>(null);

  const items = getShopItems(category);

  const handleBuy = async (itemId: string) => {
    const result = await buyItem(itemId, coins, level);
    if (result.success && result.newBalance !== undefined) {
      onBuy(itemId, result.newBalance);
      setBuyMessage(result.message);
      setSelectedItem(null);
      setTimeout(() => setBuyMessage(null), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-cream-100 font-display font-bold text-sm">🏪 Shop</span>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl"
          style={{ background: 'rgba(255,217,122,0.1)', border: '1px solid rgba(255,217,122,0.15)' }}
        >
          <span className="text-sm">💰</span>
          <span className="text-honey font-display font-bold text-sm tabular-nums">{coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 px-3 mb-2 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className="px-2.5 py-1 rounded-xl text-[10px] font-display font-medium whitespace-nowrap transition-all duration-200"
            style={{
              background: category === cat.id ? 'rgba(255,248,230,0.08)' : 'transparent',
              color: category === cat.id ? '#FFF8E6' : 'rgba(255,248,230,0.3)',
              border: category === cat.id ? '1px solid rgba(255,248,230,0.1)' : '1px solid transparent',
            }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Item Grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => {
            const borderColor = RARITY_COLORS[item.rarity];
            const canAfford = coins >= item.price;
            const unlocked = !item.unlockLevel || level >= item.unlockLevel;

            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all duration-200 relative"
                style={{
                  background: 'rgba(255,248,230,0.03)',
                  border: `1.5px solid ${borderColor}30`,
                  opacity: unlocked ? 1 : 0.4,
                }}
              >
                {/* Rarity dot */}
                <div
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: borderColor, boxShadow: `0 0 4px ${borderColor}` }}
                />

                <span className="text-xl">{item.icon}</span>
                <span className="text-[9px] text-cream-300/60 font-display truncate w-full text-center">
                  {item.name}
                </span>
                <span
                  className="text-[10px] font-display font-bold"
                  style={{ color: canAfford ? '#FFD97A' : '#E86868' }}
                >
                  {unlocked ? `💰 ${item.price}` : `🔒 Lv.${item.unlockLevel}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Buy Success Toast */}
      {buyMessage && (
        <div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-[11px] font-display"
          style={{
            background: 'linear-gradient(135deg, rgba(90,175,94,0.9), rgba(77,139,62,0.9))',
            color: '#FFF8E6',
            boxShadow: '0 4px 16px rgba(90,175,94,0.3)',
          }}
        >
          ✅ {buyMessage}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetail
          item={selectedItem}
          coins={coins}
          level={level}
          onBuy={handleBuy}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
