/* ─────────────────────────────────────────────────────
 *  useTimer — Central hook that bridges background
 *  service worker state with the popup React UI.
 *
 *  Architecture: Background is the single source of
 *  truth for timer state. Popup listens via
 *  chrome.storage.onChanged for real-time updates.
 * ───────────────────────────────────────────────────── */

import { useEffect, useCallback } from 'react';
import { useTimerStore } from '@/stores/timer-store';
import type { MessageType, MessageResponse, TaskRef } from '@/types';

/* ── Message helper ────────────────────────────────── */

function sendMessage<T = unknown>(msg: MessageType): Promise<MessageResponse<T>> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(msg, (response: MessageResponse<T>) => {
      if (chrome.runtime.lastError) {
        resolve({ success: false, error: chrome.runtime.lastError.message });
      } else {
        resolve(response);
      }
    });
  });
}

/* ── Hook ──────────────────────────────────────────── */

export function useTimer() {
  const store = useTimerStore();

  /* ── State sync from background ──────────────────── */

  const syncState = useCallback(async () => {
    const response = await sendMessage<Record<string, unknown>>({ type: 'GET_STATE' });

    if (response.success && response.data) {
      const data = response.data as Record<string, unknown>;
      if (data.timer) store.setTimerState(data.timer as typeof store.timer);
      if (data.settings) store.setSettings(data.settings as typeof store.settings);
      if (data.todayStats) store.setTodayStats(data.todayStats as typeof store.todayStats);
      if (data.streak) store.setStreak(data.streak as typeof store.streak);
      if (data.syncState) store.setSyncState(data.syncState as typeof store.syncState);
      if (data.progress) store.setProgress(data.progress as import('@/types').PlayerProgress);
    }
  }, []); // store is a stable Zustand reference

  // Initial sync on mount
  useEffect(() => {
    syncState();
  }, [syncState]);

  // Re-sync when popup regains focus (handles tab switch, popup reopen)
  useEffect(() => {
    const handleFocus = () => syncState();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [syncState]);

  // Listen for real-time storage changes from background
  // This is the ONLY source of timer ticks in the popup — no local countdown
  useEffect(() => {
    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string,
    ) => {
      if (area !== 'local') return;

      if (changes.pomodoro_timer_state) {
        const newState = changes.pomodoro_timer_state.newValue;
        if (newState) {
          store.setTimerState(newState);
        }
      }

      if (changes.pomodoro_daily_stats) {
        const today = new Date().toISOString().split('T')[0];
        const stats = changes.pomodoro_daily_stats.newValue;
        if (stats?.[today]) {
          store.setTodayStats(stats[today]);
        }
      }

      if (changes.pomodoro_streak) {
        const streak = changes.pomodoro_streak.newValue;
        if (streak) store.setStreak(streak);
      }

      if (changes.pomodoro_sync_state) {
        const syncState = changes.pomodoro_sync_state.newValue;
        if (syncState) store.setSyncState(syncState);
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []); // stable

  /* ── Actions ─────────────────────────────────────── */

  const start = useCallback(async (task?: TaskRef) => {
    const response = await sendMessage({ type: 'START', task });
    if (response.success && response.data) {
      store.setTimerState(response.data as typeof store.timer);
    }
  }, []);

  const pause = useCallback(async () => {
    const response = await sendMessage({ type: 'PAUSE' });
    if (response.success && response.data) {
      store.setTimerState(response.data as typeof store.timer);
    }
  }, []);

  const resume = useCallback(async () => {
    const response = await sendMessage({ type: 'RESUME' });
    if (response.success && response.data) {
      store.setTimerState(response.data as typeof store.timer);
    }
  }, []);

  const skip = useCallback(async () => {
    const response = await sendMessage({ type: 'SKIP' });
    if (response.success && response.data) {
      store.setTimerState(response.data as typeof store.timer);
    }
  }, []);

  const reset = useCallback(async () => {
    const response = await sendMessage({ type: 'RESET' });
    if (response.success && response.data) {
      store.setTimerState(response.data as typeof store.timer);
    }
  }, []);

  const syncNow = useCallback(async () => {
    await sendMessage({ type: 'SYNC_NOW' });
    await syncState();
  }, [syncState]);

  const updateSettings = useCallback(async (settings: Partial<typeof store.settings>) => {
    await sendMessage({ type: 'UPDATE_SETTINGS', settings });
    await syncState();
  }, [syncState]);

  const clearData = useCallback(async () => {
    await sendMessage({ type: 'CLEAR_DATA' });
    await syncState();
  }, [syncState]);

  const useForgiveness = useCallback(async () => {
    const response = await sendMessage({ type: 'USE_FORGIVENESS' });
    if (response.success) {
      await syncState();
    }
    return response.success;
  }, [syncState]);

  return {
    // State (spread from Zustand store — all reactive)
    ...store,

    // Actions (named to avoid collision with store.syncState)
    start,
    pause,
    resume,
    skip,
    reset,
    syncNow,
    refreshSync: syncState,
    updateSettings,
    clearData,
    useForgiveness,
  };
}
