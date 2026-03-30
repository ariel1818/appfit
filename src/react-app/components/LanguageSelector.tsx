import { useState, useEffect } from 'react';
import { Globe, Loader2, Check } from 'lucide-react';

const languages = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

interface LanguageSelectorProps {
  onSelect: (language: string) => void;
}

export default function LanguageSelector({ onSelect }: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [detecting, setDetecting] = useState(true);

  useEffect(() => {
    detectLanguageFromIP();
  }, []);

  const detectLanguageFromIP = async () => {
    try {
      const response = await fetch('/api/detect-language');
      const data = await response.json();
      
      if (data.language) {
        handleSelect(data.language);
      } else {
        setDetecting(false);
      }
    } catch (error) {
      console.error('Error detecting language:', error);
      setDetecting(false);
    }
  };

  const handleSelect = (code: string) => {
    setSelectedLanguage(code);
    localStorage.setItem('preferredLanguage', code);
    onSelect(code);
  };

  if (detecting) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="inline-flex p-5 bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl shadow-xl shadow-brand-500/20 mb-6">
            <Loader2 className="w-12 h-12 text-white animate-spin" strokeWidth={2.5} />
          </div>
          <p className="text-slate-300 text-lg font-medium">Detecting your language...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 p-4">
      <div className="max-w-3xl w-full animate-scale-in">
        <div className="glass-dark rounded-3xl p-10 border-2 border-slate-800/50">
          <div className="text-center mb-10">
            <div className="inline-flex p-5 bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl shadow-2xl shadow-brand-500/30 mb-6">
              <Globe className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl font-bold text-white mb-3 font-display">Selecione seu idioma</h2>
            <p className="text-slate-400 text-lg">Choose your language / Elige tu idioma / Choisissez votre langue</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`group relative overflow-hidden p-5 rounded-xl border-2 transition-all duration-200 text-left flex items-center gap-4 ${
                  selectedLanguage === lang.code
                    ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/20 scale-105'
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50 hover:scale-105'
                }`}
              >
                <span className="text-4xl">{lang.flag}</span>
                <div className="flex-1">
                  <span className="text-lg font-bold text-white block font-display">{lang.name}</span>
                  {selectedLanguage === lang.code && (
                    <span className="text-xs text-brand-400 font-semibold">Selected</span>
                  )}
                </div>
                {selectedLanguage === lang.code && (
                  <div className="p-2 bg-brand-500 rounded-full">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
