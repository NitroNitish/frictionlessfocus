import { useState } from 'react';
import { Task, StreakData } from '@/lib/types';
import { computeAnalytics, AnalyticsPeriod } from '@/lib/engine';
import { Clock, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface AnalyticsPanelProps {
  tasks: Task[];
  streakData: StreakData;
}

const periods: { key: AnalyticsPeriod; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

export function AnalyticsPanel({ tasks, streakData }: AnalyticsPanelProps) {
  const [activePeriod, setActivePeriod] = useState<AnalyticsPeriod>('week');
  const stats = computeAnalytics(tasks, activePeriod);

  // SVG donut for discipline score
  const scoreSize = 200;
  const scoreStroke = 10;
  const scoreRadius = (scoreSize - scoreStroke) / 2;
  const scoreCircumference = 2 * Math.PI * scoreRadius;
  const scoreOffset = scoreCircumference * (1 - stats.disciplineScore / 100);

  // Generate resistance matrix
  const matrixDays = activePeriod === 'day' ? 1 : activePeriod === 'week' ? 7 : 30;
  const matrixData: number[][] = [];
  const now = new Date();
  for (let day = matrixDays - 1; day >= 0; day--) {
    const d = new Date(now.getTime() - day * 86400000);
    const dayStr = d.toISOString().split('T')[0];
    const daySessions = tasks.flatMap(t => t.sessionHistory).filter(s => s.date.split('T')[0] === dayStr);
    const row: number[] = [];
    for (let slot = 0; slot < 4; slot++) {
      const slotSessions = daySessions.filter(s => {
        const h = new Date(s.date).getHours();
        return h >= slot * 6 && h < (slot + 1) * 6;
      });
      const avg = slotSessions.length > 0
        ? slotSessions.reduce((sum, s) => sum + s.resistanceLevel, 0) / slotSessions.length
        : 0;
      row.push(avg);
    }
    matrixData.push(row);
  }

  const getMatrixColor = (val: number) => {
    if (val === 0) return 'hsl(0 0% 12%)';
    if (val <= 1.5) return 'hsl(80 40% 20%)';
    if (val <= 2.5) return 'hsl(80 60% 30%)';
    if (val <= 3.5) return 'hsl(70 80% 40%)';
    if (val <= 4.5) return 'hsl(60 100% 45%)';
    return 'hsl(80 100% 50%)';
  };

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neon">Analytics</p>
        <h2 className="mt-1 text-2xl font-bold text-card-foreground">Behavioral Dashboard</h2>
      </div>

      {/* Period tabs */}
      <div className="flex rounded-xl border border-border bg-card overflow-hidden">
        {periods.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActivePeriod(key)}
            className={`flex-1 py-2.5 font-mono text-xs font-medium uppercase tracking-wider transition-colors ${
              activePeriod === key
                ? 'bg-neon text-primary-foreground font-bold'
                : 'text-muted-foreground hover:text-card-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Discipline Score Ring */}
      <div className="flex flex-col items-center py-4">
        <div className="relative">
          <svg width={scoreSize} height={scoreSize} className="transform -rotate-90">
            <circle cx={scoreSize / 2} cy={scoreSize / 2} r={scoreRadius} fill="none" stroke="hsl(0 0% 12%)" strokeWidth={scoreStroke} />
            <circle cx={scoreSize / 2} cy={scoreSize / 2} r={scoreRadius} fill="none" stroke="hsl(80 100% 50%)" strokeWidth={scoreStroke} strokeLinecap="round" strokeDasharray={scoreCircumference} strokeDashoffset={scoreOffset} style={{ filter: 'drop-shadow(0 0 8px hsl(80 100% 50% / 0.4))' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-5xl font-bold text-card-foreground">{stats.disciplineScore}</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Discipline Score</span>
          </div>
        </div>
        {stats.totalSessions > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-neon" />
            <p className="text-sm text-muted-foreground">
              Current consistency <span className="font-semibold text-neon">{stats.completedSessions}/{stats.totalSessions} sessions</span>
            </p>
          </div>
        )}
      </div>

      {/* Resistance Matrix */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Resistance Matrix</h3>
          <span className="rounded border border-neon/30 px-2 py-0.5 font-mono text-[10px] font-semibold text-neon uppercase">Active</span>
        </div>
        <div className={`grid gap-1.5 ${activePeriod === 'month' ? 'grid-cols-10' : 'grid-cols-7'}`}>
          {matrixData.map((row, dayIdx) =>
            row.map((val, slotIdx) => (
              <div key={`${dayIdx}-${slotIdx}`} className="aspect-square rounded-sm" style={{ backgroundColor: getMatrixColor(val) }} />
            ))
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Low Friction</span>
          <div className="flex gap-1">
            {[0, 1.5, 3, 4.5].map((v, i) => (
              <div key={i} className="h-3 w-3 rounded-sm" style={{ backgroundColor: getMatrixColor(v) }} />
            ))}
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">High Resistance</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <Clock className="h-5 w-5 text-muted-foreground mb-2" />
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Avg Quit Time</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono text-3xl font-bold text-card-foreground">{stats.avgQuitTime}</span>
            <span className="font-mono text-xs text-muted-foreground">MIN</span>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <AlertTriangle className="h-5 w-5 text-muted-foreground mb-2" />
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Most Avoided</p>
          <p className="mt-1 text-lg font-bold text-card-foreground truncate">{stats.mostAvoidedTask || '—'}</p>
          {stats.mostAvoidedCount > 0 && (
            <p className="font-mono text-[10px] font-semibold text-neon">+{stats.mostAvoidedCount} quits</p>
          )}
        </div>
      </div>

      {/* Resistance Trend */}
      {stats.resistanceTrend.some(d => d.avg > 0) && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Resistance Trend</h3>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-neon" />
              <span className="font-mono text-[10px] text-muted-foreground capitalize">{activePeriod}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={stats.resistanceTrend}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: 'hsl(0 0% 50%)' }}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  if (activePeriod === 'day') return `${d.getHours()}:00`;
                  return ['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()];
                }}
                axisLine={false}
                tickLine={false}
                interval={activePeriod === 'month' ? 6 : 0}
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
              <Line type="monotone" dataKey="avg" stroke="hsl(80 100% 50%)" strokeWidth={2} dot={{ r: 3, fill: 'hsl(80 100% 50%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
