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
  const [imgError, setImgError] = React.useState(false);

  // Reset error state if logoUrl changes
  React.useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <a href="/" className="flex items-center gap-2 cursor-pointer max-w-[60%] sm:max-w-[70%]">
            {!imgError && logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Visiontec Informática" 
                className="h-10 sm:h-14 md:h-16 w-auto object-contain" 
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Laptop className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500" />
                <span className="font-bold text-lg sm:text-xl tracking-tight text-white whitespace-nowrap">Visiontec</span>
              </div>
            )}
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
