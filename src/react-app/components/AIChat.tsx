import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader as Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  mode: 'workout' | 'nutrition';
  gradientFrom: string;
  gradientTo: string;
}

export default function AIChat({ mode, gradientFrom, gradientTo }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message when component mounts
    const welcomeMessage: Message = {
      role: 'assistant',
      content: mode === 'workout' 
        ? 'Sou um especialista em treinamento físico e ciência do exercício. Forneço informações precisas e baseadas em evidências sobre exercícios, técnicas, programação de treinos, recuperação e prevenção de lesões. Como posso ajudá-lo?'
        : 'Sou um especialista em nutrição e dietética. Forneço informações precisas e baseadas em evidências científicas sobre alimentação, macronutrientes, planejamento de dietas e suplementação. Como posso ajudá-lo?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [mode]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const language = localStorage.getItem('preferredLanguage') || 'pt';
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          mode,
          language,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                message.role === 'assistant'
                  ? `bg-gradient-to-br ${gradientFrom} ${gradientTo}`
                  : 'bg-slate-700'
              }`}
            >
              {message.role === 'assistant' ? (
                <Bot className="w-6 h-6 text-white" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div
              className={`flex-1 max-w-[80%] ${
                message.role === 'user' ? 'text-right' : ''
              }`}
            >
              <div
                className={`inline-block px-4 py-3 rounded-2xl ${
                  message.role === 'assistant'
                    ? 'bg-slate-800/50 border border-slate-700/50'
                    : `bg-gradient-to-br ${gradientFrom} ${gradientTo}`
                } text-white`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
              <p className="text-xs text-slate-500 mt-1 px-2">
                {message.timestamp.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientFrom} ${gradientTo}`}>
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 px-4 py-3 rounded-2xl">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta..."
            rows={1}
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`p-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white hover:shadow-lg`}
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
