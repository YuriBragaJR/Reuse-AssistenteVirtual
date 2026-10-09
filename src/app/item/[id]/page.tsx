"use client";

import { useEffect, useState } from 'react';
import { items as mockItems } from '@/lib/mockData';
import Link from 'next/link';
import { MapPin, ShoppingBag, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ItemDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [adicionado, setAdicionado] = useState(false);
  const [favorito, setFavorito] = useState(false);

  useEffect(() => {
    // 1. Busca o item correto para exibir na tela
    const itensCriados = JSON.parse(localStorage.getItem('meus_desapegos') || '[]');
    const todosItens = [...itensCriados, ...mockItems];
    const itemEncontrado = todosItens.find(i => i.id === params.id);
    setItem(itemEncontrado);

    // 2. Verifica se este item já está salvo nos favoritos do usuário
    if (itemEncontrado) {
      const salvos = JSON.parse(localStorage.getItem('itens_salvos') || '[]');
      if (salvos.some((i: any) => i.id === itemEncontrado.id)) {
        setFavorito(true); // Se já estiver salvo, deixa o coração vermelho
      }
    }
  }, [params.id]);

  // Função que faz o botão Salvar funcionar
  const toggleFavorito = () => {
    if (!item) return;
    
    const salvos = JSON.parse(localStorage.getItem('itens_salvos') || '[]');
    let novosSalvos;

    if (favorito) {
      // Se já era favorito, remove da lista
      novosSalvos = salvos.filter((i: any) => i.id !== item.id);
    } else {
      // Se não era, adiciona o item inteiro na lista
      novosSalvos = [...salvos, item];
    }

    localStorage.setItem('itens_salvos', JSON.stringify(novosSalvos));
    setFavorito(!favorito);
  };

  const handleAdicionarCesta = () => {
    if (!item) return;
    const cestaAtual = JSON.parse(localStorage.getItem('minha_cesta') || '[]');
    if (!cestaAtual.find((i: any) => i.id === item.id)) {
      cestaAtual.push(item);
      localStorage.setItem('minha_cesta', JSON.stringify(cestaAtual));
    }
    setAdicionado(true);
    setTimeout(() => router.push('/cesta'), 800);
  };

  if (!item) return <div className="p-20 text-center text-gray-500 font-bold">Carregando detalhes do item...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/explorar" className="text-eco-600 hover:underline mb-6 inline-block text-sm font-bold">
        &larr; Voltar para o catálogo
      </Link>
      
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col md:flex-row shadow-sm">
        <div className="md:w-1/2 bg-earth-100 relative">
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover min-h-[400px]" />
        </div>
        
        <div className="md:w-1/2 p-8 flex flex-col">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-eco-600 bg-eco-50 px-2 py-1 rounded uppercase tracking-wider">{item.category}</span>
            
            <button 
              onClick={toggleFavorito}
              className={`flex items-center gap-1 text-sm font-semibold transition-colors cursor-pointer ${
                favorito ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 transition-colors ${favorito ? 'fill-red-500' : ''}`} />
              {favorito ? 'Salvo' : 'Salvar'}
            </button>
            
          </div>
          
          <h1 className="text-3xl font-black mt-3 leading-tight text-gray-900">{item.title}</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">{item.condition}</p>
          
          <div className="my-6">
            {item.price > 0 ? (
              <div className="text-4xl font-black text-earth-900">R$ {item.price.toFixed(2)}</div>
            ) : (
              <div className="text-4xl font-black text-eco-600">Item para {item.type}</div>
            )}
          </div>
          
          <div className="flex flex-col gap-3 mt-auto">
            <button onClick={handleAdicionarCesta} className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${adicionado ? 'bg-earth-900 text-white' : 'bg-eco-600 hover:bg-eco-700 text-white shadow-lg shadow-eco-600/20'}`}>
              <ShoppingBag className="w-5 h-5" />
              {adicionado ? 'Adicionando à Cesta...' : (item.price > 0 ? 'Adicionar à Cesta' : 'Solicitar Resgate')}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-eco-100 rounded-full flex items-center justify-center font-black text-eco-700">{item.seller[0]}</div>
                <div>
                  <div className="font-bold text-sm">{item.seller}</div>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3"/> São Paulo, SP</p>
                </div>
              </div>
            </div>
            
            <h3 className="font-bold text-sm mb-2 text-gray-900">Descrição</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}