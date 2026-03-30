import { Link } from 'react-router';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import AIChat from '@/react-app/components/AIChat';

export default function NutritionChat() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/nutrition"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Chat com IA - Nutrição</h1>
          <p className="text-xl text-slate-300">
            Tire suas dúvidas sobre alimentação, dietas, macronutrientes e muito mais
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <AIChat mode="nutrition" gradientFrom="from-green-500" gradientTo="to-emerald-600" />
        </div>

        <div className="mt-8 bg-gradient-to-br from-green-950/50 to-emerald-950/50 backdrop-blur-sm border border-green-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">💡 Exemplos de perguntas</h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>Quais alimentos são ricos em proteína?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>Como calcular meus macronutrientes para ganho de massa?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>Qual a melhor refeição pré-treino?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>Como montar uma dieta balanceada?</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
