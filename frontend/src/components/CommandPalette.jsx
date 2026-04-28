import { useState, useEffect } from 'react';
import { Search, Home, LayoutDashboard, CheckSquare, Calendar as CalendarIcon, DollarSign, Activity, FileText, Settings, X, Moon, Sun, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandPalette({ isOpen, setIsOpen }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  const actions = [
    { id: 'home', name: 'Go to Dashboard', icon: LayoutDashboard, shortcut: 'G D', action: () => navigate('/') },
    { id: 'tasks', name: 'Go to Tasks', icon: CheckSquare, shortcut: 'G T', action: () => navigate('/tasks') },
    { id: 'calendar', name: 'Go to Calendar', icon: CalendarIcon, shortcut: 'G C', action: () => navigate('/calendar') },
    { id: 'finance', name: 'Go to Finances', icon: DollarSign, shortcut: 'G F', action: () => navigate('/finances') },
    { id: 'habits', name: 'Go to Habits', icon: Activity, shortcut: 'G H', action: () => navigate('/habits') },
    { id: 'notes', name: 'Go to Notes', icon: FileText, shortcut: 'G N', action: () => navigate('/notes') },
    { id: 'dark_mode', name: 'Toggle Dark Mode', icon: Moon, action: () => {
        document.documentElement.classList.remove('light');
    }},
    { id: 'light_mode', name: 'Toggle Light Mode', icon: Sun, action: () => {
        document.documentElement.classList.add('light');
    }},
  ];

  const filteredActions = query 
    ? actions.filter(action => action.name.toLowerCase().includes(query.toLowerCase()))
    : actions;

  const handleAction = (action) => {
    action.action();
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-glass-bg border border-glass-border shadow-2xl rounded-2xl overflow-hidden"
        >
          <div className="flex items-center px-4 py-3 border-b border-glass-border">
            <Search className="w-5 h-5 text-text-muted mr-3" />
            <input 
              autoFocus
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..." 
              className="flex-1 bg-transparent border-none outline-none text-foreground text-lg placeholder-text-muted"
            />
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-md text-text-muted hover:bg-glass-hover-bg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto scrollbar-hide py-2">
            {filteredActions.length > 0 ? (
              <div className="px-2">
                <div className="text-xs font-semibold text-text-muted mb-2 px-3 pt-2 uppercase tracking-wider">
                  Suggestions
                </div>
                {filteredActions.map((action, i) => (
                  <button 
                    key={action.id}
                    onClick={() => handleAction(action)}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-glass-hover-bg text-left group transition-colors focus:bg-glass-hover-bg focus:outline-none"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-3 group-hover:bg-brand-primary/20 group-hover:text-brand-primary transition-colors">
                        <action.icon className="w-4 h-4 text-text-muted group-hover:text-brand-primary transition-colors" />
                      </div>
                      <span className="text-foreground font-medium">{action.name}</span>
                    </div>
                    {action.shortcut && (
                      <div className="flex items-center gap-1">
                        {action.shortcut.split(' ').map(key => (
                          <span key={key} className="text-xs bg-black/40 border border-white/10 text-text-muted px-2 py-1 rounded shadow-sm">
                            {key}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-14 text-center text-text-muted">
                <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>No results found for "{query}"</p>
              </div>
            )}
          </div>
          
          <div className="px-4 py-3 border-t border-glass-border bg-black/20 flex items-center text-xs text-text-muted">
            <span className="flex items-center mr-4">
              <kbd className="bg-white/10 rounded px-1.5 py-0.5 mr-1 font-sans">↑</kbd>
              <kbd className="bg-white/10 rounded px-1.5 py-0.5 mr-2 font-sans">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center mr-4">
              <kbd className="bg-white/10 rounded px-1.5 py-0.5 mr-2 font-sans">↵</kbd>
              to select
            </span>
            <span className="flex items-center">
              <kbd className="bg-white/10 rounded px-1.5 py-0.5 mr-2 font-sans">esc</kbd>
              to close
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
