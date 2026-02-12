import { ResistanceLevel } from '@/lib/types';

interface ResistanceSelectorProps {
  value: ResistanceLevel;
  onChange: (level: ResistanceLevel) => void;
  disabled: boolean;
}

const levels: { level: ResistanceLevel; label: string }[] = [
  { level: 1, label: 'Low' },
  { level: 2, label: 'Mild' },
  { level: 3, label: 'Medium' },
  { level: 4, label: 'High' },
  { level: 5, label: 'Max' },
];

export function ResistanceSelector({ value, onChange, disabled }: ResistanceSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Resistance Level
      </h3>
      <div className="flex gap-2">
        {levels.map(({ level, label }) => (
          <button
            key={level}
            onClick={() => onChange(level)}
            disabled={disabled}
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg border py-3 transition-all ${
              value === level
                ? 'border-neon/50 bg-neon/10 neon-border'
                : 'border-border bg-card hover:border-muted-foreground/30'
            } ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
          >
            <span className={`font-mono text-lg font-bold ${value === level ? 'neon-text' : 'text-card-foreground'}`}>
              {level}
            </span>
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
