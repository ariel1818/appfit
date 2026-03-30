import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Dumbbell, Target, TrendingUp, Wrench } from 'lucide-react';
import type { Exercise } from '@/shared/types';

export default function ExerciseDetail() {
  const { id } = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercise();
  }, [id]);

  const fetchExercise = async () => {
    try {
      const response = await fetch(`/api/exercises/${id}`);
      const data = await response.json();
      setExercise(data);
    } catch (error) {
      console.error('Error fetching exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante':
        return 'from-green-500 to-emerald-600';
      case 'Intermediário':
        return 'from-yellow-500 to-orange-600';
      case 'Avançado':
        return 'from-red-500 to-rose-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="animate-spin">
          <Dumbbell className="w-12 h-12 text-indigo-400" />
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-300 mb-4">Exercício não encontrado</h2>
          <Link 
            to="/" 
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Voltar para a lista
          </Link>
        </div>
      </div>
    );
  }

  const instructions = exercise.instructions.split('.').filter(s => s.trim());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar para exercícios
        </Link>

        {/* Video and Image Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Video */}
          {exercise.video_url && (
            <div className="relative overflow-hidden rounded-2xl aspect-video bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
              <iframe
                src={exercise.video_url}
                title={`Vídeo: ${exercise.name}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Image */}
          <div className="relative overflow-hidden rounded-2xl aspect-video bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
            {exercise.image_url ? (
              <img 
                src={exercise.image_url} 
                alt={exercise.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <Dumbbell className="w-24 h-24 text-slate-700" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          </div>
        </div>

        {/* Exercise Info */}
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">{exercise.name}</h1>
            <p className="text-xl text-slate-300">{exercise.description}</p>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-slate-200">Grupo Muscular</h3>
              </div>
              <p className="text-lg text-white">{exercise.muscle_group}</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold text-slate-200">Dificuldade</h3>
              </div>
              <div className="inline-block">
                <span className={`px-3 py-1.5 bg-gradient-to-r ${getDifficultyColor(exercise.difficulty)} text-white text-sm font-semibold rounded-full shadow-lg`}>
                  {exercise.difficulty}
                </span>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                  <Wrench className="w-5 h-5 text-pink-400" />
                </div>
                <h3 className="font-semibold text-slate-200">Equipamento</h3>
              </div>
              <p className="text-lg text-white">{exercise.equipment || 'Nenhum'}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              Como Executar
            </h2>
            <div className="space-y-4">
              {instructions.map((instruction, index) => (
                instruction.trim() && (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {index + 1}
                    </div>
                    <p className="text-slate-300 text-lg leading-relaxed pt-0.5">
                      {instruction.trim()}.
                    </p>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-br from-indigo-950/50 to-purple-950/50 backdrop-blur-sm border border-indigo-800/50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">💡 Dicas Importantes</h3>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 mt-1">•</span>
                <span>Mantenha sempre a forma correta antes de aumentar a carga</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 mt-1">•</span>
                <span>Respire de forma controlada durante todo o exercício</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 mt-1">•</span>
                <span>Faça o movimento de forma lenta e controlada</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 mt-1">•</span>
                <span>Em caso de dor, pare imediatamente e consulte um profissional</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
