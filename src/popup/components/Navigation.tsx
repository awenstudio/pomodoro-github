/* ─────────────────────────────────────────────────────
 *  Navigation — Bottom tab bar for switching views.
 *
 *  6 icons in 2 rows × 3 cols.
 *  Current page highlighted with accent glow.
 * ───────────────────────────────────────────────────── */

export type PageId = 'timer' | 'room' | 'shop' | 'stats' | 'backpack' | 'settings';

interface NavItem {
  id: PageId;
  icon: string;
  label: string;
  accent: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'timer', icon: '⏱️', label: 'Timer', accent: '#5AAF5E' },
  { id: 'room', icon: '🏠', label: 'Room', accent: '#FF9E4A' },
  { id: 'shop', icon: '🏪', label: 'Shop', accent: '#FFD97A' },
  { id: 'stats', icon: '📊', label: 'Stats', accent: '#7BA8D1' },
  { id: 'backpack', icon: '🎒', label: 'Bag', accent: '#C4A4F7' },
  { id: 'settings', icon: '⚙️', label: 'Settings', accent: '#B8A88C' },
];

interface NavigationProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <div
      className="grid grid-cols-6 gap-0.5 px-2 py-1.5 rounded-xl"
      style={{
        background: 'rgba(255,248,230,0.03)',
        border: '1px solid rgba(255,248,230,0.04)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex flex-col items-center gap-0.5 py-1 rounded-lg transition-all duration-200"
            style={{
              background: active ? `${item.accent}10` : 'transparent',
              boxShadow: active ? `0 0 8px ${item.accent}15` : 'none',
            }}
          >
            <span className="text-sm select-none">{item.icon}</span>
            <span
              className="text-[8px] font-display font-medium"
              style={{ color: active ? item.accent : 'rgba(255,248,230,0.25)' }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
