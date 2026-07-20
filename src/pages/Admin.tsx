import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product } from '../types';
import { products as initialProducts } from '../data/products';
import { Plus, Trash2, Edit2, Loader2, Image as ImageIcon, Laptop, Lock, Settings } from 'lucide-react';
import { useLogo } from '../hooks/useLogo';

export const Admin = () => {
  const { logoUrl, updateLogo } = useLogo();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'Desktop' | 'Notebook'>('Notebook');
  const [condition, setCondition] = useState<'Novo' | 'Usado'>('Novo');
  const [specs, setSpecs] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple hardcoded password
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);

    if (!isSupabaseConfigured) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else if (data && data.length > 0) {
        const formattedProducts = data.map(item => ({
          ...item,
          specs: Array.isArray(item.specs) ? item.specs : JSON.parse(item.specs || '[]')
        }));
        setProducts(formattedProducts);
      } else {
        setProducts(initialProducts);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setProducts(initialProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (product?: Product) => {
    if (product) {
      setEditId(product.id);
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price.toString());
      setCategory(product.category);
      setCondition(product.condition);
      setSpecs(product.specs.join(', '));
      setCurrentImageUrl(product.image);
    } else {
      setEditId(null);
      setName('');
      setDescription('');
      setPrice('');
      setCategory('Notebook');
      setCondition('Novo');
      setSpecs('');
      setCurrentImageUrl('');
    }
    setImageFile(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!isSupabaseConfigured) {
        alert('Supabase não está configurado. As alterações não serão salvas no banco de dados. Configure o painel de Secrets ou arquivo .env para habilitar.');
        setSaving(false);
        return;
      }

      let imageUrl = currentImageUrl;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const specsArray = specs.split(',').map(s => s.trim()).filter(Boolean);
      const productData = {
        name,
        description,
        price: parseFloat(price),
        category,
        condition,
        specs: JSON.stringify(specsArray),
        image: imageUrl,
      };

      if (editId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        if (error) throw error;
      }

      await fetchProducts();
      handleCloseForm();
    } catch (err: any) {
      console.error('Error saving product:', err);
      alert('Erro ao salvar produto. Verifique o console e as configurações do Supabase.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;

    if (!isSupabaseConfigured) {
      alert('Supabase não está configurado. Não é possível excluir do banco de dados.');
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Erro ao excluir produto.');
    }
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-50 p-3 rounded-full mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Acesso Restrito</h1>
            <p className="text-slate-500 text-sm text-center mt-2">
              Por favor, insira a senha para acessar a área administrativa.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Digite a senha"
                autoFocus
              />
            </div>
            {loginError && (
              <p className="text-red-500 text-sm">Senha incorreta. Tente novamente.</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Entrar
            </button>
            <div className="text-center pt-4">
              <a href="/" className="text-sm text-slate-500 hover:text-blue-600">Voltar para a Loja</a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Visiontec Admin" className="h-8 object-contain" />
            <span className="font-bold text-xl tracking-tight text-white ml-2">Admin</span>
          </div>
          <a href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Ver Loja</a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Setup Warning for the user */}
        {!isSupabaseConfigured && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-8">
            <h3 className="font-bold mb-2 flex items-center gap-2">⚠️ Atenção: Supabase não configurado</h3>
            <p className="text-sm mb-2">Para que esta área admin funcione salvando os dados no banco real, configure as variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> no painel de Secrets ou no arquivo <code>.env</code>. Atualmente mostrando dados de exemplo.</p>
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer font-medium opacity-80 hover:opacity-100">Instruções detalhadas do banco</summary>
              <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                <li>Tabela <strong>products</strong> com as colunas: <code>id</code> (uuid), <code>created_at</code>, <code>name</code> (text), <code>description</code> (text), <code>price</code> (numeric), <code>category</code> (text), <code>condition</code> (text), <code>specs</code> (jsonb), <code>image</code> (text).</li>
                <li>Bucket no Storage chamado <strong>product-images</strong> configurado como Público.</li>
                <li>Desative o RLS (Row Level Security) para testes iniciais ou configure as políticas adequadas.</li>
              </ul>
            </details>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Gerenciar Produtos</h1>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Settings className="w-4 h-4" /> Configurações
            </button>
            <button 
              onClick={() => handleOpenForm()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Novo Produto
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                  <th className="p-4">Produto</th>
                  <th className="p-4">Categoria/Condição</th>
                  <th className="p-4">Preço</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      Nenhum produto cadastrado no banco de dados.
                    </td>
                  </tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <img src={product.image} alt="" className="w-12 h-12 rounded object-cover border border-slate-200" />
                          <div>
                            <div className="font-medium text-slate-900">{product.name}</div>
                            <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="text-slate-900">{product.category}</div>
                        <div className="text-slate-500 text-xs">{product.condition}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-900">{formatPrice(product.price)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenForm(product)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">{editId ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                  <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Preço (R$)</label>
                  <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option value="Notebook">Notebook</option>
                    <option value="Desktop">Desktop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Condição</label>
                  <select value={condition} onChange={e => setCondition(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option value="Novo">Novo</option>
                    <option value="Usado">Usado</option>
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Especificações (separadas por vírgula)</label>
                  <input required type="text" value={specs} onChange={e => setSpecs(e.target.value)} placeholder="Ex: 16GB RAM, 512GB SSD, Intel i7" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Foto do Produto</label>
                  <div className="flex items-center gap-4">
                    {currentImageUrl && !imageFile && (
                      <img src={currentImageUrl} alt="Current" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                    )}
                    <label className="flex-1 border-2 border-dashed border-slate-300 rounded-lg p-4 hover:bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                      <span className="text-sm text-slate-600 font-medium">
                        {imageFile ? imageFile.name : 'Clique para selecionar uma imagem'}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setImageFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={handleCloseForm} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button disabled={saving} type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Salvando...' : 'Salvar Produto'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">Configurações</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Logo do Site</label>
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-100 p-4 rounded-xl flex items-center justify-center border border-slate-200">
                    <img src={logoUrl} alt="Logo" className="h-16 object-contain" />
                  </div>
                  
                  <label className="flex-1 border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 rounded-xl p-4 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="w-6 h-6 text-blue-500" />
                    <span className="text-sm text-blue-700 font-medium">
                      Clique para alterar a logo
                    </span>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          try {
                            setSaving(true);
                            if (isSupabaseConfigured) {
                               const url = await uploadImage(e.target.files[0]);
                               updateLogo(url);
                            } else {
                               // Fallback to base64 if no supabase
                               const reader = new FileReader();
                               reader.onloadend = () => {
                                 updateLogo(reader.result as string);
                               };
                               reader.readAsDataURL(e.target.files[0]);
                            }
                          } catch (err) {
                            alert('Erro ao fazer upload da logo');
                          } finally {
                            setSaving(false);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end">
               <button onClick={() => setIsSettingsOpen(false)} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                 Fechar
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
