import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock, ExternalLink, PlayCircle, Loader2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import GoingModal, { type GoingData } from '../components/GoingModal';
import type { AppEvent } from '../types';

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
  const [event, setEvent] = useState<AppEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGoing, setIsGoing] = useState(false);
  const [showGoingModal, setShowGoingModal] = useState(false);
  const [attendeeData, setAttendeeData] = useState<GoingData | null>(null);

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
        
        {/* Left: Description + Set Archive */}
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
            onClick={() => {
              if (isGoing) {
                setIsGoing(false);
                setAttendeeData(null);
              } else {
                setShowGoingModal(true);
              }
            }}
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

      {showGoingModal && event && (
        <GoingModal
          eventTitle={event.title}
          onClose={() => setShowGoingModal(false)}
          onConfirm={(data) => {
            setAttendeeData(data);
            setIsGoing(true);
            setShowGoingModal(false);
            console.log("Attendee Data Saved locally:", data);
          }}
        />
      )}
    </div>
  );
};

export default EventDetailsView;
