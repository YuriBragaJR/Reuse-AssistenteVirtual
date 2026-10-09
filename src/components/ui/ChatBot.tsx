"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, MessageCircle } from 'lucide-react';

type Action = { label: string; route: string };
type Message = { sender: 'user' | 'bot'; text: string; actions?: Action[] };

export default function ChatBot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');

  // Mensagem inicial já com as opções rápidas carregadas
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Olá! Sou o assistente virtual ReUse. Como posso te ajudar hoje? Escolha uma das opções rápidas ou digite o que precisa:',
      actions: [
        { label: '🎁 Registrar Doação/Venda', route: '/desapegar' },
        { label: '📦 Meus Desapegos', route: '/painel/desapegos' },
        { label: '🎟️ Meus Resgates', route: '/painel' },
        { label: '❤️ Itens Salvos', route: '/painel/salvos' }
      ]
    }
  ]);

  // Função para lidar com o clique nos botões de atalho
  const handleActionClick = (route: string) => {
    setIsOpen(false); // Fecha o chat
    router.push(route); // Redireciona para a página
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Adiciona a mensagem do usuário na tela
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    const currentInput = input;
    setInput('');

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentInput }),
      });

      const data = await res.json();

      if (data.reply && data.reply.length > 0) {
        const botTexts = data.reply
          .filter((r: any) => r.response_type === 'text')
          .map((r: any) => r.text);
        
        botTexts.forEach((text: string) => {
          setMessages(prev => [...prev, { sender: 'bot', text }]);
        });
      }

      // Se a IA detectar intenção de criar desapego no texto, redireciona também
      if (data.isCriarDesapego) {
        setTimeout(() => {
          setIsOpen(false);
          router.push('/desapegar');
        }, 2000);
      }
    } catch (error) {
      console.error("Falha ao comunicar com a API do Google Gemini", error);
    }
  };

if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-eco-600 text-white p-4 rounded-full shadow-lg hover:bg-eco-700 z-50 flex items-center gap-2 font-bold transition-transform hover:scale-105">
        <Bot className="w-5 h-5 text-white" />
        Ajuda
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-[350px] bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col h-[500px] z-50 overflow-hidden">
      {/* Cabeçalho do Chat */}
      <div className="bg-earth-900 text-white p-4 font-bold flex justify-between items-center shadow-md">
        <span className="flex items-center gap-2"><Bot className="w-5 h-5 text-white" /> Assistente ReUse</span>
        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300 font-bold text-xl leading-none">&times;</button>
      </div>
      
      {/* Área de Mensagens */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 text-sm bg-gray-50 scroll-smooth">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-3 rounded-2xl max-w-[85%] shadow-sm ${msg.sender === 'user' ? 'bg-eco-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'}`}>
              {msg.text}
            </div>
            
            {/* Renderização condicional dos botões de ação */}
            {msg.actions && (
              <div className="mt-2 flex flex-col gap-2 w-[85%]">
                {msg.actions.map((action, actionIdx) => (
                  <button 
                    key={actionIdx}
                    onClick={() => handleActionClick(action.route)}
                    className="text-left bg-white border border-eco-200 hover:border-eco-500 hover:bg-eco-50 text-eco-700 font-semibold py-2 px-3 rounded-lg text-xs transition-colors shadow-sm w-full"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Input de Texto */}
      <div className="p-3 border-t bg-white flex gap-2">
        <input 
          type="text" 
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 outline-none focus:border-eco-600 focus:ring-1 focus:ring-eco-600 text-sm text-black transition-all"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Digite sua mensagem..."
        />
        <button 
          onClick={sendMessage} 
          className="bg-eco-600 hover:bg-eco-700 text-white px-4 py-2 rounded-full font-bold transition-colors shadow-sm"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}