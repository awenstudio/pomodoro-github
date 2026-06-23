/* ─────────────────────────────────────────────────────
 *  App — Root component with tab navigation.
 * ───────────────────────────────────────────────────── */

import { useState } from 'react';
import { Timer } from './components/Timer';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { useTimer } from './hooks/useTimer';

type Tab = 'timer' | 'stats' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('timer');
  const timer = useTimer();
  const { syncState: syncInfo, syncNow } = timer;

  return (
    <div className="flex flex-col min-h-[520px]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🍅</span>
          <h1 className="text-sm font-semibold text-white tracking-tight">
            Pomodoro
          </h1>
        </div>

        {/* Sync indicator */}
        <button
          onClick={syncNow}
          className="btn-ghost p-1.5"
          title={
            syncInfo.status === 'success'
              ? `Last synced: ${new Date(syncInfo.lastSyncAt!).toLocaleTimeString()}`
              : syncInfo.status === 'error'
                ? `Sync error: ${syncInfo.error}`
                : 'Click to sync'
          }
        >
          <svg
            className={`w-4 h-4 ${
              syncInfo.status === 'syncing'
                ? 'animate-spin text-blue-400'
                : syncInfo.status === 'success'
                  ? 'text-green-400'
                  : syncInfo.status === 'error'
                    ? 'text-red-400'
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
      </header>

      {/* Tab content */}
      <main className="flex-1 px-4 pb-2">
        {activeTab === 'timer' && <Timer />}
        {activeTab === 'stats' && <Stats />}
        {activeTab === 'settings' && <Settings />}
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
  );
}
