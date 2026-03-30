import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Dumbbell, Calendar, Target, Clock, Repeat, Edit2, History, RefreshCw } from 'lucide-react';
import type { WorkoutPlanWithExercises } from '@/shared/workout-types';
import type { Exercise } from '@/shared/types';
import WorkoutLogger from '@/react-app/components/WorkoutLogger';
import ExerciseModal from '@/react-app/components/ExerciseModal';
import ExerciseReplacer from '@/react-app/components/ExerciseReplacer';

export default function WorkoutPlan() {
  const { profileId } = useParams<{ profileId: string }>();
  const [plan, setPlan] = useState<WorkoutPlanWithExercises | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogger, setShowLogger] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [replacingExercise, setReplacingExercise] = useState<any | null>(null);

  useEffect(() => {
    fetchPlan();
  }, [profileId]);

  const fetchPlan = async () => {
    try {
      const response = await fetch(`/api/workout-plan/${profileId}`);
      const data = await response.json();
      setPlan(data);
      
      if (data.id) {
        fetchWorkoutLogs(data.id);
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkoutLogs = async (planId: number) => {
    try {
      const response = await fetch(`/api/workout-logs/${planId}`);
      const data = await response.json();
      setWorkoutLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleOpenLogger = (dayNumber: number) => {
    setSelectedDay(dayNumber);
    setShowLogger(true);
  };

  const handleSaveLog = () => {
    if (plan?.id) {
      fetchWorkoutLogs(plan.id);
    }
  };

  const handleExerciseClick = async (exerciseId: number) => {
    try {
      const response = await fetch(`/api/exercises/${exerciseId}`);
      const data = await response.json();
      setSelectedExercise(data);
    } catch (error) {
      console.error('Error fetching exercise:', error);
    }
  };

  const handleReplaceClick = (exercise: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setReplacingExercise(exercise);
  };

  const handleExerciseReplaced = () => {
    fetchPlan();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="animate-spin">
          <Dumbbell className="w-12 h-12 text-indigo-400" />
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-300 mb-4">Plano não encontrado</h2>
          <Link to="/workout-builder" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Criar novo plano
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-600/20 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{plan.name}</h1>
              <p className="text-lg text-slate-300">{plan.description}</p>
            </div>
          </div>
        </div>

        {/* Workout History */}
        {workoutLogs.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <History className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">Histórico de Treinos</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workoutLogs.slice(0, 6).map((log: any) => (
                <div key={log.id} className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-indigo-400">Dia {log.day_number}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(log.completed_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{log.exercise_count} exercícios registrados</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training Days */}
        <div className="space-y-6">
          {plan.days.map((day) => {
            const dayExercises = day.exercises;
            return (
              <div key={day.day_number} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-white" />
                    <h2 className="text-2xl font-bold text-white">Dia {day.day_number}</h2>
                  </div>
                  <button
                    onClick={() => handleOpenLogger(day.day_number)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">Registrar</span>
                  </button>
                </div>

              <div className="p-6 space-y-4">
                {dayExercises.map((exercise: any, index) => (
                  <div
                    key={exercise.id}
                    className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-5 hover:border-indigo-500/50 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {index + 1}
                      </div>

                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleExerciseClick(exercise.exercise_id)}
                      >
                        <h3 className="text-xl font-bold text-white hover:text-indigo-400 transition-colors mb-2">
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
                        onClick={(e) => handleReplaceClick(exercise, e)}
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
          );
          })}
        </div>

        {/* Workout Logger Modal */}
        {showLogger && selectedDay && plan && (
          <WorkoutLogger
            planId={plan.id}
            dayNumber={selectedDay}
            exercises={plan.days.find(d => d.day_number === selectedDay)?.exercises || []}
            onSave={handleSaveLog}
            onClose={() => setShowLogger(false)}
          />
        )}

        {/* Exercise Detail Modal */}
        {selectedExercise && (
          <ExerciseModal
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
          />
        )}

        {/* Exercise Replacer Modal */}
        {replacingExercise && (
          <ExerciseReplacer
            currentExercise={replacingExercise}
            planExerciseId={replacingExercise.id}
            onReplace={handleExerciseReplaced}
            onClose={() => setReplacingExercise(null)}
          />
        )}

        {/* Tips */}
        <div className="mt-8 bg-gradient-to-br from-indigo-950/50 to-purple-950/50 backdrop-blur-sm border border-indigo-800/50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-indigo-400" />
            Dicas para Seguir seu Treino
          </h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">•</span>
              <span>Sempre faça um aquecimento de 5-10 minutos antes de começar</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">•</span>
              <span>Mantenha a forma correta em todos os exercícios</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">•</span>
              <span>Aumente o peso progressivamente quando sentir facilidade</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">•</span>
              <span>Respeite os dias de descanso para recuperação muscular</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">•</span>
              <span>Mantenha uma alimentação adequada aos seus objetivos</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
