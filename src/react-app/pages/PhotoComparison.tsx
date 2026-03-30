import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';

interface ProgressPhoto {
  id: number;
  image_key: string;
  weight_kg: number;
  notes: string | null;
  photo_date: string;
}

export default function PhotoComparison() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [selectedPhoto1, setSelectedPhoto1] = useState<ProgressPhoto | null>(null);
  const [selectedPhoto2, setSelectedPhoto2] = useState<ProgressPhoto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/progress-photos');
      const data = await response.json();
      setPhotos(data);
      
      // Auto-select first and last photo if available
      if (data.length >= 2) {
        setSelectedPhoto1(data[data.length - 1]); // Oldest
        setSelectedPhoto2(data[0]); // Newest
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeightDifference = () => {
    if (!selectedPhoto1 || !selectedPhoto2) return null;
    
    const diff = selectedPhoto2.weight_kg - selectedPhoto1.weight_kg;
    return {
      value: Math.abs(diff),
      isGain: diff > 0
    };
  };

  const getDaysDifference = () => {
    if (!selectedPhoto1 || !selectedPhoto2) return null;
    
    const date1 = new Date(selectedPhoto1.photo_date);
    const date2 = new Date(selectedPhoto2.photo_date);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const weightDiff = getWeightDifference();
  const daysDiff = getDaysDifference();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
        <div className="animate-spin">
          <ImageIcon className="w-12 h-12 text-purple-400" />
        </div>
      </div>
    );
  }

  if (photos.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/nutrition/progress-photos"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Voltar
          </Link>

          <div className="text-center py-16">
            <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-300 mb-2">
              Você precisa de pelo menos 2 fotos
            </h3>
            <p className="text-slate-400 mb-6">
              Adicione mais fotos de progresso para comparar sua evolução
            </p>
            <Link
              to="/nutrition/progress-photos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-purple-500/50 transition-all"
            >
              Adicionar Fotos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/nutrition/progress-photos"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl">
              <ImageIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Comparador de Fotos</h1>
          <p className="text-xl text-slate-300">
            Compare suas fotos de progresso lado a lado
          </p>
        </div>

        {/* Photo Selectors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Photo 1 Selector */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Foto Inicial</h2>
            <select
              value={selectedPhoto1?.id || ''}
              onChange={(e) => {
                const photo = photos.find(p => p.id === parseInt(e.target.value));
                setSelectedPhoto1(photo || null);
              }}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Selecione uma foto</option>
              {photos.map(photo => (
                <option key={photo.id} value={photo.id}>
                  {new Date(photo.photo_date).toLocaleDateString('pt-BR')} - {photo.weight_kg}kg
                </option>
              ))}
            </select>

            {selectedPhoto1 ? (
              <div className="space-y-4">
                <div className="aspect-square bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                    <ImageIcon className="w-24 h-24 text-slate-500" />
                  </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Data</p>
                  <p className="text-lg font-semibold text-white mb-3">
                    {new Date(selectedPhoto1.photo_date).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-slate-400 mb-1">Peso</p>
                  <p className="text-2xl font-bold text-white">{selectedPhoto1.weight_kg}kg</p>
                  {selectedPhoto1.notes && (
                    <>
                      <p className="text-sm text-slate-400 mb-1 mt-3">Observações</p>
                      <p className="text-sm text-slate-300">{selectedPhoto1.notes}</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-slate-900 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-700">
                <div className="text-center">
                  <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">Selecione uma foto</p>
                </div>
              </div>
            )}
          </div>

          {/* Photo 2 Selector */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Foto Atual</h2>
            <select
              value={selectedPhoto2?.id || ''}
              onChange={(e) => {
                const photo = photos.find(p => p.id === parseInt(e.target.value));
                setSelectedPhoto2(photo || null);
              }}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Selecione uma foto</option>
              {photos.map(photo => (
                <option key={photo.id} value={photo.id}>
                  {new Date(photo.photo_date).toLocaleDateString('pt-BR')} - {photo.weight_kg}kg
                </option>
              ))}
            </select>

            {selectedPhoto2 ? (
              <div className="space-y-4">
                <div className="aspect-square bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                    <ImageIcon className="w-24 h-24 text-slate-500" />
                  </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Data</p>
                  <p className="text-lg font-semibold text-white mb-3">
                    {new Date(selectedPhoto2.photo_date).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-slate-400 mb-1">Peso</p>
                  <p className="text-2xl font-bold text-white">{selectedPhoto2.weight_kg}kg</p>
                  {selectedPhoto2.notes && (
                    <>
                      <p className="text-sm text-slate-400 mb-1 mt-3">Observações</p>
                      <p className="text-sm text-slate-300">{selectedPhoto2.notes}</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-slate-900 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-700">
                <div className="text-center">
                  <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">Selecione uma foto</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comparison Stats */}
        {selectedPhoto1 && selectedPhoto2 && (
          <div className="bg-gradient-to-br from-purple-950/50 to-pink-950/50 backdrop-blur-sm border border-purple-800/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Análise do Progresso</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2">Período</p>
                <p className="text-3xl font-bold text-white">{daysDiff}</p>
                <p className="text-slate-300">dias</p>
              </div>

              {weightDiff && (
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-2">Variação de Peso</p>
                  <p className={`text-3xl font-bold ${weightDiff.isGain ? 'text-orange-400' : 'text-green-400'}`}>
                    {weightDiff.isGain ? '+' : '-'}{weightDiff.value.toFixed(1)}kg
                  </p>
                  <p className="text-slate-300">
                    {weightDiff.isGain ? 'ganho' : 'perda'}
                  </p>
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2">Taxa Média</p>
                <p className="text-3xl font-bold text-white">
                  {daysDiff && weightDiff ? (weightDiff.value / (daysDiff / 7)).toFixed(2) : 0}
                </p>
                <p className="text-slate-300">kg/semana</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
