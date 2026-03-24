import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, History, ChevronDown, ChevronUp, Save, X, Trash2 } from 'lucide-react';
import type { Product } from '../types';
import { getProducts, addProduct, updateProduct, deleteProduct, initializeDemoData } from '../services/store';

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: '', costPrice: '', sellingPrice: '' });
  const [isCombo, setIsCombo] = useState(false);
  const [selectedComboItems, setSelectedComboItems] = useState<string[]>([]);

  useEffect(() => {
    initializeDemoData();
    setProducts(getProducts());
  }, []);

  useEffect(() => {
    if (isCombo) {
      const calculatedCost = selectedComboItems.reduce((sum, itemId) => {
        const product = products.find(p => p.id === itemId);
        return sum + (product?.costPrice || 0);
      }, 0);
      setFormData(prev => ({ ...prev, costPrice: calculatedCost.toString() }));
    }
  }, [isCombo, selectedComboItems, products]);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.costPrice || !formData.sellingPrice) return;
    
    if (editingId) {
      const existing = products.find(p => p.id === editingId);
      if (existing) {
        const updated = updateProduct({
          ...existing,
          name: formData.name,
          costPrice: parseFloat(formData.costPrice),
          sellingPrice: parseFloat(formData.sellingPrice),
          isCombo: isCombo,
          comboItems: isCombo ? selectedComboItems : [],
        });
        setProducts(products.map(p => p.id === editingId ? updated : p));
      }
    } else {
      const product = addProduct({
        name: formData.name,
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        isCombo: isCombo,
        comboItems: isCombo ? selectedComboItems : [],
      });
      setProducts([...products, product]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', costPrice: '', sellingPrice: '' });
    setIsCombo(false);
    setSelectedComboItems([]);
    setIsAdding(false);
    setEditingId(null);
  };

  const startEditing = (product: Product) => {
    setFormData({
      name: product.name,
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
    });
    setIsCombo(!!product.isCombo);
    setSelectedComboItems(product.comboItems || []);
    setEditingId(product.id);
    setIsAdding(true);
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?\nThis cannot be undone.`)) {
      deleteProduct(id);
      setProducts(getProducts());
      if (editingId === id) resetForm();
    }
  };

  const toggleComboItem = (id: string) => {
    setSelectedComboItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Product Manager
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your inventory and pricing</p>
        </div>
        <button
          onClick={() => {
            if (isAdding) {
              resetForm();
            } else {
              setIsAdding(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm text-sm font-medium"
        >
          {isAdding ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add Product</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm card-shadow animate-in fade-in slide-in-from-top-2">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g. Artisan Coffee"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cost Price (₦)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₦</span>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.costPrice}
                  onChange={e => setFormData({...formData, costPrice: e.target.value})}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Selling Price (₦)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₦</span>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={e => setFormData({...formData, sellingPrice: e.target.value})}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 h-[42px] px-2">
              <input 
                type="checkbox" 
                id="isCombo" 
                checked={isCombo} 
                onChange={(e) => setIsCombo(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="isCombo" className="text-sm font-medium text-slate-700 cursor-pointer">
                Is this a combo?
              </label>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium h-[42px] flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Update Product' : 'Save Product'}
            </button>
            
            {isCombo && (
              <div className="col-span-full mt-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Select Items in Combo</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {products.filter(p => !p.isCombo).map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={selectedComboItems.includes(p.id)}
                        onChange={() => toggleComboItem(p.id)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="truncate">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider w-1/3">Product Name</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Cost Price</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Selling Price</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Margin</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No products found. Add your first product above.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const margin = product.sellingPrice - product.costPrice;
                  const marginPercent = (margin / product.sellingPrice) * 100;
                  return (
                    <React.Fragment key={product.id}>
                      <tr className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          {product.name}
                          {product.isCombo && (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 rounded-full">
                              Combo
                            </span>
                          )}
                        </div>
                        {product.priceHistory && product.priceHistory.length > 0 && (
                          <button 
                            onClick={() => setExpandedHistoryId(expandedHistoryId === product.id ? null : product.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1 font-medium bg-blue-50 px-2 py-0.5 rounded-full w-fit"
                          >
                            <History className="w-3 h-3" />
                            {product.priceHistory.length} Price Changes
                            {expandedHistoryId === product.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">₦{product.costPrice.toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-600">₦{product.sellingPrice.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          marginPercent > 50 ? 'bg-emerald-50 text-emerald-700' :
                          marginPercent > 30 ? 'bg-blue-50 text-blue-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          ₦{margin.toLocaleString()} ({marginPercent.toFixed(0)}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEditing(product)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors border border-blue-100"
                            title="Edit Product Details & Price"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors border border-red-100"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedHistoryId === product.id && product.priceHistory && (
                      <tr className="bg-slate-50 animate-in slide-in-from-top-2 duration-200">
                        <td colSpan={5} className="px-6 py-4 px-12 border-l-4 border-l-blue-400">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <History className="w-4 h-4" /> Price Change History log
                          </h4>
                          <div className="space-y-3">
                            {product.priceHistory.map((history, idx) => (
                              <div key={idx} className="flex items-center gap-4 text-sm bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                <span className="text-slate-400 min-w-[140px] font-medium text-xs">
                                  {new Date(history.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                                <div className="flex gap-4">
                                  <span className="text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                    <span className="text-slate-400 mr-1 text-xs">Cost:</span> 
                                    <span className="font-medium line-through decoration-red-400">₦{history.costPrice.toLocaleString()}</span>
                                  </span>
                                  <span className="text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                    <span className="text-slate-400 mr-1 text-xs">Selling:</span> 
                                    <span className="font-medium line-through decoration-red-400">₦{history.sellingPrice.toLocaleString()}</span>
                                  </span>
                                </div>
                              </div>
                            ))}
                            <div className="flex items-center gap-4 text-sm bg-blue-50/50 p-3 rounded-lg border border-blue-100 shadow-sm relative overflow-hidden">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                              <span className="text-blue-600 min-w-[140px] font-bold text-xs">
                                Current Price
                              </span>
                              <div className="flex gap-4">
                                <span className="text-slate-900 bg-white px-2 py-1 rounded border border-blue-200 shadow-sm font-semibold">
                                  <span className="text-blue-600 mr-1 text-xs">Cost:</span> 
                                  ₦{product.costPrice.toLocaleString()}
                                </span>
                                <span className="text-slate-900 bg-white px-2 py-1 rounded border border-blue-200 shadow-sm font-semibold">
                                  <span className="text-blue-600 mr-1 text-xs">Selling:</span> 
                                  ₦{product.sellingPrice.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
