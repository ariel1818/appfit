import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Calendar, Target, Clock, Repeat, Save, Sparkles, RefreshCw } from 'lucide-react';
import ExerciseReplacerPreview from '@/react-app/components/ExerciseReplacerPreview';
import type { Exercise } from '@/shared/types';

interface PreviewExercise {
  id: number;
  name: string;
  muscle_group: string;
  equipment: string | null;
  sets: number;
  reps: string;
  rest_seconds: number | null;
}

interface PreviewDay {
  day_number: number;
  exercises: PreviewExercise[];
}

interface WorkoutPreviewData {
  profile: {
    experience_level: string;
    primary_goal: string;
    training_days: number;
  };
  plan: {
    name: string;
    description: string;
  };
  days: PreviewDay[];
}

export default function WorkoutPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [preview, setPreview] = useState<WorkoutPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [replacingExercise, setReplacingExercise] = useState<{
    dayIndex: number;
    exerciseIndex: number;
    exercise: PreviewExercise;
  } | null>(null);

  useEffect(() => {
    if (location.state?.preview) {
      setPreview(location.state.preview);
      setLoading(false);
    } else {
      navigate('/workout-builder');
    }
  }, [location, navigate]);

  const handleReplaceClick = (dayIndex: number, exerciseIndex: number, exercise: PreviewExercise, e: React.MouseEvent) => {
    e.stopPropagation();
    setReplacingExercise({ dayIndex, exerciseIndex, exercise });
  };

  const handleExerciseReplaced = (newExercise: Exercise) => {
    if (!preview || !replacingExercise) return;

    const updatedPreview = { ...preview };
    const { dayIndex, exerciseIndex } = replacingExercise;
    
    // Keep the same sets, reps, and rest_seconds
    const oldExercise = updatedPreview.days[dayIndex].exercises[exerciseIndex];
    
    updatedPreview.days[dayIndex].exercises[exerciseIndex] = {
      id: newExercise.id,
      name: newExercise.name,
      muscle_group: newExercise.muscle_group,
      equipment: newExercise.equipment,
      sets: oldExercise.sets,
      reps: oldExercise.reps,
      rest_seconds: oldExercise.rest_seconds
    };

    setPreview(updatedPreview);
    setReplacingExercise(null);
  };

  const handleSave = async () => {
    if (!preview) return;

    setSaving(true);
    try {
      const response = await fetch('/api/workout-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preview)
      });

      const data = await response.json();
      navigate(`/workout-plan/${data.profile.id}`);
    } catch (error) {
      console.error('Error saving plan:', error);
      setSaving(false);
    }
  };

  if (loading || !preview) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="animate-spin">
          <Sparkles className="w-12 h-12 text-indigo-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/workout-builder')}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-600/20 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{preview.plan.name}</h1>
                <p className="text-lg text-slate-300">{preview.plan.description}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-4 py-3">
            <Sparkles className="w-5 h-5" />
            <span>Prévia do seu treino personalizado - você pode substituir exercícios antes de salvar</span>
          </div>
        </div>

        {/* Training Days Preview */}
        <div className="space-y-6 mb-8">
          {preview.days.map((day, dayIndex) => (
            <div key={day.day_number} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Dia {day.day_number}</h2>
                <span className="ml-auto text-sm text-white/80">{day.exercises.length} exercícios</span>
              </div>

              <div className="p-6 space-y-4">
                {day.exercises.map((exercise, exerciseIndex) => (
                  <div
                    key={`${dayIndex}-${exerciseIndex}`}
                    className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-5 hover:border-indigo-500/50 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {exerciseIndex + 1}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {exercise.name}
                        </h3>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Repeat className="w-4 h-4 text-indigo-400" />
                            <span className="font-semibold">{exercise.sets}</span> séries
                          </div>
                          <div className="flex items-center gap-2 text-slate-300">
                            <Target className="w-4 h-4 text-purple-400" />
                            <span className="font-semibold">{exercise.reps}</span> repetições
                          </div>
                          {exercise.rest_seconds && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <Clock className="w-4 h-4 text-pink-400" />
                              <span className="font-semibold">{exercise.rest_seconds}s</span> descanso
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
                            {exercise.muscle_group}
                          </span>
                          {exercise.equipment && (
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-full border border-purple-500/30">
                              {exercise.equipment}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleReplaceClick(dayIndex, exerciseIndex, exercise, e)}
                        className="flex-shrink-0 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors group"
                        title="Substituir exercício"
                      >
                        <RefreshCw className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="sticky bottom-6 z-10">
          <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {saving ? (
                <>
                  <Save className="w-6 h-6 animate-pulse" />
                  Salvando treino...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  Salvar Treino
                </>
              )}
            </button>
          </div>
        </div>

        {/* Exercise Replacer Modal */}
        {replacingExercise && (
          <ExerciseReplacerPreview
            currentExercise={replacingExercise.exercise}
            onReplace={handleExerciseReplaced}
            onClose={() => setReplacingExercise(null)}
          />
        )}
      </div>
    </div>
  );
}
