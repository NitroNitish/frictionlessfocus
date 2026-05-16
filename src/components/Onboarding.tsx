import { useState } from 'react';
import { Zap, Target } from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && goal.trim()) {
      onComplete({
        name: name.trim(),
        goal: goal.trim(),
        isComplete: true,
      });
    }
  };

  const isFormValid = name.trim().length > 0 && goal.trim().length > 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-border bg-card p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neon/10 text-neon">
            <Zap className="h-8 w-8" />
          </div>
          <h1 className="font-mono text-3xl font-bold tracking-tight text-card-foreground">
            FRICTION
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A new start for your hesitation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-card-foreground">
              What should we call you?
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="goal" className="text-sm font-medium text-card-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              What is your primary goal?
            </label>
            <textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Finish my side project, Study for finals..."
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-neon py-4 font-mono text-base font-bold uppercase tracking-wider text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
          >
            Enter App
          </button>
        </form>
      </div>
    </div>
  );
}
