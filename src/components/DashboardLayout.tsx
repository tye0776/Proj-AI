import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Package, ShoppingCart, Sparkles, LogOut } from 'lucide-react';
import { SidebarNavigation } from './SidebarNavigation';

export const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/app/products', icon: Package },
    { name: 'Sales Register', path: '/app/sales', icon: ShoppingCart },
    { name: 'Business Advisor', path: '/app/advisor', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for desktop */}
      <SidebarNavigation />
      
      {/* Main content area */}
      <main className="md:ml-64 flex flex-col flex-1 min-h-screen relative">
        {/* Mobile header */}
        <header className="md:hidden h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              ProfitMate AI
            </span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-20 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <div 
              className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl animate-in slide-in-from-top-2 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <nav className="flex flex-col p-4 space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </NavLink>
                ))}
                <div className="pt-2 mt-2 border-t border-slate-100">
                  <NavLink
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Exit to Landing
                  </NavLink>
                </div>
              </nav>
            </div>
          </div>
        )}
        
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
