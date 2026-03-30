import { useState, useEffect } from 'react';

import { Search, Dumbbell, Sparkles, ListChecks, CircleDot, Swords, Trophy, Flame, Hand, Circle, X } from 'lucide-react';
import type { Exercise } from '@/shared/types';
import ExerciseCard from '@/react-app/components/ExerciseCard';
import FilterPanel from '@/react-app/components/FilterPanel';
import FeatureCard from '@/react-app/components/FeatureCard';
import SecondaryFeatureCard from '@/react-app/components/SecondaryFeatureCard';

export default function Home() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('Musculação');
  const [selectedMartialArtType, setSelectedMartialArtType] = useState<string>('Lutas');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchQuery, selectedSport, selectedMartialArtType, selectedMuscleGroup, selectedDifficulty]);

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/exercises');
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    if (selectedSport === 'Artes Marciais') {
      if (selectedMartialArtType === 'Lutas') {
        filtered = filtered.filter(ex => ex.sport_category === 'Artes Marciais - Lutas');
      } else {
        filtered = filtered.filter(ex => ex.sport_category === 'Artes Marciais - Grappling');
      }
    } else {
      filtered = filtered.filter(ex => ex.sport_category === selectedSport);
    }

    if (selectedMuscleGroup) {
      filtered = filtered.filter(ex => ex.muscle_group === selectedMuscleGroup);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(ex => ex.difficulty === selectedDifficulty);
    }

    if (searchQuery) {
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredExercises(filtered);
  };

  const getAvailableMuscleGroups = () => {
    let sportFiltered = exercises;
    
    if (selectedSport === 'Artes Marciais') {
      if (selectedMartialArtType === 'Lutas') {
        sportFiltered = sportFiltered.filter(ex => ex.sport_category === 'Artes Marciais - Lutas');
      } else {
        sportFiltered = sportFiltered.filter(ex => ex.sport_category === 'Artes Marciais - Grappling');
      }
    } else {
      sportFiltered = sportFiltered.filter(ex => ex.sport_category === selectedSport);
    }

    const muscleGroups = Array.from(new Set(sportFiltered.map(ex => ex.muscle_group))).sort();
    return muscleGroups;
  };

  const getAvailableDifficulties = () => {
    let sportFiltered = exercises;
    
    if (selectedSport === 'Artes Marciais') {
      if (selectedMartialArtType === 'Lutas') {
        sportFiltered = sportFiltered.filter(ex => ex.sport_category === 'Artes Marciais - Lutas');
      } else {
        sportFiltered = sportFiltered.filter(ex => ex.sport_category === 'Artes Marciais - Grappling');
      }
    } else {
      sportFiltered = sportFiltered.filter(ex => ex.sport_category === selectedSport);
    }

    const difficulties = Array.from(new Set(sportFiltered.map(ex => ex.difficulty))).sort();
    return difficulties;
  };

  const handleClearFilters = () => {
    setSelectedMuscleGroup('');
    setSelectedDifficulty('');
  };

  const sports = [
    { id: 'Musculação', name: 'Musculação', icon: Dumbbell, color: 'from-blue-500 to-cyan-600' },
    { id: 'Calistenia', name: 'Calistenia', icon: Dumbbell, color: 'from-indigo-500 to-blue-600' },
    { id: 'Futebol', name: 'Futebol', icon: CircleDot, color: 'from-green-500 to-emerald-600' },
    { id: 'Basquete', name: 'Basquete', icon: Circle, color: 'from-orange-500 to-red-500' },
    { id: 'Vôlei', name: 'Vôlei', icon: Hand, color: 'from-purple-500 to-pink-600' },
    { id: 'Natação', name: 'Natação', icon: Flame, color: 'from-cyan-500 to-blue-500' },
    { id: 'Corrida', name: 'Corrida', icon: Flame, color: 'from-amber-500 to-orange-600' },
    { id: 'Ciclismo', name: 'Ciclismo', icon: Circle, color: 'from-lime-500 to-green-600' },
    { id: 'Tênis', name: 'Tênis', icon: Trophy, color: 'from-yellow-500 to-amber-500' },
    { id: 'Handebol', name: 'Handebol', icon: CircleDot, color: 'from-teal-500 to-cyan-500' },
    { id: 'Artes Marciais', name: 'Artes Marciais', icon: Swords, color: 'from-red-500 to-rose-600' },
    { id: 'Yoga', name: 'Yoga', icon: Sparkles, color: 'from-violet-500 to-purple-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin">
          <Dumbbell className="w-12 h-12 text-brand-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Compact Hero Header */}
      <div className="relative overflow-hidden bg-slate-900 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-purple-500/5" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="p-3 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-xl flex-shrink-0">
              <Dumbbell className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            
            {/* Title and Tagline */}
            <div className="flex-shrink-0">
              <h1 className="text-4xl font-bold text-white font-display">
                LifePlus<span className="text-brand-400">+</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">Treinos e nutrição com IA</p>
            </div>
            
            {/* Stats - More to the left */}
            <div className="flex items-center gap-6 ml-8">
              <div className="text-left">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-xs text-slate-400">Exercícios</div>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div className="text-left">
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-xs text-slate-400">Modalidades</div>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div className="text-left">
                <div className="text-2xl font-bold text-brand-400">IA</div>
                <div className="text-xs text-slate-400">Powered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions - For All Sports */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <FeatureCard
              to={`/workout-builder?sport=${encodeURIComponent(selectedSport === 'Artes Marciais' ? (selectedMartialArtType === 'Lutas' ? 'Artes Marciais - Lutas' : 'Artes Marciais - Grappling') : selectedSport)}`}
              icon={Sparkles}
              title="Criar Treino com IA"
              description={`Treino personalizado de ${selectedSport === 'Artes Marciais' ? selectedMartialArtType : selectedSport}`}
              gradient="from-brand-500 to-purple-600"
              featured
            />
            <FeatureCard
              to="/my-workouts"
              icon={ListChecks}
              title="Meus Treinos"
              description="Acesse seus planos de treino salvos"
              gradient="from-indigo-500 to-brand-600"
            />
          </div>

          {/* Compact Secondary Features - Only for Musculação */}
          {selectedSport === 'Musculação' && (
            <div className="glass-dark rounded-xl p-4">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                <SecondaryFeatureCard 
                  to="/workout-calendar" 
                  icon="📅" 
                  title="Calendário de Treinos"
                  showCalendar
                />
                <SecondaryFeatureCard to="/my-loads" icon="💪" title="Minhas Cargas" />
                <SecondaryFeatureCard to="/personal-records" icon="🏆" title="Recordes (PR)" />
                <SecondaryFeatureCard to="/form-check" icon="📹" title="Análise da Execução" />
                <SecondaryFeatureCard to="/workout-chat" icon="💬" title="Assistente IA" />
              </div>
            </div>
          )}
        </div>

        {/* Sport Selection - Scrollable Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Selecione a Modalidade</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {sports.map((sport) => {
              const Icon = sport.icon;
              const isSelected = selectedSport === sport.id;
              
              return (
                <button
                  key={sport.id}
                  onClick={() => setSelectedSport(sport.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-r ' + sport.color + ' text-white shadow-lg scale-105' 
                      : 'glass-dark text-slate-400 hover:text-white hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                  <span className="font-semibold text-sm">{sport.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Martial Arts Type - Compact */}
        {selectedSport === 'Artes Marciais' && (
          <div className="mb-8">
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedMartialArtType('Lutas')}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  selectedMartialArtType === 'Lutas'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">🥊</span>
                  <span className="font-semibold text-white text-sm">Lutas</span>
                </div>
              </button>
              <button
                onClick={() => setSelectedMartialArtType('Grappling')}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  selectedMartialArtType === 'Grappling'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">🤼</span>
                  <span className="font-semibold text-white text-sm">Grappling</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Compact Search and Filters Row */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar exercícios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 glass-dark rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filters */}
          {(getAvailableMuscleGroups().length > 0 || getAvailableDifficulties().length > 0) && (
            <FilterPanel
              muscleGroups={getAvailableMuscleGroups()}
              difficulties={getAvailableDifficulties()}
              selectedMuscleGroup={selectedMuscleGroup}
              selectedDifficulty={selectedDifficulty}
              onMuscleGroupChange={setSelectedMuscleGroup}
              onDifficultyChange={setSelectedDifficulty}
              onClear={handleClearFilters}
            />
          )}
        </div>

        {/* Exercise Grid with Results Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              {filteredExercises.length} {filteredExercises.length === 1 ? 'Exercício' : 'Exercícios'}
            </h2>
            {(selectedMuscleGroup || selectedDifficulty) && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>

          {filteredExercises.length === 0 ? (
            <div className="glass-dark rounded-xl p-12 text-center">
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="text-lg font-bold text-white mb-1">Nenhum exercício encontrado</h3>
              <p className="text-slate-400 text-sm">Tente ajustar os filtros ou a busca</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
