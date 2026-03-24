import type { Product, Sale } from '../types';

const PRODUCTS_KEY = 'profitmate_products';
const SALES_KEY = 'profitmate_sales';
const INIT_KEY = 'profitmate_initialized_v2';
const API_KEY_STORAGE = 'profitmate_api_key';
const ADVISOR_HISTORY_KEY = 'profitmate_advisor_history';

export const getProducts = (): Product[] => {
  const data = localStorage.getItem(PRODUCTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const getSales = (): Sale[] => {
  const data = localStorage.getItem(SALES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSales = (sales: Sale[]) => {
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
};

export const initializeDemoData = () => {
  if (localStorage.getItem(INIT_KEY)) return;

  const demoProducts: Product[] = [
    { id: '1', name: 'Chicken Shawarma', costPrice: 600, sellingPrice: 900 },
    { id: '2', name: 'Beef Shawarma', costPrice: 650, sellingPrice: 950 },
    { id: '3', name: 'Meatpie', costPrice: 300, sellingPrice: 500 },
    { id: '4', name: 'Chicken Pie', costPrice: 400, sellingPrice: 600 },
    { id: '5', name: 'Sausage Roll', costPrice: 200, sellingPrice: 400 },
    { id: '6', name: 'Doughnut', costPrice: 150, sellingPrice: 300 },
    { id: '7', name: 'Scotch Egg', costPrice: 250, sellingPrice: 450 },
    { id: '8', name: 'Puff Puff (Pack)', costPrice: 150, sellingPrice: 350 },
    { id: '9', name: 'Plantain Chips', costPrice: 100, sellingPrice: 200 },
    { id: '10', name: 'Small Chops (Box)', costPrice: 500, sellingPrice: 850 },
  ];

  const demoSales: Sale[] = [];
  const today = new Date();
  
  // Last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    demoProducts.forEach(p => {
      // Create random number of sales (1-5 sales per day for some products)
      if (Math.random() > 0.3) {
        demoSales.push({
          id: Math.random().toString(36).substring(7),
          productId: p.id,
          quantity: Math.floor(Math.random() * 8) + 1,
          date: dateStr,
        });
      }
    });
  }

  // Ensure there are some specific sales to evaluate insights
  if (demoSales.length === 0) {
    demoSales.push({
      id: 's1',
      productId: '2',
      quantity: 10,
      date: today.toISOString().split('T')[0]
    });
  }

  saveProducts(demoProducts);
  saveSales(demoSales);
  localStorage.setItem(INIT_KEY, 'true');
};

export const addProduct = (product: Omit<Product, 'id'>) => {
  const products = getProducts();
  const newProduct = { ...product, id: Math.random().toString(36).substring(7) };
  saveProducts([...products, newProduct]);
  return newProduct;
};

export const updateProduct = (updatedProduct: Product) => {
  const products = getProducts();
  
  const modifiedProducts = products.map(p => {
    if (p.id === updatedProduct.id) {
      // Check if price changed
      if (p.costPrice !== updatedProduct.costPrice || p.sellingPrice !== updatedProduct.sellingPrice) {
        const historyRecord = {
          date: new Date().toISOString(),
          costPrice: p.costPrice,
          sellingPrice: p.sellingPrice
        };
        
        return {
          ...updatedProduct,
          priceHistory: [historyRecord, ...(p.priceHistory || [])]
        };
      }
      return updatedProduct;
    }
    return p;
  });

  saveProducts(modifiedProducts);
  return modifiedProducts.find(p => p.id === updatedProduct.id) as Product;
};

export const deleteProduct = (id: string) => {
  const products = getProducts();
  const updatedProducts = products.filter(p => p.id !== id);
  saveProducts(updatedProducts);
};

export const addSale = (sale: Omit<Sale, 'id'>) => {
  const sales = getSales();
  const newSale = { ...sale, id: Math.random().toString(36).substring(7) };
  saveSales([...sales, newSale]);
  return newSale;
};

export const updateSale = (updatedSale: Sale) => {
  const sales = getSales();
  const modifiedSales = sales.map(s => s.id === updatedSale.id ? updatedSale : s);
  saveSales(modifiedSales);
  return updatedSale;
};

export const deleteSale = (id: string) => {
  const sales = getSales();
  const updatedSales = sales.filter(s => s.id !== id);
  saveSales(updatedSales);
};

export const getApiKey = (): string => {
  return localStorage.getItem(API_KEY_STORAGE) || '';
};

export const saveApiKey = (key: string) => {
  localStorage.setItem(API_KEY_STORAGE, key);
};

export const getAdvisorHistory = (): { role: 'system' | 'user' | 'assistant', content: string }[] => {
  const data = localStorage.getItem(ADVISOR_HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveAdvisorHistory = (messages: { role: 'system' | 'user' | 'assistant', content: string }[]) => {
  localStorage.setItem(ADVISOR_HISTORY_KEY, JSON.stringify(messages));
};
