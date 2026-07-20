import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { ProductCard } from '../components/ProductCard';
import { Cart } from '../components/Cart';
import { Product, CartItem } from '../types';
import { Filter, Search, Laptop } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { products as initialProducts } from '../data/products';
import { useLogo } from '../hooks/useLogo';

export const Store = () => {
  const { logoUrl } = useLogo();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'Todos' | 'Desktop' | 'Notebook'>('Todos');
  const [filterCondition, setFilterCondition] = useState<'Todos' | 'Novo' | 'Usado'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      if (!isSupabaseConfigured) {
        console.warn('Supabase não configurado. Usando dados de exemplo.');
        setProducts(initialProducts);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      if (data && data.length > 0) {
        // Parse specs if it's stored as JSON
        const formattedProducts = data.map(item => ({
          ...item,
          specs: Array.isArray(item.specs) ? item.specs : JSON.parse(item.specs || '[]')
        }));
        setProducts(formattedProducts);
      } else {
        setProducts(initialProducts); // Fallback to initial products if empty
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      if (!isSupabaseConfigured) {
        setProducts(initialProducts);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchCategory = filterCategory === 'Todos' || product.category === filterCategory;
      const matchCondition = filterCondition === 'Todos' || product.condition === filterCondition;
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchCondition && matchSearch;
    });
  }, [products, filterCategory, filterCondition, searchQuery]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar cartItemCount={totalItems} onOpenCart={() => setIsCartOpen(true)} />
      
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      {/* Hero Section */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              O setup perfeito <br/><span className="text-blue-500">espera por você.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Encontre os melhores computadores e notebooks, novos e seminovos, com garantia e qualidade que só a Visiontec Informática oferece.
            </p>
            <button 
              onClick={() => document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-4 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
            >
              Ver Ofertas
            </button>
          </div>
        </div>
      </div>

      <main id="produtos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mr-2">
              <Filter className="w-4 h-4" /> Filtrar:
            </div>
            
            <select 
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
            >
              <option value="Todos">Todas Categorias</option>
              <option value="Notebook">Notebooks</option>
              <option value="Desktop">Desktops</option>
            </select>

            <select 
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value as any)}
            >
              <option value="Todos">Novos e Usados</option>
              <option value="Novo">Apenas Novos</option>
              <option value="Usado">Apenas Usados</option>
            </select>
          </div>

          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input 
              type="text" 
              className="bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 shadow-sm" 
              placeholder="Buscar modelos..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-500">Carregando produtos...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 border-dashed">
            <Laptop className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhum produto encontrado</h3>
            <p className="text-slate-500">Tente ajustar seus filtros de busca ou verifique se há produtos cadastrados.</p>
            <button 
              onClick={() => { setFilterCategory('Todos'); setFilterCondition('Todos'); setSearchQuery(''); }}
              className="mt-4 text-blue-600 font-medium hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}

      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Visiontec Informática" className="h-6 object-contain opacity-75 grayscale hover:grayscale-0 transition-all" />
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Visiontec Informática. Todos os direitos reservados.
          </p>
          <div className="text-sm text-slate-500">
            visiontec.vinicius@hotmail.com
          </div>
        </div>
      </footer>
    </div>
  );
};
