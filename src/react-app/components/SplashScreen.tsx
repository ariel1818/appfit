import { useEffect, useState } from 'react';
import { Dumbbell } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const duration = 500; // Fast splash
    const steps = 20;
    const interval = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 50);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [onComplete]);
  
  const handleSkip = () => {
    onComplete();
  };
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 mesh-gradient opacity-50" />
      
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium bg-slate-800/50 hover:bg-slate-700/50 rounded-lg"
      >
        Pular
      </button>
      
      <div className="relative text-center">
        {/* Logo with pulse animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-purple-600 rounded-3xl blur-2xl opacity-50 animate-pulse" />
            <div className="relative p-6 bg-gradient-to-br from-brand-500 to-brand-600 rounded-3xl shadow-2xl">
              <Dumbbell className="w-16 h-16 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        
        {/* App Name */}
        <h1 className="text-5xl font-bold text-white font-display mb-2">
          LifePlus<span className="text-brand-400">+</span>
        </h1>
        <p className="text-slate-400 text-lg mb-12">Seu app de treino e nutrição</p>
        
        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-500 to-purple-600 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
