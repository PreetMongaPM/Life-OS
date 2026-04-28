import { useState, useEffect } from 'react';
import { Plus, Clock, Flag, Trash2, X, ChevronRight } from 'lucide-react';
import Card from '../components/ui/Card';
import { getTasks, createTask, deleteTask, updateTask } from '../api';

const PRIORITIES = ['Low', 'Medium', 'High'];

export default function Tasks() {
  const [tasks, setTasks] = useState({ todo: [], inProgress: [], done: [] });
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'Medium', due: '' });

  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      const allTasks = res.data;
      setTasks({
        todo: allTasks.filter(t => t.status === 'To Do'),
        inProgress: allTasks.filter(t => t.status === 'In Progress'),
        done: allTasks.filter(t => t.status === 'Completed'),
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    try {
      await createTask({
        title: newTask.title,
        status: 'To Do',
        priority: newTask.priority,
        due: newTask.due || 'No due date',
      });
      setNewTask({ title: '', priority: 'Medium', due: '' });
      setIsAdding(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveTask = async (task, targetStatus) => {
    try {
      await updateTask(task._id, { status: targetStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const priorityStyle = (priority) => {
    if (priority === 'High') return 'border-rose-500/30 text-rose-400 bg-rose-500/10';
    if (priority === 'Medium') return 'border-amber-500/30 text-amber-400 bg-amber-500/10';
    return 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10';
  };

  const renderColumn = (title, items, colorClass, statusOptions) => (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
          {title}
          <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-text-muted">{items.length}</span>
        </h3>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto scrollbar-hide">
        {items.map(task => (
          <div key={task._id} className="bg-white/5 border border-glass-border rounded-xl p-4 hover:bg-glass-hover-bg transition-all group">
            <div className="flex justify-between items-start gap-2 mb-3">
              <h4 className="text-foreground font-medium flex-1 leading-snug">{task.title}</h4>
              <button
                onClick={() => handleDeleteTask(task._id)}
                className="text-text-muted opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-0.5 rounded border flex items-center gap-1 ${priorityStyle(task.priority)}`}>
                <Flag className="w-3 h-3" />
                {task.priority || 'Medium'}
              </span>
              <div className="flex items-center text-text-muted text-xs gap-1">
                <Clock className="w-3 h-3" />
                {task.due || '—'}
              </div>
            </div>

            {/* Move buttons */}
            {statusOptions.length > 0 && (
              <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {statusOptions.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => handleMoveTask(task, opt.status)}
                    className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-foreground transition-colors border border-glass-border"
                  >
                    <ChevronRight className="w-3 h-3" />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-text-muted text-sm text-center py-8 border border-dashed border-glass-border rounded-xl">
            No tasks here
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col pb-8">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Task Board</h1>
          <p className="text-text-muted">Manage your projects and daily tasks.</p>
        </div>
        {/* FIX: "+ New Task" button now works */}
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-brand-primary/30"
        >
          <Plus className="w-5 h-5" />
          New Task
        </button>
      </div>

      {/* FIX: Task creation form */}
      {isAdding && (
        <Card className="mb-6 bg-glass-bg border-brand-primary/50 flex-shrink-0">
          <form onSubmit={handleCreateTask} noValidate>
            <div className="flex gap-4 items-start">
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title..."
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-brand-primary transition-colors text-sm"
                />
                <div className="flex gap-3">
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-foreground text-sm outline-none focus:border-brand-primary transition-colors cursor-pointer min-w-[140px]"
                  >
                    {PRIORITIES.map(p => (
                      <option key={p} value={p}>{p} Priority</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={newTask.due}
                    onChange={e => setNewTask({ ...newTask, due: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-foreground text-sm outline-none focus:border-brand-primary transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button type="submit" className="bg-brand-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-brand-primary/90 transition-colors text-sm">
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setNewTask({ title: '', priority: 'Medium', due: '' }); }}
                  className="p-2.5 text-text-muted hover:text-foreground hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
        </Card>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden min-h-0">
        <Card className="h-full bg-glass-bg flex flex-col overflow-hidden">
          {renderColumn('To Do', tasks.todo, 'bg-gray-400', [
            { label: 'In Progress', status: 'In Progress' },
            { label: 'Done', status: 'Completed' },
          ])}
        </Card>
        <Card className="h-full bg-glass-bg flex flex-col overflow-hidden">
          {renderColumn('In Progress', tasks.inProgress, 'bg-brand-primary', [
            { label: 'Done', status: 'Completed' },
            { label: 'Back to To Do', status: 'To Do' },
          ])}
        </Card>
        <Card className="h-full bg-glass-bg flex flex-col overflow-hidden">
          {renderColumn('Completed', tasks.done, 'bg-emerald-500', [
            { label: 'Reopen', status: 'To Do' },
          ])}
        </Card>
      </div>
    </div>
  );
}
