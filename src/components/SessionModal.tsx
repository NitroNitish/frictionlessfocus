import { useState } from 'react';
import { QuitReason } from '@/lib/types';
import { TrendingUp, BellOff, Meh, Moon, CheckCircle2, Shield } from 'lucide-react';

interface SessionModalProps {
  isOpen: boolean;
  endType: 'completed' | 'quit';
  onLog: (reason: QuitReason) => void;
}

const reasons: { reason: QuitReason; label: string; icon: React.ElementType }[] = [
  { reason: 'too-hard', label: 'Too hard', icon: TrendingUp },
  { reason: 'distracted', label: 'Distracted', icon: BellOff },
  { reason: 'bored', label: 'Bored', icon: Meh },
  { reason: 'tired', label: 'Tired', icon: Moon },
];

export function SessionModal({ isOpen, endType, onLog }: SessionModalProps) {
  const [selected, setSelected] = useState<QuitReason | null>(
    endType === 'completed' ? 'completed' : null
  );

  if (!isOpen) return null;

  const handleLog = () => {
    if (selected) onLog(selected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-3xl border border-border border-b-0 bg-card px-6 pb-8 pt-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-muted-foreground/30" />

        <h3 className="mb-2 text-center text-2xl font-bold text-card-foreground">
          Why did you stop?
        </h3>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Logging your resistance helps Friction optimize your next session.
        </p>

        {/* 2x2 Reason Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {reasons.map(({ reason, label, icon: Icon }) => (
            <button
              key={reason}
              onClick={() => setSelected(reason)}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border py-5 transition-all ${
                selected === reason
                  ? 'border-neon/50 bg-neon/5'
                  : 'border-border bg-secondary hover:border-muted-foreground/30'
              }`}
            >
              <Icon className={`h-6 w-6 ${selected === reason ? 'text-neon' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium ${selected === reason ? 'text-neon' : 'text-card-foreground'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Completed option */}
        <button
          onClick={() => setSelected('completed')}
          className={`mb-5 flex w-full items-center justify-center gap-2 rounded-2xl border py-4 transition-all ${
            selected === 'completed'
              ? 'border-neon/50 bg-neon/5'
              : 'border-border bg-secondary hover:border-muted-foreground/30'
          }`}
        >
          <CheckCircle2 className={`h-5 w-5 ${selected === 'completed' ? 'text-neon' : 'text-muted-foreground'}`} />
          <span className={`text-sm font-medium ${selected === 'completed' ? 'text-neon' : 'text-card-foreground'}`}>
            Completed the task
          </span>
        </button>

        {/* Log button */}
        <button
          onClick={handleLog}
          disabled={!selected}
          className="mb-3 w-full rounded-2xl bg-neon py-4 font-mono text-base font-bold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-30 neon-glow"
        >
          Log & Continue
        </button>

        {/* Skip */}
        <button
          onClick={() => onLog(endType === 'completed' ? 'completed' : 'distracted')}
          className="w-full py-2 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          Skip for Now
        </button>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-2.5">
          <Shield className="h-3.5 w-3.5 text-neon" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Encrypted Data Session
          </span>
        </div>
      </div>
    </div>
  );
}
