/* ─────────────────────────────────────────────────────
 *  GitHub Sync — Gist-based cloud sync with conflict
 *  resolution, retry, and offline queue.
 * ───────────────────────────────────────────────────── */

import { Octokit } from '@octokit/rest';
import type { SyncPayload, Settings, DailyStats, StreakData, SyncState } from '@/types';
import {
  GIST_FILENAME,
  GIST_DESCRIPTION,
  SYNC_RETRY_BASE_MS,
  SYNC_MAX_RETRIES,
} from './constants';
import {
  loadAllData,
  saveSyncState,
  saveSettings,
  loadSyncState,
} from './storage';

/* ── Octokit Factory ───────────────────────────────── */

function createOctokit(token: string): Octokit {
  return new Octokit({ auth: token });
}

/* ── Rate Limit Handler ────────────────────────────── */

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = SYNC_MAX_RETRIES,
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const err = error as { status?: number; headers?: Record<string, string> };

      if (err.status === 403 || err.status === 429) {
        const retryAfter = err.headers?.['retry-after'];
        const waitMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : SYNC_RETRY_BASE_MS * Math.pow(2, attempt);

        if (attempt < retries) {
          await sleep(waitMs);
          continue;
        }
      }

      if (err.status === 401) {
        throw new GitHubSyncError('TOKEN_INVALID', 'GitHub token is invalid or expired');
      }

      if (attempt < retries && (err.status === 500 || err.status === 502 || err.status === 503)) {
        await sleep(SYNC_RETRY_BASE_MS * Math.pow(2, attempt));
        continue;
      }

      throw error;
    }
  }
  throw new GitHubSyncError('MAX_RETRIES', 'Max retries exceeded');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ── Error Types ───────────────────────────────────── */

export class GitHubSyncError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'GitHubSyncError';
    this.code = code;
  }
}

/* ── Core Sync Operations ──────────────────────────── */

export async function testToken(token: string): Promise<{ login: string; avatarUrl: string }> {
  const octokit = createOctokit(token);
  const { data } = await withRetry(() => octokit.users.getAuthenticated());
  return { login: data.login, avatarUrl: data.avatar_url };
}

export async function ensureGist(token: string, existingGistId: string | null): Promise<string> {
  const octokit = createOctokit(token);

  if (existingGistId) {
    try {
      await withRetry(() => octokit.gists.get({ gist_id: existingGistId }));
      return existingGistId;
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === 404) {
        // Gist was deleted, create a new one
      } else {
        throw error;
      }
    }
  }

  // Create new private gist
  const payload: SyncPayload = {
    version: '1.0',
    lastSync: new Date().toISOString(),
    dailyStats: {},
    streak: { current: 0, longest: 0, lastActiveDate: '' },
    settings: {},
  };

  const { data } = await withRetry(() =>
    octokit.gists.create({
      description: GIST_DESCRIPTION,
      public: false,
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(payload, null, 2),
        },
      },
    }),
  );

  return data.id!;
}

/* ── Pull (Download) ───────────────────────────────── */

export async function pullFromGist(
  token: string,
  gistId: string,
): Promise<SyncPayload | null> {
  const octokit = createOctokit(token);

  try {
    const { data } = await withRetry(() =>
      octokit.gists.get({ gist_id: gistId }),
    );

    const file = data.files?.[GIST_FILENAME];
    if (!file?.content) return null;

    const remote = JSON.parse(file.content) as SyncPayload;

    // Validate schema version
    if (!remote.version || !remote.lastSync) {
      return null;
    }

    return remote;
  } catch (error: unknown) {
    const err = error as { status?: number };
    if (err.status === 404) return null;
    throw error;
  }
}

/* ── Push (Upload) ─────────────────────────────────── */

export async function pushToGist(
  token: string,
  gistId: string,
  payload: SyncPayload,
): Promise<void> {
  const octokit = createOctokit(token);

  await withRetry(() =>
    octokit.gists.update({
      gist_id: gistId,
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(payload, null, 2),
        },
      },
    }),
  );
}

/* ── Full Sync (Bidirectional) ─────────────────────── */

export async function performSync(): Promise<SyncState> {
  const syncState = await loadSyncState();
  if (syncState.status === 'syncing') {
    return syncState; // Already syncing
  }

  const { settings, dailyStats, streak } = await loadAllData();

  if (!settings.githubToken) {
    return {
      status: 'error',
      lastSyncAt: null,
      error: 'No GitHub token configured',
      pendingChanges: 0,
    };
  }

  await saveSyncState({
    status: 'syncing',
    lastSyncAt: syncState.lastSyncAt,
    error: null,
    pendingChanges: 0,
  });

  try {
    // Ensure gist exists
    const gistId = await ensureGist(settings.githubToken, settings.gistId);
    if (gistId !== settings.gistId) {
      await saveSettings({ gistId });
    }

    // Pull remote data
    const remote = await pullFromGist(settings.githubToken, gistId);

    // Merge: remote wins for conflicts (last-write-wins with field-level merge)
    let mergedDailyStats = { ...dailyStats };
    let mergedStreak = { ...streak };

    if (remote) {
      // Merge daily stats — prefer whichever has more sessions for each day
      for (const [date, remoteDay] of Object.entries(remote.dailyStats)) {
        const localDay = mergedDailyStats[date];
        if (!localDay || remoteDay.sessions.length > localDay.sessions.length) {
          mergedDailyStats[date] = remoteDay;
        }
      }

      // Merge streak — prefer higher
      if (remote.streak.current > mergedStreak.current) {
        mergedStreak = remote.streak;
      }
    }

    // Build local payload
    const payload: SyncPayload = {
      version: '1.0',
      lastSync: new Date().toISOString(),
      dailyStats: mergedDailyStats,
      streak: mergedStreak,
      settings: {
        workDuration: settings.workDuration,
        shortBreakDuration: settings.shortBreakDuration,
        longBreakDuration: settings.longBreakDuration,
        longBreakInterval: settings.longBreakInterval,
        dailyGoal: settings.dailyGoal,
      },
    };

    // Push merged data
    await pushToGist(settings.githubToken, gistId, payload);

    const newState: SyncState = {
      status: 'success',
      lastSyncAt: payload.lastSync,
      error: null,
      pendingChanges: 0,
    };
    await saveSyncState(newState);
    return newState;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    const newState: SyncState = {
      status: 'error',
      lastSyncAt: syncState.lastSyncAt,
      error: err.message || 'Sync failed',
      pendingChanges: syncState.pendingChanges + 1,
    };
    await saveSyncState(newState);
    return newState;
  }
}
