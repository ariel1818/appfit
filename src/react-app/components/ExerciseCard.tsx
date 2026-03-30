import { Link } from 'react-router';
import { Target, Wrench, ArrowRight } from 'lucide-react';
import type { Exercise } from '@/shared/types';

interface ExerciseCardProps {
  exercise: Exercise;
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
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

  return (
    <Link to={`/exercise/${exercise.id}`}>
      <div className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/50 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
          {exercise.image_url ? (
            <img 
              src={exercise.image_url} 
              alt={exercise.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <Target className="w-16 h-16 text-slate-700" strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent" />
          
          {/* Difficulty Badge */}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1.5 bg-gradient-to-r ${getDifficultyColor(exercise.difficulty)} text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm`}>
              {exercise.difficulty}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 font-display group-hover:text-brand-400 transition-colors line-clamp-2">
              {exercise.name}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
              {exercise.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <div className="p-1.5 bg-slate-800 rounded-lg">
                <Target className="w-4 h-4" strokeWidth={2} />
              </div>
              <span className="font-medium">{exercise.muscle_group}</span>
            </div>
            {exercise.equipment && (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="p-1.5 bg-slate-800 rounded-lg">
                  <Wrench className="w-4 h-4" strokeWidth={2} />
                </div>
                <span className="font-medium truncate">{exercise.equipment}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/50">
            <div className="flex items-center text-sm font-semibold text-brand-400 group-hover:text-brand-300 transition-colors">
              <span>Ver detalhes</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
