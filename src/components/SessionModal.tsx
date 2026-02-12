import { QuitReason, QUIT_REASON_LABELS } from '@/lib/types';

interface SessionModalProps {
  isOpen: boolean;
  endType: 'completed' | 'quit';
  onLog: (reason: QuitReason) => void;
}

const quitReasons: QuitReason[] = ['completed', 'too-hard', 'distracted', 'bored', 'tired'];

export function SessionModal({ isOpen, endType, onLog }: SessionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <h3 className="mb-1 font-mono text-lg font-bold text-card-foreground">
          {endType === 'completed' ? 'Session Complete' : 'Session Ended'}
        </h3>
        <p className="mb-5 text-sm text-muted-foreground">Why did you stop?</p>

        <div className="space-y-2">
          {quitReasons.map((reason) => (
            <button
              key={reason}
              onClick={() => onLog(reason)}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all ${
                reason === 'completed'
                  ? 'border-neon/30 bg-neon/5 text-neon hover:bg-neon/10'
                  : 'border-border bg-secondary text-secondary-foreground hover:bg-surface-hover'
              }`}
            >
              {QUIT_REASON_LABELS[reason]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
