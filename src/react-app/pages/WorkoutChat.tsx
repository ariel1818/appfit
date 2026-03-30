import { Link } from 'react-router';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import AIChat from '@/react-app/components/AIChat';

export default function WorkoutChat() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Chat com IA - Treinos</h1>
          <p className="text-xl text-slate-300">
            Tire suas dúvidas sobre exercícios, treinos, técnicas e muito mais
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <AIChat mode="workout" gradientFrom="from-blue-500" gradientTo="to-indigo-600" />
        </div>

        <div className="mt-8 bg-gradient-to-br from-blue-950/50 to-indigo-950/50 backdrop-blur-sm border border-blue-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">💡 Exemplos de perguntas</h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Como melhorar a execução do agachamento livre?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Qual a diferença entre treino de força e hipertrofia?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Quantos dias de descanso preciso entre os treinos?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Como evitar lesões durante o treino?</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
