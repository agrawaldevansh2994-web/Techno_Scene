import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock, ExternalLink, PlayCircle, Loader2, Check, User, Camera, Phone, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import GoingModal from '../components/GoingModal';
import AuthModal from '../components/AuthModal';
import type { GoingData } from '../components/GoingModal';
import type { AppEvent, EventAttendee } from '../types';

const GENRE_COLORS: Record<string, string> = {
  'Techno': '#ef4444',
  'Hard Techno': '#f97316',
  'Melodic Techno': '#8b5cf6',
  'Deep House': '#06b6d4',
  'Afro House': '#f59e0b',
  'House': '#10b981',
  'Electronic': '#6366f1',
  'EDM / House': '#ec4899',
  'Psy Trance': '#84cc16',
};

const getGenreColor = (genre: string) => {
  for (const key of Object.keys(GENRE_COLORS)) {
    if (genre.toLowerCase().includes(key.toLowerCase())) return GENRE_COLORS[key];
  }
  return '#7c3aed';
};

const EventDetailsView = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile, refreshProfile } = useAuth();

  const [event, setEvent] = useState<AppEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // RSVP state
  const [isGoing, setIsGoing] = useState(false);
  const [showGoingModal, setShowGoingModal] = useState(false);
  const [savingRsvp, setSavingRsvp] = useState(false);

  // Auth modal (shown when unauthenticated user clicks "I'm Going")
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Attendees
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  // ── Fetch event ──────────────────────────────────────────
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error: sbError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();
        if (sbError) throw sbError;
        setEvent(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load event.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // ── Fetch attendees ──────────────────────────────────────
  const fetchAttendees = useCallback(async () => {
    if (!id) return;
    setLoadingAttendees(true);
    try {
      const { data } = await supabase
        .from('event_attendees')
        .select('*, profiles(*)')
        .eq('event_id', id)
        .order('created_at', { ascending: true });
      setAttendees(data ?? []);
    } catch {
      // Silently fail — attendees section is non-critical
    } finally {
      setLoadingAttendees(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  // ── Check if the current user already RSVP'd ────────────
  useEffect(() => {
    if (!user || !id) {
      setIsGoing(false);
      return;
    }
    const checkRsvp = async () => {
      const { data } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      setIsGoing(!!data);
    };
    checkRsvp();
  }, [user, id]);

  // ── Handle "I'm Going" click ─────────────────────────────
  const handleGoingClick = () => {
    if (!user) {
      // Not logged in → show auth modal first
      setShowAuthModal(true);
      return;
    }
    if (isGoing) {
      // Already going → un-RSVP
      handleUnRsvp();
    } else {
      setShowGoingModal(true);
    }
  };

  // ── Submit RSVP ──────────────────────────────────────────
  const handleRsvpConfirm = async (data: GoingData) => {
    if (!user || !id) return;
    setSavingRsvp(true);

    try {
      // 1. Upsert profile (update name, contact, default_visibility)
      await supabase.from('profiles').upsert({
        id: user.id,
        name: data.name,
        instagram: data.instagram || null,
        whatsapp: data.whatsapp || null,
        reddit: data.reddit || null,
        default_visibility: data.visibility,
      }, { onConflict: 'id' });

      // 2. Insert attendee row
      await supabase.from('event_attendees').upsert({
        event_id: id,
        user_id: user.id,
        visibility: data.visibility,
      }, { onConflict: 'event_id,user_id' });

      // 3. Refresh local state
      setIsGoing(true);
      setShowGoingModal(false);
      await refreshProfile();
      await fetchAttendees();
    } catch (err) {
      console.error('RSVP failed:', err);
    } finally {
      setSavingRsvp(false);
    }
  };

  // ── Un-RSVP ──────────────────────────────────────────────
  const handleUnRsvp = async () => {
    if (!user || !id) return;
    await supabase
      .from('event_attendees')
      .delete()
      .eq('event_id', id)
      .eq('user_id', user.id);
    setIsGoing(false);
    await fetchAttendees();
  };

  // ── Render ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#7c3aed' }} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-40">
        <p className="text-red-400 font-semibold text-lg">Event not found</p>
        <Link to="/" className="mt-4 inline-block text-purple-400 hover:underline text-sm">← Back to Calendar</Link>
      </div>
    );
  }

  const color = getGenreColor(event.genre);
  const eventDate = new Date(event.date);

  return (
    <div>
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Calendar
      </Link>

      {/* Hero Banner */}
      <div
        className="relative w-full overflow-hidden mb-10"
        style={{ borderRadius: '24px', height: 'clamp(280px, 45vw, 480px)' }}
      >
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={e => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        {/* Multi-layer gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #030303 0%, rgba(3,3,3,0.6) 50%, rgba(3,3,3,0.15) 100%)' }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at bottom left, ${color}30 0%, transparent 60%)` }} />
        
        {/* Badge + Title */}
        <div className="absolute bottom-0 left-0 p-8 w-full">
          <div
            className="inline-flex items-center gap-1.5 genre-tag px-3 py-1.5 rounded-full mb-4"
            style={{ background: `${color}22`, color, border: `1px solid ${color}55`, backdropFilter: 'blur(8px)' }}
          >
            {event.genre}
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-none text-white mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif", textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
          >
            {event.title}
          </h1>
          <p className="text-gray-300 text-lg font-medium">{event.artist}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Description + Set Archive + Attendees */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2
              className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{ color: color, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              About
            </h2>
            <p className="text-gray-400 leading-relaxed text-base">{event.description}</p>
          </section>

          {/* Set Archive */}
          {event.youtube_id && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <PlayCircle className="w-4 h-4" style={{ color }} />
                <h2
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Set Archive
                </h2>
              </div>
              <div
                className="aspect-video w-full rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#0a0a0a' }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${event.youtube_id}`}
                  title="Past set"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          )}

          {/* ═══════════ WHO'S GOING SECTION ═══════════ */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <User className="w-4 h-4" style={{ color }} />
              <h2
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Who's Going
              </h2>
              {attendees.length > 0 && (
                <span
                  className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${color}20`, color }}
                >
                  {attendees.length}
                </span>
              )}
            </div>

            {loadingAttendees ? (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </div>
            ) : attendees.length === 0 ? (
              <div
                className="rounded-2xl p-6 text-center"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-gray-500 text-sm">No one has RSVP'd yet. Be the first!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attendees.map((att) => {
                  const p = att.profiles;
                  if (!p) return null;

                  return (
                    <div
                      key={att.id}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      {/* Avatar */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}15` }}
                      >
                        <User className="w-4 h-4" style={{ color }} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                        {att.visibility === 'show-all' && (p.instagram || p.whatsapp || p.reddit) && (
                          <div className="flex items-center gap-2 mt-1">
                            {p.instagram && (
                              <a
                                href={`https://instagram.com/${p.instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-pink-400 transition-colors"
                                title={`@${p.instagram.replace('@', '')}`}
                              >
                                <Camera className="w-3 h-3" />
                                <span className="truncate max-w-[80px]">{p.instagram.replace('@', '')}</span>
                              </a>
                            )}
                            {p.whatsapp && (
                              <a
                                href={`https://wa.me/${p.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-green-400 transition-colors"
                                title={p.whatsapp}
                              >
                                <Phone className="w-3 h-3" />
                                <span className="truncate max-w-[100px]">{p.whatsapp}</span>
                              </a>
                            )}
                            {p.reddit && (
                              <a
                                href={`https://reddit.com/${p.reddit.startsWith('u/') ? p.reddit : `u/${p.reddit}`}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-orange-400 transition-colors"
                                title={p.reddit}
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span className="truncate max-w-[100px]">{p.reddit.replace('u/', '')}</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          {/* Event details card */}
          <div
            className="rounded-2xl p-6 space-y-5"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <h3
              className="text-xs font-bold tracking-widest uppercase text-gray-600"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Details
            </h3>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                <Calendar className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  {eventDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                <Clock className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  {eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} onwards
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                <MapPin className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{event.venue}</p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <button
            onClick={handleGoingClick}
            className="btn-going w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all"
            style={
              isGoing
                ? {
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.4)',
                    color: '#10b981',
                  }
                : {
                    background: '#fff',
                    border: '1px solid #fff',
                    color: '#000',
                  }
            }
          >
            {isGoing ? (
              <>
                <Check className="w-5 h-5" /> You're Going
              </>
            ) : (
              "I'm Going"
            )}
          </button>

          {event.ticket_link && (
            <a
              href={event.ticket_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                textDecoration: 'none',
              }}
            >
              Get Tickets <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <p className="text-center text-xs text-gray-700">Tickets sold externally on District / BookMyShow</p>
        </div>
      </div>

      {/* Going Modal */}
      {showGoingModal && event && (
        <GoingModal
          eventTitle={event.title}
          profile={profile}
          loading={savingRsvp}
          onClose={() => setShowGoingModal(false)}
          onConfirm={handleRsvpConfirm}
        />
      )}

      {/* Auth Modal (when unauthenticated user tries to RSVP) */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            // After login, open the going modal
            setShowGoingModal(true);
          }}
        />
      )}
    </div>
  );
};

export default EventDetailsView;
