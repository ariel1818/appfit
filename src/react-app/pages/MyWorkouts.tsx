import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Dumbbell, Calendar, Target, Trash2 } from 'lucide-react';

interface WorkoutProfile {
  id: number;
  experience_level: string;
  primary_goal: string;
  training_days: number;
  created_at: string;
}

interface WorkoutPlan {
  id: number;
  profile_id: number;
  name: string;
  description: string | null;
  created_at: string;
  profile: WorkoutProfile;
}

export default function MyWorkouts() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/my-workouts');
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (profileId: number) => {
    if (!confirm('Tem certeza que deseja excluir este treino?')) return;

    try {
      await fetch(`/api/workout-plan/${profileId}`, { method: 'DELETE' });
      setPlans(plans.filter(p => p.profile_id !== profileId));
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
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
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Meus Treinos</h1>
          <p className="text-xl text-slate-300">
            Acesse e gerencie seus planos de treino salvos
          </p>
        </div>

        {/* Plans List */}
        {plans.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/50 rounded-full mb-4">
              <Dumbbell className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              Nenhum treino salvo ainda
            </h3>
            <p className="text-slate-400 mb-6">
              Crie seu primeiro treino personalizado
            </p>
            <Link
              to="/workout-builder"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105 transition-all"
            >
              Criar Treino
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all"
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-sm text-white/80 mt-1">{plan.description}</p>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Target className="w-4 h-4" />
                        <span className="text-xs">Objetivo</span>
                      </div>
                      <p className="text-white font-semibold">{plan.profile.primary_goal}</p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">Frequência</span>
                      </div>
                      <p className="text-white font-semibold">{plan.profile.training_days}x por semana</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/workout-plan/${plan.profile_id}`}
                      className="flex-1 text-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
                    >
                      Acessar Treino
                    </Link>
                    <button
                      onClick={() => handleDelete(plan.profile_id)}
                      className="p-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Excluir treino"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 text-center">
                    Criado em {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
