import React, { useState } from 'react';
import { Product } from '../types';
import { X, ShoppingBag, Cpu, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = product.image ? product.image.split(',').filter(Boolean) : ['/logo.png'];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/50 hover:bg-white text-slate-800 p-2 rounded-full shadow-sm transition-colors backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Imagens */}
        <div className="w-full md:w-1/2 relative bg-slate-100 flex-shrink-0 aspect-square md:aspect-auto min-h-[300px]">
          <img 
            src={images[currentImageIndex]} 
            alt={product.name} 
            className="w-full h-full object-cover object-center"
          />
          {images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-2 rounded-full shadow-md transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-2 rounded-full shadow-md transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 p-2 rounded-full backdrop-blur-sm">
                {images.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Detalhes */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm border ${
              product.condition === 'Novo' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {product.condition}
            </span>
            <span className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full border border-slate-200">
              {product.category}
            </span>
          </div>

          <h2 className="font-extrabold text-2xl md:text-3xl text-slate-900 mb-4 leading-tight">{product.name}</h2>
          
          <div className="mb-6">
            <span className="font-black text-3xl md:text-4xl text-blue-600">
              {formatPrice(product.price)}
            </span>
            <p className="text-sm text-slate-500 mt-1">em até 12x no cartão de crédito</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button 
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl transition-colors font-semibold"
            >
              <ShoppingBag className="w-5 h-5" />
              Adicionar ao Carrinho
            </button>
            <a 
              href={`https://wa.me/5551993781978?text=${encodeURIComponent(`Olá! Gostaria de comprar o produto: ${product.name} - ${formatPrice(product.price)}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl transition-colors font-semibold shadow-lg shadow-emerald-500/30"
            >
              Comprar Agora
            </a>
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(`Olha que legal esse produto da Visiontec Informática: ${product.name} - ${formatPrice(product.price)}!\n\nAcesse: ${window.location.origin}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-xl transition-colors font-semibold"
              title="Compartilhar no WhatsApp"
            >
              <Share2 className="w-5 h-5" />
            </a>
          </div>

          <div className="space-y-6 flex-grow">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 border-b pb-2">Descrição do Produto</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>

            {product.specs && product.specs.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 border-b pb-2">Especificações Técnicas</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.specs.map((spec, index) => (
                    <li key={index} className="flex items-start text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <Cpu className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
