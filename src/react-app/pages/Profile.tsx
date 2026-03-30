import { useState, useEffect, useRef } from 'react';
import { Camera, Award, Dumbbell, Apple, Trophy, Sun, Moon, ChevronRight, Ruler, Weight, Calendar } from 'lucide-react';
import { Link } from 'react-router';

interface UserProfile {
  id: number;
  display_name: string;
  photo_url: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  theme: string;
}

interface UserStats {
  workouts_completed: number;
  meals_logged: number;
  achievements_unlocked: number;
  current_streak: number;
  total_points: number;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingHeight, setIsEditingHeight] = useState(false);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedHeight, setEditedHeight] = useState('');
  const [editedWeight, setEditedWeight] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);
  
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [theme]);
  
  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditedName(data.display_name || 'Usuário');
        setEditedHeight(data.height_cm?.toString() || '');
        setEditedWeight(data.weight_kg?.toString() || '');
        setTheme(data.theme || 'dark');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
  
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/profile/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: profile?.display_name,
          bio: null,
          photo_url: profile?.photo_url,
          height_cm: profile?.height_cm,
          weight_kg: profile?.weight_kg,
          birth_date: null,
          gender: null,
          ...updates
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        return true;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    return false;
  };
  
  const handleSaveName = async () => {
    if (!editedName.trim()) return;
    const success = await updateProfile({ display_name: editedName });
    if (success) setIsEditingName(false);
  };

  const handleSaveHeight = async () => {
    const height = parseFloat(editedHeight);
    if (isNaN(height) || height <= 0) return;
    const success = await updateProfile({ height_cm: height });
    if (success) setIsEditingHeight(false);
  };

  const handleSaveWeight = async () => {
    const weight = parseFloat(editedWeight);
    if (isNaN(weight) || weight <= 0) return;
    const success = await updateProfile({ weight_kg: weight });
    if (success) setIsEditingWeight(false);
  };
  
  const handleCancelEdit = (field: 'name' | 'height' | 'weight') => {
    if (field === 'name') {
      setEditedName(profile?.display_name || 'Usuário');
      setIsEditingName(false);
    } else if (field === 'height') {
      setEditedHeight(profile?.height_cm?.toString() || '');
      setIsEditingHeight(false);
    } else if (field === 'weight') {
      setEditedWeight(profile?.weight_kg?.toString() || '');
      setIsEditingWeight(false);
    }
  };
  
  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    try {
      await fetch('/api/profile/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      });
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };
  
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };
  
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const photoUrl = reader.result as string;
      updateProfile({ photo_url: photoUrl });
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-24">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 pt-12 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/40" />
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2.5 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-white/20"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-white" />
          ) : (
            <Moon className="w-5 h-5 text-white" />
          )}
        </button>
        
        <div className="text-center relative z-10">
          <h1 className="text-white text-2xl font-bold mb-1">Perfil</h1>
          <p className="text-white/80 text-sm">Gerencie suas informações</p>
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto px-4 -mt-24 relative z-20">
        {/* Avatar Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 mb-4 border border-slate-800/50 shadow-2xl">
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="relative">
                {profile?.photo_url ? (
                  <img 
                    src={profile.photo_url} 
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover ring-4 ring-brand-500/20"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold ring-4 ring-brand-500/20">
                    {profile?.display_name?.charAt(0) || 'U'}
                  </div>
                )}
                <button 
                  onClick={handlePhotoClick}
                  className="absolute bottom-0 right-0 p-2.5 bg-brand-500 rounded-full text-white hover:bg-brand-600 transition-colors shadow-lg border-2 border-slate-900"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            
            {/* Name */}
            {isEditingName ? (
              <div className="flex items-center gap-2 w-full max-w-xs">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-800/50 text-white rounded-xl border border-slate-700 focus:border-brand-500 focus:outline-none text-center"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit('name');
                  }}
                />
              </div>
            ) : (
              <button 
                onClick={() => setIsEditingName(true)}
                className="group mb-1"
              >
                <h2 className="text-2xl font-bold text-white group-hover:text-brand-400 transition-colors">
                  {profile?.display_name || 'Usuário'}
                </h2>
              </button>
            )}
            
            <p className="text-slate-400 text-sm mb-4">Toque no nome para editar</p>
            
            {/* Stats */}
            {stats && (
              <div className="flex items-center gap-6 justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats.workouts_completed}</div>
                  <div className="text-xs text-slate-400">Treinos</div>
                </div>
                <div className="w-px h-10 bg-slate-700" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-400">{stats.achievements_unlocked}</div>
                  <div className="text-xs text-slate-400">Conquistas</div>
                </div>
                <div className="w-px h-10 bg-slate-700" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats.current_streak}</div>
                  <div className="text-xs text-slate-400">Sequência</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Height */}
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-slate-800/50">
            {isEditingHeight ? (
              <div>
                <input
                  type="number"
                  value={editedHeight}
                  onChange={(e) => setEditedHeight(e.target.value)}
                  placeholder="Altura"
                  className="w-full px-3 py-2 bg-slate-800/50 text-white rounded-lg border border-slate-700 focus:border-brand-500 focus:outline-none text-sm mb-2"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveHeight();
                    if (e.key === 'Escape') handleCancelEdit('height');
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveHeight}
                    className="flex-1 px-3 py-1.5 bg-brand-500 text-white text-xs rounded-lg hover:bg-brand-600"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => handleCancelEdit('height')}
                    className="flex-1 px-3 py-1.5 bg-slate-700 text-white text-xs rounded-lg hover:bg-slate-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditingHeight(true)}
                className="w-full text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Ruler className="w-4 h-4 text-brand-400" />
                  <span className="text-xs text-slate-400">Altura</span>
                </div>
                <div className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors">
                  {profile?.height_cm ? `${profile.height_cm} cm` : '---'}
                </div>
              </button>
            )}
          </div>

          {/* Weight */}
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-slate-800/50">
            {isEditingWeight ? (
              <div>
                <input
                  type="number"
                  value={editedWeight}
                  onChange={(e) => setEditedWeight(e.target.value)}
                  placeholder="Peso"
                  className="w-full px-3 py-2 bg-slate-800/50 text-white rounded-lg border border-slate-700 focus:border-brand-500 focus:outline-none text-sm mb-2"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveWeight();
                    if (e.key === 'Escape') handleCancelEdit('weight');
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveWeight}
                    className="flex-1 px-3 py-1.5 bg-brand-500 text-white text-xs rounded-lg hover:bg-brand-600"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => handleCancelEdit('weight')}
                    className="flex-1 px-3 py-1.5 bg-slate-700 text-white text-xs rounded-lg hover:bg-slate-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditingWeight(true)}
                className="w-full text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Weight className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-slate-400">Peso</span>
                </div>
                <div className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors">
                  {profile?.weight_kg ? `${profile.weight_kg} kg` : '---'}
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Activity Stats */}
        {stats && (
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-5 mb-4 border border-slate-800/50">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Atividade</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-500/10 rounded-xl">
                  <Dumbbell className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{stats.workouts_completed}</div>
                  <div className="text-xs text-slate-400">Treinos feitos</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-500/10 rounded-xl">
                  <Apple className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{stats.meals_logged}</div>
                  <div className="text-xs text-slate-400">Refeições</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-yellow-500/10 rounded-xl">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{stats.total_points}</div>
                  <div className="text-xs text-slate-400">Pontos totais</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-500/10 rounded-xl">
                  <Calendar className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{stats.current_streak}</div>
                  <div className="text-xs text-slate-400">Dias seguidos</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Links */}
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl border border-slate-800/50 overflow-hidden">
          <Link 
            to="/achievements" 
            className="flex items-center justify-between p-4 hover:bg-slate-800/30 transition-all border-b border-slate-800/30"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-white font-medium">Marcos Alcançados</div>
                <div className="text-xs text-slate-400">Veja seus objetivos alcançados</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </Link>
          
          <Link 
            to="/nutrition/progress-photos" 
            className="flex items-center justify-between p-4 hover:bg-slate-800/30 transition-all border-b border-slate-800/30"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Camera className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-white font-medium">Fotos de Progresso</div>
                <div className="text-xs text-slate-400">Compare sua evolução visual</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </Link>
          
          <Link 
            to="/personal-records" 
            className="flex items-center justify-between p-4 hover:bg-slate-800/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/10 rounded-lg">
                <Trophy className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <div className="text-white font-medium">Recordes Pessoais</div>
                <div className="text-xs text-slate-400">Seus melhores resultados</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </Link>
        </div>
      </div>
    </div>
  );
}
