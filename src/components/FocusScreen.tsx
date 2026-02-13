import { Task, TimerState, StreakData, ResistanceLevel, RESISTANCE_DURATION_MAP } from '@/lib/types';
import { ResistanceSelector } from './ResistanceSelector';
import { Zap, Flame, ArrowUpRight, ArrowLeft, Trash2 } from 'lucide-react';
import { computeAnalytics } from '@/lib/engine';

interface FocusScreenProps {
  tasks: Task[];
  selectedTask: Task | null;
  selectedTaskId: string | null;
  timerState: TimerState;
  streakData: StreakData;
  onAddTask: (title: string, subject?: string) => void;
  onSelectTask: (id: string) => void;
  onDeselectTask: () => void;
  onDeleteTask: (id: string) => void;
  onSetResistance: (level: ResistanceLevel) => void;
  onStart: () => void;
}

const quotes = [
  '"Resistance is experienced as fear; the degree of fear equates to the strength of Resistance."',
  '"The more important a call to action is, the more Resistance we will feel."',
  '"Start before you\'re ready."',
  '"Do the work."',
];

export function FocusScreen({
  tasks,
  selectedTask,
  selectedTaskId,
  timerState,
  streakData,
  onAddTask,
  onSelectTask,
  onDeselectTask,
  onDeleteTask,
  onSetResistance,
  onStart,
}: FocusScreenProps) {
  const stats = computeAnalytics(tasks, 'day');
  const activeTasks = tasks.filter(t => t.status === 'active');
  const sessionDuration = selectedTask
    ? selectedTask.currentSessionDuration
    : 25;

  const handleTaskInput = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const value = (e.target as HTMLTextAreaElement).value.trim();
      if (value) {
        const id = onAddTask(value);
        (e.target as HTMLTextAreaElement).value = '';
      }
    }
  };

  return (
    <div className="flex flex-col p-5 space-y-5">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-mono text-xl font-bold text-card-foreground tracking-tight">
                FRICTIONLESS
              </h1>
              <p className="text-[10px] font-mono uppercase tracking-widest text-neon">
                Focus
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {streakData.currentStreak > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-neon px-3 py-1.5 font-mono text-xs font-bold text-primary-foreground">
              <Flame className="h-3.5 w-3.5" />
              {streakData.currentStreak} Day Momentum
            </span>
          )}
        </div>
      </header>

      {/* Target Resistance Card - Task Input */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            The Target Resistance
          </h3>
          {selectedTask && (
            <button
              onClick={onDeselectTask}
              className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-mono text-muted-foreground hover:text-card-foreground hover:border-muted-foreground/50 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </button>
          )}
        </div>
        {!selectedTask ? (
          <textarea
            placeholder="What are you avoiding?"
            className="w-full resize-none bg-transparent text-xl font-medium text-card-foreground placeholder:text-muted-foreground/40 outline-none min-h-[80px]"
            onKeyDown={handleTaskInput}
          />
        ) : (
          <p className="text-xl font-medium text-card-foreground mb-2">{selectedTask.title}</p>
        )}
        <div className="mt-3 border-t border-border pt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground italic">
            {selectedTask ? 'Task selected. Set your resistance.' : 'Identify the friction to dissolve it.'}
          </p>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Active tasks quick-select */}
      {activeTasks.length > 0 && !selectedTask && (
        <div className="space-y-1.5">
          {activeTasks.slice(0, 4).map(task => (
            <div
              key={task.id}
              className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
                selectedTaskId === task.id
                  ? 'border-neon/40 bg-neon/5'
                  : 'border-border bg-card hover:border-muted-foreground/30'
              }`}
            >
              <button
                onClick={() => onSelectTask(task.id)}
                className="flex-1 text-left"
              >
                <span className="text-sm font-medium text-card-foreground">{task.title}</span>
                {task.subject && (
                  <span className="ml-2 text-xs text-muted-foreground">{task.subject}</span>
                )}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                className="ml-2 rounded-lg p-1.5 text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Resistance Intensity Slider */}
      {selectedTask && (
        <ResistanceSelector
          value={selectedTask.resistanceLevel}
          onChange={onSetResistance}
          disabled={timerState.isRunning}
        />
      )}

      {/* Session Target + Daily Flow */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Session Target
          </p>
          <p className="mt-2 font-mono text-3xl font-bold text-card-foreground">
            {sessionDuration}:00
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Daily Flow
          </p>
          <p className="mt-2 font-mono text-3xl font-bold text-card-foreground">
            {(stats.totalFocusMinutes / 60).toFixed(1)}h
          </p>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        disabled={!selectedTask}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-neon py-4 font-mono text-base font-bold uppercase tracking-wider text-primary-foreground transition-all hover:opacity-90 disabled:opacity-30 neon-glow"
      >
        <Zap className="h-5 w-5" />
        Start Through Friction
      </button>

      {/* Quote */}
      <p className="text-center text-xs italic text-muted-foreground px-4">
        {quotes[Math.floor(Date.now() / 86400000) % quotes.length]}
      </p>
    </div>
  );
}
