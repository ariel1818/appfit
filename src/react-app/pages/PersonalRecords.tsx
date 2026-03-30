import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Trophy, TrendingUp, Calendar, Target, Dumbbell } from 'lucide-react';

interface PersonalRecord {
  id: number;
  exercise_id: number;
  exercise_name: string;
  muscle_group: string;
  weight_kg: number;
  reps: number;
  record_type: string;
  achieved_date: string;
  notes: string | null;
}

export default function PersonalRecords() {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/personal-records');
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const muscleGroups = Array.from(new Set(records.map(r => r.muscle_group)));
  const filteredRecords = selectedMuscleGroup === 'all' 
    ? records 
    : records.filter(r => r.muscle_group === selectedMuscleGroup);

  // Group records by exercise
  const recordsByExercise = filteredRecords.reduce((acc, record) => {
    if (!acc[record.exercise_id]) {
      acc[record.exercise_id] = {
        exercise_name: record.exercise_name,
        muscle_group: record.muscle_group,
        records: []
      };
    }
    acc[record.exercise_id].records.push(record);
    return acc;
  }, {} as Record<number, { exercise_name: string; muscle_group: string; records: PersonalRecord[] }>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-yellow-950">
        <div className="animate-spin">
          <Trophy className="w-12 h-12 text-yellow-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-yellow-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-xl">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Recordes Pessoais</h1>
          <p className="text-xl text-slate-300">
            Acompanhe seus melhores desempenhos em cada exercício
          </p>
        </div>

        {/* Filter by Muscle Group */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedMuscleGroup('all')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                selectedMuscleGroup === 'all'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-xl scale-105'
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Todos
            </button>
            {muscleGroups.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedMuscleGroup(group)}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                  selectedMuscleGroup === group
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-xl scale-105'
                    : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/50 rounded-full mb-4">
              <Trophy className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              Nenhum recorde registrado ainda
            </h3>
            <p className="text-slate-400 mb-6">
              Seus recordes pessoais serão registrados automaticamente ao fazer login dos treinos
            </p>
            <Link
              to="/my-workouts"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-yellow-500/50 hover:scale-105 transition-all"
            >
              <Dumbbell className="w-5 h-5" />
              Ver Meus Treinos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(recordsByExercise).map((exerciseData) => (
              <div
                key={exerciseData.exercise_name}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">{exerciseData.exercise_name}</h3>
                      <p className="text-sm text-white/80">{exerciseData.muscle_group}</p>
                    </div>
                    <Trophy className="w-6 h-6 text-white/80" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exerciseData.records.map((record) => (
                      <div
                        key={record.id}
                        className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-5"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-sm text-yellow-400 font-semibold mb-1">
                              {record.record_type === '1RM' ? 'Carga Máxima (1RM)' : 'Melhor Volume'}
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-yellow-400" />
                              <span className="text-3xl font-bold text-white">
                                {record.weight_kg.toFixed(1)} kg
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Target className="w-4 h-4 text-orange-400" />
                            <span>{record.reps} repetições</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(record.achieved_date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        {record.notes && (
                          <div className="mt-3 bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                            <p className="text-sm text-slate-300">{record.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-gradient-to-br from-yellow-950/50 to-orange-950/50 backdrop-blur-sm border border-yellow-800/50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Sobre os Recordes Pessoais
          </h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Seus recordes são atualizados automaticamente quando você registra treinos com cargas maiores</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">•</span>
              <span>1RM (Uma Repetição Máxima) representa a carga máxima que você consegue levantar uma única vez</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Melhor Volume considera tanto o peso quanto as repetições para avaliar seu desempenho total</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Acompanhe seus recordes para manter a motivação e visualizar seu progresso ao longo do tempo</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Sempre priorize a técnica correta sobre a carga máxima para evitar lesões</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
