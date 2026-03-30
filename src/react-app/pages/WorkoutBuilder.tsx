import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Dumbbell, Target, TrendingUp, Calendar, ArrowRight, Sparkles, Clock, Wrench, CircleAlert as AlertCircle, Zap } from 'lucide-react';

export default function WorkoutBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [workoutType, setWorkoutType] = useState<'traditional' | 'hybrid'>('traditional');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [sportDays, setSportDays] = useState<Record<string, number>>({});
  const [allowMixedDays, setAllowMixedDays] = useState<boolean>(false);
  const [experienceLevel, setExperienceLevel] = useState<string>('');
  const [primaryGoal, setPrimaryGoal] = useState<string>('');
  const [trainingDays, setTrainingDays] = useState<number>(3);
  const [injuries, setInjuries] = useState<string>('');
  const [equipment, setEquipment] = useState<string>('Academia completa');
  const [timePerSession, setTimePerSession] = useState<string>('60-90');
  const [loading, setLoading] = useState(false);

  // Check if a sport was passed via URL parameter
  useEffect(() => {
    const sportParam = searchParams.get('sport');
    if (sportParam) {
      // If a specific sport is passed, set it as hybrid mode with that sport selected
      setWorkoutType('hybrid');
      setSelectedSports([sportParam]);
    }
  }, [searchParams]);

  const availableSports = [
    { id: 'Musculação', name: 'Musculação', icon: '💪', color: 'from-blue-500 to-cyan-600' },
    { id: 'Calistenia', name: 'Calistenia', icon: '🤸', color: 'from-indigo-500 to-blue-600' },
    { id: 'Boxe', name: 'Boxe', icon: '🥊', color: 'from-red-500 to-rose-600' },
    { id: 'MMA', name: 'MMA', icon: '🥋', color: 'from-orange-500 to-red-600' },
    { id: 'Muay Thai', name: 'Muay Thai', icon: '🦵', color: 'from-red-600 to-orange-500' },
    { id: 'Jiu-Jitsu', name: 'Jiu-Jitsu', icon: '🤼', color: 'from-purple-600 to-pink-500' },
    { id: 'Futebol', name: 'Futebol', icon: '⚽', color: 'from-green-500 to-emerald-600' },
    { id: 'Basquete', name: 'Basquete', icon: '🏀', color: 'from-orange-500 to-red-500' },
    { id: 'Vôlei', name: 'Vôlei', icon: '🏐', color: 'from-purple-500 to-pink-600' },
    { id: 'Natação', name: 'Natação', icon: '🏊', color: 'from-cyan-500 to-blue-500' },
    { id: 'Corrida', name: 'Corrida', icon: '🏃', color: 'from-amber-500 to-orange-600' },
    { id: 'Ciclismo', name: 'Ciclismo', icon: '🚴', color: 'from-lime-500 to-green-600' },
    { id: 'Tênis', name: 'Tênis', icon: '🎾', color: 'from-yellow-500 to-amber-500' },
    { id: 'Handebol', name: 'Handebol', icon: '🤾', color: 'from-teal-500 to-cyan-500' },
    { id: 'Yoga', name: 'Yoga', icon: '🧘', color: 'from-violet-500 to-purple-600' },
  ];

  const experienceLevels = [
    { value: 'Iniciante', label: 'Iniciante', desc: 'Menos de 6 meses de treino', icon: '🌱' },
    { value: 'Intermediário', label: 'Intermediário', desc: '6 meses a 2 anos de treino', icon: '💪' },
    { value: 'Avançado', label: 'Avançado', desc: 'Mais de 2 anos de treino', icon: '🔥' }
  ];

  const goals = [
    { value: 'Hipertrofia', label: 'Ganhar Massa', icon: '💪', desc: 'Aumentar volume muscular', color: 'from-purple-500 to-pink-600' },
    { value: 'Força', label: 'Ganhar Força', icon: '🏋️', desc: 'Aumentar força máxima', color: 'from-red-500 to-orange-600' },
    { value: 'Resistência', label: 'Resistência', icon: '⚡', desc: 'Melhorar resistência muscular', color: 'from-yellow-500 to-orange-500' },
    { value: 'Perda de Peso', label: 'Perder Peso', icon: '🔥', desc: 'Queimar gordura corporal', color: 'from-green-500 to-emerald-600' },
    { value: 'Condicionamento Geral', label: 'Condicionamento', icon: '🎯', desc: 'Saúde e bem-estar geral', color: 'from-blue-500 to-cyan-600' },
    { value: 'Performance Esportiva', label: 'Performance', icon: '⚡', desc: 'Melhorar desempenho atlético', color: 'from-indigo-500 to-purple-600' }
  ];

  const toggleSport = (sportId: string) => {
    setSelectedSports(prev => {
      if (prev.includes(sportId)) {
        // Remove sport and its days allocation
        const newSportDays = { ...sportDays };
        delete newSportDays[sportId];
        setSportDays(newSportDays);
        return prev.filter(id => id !== sportId);
      } else {
        // Add sport with default 1 day
        setSportDays(prev => ({ ...prev, [sportId]: 1 }));
        return [...prev, sportId];
      }
    });
  };

  const updateSportDays = (sportId: string, days: number) => {
    setSportDays(prev => ({ ...prev, [sportId]: days }));
  };

  const getTotalAllocatedDays = () => {
    return Object.values(sportDays).reduce((sum, days) => sum + days, 0);
  };

  const handleGeneratePlan = async () => {
    if (!experienceLevel || !primaryGoal) return;
    if (workoutType === 'hybrid' && selectedSports.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/workout-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workout_type: workoutType,
          selected_sports: workoutType === 'hybrid' ? selectedSports : undefined,
          sport_days: workoutType === 'hybrid' ? sportDays : undefined,
          allow_mixed_days: workoutType === 'hybrid' ? allowMixedDays : undefined,
          experience_level: experienceLevel,
          primary_goal: primaryGoal,
          training_days: trainingDays,
          injuries: injuries || undefined,
          equipment: equipment || undefined,
          time_per_session: timePerSession || undefined
        })
      });

      // Check if response is OK before parsing
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }

      const preview = await response.json();
      
      // Validate that we received a valid workout plan
      if (!preview.days || !Array.isArray(preview.days) || preview.days.length === 0) {
        throw new Error('Plano de treino inválido recebido. Por favor, tente novamente.');
      }
      
      if (preview.error) {
        throw new Error(preview.error);
      }
      
      navigate('/workout-preview', { state: { preview } });
    } catch (error: any) {
      console.error('Error generating plan:', error);
      
      // Show specific error message if available
      const errorMessage = error.message || 'Erro ao gerar treino. Por favor, tente novamente.';
      
      // Check if it's an OpenAI API key issue
      if (errorMessage.includes('OpenAI') || errorMessage.includes('API')) {
        alert('⚠️ Problema com a API de IA. Por favor:\n\n1. Verifique se a chave OPENAI_API_KEY está configurada\n2. Entre em contato com suporte se o problema persistir\n\nEmail: support@getmocha.com');
      } else {
        alert(`❌ ${errorMessage}\n\nSe o problema persistir, entre em contato com support@getmocha.com`);
      }
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = experienceLevel && primaryGoal && 
    (workoutType === 'traditional' || (workoutType === 'hybrid' && selectedSports.length > 0 && getTotalAllocatedDays() <= trainingDays));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl shadow-purple-500/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Treino Personalizado com IA</h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Plano científico baseado em seus objetivos e nível de experiência
          </p>
        </div>

        {/* Workout Type Selection */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Tipo de Treino</h2>
              <p className="text-sm text-slate-400">Escolha o estilo do seu treinamento</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setWorkoutType('traditional');
                setSelectedSports([]);
              }}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                workoutType === 'traditional'
                  ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                  : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <div className="text-3xl mb-3">💪</div>
              <h3 className="text-lg font-bold text-white mb-2">Treino Tradicional</h3>
              <p className="text-sm text-slate-400">
                Foco em musculação clássica com exercícios de academia
              </p>
            </button>

            <button
              onClick={() => setWorkoutType('hybrid')}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                workoutType === 'hybrid'
                  ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                  : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-bold text-white mb-2">Treino Híbrido</h3>
              <p className="text-sm text-slate-400">
                Combine múltiplas modalidades em um plano integrado
              </p>
            </button>
          </div>
        </div>

        {/* Sport Selection (only for hybrid) */}
        {workoutType === 'hybrid' && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pink-500/20 rounded-lg">
                <Target className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Modalidades</h2>
                <p className="text-sm text-slate-400">
                  Selecione 2 ou mais modalidades para combinar ({selectedSports.length} selecionadas)
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableSports.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => toggleSport(sport.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedSports.includes(sport.id)
                      ? 'border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/20'
                      : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="text-2xl mb-2">{sport.icon}</div>
                  <h3 className="text-sm font-bold text-white">{sport.name}</h3>
                </button>
              ))}
            </div>
            {selectedSports.length > 0 && (
              <div className="mt-4 space-y-3">
                {/* Mixed Days Option */}
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={allowMixedDays}
                      onChange={(e) => setAllowMixedDays(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded bg-slate-700 border-purple-500/50 text-purple-500 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-semibold text-purple-200 group-hover:text-purple-100 transition-colors">
                        ⚡ Permitir dias mistos (híbridos dentro de um dia)
                      </p>
                      <p className="text-xs text-purple-300/80 mt-1">
                        Quando ativado, a IA pode combinar múltiplas modalidades em um único dia de treino (ex: musculação + calistenia no mesmo dia). Quando desativado, cada dia terá foco principal em apenas uma modalidade.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <p className="text-sm text-blue-200 mb-3">
                    <strong>Distribua os {trainingDays} dias de treino entre as modalidades:</strong>
                  </p>
                  <div className="space-y-3">
                    {selectedSports.map((sportId) => {
                      const sport = availableSports.find(s => s.id === sportId);
                      return (
                        <div key={sportId} className="flex items-center justify-between gap-4 bg-slate-800/50 p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{sport?.icon}</span>
                            <span className="text-sm font-medium text-white">{sport?.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateSportDays(sportId, Math.max(1, (sportDays[sportId] || 1) - 1))}
                              className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold transition-colors"
                            >
                              −
                            </button>
                            <span className="text-lg font-bold text-white w-8 text-center">
                              {sportDays[sportId] || 1}
                            </span>
                            <button
                              onClick={() => updateSportDays(sportId, Math.min(trainingDays, (sportDays[sportId] || 1) + 1))}
                              className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-500/30">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-200">Total de dias alocados:</span>
                      <span className={`font-bold ${getTotalAllocatedDays() === trainingDays ? 'text-green-400' : getTotalAllocatedDays() > trainingDays ? 'text-red-400' : 'text-yellow-400'}`}>
                        {getTotalAllocatedDays()} / {trainingDays}
                      </span>
                    </div>
                    {getTotalAllocatedDays() > trainingDays && (
                      <p className="text-xs text-red-400 mt-2">
                        ⚠️ O total de dias alocados excede sua frequência semanal
                      </p>
                    )}
                    {getTotalAllocatedDays() < trainingDays && (
                      <p className="text-xs text-yellow-400 mt-2">
                        ℹ️ Você ainda tem {trainingDays - getTotalAllocatedDays()} dias disponíveis
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Experience Level */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Nível de Experiência</h2>
              <p className="text-sm text-slate-400">Escolha o que melhor descreve você</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {experienceLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setExperienceLevel(level.value)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  experienceLevel === level.value
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
                    : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="text-2xl mb-2">{level.icon}</div>
                <h3 className="text-lg font-bold text-white mb-1">{level.label}</h3>
                <p className="text-xs text-slate-400">{level.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Goal */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Objetivo Principal</h2>
              <p className="text-sm text-slate-400">Selecione seu foco de treinamento</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {goals.map((goal) => (
              <button
                key={goal.value}
                onClick={() => setPrimaryGoal(goal.value)}
                className={`p-4 rounded-xl border-2 transition-all text-left group ${
                  primaryGoal === goal.value
                    ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                    : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="text-2xl mb-2">{goal.icon}</div>
                <h3 className="text-base font-bold text-white mb-1">{goal.label}</h3>
                <p className="text-xs text-slate-400">{goal.desc}</p>
                {primaryGoal === goal.value && (
                  <div className={`mt-2 h-1 bg-gradient-to-r ${goal.color} rounded-full`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Training Days */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <Calendar className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Frequência Semanal</h2>
              <p className="text-sm text-slate-400">Quantos dias por semana você pode treinar?</p>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base text-slate-300">Dias por semana</span>
              <span className="text-3xl font-bold text-white">{trainingDays}</span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              value={trainingDays}
              onChange={(e) => setTrainingDays(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between mt-2 text-sm text-slate-400">
              <span>1 dia</span>
              <span>7 dias</span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Time per session */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-slate-400" />
              <label className="text-sm font-semibold text-slate-300">Tempo por Sessão</label>
            </div>
            <select
              value={timePerSession}
              onChange={(e) => setTimePerSession(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="30-45">30-45 minutos</option>
              <option value="45-60">45-60 minutos</option>
              <option value="60-90">60-90 minutos</option>
              <option value="90+">90+ minutos</option>
            </select>
          </div>

          {/* Equipment */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-slate-400" />
              <label className="text-sm font-semibold text-slate-300">Equipamentos Disponíveis</label>
            </div>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Academia completa">Academia completa</option>
              <option value="Apenas halteres e barra">Apenas halteres e barra</option>
              <option value="Peso corporal">Apenas peso corporal</option>
              <option value="Home gym básico">Home gym básico</option>
            </select>
          </div>
        </div>

        {/* Injuries/Restrictions */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <label className="text-sm font-semibold text-slate-300">Lesões ou Restrições (opcional)</label>
          </div>
          <textarea
            value={injuries}
            onChange={(e) => setInjuries(e.target.value)}
            placeholder="Ex: Dor no ombro direito, evitar agachamento profundo..."
            rows={3}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <p className="text-xs text-slate-500 mt-2">A IA ajustará os exercícios para evitar movimentos que possam agravar lesões</p>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGeneratePlan}
            disabled={!canGenerate || loading}
            className={`group flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-bold transition-all ${
              canGenerate && !loading
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 active:scale-100'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Dumbbell className="w-6 h-6 animate-spin" />
                Gerando seu treino perfeito...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Gerar Treino Personalizado
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Info box */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-200 font-medium mb-1">Powered by AI</p>
              <p className="text-xs text-blue-300/80">
                {workoutType === 'traditional' 
                  ? 'Nosso sistema usa inteligência artificial para criar treinos cientificamente embasados, selecionando exercícios específicos do nosso banco de dados de 500+ exercícios e ajustando séries, repetições e descanso baseado em literatura científica.'
                  : 'Crie treinos híbridos combinando múltiplas modalidades! A IA vai integrar exercícios de diferentes esportes de forma inteligente, criando um plano coeso e eficiente para atingir seus objetivos.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
