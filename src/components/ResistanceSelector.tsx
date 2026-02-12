import { ResistanceLevel } from '@/lib/types';

interface ResistanceSelectorProps {
  value: ResistanceLevel;
  onChange: (level: ResistanceLevel) => void;
  disabled: boolean;
}

export function ResistanceSelector({ value, onChange, disabled }: ResistanceSelectorProps) {
  const percentage = ((value - 1) / 4) * 100;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Resistance Intensity
        </h3>
        <div className="flex items-baseline gap-0.5">
          <span className="font-mono text-3xl font-bold text-neon">{value}</span>
          <span className="font-mono text-sm text-muted-foreground">/ 5</span>
        </div>
      </div>

      {/* Gradient slider */}
      <div className="relative mb-4">
        <div className="h-2 w-full rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(to right, hsl(80 100% 50%), hsl(55 100% 50%), hsl(30 100% 50%), hsl(0 72% 51%))',
          }}
        />
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) as ResistanceLevel)}
          disabled={disabled}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          style={{ margin: 0 }}
        />
        {/* Thumb indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-card-foreground border-2 border-card shadow-lg pointer-events-none transition-all"
          style={{ left: `${percentage}%`, transform: `translate(-50%, -50%)` }}
        />
      </div>

      <div className="flex justify-between">
        <div>
          <p className="font-mono text-xs font-semibold text-neon">LOW</p>
          <p className="text-[10px] text-muted-foreground">Flow</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs font-semibold text-danger">HIGH</p>
          <p className="text-[10px] text-muted-foreground">Wall</p>
        </div>
      </div>
    </div>
  );
}
