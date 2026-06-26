/* ─────────────────────────────────────────────────────
 *  Store & Inventory — Shop system with 24 items.
 *
 *  Categories: Food(6), Furniture(6), Toy(4), Decoration(4), Special(4)
 *  Coins earned: 10 base × level multiplier per pomodoro.
 * ───────────────────────────────────────────────────── */



/* ── Types ─────────────────────────────────────────── */

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: 'food' | 'furniture' | 'toy' | 'decoration' | 'special';
  price: number;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  effects?: { mood?: number; hunger?: number; affinity?: number; xp?: number };
  unlockLevel?: number;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
  purchasedAt: number;
}

export interface Inventory {
  items: InventoryItem[];
  maxSlots: number;
}

/* ── Rarity Colors ─────────────────────────────────── */

export const RARITY_COLORS: Record<string, string> = {
  common: '#B8A88C',
  uncommon: '#5AAF5E',
  rare: '#7BA8D1',
  epic: '#C4A4F7',
  legendary: '#FFD97A',
};

export const RARITY_GLOW: Record<string, string> = {
  common: 'rgba(184,168,140,0.2)',
  uncommon: 'rgba(90,175,94,0.2)',
  rare: 'rgba(123,168,209,0.2)',
  epic: 'rgba(196,164,247,0.3)',
  legendary: 'rgba(255,217,122,0.4)',
};

/* ── Shop Items (24) ───────────────────────────────── */

export const SHOP_ITEMS: ShopItem[] = [
  // ── Food (6) ──
  { id: 'kibble', name: 'Kibble', description: 'Basic pet food. Keeps hunger at bay.', category: 'food', price: 10, icon: '🦴', rarity: 'common', effects: { hunger: 20 } },
  { id: 'treat', name: 'Treat', description: 'A yummy snack your pet loves.', category: 'food', price: 20, icon: '🍪', rarity: 'common', effects: { hunger: 15, mood: 5 } },
  { id: 'steak', name: 'Steak', description: 'Premium cut of meat. Very filling!', category: 'food', price: 50, icon: '🥩', rarity: 'uncommon', effects: { hunger: 40, mood: 10 } },
  { id: 'sushi', name: 'Sushi', description: 'Fancy Japanese delicacy.', category: 'food', price: 80, icon: '🍣', rarity: 'rare', effects: { hunger: 35, mood: 20, affinity: 5 } },
  { id: 'cake', name: 'Cake', description: 'Celebration cake! Extra sweet.', category: 'food', price: 100, icon: '🎂', rarity: 'epic', effects: { hunger: 25, mood: 30, xp: 50 } },
  { id: 'golden_apple', name: 'Golden Apple', description: 'Legendary fruit of vitality.', category: 'food', price: 200, icon: '🍎', rarity: 'legendary', effects: { hunger: 50, mood: 50, affinity: 20, xp: 100 } },

  // ── Furniture (6) ──
  { id: 'cushion', name: 'Cushion', description: 'A comfy spot to sit.', category: 'furniture', price: 30, icon: '🟫', rarity: 'common' },
  { id: 'lamp', name: 'Warm Lamp', description: 'Cozy ambient lighting.', category: 'furniture', price: 60, icon: '💡', rarity: 'common' },
  { id: 'plant_pot', name: 'Potted Plant', description: 'Adds green vibes to the room.', category: 'furniture', price: 40, icon: '🌿', rarity: 'common' },
  { id: 'fish_tank', name: 'Fish Tank', description: 'Mesmerizing underwater world.', category: 'furniture', price: 120, icon: '🐠', rarity: 'uncommon' },
  { id: 'piano', name: 'Mini Piano', description: 'Musical talent unlocked!', category: 'furniture', price: 200, icon: '🎹', rarity: 'rare' },
  { id: 'telescope', name: 'Telescope', description: 'Gaze at the stars together.', category: 'furniture', price: 300, icon: '🔭', rarity: 'epic', unlockLevel: 10 },

  // ── Toys (4) ──
  { id: 'ball', name: 'Ball', description: 'Bouncy fun for hours!', category: 'toy', price: 15, icon: '⚽', rarity: 'common', effects: { mood: 10 } },
  { id: 'yarn', name: 'Yarn Ball', description: 'Irresistible for cats.', category: 'toy', price: 25, icon: '🧶', rarity: 'common', effects: { mood: 15 } },
  { id: 'frisbee', name: 'Frisbee', description: 'Outdoor fun in the sun.', category: 'toy', price: 40, icon: '🥏', rarity: 'uncommon', effects: { mood: 20, affinity: 5 } },
  { id: 'puzzle', name: 'Puzzle', description: 'Brain teaser for smart pets.', category: 'toy', price: 60, icon: '🧩', rarity: 'rare', effects: { mood: 15, xp: 30 } },

  // ── Decorations (4) ──
  { id: 'poster', name: 'Poster', description: 'Wall art for your room.', category: 'decoration', price: 20, icon: '🖼️', rarity: 'common' },
  { id: 'fairy_lights', name: 'Fairy Lights', description: 'Sparkly ambiance.', category: 'decoration', price: 50, icon: '✨', rarity: 'uncommon' },
  { id: 'banner', name: 'Achievement Banner', description: 'Show off your progress!', category: 'decoration', price: 100, icon: '🏆', rarity: 'rare' },
  { id: 'crown', name: 'Royal Crown', description: 'For the worthy pet.', category: 'decoration', price: 500, icon: '👑', rarity: 'legendary', unlockLevel: 15 },

  // ── Special (4) ──
  { id: 'xp_boost', name: 'XP Boost', description: '+50 XP instantly.', category: 'special', price: 80, icon: '⚡', rarity: 'rare', effects: { xp: 50 } },
  { id: 'mood_crystal', name: 'Mood Crystal', description: 'Max mood instantly.', category: 'special', price: 150, icon: '💎', rarity: 'epic', effects: { mood: 100 } },
  { id: 'love_letter', name: 'Love Letter', description: '+30 affinity with your pet.', category: 'special', price: 120, icon: '💌', rarity: 'rare', effects: { affinity: 30 } },
  { id: 'star_fragment', name: 'Star Fragment', description: 'Legendary boost to everything.', category: 'special', price: 300, icon: '🌟', rarity: 'legendary', effects: { mood: 40, hunger: 40, affinity: 15, xp: 80 } },
];

