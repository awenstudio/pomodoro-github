/* ─────────────────────────────────────────────────────
 *  Google Drive Sync — Store pomodoro data as a JSON
 *  file in the user's Google Drive AppData folder.
 *
 *  AppData is hidden from the user's regular Drive UI.
 *  File name: pomodoro-data.json
 * ───────────────────────────────────────────────────── */

import type { SyncPayload, SyncState } from '@/types';
import { getAuthToken } from './google-auth';
import { loadAllData, saveSyncState } from './storage';

const FILENAME = 'pomodoro-data.json';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

/* ── Error handling ────────────────────────────────── */

export class DriveSyncError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'DriveSyncError';
    this.code = code;
  }
}

async function apiFetch(
  url: string,
  token: string,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    // Token expired — try to refresh
    await new Promise<void>((resolve) => {
      chrome.identity.removeCachedAuthToken(
        { token },
        resolve,
      );
    });
    throw new DriveSyncError('TOKEN_EXPIRED', 'Auth token expired, please retry');
  }

  if (res.status === 429 || res.status === 503) {
    throw new DriveSyncError('RATE_LIMITED', 'Rate limited, retry later');
  }

  return res;
}

/* ── Find or create the data file ──────────────────── */

async function findFile(token: string): Promise<string | null> {
  const res = await apiFetch(
    `${DRIVE_API}/files?spaces=appData&q=name='${FILENAME}'&fields=files(id,name)`,
    token,
  );

  if (!res.ok) return null;

  const data = await res.json();
  return data.files?.[0]?.id || null;
}

async function createFile(token: string, content: SyncPayload): Promise<string> {
  const metadata = JSON.stringify({
    name: FILENAME,
    parents: ['appDataFolder'],
    mimeType: 'application/json',
  });

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([metadata], { type: 'application/json' }),
  );
  form.append(
    'file',
    new Blob([JSON.stringify(content, null, 2)], {
      type: 'application/json',
    }),
  );

  const res = await fetch(
    `${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    },
  );

  if (!res.ok) {
    throw new DriveSyncError('CREATE_FAILED', `Create failed: ${res.status}`);
  }

  const data = await res.json();
  return data.id;
}

async function readFile(
  token: string,
  fileId: string,
): Promise<SyncPayload | null> {
  const res = await apiFetch(
    `${DRIVE_API}/files/${fileId}?alt=media`,
    token,
  );

  if (!res.ok) return null;

  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function updateFile(
  token: string,
  fileId: string,
  content: SyncPayload,
): Promise<void> {
  const res = await fetch(
    `${DRIVE_UPLOAD_API}/files/${fileId}?uploadType=media`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(content, null, 2),
    },
  );

  if (!res.ok) {
    throw new DriveSyncError(
      'UPDATE_FAILED',
      `Update failed: ${res.status}`,
    );
  }
}

/* ── Bidirectional sync ────────────────────────────── */

export async function performDriveSync(): Promise<SyncState> {
  const syncState = await loadAllData().then((d) => d.syncState);

  if (syncState.status === 'syncing') {
    return syncState;
  }

  await saveSyncState({
    status: 'syncing',
    lastSyncAt: syncState.lastSyncAt,
    error: null,
    pendingChanges: 0,
  });

  try {
    const token = await getAuthToken(false);
    const { settings, dailyStats, streak } = await loadAllData();

    // Find or create the file
    let fileId = await findFile(token);
    let remote: SyncPayload | null = null;

    if (fileId) {
      remote = await readFile(token, fileId);
    }

    // Merge: prefer more sessions per day, prefer higher streak
    let mergedDailyStats = { ...dailyStats };
    let mergedStreak = { ...streak };

    if (remote) {
      for (const [date, remoteDay] of Object.entries(remote.dailyStats)) {
        const localDay = mergedDailyStats[date];
        if (
          !localDay ||
          remoteDay.sessions.length > localDay.sessions.length
        ) {
          mergedDailyStats[date] = remoteDay;
        }
      }
      if (remote.streak.current > mergedStreak.current) {
        mergedStreak = remote.streak;
      }
    }

    // Build payload
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

    // Upload
    if (fileId) {
      await updateFile(token, fileId, payload);
    } else {
      fileId = await createFile(token, payload);
    }

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
