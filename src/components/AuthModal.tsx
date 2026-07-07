import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal = ({ onClose, onSuccess }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (signUpError) throw signUpError;

        if (data.user) {
          // Upsert profile — safe to call even if row already exists
          await supabase.from('profiles').upsert({ id: data.user.id, name }, { onConflict: 'id' });
        }
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all";
  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' };

  const modal = (
    <>
      {/* Backdrop — rendered via portal, sits above everything */}
      <div
        className="fixed inset-0"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Modal card */}
      <div
        className="fixed top-1/2 left-1/2 w-full max-w-sm px-4"
        style={{ transform: 'translate(-50%, -50%)', zIndex: 9999 }}
      >
        <div
          className="rounded-3xl p-8 shadow-2xl w-full"
          style={{
            background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 0 100px rgba(124,58,237,0.2), 0 25px 60px rgba(0,0,0,0.8)',
          }}
        >
          {/* IES Logo mark */}
          <div className="flex justify-center mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #db2777)',
                boxShadow: '0 0 30px rgba(124,58,237,0.5)',
              }}
            >
              <span className="text-white text-sm font-black">IES</span>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2
                className="text-2xl font-black text-white leading-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {isLogin ? 'Welcome back' : 'Join the scene'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isLogin ? 'Sign in to RSVP & connect' : 'Create an account to get started'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-3 transition-all hover:bg-white/10 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name — signup only */}
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClass}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputClass}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>

            {error && (
              <div
                className="rounded-xl px-4 py-3 text-xs font-medium text-red-300 text-center"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 mt-1 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                color: '#fff',
                boxShadow: '0 0 24px rgba(124,58,237,0.45)',
              }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-xs text-gray-600">or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Toggle */}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="w-full text-center text-xs text-gray-500 hover:text-purple-400 transition-colors py-1"
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span className="text-purple-400 font-semibold">{isLogin ? 'Sign up' : 'Sign in'}</span>
          </button>
        </div>
      </div>
    </>
  );

  // Portal renders completely outside header's DOM — fixes stacking context issue
  return createPortal(modal, document.body);
};

export default AuthModal;
