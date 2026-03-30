import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Search, Apple, Beef, Wheat, Salad, Cherry, Droplet, Pizza, Candy, Cookie, Coffee, Wine } from 'lucide-react';

interface Food {
  id: number;
  name: string;
  category: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
}

const categoryIcons: Record<string, any> = {
  'Proteínas': Beef,
  'Carboidratos': Wheat,
  'Vegetais': Salad,
  'Frutas': Cherry,
  'Gorduras': Droplet,
  'Laticínios': Apple,
  'Leguminosas': Apple,
  'Snacks': Apple,
  'Fast Food': Pizza,
  'Doces': Candy,
  'Salgadinhos': Cookie,
  'Bebidas': Coffee,
  'Bebidas Alcoólicas': Wine,
};

const categoryColors: Record<string, string> = {
  'Proteínas': 'from-red-500 to-pink-600',
  'Carboidratos': 'from-yellow-500 to-orange-600',
  'Vegetais': 'from-green-500 to-emerald-600',
  'Frutas': 'from-purple-500 to-pink-600',
  'Gorduras': 'from-orange-500 to-red-600',
  'Laticínios': 'from-blue-500 to-cyan-600',
  'Leguminosas': 'from-amber-500 to-yellow-600',
  'Snacks': 'from-indigo-500 to-purple-600',
  'Fast Food': 'from-red-600 to-orange-600',
  'Doces': 'from-pink-500 to-rose-600',
  'Salgadinhos': 'from-amber-600 to-orange-700',
  'Bebidas': 'from-cyan-500 to-blue-600',
  'Bebidas Alcoólicas': 'from-purple-600 to-violet-700',
};

export default function FoodCalories() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const response = await fetch('/api/food-database');
      const data = await response.json();
      setFoods(data);
      
      const uniqueCategories = Array.from(new Set(data.map((f: Food) => f.category)));
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div className="animate-spin">
          <Apple className="w-12 h-12 text-green-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/nutrition"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl">
              <Apple className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Tabela de Calorias</h1>
          <p className="text-xl text-slate-300">
            Consulte as informações nutricionais de diversos alimentos
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar alimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Food Grid */}
        {filteredFoods.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/50 rounded-full mb-4">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              Nenhum alimento encontrado
            </h3>
            <p className="text-slate-400">
              Tente buscar por outro nome ou categoria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFoods.map((food) => {
              const Icon = categoryIcons[food.category] || Apple;
              const gradient = categoryColors[food.category] || 'from-gray-500 to-slate-600';
              
              return (
                <div
                  key={food.id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-green-500/50 transition-all"
                >
                  <div className={`bg-gradient-to-r ${gradient} px-4 py-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-white" />
                      <span className="text-xs font-semibold text-white/80">{food.category}</span>
                    </div>
                    <span className="text-xs text-white/60">{food.serving_size}</span>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-4">{food.name}</h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-400">{food.calories}</p>
                        <p className="text-xs text-slate-400">Calorias</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-400">{food.protein}g</p>
                        <p className="text-xs text-slate-400">Proteína</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-yellow-400">{food.carbs}g</p>
                        <p className="text-xs text-slate-400">Carboidratos</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-orange-400">{food.fat}g</p>
                        <p className="text-xs text-slate-400">Gorduras</p>
                      </div>
                    </div>

                    {food.fiber && food.fiber > 0 && (
                      <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center">
                        <p className="text-sm text-green-400">
                          <span className="font-bold">{food.fiber}g</span> de fibras
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-gradient-to-br from-green-950/50 to-emerald-950/50 backdrop-blur-sm border border-green-800/50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Apple className="w-6 h-6 text-green-400" />
            Como Usar Esta Tabela
          </h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">•</span>
              <span>Use a busca para encontrar rapidamente qualquer alimento</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">•</span>
              <span>Filtre por categoria para ver grupos específicos de alimentos</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">•</span>
              <span>Os valores são baseados na porção indicada em cada card</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">•</span>
              <span>Compare alimentos para fazer escolhas mais saudáveis</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
