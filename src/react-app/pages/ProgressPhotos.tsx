import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Camera, Upload, Image, Trash2, Calendar, TrendingDown, TrendingUp } from 'lucide-react';

interface ProgressPhoto {
  id: number;
  image_key: string;
  weight_kg: number;
  notes: string | null;
  photo_date: string;
  created_at: string;
}

export default function ProgressPhotos() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTab, setUploadTab] = useState<'camera' | 'gallery'>('camera');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploading, setUploading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/progress-photos');
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedImage || !weight) return;

    setUploading(true);
    try {
      // In a real implementation, you would upload to R2 and get the image_key
      // For now, we'll use the base64 data as the key (not recommended for production)
      const imageKey = `progress_${Date.now()}.jpg`;

      await fetch('/api/progress-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: null,
          image_key: imageKey,
          weight_kg: parseFloat(weight),
          notes: notes || null,
          photo_date: photoDate
        })
      });

      setShowUpload(false);
      setSelectedImage(null);
      setWeight('');
      setNotes('');
      setPhotoDate(new Date().toISOString().split('T')[0]);
      fetchPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Erro ao fazer upload da foto');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir esta foto de progresso?')) return;

    try {
      await fetch(`/api/progress-photo/${id}`, { method: 'DELETE' });
      setPhotos(photos.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const getWeightTrend = (currentIndex: number) => {
    if (currentIndex >= photos.length - 1) return null;
    const current = photos[currentIndex].weight_kg;
    const previous = photos[currentIndex + 1].weight_kg;
    const diff = current - previous;
    return {
      diff: Math.abs(diff),
      isGain: diff > 0
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
        <div className="animate-spin">
          <Camera className="w-12 h-12 text-purple-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/nutrition"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Fotos de Progresso</h1>
          <p className="text-xl text-slate-300">
            Acompanhe sua evolução física ao longo do tempo
          </p>
        </div>

        {/* Add Photo Button */}
        <div className="mb-8 text-center">
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 transition-all"
          >
            <Camera className="w-6 h-6" />
            Adicionar Foto de Progresso
          </button>
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Nova Foto de Progresso</h2>
                <button
                  onClick={() => {
                    setShowUpload(false);
                    setSelectedImage(null);
                  }}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {!selectedImage ? (
                  <div>
                    {/* Tabs */}
                    <div className="flex border-b border-slate-700/50 mb-6">
                      <button
                        onClick={() => setUploadTab('camera')}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all ${
                          uploadTab === 'camera'
                            ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
                            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                        }`}
                      >
                        <Camera className="w-5 h-5" />
                        Tirar Foto
                      </button>
                      <button
                        onClick={() => setUploadTab('gallery')}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all ${
                          uploadTab === 'gallery'
                            ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
                            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                        }`}
                      >
                        <Image className="w-5 h-5" />
                        Enviar da Galeria
                      </button>
                    </div>

                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />

                    {uploadTab === 'camera' ? (
                      <div className="text-center space-y-6">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full flex items-center justify-center mb-6">
                          <Camera className="w-16 h-16 text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Tire uma foto agora</h3>
                        <p className="text-slate-400 max-w-md mx-auto">
                          Use a mesma pose e iluminação para melhor comparação
                        </p>
                        <button
                          onClick={() => cameraInputRef.current?.click()}
                          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 transition-all"
                        >
                          <Camera className="w-6 h-6" />
                          Abrir Câmera
                        </button>
                      </div>
                    ) : (
                      <div className="text-center space-y-6">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full flex items-center justify-center mb-6">
                          <Upload className="w-16 h-16 text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Envie uma foto da galeria</h3>
                        <p className="text-slate-400 max-w-md mx-auto">
                          Selecione uma foto existente do seu dispositivo
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
                ) : (
                  <div className="space-y-6">
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                      <img src={selectedImage} alt="Progress preview" className="w-full max-h-96 object-contain" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Peso (kg) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                        placeholder="75.5"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Data da Foto
                      </label>
                      <input
                        type="date"
                        value={photoDate}
                        onChange={(e) => setPhotoDate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Observações (opcional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                        placeholder="Ex: Comecei a treinar há 3 meses..."
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={handleUpload}
                        disabled={uploading || !weight}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? 'Salvando...' : 'Salvar Foto'}
                      </button>
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="px-6 py-3 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 transition-all"
                      >
                        Trocar Foto
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/50 rounded-full mb-4">
              <Camera className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              Nenhuma foto registrada ainda
            </h3>
            <p className="text-slate-400">
              Comece adicionando sua primeira foto de progresso
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo, index) => {
              const trend = getWeightTrend(index);
              return (
                <div
                  key={photo.id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all"
                >
                  <div className="aspect-square bg-slate-900 flex items-center justify-center">
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-500">
                      <Camera className="w-16 h-16" />
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(photo.photo_date).toLocaleDateString('pt-BR')}
                      </div>
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                      >
                        <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-white">{photo.weight_kg.toFixed(1)} kg</p>
                        {trend && (
                          <div className={`flex items-center gap-1 text-sm ${trend.isGain ? 'text-orange-400' : 'text-green-400'}`}>
                            {trend.isGain ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span>{trend.diff.toFixed(1)} kg</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {photo.notes && (
                      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
                        <p className="text-sm text-slate-300">{photo.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-12 bg-gradient-to-br from-purple-950/50 to-pink-950/50 backdrop-blur-sm border border-purple-800/50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Camera className="w-6 h-6 text-purple-400" />
            Dicas para Melhores Fotos de Progresso
          </h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span>Tire fotos sempre no mesmo horário do dia (de preferência pela manhã)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span>Use a mesma iluminação e fundo para facilitar a comparação</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span>Mantenha a mesma pose em todas as fotos (frente, lateral, costas)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span>Registre fotos a cada 2-4 semanas para ver mudanças significativas</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">•</span>
              <span>Use roupas justas ou tirando fotos de roupa de banho para melhor visualização</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
