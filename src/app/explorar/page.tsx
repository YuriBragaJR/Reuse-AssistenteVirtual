"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import ItemCard from '@/components/ui/ItemCard';
import { items as mockItems } from '@/lib/mockData';
import { Filter, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function ConteudoExplorar() {
  const searchParams = useSearchParams();
  const categoriaInicial = searchParams.get('categoria');
  const tipoInicial = searchParams.get('tipo');
  const termoBuscaURL = searchParams.get('busca') || '';

  const [todosItens, setTodosItens] = useState<any[]>(mockItems);
  
  const [filtrosTipo, setFiltrosTipo] = useState<string[]>(tipoInicial ? [tipoInicial] : []);
  const [filtrosCategoria, setFiltrosCategoria] = useState<string[]>(categoriaInicial ? [categoriaInicial] : []);
  const [filtrosCondicao, setFiltrosCondicao] = useState<string[]>([]);
  const [ordenacao, setOrdenacao] = useState('relevantes');
  const [busca, setBusca] = useState(termoBuscaURL);

  useEffect(() => {
    setBusca(searchParams.get('busca') || '');
  }, [searchParams]);

  useEffect(() => {
    const itensCriados = JSON.parse(localStorage.getItem('meus_desapegos') || '[]');
    if (itensCriados.length > 0) {
      setTodosItens([...itensCriados, ...mockItems]);
    }
  }, []);

  const toggleFiltro = (estadoAtual: string[], setEstado: React.Dispatch<React.SetStateAction<string[]>>, valor: string) => {
    setEstado(estadoAtual.includes(valor) ? estadoAtual.filter(t => t !== valor) : [...estadoAtual, valor]);
  };

  const itensFiltrados = useMemo(() => {
    let resultado = [...todosItens];

    // Filtro de Texto (Barra de Pesquisa)
    if (busca.trim()) {
      const termo = busca.toLowerCase();
      resultado = resultado.filter(item => 
        item.title.toLowerCase().includes(termo) || 
        item.description.toLowerCase().includes(termo) ||
        item.category.toLowerCase().includes(termo)
      );
    }

    if (filtrosTipo.length > 0) resultado = resultado.filter(item => filtrosTipo.includes(item.type));
    if (filtrosCategoria.length > 0) resultado = resultado.filter(item => filtrosCategoria.includes(item.category));
    
    if (filtrosCondicao.length > 0) {
      resultado = resultado.filter(item => {
        const cond = item.condition.toLowerCase();
        return filtrosCondicao.some(f => cond.includes(f));
      });
    }

    if (ordenacao === 'menor-preco') resultado.sort((a, b) => a.price - b.price);
    
    return resultado;
  }, [busca, filtrosTipo, filtrosCategoria, filtrosCondicao, ordenacao, todosItens]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar de Filtros */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white p-5 rounded-xl border border-gray-200 sticky top-24 shadow-sm">
          <div className="flex items-center gap-2 mb-4 font-black border-b pb-2"><Filter className="w-4 h-4"/> Filtros</div>
          
          {/* Caixa de pesquisa rápida na lateral também */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Filtrar por nome</label>
            <div className="relative">
              <input 
                type="text" 
                value={busca} 
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar..." 
                className="w-full border border-gray-200 text-sm py-2 pl-3 pr-8 rounded-lg outline-none focus:border-eco-500"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold mb-3 text-gray-800">Tipo de Transação</h3>
            {['venda', 'doacao', 'troca'].map(tipo => (
              <label key={tipo} className="flex items-center gap-2 text-sm mb-2 cursor-pointer hover:text-eco-600 transition">
                <input type="checkbox" className="accent-eco-600 w-4 h-4" checked={filtrosTipo.includes(tipo)} onChange={() => toggleFiltro(filtrosTipo, setFiltrosTipo, tipo)} /> 
                {tipo === 'venda' ? 'Venda' : tipo === 'doacao' ? 'Doação (Grátis)' : 'Aceita Troca'}
              </label>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold mb-3 text-gray-800">Categorias</h3>
            {['Eletrônicos', 'Móveis', 'Livros', 'Roupas', 'Decoração'].map(cat => (
              <label key={cat} className="flex items-center gap-2 text-sm mb-2 cursor-pointer hover:text-eco-600 transition">
                <input type="checkbox" className="accent-eco-600 w-4 h-4" checked={filtrosCategoria.includes(cat)} onChange={() => toggleFiltro(filtrosCategoria, setFiltrosCategoria, cat)} /> {cat}
              </label>
            ))}
          </div>
          
          <div>
            <h3 className="text-sm font-bold mb-3 text-gray-800">Condição</h3>
            {[
              { id: 'novo', label: 'Novo / Como Novo' },
              { id: 'excelente', label: 'Usado - Excelente' },
              { id: 'marcas', label: 'Marcas de uso / Bom' }
            ].map(cond => (
              <label key={cond.id} className="flex items-center gap-2 text-sm mb-2 cursor-pointer hover:text-eco-600 transition">
                <input type="checkbox" className="accent-eco-600 w-4 h-4" checked={filtrosCondicao.includes(cond.id)} onChange={() => toggleFiltro(filtrosCondicao, setFiltrosCondicao, cond.id)} /> {cond.label}
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Grid Vitrine */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black">
            Resultados da Busca <span className="text-gray-400 text-lg font-medium">({itensFiltrados.length})</span>
          </h1>
          <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)} className="bg-white border border-gray-200 text-sm py-2 px-3 rounded-lg outline-none cursor-pointer hover:border-eco-500 shadow-sm">
            <option value="relevantes">Mais Relevantes</option>
            <option value="menor-preco">Menor Preço</option>
            <option value="recentes">Mais Recentes</option>
          </select>
        </div>

        {itensFiltrados.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {itensFiltrados.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <Search className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="font-bold text-gray-800 text-lg">Nenhum item encontrado</h3>
            <p className="text-sm text-gray-500 mt-1">Não encontramos resultados para sua busca. Tente outras palavras.</p>
            <button onClick={() => { setBusca(''); setFiltrosTipo([]); setFiltrosCategoria([]); setFiltrosCondicao([]); }} className="mt-6 font-bold text-eco-600 hover:text-eco-700 bg-eco-50 px-4 py-2 rounded-lg transition">
              Limpar Filtros e Busca
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Explorar() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-gray-500">Carregando catálogo...</div>}>
      <ConteudoExplorar />
    </Suspense>
  );
}