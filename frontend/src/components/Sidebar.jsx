import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Wallet, 
  Activity, 
  StickyNote,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
  { name: 'Finances', path: '/finances', icon: Wallet },
  { name: 'Habits', path: '/habits', icon: Activity },
  { name: 'Notes', path: '/notes', icon: StickyNote },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('lifeos_token');
    localStorage.removeItem('lifeos_user');
    navigate('/login');
  };

  return (
    <aside className="w-72 h-screen glass-panel border-r border-glass-border flex flex-col pt-8 pb-6 px-6 relative z-20">
      <div className="flex items-center mb-12 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mr-4">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Life<span className="text-gradient">OS</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                  isActive 
                    ? 'text-foreground bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                    : 'text-text-muted hover:text-foreground hover:bg-glass-hover-bg'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent border-l-2 border-brand-primary"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-brand-primary' : 'group-hover:text-foreground'}`} />
                  <span className="font-medium text-[15px] relative z-10">{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 pt-6 border-t border-glass-border">
        <button onClick={handleLogout} className="flex w-full items-center space-x-4 px-4 py-3.5 rounded-xl text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-[15px]">Logout</span>
        </button>
      </div>
    </aside>
  );
}
