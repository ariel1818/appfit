import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Dumbbell, TrendingUp, Calendar, Plus, Save, X } from 'lucide-react';

interface WorkoutProfile {
  id: number;
  experience_level: string;
  primary_goal: string;
  training_days: number;
}

interface WorkoutPlan {
  id: number;
  profile_id: number;
  name: string;
  description: string | null;
  profile: WorkoutProfile;
}

interface ExerciseWithHistory {
  id: number;
  exercise_id: number;
  name: string;
  muscle_group: string;
  day_number: number;
  sets: number;
  reps: string;
  history: Array<{
    log_id: number;
    date: string;
    weight_kg: number | null;
    reps_completed: string;
    notes: string;
  }>;
}

export default function MyLoads() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [exercises, setExercises] = useState<ExerciseWithHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseWithHistory | null>(null);
  const [newLog, setNewLog] = useState({ weight: '', reps: '', notes: '' });

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (selectedPlanId) {
      fetchExerciseHistory(selectedPlanId);
    }
  }, [selectedPlanId]);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/my-workouts');
      const data = await response.json();
      setPlans(data);
      if (data.length > 0) {
        setSelectedPlanId(data[0].profile_id);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExerciseHistory = async (profileId: number) => {
    try {
      const response = await fetch(`/api/exercise-history/${profileId}`);
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercise history:', error);
    }
  };

  const openLogModal = (exercise: ExerciseWithHistory) => {
    setSelectedExercise(exercise);
    setLogModalOpen(true);
    setNewLog({ weight: '', reps: '', notes: '' });
  };

  const closeLogModal = () => {
    setLogModalOpen(false);
    setSelectedExercise(null);
    setNewLog({ weight: '', reps: '', notes: '' });
  };

  const saveLog = async () => {
    if (!selectedExercise || !selectedPlanId) return;

    const plan = plans.find(p => p.profile_id === selectedPlanId);
    if (!plan) return;

    try {
      const response = await fetch('/api/workout-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: plan.id,
          day_number: selectedExercise.day_number,
          exercises: [{
            plan_exercise_id: selectedExercise.id,
            weight_kg: newLog.weight ? parseFloat(newLog.weight) : null,
            reps_completed: newLog.reps,
            notes: newLog.notes
          }]
        })
      });

      if (response.ok) {
        closeLogModal();
        fetchExerciseHistory(selectedPlanId);
      }
    } catch (error) {
      console.error('Error saving log:', error);
    }
  };

  const deleteLog = async (exerciseId: number, logIndex: number) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise || !exercise.history[logIndex]) return;

    if (!confirm('Tem certeza que deseja excluir este registro?')) return;

    try {
      const logToDelete = exercise.history[logIndex];
      
      const response = await fetch(`/api/workout-log-exercise/${logToDelete.log_id}/${exerciseId}`, {
        method: 'DELETE'
      });

      if (response.ok && selectedPlanId) {
        fetchExerciseHistory(selectedPlanId);
      }
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  };

  const selectedPlan = plans.find(p => p.profile_id === selectedPlanId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="animate-spin">
          <Dumbbell className="w-12 h-12 text-indigo-400" />
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Voltar
          </Link>

          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/50 rounded-full mb-4">
              <Dumbbell className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              Nenhum treino encontrado
            </h3>
            <p className="text-slate-400 mb-6">
              Crie um treino personalizado para começar a registrar suas cargas
            </p>
            <Link
              to="/workout-builder"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105 transition-all"
            >
              Criar Treino
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Minhas Cargas</h1>
          <p className="text-xl text-slate-300">
            Registre e acompanhe a evolução dos seus exercícios
          </p>
        </div>

        {/* Plan Selector */}
        {plans.length > 1 && (
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Selecione o Treino
            </label>
            <select
              value={selectedPlanId || ''}
              onChange={(e) => setSelectedPlanId(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {plans.map((plan) => (
                <option key={plan.profile_id} value={plan.profile_id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Current Plan Info */}
        {selectedPlan && (
          <div className="bg-gradient-to-r from-indigo-500/20 to-purple-600/20 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{selectedPlan.name}</h2>
            <p className="text-slate-300">{selectedPlan.description}</p>
          </div>
        )}

        {/* Exercises List */}
        <div className="space-y-4">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
                      <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full">
                        Dia {exercise.day_number}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      {exercise.muscle_group} • {exercise.sets} séries × {exercise.reps} reps
                    </p>
                  </div>
                  <button
                    onClick={() => openLogModal(exercise)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 hover:scale-105 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar
                  </button>
                </div>

                {/* History */}
                {exercise.history.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Últimos Registros
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {exercise.history.slice(0, 6).map((log, index) => (
                        <div
                          key={index}
                          className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 relative group"
                        >
                          <button
                            onClick={() => deleteLog(exercise.id, index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Excluir registro"
                          >
                            <X className="w-3.5 h-3.5 text-red-400" />
                          </button>
                          
                          <div className="flex items-center justify-between mb-2 pr-6">
                            <span className="text-xs text-slate-500">
                              {new Date(log.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {log.weight_kg && (
                              <p className="text-lg font-bold text-white">
                                {log.weight_kg} kg
                              </p>
                            )}
                            {log.reps_completed && (
                              <p className="text-sm text-indigo-300">
                                {log.reps_completed} reps
                              </p>
                            )}
                            {log.notes && (
                              <p className="text-xs text-slate-400 line-clamp-1">
                                {log.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-900/30 rounded-lg border border-dashed border-slate-700">
                    <p className="text-slate-500 text-sm">
                      Nenhum registro ainda. Clique em "Registrar" para começar.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {exercises.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/50 rounded-full mb-4">
              <Dumbbell className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              Nenhum exercício encontrado
            </h3>
            <p className="text-slate-400">
              Este treino ainda não possui exercícios cadastrados
            </p>
          </div>
        )}

        {/* Log Modal */}
        {logModalOpen && selectedExercise && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full">
              <div className="border-b border-slate-700 p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedExercise.name}</h3>
                  <p className="text-sm text-slate-400">
                    {selectedExercise.sets} séries × {selectedExercise.reps} reps
                  </p>
                </div>
                <button
                  onClick={closeLogModal}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Ex: 20"
                    value={newLog.weight}
                    onChange={(e) => setNewLog({ ...newLog, weight: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Repetições
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 12,10,10"
                    value={newLog.reps}
                    onChange={(e) => setNewLog({ ...newLog, reps: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Notas (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Observações sobre o treino"
                    value={newLog.notes}
                    onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="border-t border-slate-700 p-6">
                <button
                  onClick={saveLog}
                  disabled={!newLog.weight && !newLog.reps}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Save className="w-5 h-5" />
                  Salvar Registro
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
