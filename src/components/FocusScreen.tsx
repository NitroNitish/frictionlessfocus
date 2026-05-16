import { useState } from 'react';
import { Task, TimerState, StreakData, ResistanceLevel, RESISTANCE_DURATION_MAP } from '@/lib/types';
import { ResistanceSelector } from './ResistanceSelector';
import { Zap, Flame, Trash2 } from 'lucide-react';
import { computeAnalytics } from '@/lib/engine';

interface FocusScreenProps {
  tasks: Task[];
  selectedTask: Task | null;
  selectedTaskId: string | null;
  timerState: TimerState;
  streakData: StreakData;
  onAddTask: (title: string, subject?: string) => Promise<string | undefined>;
  onSelectTask: (id: string) => void;
  onDeselectTask: () => void;
  onDeleteTask: (id: string) => void;
  onSetResistance: (level: ResistanceLevel) => void;
  onStart: () => void;
  onStartWithText: (title: string, resistance: ResistanceLevel) => void;
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
  onStartWithText,
}: FocusScreenProps) {
  const [inputValue, setInputValue] = useState('');
  const [localResistance, setLocalResistance] = useState<ResistanceLevel>(3);

  const stats = computeAnalytics(tasks, 'day');
  const activeTasks = tasks.filter(t => t.status === 'active');

  // Determine the session duration to display
  const sessionDuration = selectedTask
    ? selectedTask.currentSessionDuration
    : RESISTANCE_DURATION_MAP[localResistance];

  // User is currently composing a new task via the text area
  const isTyping = inputValue.trim().length > 0;

  // Can start if either: typing new text, or an existing task is selected
  const canStart = isTyping || !!selectedTask;

  const handleStart = () => {
    if (isTyping) {
      // Create task inline and start immediately
      onStartWithText(inputValue.trim(), localResistance);
      setInputValue('');
    } else if (selectedTask) {
      onStart();
    }
  };

  const handleResistanceChange = (level: ResistanceLevel) => {
    setLocalResistance(level);
    if (selectedTask) {
      onSetResistance(level);
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
                FRICTION
              </h1>
              <p className="text-[10px] font-mono uppercase tracking-widest text-neon">
                Lime Edition
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

      {/* Target Resistance Card */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          The Target Resistance
        </h3>

        {/* If a saved task is selected, show it with a deselect option */}
        {selectedTask && !isTyping ? (
          <div>
            <p className="text-xl font-medium text-card-foreground mb-1">{selectedTask.title}</p>
            <button
              onClick={onDeselectTask}
              className="text-xs font-mono text-muted-foreground underline hover:text-card-foreground transition-colors"
            >
              Change task
            </button>
          </div>
        ) : (
          <textarea
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
              // If user starts typing, deselect any previously selected task
              if (e.target.value && selectedTask) onDeselectTask();
            }}
            placeholder="What are you avoiding?"
            rows={2}
            className="w-full resize-none bg-transparent text-xl font-medium text-card-foreground placeholder:text-muted-foreground/40 outline-none"
          />
        )}

        <div className="mt-3 border-t border-border pt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground italic">
            {canStart ? 'Set your resistance, then start.' : 'Identify the friction to dissolve it.'}
          </p>
        </div>
      </div>

      {/* Resistance Intensity — always visible */}
      <ResistanceSelector
        value={selectedTask ? selectedTask.resistanceLevel : localResistance}
        onChange={handleResistanceChange}
        disabled={timerState.isRunning}
      />

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
        onClick={handleStart}
        disabled={!canStart}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-neon py-4 font-mono text-base font-bold uppercase tracking-wider text-primary-foreground transition-all hover:opacity-90 disabled:opacity-30 neon-glow"
      >
        <Zap className="h-5 w-5" />
        Start Through Friction
      </button>

      {/* Saved task quick-select (only when not typing) */}
      {!isTyping && activeTasks.length > 0 && (
        <div className="space-y-1.5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-1">
            Recent Tasks
          </p>
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

      {/* Quote */}
      <p className="text-center text-xs italic text-muted-foreground px-4 pb-2">
        {quotes[Math.floor(Date.now() / 86400000) % quotes.length]}
      </p>
    </div>
  );
}
