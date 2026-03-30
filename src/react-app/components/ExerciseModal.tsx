import { X, Dumbbell } from 'lucide-react';
import type { Exercise } from '@/shared/types';

interface ExerciseModalProps {
  exercise: Exercise;
  onClose: () => void;
}

export default function ExerciseModal({ exercise, onClose }: ExerciseModalProps) {
  const instructions = exercise.instructions.split('.').filter(s => s.trim());

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{exercise.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image and Video */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {exercise.video_url && (
              <div className="relative overflow-hidden rounded-xl aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
                <iframe
                  src={exercise.video_url}
                  title={`Vídeo: ${exercise.name}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {exercise.image_url && (
              <div className="relative overflow-hidden rounded-xl aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
                <img 
                  src={exercise.image_url} 
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-lg text-slate-300">{exercise.description}</p>
          </div>

          {/* Instructions */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              Como Executar
            </h3>
            <div className="space-y-3">
              {instructions.map((instruction, index) => (
                instruction.trim() && (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-slate-300 leading-relaxed pt-0.5">
                      {instruction.trim()}.
                    </p>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Grupo Muscular</p>
              <p className="text-lg font-semibold text-white">{exercise.muscle_group}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Dificuldade</p>
              <p className="text-lg font-semibold text-white">{exercise.difficulty}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Equipamento</p>
              <p className="text-lg font-semibold text-white">{exercise.equipment || 'Nenhum'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
