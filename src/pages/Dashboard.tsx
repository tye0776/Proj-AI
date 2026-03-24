import { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, DollarSign, Package, Award } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Sparkles, Loader2 } from 'lucide-react';
import type { Product, Sale } from '../types';
import { getProducts, getSales, initializeDemoData, getApiKey } from '../services/store';

export const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  useEffect(() => {
    initializeDemoData();
    setProducts(getProducts());
    setSales(getSales());
  }, []);

  // Calculate Metrics
  const totalRevenue = sales.reduce((sum, sale) => {
    const product = products.find(p => p.id === sale.productId);
    return sum + (product ? product.sellingPrice * sale.quantity : 0);
  }, 0);

  const totalCost = sales.reduce((sum, sale) => {
    const product = products.find(p => p.id === sale.productId);
    return sum + (product ? product.costPrice * sale.quantity : 0);
  }, 0);

  const totalProfit = totalRevenue - totalCost;

  // Best Selling Product (by quantity)
  const productSalesMap: Record<string, number> = {};
  sales.forEach(s => {
    productSalesMap[s.productId] = (productSalesMap[s.productId] || 0) + s.quantity;
  });
  
  let bestSellingProductId = '';
  let maxQuantity = 0;
  Object.entries(productSalesMap).forEach(([id, qty]) => {
    if (qty > maxQuantity) {
      maxQuantity = qty;
      bestSellingProductId = id;
    }
  });
  
  const bestSellingProduct = products.find(p => p.id === bestSellingProductId);

  // Highest Margin Product
  let highestMarginProduct: Product | undefined;
  let maxMargin = 0;
  products.forEach(p => {
    const margin = p.sellingPrice - p.costPrice;
    if (margin > maxMargin) {
      maxMargin = margin;
      highestMarginProduct = p;
    }
  });

  // Chart Data: Daily Revenue (Last 7 Days)
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const dailyData = last7Days.map(date => {
    const daySales = sales.filter(s => s.date === date);
    const revenue = daySales.reduce((sum, sale) => {
      const product = products.find(p => p.id === sale.productId);
      return sum + (product ? product.sellingPrice * sale.quantity : 0);
    }, 0);
    const profit = daySales.reduce((sum, sale) => {
      const product = products.find(p => p.id === sale.productId);
      return sum + (product ? (product.sellingPrice - product.costPrice) * sale.quantity : 0);
    }, 0);
    
    // Format date for display (e.g. "Mon", "Tue")
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
    
    return { name: dayName, revenue, profit };
  });

  // Chart Data: Sales Distribution by Product
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];
  const productData = products.map(p => {
    const revenue = sales
      .filter(s => s.productId === p.id)
      .reduce((sum, s) => sum + p.sellingPrice * s.quantity, 0);
    return { name: p.name, value: revenue };
  }).filter(d => d.value > 0);

  // Fetch Daily Insight from AI
  useEffect(() => {
    const fetchInsight = async () => {
      const apiKey = getApiKey();
      if (!apiKey || products.length === 0 || sales.length === 0) return;

      setIsLoadingInsight(true);
      const today = new Date().toISOString().split('T')[0];
      const recentSales = sales.filter(s => s.date === today || s.date === last7Days[5]); // Context of today/yesterday

      if (apiKey === 'demo-mode') {
        setTimeout(() => {
          const margin = bestSellingProduct ? bestSellingProduct.sellingPrice - bestSellingProduct.costPrice : 0;
          setInsight(`Focus on ${bestSellingProduct?.name || 'your top sellers'} today. Selling just 10 more units will add ₦${(margin * 10).toLocaleString()} strictly in profit!`);
          setIsLoadingInsight(false);
        }, 1500);
        return;
      }

      const prompt = `
        You are ProfitMate AI. Create a single, punchy, 1-2 sentence daily business insight. YOUR ABSOLUTE PRIORITY IS INCREASING PROFITS.
        Data context: Total Revenue: ₦${totalRevenue}, Best Seller: ${bestSellingProduct?.name}, Highest Margin: ${highestMarginProduct?.name}.
        Recent activity: ${recentSales.length} sales today/yesterday.
        Provide encouraging, actionable advice focused on maximizing margins and driving high-profit sales for a Nigerian pastry shop. Do not use quotes.
      `;

      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: [{ role: 'system', content: prompt }],
            temperature: 0.7,
          })
        });

        if (res.ok) {
          const data = await res.json();
          setInsight(data.choices[0].message.content);
        }
      } catch (err) {
        console.error('Failed to fetch insight', err);
      } finally {
        setIsLoadingInsight(false);
      }
    };

    if (!insight) {
      fetchInsight();
    }
  }, [products, sales]);

  const MetricCard = ({ title, value, icon: Icon, subtitle, className = '' }: any) => (
    <div className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm card-shadow hover-card flex items-center justify-between group flex-nowrap ${className}`}>
      <div className="min-w-0 pr-3">
        <p className="text-sm font-medium text-slate-500 mb-1 truncate">{title}</p>
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 truncate" title={value.toString()}>{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1 truncate">{subtitle}</p>}
      </div>
      <div className="w-12 h-12 rounded-full flex-shrink-0 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-blue-600" />
          Business Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your performance</p>
      </div>

      {getApiKey() && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm card-shadow flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
            {isLoadingInsight ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Insight for the day</h3>
            {isLoadingInsight ? (
              <div className="space-y-2 w-full mt-2">
                <div className="h-4 bg-blue-100 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-blue-100 rounded animate-pulse w-1/2"></div>
              </div>
            ) : (
              <p className="text-slate-700 leading-relaxed">{insight || 'Your business is performing well! Keep tracking sales to get personalized AI insights.'}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Revenue" 
          value={`₦${totalRevenue.toLocaleString()}`} 
          icon={DollarSign}
          subtitle="All-time gross sales"
        />
        <MetricCard 
          title="Total Profit" 
          value={`₦${totalProfit.toLocaleString()}`} 
          icon={TrendingUp}
          subtitle="Revenue minus costs"
        />
        <MetricCard 
          title="Top Selling Product" 
          value={bestSellingProduct?.name || 'N/A'} 
          icon={Package}
          subtitle={`${maxQuantity} units sold`}
        />
        <MetricCard 
          title="Highest Margin" 
          value={highestMarginProduct?.name || 'N/A'} 
          icon={Award}
          subtitle={`₦${maxMargin.toLocaleString()} margin / unit`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm card-shadow lg:col-span-2">
          <h2 className="text-lg font-semibold mb-6">Revenue & Profit Overview (Last 7 Days)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `₦${value.toLocaleString()}`} />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any) => [`₦${Number(value).toLocaleString()}`, String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm card-shadow">
          <h2 className="text-lg font-semibold mb-6">Revenue by Product</h2>
          <div className="h-80 w-full flex items-center justify-center overflow-x-auto">
            {productData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {productData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Legend verticalAlign="bottom" height={60} wrapperStyle={{ fontSize: '11px', overflowY: 'auto' }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm">No data available to display chart.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
