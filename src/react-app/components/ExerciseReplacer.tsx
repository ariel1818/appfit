import { useState, useEffect } from 'react';
import { X, Search, RefreshCw } from 'lucide-react';
import type { Exercise } from '@/shared/types';

interface ExerciseReplacerProps {
  currentExercise: any;
  planExerciseId: number;
  onReplace: (newExerciseId: number) => void;
  onClose: () => void;
}

export default function ExerciseReplacer({ currentExercise, planExerciseId, onReplace, onClose }: ExerciseReplacerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchQuery]);

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/exercises');
      const data = await response.json();
      setExercises(data);
      setFilteredExercises(data.filter((e: Exercise) => 
        e.muscle_group === currentExercise.muscle_group
      ));
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises.filter((e: Exercise) => 
      e.muscle_group === currentExercise.muscle_group
    );

    if (searchQuery) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredExercises(filtered);
  };

  const handleReplace = async (newExerciseId: number) => {
    try {
      const response = await fetch(`/api/replace-exercise/${planExerciseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_exercise_id: newExerciseId })
      });

      if (response.ok) {
        onReplace(newExerciseId);
        onClose();
      }
    } catch (error) {
      console.error('Error replacing exercise:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Substituir Exercício</h2>
              <p className="text-slate-400">Atual: {currentExercise.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar exercícios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <p className="text-sm text-slate-400 mt-2">
            Mostrando exercícios do grupo: <span className="text-indigo-400 font-semibold">{currentExercise.muscle_group}</span>
          </p>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin">
                <RefreshCw className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Nenhum exercício encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExercises.map((exercise) => {
                const currentExerciseId = currentExercise.exercise_id || currentExercise.id;
                const isCurrentExercise = exercise.id === currentExerciseId;
                
                return (
                <button
                  key={exercise.id}
                  onClick={() => handleReplace(exercise.id)}
                  disabled={isCurrentExercise}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    isCurrentExercise
                      ? 'border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed'
                      : 'border-slate-700 bg-slate-800/30 hover:border-indigo-500 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex gap-4">
                    {exercise.image_url && (
                      <img
                        src={exercise.image_url}
                        alt={exercise.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">{exercise.name}</h3>
                      <p className="text-sm text-slate-400 line-clamp-2">{exercise.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full">
                          {exercise.difficulty}
                        </span>
                        {exercise.equipment && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                            {exercise.equipment}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
