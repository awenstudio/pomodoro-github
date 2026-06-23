/* ─────────────────────────────────────────────────────
 *  Settings — Timer config, Google account login,
 *  data management, and preferences.
 * ───────────────────────────────────────────────────── */

import { useState, useCallback } from 'react';
import { useTimer } from '../hooks/useTimer';
import { signIn, signOut } from '@/lib/google-auth';


export function Settings() {
  const { settings, updateSettings, clearData, syncNow, syncState: syncInfo } = useTimer();
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    await updateSettings(localSettings);
  }, [localSettings, updateSettings]);

  const handleGoogleLogin = useCallback(async () => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const { user } = await signIn();
      await updateSettings({ googleUser: user });
    } catch (err: unknown) {
      const error = err as { message?: string };
      setLoginError(error.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  }, [updateSettings]);

  const handleGoogleLogout = useCallback(async () => {
    await signOut();
    await updateSettings({ googleUser: null });
  }, [updateSettings]);

  const handleClearData = useCallback(async () => {
    if (showClearConfirm) {
      await clearData();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  }, [showClearConfirm, clearData]);

  const user = settings.googleUser;

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-2">
      {/* Timer durations */}
      <Section title="Timer">
        <SettingRow label="Focus (min)">
          <input
            type="number"
            className="setting-input"
            min={1}
            max={120}
            value={Math.round(localSettings.workDuration / 60)}
            onChange={(e) =>
              setLocalSettings((s) => ({
                ...s,
                workDuration: parseInt(e.target.value || '25', 10) * 60,
              }))
            }
          />
        </SettingRow>
        <SettingRow label="Short Break (min)">
          <input
            type="number"
            className="setting-input"
            min={1}
            max={30}
            value={Math.round(localSettings.shortBreakDuration / 60)}
            onChange={(e) =>
              setLocalSettings((s) => ({
                ...s,
                shortBreakDuration: parseInt(e.target.value || '5', 10) * 60,
              }))
            }
          />
        </SettingRow>
        <SettingRow label="Long Break (min)">
          <input
            type="number"
            className="setting-input"
            min={1}
            max={60}
            value={Math.round(localSettings.longBreakDuration / 60)}
            onChange={(e) =>
              setLocalSettings((s) => ({
                ...s,
                longBreakDuration: parseInt(e.target.value || '15', 10) * 60,
              }))
            }
          />
        </SettingRow>
        <SettingRow label="Long Break After">
          <input
            type="number"
            className="setting-input"
            min={2}
            max={10}
            value={localSettings.longBreakInterval}
            onChange={(e) =>
              setLocalSettings((s) => ({
                ...s,
                longBreakInterval: parseInt(e.target.value || '4', 10),
              }))
            }
          />
        </SettingRow>
        <SettingRow label="Daily Goal">
          <input
            type="number"
            className="setting-input"
            min={1}
            max={20}
            value={localSettings.dailyGoal}
            onChange={(e) =>
              setLocalSettings((s) => ({
                ...s,
                dailyGoal: parseInt(e.target.value || '8', 10),
              }))
            }
          />
        </SettingRow>
      </Section>

      {/* Behavior */}
      <Section title="Behavior">
        <ToggleRow
          label="Auto-start Breaks"
          checked={localSettings.autoStartBreaks}
          onChange={(v) => setLocalSettings((s) => ({ ...s, autoStartBreaks: v }))}
        />
        <ToggleRow
          label="Auto-start Focus"
          checked={localSettings.autoStartWork}
          onChange={(v) => setLocalSettings((s) => ({ ...s, autoStartWork: v }))}
        />
        <ToggleRow
          label="Sound"
          checked={localSettings.soundEnabled}
          onChange={(v) => setLocalSettings((s) => ({ ...s, soundEnabled: v }))}
        />
        <ToggleRow
          label="Notifications"
          checked={localSettings.notificationEnabled}
          onChange={(v) =>
            setLocalSettings((s) => ({ ...s, notificationEnabled: v }))
          }
        />
      </Section>

      {/* Google Account */}
      <Section title="Cloud Sync">
        {user ? (
          <div className="flex flex-col gap-3">
            {/* User info */}
            <div className="flex items-center gap-3">
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <span className="text-green-400 text-xs">●</span>
            </div>

            {/* Sync controls */}
            <div className="flex gap-2">
              <button onClick={syncNow} className="btn-secondary text-xs px-3 py-1.5">
                {syncInfo.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
              </button>
              <button
                onClick={handleGoogleLogout}
                className="btn-ghost text-xs px-3 py-1.5 text-red-400"
              >
                Sign Out
              </button>
            </div>

            {syncInfo.status === 'success' && syncInfo.lastSyncAt && (
              <p className="text-[10px] text-gray-600">
                Last synced: {new Date(syncInfo.lastSyncAt).toLocaleString()}
              </p>
            )}
            {syncInfo.status === 'error' && (
              <p className="text-xs text-red-400">{syncInfo.error}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-500">
              Sign in with Google to sync your data across devices.
              Data is stored in your private Google Drive — only you can access it.
            </p>

            {/* Google Sign-In button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loginLoading}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl
                         bg-white hover:bg-gray-100 active:bg-gray-200
                         text-gray-800 text-sm font-medium
                         transition-colors duration-150 disabled:opacity-50"
            >
              {loginLoading ? (
                <span className="text-gray-500">Signing in...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            {loginError && (
              <p className="text-xs text-red-400 text-center">{loginError}</p>
            )}
          </div>
        )}
      </Section>

      {/* Data */}
      <Section title="Data">
        <button
          onClick={handleClearData}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
            showClearConfirm
              ? 'bg-red-600 text-white'
              : 'btn-ghost text-red-400'
          }`}
        >
          {showClearConfirm ? 'Click again to confirm' : 'Clear All Data'}
        </button>
      </Section>

      {/* Save button */}
      <button onClick={handleSave} className="btn-primary w-full py-2.5 text-sm">
        Save Settings
      </button>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl p-3">
      <h3 className="text-xs font-medium text-gray-400 mb-3">{title}</h3>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-300">{label}</span>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
          checked ? 'bg-tomato-600' : 'bg-surface-4'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
