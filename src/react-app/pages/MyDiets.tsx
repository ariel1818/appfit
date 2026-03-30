import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Apple, BookOpen, Trash2, Calendar } from 'lucide-react';

interface DietPlan {
  id: number;
  name: string;
  description: string | null;
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  created_at: string;
}

export default function MyDiets() {
  const [diets, setDiets] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiets();
  }, []);

  const fetchDiets = async () => {
    try {
      const response = await fetch('/api/my-diets');
      const data = await response.json();
      setDiets(data);
    } catch (error) {
      console.error('Error fetching diets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta dieta?')) return;

    try {
      await fetch(`/api/diet-plan/${id}`, { method: 'DELETE' });
      setDiets(diets.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting diet:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div className="animate-spin">
          <Apple className="w-12 h-12 text-green-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/nutrition"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Minhas Dietas</h1>
          <p className="text-xl text-slate-300">
            Acesse e gerencie seus planos de dieta salvos
          </p>
        </div>

        {diets.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/50 rounded-full mb-4">
              <Apple className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              Nenhuma dieta salva ainda
            </h3>
            <p className="text-slate-400 mb-6">
              Crie sua primeira dieta personalizada
            </p>
            <Link
              to="/nutrition/diet-generator"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-green-500/50 hover:scale-105 transition-all"
            >
              Criar Dieta
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {diets.map((diet) => (
              <div
                key={diet.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-green-500/50 transition-all"
              >
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white">{diet.name}</h3>
                  {diet.description && (
                    <p className="text-sm text-white/80 mt-1">{diet.description}</p>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-emerald-400">{diet.daily_calories}</p>
                      <p className="text-xs text-slate-400">Calorias/dia</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-blue-400">{diet.daily_protein}g</p>
                      <p className="text-xs text-slate-400">Proteína/dia</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-yellow-400">{diet.daily_carbs}g</p>
                      <p className="text-xs text-slate-400">Carboidratos/dia</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-orange-400">{diet.daily_fat}g</p>
                      <p className="text-xs text-slate-400">Gorduras/dia</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/nutrition/diet/${diet.id}`}
                      className="flex-1 text-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all"
                    >
                      Ver Dieta
                    </Link>
                    <button
                      onClick={() => handleDelete(diet.id)}
                      className="p-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Excluir dieta"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 text-center">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Criada em {new Date(diet.created_at).toLocaleDateString('pt-BR')}
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
