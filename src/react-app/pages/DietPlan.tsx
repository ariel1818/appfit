import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Apple, Utensils, Clock } from 'lucide-react';

interface DietMeal {
  id: number;
  meal_type: string;
  meal_name: string;
  foods: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DietPlanData {
  id: number;
  name: string;
  description: string | null;
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  created_at: string;
  meals: DietMeal[];
}

export default function DietPlan() {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<DietPlanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      const response = await fetch(`/api/diet-plan/${id}`);
      const data = await response.json();
      setPlan(data);
    } catch (error) {
      console.error('Error fetching diet plan:', error);
    } finally {
      setLoading(false);
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

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-300 mb-4">Plano não encontrado</h2>
          <Link to="/nutrition/my-diets" className="text-green-400 hover:text-green-300 transition-colors">
            Ver minhas dietas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/nutrition/my-diets"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <Apple className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{plan.name}</h1>
              <p className="text-lg text-slate-300">{plan.description}</p>
            </div>
          </div>
        </div>

        {/* Daily Totals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-emerald-400">{plan.daily_calories}</p>
            <p className="text-sm text-slate-300 mt-1">Calorias/dia</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-blue-400">{plan.daily_protein}g</p>
            <p className="text-sm text-slate-300 mt-1">Proteína/dia</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-yellow-400">{plan.daily_carbs}g</p>
            <p className="text-sm text-slate-300 mt-1">Carboidratos/dia</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-orange-400">{plan.daily_fat}g</p>
            <p className="text-sm text-slate-300 mt-1">Gorduras/dia</p>
          </div>
        </div>

        {/* Meals */}
        <div className="space-y-6">
          {plan.meals.map((meal, index) => (
            <div
              key={meal.id}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Utensils className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{meal.meal_type}</h3>
                    <p className="text-sm text-white/80">{meal.meal_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Refeição {index + 1}</span>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-400 mb-3">Alimentos</h4>
                  <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                    <p className="text-slate-200 whitespace-pre-line">{meal.foods}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{meal.calories}</p>
                    <p className="text-xs text-slate-400">Calorias</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-400">{meal.protein}g</p>
                    <p className="text-xs text-slate-400">Proteína</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-400">{meal.carbs}g</p>
                    <p className="text-xs text-slate-400">Carboidratos</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-orange-400">{meal.fat}g</p>
                    <p className="text-xs text-slate-400">Gorduras</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-gradient-to-br from-green-950/50 to-emerald-950/50 backdrop-blur-sm border border-green-800/50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Apple className="w-6 h-6 text-green-400" />
            Dicas para Seguir sua Dieta
          </h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">•</span>
              <span>Prepare suas refeições com antecedência para facilitar o dia a dia</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">•</span>
              <span>Beba pelo menos 2-3 litros de água por dia</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">•</span>
              <span>Mantenha a consistência - resultados levam tempo</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">•</span>
              <span>Ajuste as porções conforme necessário para atingir seus objetivos</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">•</span>
              <span>Combine com seus treinos para maximizar os resultados</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
