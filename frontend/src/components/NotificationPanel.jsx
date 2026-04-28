import { useState, useEffect, useRef } from 'react';
import { X, Bell, CheckSquare, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTasks, getEvents } from '../api';

export default function NotificationPanel({ isOpen, onClose }) {
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const todayStr = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      try {
        const [tasksRes, eventsRes] = await Promise.all([getTasks(), getEvents()]);
        // tasks that are not Completed
        setTodayTasks(tasksRes.data.filter(t => t.status !== 'Completed').slice(0, 8));
        // events from today onwards
        setUpcomingEvents(eventsRes.data.filter(e => e.date >= todayStr).slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const priorityColor = (p) => {
    if (p === 'High') return 'text-rose-400';
    if (p === 'Medium') return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div
      ref={panelRef}
      className="absolute top-14 right-0 z-50 w-96 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
      style={{ background: 'rgba(10, 10, 18, 0.97)', backdropFilter: 'blur(24px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-glass-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand-primary" />
          <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
        </div>
        <button onClick={onClose} className="p-1 text-text-muted hover:text-foreground hover:bg-white/5 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-[480px] overflow-y-auto scrollbar-hide">
        {/* Today's Pending Tasks */}
        <div className="px-4 pt-4 pb-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckSquare className="w-3.5 h-3.5" />
            Pending Tasks ({todayTasks.length})
          </p>
          {todayTasks.length === 0 && (
            <p className="text-text-muted text-sm py-2 px-1">🎉 All tasks done!</p>
          )}
          <div className="space-y-1">
            {todayTasks.map(task => (
              <div
                key={task._id}
                onClick={() => { navigate('/tasks'); onClose(); }}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-glass-hover-bg cursor-pointer transition-colors group border border-transparent hover:border-glass-border"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.status === 'In Progress' ? 'bg-brand-primary' : 'bg-gray-500'
                  }`} />
                  <span className="text-foreground text-sm truncate">{task.title}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium ${priorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <ChevronRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="px-4 pt-3 pb-4 border-t border-glass-border">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2 mt-3">
              <Calendar className="w-3.5 h-3.5" />
              Upcoming Events ({upcomingEvents.length})
            </p>
            <div className="space-y-1">
              {upcomingEvents.map(evt => (
                <div
                  key={evt._id}
                  onClick={() => { navigate('/calendar'); onClose(); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-glass-hover-bg cursor-pointer transition-colors border border-transparent hover:border-glass-border"
                >
                  <div className={`w-2 h-8 rounded-full flex-shrink-0 ${evt.color || 'bg-brand-primary'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm truncate">{evt.title}</p>
                    <p className="text-text-muted text-xs">{evt.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-glass-border">
        <button
          onClick={() => { navigate('/tasks'); onClose(); }}
          className="w-full text-center text-sm text-brand-primary hover:text-brand-secondary transition-colors font-medium py-1"
        >
          View All Tasks →
        </button>
      </div>
    </div>
  );
}
