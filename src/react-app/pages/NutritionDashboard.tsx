import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, TrendingUp, Apple, Droplet, Target, Calendar, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface NutritionStats {
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  totalMeals: number;
  currentWeek: number;
  waterIntake: number;
}

interface DailyData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function NutritionDashboard() {
  const [stats, setStats] = useState<NutritionStats | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [waterGoal] = useState(2000); // 2L daily goal
  const [waterIntake, setWaterIntake] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    loadWaterIntake();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/nutrition-stats');
      
      if (!response.ok) {
        setStats({
          averageCalories: 0,
          averageProtein: 0,
          averageCarbs: 0,
          averageFat: 0,
          totalMeals: 0,
          currentWeek: 0,
          waterIntake: 0
        });
        setDailyData([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setStats(data.stats);
      setDailyData(data.dailyData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        averageCalories: 0,
        averageProtein: 0,
        averageCarbs: 0,
        averageFat: 0,
        totalMeals: 0,
        currentWeek: 0,
        waterIntake: 0
      });
      setDailyData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadWaterIntake = () => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`water_${today}`);
    setWaterIntake(saved ? parseInt(saved) : 0);
  };

  const addWater = (amount: number) => {
    const newIntake = Math.min(waterIntake + amount, waterGoal);
    setWaterIntake(newIntake);
    
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`water_${today}`, newIntake.toString());
  };

  const resetWater = () => {
    setWaterIntake(0);
    const today = new Date().toISOString().split('T')[0];
    localStorage.removeItem(`water_${today}`);
  };

  const waterPercentage = (waterIntake / waterGoal) * 100;

  // Prepare macro distribution data
  const macroData = stats ? [
    { name: 'Proteína', value: stats.averageProtein * 4, fill: '#3b82f6' },
    { name: 'Carboidratos', value: stats.averageCarbs * 4, fill: '#eab308' },
    { name: 'Gorduras', value: stats.averageFat * 9, fill: '#f97316' }
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin">
          <TrendingUp className="w-12 h-12 text-emerald-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/nutrition"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </Link>

        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-500 rounded-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Painel de Controle da Dieta
              </h1>
              <p className="text-slate-400 mt-1">
                Acompanhe seu consumo e progresso nutricional
              </p>
            </div>
          </div>
        </div>

        {/* Water Tracker */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500 rounded-lg">
                <Droplet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Hidratação Diária</h2>
                <p className="text-sm text-slate-400">Meta: 2L por dia</p>
              </div>
            </div>
            <button
              onClick={resetWater}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-sm font-medium transition-colors"
            >
              Resetar
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Progresso</span>
              <span className="text-lg font-bold text-white">
                {waterIntake}ml / {waterGoal}ml
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-8 overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all duration-300 flex items-center justify-center"
                style={{ width: `${waterPercentage}%` }}
              >
                {waterPercentage > 10 && (
                  <span className="text-xs font-bold text-white">
                    {Math.round(waterPercentage)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {[250, 500, 750].map((amount) => (
              <button
                key={amount}
                onClick={() => addWater(amount)}
                className="flex-1 min-w-[100px] px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 rounded-lg font-semibold transition-colors"
              >
                + {amount}ml
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Apple className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-slate-400">Calorias Médias</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stats.averageCalories.toFixed(0)}</p>
              <p className="text-xs text-slate-500">por dia</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-400">Proteína Média</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stats.averageProtein.toFixed(0)}g</p>
              <p className="text-xs text-slate-500">por dia</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-slate-400">Total Refeições</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stats.totalMeals}</p>
              <p className="text-xs text-slate-500">registradas</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-slate-400">Esta Semana</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stats.currentWeek}</p>
              <p className="text-xs text-slate-500">refeições</p>
            </div>
          </div>
        )}

        {/* Charts */}
        {dailyData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Daily Calories Trend */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Calorias Diárias</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    name="Calorias"
                    dot={{ r: 4, fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Macro Distribution */}
            {macroData.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Distribuição de Macros</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  {macroData.map((macro) => (
                    <div key={macro.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: macro.fill }} />
                      <span className="text-xs text-slate-400">{macro.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Data State */}
        {dailyData.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4">
              <Apple className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-300 mb-2">Nenhum dado nutricional ainda</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Registre suas refeições para começar a acompanhar seu consumo
            </p>
            <Link
              to="/nutrition/daily-log"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
            >
              <Apple className="w-5 h-5" />
              Registrar Refeição
            </Link>
          </div>
        )}

        {/* Tips */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Dicas para Acompanhar sua Nutrição</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Mantenha-se hidratado bebendo pelo menos 2L de água por dia',
              'Registre todas as refeições para ter dados mais precisos',
              'Acompanhe a distribuição de macronutrientes',
              'Use os gráficos para identificar padrões'
            ].map((tip, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
