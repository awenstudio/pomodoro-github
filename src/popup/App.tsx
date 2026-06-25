/* ─────────────────────────────────────────────────────
 *  App — Pawodoro root. Warm, cozy, pet-themed.
 *
 *  Pages: Timer, Shop, Backpack, Stats, Settings
 *  Navigation: Bottom 6-icon tab bar.
 * ───────────────────────────────────────────────────── */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Timer } from './components/Timer';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { Shop } from './components/Shop';
import { Backpack } from './components/Backpack';
import { Navigation, type PageId } from './components/Navigation';
import { Onboarding } from './components/Onboarding';
import { PetCreator } from './components/PetCreator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { KeyboardHints } from './components/KeyboardHints';
import { useTimer } from './hooks/useTimer';

const STORAGE_KEY_ONBOARDED = 'pomodoro_onboarded';
const STORAGE_KEY_COINS = 'pawodoro_coins';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('timer');
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [coins, setCoins] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const timer = useTimer();
  const prevPage = useRef(activePage);

  /* ── Load state ──────────────────────────────────── */

  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY_ONBOARDED, STORAGE_KEY_COINS], (result) => {
      setOnboarded(!!result[STORAGE_KEY_ONBOARDED]);
      setCoins(result[STORAGE_KEY_COINS] || 0);
    });
  }, []);

  // Entrance animation
  useEffect(() => {
    if (onboarded) {
      const t1 = setTimeout(() => setHeaderVisible(true), 100);
      const t2 = setTimeout(() => setNavVisible(true), 200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [onboarded]);

  /* ── Navigation ──────────────────────────────────── */

  const handleNavigate = useCallback((page: PageId) => {
    if (page === activePage) return;
    prevPage.current = activePage;
    setExiting(true);
    setTimeout(() => {
      setActivePage(page);
      setExiting(false);
    }, 150);
  }, [activePage]);

  /* ── Onboarding ──────────────────────────────────── */

  const handleOnboardingComplete = useCallback(async () => {
    await chrome.storage.local.set({ [STORAGE_KEY_ONBOARDED]: true });
    setOnboarded(true);
  }, []);

  /* ── Coins ───────────────────────────────────────── */

  const saveCoins = useCallback(async (newCoins: number) => {
    setCoins(newCoins);
    await chrome.storage.local.set({ [STORAGE_KEY_COINS]: newCoins });
  }, []);

  const handleShopBuy = useCallback((_itemId: string, newBalance: number) => {
    saveCoins(newBalance);
  }, [saveCoins]);

  /* ── Loading ─────────────────────────────────────── */

  if (onboarded === null) {
    return (
      <div className="flex items-center justify-center min-h-[520px]">
        <div className="text-3xl animate-pulse-soft">🐾</div>
      </div>
    );
  }

  if (!onboarded) {
    return (
      <ErrorBoundary>
        <Onboarding onComplete={handleOnboardingComplete} />
      </ErrorBoundary>
    );
  }

  const isLoggedIn = !!timer.settings.googleUser;

  return (
    <ErrorBoundary>
      <div className="relative flex flex-col min-h-[520px] overflow-hidden">
        {/* ── Background Glow Orbs ─────────────────────── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          <div className="warm-glow-orb" style={{
            width: 180, height: 180, top: -40, left: -30,
            background: 'radial-gradient(circle, rgba(90,175,94,0.08) 0%, transparent 70%)',
          }} />
          <div className="warm-glow-orb" style={{
            width: 160, height: 160, bottom: -20, right: -20,
            background: 'radial-gradient(circle, rgba(255,159,74,0.06) 0%, transparent 70%)',
            animationDelay: '2s',
          }} />
          <div className="warm-glow-orb" style={{
            width: 120, height: 120, top: '30%', left: '50%', transform: 'translateX(-50%)',
            background: 'radial-gradient(circle, rgba(232,104,104,0.03) 0%, transparent 70%)',
            animationDelay: '4s',
          }} />
        </div>

        {/* ── Content ──────────────────────────────────── */}
        <div className="relative z-10 flex flex-col min-h-[520px]">
          {/* Header */}
          <header
            className="flex items-center justify-between px-4 pt-4 pb-2"
            style={{
              opacity: headerVisible ? 1 : 0,
              transform: headerVisible ? 'translateY(0)' : 'translateY(-8px)',
              transition: 'opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl" style={{ animation: 'petBounce 2s ease-in-out infinite' }}>🐾</span>
              <h1 className="font-display text-base font-bold text-cream-100 tracking-tight">Pawodoro</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Coins display */}
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(255,217,122,0.08)', border: '1px solid rgba(255,217,122,0.1)' }}
              >
                <span className="text-xs">💰</span>
                <span className="text-[10px] font-display font-bold text-honey tabular-nums">
                  {coins.toLocaleString()}
                </span>
              </div>
              {/* Sync button */}
              {isLoggedIn && (
                <button
                  onClick={timer.syncNow}
                  className="btn-ghost p-1.5 rounded-xl"
                  title={
                    timer.syncState.status === 'success'
                      ? `Synced ${new Date(timer.syncState.lastSyncAt!).toLocaleTimeString()}`
                      : timer.syncState.status === 'error'
                        ? `Sync error: ${timer.syncState.error}`
                        : 'Click to sync'
                  }
                >
                  <svg
                    className={`w-4 h-4 transition-colors duration-300 ${
                      timer.syncState.status === 'syncing'
                        ? 'animate-spin text-moss-400'
                        : timer.syncState.status === 'success'
                          ? 'text-moss-400'
                          : 'text-gray-500'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 px-2 pb-2 relative overflow-hidden">
            <div
              style={{
                opacity: exiting ? 0 : 1,
                transform: exiting ? 'translateY(6px)' : 'translateY(0)',
                transition: 'opacity 0.15s ease, transform 0.15s ease',
              }}
            >
              <ErrorBoundary>
                {activePage === 'timer' && (
                  timer.pet ? <Timer /> : (
                    <PetCreator
                      onCreate={async (species, name) => {
                        try { return await timer.createPet(species, name); }
                        catch { return false; }
                      }}
                    />
                  )
                )}
                {activePage === 'stats' && <Stats />}
                {activePage === 'settings' && <Settings />}
                {activePage === 'shop' && (
                  <Shop coins={coins} level={timer.playerProgress.level} onBuy={handleShopBuy} />
                )}
                {activePage === 'backpack' && (
                  <Backpack
                    onUseFood={() => timer.feedPet?.()}
                    onUseToy={() => timer.playWithPet?.()}
                  />
                )}
                {activePage === 'room' && (
                  <div className="flex items-center justify-center h-[400px]">
                    <span className="text-cream-300/30 text-sm font-display">Room view coming soon</span>
                  </div>
                )}
              </ErrorBoundary>
            </div>
          </main>

          {/* Navigation */}
          <nav
            className="relative px-3 pb-3"
            style={{
              opacity: navVisible ? 1 : 0,
              transform: navVisible ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <Navigation currentPage={activePage} onNavigate={handleNavigate} />
          </nav>
        </div>
      </div>
      <KeyboardHints />
    </ErrorBoundary>
  );
}
