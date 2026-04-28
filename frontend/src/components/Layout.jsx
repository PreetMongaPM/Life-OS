import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Pomodoro from './Pomodoro';
import NotificationPanel from './NotificationPanel';
import ProfileModal from './ProfileModal';
import { Bell, Search, User } from 'lucide-react';

export default function Layout() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userData, setUserData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifeos_user') || '{}'); } catch { return {}; }
  });

  // Always dark
  useEffect(() => {
    document.documentElement.classList.remove('light');
  }, []);

  const handleProfileUpdate = (updated) => {
    setUserData(updated);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 glass-panel border-b-0 border-white/5 flex items-center justify-between px-8 z-10 relative">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 w-96 transition-all focus-within:bg-white/10 focus-within:border-white/20">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search everything..."
              className="bg-transparent border-none outline-none text-foreground w-full placeholder-gray-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                id="notif-bell"
                onClick={() => setNotifOpen(o => !o)}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-[#050505]" />
              </button>
              <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            {/* Profile Avatar */}
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center space-x-3 cursor-pointer p-1 pr-4 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center border-2 border-white/10 flex-shrink-0">
                {userData?.avatar
                  ? <img src={userData.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <User className="w-4 h-4 text-white" />}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white leading-tight">{userData?.name || 'User'}</p>
                <p className="text-xs text-gray-400">{userData?.role || 'Student'}</p>
              </div>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide p-8 relative">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-secondary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
          <Outlet />
        </main>
      </div>

      <Pomodoro />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
}
