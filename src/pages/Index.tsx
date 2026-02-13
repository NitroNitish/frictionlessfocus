import { useFriction } from '@/hooks/use-friction';
import { FocusScreen } from '@/components/FocusScreen';
import { TimerDisplay } from '@/components/TimerDisplay';
import { SessionModal } from '@/components/SessionModal';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { ProfileSection } from '@/components/ProfileSection';
import { useState } from 'react';
import { LayoutGrid, BarChart3, Clock, User } from 'lucide-react';

type Tab = 'focus' | 'metrics' | 'history' | 'profile';

const Index = () => {
  const friction = useFriction();
  const [activeTab, setActiveTab] = useState<Tab>('focus');
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

  // When timer is running, show the timer screen
  if (friction.timerState.isRunning) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TimerDisplay
          timerState={friction.timerState}
          selectedTask={friction.selectedTask}
          onStart={friction.startSession}
          onPause={friction.pauseSession}
          onQuit={handleQuit}
        />

        <SessionModal
          isOpen={friction.showSessionModal}
          endType={friction.sessionEndType}
          onLog={friction.logSession}
        />

        {showQuitConfirm && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-2xl">
              <p className="mb-1 font-mono text-lg font-bold text-card-foreground">
                Quit this session?
              </p>
              <p className="mb-5 text-sm text-muted-foreground">Your progress will be logged.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowQuitConfirm(false)}
                  className="flex-1 rounded-xl border border-border bg-secondary py-3 font-mono text-sm font-medium text-secondary-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmQuit}
                  className="flex-1 rounded-xl bg-danger py-3 font-mono text-sm font-bold text-destructive-foreground"
                >
                  Quit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'focus' && (
          <FocusScreen
            tasks={friction.tasks}
            selectedTask={friction.selectedTask}
            selectedTaskId={friction.selectedTaskId}
            timerState={friction.timerState}
            streakData={friction.streakData}
            onAddTask={friction.addTask}
            onSelectTask={friction.selectTask}
            onDeselectTask={friction.deselectTask}
            onDeleteTask={friction.deleteTask}
            onSetResistance={friction.setResistance}
            onStart={friction.startSession}
          />
        )}
        {activeTab === 'metrics' && (
          <AnalyticsPanel tasks={friction.tasks} streakData={friction.streakData} />
        )}
        {activeTab === 'history' && (
          <div className="p-5">
            <div className="mb-6">
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neon">History</p>
              <h2 className="mt-1 text-2xl font-bold text-card-foreground">Session Log</h2>
            </div>
            {friction.tasks.flatMap(t => t.sessionHistory.map(s => ({ ...s, taskTitle: t.title }))).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20).map((s, i) => (
              <div key={i} className="mb-2 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground">{s.taskTitle}</span>
                  <span className={`text-xs font-mono font-medium ${s.quitReason === 'completed' ? 'text-neon' : 'text-danger'}`}>
                    {s.quitReason === 'completed' ? 'Completed' : 'Quit'}
                  </span>
                </div>
                <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                  <span>{s.actualDuration}m / {s.plannedDuration}m</span>
                  <span>R{s.resistanceLevel}</span>
                  <span>{new Date(s.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {friction.tasks.flatMap(t => t.sessionHistory).length === 0 && (
              <div className="mt-12 text-center text-muted-foreground">
                <Clock className="mx-auto h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">No sessions yet</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'profile' && (
          <ProfileSection streakData={friction.streakData} tasks={friction.tasks} />
        )}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-border bg-background/95 backdrop-blur-md safe-area-bottom">
        {([
          { tab: 'focus' as Tab, icon: LayoutGrid, label: 'Focus' },
          { tab: 'metrics' as Tab, icon: BarChart3, label: 'Trends' },
          { tab: 'history' as Tab, icon: Clock, label: 'History' },
          { tab: 'profile' as Tab, icon: User, label: 'Profile' },
        ]).map(({ tab, icon: Icon, label }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-mono uppercase tracking-wider transition-colors ${
              activeTab === tab ? 'text-neon' : 'text-muted-foreground'
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </nav>

      {/* Session end modal */}
      <SessionModal
        isOpen={friction.showSessionModal}
        endType={friction.sessionEndType}
        onLog={friction.logSession}
      />
    </div>
  );
};

export default Index;
