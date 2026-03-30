import { useState, useEffect } from 'react';
import { Save, X, LocationEdit as Edit2, Clock, Play, Pause, RotateCcw } from 'lucide-react';

interface WorkoutLoggerProps {
  planId: number;
  dayNumber: number;
  exercises: any[];
  onSave: (log: any) => void;
  onClose: () => void;
}

export default function WorkoutLogger({ planId, dayNumber, exercises, onSave, onClose }: WorkoutLoggerProps) {
  const [exerciseLogs, setExerciseLogs] = useState<Record<number, { weight: string; reps: string; notes: string }>>({});
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            // Play a notification sound or show alert
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSeconds]);

  const startTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setTimerRunning(true);
    setTimerActive(true);
  };

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = (seconds: number = 90) => {
    setTimerSeconds(seconds);
    setTimerRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogChange = (exerciseId: number, field: string, value: string) => {
    setExerciseLogs(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    const log = {
      plan_id: planId,
      day_number: dayNumber,
      exercises: Object.entries(exerciseLogs).map(([id, data]) => ({
        plan_exercise_id: parseInt(id),
        weight_kg: data.weight ? parseFloat(data.weight) : null,
        reps_completed: data.reps || '',
        notes: data.notes || ''
      }))
    };

    try {
      const response = await fetch('/api/workout-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });

      if (response.ok) {
        const saved = await response.json();
        onSave(saved);
        onClose();
      }
    } catch (error) {
      console.error('Error saving workout log:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Edit2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Registrar Treino</h2>
              <p className="text-slate-400">Dia {dayNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Rest Timer */}
        {timerActive && (
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-white" />
                <div>
                  <p className="text-sm text-white/80">Descanso</p>
                  <p className="text-3xl font-bold text-white">{formatTime(timerSeconds)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTimer}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  {timerRunning ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" />
                  )}
                </button>
                <button
                  onClick={() => resetTimer()}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setTimerActive(false)}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 space-y-4">
          {exercises.map((exercise, index) => (
            <div key={exercise.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{exercise.name}</h3>
                  <p className="text-sm text-slate-400">
                    {exercise.sets} séries × {exercise.reps} reps
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Ex: 20"
                    value={exerciseLogs[exercise.id]?.weight || ''}
                    onChange={(e) => handleLogChange(exercise.id, 'weight', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Repetições
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 12,10,10"
                    value={exerciseLogs[exercise.id]?.reps || ''}
                    onChange={(e) => handleLogChange(exercise.id, 'reps', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Notas
                  </label>
                  <input
                    type="text"
                    placeholder="Observações"
                    value={exerciseLogs[exercise.id]?.notes || ''}
                    onChange={(e) => handleLogChange(exercise.id, 'notes', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Quick Timer Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => startTimer(60)}
                  className="flex-1 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 text-indigo-300 rounded-lg text-sm font-semibold transition-all"
                >
                  <Clock className="w-4 h-4 inline mr-1" />
                  1:00
                </button>
                <button
                  onClick={() => startTimer(90)}
                  className="flex-1 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 text-indigo-300 rounded-lg text-sm font-semibold transition-all"
                >
                  <Clock className="w-4 h-4 inline mr-1" />
                  1:30
                </button>
                <button
                  onClick={() => startTimer(120)}
                  className="flex-1 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 text-indigo-300 rounded-lg text-sm font-semibold transition-all"
                >
                  <Clock className="w-4 h-4 inline mr-1" />
                  2:00
                </button>
                <button
                  onClick={() => startTimer(180)}
                  className="flex-1 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 text-indigo-300 rounded-lg text-sm font-semibold transition-all"
                >
                  <Clock className="w-4 h-4 inline mr-1" />
                  3:00
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-6">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105 transition-all"
          >
            <Save className="w-5 h-5" />
            Salvar Treino
          </button>
        </div>
      </div>
    </div>
  );
}
