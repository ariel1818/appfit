import { memo } from 'react';
import { Chrome as Home, Dumbbell, Apple, Trophy, User } from 'lucide-react';
import { Link, useLocation } from 'react-router';

function BottomNav() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  
  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/workout-builder', icon: Dumbbell, label: 'Treino' },
    { path: '/nutrition', icon: Apple, label: 'Nutrição' },
    { path: '/achievements', icon: Trophy, label: 'Marcos' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="glass-dark border-t border-slate-800/50 backdrop-blur-xl">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors duration-150 ${
                    active
                      ? 'text-brand-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
                  <span className={`text-xs font-medium ${active ? 'font-bold' : ''}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default memo(BottomNav);
