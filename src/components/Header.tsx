import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AuthModal from './AuthModal';

const CITIES = ['Mumbai', 'Bangalore', 'Pune', 'Goa'];

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(3,3,3,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #db2777)',
              boxShadow: '0 0 20px rgba(124,58,237,0.5)',
            }}
          >
            <span className="text-white text-xs font-black">IES</span>
          </div>
          <div>
            <span
              className="font-black text-base tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              India Electronic
            </span>
            <span className="text-purple-400 font-black text-base tracking-tight"> Scene</span>
          </div>
        </Link>

        {/* City switcher — only show on home */}
        {isHome && (
          <div
            className="hidden md:flex items-center gap-1 p-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {CITIES.map((city, i) => (
              <button
                key={city}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  i === 0
                    ? 'text-white'
                    : 'text-gray-500 cursor-not-allowed'
                }`}
                style={
                  i === 0
                    ? {
                        background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                        boxShadow: '0 0 12px rgba(124,58,237,0.4)',
                      }
                    : {}
                }
                title={i !== 0 ? 'Coming soon' : undefined}
              >
                {city}
                {i !== 0 && (
                  <span className="ml-1 text-gray-600 text-[10px]">soon</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Auth / Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-purple-400" />
                </div>
                <span className="text-xs font-semibold text-white truncate max-w-[80px]">
                  {user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}
    </header>
  );
};

export default Header;
