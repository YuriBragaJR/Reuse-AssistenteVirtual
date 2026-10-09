"use client";

import { useEffect, useState } from 'react';
import ItemCard from '@/components/ui/ItemCard';
import { Tag, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function MeusDesapegos() {
  const [meusItens, setMeusItens] = useState<any[]>([]);

  useEffect(() => {
    // Pega APENAS os itens criados por você via formulário (armazenados no LocalStorage)
    const itensCriados = JSON.parse(localStorage.getItem('meus_desapegos') || '[]');
    setMeusItens(itensCriados);
  }, []);

  const handleDeletar = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm("Tem certeza de que deseja apagar este anúncio?")) {
      const novosCriados = meusItens.filter(item => item.id !== id);
      
      // Atualiza o LocalStorage e o estado da tela
      localStorage.setItem('meus_desapegos', JSON.stringify(novosCriados));
      setMeusItens(novosCriados);
      
      // Remove também da cesta e salvos se estiverem lá
      const cesta = JSON.parse(localStorage.getItem('minha_cesta') || '[]');
      localStorage.setItem('minha_cesta', JSON.stringify(cesta.filter((i: any) => i.id !== id)));

      const salvos = JSON.parse(localStorage.getItem('itens_salvos') || '[]');
      localStorage.setItem('itens_salvos', JSON.stringify(salvos.filter((i: any) => i.id !== id)));
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-gray-900">Meus Desapegos</h1>
        <Link href="/desapegar" className="bg-eco-100 text-eco-700 hover:bg-eco-200 px-4 py-2 rounded-lg text-sm font-bold transition">
          + Novo Anúncio
        </Link>
      </div>

      {meusItens.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {meusItens.map(item => (
            <div key={item.id} className="relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm group">
              <div className="absolute top-3 left-3 z-20 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-md">
                Seu Anúncio
              </div>

              {/* Botão de Exclusão */}
              <button 
                onClick={(e) => handleDeletar(item.id, e)}
                className="absolute top-3 right-3 z-30 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition cursor-pointer flex items-center justify-center"
                title="Apagar este anúncio"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <ItemCard item={item} showFavorite={false} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Tag className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg">Você ainda não desapegou</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">Comece a liberar espaço e promover a economia circular.</p>
          <Link href="/desapegar" className="bg-eco-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-eco-700 transition">
            Começar a Desapegar
          </Link>
        </div>
      )}
    </div>
  );
}