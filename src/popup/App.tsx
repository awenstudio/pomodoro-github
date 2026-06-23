/* ─────────────────────────────────────────────────────
 *  App — Pawodoro root. Warm, cozy, pet-themed.
 * ───────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react';
import { Timer } from './components/Timer';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { Onboarding } from './components/Onboarding';
import { PetCreator } from './components/PetCreator';
import { ErrorBoundary } from './components/ErrorBoundary';
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
  const timer = useTimer();

  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY_ONBOARDED, (result) => {
      setOnboarded(!!result[STORAGE_KEY_ONBOARDED]);
    });
  }, []);

  const handleOnboardingComplete = useCallback(async () => {
    await chrome.storage.local.set({ [STORAGE_KEY_ONBOARDED]: true });
    setOnboarded(true);
  }, []);

  const handleTabChange = useCallback((newTab: Tab) => {
    if (newTab === activeTab) return;
    const oldIndex = TABS.findIndex((t) => t.id === activeTab);
    const newIndex = TABS.findIndex((t) => t.id === newTab);
    setTabDirection(newIndex > oldIndex ? 'right' : 'left');
    setActiveTab(newTab);
  }, [activeTab]);

  if (onboarded === null) {
    return (
      <div className="flex items-center justify-center min-h-[520px]">
        <div className="text-3xl animate-bounce-gentle">🐾</div>
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
        <header className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg animate-bounce-gentle">🐾</span>
            <h1 className="text-sm font-semibold text-cream-100 tracking-tight">
              Pawodoro
            </h1>
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
                className={`w-4 h-4 ${
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
            key={activeTab}
            className={`animate-tab-${tabDirection} h-full`}
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
        <nav className="relative px-4 py-3 border-t border-cream-100/5">
          <div
            className="absolute top-0 h-[2px] bg-moss-500 rounded-full transition-all duration-300 ease-out"
            style={{
              left: `${(TABS.findIndex((t) => t.id === activeTab) / TABS.length) * 100}%`,
              width: `${100 / TABS.length}%`,
            }}
          />
          <div className="flex items-center justify-center gap-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs
                    transition-all duration-200 ease-out
                    ${isActive
                      ? 'text-cream-100 scale-105'
                      : 'text-gray-500 hover:text-gray-300 active:scale-95'
                    }`}
                >
                  <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                    {tab.icon}
                  </span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </ErrorBoundary>
  );
}
