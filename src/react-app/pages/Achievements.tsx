import { useState, useEffect } from 'react';
import { Target, Lock, CheckCircle2 } from 'lucide-react';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  unlocked: boolean;
  unlocked_at: string | null;
}

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [totalPoints, setTotalPoints] = useState(0);
  
  useEffect(() => {
    fetchAchievements();
  }, []);
  
  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements);
        setTotalPoints(data.total_points);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };
  
  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'workout', label: 'Treino' },
    { id: 'nutrition', label: 'Nutrição' },
    { id: 'progress', label: 'Progresso' },
  ];
  
  const filteredAchievements = filter === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === filter);
  
  const unlockedCount = filteredAchievements.filter(a => a.unlocked).length;
  const totalCount = filteredAchievements.length;
  const progressPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
  
  const categoryPoints = filteredAchievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);
  
  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Target className="w-7 h-7 text-brand-400" />
                Marcos
              </h1>
              <p className="text-sm text-slate-400 mt-1">Seus objetivos alcançados</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-brand-400">
                {filter === 'all' ? totalPoints : categoryPoints}
              </div>
              <div className="text-xs text-slate-400">Pontos</div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">Marcos alcançados</span>
              <span className="text-white font-medium">
                {unlockedCount} / {totalCount}
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          
          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  filter === cat.id
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Achievement Grid */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`glass-dark rounded-xl p-5 border transition-all ${
                achievement.unlocked
                  ? 'border-brand-500/20 bg-brand-500/5'
                  : 'border-slate-800/50 opacity-50'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                  achievement.unlocked
                    ? 'bg-brand-500/10 text-brand-400'
                    : 'bg-slate-800 text-slate-600'
                }`}>
                  {achievement.unlocked ? (
                    <CheckCircle2 className="w-7 h-7" strokeWidth={2.5} />
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold mb-1 ${
                    achievement.unlocked ? 'text-white' : 'text-slate-400'
                  }`}>
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-3">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-brand-400 font-medium">
                      {achievement.points} pts
                    </span>
                    {achievement.unlocked && achievement.unlocked_at && (
                      <span className="text-xs text-slate-500">
                        {new Date(achievement.unlocked_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400">Nenhum marco nesta categoria</p>
          </div>
        )}
      </div>
    </div>
  );
}
