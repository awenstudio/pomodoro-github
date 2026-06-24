/* ─────────────────────────────────────────────────────
 *  useTimer — Central hook that bridges background
 *  service worker state with the popup React UI.
 *
 *  Architecture: Background is the single source of
 *  truth for timer state. Popup listens via
 *  chrome.storage.onChanged for real-time updates.
 *
 *  RESILIENCE: All chrome.runtime.sendMessage calls
 *  are wrapped in try/catch so UI never breaks.
 * ───────────────────────────────────────────────────── */

import { useEffect, useCallback } from 'react';
import { useTimerStore } from '@/stores/timer-store';
import type { MessageType, MessageResponse, TaskRef, PlayerProgress, SessionType } from '@/types';
import type { Pet } from '@/lib/pet-system';

/* ── Message helper ────────────────────────────────── */

function sendMessage<T = unknown>(msg: MessageType): Promise<MessageResponse<T>> {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(msg, (response: MessageResponse<T>) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response || { success: false, error: 'No response' });
        }
      });
    } catch (err) {
      resolve({ success: false, error: (err as Error).message });
    }
  });
}

/* ── Hook ──────────────────────────────────────────── */

export function useTimer() {
  const store = useTimerStore();

  /* ── State sync from background ──────────────────── */

  const syncState = useCallback(async () => {
    try {
      const response = await sendMessage<Record<string, unknown>>({ type: 'GET_STATE' });

      if (response.success && response.data) {
        const data = response.data;
        if (data.timer) store.setTimerState(data.timer as typeof store.timer);
        if (data.settings) store.setSettings(data.settings as typeof store.settings);
        if (data.todayStats) store.setTodayStats(data.todayStats as typeof store.todayStats);
        if (data.streak) store.setStreak(data.streak as typeof store.streak);
        if (data.syncState) store.setSyncState(data.syncState as typeof store.syncState);
        if (data.progress) store.setProgress(data.progress as PlayerProgress);
        if (data.pet) store.setPet(data.pet as Pet);
      }
    } catch {
      // Background not ready — UI still works with local state
    }
  }, []); // store is stable

  // Initial sync
  useEffect(() => {
    syncState();
  }, [syncState]);

  // Re-sync on focus
  useEffect(() => {
    const handleFocus = () => syncState();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [syncState]);

  // Listen for storage changes from background
  useEffect(() => {
    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string,
    ) => {
      if (area !== 'local') return;

      try {
        if (changes.pomodoro_timer_state) {
          const val = changes.pomodoro_timer_state.newValue;
          if (val) store.setTimerState(val);
        }
        if (changes.pomodoro_daily_stats) {
          const today = new Date().toISOString().split('T')[0];
          const stats = changes.pomodoro_daily_stats.newValue;
          if (stats?.[today]) store.setTodayStats(stats[today]);
        }
        if (changes.pomodoro_streak) {
          const val = changes.pomodoro_streak.newValue;
          if (val) store.setStreak(val);
        }
        if (changes.pomodoro_sync_state) {
          const val = changes.pomodoro_sync_state.newValue;
          if (val) store.setSyncState(val);
        }
        if (changes.pomodoro_progress) {
          const val = changes.pomodoro_progress.newValue;
          if (val) store.setProgress(val);
        }
      } catch {
        // Ignore storage listener errors
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  /* ── Actions (all wrapped in try/catch) ──────────── */

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

  const switchSession = useCallback(async (sessionType: SessionType) => {
    const response = await sendMessage({ type: 'SWITCH_SESSION', sessionType });
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

  const createPet = useCallback(async (species: string, name: string) => {
    const response = await sendMessage({ type: 'CREATE_PET', species, name });
    if (response.success && response.data) {
      store.setPet(response.data as Pet);
    }
    return response.success;
  }, []);

  const feedPet = useCallback(async () => {
    const response = await sendMessage({ type: 'FEED_PET' });
    if (response.success && response.data) {
      store.setPet(response.data as Pet);
    }
    return response.success;
  }, []);

  const playWithPet = useCallback(async () => {
    const response = await sendMessage({ type: 'PLAY_WITH_PET' });
    if (response.success && response.data) {
      store.setPet(response.data as Pet);
    }
    return response.success;
  }, []);

  const petPet = useCallback(async () => {
    const response = await sendMessage({ type: 'PET_PET' });
    if (response.success && response.data) {
      store.setPet(response.data as Pet);
    }
    return response.success;
  }, []);

  return {
    ...store,
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
    switchSession,
    createPet,
    feedPet,
    playWithPet,
    petPet,
  };
}
