import Link from 'next/link';
import { Package, Tag, Heart, Wallet, Settings } from 'lucide-react';

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b bg-eco-50 flex items-center gap-3">
            <div className="w-12 h-12 bg-eco-600 text-white rounded-full flex items-center justify-center font-black text-xl">Y</div>
            <div>
              <div className="font-bold">Yuri B.</div>
              <div className="text-xs text-eco-700">Membro Eco ReUse</div>
            </div>
          </div>
          <nav className="flex flex-col py-2">
            <Link href="/painel" className="px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3"><Package className="w-4 h-4"/> Meus Resgates</Link>
            <Link href="/painel/desapegos" className="px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3"><Tag className="w-4 h-4"/> Meus Desapegos</Link>
            <Link href="/painel/salvos" className="px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3"><Heart className="w-4 h-4"/> Itens Salvos</Link>
            <Link href="#" className="px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3"><Settings className="w-4 h-4"/> Configurações</Link>
          </nav>
        </div>
      </aside>
      
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}