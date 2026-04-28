import { useState, useEffect, useRef } from 'react';
import { X, Camera, User, Lock, Save, Eye, EyeOff, Phone, BookOpen, GraduationCap, FileText, Link, Trash2 } from 'lucide-react';
import { getProfile, updateProfile, changePassword } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = ['Profile', 'Security'];

export default function ProfileModal({ isOpen, onClose, onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState('Profile');
  const [profile, setProfile] = useState({
    name: '', email: '', bio: '', phone: '', college: '', year: '', avatar: '', role: ''
  });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setMsg(''); setError(''); setActiveTab('Profile');
    getProfile()
      .then(res => {
        const u = res.data;
        setProfile({
          name: u.name || '',
          email: u.email || '',
          bio: u.bio || '',
          phone: u.phone || '',
          college: u.college || '',
          year: u.year || '',
          avatar: u.avatar || '',
          role: u.role || 'Student',
        });
      })
      .catch(console.error);
  }, [isOpen]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(''); setError('');
    if (!profile.name.trim()) { setError('Full name is required.'); setLoading(false); return; }
    try {
      await updateProfile({
        name: profile.name,
        bio: profile.bio,
        phone: profile.phone,
        college: profile.college,
        year: profile.year,
        avatar: profile.avatar,
        role: profile.role,
      });
      const stored = JSON.parse(localStorage.getItem('lifeos_user') || '{}');
      const updated = { ...stored, name: profile.name, avatar: profile.avatar, role: profile.role };
      localStorage.setItem('lifeos_user', JSON.stringify(updated));
      setMsg('Profile saved!');
      if (onProfileUpdate) onProfileUpdate(updated);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(''); setPwError('');
    if (!passwords.current) { setPwError('Current password is required.'); return; }
    if (passwords.new !== passwords.confirm) { setPwError('New passwords do not match.'); return; }
    if (passwords.new.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    if (passwords.new === passwords.current) { setPwError('New password must be different from the current one.'); return; }
    setPwLoading(true);
    try {
      await changePassword({ currentPassword: passwords.current, newPassword: passwords.new });
      setPwMsg('Password changed successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password.');
    } finally { setPwLoading(false); }
  };

  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Image must be under 2MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setProfile(p => ({ ...p, avatar: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = () => {
    setProfile(p => ({ ...p, avatar: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-foreground placeholder-text-muted outline-none focus:border-brand-primary transition-colors text-sm";
  const labelCls = "block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="w-full max-w-lg rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            style={{ background: 'rgba(10, 10, 20, 0.98)' }}
          >
            {/* ── Banner + Avatar ── */}
            <div className="relative">
              {/* Gradient banner */}
              <div className="h-28 bg-gradient-to-br from-indigo-600/60 via-purple-600/40 to-brand-secondary/30" />

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/30 text-white/70 hover:text-white hover:bg-black/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Avatar bubble — sits half over the banner */}
              <div className="absolute left-6 -bottom-10 flex items-end gap-3">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl border-4 border-[rgba(10,10,20,0.98)] overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl">
                    {profile.avatar
                      ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                      : <User className="w-9 h-9 text-white" />}
                  </div>

                  {/* Upload overlay */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    title="Upload photo"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                </div>

                {/* Delete image button — only shows when avatar exists */}
                {profile.avatar && (
                  <button
                    onClick={handleDeleteImage}
                    title="Remove photo"
                    className="mb-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/30 text-rose-400 text-xs font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* ── User info row ── */}
            <div className="pt-14 px-6 pb-3 flex items-end justify-between">
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">{profile.name || 'Your Name'}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{profile.email}</p>
              </div>
              <span className="text-xs bg-brand-primary/20 text-brand-primary border border-brand-primary/30 px-3 py-1 rounded-full font-medium">
                {profile.role || 'Student'}
              </span>
            </div>

            {/* ── Tabs ── */}
            <div className="px-6 pb-0 flex gap-1 border-b border-white/10">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${
                    activeTab === tab
                      ? 'text-brand-primary border-brand-primary'
                      : 'text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ── Content ── */}
            <div className="px-6 py-5 max-h-[380px] overflow-y-auto scrollbar-hide">
              {activeTab === 'Profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="text" value={profile.name}
                          onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                          className={inputCls + ' pl-9'} placeholder="Your Name" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Role</label>
                      <input type="text" value={profile.role}
                        onChange={e => setProfile(p => ({ ...p, role: e.target.value }))}
                        className={inputCls} placeholder="e.g. Student, Engineer" />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Bio</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <textarea value={profile.bio}
                        onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                        className={inputCls + ' pl-9 resize-none'} rows={2}
                        placeholder="Tell us about yourself..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="text" value={profile.phone}
                          onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                          className={inputCls + ' pl-9'} placeholder="+91 99999 99999" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Year of Study</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <select value={profile.year}
                          onChange={e => setProfile(p => ({ ...p, year: e.target.value }))}
                          className={inputCls + ' pl-9'}>
                          <option value="" className="bg-gray-900">Select year</option>
                          {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'PhD'].map(y => (
                            <option key={y} value={y} className="bg-gray-900">{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>College / University</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="text" value={profile.college}
                        onChange={e => setProfile(p => ({ ...p, college: e.target.value }))}
                        className={inputCls + ' pl-9'} placeholder="Your University Name" />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Avatar URL</label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="text" value={profile.avatar}
                        onChange={e => setProfile(p => ({ ...p, avatar: e.target.value }))}
                        className={inputCls + ' pl-9'} placeholder="https://..." />
                    </div>
                  </div>

                  {msg && <p className="text-emerald-400 text-sm text-center bg-emerald-500/10 py-2 rounded-lg border border-emerald-500/20">{msg}</p>}
                  {error && <p className="text-rose-400 text-sm text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">{error}</p>}

                  <button type="submit" disabled={loading}
                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-brand-primary/20">
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>
                </form>
              )}

              {activeTab === 'Security' && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <p className="text-sm text-gray-400 bg-white/5 rounded-xl p-4 border border-white/10">
                    🔒 Update your password. You'll need your current password to confirm the change.
                  </p>

                  {[
                    { key: 'current', label: 'Current Password' },
                    { key: 'new', label: 'New Password' },
                    { key: 'confirm', label: 'Confirm New Password' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type={showPw[key] ? 'text' : 'password'}
                          value={passwords[key]}
                          onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                          className={inputCls + ' pl-9 pr-10'}
                          placeholder="••••••••"
                        />
                        {key !== 'confirm' && (
                          <button type="button"
                            onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-foreground transition-colors">
                            {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {pwMsg && <p className="text-emerald-400 text-sm text-center bg-emerald-500/10 py-2 rounded-lg border border-emerald-500/20">{pwMsg}</p>}
                  {pwError && <p className="text-rose-400 text-sm text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">{pwError}</p>}

                  <button type="submit" disabled={pwLoading}
                    className="w-full bg-rose-500 hover:bg-rose-400 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                    <Lock className="w-4 h-4" />
                    {pwLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
