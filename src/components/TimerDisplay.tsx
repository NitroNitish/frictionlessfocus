import { TimerState, Task } from '@/lib/types';
import { getAdaptiveMessage } from '@/lib/engine';
import { Play, Pause, X, Zap } from 'lucide-react';

interface TimerDisplayProps {
  timerState: TimerState;
  selectedTask: Task | null;
  onStart: () => void;
  onPause: () => void;
  onQuit: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function TimerDisplay({
  timerState,
  selectedTask,
  onStart,
  onPause,
  onQuit,
}: TimerDisplayProps) {
  const progress = timerState.totalSeconds > 0
    ? ((timerState.totalSeconds - timerState.remainingSeconds) / timerState.totalSeconds) * 100
    : 0;

  const adaptiveMsg = selectedTask ? getAdaptiveMessage(selectedTask) : null;

  if (!selectedTask) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="font-mono text-6xl font-bold text-muted-foreground/20 sm:text-8xl">
          00:00
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Select a task to begin</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Adaptive message */}
      {adaptiveMsg && (
        <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium ${
          selectedTask.deepMode
            ? 'bg-neon/10 text-neon neon-border'
            : 'bg-warning/10 text-warning border border-warning/20'
        }`}>
          {selectedTask.deepMode && <Zap className="h-3 w-3" />}
          {adaptiveMsg}
        </div>
      )}

      {/* Timer */}
      <div className="relative">
        <div className={`font-mono text-7xl font-bold tracking-tight sm:text-9xl ${
          timerState.isRunning ? 'neon-text countdown-pulse' : 'text-card-foreground'
        }`}>
          {timerState.isRunning
            ? formatTime(timerState.remainingSeconds)
            : formatTime(selectedTask.currentSessionDuration * 60)}
        </div>
        {timerState.isRunning && (
          <p className="mt-2 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Time left to escape
          </p>
        )}
      </div>

      {/* Progress bar */}
      {timerState.isRunning && (
        <div className="w-full max-w-xs">
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-neon transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Task info */}
      <div className="text-center">
        <p className="text-sm font-medium text-card-foreground">{selectedTask.title}</p>
        <p className="text-xs text-muted-foreground">
          {selectedTask.currentSessionDuration} min · Resistance {selectedTask.resistanceLevel}
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!timerState.isRunning ? (
          <button
            onClick={onStart}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-mono text-sm font-bold text-primary-foreground transition-all hover:opacity-90 neon-glow"
          >
            <Play className="h-4 w-4" />
            Start Session
          </button>
        ) : (
          <>
            <button
              onClick={onPause}
              className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-6 py-3 font-mono text-sm font-medium text-secondary-foreground transition-colors hover:bg-surface-hover"
            >
              <Pause className="h-4 w-4" />
              {timerState.isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={onQuit}
              className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-6 py-3 font-mono text-sm font-medium text-danger transition-colors hover:bg-danger/20"
            >
              <X className="h-4 w-4" />
              Quit
            </button>
          </>
        )}
      </div>
    </div>
  );
}
