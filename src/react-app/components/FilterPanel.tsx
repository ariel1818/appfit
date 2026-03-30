import { X, SlidersHorizontal } from 'lucide-react';

interface FilterPanelProps {
  muscleGroups: string[];
  difficulties: string[];
  selectedMuscleGroup: string;
  selectedDifficulty: string;
  onMuscleGroupChange: (group: string) => void;
  onDifficultyChange: (difficulty: string) => void;
  onClear: () => void;
}

export default function FilterPanel({
  muscleGroups,
  difficulties,
  selectedMuscleGroup,
  selectedDifficulty,
  onMuscleGroupChange,
  onDifficultyChange,
  onClear
}: FilterPanelProps) {
  const hasActiveFilters = selectedMuscleGroup || selectedDifficulty;

  return (
    <div className="mb-10 glass-dark rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-500/10 rounded-lg">
            <SlidersHorizontal className="w-5 h-5 text-brand-400" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-bold text-white font-display">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 rounded-lg transition-all"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
            Limpar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Muscle Groups */}
        {muscleGroups.length > 0 && (
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-4 font-display">
              Grupo Muscular
            </label>
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map((group) => (
                <button
                  key={group}
                  onClick={() => onMuscleGroupChange(selectedMuscleGroup === group ? '' : group)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    selectedMuscleGroup === group
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty */}
        {difficulties.length > 0 && (
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-4 font-display">
              Nível de Dificuldade
            </label>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((difficulty) => {
                const getDifficultyGradient = (diff: string) => {
                  switch (diff) {
                    case 'Iniciante':
                      return 'from-green-500 to-emerald-600';
                    case 'Intermediário':
                      return 'from-yellow-500 to-orange-600';
                    case 'Avançado':
                      return 'from-red-500 to-rose-600';
                    default:
                      return 'from-slate-500 to-slate-600';
                  }
                };

                return (
                  <button
                    key={difficulty}
                    onClick={() => onDifficultyChange(selectedDifficulty === difficulty ? '' : difficulty)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      selectedDifficulty === difficulty
                        ? `bg-gradient-to-r ${getDifficultyGradient(difficulty)} text-white shadow-lg`
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                    }`}
                  >
                    {difficulty}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
