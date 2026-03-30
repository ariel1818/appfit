import { Apple, Sparkles, Camera } from 'lucide-react';
import FeatureCard from '@/react-app/components/FeatureCard';
import SecondaryFeatureCard from '@/react-app/components/SecondaryFeatureCard';

export default function NutritionHome() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Compact Hero Header */}
      <div className="relative overflow-hidden bg-slate-900 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-success-500/5 to-emerald-500/5" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="p-3 bg-gradient-to-br from-success-500 to-emerald-600 rounded-2xl shadow-xl flex-shrink-0">
              <Apple className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            
            {/* Title and Tagline */}
            <div className="flex-shrink-0">
              <h1 className="text-4xl font-bold text-white font-display">
                LifePlus<span className="text-success-400">+</span> Nutrição
              </h1>
              <p className="text-slate-400 text-sm mt-1">Alimentação inteligente e personalizada</p>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-6 ml-8">
              <div className="text-left">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-slate-400">Personalizado</div>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div className="text-left">
                <div className="text-2xl font-bold text-success-400">IA</div>
                <div className="text-xs text-slate-400">Nutricional</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Primary Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <FeatureCard
            to="/nutrition/diet-generator"
            icon={Sparkles}
            title="Gerador de Dieta IA"
            description="Planos alimentares personalizados com inteligência artificial"
            gradient="from-success-500 to-emerald-600"
            featured
          />
          <FeatureCard
            to="/nutrition/food-scanner"
            icon={Camera}
            title="Scanner de Alimentos"
            description="Análise nutricional instantânea por foto"
            gradient="from-emerald-500 to-teal-600"
          />
        </div>

        {/* Secondary Features - Compact Grid */}
        <div className="glass-dark rounded-xl p-4">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            <SecondaryFeatureCard 
              to="/nutrition/calculator" 
              icon="🧮" 
              title="Calculadora TMB/NDC (Taxa Metabólica Basal e Necessidade Diária de Calorias)"
              imageUrl="https://mocha-cdn.com/019a7ac1-2d64-727a-be98-94f4e2b55df9/calculator-pro-2100.png"
            />
            <SecondaryFeatureCard to="/nutrition/daily-log" icon="📅" title="Registro Diário das Refeições" showCalendar />
            <SecondaryFeatureCard to="/nutrition/my-diets" icon="📖" title="Minhas Dietas" />
            <SecondaryFeatureCard to="/nutrition/food-calories" icon="📋" title="Tabela Nutricional" />
            <SecondaryFeatureCard to="/nutrition/progress-photos" icon="📸" title="Fotos do Progresso" />
            <SecondaryFeatureCard to="/nutrition/photo-comparison" icon="🔄" title="Comparar Fotos" />
            <SecondaryFeatureCard to="/nutrition/dashboard" icon="📊" title="Dashboard" />
            <SecondaryFeatureCard to="/nutrition/bioimpedance" icon="⚖️" title="Bioimpedância" />
            <SecondaryFeatureCard to="/nutrition/chat" icon="💬" title="Assistente IA" />
          </div>
        </div>
      </div>
    </div>
  );
}
