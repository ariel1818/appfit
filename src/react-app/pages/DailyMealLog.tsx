import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Camera, Calendar } from 'lucide-react';

interface MealLog {
  id: number;
  meal_type: string;
  meal_name: string;
  foods: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_key: string | null;
  logged_date: string;
}

interface DailyTotals {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meal_count: number;
}

export default function DailyMealLog() {
  // Always use current date when page loads
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [totals, setTotals] = useState<DailyTotals>({ total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0, meal_count: 0 });
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    fetchMeals();
    fetchTotals();
  }, [selectedDate]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/nutrition-profile/latest');
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeals = async () => {
    try {
      const response = await fetch(`/api/daily-meal-logs?date=${selectedDate}`);
      const data = await response.json();
      setMeals(data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  const fetchTotals = async () => {
    try {
      const response = await fetch(`/api/daily-totals/${selectedDate}`);
      const data = await response.json();
      setTotals(data);
    } catch (error) {
      console.error('Error fetching totals:', error);
    }
  };

  const handleDeleteMeal = async (id: number) => {
    if (!confirm('Deseja excluir este registro de refeição?')) return;

    try {
      await fetch(`/api/daily-meal-log/${id}`, { method: 'DELETE' });
      fetchMeals();
      fetchTotals();
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div className="animate-spin">
          <Calendar className="w-12 h-12 text-green-400" />
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

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">Registro Diário de Refeições</h1>
          <p className="text-xl text-slate-300">
            Acompanhe sua alimentação diária e atinja suas metas
          </p>
        </div>

        {/* Date Navigator */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeDate(-1)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              ← Anterior
            </button>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-green-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <button
              onClick={() => changeDate(1)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              disabled={selectedDate >= new Date().toISOString().split('T')[0]}
            >
              Próximo →
            </button>
          </div>
        </div>

        {/* Daily Targets Progress */}
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Calorias</span>
                <span className="text-sm font-bold text-emerald-400">
                  {totals.total_calories ?? 0}/{profile.ndc}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${getProgressPercentage(totals.total_calories ?? 0, profile.ndc)}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Proteína</span>
                <span className="text-sm font-bold text-blue-400">
                  {(totals.total_protein ?? 0).toFixed(0)}/{Math.round(profile.weight_kg * 2)}g
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full transition-all"
                  style={{ width: `${getProgressPercentage(totals.total_protein ?? 0, Math.round(profile.weight_kg * 2))}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Carboidratos</span>
                <span className="text-sm font-bold text-yellow-400">
                  {(totals.total_carbs ?? 0).toFixed(0)}/{Math.round((profile.ndc * 0.45) / 4)}g
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${getProgressPercentage(totals.total_carbs ?? 0, Math.round((profile.ndc * 0.45) / 4))}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Gorduras</span>
                <span className="text-sm font-bold text-orange-400">
                  {(totals.total_fat ?? 0).toFixed(0)}/{Math.round((profile.ndc * 0.25) / 9)}g
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all"
                  style={{ width: `${getProgressPercentage(totals.total_fat ?? 0, Math.round((profile.ndc * 0.25) / 9))}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Add Meal Button */}
        <div className="mb-8">
          <Link
            to="/nutrition/food-scanner"
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-green-500/50 hover:scale-105 transition-all"
          >
            <Camera className="w-5 h-5" />
            Registrar Nova Refeição
          </Link>
        </div>

        {/* Meals List */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Refeições do Dia</h2>
          
          {meals.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              Nenhuma refeição registrada para este dia.
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-sm text-slate-400 mb-1">{meal.meal_type}</div>
                      <h3 className="text-xl font-bold text-white">{meal.meal_name}</h3>
                    </div>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mb-4">
                    <p className="text-slate-300 whitespace-pre-line">{meal.foods}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-emerald-400">{meal.calories}</p>
                      <p className="text-xs text-slate-400">Calorias</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-blue-400">{meal.protein.toFixed(1)}g</p>
                      <p className="text-xs text-slate-400">Proteína</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-yellow-400">{meal.carbs.toFixed(1)}g</p>
                      <p className="text-xs text-slate-400">Carboidratos</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-orange-400">{meal.fat.toFixed(1)}g</p>
                      <p className="text-xs text-slate-400">Gorduras</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
