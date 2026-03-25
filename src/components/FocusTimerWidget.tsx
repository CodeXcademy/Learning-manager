import { useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useData } from '../store/DataContext';
import { useFocusTimer } from '../hooks/useFocusTimer';

const formatTime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export function FocusTimerWidget() {
  const {
    focusState,
    setFocusState,
    startFocusSession,
    pauseFocusSession,
    stopFocusSession,
    logFocusSession,
  } = useData();

  // Memoized session complete handler to avoid stale references
  const handleSessionComplete = useCallback((session: any) => {
    logFocusSession(session);
  }, [logFocusSession]);

  const {
    isRunning,
    remainingMs,
    totalMs,
    progress,
    start,
    pause,
    resume,
    stop,
  } = useFocusTimer(focusState.preferences, focusState.activeSession, handleSessionComplete);

  // Persist timer state to context every 500ms
  useEffect(() => {
    const persistInterval = setInterval(() => {
      if (focusState.activeSession) {
        setFocusState(prev => ({
          ...prev,
          activeSession: prev.activeSession ? {
            ...prev.activeSession,
            remainingMs,
            pausedAt: isRunning ? undefined : (prev.activeSession.pausedAt || new Date().toISOString()),
          } : undefined,
        }));
      }
    }, 500);

    return () => clearInterval(persistInterval);
  }, [focusState.activeSession, remainingMs, isRunning, setFocusState]);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(95vw,18rem)] rounded-2xl border border-outline-variant/20 bg-surface-container-highest p-4 shadow-2xl backdrop-blur-md">
      {/* Timer Display */}
      <div className="text-center mb-4">
        <p className="text-3xl font-black text-primary tabular-nums">{formatTime(remainingMs)}</p>
        <p className="text-xs text-on-surface-variant mt-1 uppercase tracking-wider">
          {isRunning ? '▼ Running' : '⏸ Paused'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full rounded-full bg-surface-container border border-outline-variant/20 overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary-container transition-all duration-100"
          style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (isRunning) {
              pause();
              pauseFocusSession();
            } else {
              if (!focusState.activeSession) {
                startFocusSession('work');
                start('work', 1);
              } else {
                resume();
              }
            }
          }}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-outline-variant/20 text-sm font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>

        <button
          onClick={() => {
            stop();
            stopFocusSession();
          }}
          className="inline-flex items-center justify-center p-2 rounded-lg border border-outline-variant/20 text-sm font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Session Counter */}
      <div className="mt-3 text-center text-xs text-on-surface-variant">
        {focusState.sessions.length} session{focusState.sessions.length !== 1 ? 's' : ''} completed
      </div>
    </div>
  );
}
