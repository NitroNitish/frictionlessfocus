import { useState } from 'react';
import { Task } from '@/lib/types';
import { Plus, Trash2, Check, Zap } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: string | null;
  isTimerRunning: boolean;
  onAdd: (title: string, subject?: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

export function TaskList({
  tasks,
  selectedTaskId,
  isTimerRunning,
  onAdd,
  onSelect,
  onDelete,
  onComplete,
}: TaskListProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAdd(newTitle.trim(), newSubject.trim() || undefined);
    setNewTitle('');
    setNewSubject('');
    setShowForm(false);
  };

  const activeTasks = tasks.filter((t) => t.status === 'active');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Tasks
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={isTimerRunning}
          className="flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-surface-hover disabled:opacity-40"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      {showForm && (
        <div className="space-y-2 rounded-lg border border-border bg-card p-3">
          <input
            type="text"
            placeholder="Task title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="w-full rounded-md bg-secondary px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-neon"
            autoFocus
          />
          <input
            type="text"
            placeholder="Subject (optional)"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="w-full rounded-md bg-secondary px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-neon"
          />
          <button
            onClick={handleAdd}
            disabled={!newTitle.trim()}
            className="w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-40"
          >
            Create Task
          </button>
        </div>
      )}

      <div className="space-y-1.5">
        {activeTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => !isTimerRunning && onSelect(task.id)}
            className={`group flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all ${
              selectedTaskId === task.id
                ? 'border-neon/40 bg-neon/5 neon-border'
                : 'border-border bg-card hover:border-muted-foreground/30'
            } ${isTimerRunning ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {task.deepMode && <Zap className="h-3 w-3 text-neon" />}
                <span className="truncate text-sm font-medium text-card-foreground">
                  {task.title}
                </span>
              </div>
              {task.subject && (
                <span className="text-xs text-muted-foreground">{task.subject}</span>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}
                className="rounded p-1 text-success hover:bg-success/10"
                title="Complete"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                className="rounded p-1 text-danger hover:bg-danger/10"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {completedTasks.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-1">
            {completedTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-2 opacity-50"
              >
                <span className="truncate text-xs text-muted-foreground line-through">
                  {task.title}
                </span>
                <button
                  onClick={() => onDelete(task.id)}
                  className="rounded p-1 text-muted-foreground hover:text-danger"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTasks.length === 0 && !showForm && (
        <div className="rounded-lg border border-dashed border-border py-8 text-center">
          <p className="text-sm text-muted-foreground">No tasks yet</p>
          <p className="text-xs text-muted-foreground/60">Add a task to begin</p>
        </div>
      )}
    </div>
  );
}
