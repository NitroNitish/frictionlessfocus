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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartTimeRef = useRef<number>(0);

  // Load state from localStorage
  useEffect(() => {
    const state = storage.loadState();
    setTasks(state.tasks);
    setStreakData(state.streakData);
    // Restore timer if was running
    if (state.timerState.isRunning && state.timerState.startedAt) {
      const elapsed = Math.floor((Date.now() - new Date(state.timerState.startedAt).getTime()) / 1000);
      const remaining = Math.max(0, state.timerState.remainingSeconds - elapsed);
      if (remaining > 0) {
        setTimerState({ ...state.timerState, remainingSeconds: remaining });
        setSelectedTaskId(state.timerState.taskId);
      } else {
        // Timer expired while away
        setTimerState({ isRunning: false, isPaused: false, remainingSeconds: 0, totalSeconds: state.timerState.totalSeconds, taskId: state.timerState.taskId, startedAt: null });
        setSelectedTaskId(state.timerState.taskId);
        setSessionEndType('completed');
        setShowSessionModal(true);
      }
    }
  }, []);

  // Persist state
  useEffect(() => { storage.saveTasks(tasks); }, [tasks]);
  useEffect(() => { storage.saveStreakData(streakData); }, [streakData]);
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

  const addTask = useCallback((title: string, subject?: string) => {
    const task: Task = {
      id: crypto.randomUUID(),
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
    setTasks((prev) => [...prev, task]);
    return task.id;
  }, []);

  const deleteTask = useCallback((id: string) => {
    if (timerState.isRunning && timerState.taskId === id) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTaskId === id) setSelectedTaskId(null);
  }, [timerState, selectedTaskId]);

  const completeTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: 'completed' as const } : t));
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

  const setResistance = useCallback((level: ResistanceLevel) => {
    if (!selectedTaskId || timerState.isRunning) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTaskId
          ? { ...t, resistanceLevel: level, currentSessionDuration: RESISTANCE_DURATION_MAP[level] }
          : t
      )
    );
  }, [selectedTaskId, timerState.isRunning]);

  const startSession = useCallback(() => {
    if (!selectedTaskId || timerState.isRunning) return;
    const task = tasks.find((t) => t.id === selectedTaskId);
    if (!task) return;
    const durationSeconds = task.currentSessionDuration * 60;
    sessionStartTimeRef.current = Date.now();
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

  const logSession = useCallback((reason: QuitReason) => {
    if (!timerState.taskId) return;
    const task = tasks.find((t) => t.id === timerState.taskId);
    if (!task) return;

    const actualSeconds = timerState.totalSeconds - timerState.remainingSeconds;
    const actualMinutes = Math.round(actualSeconds / 60);

    const log: SessionLog = {
      date: new Date().toISOString(),
      plannedDuration: Math.round(timerState.totalSeconds / 60),
      actualDuration: actualMinutes,
      quitReason: reason,
      resistanceLevel: task.resistanceLevel,
    };

    const isCompleted = reason === 'completed';
    const updatedTask = applyAdaptiveLogic(
      { ...task, sessionHistory: [...task.sessionHistory, log] },
      isCompleted
    );

    setTasks((prev) => prev.map((t) => (t.id === timerState.taskId ? updatedTask : t)));
    setStreakData((prev) => updateStreak(prev, isCompleted));
    setTimerState({
      isRunning: false,
      isPaused: false,
      remainingSeconds: 0,
      totalSeconds: 0,
      taskId: null,
      startedAt: null,
    });
    setShowSessionModal(false);
  }, [timerState, tasks]);

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
  };
}
