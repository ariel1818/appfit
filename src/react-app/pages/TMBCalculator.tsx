import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Activity, Target, TrendingUp } from 'lucide-react';

export default function TMBCalculator() {
  const navigate = useNavigate();
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<string>('Masculino');
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [activityLevel, setActivityLevel] = useState<string>('Moderado');
  const [goal, setGoal] = useState<string>('Manter Peso');
  const [tmb, setTmb] = useState<number>(0);
  const [ndc, setNdc] = useState<number>(0);
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 });
  const [workoutDays, setWorkoutDays] = useState<number>(0);

  useEffect(() => {
    fetchWorkoutData();
  }, []);

  useEffect(() => {
    calculateTMB();
  }, [age, gender, weight, height, activityLevel, goal, workoutDays]);

  const fetchWorkoutData = async () => {
    try {
      const response = await fetch('/api/my-workouts');
      const data = await response.json();
      if (data.length > 0) {
        const latestPlan = data[0];
        setWorkoutDays(latestPlan.profile.training_days);
      }
    } catch (error) {
      console.error('Error fetching workout data:', error);
    }
  };

  const calculateTMB = () => {
    let baseTMB = 0;
    
    if (gender === 'Masculino') {
      baseTMB = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      baseTMB = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    const activityMultipliers: Record<string, number> = {
      'Sedentário': 1.2,
      'Leve': 1.375,
      'Moderado': 1.55,
      'Intenso': 1.725,
      'Muito Intenso': 1.9
    };

    let multiplier = activityMultipliers[activityLevel] || 1.55;
    
    if (workoutDays > 0) {
      multiplier = Math.max(multiplier, 1.2 + (workoutDays * 0.1));
    }

    let baseNDC = baseTMB * multiplier;

    const goalAdjustments: Record<string, number> = {
      'Perder Peso': -500,
      'Manter Peso': 0,
      'Ganhar Peso': 300
    };

    const adjustedNDC = baseNDC + (goalAdjustments[goal] || 0);

    setTmb(Math.round(baseTMB));
    setNdc(Math.round(adjustedNDC));

    const proteinGrams = Math.round(weight * 2);
    const proteinCals = proteinGrams * 4;
    const fatGrams = Math.round((adjustedNDC * 0.25) / 9);
    const fatCals = fatGrams * 9;
    const carbsGrams = Math.round((adjustedNDC - proteinCals - fatCals) / 4);

    setMacros({
      protein: proteinGrams,
      carbs: carbsGrams,
      fat: fatGrams
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/nutrition-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age,
          gender,
          weight_kg: weight,
          height_cm: height,
          activity_level: activityLevel,
          goal,
          tmb,
          ndc
        })
      });

      if (response.ok) {
        navigate('/nutrition/diet-generator');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/nutrition"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-6 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-3xl mb-6 border border-green-500/30 backdrop-blur-sm">
            <img 
              src="https://mocha-cdn.com/019a7ac1-2d64-727a-be98-94f4e2b55df9/calculator-illustration.png" 
              alt="Calculadora TMB" 
              className="w-32 h-32 object-contain drop-shadow-2xl"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Calculadora TMB/NDC</h1>
          <p className="text-xl text-slate-300">
            Calcule suas necessidades calóricas diárias
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Idade
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Gênero
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option>Masculino</option>
                <option>Feminino</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Peso (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value))}
                step="0.1"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Altura (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value))}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nível de Atividade
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option>Sedentário</option>
                <option>Leve</option>
                <option>Moderado</option>
                <option>Intenso</option>
                <option>Muito Intenso</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Objetivo
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option>Perder Peso</option>
                <option>Manter Peso</option>
                <option>Ganhar Peso</option>
              </select>
            </div>
          </div>

          {workoutDays > 0 && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <Activity className="w-5 h-5" />
                <span className="font-semibold">Treinos detectados</span>
              </div>
              <p className="text-sm text-slate-300">
                Você treina {workoutDays}x por semana. Seu nível de atividade foi ajustado automaticamente.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">TMB</h3>
            </div>
            <p className="text-4xl font-bold text-white mb-2">{tmb}</p>
            <p className="text-sm text-slate-300">calorias/dia em repouso</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">NDC</h3>
            </div>
            <p className="text-4xl font-bold text-white mb-2">{ndc}</p>
            <p className="text-sm text-slate-300">calorias/dia total</p>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">Distribuição de Macronutrientes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{macros.protein}g</div>
              <div className="text-sm text-slate-400">Proteína</div>
              <div className="mt-2 text-xs text-slate-500">{macros.protein * 4} calorias</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{macros.carbs}g</div>
              <div className="text-sm text-slate-400">Carboidratos</div>
              <div className="mt-2 text-xs text-slate-500">{macros.carbs * 4} calorias</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">{macros.fat}g</div>
              <div className="text-sm text-slate-400">Gorduras</div>
              <div className="mt-2 text-xs text-slate-500">{macros.fat * 9} calorias</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-green-500/50 hover:scale-105 transition-all"
        >
          Salvar e Criar Dieta
        </button>
      </div>
    </div>
  );
}
