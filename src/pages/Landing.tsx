import { ArrowRight, BarChart3, TrendingUp, Sparkles, Target, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-hidden relative font-sans">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200 rounded-full blur-[120px] opacity-40 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200 rounded-full blur-[120px] opacity-40 pointer-events-none" />
      
      {/* Navbar */}
      <header className="px-8 py-6 flex items-center justify-between z-10 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-md">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            ProfitMate AI
          </span>
        </div>
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
          <Link 
            to="/app/dashboard"
            className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 text-sm flex items-center justify-center whitespace-nowrap"
          >
            Launch Demo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 z-10 w-full max-w-6xl mx-auto pt-12 pb-24">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/80 text-indigo-700 font-semibold text-xs uppercase tracking-widest mb-8 border border-indigo-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Sparkles className="w-4 h-4" />
          <span>The Ultimate MVP For Small Business</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-8 max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-700">
          Stop Guessing. <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Start Profiting.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Small businesses struggle because they don't track their true margins. <b>ProfitMate AI</b> empowers retailers to easily record sales, uncover profit drivers, and grow with smart, AI-driven advice.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <Link 
            to="/app/dashboard"
            className="group flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all"
          >
            Try the Interactive Demo
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 text-left w-full">
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/40 hover:-translate-y-2 transition-transform duration-300 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <BarChart3 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Analytics</h3>
            <p className="text-slate-600 leading-relaxed text-sm">Ditch the pen and paper. Log sales in seconds and see your revenue and profit trends in beautiful, real-time charts.</p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/40 hover:-translate-y-2 transition-transform duration-300 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-400">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Margin Optimization</h3>
            <p className="text-slate-600 leading-relaxed text-sm">Know exactly which products are money-makers and which are dead weight. We calculate and highlight your best margins.</p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/40 hover:-translate-y-2 transition-transform duration-300 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">AI Business Advisor</h3>
            <p className="text-slate-600 leading-relaxed text-sm">Like having a Stanford MBA in your pocket. AI reads your specific sales data to give tactical advice on pricing and promotions.</p>
          </div>
        </div>
      </main>
    </div>
  );
};
