import { useState } from 'react';
import { ChevronRight, Dumbbell, Apple, Trophy, Target, Zap, Heart } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  
  const slides = [
    {
      icon: Dumbbell,
      gradient: 'from-brand-500 to-purple-600',
      title: 'Bem-vindo ao LifePlus+',
      description: 'Seu assistente pessoal de treino e nutrição. Alcance seus objetivos com inteligência artificial.',
    },
    {
      icon: Target,
      gradient: 'from-purple-500 to-pink-600',
      title: '500+ Exercícios',
      description: 'Acesse uma biblioteca completa com exercícios de 11 modalidades diferentes, de musculação a yoga.',
    },
    {
      icon: Zap,
      gradient: 'from-amber-500 to-orange-600',
      title: 'Treinos Personalizados',
      description: 'Nossa IA cria treinos sob medida para você, baseados em seus objetivos e nível de experiência.',
    },
    {
      icon: Apple,
      gradient: 'from-green-500 to-emerald-600',
      title: 'Nutrição Inteligente',
      description: 'Escaneie alimentos, calcule calorias, gere dietas personalizadas e acompanhe sua evolução.',
    },
    {
      icon: Trophy,
      gradient: 'from-yellow-500 to-amber-600',
      title: 'Conquistas e Progresso',
      description: 'Registre PRs, tire fotos de progresso e desbloqueie conquistas conforme você evolui.',
    },
    {
      icon: Heart,
      gradient: 'from-red-500 to-rose-600',
      title: 'Pronto para começar?',
      description: 'Vamos transformar sua rotina de treinos e nutrição. Seu progresso começa agora!',
    },
  ];
  
  const currentSlide = slides[step];
  const Icon = currentSlide.icon;
  const isLastSlide = step === slides.length - 1;
  
  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  };
  
  const handleSkip = () => {
    onComplete();
  };
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950">
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      
      <div className="relative w-full max-w-md px-6">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-0 right-6 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          Pular
        </button>
        
        {/* Icon */}
        <div className="mb-12 flex justify-center">
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${currentSlide.gradient} rounded-3xl blur-2xl opacity-50`} />
            <div className={`relative p-8 bg-gradient-to-br ${currentSlide.gradient} rounded-3xl shadow-2xl`}>
              <Icon className="w-20 h-20 text-white" strokeWidth={2} />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4 font-display">
            {currentSlide.title}
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            {currentSlide.description}
          </p>
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setStep(index)}
              className={`h-2 rounded-full transition-all ${
                index === step
                  ? 'w-8 bg-brand-500'
                  : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>
        
        {/* Next button */}
        <button
          onClick={handleNext}
          className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2 bg-gradient-to-r ${currentSlide.gradient}`}
        >
          <span>{isLastSlide ? 'Começar agora' : 'Próximo'}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
