export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Desktop' | 'Notebook';
  condition: 'Novo' | 'Usado';
  image: string;
  specs: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
