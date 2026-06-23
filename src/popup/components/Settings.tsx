/* ─────────────────────────────────────────────────────
 *  Settings — Timer config, GitHub connection,
 *  data management, and preferences.
 * ───────────────────────────────────────────────────── */

import { useState, useCallback } from 'react';
import { useTimer } from '../hooks/useTimer';
import { testToken } from '@/lib/github-sync';

export function Settings() {
  const { settings, updateSettings, clearData, syncNow, syncState: syncInfo } = useTimer();
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [githubStatus, setGithubStatus] = useState<
    'idle' | 'testing' | 'valid' | 'invalid'
  >('idle');
  const [githubUser, setGithubUser] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSave = useCallback(async () => {
    await updateSettings(localSettings);
  }, [localSettings, updateSettings]);

  const handleTestToken = useCallback(async () => {
    if (!tokenInput.trim()) return;
    setGithubStatus('testing');
    try {
      const user = await testToken(tokenInput.trim());
      setGithubUser(user.login);
      setGithubStatus('valid');
      // Auto-save token
      await updateSettings({ githubToken: tokenInput.trim() });
    } catch {
      setGithubStatus('invalid');
      setGithubUser(null);
    }
  }, [tokenInput, updateSettings]);

  const handleDisconnect = useCallback(async () => {
    await updateSettings({ githubToken: null, gistId: null });
    setGithubStatus('idle');
    setGithubUser(null);
    setTokenInput('');
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

  const connected = !!settings.githubToken;

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

      {/* GitHub */}
      <Section title="GitHub Sync">
        {connected && githubStatus !== 'invalid' ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">●</span>
              <span className="text-white">
                {githubUser || 'Connected'}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={syncNow} className="btn-secondary text-xs px-3 py-1.5">
                {syncInfo.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
              </button>
              <button
                onClick={handleDisconnect}
                className="btn-ghost text-xs px-3 py-1.5 text-red-400"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">
              Create a{' '}
              <a
                href="https://github.com/settings/tokens/new?scopes=gist&description=Pomodoro+GitHub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Personal Access Token
              </a>{' '}
              with <code className="text-xs bg-surface-3 px-1 rounded">gist</code> scope
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                className="flex-1 setting-input text-left text-xs"
                placeholder="ghp_xxxxxxxxxxxx"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTestToken()}
              />
              <button
                onClick={handleTestToken}
                disabled={githubStatus === 'testing'}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                {githubStatus === 'testing' ? '...' : 'Connect'}
              </button>
            </div>
            {githubStatus === 'invalid' && (
              <p className="text-xs text-red-400">Invalid token. Please check and try again.</p>
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
