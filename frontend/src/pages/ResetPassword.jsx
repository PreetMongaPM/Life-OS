import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { resetPassword } from '../api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [show, setShow] = useState({ new: false, confirm: false });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (passwords.new !== passwords.confirm) { setError('Passwords do not match.'); return; }
    if (passwords.new.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await resetPassword(token, { newPassword: passwords.new });
      setMsg(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired link.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md relative">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-primary/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-secondary/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 rounded-2xl border border-white/10 shadow-2xl p-8" style={{ background: 'rgba(10,10,20,0.97)' }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-primary/30">
              <Lock className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Set New Password</h1>
            <p className="text-gray-400 text-sm">Choose a strong new password for your account.</p>
          </div>

          {msg ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{msg}</p>
                  <p className="text-xs mt-0.5 text-emerald-400/70">Redirecting to login...</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}
              {[
                { key: 'new', label: 'New Password' },
                { key: 'confirm', label: 'Confirm Password' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={show[key] ? 'text' : 'password'}
                      value={passwords[key]}
                      onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-9 pr-10 text-white placeholder-gray-500 outline-none focus:border-brand-primary transition-colors"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShow(s => ({ ...s, [key]: !s[key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                      {show[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="submit" disabled={loading}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Lock className="w-4 h-4" />
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-gray-500">
            <Link to="/login" className="text-brand-primary hover:text-brand-secondary transition-colors">
              ← Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
