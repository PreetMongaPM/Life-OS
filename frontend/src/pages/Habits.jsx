import { useState, useEffect, useMemo } from 'react';
import { Plus, Check, Flame, Trophy, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../components/ui/Card';
import { getHabits, createHabit, toggleHabit, deleteHabit } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

// ---------- Heatmap helpers ----------
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function buildMonthlyHeatmap(completedDates = [], weeksBack = 18) {
  const today = new Date();
  const end = new Date(today);
  const start = new Date(today);
  start.setDate(start.getDate() - weeksBack * 7);
  // align to Sunday
  start.setDate(start.getDate() - start.getDay());

  const weeks = [];
  let cur = new Date(start);
  while (cur <= end) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = cur.toLocaleDateString('en-CA');
      week.push({ date: dateStr, count: completedDates.includes(dateStr) ? 1 : 0, day: new Date(cur) });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function getMonthLabels(weeks) {
  const labels = [];
  let lastMonth = null;
  weeks.forEach((week, i) => {
    const month = week[0].day.getMonth();
    if (month !== lastMonth) {
      labels.push({ idx: i, label: MONTHS[month] });
      lastMonth = month;
    }
  });
  return labels;
}

function HeatmapGrid({ completedDates = [], weeksBack = 18, small = false }) {
  const weeks = useMemo(() => buildMonthlyHeatmap(completedDates, weeksBack), [completedDates, weeksBack]);
  const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks]);
  const cellSize = small ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <div className="overflow-x-auto scrollbar-hide pb-2">
      <div className="inline-block min-w-max">
        {/* Month labels */}
        <div className="flex mb-1" style={{ gap: '3px' }}>
          {weeks.map((_, i) => {
            const lbl = monthLabels.find(m => m.idx === i);
            return (
              <div key={i} className="flex flex-col" style={{ width: small ? '12px' : '14px' }}>
                {lbl && (
                  <span className="text-[9px] text-text-muted whitespace-nowrap" style={{ marginLeft: '-2px' }}>
                    {lbl.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {/* Grid: 7 rows x N weeks */}
        <div className="flex" style={{ gap: '3px' }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col" style={{ gap: '3px' }}>
              {week.map((day, di) => {
                const filled = day.count > 0;
                return (
                  <div
                    key={di}
                    title={`${day.date}${filled ? ' ✓' : ''}`}
                    className={`${cellSize} rounded-sm border transition-colors ${
                      filled
                        ? 'bg-brand-primary border-brand-primary/60'
                        : 'bg-white/5 border-white/5'
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Per-Habit Detail Modal ----------
function HabitDetailModal({ habit, onClose }) {
  const todayStr = new Date().toLocaleDateString('en-CA');
  const isCompletedToday = habit.completedDates?.includes(todayStr);
  const totalDone = habit.completedDates?.length || 0;

  return (
    <AnimatePresence>
      {habit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl glass-panel rounded-2xl border border-glass-border shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-glass-border">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${habit.color}`} />
                <h2 className="text-xl font-bold text-foreground">{habit.name}</h2>
                {isCompletedToday && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Done Today ✓
                  </span>
                )}
              </div>
              <button onClick={onClose} className="text-text-muted hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Current Streak', value: `${habit.streak} days`, color: 'text-orange-400' },
                  { label: 'Total Completions', value: totalDone, color: 'text-brand-primary' },
                  { label: 'Target', value: habit.target || 'Daily', color: 'text-purple-400' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white/5 rounded-xl p-4 text-center border border-glass-border">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-text-muted mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Heatmap */}
              <div>
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Completion History</h3>
                <HeatmapGrid completedDates={habit.completedDates || []} weeksBack={18} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------- Main Component ----------
export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [habitError, setHabitError] = useState('');
  const [selectedHabit, setSelectedHabit] = useState(null);

  const todayStr = new Date().toLocaleDateString('en-CA');

  const fetchHabits = async () => {
    try {
      const res = await getHabits();
      setHabits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchHabits(); }, []);

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) { setHabitError('Habit name cannot be empty.'); return; }
    if (newHabitName.trim().length < 2) { setHabitError('Please enter a more descriptive name.'); return; }
    setHabitError('');
    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500', 'bg-orange-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    try {
      await createHabit({ name: newHabitName.trim(), target: 'Daily', color: randomColor });
      setNewHabitName(''); setIsAdding(false);
      fetchHabits();
    } catch (err) { console.error(err); }
  };

  const handleToggleHabit = async (id, e) => {
    e.stopPropagation();
    try { await toggleHabit(id, todayStr); fetchHabits(); }
    catch (err) { console.error(err); }
  };

  const handleDeleteHabit = async (id, e) => {
    e.stopPropagation();
    try { await deleteHabit(id); fetchHabits(); }
    catch (err) { console.error(err); }
  };

  // Combined heatmap from all habits
  const allCompletedDates = useMemo(() => {
    const set = new Set();
    habits.forEach(h => (h.completedDates || []).forEach(d => set.add(d)));
    return [...set];
  }, [habits]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Habit Tracker</h1>
          <p className="text-text-muted">Build good habits, break the bad ones.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-brand-primary/30"
        >
          <Plus className="w-5 h-5" />
          New Habit
        </button>
      </div>

      {isAdding && (
        <Card className="bg-glass-bg border-brand-primary/50">
          <form onSubmit={handleCreateHabit} noValidate>
            <div className="space-y-3">
              <input
                type="text" value={newHabitName} autoFocus
                onChange={e => { setNewHabitName(e.target.value); setHabitError(''); }}
                placeholder="E.g., Read 30 pages, Drink water, Meditate..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-brand-primary transition-colors text-sm"
              />
              {habitError && <p className="text-rose-400 text-xs flex items-center gap-1">⚠ {habitError}</p>}
              <div className="flex gap-2">
                <button type="submit" className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-brand-primary/90 transition-colors text-sm">
                  Save Habit
                </button>
                <button type="button" onClick={() => { setIsAdding(false); setNewHabitName(''); setHabitError(''); }} className="p-2.5 text-text-muted hover:text-foreground hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Overall Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-glass-bg">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-foreground">Overall Activity Heatmap</h2>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-white/5 border border-white/5" />
                <div className="w-3 h-3 rounded-sm bg-brand-primary/40 border border-brand-primary/20" />
                <div className="w-3 h-3 rounded-sm bg-brand-primary border border-brand-primary/60" />
              </div>
              <span>More</span>
            </div>
          </div>
          <HeatmapGrid completedDates={allCompletedDates} weeksBack={18} />
        </Card>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-orange-900/40 to-rose-900/40 border-orange-500/20">
            <h3 className="text-orange-400 font-medium flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5" /> Longest Streak
            </h3>
            <p className="text-3xl font-bold text-foreground">
              {habits.length > 0 ? Math.max(0, ...habits.map(h => h.streak)) : 0} <span className="text-lg font-normal text-text-muted">days</span>
            </p>
          </Card>
          <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-purple-500/20">
            <h3 className="text-purple-400 font-medium flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5" /> Active Habits
            </h3>
            <p className="text-3xl font-bold text-foreground">
              {habits.length} <span className="text-lg font-normal text-text-muted">tracked</span>
            </p>
          </Card>
        </div>
      </div>

      {/* Today's Habits List */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Today's Habits
          <span className="ml-3 text-sm font-normal text-text-muted">
            ({habits.filter(h => h.completedDates?.includes(todayStr)).length}/{habits.length} done)
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map(habit => {
            const isCompletedToday = habit.completedDates?.includes(todayStr);
            return (
              <Card
                key={habit._id}
                onClick={() => setSelectedHabit(habit)}
                className="flex items-center justify-between hover:bg-glass-hover-bg cursor-pointer group bg-glass-bg border-glass-border"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button
                    onClick={(e) => handleToggleHabit(habit._id, e)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 flex-shrink-0 ${
                      isCompletedToday
                        ? `${habit.color} border-transparent shadow-lg`
                        : 'bg-white/5 border-glass-border hover:border-white/30'
                    }`}
                  >
                    {isCompletedToday
                      ? <Check className="w-5 h-5 text-white" />
                      : <div className={`w-3 h-3 rounded-full ${habit.color}`} />}
                  </button>
                  <div className="min-w-0">
                    <h3 className={`font-semibold transition-colors truncate ${isCompletedToday ? 'text-text-muted line-through' : 'text-foreground'}`}>
                      {habit.name}
                    </h3>
                    <p className="text-xs text-text-muted">{habit.target} · click to see history</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <Flame className={`w-4 h-4 ${habit.streak > 0 ? 'text-orange-400' : 'text-gray-500'}`} />
                    <span className="text-foreground font-medium text-sm">{habit.streak}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteHabit(habit._id, e)}
                    className="p-2 text-text-muted hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-white/5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
          {habits.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center text-center py-20 border border-dashed border-glass-border rounded-2xl relative overflow-hidden"
              style={{ background: 'rgba(10,10,20,0.4)' }}
            >
              <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-2xl flex items-center justify-center border border-white/10 mb-4 shadow-xl">
                <Flame className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-white font-semibold mb-1">No habits tracked yet</p>
              <p className="text-text-muted text-sm mb-5 max-w-xs">Start building positive routines. Add your first habit and track your streaks!</p>
              <button
                onClick={() => setIsAdding(true)}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/30 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add First Habit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Per-habit Detail Modal */}
      {selectedHabit && (
        <HabitDetailModal habit={selectedHabit} onClose={() => setSelectedHabit(null)} />
      )}
    </div>
  );
}
