import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './ui/Card';

export default function Pomodoro() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // focus, shortBreak, longBreak
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState('25');

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const mins = parseInt(editMinutes, 10);
    if (!isNaN(mins) && mins > 0) {
      setTimeLeft(mins * 60);
    }
    setIsEditing(false);
  };

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60);
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : newMode === 'shortBreak' ? 5 * 60 : 15 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4"
          >
            <Card className="w-72 shadow-2xl border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Timer className="w-4 h-4 text-brand-primary" />
                  Focus Timer
                </h3>
              </div>
              
              <div className="flex justify-center gap-2 mb-6 bg-black/20 p-1 rounded-lg">
                <button 
                  onClick={() => changeMode('focus')}
                  className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${mode === 'focus' ? 'bg-brand-primary text-white shadow-md' : 'text-text-muted hover:text-foreground'}`}
                >
                  Focus
                </button>
                <button 
                  onClick={() => changeMode('shortBreak')}
                  className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${mode === 'shortBreak' ? 'bg-brand-secondary text-white shadow-md' : 'text-text-muted hover:text-foreground'}`}
                >
                  Short Break
                </button>
              </div>

              <div className="text-center mb-6">
                {isEditing ? (
                  <form onSubmit={handleEditSubmit} className="flex justify-center items-center gap-2 mb-1">
                    <input 
                      type="number" 
                      value={editMinutes}
                      onChange={(e) => setEditMinutes(e.target.value)}
                      className="w-16 text-center text-4xl font-bold font-mono bg-transparent border-b-2 border-brand-primary outline-none text-foreground p-0"
                      autoFocus
                      min="1"
                      max="120"
                    />
                    <span className="text-2xl text-foreground font-mono">m</span>
                  </form>
                ) : (
                  <div 
                    className="text-5xl font-bold font-mono text-foreground mb-1 cursor-pointer hover:text-brand-primary transition-colors"
                    onClick={() => {
                      if (!isActive) {
                        setIsEditing(true);
                        setEditMinutes(Math.floor(timeLeft / 60).toString());
                      }
                    }}
                    title="Click to edit"
                  >
                    {formatTime(timeLeft)}
                  </div>
                )}
                <div className="text-xs text-text-muted">
                  {isEditing ? 'Press Enter to save' : (mode === 'focus' ? 'Stay focused!' : 'Take a breather.')}
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button 
                  onClick={toggleTimer}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/30"
                >
                  {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
                <button 
                  onClick={resetTimer}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-foreground hover:bg-white/10 transition-colors border border-white/10"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/40 text-white hover:scale-105 transition-transform"
      >
        <Timer className="w-6 h-6" />
      </button>
    </div>
  );
}
