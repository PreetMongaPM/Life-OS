import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import Card from '../components/ui/Card';
import { getEvents, createEvent, deleteEvent } from '../api';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [eventError, setEventError] = useState('');

  const fetchEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) { setEventError('Event title is required.'); return; }
    setEventError('');
    try {
      const colors = ['bg-rose-500', 'bg-emerald-500', 'bg-blue-500', 'bg-brand-primary', 'bg-purple-500', 'bg-orange-500'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      await createEvent({ title: newEventTitle, date: dateStr, color: randomColor });
      setNewEventTitle('');
      setIsAdding(false);
      setEventError('');
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteEvent(id);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // FIX: Just set selectedDate to the raw Date object — no string parsing
  const onDateClick = (day) => {
    setSelectedDate(day);
  };

  const openAddForDate = (day, e) => {
    e.stopPropagation();
    setSelectedDate(day);
    setIsAdding(true);
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Calendar</h1>
        <p className="text-text-muted">Schedule your life, events, and deadlines.</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-1">
          <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded transition-colors text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-foreground font-medium px-4 w-40 text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded transition-colors text-foreground">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => { setIsAdding(!isAdding); }}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Event
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentDate);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium text-text-muted text-sm py-2">
          {format(addDays(startDate, i), 'EEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day); // FIX: capture a real Date copy
        const formattedDate = format(cloneDay, 'd');
        const dayStr = format(cloneDay, 'yyyy-MM-dd');
        const dayEvents = events.filter(e => e.date === dayStr);
        const isToday = isSameDay(cloneDay, new Date());
        const isSelected = isSameDay(cloneDay, selectedDate);
        const isCurrentMonth = isSameMonth(cloneDay, monthStart);

        days.push(
          <div
            key={dayStr}
            onClick={() => onDateClick(cloneDay)}
            className={`min-h-[100px] p-2 border-t border-r border-glass-border relative transition-colors cursor-pointer group hover:bg-glass-hover-bg
              ${!isCurrentMonth ? 'opacity-40' : ''}
              ${isSelected ? 'bg-brand-primary/10' : ''}
              ${isToday && !isSelected ? 'bg-white/5' : ''}
            `}
          >
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                ${isToday ? 'bg-brand-primary text-white' : isSelected ? 'text-brand-primary font-bold' : 'text-foreground'}
              `}>
                {formattedDate}
              </span>
              {/* Quick add button on hover */}
              <button
                onClick={(e) => openAddForDate(cloneDay, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/10 rounded text-text-muted hover:text-foreground"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-1 space-y-1">
              {dayEvents.map(evt => (
                <div
                  key={evt._id}
                  className={`text-[10px] px-1.5 py-0.5 rounded flex justify-between items-center group/evt
                    ${evt.color ? evt.color.replace('bg-', 'bg-') + '/20' : 'bg-brand-primary/20'}
                    ${evt.color ? evt.color.replace('bg-', 'text-') : 'text-brand-primary'}
                  `}
                >
                  <span className="truncate">{evt.title}</span>
                  <button
                    onClick={(e) => handleDeleteEvent(evt._id, e)}
                    className="opacity-0 group-hover/evt:opacity-100 hover:text-rose-400 ml-1 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toISOString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border-l border-b border-glass-border rounded-bl-xl">{rows}</div>;
  };

  return (
    <div className="h-full flex flex-col pb-8">
      {renderHeader()}

      {isAdding && (
        <Card className="mb-6 bg-glass-bg border-brand-primary/50 animate-in fade-in slide-in-from-top-2">
          <form onSubmit={handleCreateEvent} noValidate>
            <div className="flex gap-3 items-start">
              <span className="text-foreground font-medium whitespace-nowrap border border-white/10 px-4 py-2.5 rounded-xl bg-white/5 text-sm flex-shrink-0">
                {format(selectedDate, 'MMM d, yyyy')}
              </span>
              <div className="flex-1">
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={e => { setNewEventTitle(e.target.value); setEventError(''); }}
                  placeholder="Event title..."
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-brand-primary transition-colors text-sm"
                />
                {eventError && <p className="text-rose-400 text-xs mt-1">⚠ {eventError}</p>}
              </div>
              <button type="submit" className="bg-brand-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-brand-primary/90 transition-colors text-sm flex-shrink-0">
                Add Event
              </button>
              <button
                type="button"
                onClick={() => { setIsAdding(false); setNewEventTitle(''); setEventError(''); }}
                className="text-text-muted hover:text-foreground p-2.5 hover:bg-white/5 rounded-xl transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card className="flex-1 p-0 overflow-hidden bg-glass-bg">
        <div className="p-6 h-full flex flex-col">
          {renderDays()}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {renderCells()}
          </div>
        </div>
      </Card>
    </div>
  );
}
