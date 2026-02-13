import { useState, useEffect } from 'react';
import { User, Target, Sparkles, BookOpen, Plus, X, Pencil, Check } from 'lucide-react';
import { StreakData, Task } from '@/lib/types';

interface ProfileData {
  name: string;
  ultimateGoal: string;
  skills: string[];
  bio: string;
}

const PROFILE_STORAGE_KEY = 'friction_profile';

function loadProfile(): ProfileData {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { name: 'Friction User', ultimateGoal: '', skills: [], bio: '' };
  } catch {
    return { name: 'Friction User', ultimateGoal: '', skills: [], bio: '' };
  }
}

function saveProfile(data: ProfileData) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
}

interface ProfileSectionProps {
  streakData: StreakData;
  tasks: Task[];
}

export function ProfileSection({ streakData, tasks }: ProfileSectionProps) {
  const [profile, setProfile] = useState<ProfileData>(loadProfile);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  const startEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const saveEdit = (field: keyof ProfileData) => {
    setProfile(prev => ({ ...prev, [field]: tempValue }));
    setEditingField(null);
    setTempValue('');
  };

  const addSkill = () => {
    const skill = newSkill.trim();
    if (skill && !profile.skills.includes(skill)) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, skill] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="flex flex-col p-5 space-y-5">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center pt-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card border border-border">
          <User className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="mt-4 flex items-center gap-2">
          {editingField === 'name' ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={tempValue}
                onChange={e => setTempValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveEdit('name')}
                className="bg-transparent border-b border-neon text-lg font-bold text-card-foreground outline-none text-center w-40"
              />
              <button onClick={() => saveEdit('name')} className="text-neon">
                <Check className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => startEdit('name', profile.name)} className="flex items-center gap-2 group">
              <h2 className="text-lg font-bold text-card-foreground">{profile.name}</h2>
              <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Lime Edition</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-mono text-2xl font-bold text-card-foreground">{streakData.currentStreak}</p>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Streak</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-mono text-2xl font-bold text-card-foreground">{tasks.filter(t => t.status === 'active').length}</p>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Active</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-mono text-2xl font-bold text-card-foreground">{tasks.filter(t => t.status === 'completed').length}</p>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Done</p>
        </div>
      </div>

      {/* Ultimate Goal */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-neon" />
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Ultimate Goal
            </h3>
          </div>
          {editingField !== 'ultimateGoal' && (
            <button onClick={() => startEdit('ultimateGoal', profile.ultimateGoal)} className="text-muted-foreground hover:text-card-foreground transition-colors">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {editingField === 'ultimateGoal' ? (
          <div className="space-y-2">
            <textarea
              autoFocus
              value={tempValue}
              onChange={e => setTempValue(e.target.value)}
              placeholder="What's your ultimate goal?"
              className="w-full resize-none bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground/40 outline-none border-b border-neon min-h-[60px] pb-1"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingField(null)} className="px-3 py-1.5 text-xs font-mono text-muted-foreground border border-border rounded-lg">Cancel</button>
              <button onClick={() => saveEdit('ultimateGoal')} className="px-3 py-1.5 text-xs font-mono font-bold text-primary-foreground bg-neon rounded-lg">Save</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-card-foreground">
            {profile.ultimateGoal || <span className="text-muted-foreground/40 italic">Tap to set your ultimate goal...</span>}
          </p>
        )}
      </div>

      {/* Skills */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-neon" />
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Skills
          </h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.skills.map(skill => (
            <span key={skill} className="flex items-center gap-1.5 rounded-full border border-neon/30 bg-neon/5 px-3 py-1.5 text-xs font-mono font-medium text-neon">
              {skill}
              <button onClick={() => removeSkill(skill)} className="hover:text-card-foreground transition-colors">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {profile.skills.length === 0 && (
            <p className="text-xs text-muted-foreground/40 italic">No skills added yet</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            placeholder="Add a skill..."
            className="flex-1 bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground/40 outline-none border-b border-border focus:border-neon transition-colors pb-1"
          />
          <button onClick={addSkill} disabled={!newSkill.trim()} className="text-neon disabled:opacity-30 transition-opacity">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bio / About Me */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-neon" />
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              About Me
            </h3>
          </div>
          {editingField !== 'bio' && (
            <button onClick={() => startEdit('bio', profile.bio)} className="text-muted-foreground hover:text-card-foreground transition-colors">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {editingField === 'bio' ? (
          <div className="space-y-2">
            <textarea
              autoFocus
              value={tempValue}
              onChange={e => setTempValue(e.target.value)}
              placeholder="Tell us about yourself..."
              className="w-full resize-none bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground/40 outline-none border-b border-neon min-h-[80px] pb-1"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingField(null)} className="px-3 py-1.5 text-xs font-mono text-muted-foreground border border-border rounded-lg">Cancel</button>
              <button onClick={() => saveEdit('bio')} className="px-3 py-1.5 text-xs font-mono font-bold text-primary-foreground bg-neon rounded-lg">Save</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-card-foreground">
            {profile.bio || <span className="text-muted-foreground/40 italic">Tap to add your bio...</span>}
          </p>
        )}
      </div>

      <div className="h-4" />
    </div>
  );
}