/* ── Shop Functions ────────────────────────────────── */

/** Get items, optionally filtered by category. */
export function getShopItems(category?: string): ShopItem[] {
  if (!category || category === 'all') return SHOP_ITEMS;
  return SHOP_ITEMS.filter((i) => i.category === category);
}

/** Get a single item by ID. */
export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}

/** Calculate coins earned for completing a pomodoro. */
export function calculateCoins(level: number, streak: number): number {
  const base = 10;
  const levelMult = 1 + (level - 1) * 0.05; // +5% per level
  const streakMult = 1 + Math.min(streak, 10) * 0.03; // +3% per streak day, max 30%
  return Math.round(base * levelMult * streakMult);
}

const COINS_KEY = 'pawodoro_coins';

/** Load coins from storage. */
export async function loadCoins(): Promise<number> {
  const result = await chrome.storage.local.get(COINS_KEY);
  return (result[COINS_KEY] as number) || 0;
}

/** Save coins to storage. */
export async function saveCoins(coins: number): Promise<void> {
  await chrome.storage.local.set({ [COINS_KEY]: coins });
}

/** Add coins (e.g. after pomodoro). Returns new balance. */
export async function addCoins(amount: number): Promise<number> {
  const current = await loadCoins();
  const newBalance = current + amount;
  await saveCoins(newBalance);
  return newBalance;
}

/* ── Inventory Functions ───────────────────────────── */

const INVENTORY_KEY = 'pawodoro_inventory';
const DEFAULT_MAX_SLOTS = 20;

/** Get full inventory from storage. */
export async function getInventory(): Promise<Inventory> {
  const result = await chrome.storage.local.get(INVENTORY_KEY);
  return (result[INVENTORY_KEY] as Inventory) || { items: [], maxSlots: DEFAULT_MAX_SLOTS };
}

/** Save inventory to storage. */
async function saveInventory(inv: Inventory): Promise<void> {
  await chrome.storage.local.set({ [INVENTORY_KEY]: inv });
}

/** Add item to inventory. Returns true if successful. */
export async function addItem(itemId: string, quantity = 1): Promise<boolean> {
  const inv = await getInventory();
  const existing = inv.items.find((i) => i.itemId === itemId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    // Check slot limit
    if (inv.items.length >= inv.maxSlots) return false;
    inv.items.push({ itemId, quantity, purchasedAt: Date.now() });
  }

  await saveInventory(inv);
  return true;
}

/** Remove item from inventory. Returns true if successful. */
export async function removeItem(itemId: string, quantity = 1): Promise<boolean> {
  const inv = await getInventory();
  const existing = inv.items.find((i) => i.itemId === itemId);
  if (!existing || existing.quantity < quantity) return false;

  existing.quantity -= quantity;
  if (existing.quantity <= 0) {
    inv.items = inv.items.filter((i) => i.itemId !== itemId);
  }

  await saveInventory(inv);
  return true;
}

/** Get quantity of a specific item. */
export async function getItemQuantity(itemId: string): Promise<number> {
  const inv = await getInventory();
  return inv.items.find((i) => i.itemId === itemId)?.quantity || 0;
}

/** Expand inventory by 5 slots. Returns coin cost. */
export async function expandInventory(): Promise<{ cost: number; newMax: number }> {
  const inv = await getInventory();
  const expansions = Math.floor((inv.maxSlots - DEFAULT_MAX_SLOTS) / 5);
  const cost = 50 + expansions * 30; // 50, 80, 110, 140...
  inv.maxSlots += 5;
  await saveInventory(inv);
  return { cost, newMax: inv.maxSlots };
}

/* ── Buy & Use ─────────────────────────────────────── */

/** Buy an item from the shop. Deducts coins and adds to inventory. */
export async function buyItem(
  itemId: string,
  coins: number,
  level: number,
): Promise<{ success: boolean; message: string; newBalance?: number }> {
  const item = getShopItem(itemId);
  if (!item) return { success: false, message: 'Item not found.' };
  if (item.unlockLevel && level < item.unlockLevel) {
    return { success: false, message: `Unlocks at level ${item.unlockLevel}.` };
  }
  if (coins < item.price) return { success: false, message: 'Not enough coins.' };

  const added = await addItem(itemId);
  if (!added) return { success: false, message: 'Inventory full!' };

  const newBalance = coins - item.price;
  return { success: true, message: `Bought ${item.name}!`, newBalance };
}

/** Use a consumable item (food/toy/special). Returns effects to apply. */
export async function useItem(
  itemId: string,
): Promise<{ success: boolean; effects?: ShopItem['effects']; message: string }> {
  const item = getShopItem(itemId);
  if (!item) return { success: false, message: 'Item not found.' };
  if (item.category === 'furniture' || item.category === 'decoration') {
    return { success: false, message: 'This item is for decoration, not consumable.' };
  }

  const qty = await getItemQuantity(itemId);
  if (qty <= 0) return { success: false, message: 'You don\'t have this item.' };

  await removeItem(itemId);
  return { success: true, effects: item.effects, message: `Used ${item.name}!` };
}
