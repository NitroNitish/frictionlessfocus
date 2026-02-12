import { Task, StreakData } from '@/lib/types';
import { computeAnalytics } from '@/lib/engine';
import { Flame, Target, Clock, TrendingDown, Brain, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface AnalyticsPanelProps {
  tasks: Task[];
  streakData: StreakData;
}

export function AnalyticsPanel({ tasks, streakData }: AnalyticsPanelProps) {
  const stats = computeAnalytics(tasks);

  const cards = [
    {
      icon: Target,
      label: 'Discipline Score',
      value: `${stats.disciplineScore}%`,
      sub: `${stats.completedSessions}/${stats.totalSessions} sessions`,
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: `${streakData.currentStreak}`,
      sub: `Best: ${streakData.longestStreak}`,
    },
    {
      icon: Clock,
      label: 'Focus This Week',
      value: `${stats.totalFocusMinutes}m`,
      sub: `${stats.totalSessions} sessions`,
    },
    {
      icon: TrendingDown,
      label: 'Avg Quit Time',
      value: `${stats.avgQuitTime}m`,
      sub: stats.mostAvoidedTask ? `Most avoided: ${stats.mostAvoidedTask}` : 'No quits',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-neon" />
        <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Analytics
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-card p-3"
          >
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <card.icon className="h-3 w-3" />
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {card.label}
              </span>
            </div>
            <p className="mt-1 font-mono text-xl font-bold text-card-foreground">
              {card.value}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Resistance Trend */}
      {stats.resistanceTrend.some((d) => d.avg > 0) && (
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
            <Brain className="h-3 w-3" />
            <span className="text-[10px] font-medium uppercase tracking-wider">
              Resistance Trend (7 days)
            </span>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={stats.resistanceTrend}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: 'hsl(0 0% 50%)' }}
                tickFormatter={(v) => v.slice(5)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis domain={[0, 5]} hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(0 0% 7%)',
                  border: '1px solid hsl(0 0% 16%)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: 'hsl(0 0% 90%)',
                }}
              />
              <Line
                type="monotone"
                dataKey="avg"
                stroke="hsl(80 100% 50%)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'hsl(80 100% 50%)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
