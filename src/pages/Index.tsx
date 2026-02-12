import { useFriction } from '@/hooks/use-friction';
import { TaskList } from '@/components/TaskList';
import { ResistanceSelector } from '@/components/ResistanceSelector';
import { TimerDisplay } from '@/components/TimerDisplay';
import { SessionModal } from '@/components/SessionModal';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { useState } from 'react';
import { BarChart3, Timer, ListTodo } from 'lucide-react';

type Tab = 'timer' | 'tasks' | 'analytics';

const Index = () => {
  const friction = useFriction();
  const [activeTab, setActiveTab] = useState<Tab>('timer');
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const handleQuit = () => {
    if (friction.timerState.isRunning) {
      setShowQuitConfirm(true);
    }
  };

  const confirmQuit = () => {
    setShowQuitConfirm(false);
    friction.quitSession();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <h1 className="font-mono text-lg font-bold neon-text tracking-tight">
          FRICTION
        </h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {friction.streakData.currentStreak > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-neon/10 px-2.5 py-1 font-mono text-neon">
              🔥 {friction.streakData.currentStreak}
            </span>
          )}
        </div>
      </header>

      {/* Desktop layout */}
      <div className="hidden flex-1 md:flex">
        {/* Left panel: Tasks */}
        <aside className="w-80 shrink-0 overflow-y-auto border-r border-border p-4">
          <TaskList
            tasks={friction.tasks}
            selectedTaskId={friction.selectedTaskId}
            isTimerRunning={friction.timerState.isRunning}
            onAdd={friction.addTask}
            onSelect={friction.selectTask}
            onDelete={friction.deleteTask}
            onComplete={friction.completeTask}
          />
        </aside>

        {/* Center: Timer */}
        <main className="flex flex-1 flex-col items-center justify-center p-6">
          {friction.selectedTask && !friction.timerState.isRunning && (
            <div className="mb-8 w-full max-w-md">
              <ResistanceSelector
                value={friction.selectedTask.resistanceLevel}
                onChange={friction.setResistance}
                disabled={friction.timerState.isRunning}
              />
            </div>
          )}
          <TimerDisplay
            timerState={friction.timerState}
            selectedTask={friction.selectedTask}
            onStart={friction.startSession}
            onPause={friction.pauseSession}
            onQuit={handleQuit}
          />
        </main>

        {/* Right panel: Analytics */}
        <aside className="w-80 shrink-0 overflow-y-auto border-l border-border p-4">
          <AnalyticsPanel tasks={friction.tasks} streakData={friction.streakData} />
        </aside>
      </div>

      {/* Mobile layout */}
      <div className="flex flex-1 flex-col md:hidden">
        <main className="flex-1 overflow-y-auto p-4">
          {activeTab === 'timer' && (
            <div className="flex flex-col items-center justify-center py-6">
              {friction.selectedTask && !friction.timerState.isRunning && (
                <div className="mb-6 w-full">
                  <ResistanceSelector
                    value={friction.selectedTask.resistanceLevel}
                    onChange={friction.setResistance}
                    disabled={friction.timerState.isRunning}
                  />
                </div>
              )}
              <TimerDisplay
                timerState={friction.timerState}
                selectedTask={friction.selectedTask}
                onStart={friction.startSession}
                onPause={friction.pauseSession}
                onQuit={handleQuit}
              />
            </div>
          )}
          {activeTab === 'tasks' && (
            <TaskList
              tasks={friction.tasks}
              selectedTaskId={friction.selectedTaskId}
              isTimerRunning={friction.timerState.isRunning}
              onAdd={friction.addTask}
              onSelect={friction.selectTask}
              onDelete={friction.deleteTask}
              onComplete={friction.completeTask}
            />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsPanel tasks={friction.tasks} streakData={friction.streakData} />
          )}
        </main>

        {/* Mobile tab bar */}
        <nav className="flex border-t border-border bg-card">
          {([
            { tab: 'tasks' as Tab, icon: ListTodo, label: 'Tasks' },
            { tab: 'timer' as Tab, icon: Timer, label: 'Timer' },
            { tab: 'analytics' as Tab, icon: BarChart3, label: 'Stats' },
          ]).map(({ tab, icon: Icon, label }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
                activeTab === tab ? 'text-neon' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Session end modal */}
      <SessionModal
        isOpen={friction.showSessionModal}
        endType={friction.sessionEndType}
        onLog={friction.logSession}
      />

      {/* Quit confirmation */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-xs rounded-2xl border border-border bg-card p-5 text-center shadow-2xl">
            <p className="mb-4 text-sm font-medium text-card-foreground">
              Quit this session?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 rounded-lg border border-border bg-secondary py-2 text-sm text-secondary-foreground"
              >
                Cancel
              </button>
              <button
                onClick={confirmQuit}
                className="flex-1 rounded-lg bg-danger py-2 text-sm font-medium text-destructive-foreground"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
