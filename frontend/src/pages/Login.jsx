import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { loginUser } from '../api';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    // Client-side validation
    const errs = {};
    if (!formData.email.trim()) errs.email = 'Email address is required.';
    else if (!isValidEmail(formData.email)) errs.email = 'Enter a valid email address.';
    if (!formData.password) errs.password = 'Password is required.';
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setLoading(true);
    try {
      const res = await loginUser(formData);
      localStorage.setItem('lifeos_token', res.data.token);
      localStorage.setItem('lifeos_user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };



  const inputCls = (field) =>
    `w-full bg-white/5 border ${fieldErrors[field] ? 'border-rose-500/60' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-brand-primary transition-colors text-sm`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md relative">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-secondary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 rounded-2xl border border-white/10 shadow-2xl p-8" style={{ background: 'rgba(10,10,20,0.97)' }}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Welcome back to <span className="text-gradient">LifeOS</span>
            </h1>
            <p className="text-gray-400 text-sm">Sign in to your dashboard</p>
          </div>



          {error && (
            <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="email" value={formData.email}
                  onChange={e => { setFormData({ ...formData, email: e.target.value }); setFieldErrors(f => ({ ...f, email: '' })); }}
                  className={inputCls('email') + ' pl-9'} placeholder="you@gmail.com" />
              </div>
              {fieldErrors.email && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.email}</p>}
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-primary hover:text-brand-secondary transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPw ? 'text' : 'password'} value={formData.password}
                  onChange={e => { setFormData({ ...formData, password: e.target.value }); setFieldErrors(f => ({ ...f, password: '' })); }}
                  className={inputCls('password') + ' pl-9 pr-10'} placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.password}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              <LogIn className="w-4 h-4" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-primary hover:text-brand-secondary transition-colors font-medium">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
