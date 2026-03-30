import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, TrendingUp, Calendar, Dumbbell, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WorkoutStats {
  totalWorkouts: number;
  currentWeek: number;
  lastWeek: number;
  averageWeight: number;
  totalVolume: number;
}

interface ExerciseProgress {
  exercise_name: string;
  data: Array<{
    date: string;
    weight: number;
  }>;
}

export default function WorkoutDashboard() {
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch workout logs
      const response = await fetch('/api/workout-stats');
      
      if (!response.ok) {
        // If endpoint doesn't exist yet, use mock data
        setStats({
          totalWorkouts: 0,
          currentWeek: 0,
          lastWeek: 0,
          averageWeight: 0,
          totalVolume: 0
        });
        setExerciseProgress([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setStats(data.stats);
      setExerciseProgress(data.exerciseProgress);
      
      if (data.exerciseProgress.length > 0) {
        setSelectedExercise(data.exerciseProgress[0].exercise_name);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data on error
      setStats({
        totalWorkouts: 0,
        currentWeek: 0,
        lastWeek: 0,
        averageWeight: 0,
        totalVolume: 0
      });
      setExerciseProgress([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedExerciseData = exerciseProgress.find(ep => ep.exercise_name === selectedExercise);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="animate-spin">
          <TrendingUp className="w-12 h-12 text-indigo-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Dashboard de Progresso</h1>
          <p className="text-xl text-slate-300">
            Acompanhe sua evolução nos treinos
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span className="text-sm text-slate-400">Total de Treinos</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalWorkouts}</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Dumbbell className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-slate-400">Esta Semana</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.currentWeek}</p>
              <p className="text-sm text-slate-400 mt-1">
                {stats.currentWeek > stats.lastWeek ? '↑' : stats.currentWeek < stats.lastWeek ? '↓' : '→'} {Math.abs(stats.currentWeek - stats.lastWeek)} vs semana passada
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-pink-400" />
                <span className="text-sm text-slate-400">Carga Média</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.averageWeight.toFixed(1)} kg</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-sm text-slate-400">Volume Total</span>
              </div>
              <p className="text-3xl font-bold text-white">{(stats.totalVolume / 1000).toFixed(1)}k kg</p>
            </div>
          </div>
        )}

        {/* Exercise Progress Chart */}
        {exerciseProgress.length > 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Evolução por Exercício</h2>
            
            <div className="mb-6">
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="w-full md:w-auto px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {exerciseProgress.map((ep) => (
                  <option key={ep.exercise_name} value={ep.exercise_name}>
                    {ep.exercise_name}
                  </option>
                ))}
              </select>
            </div>

            {selectedExerciseData && selectedExerciseData.data.length > 0 && (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={selectedExerciseData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                    label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', r: 6 }}
                    name="Carga (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
            <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-300 mb-2">Nenhum dado de progresso ainda</h3>
            <p className="text-slate-400 mb-6">
              Registre seus treinos para começar a acompanhar sua evolução
            </p>
            <Link
              to="/my-workouts"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-indigo-500/50 transition-all"
            >
              Ver Meus Treinos
            </Link>
          </div>
        )}

        {/* Tips */}
        <div className="bg-gradient-to-br from-indigo-950/50 to-purple-950/50 backdrop-blur-sm border border-indigo-800/50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-400" />
            Dicas para Acompanhar seu Progresso
          </h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">•</span>
              <span>Registre todos os seus treinos consistentemente para dados mais precisos</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">•</span>
              <span>Acompanhe a evolução semanal para identificar padrões e ajustar seu treinamento</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">•</span>
              <span>Progressão linear constante é mais importante que grandes saltos esporádicos</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">•</span>
              <span>Use os gráficos para identificar quando aumentar a carga dos exercícios</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
