import {
  Task,
  SessionLog,
  StreakData,
  MAX_SESSION_DURATION,
  MIN_SESSION_DURATION,
  DEEP_MODE_BONUS,
  SESSION_INCREMENT,
  SESSION_DECREMENT,
  CONSECUTIVE_COMPLETIONS_FOR_DEEP,
  CONSECUTIVE_QUITS_FOR_RESET,
} from './types';

export function applyAdaptiveLogic(task: Task, sessionCompleted: boolean): Task {
  const updated = { ...task };

  if (sessionCompleted) {
    updated.consecutiveCompletions += 1;
    updated.consecutiveQuits = 0;
    updated.currentSessionDuration = Math.min(
      updated.currentSessionDuration + SESSION_INCREMENT,
      MAX_SESSION_DURATION
    );

    if (updated.consecutiveCompletions >= CONSECUTIVE_COMPLETIONS_FOR_DEEP && !updated.deepMode) {
      updated.deepMode = true;
      updated.currentSessionDuration = Math.min(
        updated.currentSessionDuration + DEEP_MODE_BONUS,
        MAX_SESSION_DURATION
      );
    }
  } else {
    updated.consecutiveQuits += 1;
    updated.consecutiveCompletions = 0;
    updated.deepMode = false;
    updated.currentSessionDuration = Math.max(
      updated.currentSessionDuration - SESSION_DECREMENT,
      MIN_SESSION_DURATION
    );

    if (updated.consecutiveQuits >= CONSECUTIVE_QUITS_FOR_RESET) {
      updated.currentSessionDuration = MIN_SESSION_DURATION;
    }
  }

  return updated;
}

export function getAdaptiveMessage(task: Task): string | null {
  if (task.consecutiveQuits >= CONSECUTIVE_QUITS_FOR_RESET) {
    return 'Reduce the friction.';
  }
  if (task.deepMode) {
    return 'Deep Mode activated. You\'re in the zone.';
  }
  return null;
}

export type AnalyticsPeriod = 'day' | 'week' | 'month';

export function computeAnalytics(tasks: Task[], period: AnalyticsPeriod = 'week') {
  const now = new Date();
  let periodStart: Date;
  let periodDays: number;

  switch (period) {
    case 'day':
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      periodDays = 1;
      break;
    case 'month':
      periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      periodDays = 30;
      break;
    case 'week':
    default:
      periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      periodDays = 7;
      break;
  }

  const allSessions = tasks.flatMap((t) =>
    t.sessionHistory.map((s) => ({ ...s, taskId: t.id, taskTitle: t.title }))
  );

  const periodSessions = allSessions.filter(
    (s) => new Date(s.date) >= periodStart
  );

  const completedPeriod = periodSessions.filter(
    (s) => s.quitReason === 'completed'
  );
  const disciplineScore =
    periodSessions.length > 0
      ? Math.round((completedPeriod.length / periodSessions.length) * 100)
      : 0;

  const quitSessions = periodSessions.filter(
    (s) => s.quitReason && s.quitReason !== 'completed'
  );
  const avgQuitTime =
    quitSessions.length > 0
      ? Math.round(
          quitSessions.reduce((sum, s) => sum + s.actualDuration, 0) /
            quitSessions.length
        )
      : 0;

  // Most avoided task
  const quitsByTask: Record<string, { count: number; title: string }> = {};
  for (const s of allSessions) {
    if (s.quitReason && s.quitReason !== 'completed') {
      if (!quitsByTask[s.taskId]) {
        quitsByTask[s.taskId] = { count: 0, title: s.taskTitle };
      }
      quitsByTask[s.taskId].count++;
    }
  }
  const mostAvoided = Object.values(quitsByTask).sort(
    (a, b) => b.count - a.count
  )[0];

  const totalFocusMinutes = periodSessions.reduce(
    (sum, s) => sum + s.actualDuration,
    0
  );

  // Resistance trend
  const trendDays = Math.min(periodDays, 30);
  const resistanceTrend: { date: string; avg: number }[] = [];
  for (let i = trendDays - 1; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStr = day.toISOString().split('T')[0];
    const daySessions = allSessions.filter(
      (s) => s.date.split('T')[0] === dayStr
    );
    const avg =
      daySessions.length > 0
        ? daySessions.reduce((sum, s) => sum + s.resistanceLevel, 0) /
          daySessions.length
        : 0;
    resistanceTrend.push({ date: dayStr, avg: Math.round(avg * 10) / 10 });
  }

  return {
    disciplineScore,
    avgQuitTime,
    mostAvoidedTask: mostAvoided?.title || null,
    mostAvoidedCount: mostAvoided?.count || 0,
    totalFocusMinutes,
    resistanceTrend,
    totalSessions: periodSessions.length,
    completedSessions: completedPeriod.length,
  };
}

export function updateStreak(
  streakData: StreakData,
  sessionCompleted: boolean
): StreakData {
  if (!sessionCompleted) return streakData;

  const today = new Date().toISOString().split('T')[0];
  const updated = { ...streakData };

  if (updated.lastCompletionDate === today) {
    return updated; // Already counted today
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (updated.lastCompletionDate === yesterday || !updated.lastCompletionDate) {
    updated.currentStreak += 1;
  } else {
    updated.currentStreak = 1;
  }

  updated.longestStreak = Math.max(updated.longestStreak, updated.currentStreak);
  updated.lastCompletionDate = today;

  return updated;
}
