/* ─────────────────────────────────────────────────────
 *  App — Root component.
 *
 *  Design: Timer is the default tab. Everything works
 *  without login. Google sync is optional, surfaced
 *  gently in Settings.
 * ───────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react';
import { Timer } from './components/Timer';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { Onboarding } from './components/Onboarding';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useTimer } from './hooks/useTimer';

type Tab = 'timer' | 'stats' | 'settings';

const STORAGE_KEY_ONBOARDED = 'pomodoro_onboarded';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('timer');
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const timer = useTimer();

  // Check if user has completed onboarding
  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY_ONBOARDED, (result) => {
      setOnboarded(!!result[STORAGE_KEY_ONBOARDED]);
    });
  }, []);

  const handleOnboardingComplete = useCallback(async () => {
    await chrome.storage.local.set({ [STORAGE_KEY_ONBOARDED]: true });
    setOnboarded(true);
  }, []);

  // Loading state
  if (onboarded === null) {
    return (
      <div className="flex items-center justify-center min-h-[520px]">
        <div className="text-2xl animate-pulse">🍅</div>
      </div>
    );
  }

  // Onboarding flow
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
      <div className="flex flex-col min-h-[520px]">
        {/* Header — minimal, no login pressure */}
        <header className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍅</span>
            <h1 className="text-sm font-semibold text-white tracking-tight">
              Pomodoro
            </h1>
          </div>

          {/* Sync indicator — only visible when logged in */}
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
                    ? 'animate-spin text-blue-400'
                    : timer.syncState.status === 'success'
                      ? 'text-green-400'
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
        <main className="flex-1 px-4 pb-2">
          <ErrorBoundary>
            {activeTab === 'timer' && <Timer />}
            {activeTab === 'stats' && <Stats />}
            {activeTab === 'settings' && <Settings />}
          </ErrorBoundary>
        </main>

        {/* Tab bar */}
        <nav className="flex items-center justify-center gap-1 px-4 py-3 border-t border-white/5">
          {([
            { id: 'timer' as Tab, icon: '⏱', label: 'Timer' },
            { id: 'stats' as Tab, icon: '📊', label: 'Stats' },
            { id: 'settings' as Tab, icon: '⚙️', label: 'Settings' },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-white/8 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </ErrorBoundary>
  );
}
