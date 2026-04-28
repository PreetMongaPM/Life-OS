import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  TrendingUp, 
  CheckCircle2, 
  CalendarDays, 
  Target,
  Wallet,
  Clock,
  Flame,
  Award,
  Calendar as CalendarIcon
} from 'lucide-react';
import Card from '../components/ui/Card';
import { getTasks, getHabits, getEvents, getTransactions } from '../api';


export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [events, setEvents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const user = JSON.parse(localStorage.getItem('lifeos_user') || '{}');
  const userName = user?.name ? user.name.split(' ')[0] : 'there';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, habitsRes, eventsRes, txRes] = await Promise.all([
          getTasks(),
          getHabits(),
          getEvents(),
          getTransactions()
        ]);
        setTasks(tasksRes.data);
        setHabits(habitsRes.data);
        setEvents(eventsRes.data);
        setTransactions(txRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };
    fetchData();
  }, []);

  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const taskCompletionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  
  const todayStr = new Date().toLocaleDateString('en-CA');
  const upcomingEvents = events.filter(e => e.date >= todayStr).slice(0, 3);
  
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, c) => a + c.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, c) => a + c.amount, 0);
  const totalSavings = totalIncome - totalExpense;
  const INR = (v) => `₹${Math.abs(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const balanceLabel = totalSavings >= 0 ? INR(totalSavings) : `-${INR(totalSavings)}`;

  // Monthly heatmap data — same pattern as Habits page
  const buildHeatmapWeeks = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 18 * 7);
    start.setDate(start.getDate() - start.getDay()); // align to Sunday
    const weeks = [];
    let cur = new Date(start);
    while (cur <= today) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = cur.toLocaleDateString('en-CA');
        const count = habits.filter(h => h.completedDates?.includes(dateStr)).length;
        week.push({ date: dateStr, count, month: cur.getMonth() });
        cur.setDate(cur.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  };
  const heatmapWeeks = buildHeatmapWeeks();
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthLabels = heatmapWeeks.reduce((acc, week, i) => {
    const m = week[0].month;
    if (!acc.find(l => l.month === m)) acc.push({ idx: i, month: m });
    return acc;
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Welcome back, {userName}! 👋</h1>
          <p className="text-text-muted">Here's what's happening in your life today.</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-brand-primary">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          <p className="text-text-muted text-sm">{upcomingEvents.length} events today</p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center space-x-4 bg-glass-bg border-glass-border hover:bg-glass-hover-bg transition-colors">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-text-muted">Tasks Completed</p>
            <h3 className="text-2xl font-bold text-foreground">{completedTasks}</h3>
          </div>
        </Card>
        
        <Card className="flex items-center space-x-4 bg-glass-bg border-glass-border hover:bg-glass-hover-bg transition-colors">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-text-muted">Net Balance</p>
            <h3 className={`text-2xl font-bold ${totalSavings >= 0 ? 'text-foreground' : 'text-rose-400'}`}>{balanceLabel}</h3>
          </div>
        </Card>
        
        <Card className="flex items-center space-x-4 bg-glass-bg border-glass-border hover:bg-glass-hover-bg transition-colors">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-text-muted">Longest Streak</p>
            <h3 className="text-2xl font-bold text-foreground">
              {habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0} Days
            </h3>
          </div>
        </Card>
        
        <Card className="flex items-center space-x-4 bg-glass-bg border-glass-border hover:bg-glass-hover-bg transition-colors">
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl">
            <CalendarDays className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-text-muted">Upcoming Events</p>
            <h3 className="text-2xl font-bold text-foreground">{upcomingEvents.length}</h3>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="h-72 flex flex-col bg-glass-bg border-glass-border">
          <h2 className="text-lg font-semibold text-foreground mb-3">Habit Heatmap</h2>
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="inline-block min-w-max">
              {/* Month labels */}
              <div className="flex mb-1" style={{gap:'3px'}}>
                {heatmapWeeks.map((_, i) => {
                  const lbl = monthLabels.find(m => m.idx === i);
                  return (
                    <div key={i} style={{width:'14px'}}>
                      {lbl && <span className="text-[9px] text-text-muted" style={{marginLeft:'-2px'}}>{MONTHS[lbl.month]}</span>}
                    </div>
                  );
                })}
              </div>
              {/* Grid */}
              <div className="flex" style={{gap:'3px'}}>
                {heatmapWeeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col" style={{gap:'3px'}}>
                    {week.map((day, di) => {
                      let bg = 'bg-white/5 border-white/5';
                      if (day.count === 1) bg = 'bg-brand-primary/40 border-brand-primary/20';
                      else if (day.count === 2) bg = 'bg-brand-primary/70 border-brand-primary/40';
                      else if (day.count >= 3) bg = 'bg-brand-primary border-brand-primary/60';
                      return (
                        <div key={di} title={`${day.count} habits on ${day.date}`}
                          className={`w-3.5 h-3.5 rounded-sm border ${bg} transition-colors`} />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-glass-bg border-glass-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-glass-hover-bg transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{tx.name}</p>
                    <p className="text-xs text-text-muted">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                </span>
              </div>
            ))}
            {transactions.length === 0 && <p className="text-text-muted text-center py-4">No recent transactions.</p>}
          </div>
        </Card>

        {/* Side widgets */}
        <div className="space-y-6">
          <Card className="bg-glass-bg border-glass-border">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-brand-primary" />
              Upcoming Events
            </h2>
            <div className="space-y-4">
              {upcomingEvents.map((evt) => (
                <div key={evt._id} className="flex items-start gap-4 group cursor-pointer">
                  <div className={`w-2 h-12 rounded-full ${evt.color}`}></div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground group-hover:text-brand-primary transition-colors">{evt.title}</h3>
                    <div className="flex items-center text-sm text-text-muted mt-1 gap-3">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(evt.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && <p className="text-text-muted">No upcoming events.</p>}
            </div>
            <button onClick={() => navigate('/calendar')} className="w-full mt-4 py-2 text-sm text-text-muted hover:text-foreground transition-colors font-medium border border-transparent hover:border-glass-border rounded-lg bg-white/5">
              View Calendar →
            </button>
          </Card>

          <Card className="bg-glass-bg border-glass-border">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-orange-500" />
              Daily Habits
            </h2>
            <div className="space-y-3">
              {habits.slice(0,4).map((habit) => {
                const isCompletedToday = habit.completedDates && habit.completedDates.includes(todayStr);
                return (
                  <div
                    key={habit._id}
                    onClick={() => navigate('/habits')}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-glass-hover-bg transition-colors cursor-pointer border border-transparent hover:border-glass-hover-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                        isCompletedToday ? `${habit.color} border-transparent` : 'border-glass-border bg-white/5'
                      }`}>
                        {isCompletedToday ? <CheckCircle2 className="w-5 h-5 text-white" /> : <div className={`w-2 h-2 rounded-full ${habit.color.replace('bg-', 'bg-').replace('500', '400')}`} />}
                      </div>
                      <span className={`font-medium ${isCompletedToday ? 'text-text-muted line-through' : 'text-foreground'}`}>{habit.name}</span>
                    </div>
                    <span className="text-orange-400 font-medium flex items-center gap-1 text-sm">
                      <Flame className="w-3 h-3" /> {habit.streak}
                    </span>
                  </div>
                );
              })}
              {habits.length === 0 && <p className="text-text-muted">No habits added yet.</p>}
            </div>
            <button onClick={() => navigate('/habits')} className="w-full mt-4 py-2 text-sm text-text-muted hover:text-foreground transition-colors font-medium border border-transparent hover:border-glass-border rounded-lg bg-white/5">
              Manage Habits →
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
