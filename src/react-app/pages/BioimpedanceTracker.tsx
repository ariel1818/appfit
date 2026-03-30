import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Activity, Plus, TrendingDown, TrendingUp, Calendar, Trash2, Camera, Upload, Image } from 'lucide-react';
import type { BioimpedanceRecord } from '@/shared/bioimpedance-types';

export default function BioimpedanceTracker() {
  const [records, setRecords] = useState<BioimpedanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/bioimpedance');
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir este registro?')) return;

    try {
      await fetch(`/api/bioimpedance/${id}`, { method: 'DELETE' });
      setRecords(records.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const getTrend = (current: number, previous: number | undefined, lowerIsBetter: boolean = false) => {
    if (!previous) return null;
    const diff = current - previous;
    const isImproving = lowerIsBetter ? diff < 0 : diff > 0;
    return {
      diff: Math.abs(diff),
      isImproving,
      icon: isImproving ? TrendingUp : TrendingDown,
      color: isImproving ? 'text-green-400' : 'text-red-400'
    };
  };

  const latestRecord = records[0];
  const previousRecord = records[1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/nutrition"
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <Activity className="w-10 h-10 text-blue-400" />
                Bioimpedância
              </h1>
              <p className="text-slate-400 mt-1">Acompanhe sua composição corporal</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg"
            >
              <Camera className="w-5 h-5" />
              Escanear Papel
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Inserir Manualmente
            </button>
          </div>
        </div>

        {/* Scanner */}
        {showScanner && (
          <BioimpedanceScanner
            onClose={() => setShowScanner(false)}
            onSuccess={() => {
              setShowScanner(false);
              setShowForm(false);
              fetchRecords();
            }}
          />
        )}

        {/* Add Record Form */}
        {showForm && (
          <AddRecordForm 
            onClose={() => setShowForm(false)} 
            onSuccess={() => {
              setShowForm(false);
              fetchRecords();
            }} 
          />
        )}

        {/* Latest Stats */}
        {latestRecord && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Peso"
              value={`${latestRecord.weight_kg.toFixed(1)} kg`}
              trend={getTrend(latestRecord.weight_kg, previousRecord?.weight_kg, true)}
            />
            <StatCard
              label="Gordura Corporal"
              value={`${latestRecord.body_fat_percentage.toFixed(1)}%`}
              trend={getTrend(latestRecord.body_fat_percentage, previousRecord?.body_fat_percentage, true)}
            />
            <StatCard
              label="Massa Muscular"
              value={`${latestRecord.muscle_mass_kg.toFixed(1)} kg`}
              trend={getTrend(latestRecord.muscle_mass_kg, previousRecord?.muscle_mass_kg)}
            />
            <StatCard
              label="Água Corporal"
              value={`${latestRecord.water_percentage.toFixed(1)}%`}
              trend={getTrend(latestRecord.water_percentage, previousRecord?.water_percentage)}
            />
          </div>
        )}

        {/* Records List */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            Histórico de Medições
          </h2>
          
          {loading ? (
            <div className="text-center py-12 text-slate-400">Carregando...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              Nenhuma medição registrada ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <RecordCard
                  key={record.id}
                  record={record}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend }: { 
  label: string; 
  value: string; 
  trend: { diff: number; isImproving: boolean; icon: any; color: string } | null;
}) {
  const TrendIcon = trend?.icon;
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <div className="text-slate-400 text-sm mb-1">{label}</div>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      {trend && TrendIcon && (
        <div className={`flex items-center gap-1 text-sm ${trend.color}`}>
          <TrendIcon className="w-4 h-4" />
          <span>{trend.diff.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}

function RecordCard({ record, onDelete }: { record: BioimpedanceRecord; onDelete: (id: number) => void }) {
  const date = new Date(record.measured_at);
  
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-slate-400 text-sm">
            {date.toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
        <button
          onClick={() => onDelete(record.id)}
          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
        >
          <Trash2 className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-slate-500 text-xs mb-1">Peso</div>
          <div className="text-white font-semibold">{record.weight_kg.toFixed(1)} kg</div>
        </div>
        <div>
          <div className="text-slate-500 text-xs mb-1">Gordura</div>
          <div className="text-white font-semibold">{record.body_fat_percentage.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-slate-500 text-xs mb-1">Músculo</div>
          <div className="text-white font-semibold">{record.muscle_mass_kg.toFixed(1)} kg</div>
        </div>
        <div>
          <div className="text-slate-500 text-xs mb-1">Água</div>
          <div className="text-white font-semibold">{record.water_percentage.toFixed(1)}%</div>
        </div>
        {record.bone_mass_kg !== null && (
          <div>
            <div className="text-slate-500 text-xs mb-1">Massa Óssea</div>
            <div className="text-white font-semibold">{record.bone_mass_kg.toFixed(1)} kg</div>
          </div>
        )}
        {record.visceral_fat_level !== null && (
          <div>
            <div className="text-slate-500 text-xs mb-1">Gordura Visceral</div>
            <div className="text-white font-semibold">Nível {record.visceral_fat_level}</div>
          </div>
        )}
        {record.bmr !== null && (
          <div>
            <div className="text-slate-500 text-xs mb-1">TMB</div>
            <div className="text-white font-semibold">{record.bmr.toFixed(0)} kcal</div>
          </div>
        )}
        {record.metabolic_age !== null && (
          <div>
            <div className="text-slate-500 text-xs mb-1">Idade Metabólica</div>
            <div className="text-white font-semibold">{record.metabolic_age} anos</div>
          </div>
        )}
      </div>
    </div>
  );
}

function BioimpedanceScannerTabs({ onImageSelect }: { onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  const [activeTab, setActiveTab] = useState<'camera' | 'gallery'>('camera');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-slate-700/50 mb-6">
        <button
          onClick={() => setActiveTab('camera')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all ${
            activeTab === 'camera'
              ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
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
              ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
          }`}
        >
          <Image className="w-5 h-5" />
          Enviar da Galeria
        </button>
      </div>

      {/* Tab Content */}
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
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full flex items-center justify-center mb-6">
            <Camera className="w-16 h-16 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">Fotografe o papel agora</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Use a câmera do seu dispositivo para capturar o relatório de bioimpedância
          </p>
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 transition-all"
          >
            <Camera className="w-6 h-6" />
            Abrir Câmera
          </button>

          <div className="bg-purple-950/30 border border-purple-800/50 rounded-xl p-6 mt-8">
            <h4 className="text-lg font-bold text-white mb-3">📋 Dicas para melhor escaneamento</h4>
            <ul className="text-sm text-slate-300 space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Certifique-se que todo o papel está visível na foto</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Use boa iluminação, evite sombras</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Tire a foto de cima, perpendicular ao papel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Certifique-se que os números estão legíveis</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full flex items-center justify-center mb-6">
            <Upload className="w-16 h-16 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">Envie uma foto da galeria</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Selecione uma imagem já existente do seu relatório de bioimpedância
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
  );
}

function BioimpedanceScanner({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      scanImage(file);
    };
    reader.readAsDataURL(file);
  };

  const scanImage = async (file: File) => {
    setScanning(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/scan-bioimpedance', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao escanear papel');
      }

      const data = await response.json();
      
      // Save directly to database
      await fetch('/api/bioimpedance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: null,
          weight_kg: data.weight_kg,
          body_fat_percentage: data.body_fat_percentage,
          muscle_mass_kg: data.muscle_mass_kg,
          water_percentage: data.water_percentage,
          bone_mass_kg: data.bone_mass_kg || null,
          visceral_fat_level: data.visceral_fat_level || null,
          bmr: data.bmr || null,
          metabolic_age: data.metabolic_age || null
        })
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error scanning bioimpedance:', error);
      setError(error.message || 'Erro ao escanear papel. Tente novamente.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Escanear Papel de Bioimpedância</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {!image ? (
        <BioimpedanceScannerTabs onImageSelect={handleImageUpload} />
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
            <img src={image} alt="Bioimpedance scan" className="w-full max-h-96 object-contain" />
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-800/50 rounded-xl p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {scanning ? (
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-white font-semibold">Extraindo dados do papel...</p>
            </div>
          ) : (
            <button
              onClick={() => {
                setImage(null);
                setError(null);
              }}
              className="w-full px-6 py-3 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 transition-all"
            >
              Escanear Outro Papel
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AddRecordForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    weight_kg: '',
    body_fat_percentage: '',
    muscle_mass_kg: '',
    water_percentage: '',
    bone_mass_kg: '',
    visceral_fat_level: '',
    bmr: '',
    metabolic_age: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        profile_id: null,
        weight_kg: parseFloat(formData.weight_kg),
        body_fat_percentage: parseFloat(formData.body_fat_percentage),
        muscle_mass_kg: parseFloat(formData.muscle_mass_kg),
        water_percentage: parseFloat(formData.water_percentage),
        bone_mass_kg: formData.bone_mass_kg ? parseFloat(formData.bone_mass_kg) : null,
        visceral_fat_level: formData.visceral_fat_level ? parseInt(formData.visceral_fat_level) : null,
        bmr: formData.bmr ? parseFloat(formData.bmr) : null,
        metabolic_age: formData.metabolic_age ? parseInt(formData.metabolic_age) : null
      };

      await fetch('/api/bioimpedance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Erro ao salvar medição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Nova Medição de Bioimpedância</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Peso (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.weight_kg}
              onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="75.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Gordura Corporal (%) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.body_fat_percentage}
              onChange={(e) => setFormData({ ...formData, body_fat_percentage: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="18.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Massa Muscular (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.muscle_mass_kg}
              onChange={(e) => setFormData({ ...formData, muscle_mass_kg: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="55.2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Água Corporal (%) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.water_percentage}
              onChange={(e) => setFormData({ ...formData, water_percentage: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="60.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Massa Óssea (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.bone_mass_kg}
              onChange={(e) => setFormData({ ...formData, bone_mass_kg: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="3.2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Gordura Visceral (nível)
            </label>
            <input
              type="number"
              value={formData.visceral_fat_level}
              onChange={(e) => setFormData({ ...formData, visceral_fat_level: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="8"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              TMB (kcal)
            </label>
            <input
              type="number"
              value={formData.bmr}
              onChange={(e) => setFormData({ ...formData, bmr: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="1650"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Idade Metabólica (anos)
            </label>
            <input
              type="number"
              value={formData.metabolic_age}
              onChange={(e) => setFormData({ ...formData, metabolic_age: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="28"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Medição'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-all"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
