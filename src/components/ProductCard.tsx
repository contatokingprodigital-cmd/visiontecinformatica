import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingBag, Cpu, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = product.image ? product.image.split(',').filter(Boolean) : ['/logo.png'];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full group">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img 
          src={images[currentImageIndex]} 
          alt={product.name} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-md shadow-sm ${
            product.condition === 'Novo' 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-amber-100 text-amber-800'
          }`}>
            {product.condition}
          </span>
          <span className="px-2.5 py-1 text-xs font-medium bg-slate-900/80 text-white backdrop-blur-sm rounded-md shadow-sm w-fit">
            {product.category}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-slate-900 mb-1 leading-tight">{product.name}</h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{product.description}</p>
        
        <div className="mb-4">
          <ul className="space-y-1">
            {product.specs.slice(0, 3).map((spec, index) => (
              <li key={index} className="flex items-center text-xs text-slate-600">
                <Cpu className="w-3 h-3 mr-1.5 text-slate-400" />
                {spec}
              </li>
            ))}
            {product.specs.length > 3 && (
              <li className="text-xs text-slate-400 italic">+{product.specs.length - 3} especificações</li>
            )}
          </ul>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
          <span className="font-bold text-xl text-slate-900">
            {formatPrice(product.price)}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => onAddToCart(product)}
              className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              title="Adicionar ao carrinho"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
            <a 
              href={`https://wa.me/5551993781978?text=${encodeURIComponent(`Olá! Gostaria de comprar o produto: ${product.name} - ${formatPrice(product.price)}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Comprar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
