import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, AlertCircle, User, Mail, Lock } from 'lucide-react';
import { registerUser } from '../api';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const passwordStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
};

const strengthLabel = (s) => (['', 'Weak', 'Fair', 'Good', 'Strong'])[s];
const strengthColor = (s) => (['', 'bg-rose-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-500'])[s];


export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    else if (formData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!formData.email.trim()) errs.email = 'Email address is required.';
    else if (!isValidEmail(formData.email)) errs.email = 'Enter a valid email address.';
    if (!formData.password) errs.password = 'Password is required.';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoading(true);
    try {
      const res = await registerUser(formData);
      localStorage.setItem('lifeos_token', res.data.token);
      localStorage.setItem('lifeos_user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const pwScore = passwordStrength(formData.password);
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
              Join <span className="text-gradient">LifeOS</span>
            </h1>
            <p className="text-gray-400 text-sm">Create your account and take control of your life.</p>
          </div>



          {error && (
            <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-sm text-center flex items-center gap-2 justify-center">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => { setFormData({ ...formData, name: e.target.value }); setFieldErrors(f => ({ ...f, name: '' })); }}
                  className={inputCls('name') + ' pl-9'}
                  placeholder="Preet Monga"
                />
              </div>
              {fieldErrors.name && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => { setFormData({ ...formData, email: e.target.value }); setFieldErrors(f => ({ ...f, email: '' })); }}
                  className={inputCls('email') + ' pl-9'}
                  placeholder="you@gmail.com"
                />
              </div>
              {fieldErrors.email && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => { setFormData({ ...formData, password: e.target.value }); setFieldErrors(f => ({ ...f, password: '' })); }}
                  className={inputCls('password') + ' pl-9 pr-10'}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.password}</p>}

              {/* Password strength meter */}
              {formData.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwScore ? strengthColor(pwScore) : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Strength: <span className={`font-medium ${['','text-rose-400','text-amber-400','text-yellow-400','text-emerald-400'][pwScore]}`}>{strengthLabel(pwScore)}</span>
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-primary hover:text-brand-secondary transition-colors font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
