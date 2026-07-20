import React from 'react';
import { ShoppingCart, Laptop, X, Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem } from '../types';
import { useLogo } from '../hooks/useLogo';

interface NavbarProps {
  cartItemCount: number;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartItemCount, onOpenCart }) => {
  const { logoUrl } = useLogo();

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <a href="/" className="flex items-center gap-2 cursor-pointer">
            <img src={logoUrl} alt="Visiontec Informática" className="h-14 md:h-16 object-contain" />
          </a>
          
          <div className="flex items-center gap-4">
            <a href="/admin" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Área Admin
            </a>
            <button 
              onClick={onOpenCart}
              className="relative p-2 hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Abrir carrinho"
            >
              <ShoppingCart className="h-6 w-6 text-slate-300" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-600 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
