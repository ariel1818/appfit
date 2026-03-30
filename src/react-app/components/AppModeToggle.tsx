import { Dumbbell, Apple } from 'lucide-react';

interface AppModeToggleProps {
  mode: 'workout' | 'nutrition';
  onChange: (mode: 'workout' | 'nutrition') => void;
}

export default function AppModeToggle({ mode, onChange }: AppModeToggleProps) {
  return (
    <div className="fixed top-6 right-6 z-50 animate-fade-in">
      <div className="glass-dark rounded-xl p-1.5 flex items-center gap-1 shadow-xl">
        <button
          onClick={() => onChange('workout')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-lg font-bold text-sm transition-all duration-200 ${
            mode === 'workout'
              ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Dumbbell className="w-4 h-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Treino</span>
        </button>
        <button
          onClick={() => onChange('nutrition')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-lg font-bold text-sm transition-all duration-200 ${
            mode === 'nutrition'
              ? 'bg-gradient-to-r from-success-500 to-emerald-600 text-white shadow-lg shadow-success-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Apple className="w-4 h-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Nutrição</span>
        </button>
      </div>
    </div>
  );
}
