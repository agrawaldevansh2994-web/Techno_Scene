import { useState } from 'react';
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
          options: {
            data: {
              name,
            },
          },
        });
        if (signUpError) throw signUpError;
        
        // If signup is successful and auto-login doesn't happen, we might need to wait for email confirm.
        // For now, assuming email confirmation is disabled or we auto-login.
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed z-50 top-1/2 left-1/2 w-full max-w-sm"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <div
          className="rounded-3xl p-8 shadow-2xl"
          style={{
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 0 100px rgba(124,58,237,0.15)',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2
                className="text-2xl font-black text-white leading-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {isLogin ? 'Welcome back' : 'Join the scene'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isLogin ? 'Sign in to connect' : 'Create an account to RSVP'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-3 transition-all hover:bg-white/10 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </div>
              </div>
            )}

            <div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-xs font-medium text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center mt-2 disabled:opacity-70"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                color: '#fff',
                boxShadow: '0 0 20px rgba(124,58,237,0.4)',
              }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;
