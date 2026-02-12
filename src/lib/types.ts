// Core types for the Friction app

export interface SessionLog {
  date: string;
  plannedDuration: number;
  actualDuration: number;
  quitReason: QuitReason | null;
  resistanceLevel: ResistanceLevel;
}

export type ResistanceLevel = 1 | 2 | 3 | 4 | 5;

export type QuitReason = 'completed' | 'too-hard' | 'distracted' | 'bored' | 'tired';

export type TaskStatus = 'active' | 'completed';

export interface Task {
  id: string;
  title: string;
  subject?: string;
  resistanceLevel: ResistanceLevel;
  status: TaskStatus;
  sessionHistory: SessionLog[];
  createdAt: string;
  currentSessionDuration: number;
  consecutiveCompletions: number;
  consecutiveQuits: number;
  deepMode: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  taskId: string | null;
  startedAt: string | null;
}

export interface AppState {
  tasks: Task[];
  streakData: StreakData;
  timerState: TimerState;
}

export const RESISTANCE_DURATION_MAP: Record<ResistanceLevel, number> = {
  5: 5,
  4: 8,
  3: 12,
  2: 18,
  1: 25,
};

export const QUIT_REASON_LABELS: Record<QuitReason, string> = {
  'completed': 'Completed',
  'too-hard': 'Too hard',
  'distracted': 'Distracted',
  'bored': 'Bored',
  'tired': 'Tired',
};

export const MAX_SESSION_DURATION = 45;
export const MIN_SESSION_DURATION = 5;
export const DEEP_MODE_BONUS = 5;
export const SESSION_INCREMENT = 2;
export const SESSION_DECREMENT = 2;
export const CONSECUTIVE_COMPLETIONS_FOR_DEEP = 3;
export const CONSECUTIVE_QUITS_FOR_RESET = 2;
