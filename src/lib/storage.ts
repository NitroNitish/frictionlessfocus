import { AppState, StreakData, Task, TimerState, UserProfile } from './types';

const STORAGE_KEYS = {
  tasks: 'friction_tasks',
  streakData: 'friction_streak',
  timerState: 'friction_timer',
  userProfile: 'friction_user_profile',
} as const;

const defaultStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletionDate: null,
};

const defaultTimerState: TimerState = {
  isRunning: false,
  isPaused: false,
  remainingSeconds: 0,
  totalSeconds: 0,
  taskId: null,
  startedAt: null,
};

const defaultUserProfile: UserProfile = {
  name: '',
  goal: '',
  isComplete: false,
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write failed:', e);
  }
}

export const storage = {
  loadState(): AppState {
    return {
      tasks: safeGet<Task[]>(STORAGE_KEYS.tasks, []),
      streakData: safeGet<StreakData>(STORAGE_KEYS.streakData, defaultStreakData),
      timerState: safeGet<TimerState>(STORAGE_KEYS.timerState, defaultTimerState),
      userProfile: safeGet<UserProfile>(STORAGE_KEYS.userProfile, defaultUserProfile),
    };
  },

  saveTasks(tasks: Task[]): void {
    safeSet(STORAGE_KEYS.tasks, tasks);
  },

  saveStreakData(data: StreakData): void {
    safeSet(STORAGE_KEYS.streakData, data);
  },

  saveTimerState(state: TimerState): void {
    safeSet(STORAGE_KEYS.timerState, state);
  },

  saveUserProfile(profile: UserProfile): void {
    safeSet(STORAGE_KEYS.userProfile, profile);
  },
};
