import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { forgotPassword } from '../api';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState('');
  const [notFound, setNotFound] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setMsg('');
    setError('');
    setDevToken('');
    setNotFound(false);

    try {
      const res = await forgotPassword({ email });
      // Check if backend explicitly says no account found
      if (res.data.notFound) {
        setNotFound(true);
      } else {
        setMsg(res.data.message);
        if (res.data.devToken) setDevToken(res.data.devToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md relative">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-primary/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-secondary/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 rounded-2xl border border-white/10 shadow-2xl p-8" style={{ background: 'rgba(10,10,20,0.97)' }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-primary/30">
              <Mail className="w-8 h-8 text-brand-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
            <p className="text-gray-400 text-sm">Enter your email and we'll send you a reset link.</p>
          </div>

          {/* No account found state */}
          {notFound ? (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-300 font-semibold text-sm mb-1">No account found</p>
                  <p className="text-amber-400/80 text-xs leading-relaxed">
                    We couldn't find an account with <span className="font-medium text-amber-300">{email}</span>.
                    Please create an account first.
                  </p>
                </div>
              </div>
              <Link
                to="/register"
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Create an Account
              </Link>
              <button
                onClick={() => { setNotFound(false); setEmail(''); }}
                className="w-full text-gray-400 hover:text-white text-sm py-2 transition-colors"
              >
                Try a different email
              </button>
            </div>
          ) : msg ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm text-center">
                ✅ {msg}
              </div>
              {devToken && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm">
                  <p className="text-amber-400 font-medium mb-2">🛠 Dev Mode — Use this link to reset:</p>
                  <Link
                    to={`/reset-password/${devToken}`}
                    className="text-brand-primary underline break-all text-xs"
                  >
                    /reset-password/{devToken}
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-sm text-center flex items-center gap-2 justify-center">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-9 text-white placeholder-gray-500 outline-none focus:border-brand-primary transition-colors"
                    placeholder="you@gmail.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link to="/login" className="text-brand-primary hover:text-brand-secondary transition-colors flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
