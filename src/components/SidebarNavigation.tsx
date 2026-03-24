import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Sparkles, LogOut } from 'lucide-react';

export const SidebarNavigation = () => {
  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/app/products', icon: Package },
    { name: 'Sales Register', path: '/app/sales', icon: ShoppingCart },
    { name: 'Business Advisor', path: '/app/advisor', icon: Sparkles },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-200">
        <Sparkles className="w-6 h-6 text-blue-600" />
        <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          ProfitMate AI
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
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
      </nav>

      <div className="p-4 border-t border-slate-200">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Exit to Landing
        </NavLink>
      </div>
    </aside>
  );
};
