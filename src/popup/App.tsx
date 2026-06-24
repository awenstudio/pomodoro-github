/* ─────────────────────────────────────────────────────
 *  App — Pawodoro root. Warm, cozy, pet-themed.
 *  v2: Smooth tab transitions, page transitions,
 *  entrance animations.
 * ───────────────────────────────────────────────────── */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Timer } from './components/Timer';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { Onboarding } from './components/Onboarding';
import { PetCreator } from './components/PetCreator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { KeyboardHints } from './components/KeyboardHints';
import { useTimer } from './hooks/useTimer';

type Tab = 'timer' | 'stats' | 'settings';

const STORAGE_KEY_ONBOARDED = 'pomodoro_onboarded';

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'timer', icon: '🐾', label: 'Focus' },
  { id: 'stats', icon: '📊', label: 'Stats' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('timer');
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [tabDirection, setTabDirection] = useState<'left' | 'right'>('right');
  const [exiting, setExiting] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const timer = useTimer();
  const prevTab = useRef(activeTab);

  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY_ONBOARDED, (result) => {
      setOnboarded(!!result[STORAGE_KEY_ONBOARDED]);
    });
  }, []);

  // Entrance animation
  useEffect(() => {
    if (onboarded) {
      const t1 = setTimeout(() => setHeaderVisible(true), 100);
      const t2 = setTimeout(() => setNavVisible(true), 200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [onboarded]);

  const handleOnboardingComplete = useCallback(async () => {
    await chrome.storage.local.set({ [STORAGE_KEY_ONBOARDED]: true });
    setOnboarded(true);
  }, []);

  const handleTabChange = useCallback((newTab: Tab) => {
    if (newTab === activeTab) return;
    const oldIndex = TABS.findIndex((t) => t.id === activeTab);
    const newIndex = TABS.findIndex((t) => t.id === newTab);
    setTabDirection(newIndex > oldIndex ? 'right' : 'left');
    prevTab.current = activeTab;
    setExiting(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setExiting(false);
    }, 150);
  }, [activeTab]);

  if (onboarded === null) {
    return (
      <div className="flex items-center justify-center min-h-[520px]">
        <div className="text-3xl" style={{ animation: 'petBreathe 2s ease-in-out infinite' }}>🐾</div>
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
      <div className="flex flex-col min-h-[520px] overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between px-4 pt-4 pb-2"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(-8px)',
            transition: 'opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg" style={{ animation: 'petBreathe 3s ease-in-out infinite' }}>🐾</span>
            <h1 className="text-sm font-semibold text-cream-100 tracking-tight">Pawodoro</h1>
          </div>
          {isLoggedIn && (
            <button
              onClick={timer.syncNow}
              className="btn-ghost p-1.5"
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
        </header>

        {/* Tab content */}
        <main className="flex-1 px-4 pb-2 relative overflow-hidden">
          <div
            style={{
              opacity: exiting ? 0 : 1,
              transform: exiting
                ? tabDirection === 'right' ? 'translateX(-16px)' : 'translateX(16px)'
                : 'translateX(0)',
              transition: 'opacity 0.2s ease, transform 0.2s ease',
            }}
          >
            <ErrorBoundary>
              {activeTab === 'timer' && (
                timer.pet ? <Timer /> : (
                  <PetCreator
                    onCreate={async (species, name) => {
                      try {
                        return await timer.createPet(species, name);
                      } catch {
                        return false;
                      }
                    }}
                  />
                )
              )}
              {activeTab === 'stats' && <Stats />}
              {activeTab === 'settings' && <Settings />}
            </ErrorBoundary>
          </div>
        </main>

        {/* Tab bar */}
        <nav
          className="relative px-4 py-3 border-t border-cream-100/5"
          style={{
            opacity: navVisible ? 1 : 0,
            transform: navVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Active tab indicator */}
          <div
            className="absolute top-0 h-[2px] rounded-full will-change-[width]"
            style={{
              left: `${(TABS.findIndex((t) => t.id === activeTab) / TABS.length) * 100}%`,
              width: `${100 / TABS.length}%`,
              background: 'linear-gradient(90deg, #5AAF5E, #7BC47A)',
              transition: 'left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
          <div className="flex items-center justify-center gap-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className="relative flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs
                             transition-all duration-300 ease-out select-none"
                  style={{
                    color: isActive ? '#FFF8E6' : 'rgba(255,248,230,0.35)',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <span
                    className="transition-transform duration-300"
                    style={{ transform: isActive ? 'scale(1.15) rotate(-5deg)' : 'scale(1) rotate(0deg)' }}
                  >
                    {tab.icon}
                  </span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
      <KeyboardHints />
    </ErrorBoundary>
  );
}
