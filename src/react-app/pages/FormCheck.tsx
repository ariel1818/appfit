import { useState, useRef } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Video, Camera, Upload, Loader as Loader2, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Film } from 'lucide-react';

interface FormAnalysis {
  exercise_identified: string;
  overall_assessment: string;
  good_points: string[];
  areas_for_improvement: string[];
  safety_concerns: string[];
  recommendations: string[];
}

function VideoUploadTabs({ onVideoSelect }: { onVideoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
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
              ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
          }`}
        >
          <Camera className="w-5 h-5" />
          Gravar Agora
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all ${
            activeTab === 'gallery'
              ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
          }`}
        >
          <Film className="w-5 h-5" />
          Enviar da Galeria
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-12">
        <input
          ref={cameraInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          onChange={onVideoSelect}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="video/*"
          onChange={onVideoSelect}
          className="hidden"
        />

        {activeTab === 'camera' ? (
          <div className="text-center space-y-6">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full flex items-center justify-center mb-6">
              <Video className="w-16 h-16 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Grave seu exercício agora</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Use a câmera do seu dispositivo para gravar a execução do exercício
            </p>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 transition-all"
            >
              <Camera className="w-6 h-6" />
              Abrir Câmera
            </button>
            
            <div className="bg-purple-950/30 border border-purple-800/50 rounded-xl p-6 mt-8">
              <h4 className="text-lg font-bold text-white mb-3">💡 Dicas para melhor análise</h4>
              <ul className="text-sm text-slate-300 space-y-2 text-left max-w-md mx-auto">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Grave de lado (perfil) para melhor visualização</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Certifique-se que todo seu corpo está visível</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Grave pelo menos 3-5 repetições do exercício</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Use boa iluminação para melhor análise</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full flex items-center justify-center mb-6">
              <Upload className="w-16 h-16 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Envie um vídeo da galeria</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Selecione um vídeo já gravado do seu exercício (máx. 20MB)
            </p>
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 transition-all"
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

export default function FormCheck() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FormAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 20MB for video)
    if (file.size > 20 * 1024 * 1024) {
      setError('O vídeo deve ter no máximo 20MB');
      return;
    }

    setError(null);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    
    // Auto-analyze after upload
    analyzeVideo(file);
  };

  const analyzeVideo = async (file: File) => {
    setAnalyzing(true);
    setAnalysis(null);
    setError(null);

    const formData = new FormData();
    formData.append('video', file);

    try {
      const response = await fetch('/api/analyze-form', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao analisar vídeo');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error: any) {
      console.error('Error analyzing video:', error);
      setError(error.message || 'Erro ao analisar vídeo. Tente novamente.');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetUpload = () => {
    setVideoUrl(null);
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl">
              <Video className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Análise de Execução</h1>
          <p className="text-xl text-slate-300">
            Grave ou envie um vídeo do seu exercício e receba feedback detalhado
          </p>
        </div>

        {!videoUrl ? (
          <VideoUploadTabs onVideoSelect={handleVideoUpload} />
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
              <video 
                src={videoUrl} 
                controls 
                className="w-full max-h-96 bg-black"
                preload="metadata"
              />
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-800/50 rounded-xl p-6">
                <div className="flex items-center gap-3 text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                  <p className="font-semibold">{error}</p>
                </div>
              </div>
            )}

            {analyzing && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 text-center">
                <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-xl text-white font-semibold">Analisando sua execução...</p>
                <p className="text-slate-400 mt-2">Nossa IA está avaliando sua forma e postura</p>
              </div>
            )}

            {analysis && !analyzing && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Análise Completa</h2>
                    <p className="text-slate-400">Exercício: {analysis.exercise_identified}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-950/50 to-pink-950/50 border border-purple-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-3">📊 Avaliação Geral</h3>
                  <p className="text-slate-300 leading-relaxed">{analysis.overall_assessment}</p>
                </div>

                {analysis.good_points.length > 0 && (
                  <div className="bg-green-950/30 border border-green-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Pontos Positivos
                    </h3>
                    <ul className="space-y-2">
                      {analysis.good_points.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-slate-300">
                          <span className="text-green-400 mt-1">✓</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.areas_for_improvement.length > 0 && (
                  <div className="bg-yellow-950/30 border border-yellow-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Pontos de Melhoria
                    </h3>
                    <ul className="space-y-2">
                      {analysis.areas_for_improvement.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-slate-300">
                          <span className="text-yellow-400 mt-1">⚠</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.safety_concerns.length > 0 && (
                  <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Atenção - Preocupações de Segurança
                    </h3>
                    <ul className="space-y-2">
                      {analysis.safety_concerns.map((concern, index) => (
                        <li key={index} className="flex items-start gap-2 text-slate-300">
                          <span className="text-red-400 mt-1">⚠️</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.recommendations.length > 0 && (
                  <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">💡 Recomendações</h3>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-slate-300">
                          <span className="text-purple-400 mt-1">→</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={resetUpload}
                className="flex-1 px-6 py-3 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 transition-all"
              >
                Analisar Outro Vídeo
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 bg-gradient-to-br from-purple-950/50 to-pink-950/50 backdrop-blur-sm border border-purple-800/50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4">⚠️ Aviso Importante</h3>
          <p className="text-slate-300 leading-relaxed">
            Esta análise é fornecida por inteligência artificial e serve apenas como orientação. 
            Sempre consulte um profissional de educação física certificado para avaliar sua forma 
            e técnica de exercícios. Se você sentir dor ou desconforto durante qualquer exercício, 
            pare imediatamente e procure orientação profissional.
          </p>
        </div>
      </div>
    </div>
  );
}
