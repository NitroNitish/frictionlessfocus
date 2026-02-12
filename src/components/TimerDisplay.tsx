import { TimerState, Task } from '@/lib/types';
import { getAdaptiveMessage } from '@/lib/engine';
import { Pause, Play, X } from 'lucide-react';

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
    ? ((timerState.totalSeconds - timerState.remainingSeconds) / timerState.totalSeconds)
    : 0;

  const adaptiveMsg = selectedTask ? getAdaptiveMessage(selectedTask) : null;

  // SVG circle parameters
  const size = 280;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-1 flex-col items-center justify-between p-5">
      {/* Header */}
      <div className="flex w-full items-center justify-between pt-2">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Friction Session
        </h2>
        <div className="h-6 w-6 rounded border border-border flex items-center justify-center">
          <div className="h-3 w-0.5 bg-muted-foreground rounded-full" />
        </div>
      </div>

      {/* Timer ring */}
      <div className="flex flex-col items-center gap-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Time Left to Escape
        </p>
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(0 0% 16%)"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(80 100% 50%)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
              style={{
                filter: 'drop-shadow(0 0 8px hsl(80 100% 50% / 0.4))',
              }}
            />
          </svg>
          {/* Timer text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-6xl font-bold text-card-foreground tracking-tight">
              {formatTime(timerState.remainingSeconds)}
            </span>
          </div>
        </div>

        {/* Adaptive message */}
        <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
          {adaptiveMsg || 'Stay with it.'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 pb-8 w-full">
        <button
          onClick={onPause}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-surface-hover"
        >
          {timerState.isPaused ? (
            <Play className="h-5 w-5 text-card-foreground" />
          ) : (
            <Pause className="h-5 w-5 text-card-foreground" />
          )}
        </button>
        <button
          onClick={onQuit}
          className="w-full max-w-xs rounded-xl border border-border bg-transparent py-3 font-mono text-sm font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:bg-card"
        >
          Quit Session
        </button>
      </div>
    </div>
  );
}
