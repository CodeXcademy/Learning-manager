import { useState, useRef, useEffect, useCallback } from 'react';
import { FocusPreferences, FocusSession } from '../store/localDataStore';

export interface FocusTimerState {
  mode: 'work' | 'shortBreak' | 'longBreak';
  cycle: number;
  isRunning: boolean;
  remainingMs: number;
  totalMs: number;
}

export function useFocusTimer(
  preferences: FocusPreferences,
  activeSession: FocusSession | undefined,
  onSessionComplete: (session: FocusSession) => void
) {
  // ===== ALL STATE DECLARATIONS FIRST (Hook order stability) =====
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>(activeSession?.mode || 'work');
  const [cycle, setCycle] = useState<number>(activeSession?.cycle || 1);
  const [isRunning, setIsRunning] = useState<boolean>(!!activeSession && !activeSession.pausedAt);
  const [totalMs, setTotalMs] = useState<number>(activeSession?.remainingMs ?? 25 * 60 * 1000);
  const [remainingMs, setRemainingMs] = useState<number>(activeSession?.remainingMs ?? 25 * 60 * 1000);

  // ===== ALL REFS =====
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const modeRef = useRef<'work' | 'shortBreak' | 'longBreak'>(mode);
  const cycleRef = useRef<number>(cycle);
  const totalMsRef = useRef<number>(totalMs);
  const onSessionCompleteRef = useRef(onSessionComplete);

  // ===== ALL CALLBACKS (after state, before effects) =====
  const getSessionDuration = useCallback((nextMode: 'work' | 'shortBreak' | 'longBreak') => {
    if (nextMode === 'work') return preferences.workMinutes * 60 * 1000;
    if (nextMode === 'shortBreak') return preferences.shortBreakMinutes * 60 * 1000;
    return preferences.longBreakMinutes * 60 * 1000;
  }, [preferences]);

  const tick = useCallback(() => {
    if (!endTimeRef.current) return;

    const now = Date.now();
    const left = Math.max(0, endTimeRef.current - now);
    setRemainingMs(left);

    // Session complete
    if (left <= 0) {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRunning(false);

      const completeSession: FocusSession = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        mode: modeRef.current,
        durationMinutes: totalMsRef.current / 60000,
        startedAt: new Date(now - totalMsRef.current).toISOString(),
        remainingMs: 0,
        cycle: cycleRef.current,
        completed: true,
      };

      onSessionCompleteRef.current(completeSession);
      endTimeRef.current = null;
    }
  }, []);

  const start = useCallback((startMode: 'work' | 'shortBreak' | 'longBreak' = 'work', startCycle = 1) => {
    const duration = getSessionDuration(startMode);
    setMode(startMode);
    setCycle(startCycle);
    setTotalMs(duration);
    setRemainingMs(duration);
    setIsRunning(true);
    endTimeRef.current = Date.now() + duration;
  }, [getSessionDuration]);

  const pause = useCallback(() => {
    setIsRunning(false);
    endTimeRef.current = null;
  }, []);

  const resume = useCallback(() => {
    if (remainingMs <= 0) return;
    setIsRunning(true);
    endTimeRef.current = Date.now() + remainingMs;
  }, [remainingMs]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setMode('work');
    setCycle(1);
    const defaultDuration = getSessionDuration('work');
    setTotalMs(defaultDuration);
    setRemainingMs(defaultDuration);
    endTimeRef.current = null;
  }, [getSessionDuration]);

  // ===== ALL EFFECTS (after state and callbacks) =====

  // Keep refs in sync with state
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    cycleRef.current = cycle;
  }, [cycle]);

  useEffect(() => {
    totalMsRef.current = totalMs;
  }, [totalMs]);

  useEffect(() => {
    onSessionCompleteRef.current = onSessionComplete;
  }, [onSessionComplete]);

  // Setup interval based on isRunning
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      endTimeRef.current = null;
      return;
    }

    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(tick, 250);

    return () => {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, tick]);

  // Sync when activeSession changes
  useEffect(() => {
    if (activeSession) {
      const duration = activeSession.remainingMs ?? getSessionDuration(activeSession.mode);
      setMode(activeSession.mode);
      setCycle(activeSession.cycle);
      setTotalMs(duration);
      setRemainingMs(activeSession.remainingMs ?? duration);
      setIsRunning(!activeSession.pausedAt);
      endTimeRef.current = !activeSession.pausedAt ? Date.now() + (activeSession.remainingMs ?? duration) : null;
    }
  }, [activeSession, getSessionDuration]);

  // Resync when page becomes visible
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning && endTimeRef.current) {
        const now = Date.now();
        setRemainingMs(Math.max(0, endTimeRef.current - now));
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [isRunning]);

  const progress = totalMs > 0 ? Math.max(0, Math.min(1, 1 - remainingMs / totalMs)) : 0;

  return {
    mode,
    cycle,
    isRunning,
    remainingMs,
    totalMs,
    progress,
    start,
    pause,
    resume,
    stop,
  };
}
