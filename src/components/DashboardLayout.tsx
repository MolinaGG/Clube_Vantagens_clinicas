import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Wallet, Megaphone, Clock, CheckCircle, Settings, LogOut, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clinic, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Calendar, label: 'Agenda' },
    { path: '/wallet', icon: Wallet, label: 'Carteira' },
    { path: '/ads', icon: Megaphone, label: 'Anúncios' },
    { path: '/availability', icon: Clock, label: 'Horários' },
    { path: '/validate', icon: CheckCircle, label: 'Validar' },
    { path: '/settings', icon: Settings, label: 'Config' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-gray-900 truncate">{clinic?.name}</h1>
              <p className="text-xs text-gray-500 truncate">Clube de Vantagens</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
