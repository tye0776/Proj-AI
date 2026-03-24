import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Calendar, Download, Edit2, Trash2, X, Save } from 'lucide-react';
import type { Product, Sale } from '../types';
import { getProducts, getSales, addSale, updateSale, deleteSale, initializeDemoData } from '../services/store';

export const Sales = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newSale, setNewSale] = useState({ 
    productId: '', 
    quantity: '1', 
    date: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    initializeDemoData();
    setProducts(getProducts());
    setSales(getSales().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSale.productId || !newSale.quantity || !newSale.date) return;
    
    if (editingId) {
      const existing = sales.find(s => s.id === editingId);
      if (existing) {
        const updated = updateSale({
          ...existing,
          productId: newSale.productId,
          quantity: parseInt(newSale.quantity, 10),
          date: newSale.date,
        });
        setSales(sales.map(s => s.id === editingId ? updated : s).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    } else {
      const sale = addSale({
        productId: newSale.productId,
        quantity: parseInt(newSale.quantity, 10),
        date: newSale.date,
      });
      setSales([sale, ...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    
    resetForm();
  };

  const resetForm = () => {
    setNewSale({ 
      productId: '', 
      quantity: '1', 
      date: new Date().toISOString().split('T')[0] 
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEditing = (sale: Sale) => {
    setNewSale({
      productId: sale.productId,
      quantity: sale.quantity.toString(),
      date: sale.date,
    });
    setEditingId(sale.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      deleteSale(id);
      setSales(getSales().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      if (editingId === id) resetForm();
    }
  };

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Unknown Product';
  const getProductPrice = (id: string) => products.find(p => p.id === id)?.sellingPrice || 0;

  const exportCSV = () => {
    const headers = ['Date', 'Product', 'Quantity', 'Revenue'];
    const rows = sales.map(sale => {
      const productName = getProductName(sale.productId).replace(/,/g, '');
      const revenue = getProductPrice(sale.productId) * sale.quantity;
      return [
        sale.date,
        productName,
        sale.quantity,
        revenue
      ].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `profitmate_sales_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            Sales Register
          </h1>
          <p className="text-slate-500 text-sm mt-1">Log new sales and view history</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={exportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => {
              if (isAdding) resetForm();
              else setIsAdding(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm text-sm font-medium"
          >
            {isAdding ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Log Sale</>}
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm card-shadow animate-in fade-in slide-in-from-top-2">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Sale' : 'Log New Sale'}</h2>
          <form onSubmit={handleAddSale} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Product</label>
              <select
                required
                value={newSale.productId}
                onChange={e => setNewSale({...newSale, productId: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all text-slate-900"
              >
                <option value="" disabled>Select a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (₦{p.sellingPrice.toLocaleString()})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</label>
              <input
                type="number"
                required
                min="1"
                value={newSale.quantity}
                onChange={e => setNewSale({...newSale, quantity: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={newSale.date}
                  onChange={e => setNewSale({...newSale, date: e.target.value})}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium h-[42px] flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Update Sale' : 'Save Sale'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">Recent Sales History</h3>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Total Revenue</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No sales recorded yet. Log your first sale above.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => {
                  const revenue = getProductPrice(sale.productId) * sale.quantity;
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {new Date(sale.date).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{getProductName(sale.productId)}</td>
                      <td className="px-6 py-4 text-slate-600">{sale.quantity}</td>
                      <td className="px-6 py-4 font-medium text-emerald-600">₦{revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEditing(sale)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors border border-blue-100"
                            title="Edit Sale"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sale.id)}
                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors border border-red-100"
                            title="Delete Sale"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
