import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = () => {
    const message = `Olá! Gostaria de finalizar a compra dos seguintes itens:\n\n${items.map(item => `- ${item.quantity}x ${item.product.name} (${formatPrice(item.product.price)})`).join('\n')}\n\n*Total:* ${formatPrice(total)}`;
    const url = `https://wa.me/5551993781978?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
        <div className="w-full h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Seu Carrinho
            </h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 gap-4">
                <ShoppingBag className="w-16 h-16 text-slate-200" />
                <p>Seu carrinho está vazio.</p>
                <button 
                  onClick={onClose}
                  className="mt-2 text-blue-600 font-medium hover:text-blue-700"
                >
                  Continuar comprando
                </button>
              </div>
            ) : (
              <ul className="space-y-6">
                {items.map((item) => (
                  <li key={item.product.id} className="flex gap-4">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-slate-200">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-slate-900">
                          <h3 className="line-clamp-2 text-sm">{item.product.name}</h3>
                          <p className="ml-4 whitespace-nowrap">{formatPrice(item.product.price)}</p>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{item.product.condition} • {item.product.category}</p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        
                        <div className="flex items-center border border-slate-200 rounded-lg">
                          <button 
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded-l-md"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 font-medium text-slate-900">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded-r-md"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex">
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.product.id)}
                            className="font-medium text-red-500 hover:text-red-600 flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-xs">Remover</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-slate-100 px-6 py-6 bg-slate-50">
              <div className="flex justify-between text-base font-medium text-slate-900 mb-4">
                <p>Subtotal</p>
                <p className="text-xl font-bold text-blue-600">{formatPrice(total)}</p>
              </div>
              <p className="mt-0.5 text-sm text-slate-500 mb-6">Frete e impostos calculados no checkout.</p>
              <div className="mt-6">
                <button
                  className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  onClick={handleCheckout}
                >
                  Finalizar Compra
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
