import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Camera, Upload, Loader as Loader2, Image, Check } from 'lucide-react';

interface FoodAnalysis {
  name: string;
  portion_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function UploadTabs({ onImageSelect }: { onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  const [activeTab, setActiveTab] = useState<'camera' | 'gallery'>('camera');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-700/50">
        <button
          onClick={() => setActiveTab('camera')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all ${
            activeTab === 'camera'
              ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
          }`}
        >
          <Camera className="w-5 h-5" />
          Tirar Foto
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all ${
            activeTab === 'gallery'
              ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
          }`}
        >
          <Image className="w-5 h-5" />
          Enviar da Galeria
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-12">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onImageSelect}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={onImageSelect}
          className="hidden"
        />

        {activeTab === 'camera' ? (
          <div className="text-center space-y-6">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full flex items-center justify-center mb-6">
              <Camera className="w-16 h-16 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Tire uma foto da sua refeição</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Use a câmera do seu dispositivo para capturar a imagem do alimento
            </p>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-105 transition-all"
            >
              <Camera className="w-6 h-6" />
              Abrir Câmera
            </button>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full flex items-center justify-center mb-6">
              <Upload className="w-16 h-16 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Envie uma foto da galeria</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Selecione uma imagem já existente da sua refeição
            </p>
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-105 transition-all"
            >
              <Upload className="w-6 h-6" />
              Escolher da Galeria
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FoodScanner() {
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [showMealTypeModal, setShowMealTypeModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      analyzeImage(file);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (file: File) => {
    setAnalyzing(true);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('image', file);
    
    const language = localStorage.getItem('preferredLanguage') || 'pt';
    formData.append('language', language);

    try {
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error analyzing food:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveFood = async (mealType: string) => {
    if (!analysis) return;

    setSaving(true);
    try {
      await fetch('/api/daily-meal-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: null,
          meal_type: mealType,
          meal_name: analysis.name,
          foods: analysis.portion_size,
          calories: analysis.calories,
          protein: analysis.protein,
          carbs: analysis.carbs,
          fat: analysis.fat,
          image_key: null,
          logged_date: new Date().toISOString().split('T')[0]
        })
      });

      setShowMealTypeModal(false);
      
      // Show success message and redirect
      setTimeout(() => {
        navigate('/nutrition/daily-meal-log');
      }, 1500);
    } catch (error) {
      console.error('Error saving food:', error);
      alert('Erro ao salvar refeição');
    } finally {
      setSaving(false);
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
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Scanner de Alimentos</h1>
          <p className="text-xl text-slate-300">
            Tire uma foto da sua refeição para análise nutricional
          </p>
        </div>

        {!image ? (
          <UploadTabs onImageSelect={handleImageUpload} />
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
              <img src={image} alt="Food" className="w-full h-96 object-cover" />
            </div>

            {analyzing && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 text-center">
                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
                <p className="text-xl text-white font-semibold">Analisando sua refeição...</p>
                <p className="text-slate-400 mt-2">Identificando alimentos e calculando macros</p>
              </div>
            )}

            {analysis && !analyzing && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">{analysis.name}</h2>
                </div>

                <div className="mb-6">
                  <p className="text-slate-400 mb-2">Porção</p>
                  <p className="text-lg text-white font-semibold">{analysis.portion_size}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{analysis.calories}</p>
                    <p className="text-sm text-slate-400">Calorias</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-400">{analysis.protein}g</p>
                    <p className="text-sm text-slate-400">Proteína</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-400">{analysis.carbs}g</p>
                    <p className="text-sm text-slate-400">Carboidratos</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-orange-400">{analysis.fat}g</p>
                    <p className="text-sm text-slate-400">Gorduras</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowMealTypeModal(true)}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Salvando...' : 'Salvar no Registro Diário'}
                  </button>
                  <button
                    onClick={() => {
                      setImage(null);
                      setAnalysis(null);
                    }}
                    disabled={saving}
                    className="px-6 py-3 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 transition-all disabled:opacity-50"
                  >
                    Nova Foto
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Meal Type Selection Modal */}
        {showMealTypeModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800/95 border border-slate-700/50 rounded-2xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Selecione o tipo de refeição
              </h3>
              
              <div className="space-y-3">
                {[
                  { name: 'Café da Manhã', icon: '🌅' },
                  { name: 'Lanche da Manhã', icon: '☕' },
                  { name: 'Almoço', icon: '🍽️' },
                  { name: 'Lanche da Tarde', icon: '🥤' },
                  { name: 'Jantar', icon: '🌙' },
                  { name: 'Ceia', icon: '🌃' }
                ].map((meal) => (
                  <button
                    key={meal.name}
                    onClick={() => handleSaveFood(meal.name)}
                    disabled={saving}
                    className="w-full flex items-center gap-4 px-6 py-4 bg-slate-700/50 hover:bg-emerald-600/20 border border-slate-600 hover:border-emerald-500 rounded-xl transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-3xl">{meal.icon}</span>
                    <span className="flex-1 text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {meal.name}
                    </span>
                    {saving && <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowMealTypeModal(false)}
                disabled={saving}
                className="w-full mt-6 px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {saving && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50">
            <Check className="w-6 h-6" />
            <span className="font-semibold">Refeição salva com sucesso!</span>
          </div>
        )}
      </div>
    </div>
  );
}
