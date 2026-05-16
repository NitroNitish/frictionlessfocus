import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Task,
  StreakData,
  TimerState,
  ResistanceLevel,
  QuitReason,
  RESISTANCE_DURATION_MAP,
  UserProfile,
} from '@/lib/types';
import { storage } from '@/lib/storage';
import { applyAdaptiveLogic, updateStreak } from '@/lib/engine';
import { toast } from 'sonner';

// Simple UUID generator (crypto.randomUUID with fallback)
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

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
  const [userProfile, setUserProfileState] = useState<UserProfile>({
    name: '',
    goal: '',
    isComplete: false,
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load all state from localStorage on mount
  useEffect(() => {
    const state = storage.loadState();
    setTasks(state.tasks);
    setStreakData(state.streakData);
    setUserProfileState(state.userProfile);

    // Restore timer (accounting for elapsed time while app was closed)
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

  // Persist tasks whenever they change
  useEffect(() => { storage.saveTasks(tasks); }, [tasks]);

  // Persist streak data whenever it changes
  useEffect(() => { storage.saveStreakData(streakData); }, [streakData]);

  // Persist timer state whenever it changes
  useEffect(() => { storage.saveTimerState(timerState); }, [timerState]);

  // Persist user profile whenever it changes
  useEffect(() => { storage.saveUserProfile(userProfile); }, [userProfile]);

  const setUserProfile = useCallback((profile: UserProfile) => {
    setUserProfileState(profile);
  }, []);

  const startWithText = useCallback(async (title: string, resistance: ResistanceLevel) => {
    const newTask: Task = {
      id: generateId(),
      title,
      subject: undefined,
      resistanceLevel: resistance,
      status: 'active',
      sessionHistory: [],
      createdAt: new Date().toISOString(),
      currentSessionDuration: RESISTANCE_DURATION_MAP[resistance],
      consecutiveCompletions: 0,
      consecutiveQuits: 0,
      deepMode: false,
    };
    // Add task to state
    setTasks(prev => [...prev, newTask]);
    setSelectedTaskId(newTask.id);
    // Start timer immediately
    const durationSeconds = newTask.currentSessionDuration * 60;
    setTimerState({
      isRunning: true,
      isPaused: false,
      remainingSeconds: durationSeconds,
      totalSeconds: durationSeconds,
      taskId: newTask.id,
      startedAt: new Date().toISOString(),
    });
  }, []);

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
    const newTask: Task = {
      id: generateId(),
      title,
      subject,
      resistanceLevel: 3,
      status: 'active',
      sessionHistory: [],
      createdAt: new Date().toISOString(),
      currentSessionDuration: RESISTANCE_DURATION_MAP[3],
      consecutiveCompletions: 0,
      consecutiveQuits: 0,
      deepMode: false,
    };
    setTasks(prev => [...prev, newTask]);
    return newTask.id;
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    if (timerState.isRunning && timerState.taskId === id) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTaskId === id) setSelectedTaskId(null);
  }, [timerState.isRunning, timerState.taskId, selectedTaskId]);

  const completeTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: 'completed' } : t));
    if (selectedTaskId === id) setSelectedTaskId(null);
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
    const duration = RESISTANCE_DURATION_MAP[level];
    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTaskId
          ? { ...t, resistanceLevel: level, currentSessionDuration: duration }
          : t
      )
    );
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
    if (!timerState.taskId) return;
    const task = tasks.find((t) => t.id === timerState.taskId);
    if (!task) return;

    const actualSeconds = timerState.totalSeconds - timerState.remainingSeconds;
    const actualMinutes = Math.round(actualSeconds / 60);
    const isCompleted = reason === 'completed';

    const newLog = {
      date: new Date().toISOString(),
      plannedDuration: Math.round(timerState.totalSeconds / 60),
      actualDuration: actualMinutes,
      quitReason: reason,
      resistanceLevel: task.resistanceLevel,
    };

    const updatedTaskData = applyAdaptiveLogic(
      { ...task, sessionHistory: [...task.sessionHistory, newLog] },
      isCompleted
    );

    const newStreak = updateStreak(streakData, isCompleted);

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

    toast.success(isCompleted ? 'Session completed! 🎉' : 'Session logged.');
  }, [timerState, tasks, streakData]);

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
    startWithText,
    pauseSession,
    quitSession,
    logSession,
    setShowSessionModal,
    userProfile,
    setUserProfile,
  };
}
