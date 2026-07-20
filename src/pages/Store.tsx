import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { ProductCard } from '../components/ProductCard';
import { Cart } from '../components/Cart';
import { Product, CartItem } from '../types';
import { Filter, Search, Laptop, ChevronRight, Shield, Cpu, MessageCircle } from 'lucide-react';
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
      <div className="relative overflow-hidden bg-slate-950 text-white border-b border-slate-800">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 -mr-48 -mt-48 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-48 -mb-48 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20"></div>
        
        {/* Grid Pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2 z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              Novos modelos disponíveis
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              O setup perfeito <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">espera por você.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              Encontre os melhores computadores e notebooks, novos e seminovos, com garantia e qualidade que só a <strong className="text-white font-medium">Visiontec Informática</strong> oferece.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-4 rounded-xl transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.7)] flex items-center justify-center gap-2 group"
              >
                Ver Ofertas
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="https://wa.me/559999999999" 
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-xl transition-colors border border-slate-700 hover:border-slate-600 flex items-center justify-center gap-2 group"
              >
                <MessageCircle className="w-5 h-5 group-hover:text-green-400 transition-colors" />
                Falar com Consultor
              </a>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 relative z-10 hidden lg:block">
            <div className="relative w-full aspect-square max-w-[500px] mx-auto mt-8 lg:mt-0">
              {/* Image background decoration */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-cyan-400/20 rounded-[2.5rem] transform rotate-3 scale-105 backdrop-blur-3xl border border-white/10"></div>
              
              {/* Main Image */}
              <img 
                src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=1000&auto=format&fit=crop" 
                alt="Setup Premium"
                className="relative z-10 w-full h-full object-cover rounded-[2.5rem] shadow-2xl border border-slate-800/50 transform -rotate-2 hover:rotate-0 transition-transform duration-700"
              />
              
              {/* Floating badges */}
              <div className="absolute top-12 -left-12 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-2xl z-20 animate-[bounce_4s_infinite]">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-2.5 rounded-xl text-green-400">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Garantia</p>
                    <p className="text-xs text-slate-400">Total Segurança</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-16 -right-8 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-2xl z-20 animate-[bounce_5s_infinite]">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-2.5 rounded-xl text-blue-400">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Alta Performance</p>
                    <p className="text-xs text-slate-400">Notebooks & PCs</p>
                  </div>
                </div>
              </div>
            </div>
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
