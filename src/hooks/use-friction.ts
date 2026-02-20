import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Task,
  StreakData,
  TimerState,
  ResistanceLevel,
  QuitReason,
  SessionLog,
  RESISTANCE_DURATION_MAP,
} from '@/lib/types';
import { storage } from '@/lib/storage';
import { applyAdaptiveLogic, updateStreak } from '@/lib/engine';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useFriction() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastCompletionDate: null,
  });
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    remainingSeconds: 0,
    totalSeconds: 0,
    taskId: null,
    startedAt: null,
  });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionEndType, setSessionEndType] = useState<'completed' | 'quit'>('completed');
  const [user, setUser] = useState<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auth & Initial Load
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        await fetchUserData(session.user.id);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setTasks([]);
        setStreakData({ currentStreak: 0, longestStreak: 0, lastCompletionDate: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile for streaks
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        setStreakData({
          currentStreak: profile.current_streak,
          longestStreak: profile.longest_streak,
          lastCompletionDate: profile.last_completion_date,
        });
      }

      // Fetch tasks and their history
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select('*, session_history(*)')
        .eq('user_id', userId);

      if (error) throw error;

      if (tasksData) {
        const formattedTasks: Task[] = tasksData.map(t => ({
          id: t.id,
          title: t.title,
          subject: t.subject,
          resistanceLevel: t.resistance_level as ResistanceLevel,
          status: t.status as 'active' | 'completed',
          sessionHistory: t.session_history.map((s: any) => ({
            date: s.date,
            plannedDuration: s.planned_duration,
            actualDuration: s.actual_duration,
            quitReason: s.quit_reason as QuitReason,
            resistanceLevel: t.resistance_level as ResistanceLevel
          })),
          createdAt: t.created_at,
          currentSessionDuration: t.current_session_duration,
          consecutiveCompletions: t.consecutive_completions,
          consecutiveQuits: t.consecutive_quits,
          deepMode: t.deep_mode,
        }));
        setTasks(formattedTasks);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // Restore timer from localStorage (still useful for session persistence across refreshes)
  useEffect(() => {
    const state = storage.loadState();
    if (state.timerState.isRunning && state.timerState.startedAt) {
      const elapsed = Math.floor((Date.now() - new Date(state.timerState.startedAt).getTime()) / 1000);
      const remaining = Math.max(0, state.timerState.remainingSeconds - elapsed);
      if (remaining > 0) {
        setTimerState({ ...state.timerState, remainingSeconds: remaining });
        setSelectedTaskId(state.timerState.taskId);
      } else {
        setTimerState({ ...state.timerState, isRunning: false, remainingSeconds: 0 });
        setSelectedTaskId(state.timerState.taskId);
        setSessionEndType('completed');
        setShowSessionModal(true);
      }
    }
  }, []);

  // Persist timer state only
  useEffect(() => { storage.saveTimerState(timerState); }, [timerState]);

  // Timer tick
  useEffect(() => {
    if (timerState.isRunning && !timerState.isPaused) {
      timerRef.current = setInterval(() => {
        setTimerState((prev) => {
          if (prev.remainingSeconds <= 1) {
            clearInterval(timerRef.current!);
            setSessionEndType('completed');
            setShowSessionModal(true);
            return { ...prev, remainingSeconds: 0, isRunning: false };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState.isRunning, timerState.isPaused]);

  const addTask = useCallback(async (title: string, subject?: string) => {
    if (!user) return;
    const newTask = {
      user_id: user.id,
      title,
      subject,
      resistance_level: 3,
      current_session_duration: RESISTANCE_DURATION_MAP[3],
    };

    try {
      const { data, error } = await supabase.from('tasks').insert(newTask).select().single();
      if (error) throw error;

      const formatted: Task = {
        id: data.id,
        title: data.title,
        subject: data.subject,
        resistanceLevel: data.resistance_level,
        status: data.status,
        sessionHistory: [],
        createdAt: data.created_at,
        currentSessionDuration: data.current_session_duration,
        consecutiveCompletions: data.consecutive_completions,
        consecutiveQuits: data.consecutive_quits,
        deepMode: data.deep_mode,
      };

      setTasks(prev => [...prev, formatted]);
      return formatted.id;
    } catch (err) {
      toast.error('Failed to add task');
      console.error(err);
    }
  }, [user]);

  const deleteTask = useCallback(async (id: string) => {
    if (timerState.isRunning && timerState.taskId === id) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (selectedTaskId === id) setSelectedTaskId(null);
    } catch (err) {
      toast.error('Failed to delete task');
    }
  }, [timerState.isRunning, timerState.taskId, selectedTaskId]);

  const completeTask = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('tasks').update({ status: 'completed' }).eq('id', id);
      if (error) throw error;
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: 'completed' } : t));
      if (selectedTaskId === id) setSelectedTaskId(null);
    } catch (err) {
      toast.error('Failed to complete task');
    }
  }, [selectedTaskId]);

  const selectTask = useCallback((id: string) => {
    if (timerState.isRunning) return;
    setSelectedTaskId(id);
  }, [timerState.isRunning]);

  const deselectTask = useCallback(() => {
    if (timerState.isRunning) return;
    setSelectedTaskId(null);
  }, [timerState.isRunning]);

  const setResistance = useCallback(async (level: ResistanceLevel) => {
    if (!selectedTaskId || timerState.isRunning) return;
    try {
      const duration = RESISTANCE_DURATION_MAP[level];
      const { error } = await supabase.from('tasks').update({
        resistance_level: level,
        current_session_duration: duration
      }).eq('id', selectedTaskId);

      if (error) throw error;

      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTaskId
            ? { ...t, resistanceLevel: level, currentSessionDuration: duration }
            : t
        )
      );
    } catch (err) {
      toast.error('Failed to update resistance');
    }
  }, [selectedTaskId, timerState.isRunning]);

  const startSession = useCallback(() => {
    if (!selectedTaskId || timerState.isRunning) return;
    const task = tasks.find((t) => t.id === selectedTaskId);
    if (!task) return;
    const durationSeconds = task.currentSessionDuration * 60;
    setTimerState({
      isRunning: true,
      isPaused: false,
      remainingSeconds: durationSeconds,
      totalSeconds: durationSeconds,
      taskId: selectedTaskId,
      startedAt: new Date().toISOString(),
    });
  }, [selectedTaskId, timerState.isRunning, tasks]);

  const pauseSession = useCallback(() => {
    setTimerState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const quitSession = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerState((prev) => ({ ...prev, isRunning: false, isPaused: false }));
    setSessionEndType('quit');
    setShowSessionModal(true);
  }, []);

  const logSession = useCallback(async (reason: QuitReason) => {
    if (!timerState.taskId || !user) return;
    const task = tasks.find((t) => t.id === timerState.taskId);
    if (!task) return;

    const actualSeconds = timerState.totalSeconds - timerState.remainingSeconds;
    const actualMinutes = Math.round(actualSeconds / 60);
    const isCompleted = reason === 'completed';

    try {
      // 1. Log session
      const { error: sessionError } = await supabase.from('session_history').insert({
        task_id: task.id,
        planned_duration: Math.round(timerState.totalSeconds / 60),
        actual_duration: actualMinutes,
        quit_reason: reason,
      });

      if (sessionError) throw sessionError;

      // 2. Update task logic
      const updatedTaskData = applyAdaptiveLogic(
        {
          ...task, sessionHistory: [...task.sessionHistory, {
            date: new Date().toISOString(),
            plannedDuration: Math.round(timerState.totalSeconds / 60),
            actualDuration: actualMinutes,
            quitReason: reason,
            resistanceLevel: task.resistanceLevel
          }]
        },
        isCompleted
      );

      const { error: taskError } = await supabase.from('tasks').update({
        current_session_duration: updatedTaskData.currentSessionDuration,
        consecutive_completions: updatedTaskData.consecutiveCompletions,
        consecutive_quits: updatedTaskData.consecutiveQuits,
        deep_mode: updatedTaskData.deepMode,
      }).eq('id', task.id);

      if (taskError) throw taskError;

      // 3. Update profile streaks
      const newStreak = updateStreak(streakData, isCompleted);
      const { error: profileError } = await supabase.from('profiles').update({
        current_streak: newStreak.currentStreak,
        longest_streak: newStreak.longestStreak,
        last_completion_date: newStreak.lastCompletionDate,
      }).eq('id', user.id);

      if (profileError) throw profileError;

      // Update local state
      setTasks((prev) => prev.map((t) => (t.id === timerState.taskId ? updatedTaskData : t)));
      setStreakData(newStreak);
      setTimerState({
        isRunning: false,
        isPaused: false,
        remainingSeconds: 0,
        totalSeconds: 0,
        taskId: null,
        startedAt: null,
      });
      setShowSessionModal(false);
    } catch (err) {
      toast.error('Failed to log session');
      console.error(err);
    }
  }, [timerState, tasks, user, streakData]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  return {
    tasks,
    selectedTask,
    selectedTaskId,
    timerState,
    streakData,
    showSessionModal,
    sessionEndType,
    addTask,
    deleteTask,
    completeTask,
    selectTask,
    deselectTask,
    setResistance,
    startSession,
    pauseSession,
    quitSession,
    logSession,
    setShowSessionModal,
    logout,
  };
}
