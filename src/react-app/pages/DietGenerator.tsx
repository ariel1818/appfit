import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Sparkles, Loader as Loader2, User, Activity, CircleAlert as AlertCircle } from 'lucide-react';

export default function DietGenerator() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [foodPreferences, setFoodPreferences] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [mealsPerDay, setMealsPerDay] = useState(5);
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<string>('Masculino');
  const [activityLevel, setActivityLevel] = useState<string>('Moderado');
  const [goal, setGoal] = useState<string>('Manter Peso');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('pt');
  const [languageDetected, setLanguageDetected] = useState(false);
  const [calculatedValues, setCalculatedValues] = useState({
    tmb: 0,
    ndc: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  useEffect(() => {
    detectLanguage();
    fetchProfile();
  }, []);

  useEffect(() => {
    if (userProfile?.weight_kg && userProfile?.height_cm) {
      calculateNutrition();
    }
  }, [age, gender, activityLevel, goal, userProfile]);

  const detectLanguage = async () => {
    try {
      const response = await fetch('/api/detect-language');
      const data = await response.json();
      const detectedLang = data.language || 'pt';
      console.log('Idioma detectado:', detectedLang, 'País:', data.country);
      setLanguage(detectedLang);
      setLanguageDetected(true);
    } catch (error) {
      console.error('Error detecting language:', error);
      setLanguage('pt'); // Fallback para português
      setLanguageDetected(true);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNutrition = () => {
    if (!userProfile?.weight_kg || !userProfile?.height_cm) return;

    const weight = userProfile.weight_kg;
    const height = userProfile.height_cm;

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

    const multiplier = activityMultipliers[activityLevel] || 1.55;
    let baseNDC = baseTMB * multiplier;

    const goalAdjustments: Record<string, number> = {
      'Perder Peso': -500,
      'Manter Peso': 0,
      'Ganhar Peso': 300
    };

    const adjustedNDC = baseNDC + (goalAdjustments[goal] || 0);
    const tmb = Math.round(baseTMB);
    const ndc = Math.round(adjustedNDC);

    const proteinGrams = Math.round(weight * 2);
    const proteinCals = proteinGrams * 4;
    const fatGrams = Math.round((adjustedNDC * 0.25) / 9);
    const fatCals = fatGrams * 9;
    const carbsGrams = Math.round((adjustedNDC - proteinCals - fatCals) / 4);

    setCalculatedValues({
      tmb,
      ndc,
      protein: proteinGrams,
      carbs: carbsGrams,
      fat: fatGrams
    });
  };

  const handleGenerate = async () => {
    if (!userProfile?.weight_kg || !userProfile?.height_cm) {
      alert('Por favor, complete seu perfil com peso e altura antes de gerar uma dieta.');
      navigate('/profile');
      return;
    }

    // Garantir que o idioma foi detectado
    if (!languageDetected) {
      console.log('Aguardando detecção de idioma...');
      await detectLanguage();
    }

    console.log('Gerando dieta com idioma:', language);
    
    setGenerating(true);
    try {
      const response = await fetch('/api/generate-diet-from-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight_kg: userProfile.weight_kg,
          height_cm: userProfile.height_cm,
          age,
          gender,
          activity_level: activityLevel,
          goal,
          tmb: calculatedValues.tmb,
          ndc: calculatedValues.ndc,
          food_preferences: foodPreferences,
          restrictions,
          meals_per_day: mealsPerDay,
          language // Idioma detectado pela localização do IP
        })
      });

      // Verificar se a resposta é OK antes de tentar parsear
      if (!response.ok) {
        let errorMsg = `Erro HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (parseError) {
          console.error('Erro ao parsear resposta de erro:', parseError);
        }
        
        // Mostrar mensagem mais específica
        if (errorMsg.includes('OpenAI') || errorMsg.includes('API')) {
          alert('⚠️ Problema com a API de IA. Por favor:\n\n1. Verifique se a chave OPENAI_API_KEY está configurada\n2. Entre em contato com suporte se o problema persistir\n\nEmail: support@getmocha.com');
        } else {
          alert(`❌ ${errorMsg}\n\nSe o problema persistir, entre em contato com support@getmocha.com`);
        }
        return;
      }

      // Parsear a resposta JSON
      const data = await response.json();
      console.log('Resposta da API:', data);
      
      // Validar que recebemos um ID válido
      if (!data || !data.id) {
        console.error('Resposta inválida da API:', data);
        alert('❌ Resposta inválida do servidor. Por favor, tente novamente.\n\nSe o problema persistir, entre em contato com support@getmocha.com');
        return;
      }
      
      // Sucesso - navegar para a dieta
      console.log('Dieta criada com ID:', data.id);
      navigate(`/nutrition/diet/${data.id}`);
    } catch (error: any) {
      console.error('Erro ao gerar dieta:', error);
      
      // Mensagem de erro detalhada
      const errorMessage = error.message || 'Erro desconhecido';
      
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        alert('❌ Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        alert(`❌ Erro ao gerar dieta: ${errorMessage}\n\nPor favor, tente novamente ou entre em contato com support@getmocha.com`);
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div className="animate-spin">
          <Sparkles className="w-12 h-12 text-green-400" />
        </div>
      </div>
    );
  }

  const hasProfileData = userProfile?.weight_kg && userProfile?.height_cm;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/nutrition"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Gerador de Dieta com IA</h1>
          <p className="text-xl text-slate-300">
            Dieta personalizada usando os dados do seu perfil
          </p>
        </div>

        {!hasProfileData && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-orange-300 mb-2">Dados do Perfil Incompletos</h3>
                <p className="text-slate-300 mb-4">
                  Para gerar uma dieta personalizada, precisamos do seu peso e altura. Complete seu perfil primeiro.
                </p>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Ir para Perfil
                </Link>
              </div>
            </div>
          </div>
        )}

        {hasProfileData && (
          <>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Dados do Seu Perfil</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-sm text-slate-400">Peso</p>
                  <p className="text-xl font-bold text-white">{userProfile.weight_kg} kg</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-sm text-slate-400">Altura</p>
                  <p className="text-xl font-bold text-white">{userProfile.height_cm} cm</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 mb-8">
              <h3 className="text-lg font-bold text-white mb-6">Informações Adicionais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Suas Necessidades Calculadas</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{calculatedValues.ndc}</p>
                  <p className="text-sm text-slate-300">Calorias</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{calculatedValues.protein}g</p>
                  <p className="text-sm text-slate-300">Proteína</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{calculatedValues.carbs}g</p>
                  <p className="text-sm text-slate-300">Carboidratos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-400">{calculatedValues.fat}g</p>
                  <p className="text-sm text-slate-300">Gorduras</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 mb-8">
              <h3 className="text-lg font-bold text-white mb-6">Preferências Alimentares</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Alimentos que você gosta
                  </label>
                  <textarea
                    value={foodPreferences}
                    onChange={(e) => setFoodPreferences(e.target.value)}
                    placeholder="Ex: Frango, arroz, batata doce, ovos, frutas vermelhas..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Restrições ou Alergias
                  </label>
                  <textarea
                    value={restrictions}
                    onChange={(e) => setRestrictions(e.target.value)}
                    placeholder="Ex: Intolerante a lactose, não como carne vermelha..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Refeições por Dia: {mealsPerDay}
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="6"
                    value={mealsPerDay}
                    onChange={(e) => setMealsPerDay(parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between mt-2 text-sm text-slate-400">
                    <span>3</span>
                    <span>6</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-teal-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {generating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Gerando sua dieta personalizada...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Gerar Dieta Personalizada
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
