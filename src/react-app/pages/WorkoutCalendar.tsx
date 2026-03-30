import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, X, Plus } from 'lucide-react';

interface WorkoutEntry {
  id: number;
  workout_date: string;
  sport_category: string;
  notes: string | null;
}

export default function WorkoutCalendar() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSport, setSelectedSport] = useState('Musculação');

  const sports = [
    'Musculação',
    'Calistenia',
    'Lutas',
    'Grappling',
    'Futebol',
    'Tênis',
    'Corrida',
    'Vôlei',
    'Handebol',
    'Natação',
    'Basquete',
    'Ciclismo',
    'Yoga',
    'Descanso'
  ];

  useEffect(() => {
    loadWorkouts();
  }, [currentDate]);

  const loadWorkouts = async () => {
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const response = await fetch(`/api/workout-calendar?start_date=${startDate}&end_date=${endDate}`);
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (date: Date) => {
    const workout = getWorkoutForDate(date);
    if (workout) {
      // If workout exists, delete it
      handleDeleteWorkout(date);
    } else {
      // If no workout, show modal to add
      setSelectedDate(date);
      setShowModal(true);
    }
  };

  const handleSaveWorkout = async () => {
    if (!selectedDate) return;

    const dateStr = selectedDate.toISOString().split('T')[0];

    try {
      const response = await fetch('/api/workout-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workout_date: dateStr,
          sport_category: selectedSport,
          notes: null
        })
      });

      if (response.ok) {
        await loadWorkouts();
        setShowModal(false);
        setSelectedDate(null);
      }
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

  const handleDeleteWorkout = async (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];

    try {
      const response = await fetch(`/api/workout-calendar/${dateStr}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadWorkouts();
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  const getWorkoutForDate = (date: Date): WorkoutEntry | undefined => {
    const dateStr = date.toISOString().split('T')[0];
    return workouts.find(w => w.workout_date === dateStr);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Calculate stats
  const totalWorkouts = workouts.length;
  const currentMonthWorkouts = workouts.filter(w => {
    const date = new Date(w.workout_date);
    return date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear();
  }).length;

  // Count workouts by sport
  const sportCounts: Record<string, number> = {};
  workouts.forEach(w => {
    sportCounts[w.sport_category] = (sportCounts[w.sport_category] || 0) + 1;
  });
  const mostPracticedSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin">
          <CalendarIcon className="w-12 h-12 text-brand-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </Link>

        {/* Header */}
        <div className="glass-dark border border-slate-800/50 rounded-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-brand-500 rounded-xl">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Calendário de Treinos
              </h1>
              <p className="text-slate-400 mt-1">
                Registre seus treinos por modalidade
              </p>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="glass-dark border border-slate-800/50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={previousMonth}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-slate-300" />
            </button>
            
            <h2 className="text-2xl font-bold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={nextMonth}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-slate-300" />
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const workout = getWorkoutForDate(date);
              const today = isToday(day);

              let bgColor = 'bg-slate-800';
              let textColor = 'text-slate-300';
              let borderColor = 'border-slate-700';

              if (today) {
                borderColor = 'border-brand-500';
                bgColor = 'bg-brand-500/20';
                textColor = 'text-brand-300';
              } else if (workout) {
                if (workout.sport_category === 'Descanso') {
                  bgColor = 'bg-red-500/20';
                  textColor = 'text-red-300';
                  borderColor = 'border-red-500/50';
                } else {
                  bgColor = 'bg-green-500/20';
                  textColor = 'text-green-300';
                  borderColor = 'border-green-500/50';
                }
              }

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(date)}
                  className={`aspect-square rounded-lg border ${bgColor} ${borderColor} hover:opacity-80 transition-all hover:scale-105`}
                >
                  <div className="h-full flex flex-col items-center justify-center p-1">
                    <span className={`text-sm font-semibold ${textColor} mb-1`}>
                      {day}
                    </span>
                    {workout && (
                      <div className="flex flex-col items-center">
                        {workout.sport_category === 'Descanso' ? (
                          <>
                            <X className="w-4 h-4 text-red-400 mb-0.5" />
                            <span className="text-[8px] text-red-300 text-center leading-tight">
                              Descanso
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-400 mb-0.5" />
                            <span className="text-[8px] text-green-300 text-center leading-tight">
                              {workout.sport_category.length > 8 
                                ? workout.sport_category.substring(0, 7) + '.' 
                                : workout.sport_category}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-dark border border-slate-800/50 rounded-xl p-4">
            <div className="text-sm text-slate-400 mb-1">Este Mês</div>
            <div className="text-2xl font-bold text-white">{currentMonthWorkouts}</div>
          </div>
          <div className="glass-dark border border-slate-800/50 rounded-xl p-4">
            <div className="text-sm text-slate-400 mb-1">Total</div>
            <div className="text-2xl font-bold text-white">{totalWorkouts}</div>
          </div>
          <div className="glass-dark border border-slate-800/50 rounded-xl p-4">
            <div className="text-sm text-slate-400 mb-1">Mais Praticado</div>
            <div className="text-lg font-bold text-white truncate">{mostPracticedSport}</div>
          </div>
        </div>

        {/* Legend */}
        <div className="glass-dark border border-slate-800/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Como usar</h3>
          <div className="space-y-3 mb-6">
            <p className="text-slate-300 text-sm">
              • Clique em um dia vazio para <span className="text-brand-400 font-semibold">registrar treino</span>
            </p>
            <p className="text-slate-300 text-sm">
              • Clique em um dia com treino para <span className="text-red-400 font-semibold">remover</span>
            </p>
            <p className="text-slate-300 text-sm">
              • Escolha a modalidade que você treinou
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg border-2 border-brand-500 bg-brand-500/20 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-slate-300">Hoje</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg border border-green-500/50 bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-sm text-slate-300">Treinado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg border border-red-500/50 bg-red-500/20 flex items-center justify-center">
                <X className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-sm text-slate-300">Descanso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-800" />
              <span className="text-sm text-slate-300">Sem registro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-dark border border-slate-800/50 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Registrar Treino</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-2">
                {selectedDate?.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Qual modalidade você treinou?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {sports.map(sport => (
                  <button
                    key={sport}
                    onClick={() => setSelectedSport(sport)}
                    className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      selectedSport === sport
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveWorkout}
                className="flex-1 px-4 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
