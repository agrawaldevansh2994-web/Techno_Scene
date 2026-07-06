import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Search, X, LayoutGrid, List } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CalendarGrid from '../components/CalendarGrid';
import type { AppEvent } from '../types';

const GENRES = ['All', 'Techno', 'Hard Techno', 'Melodic Techno', 'Deep House', 'Afro House', 'House', 'Electronic', 'EDM / House', 'Psy Trance'];

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

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

const CalendarView = () => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: sbError } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true });
        if (sbError) throw sbError;
        setEvents(data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load events.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(e => {
    const matchesGenre = filter === 'All' || e.genre.toLowerCase().includes(filter.toLowerCase());
    const matchesSearch = search === '' ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.artist.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const now = new Date();
  const upcomingEvents = filteredEvents.filter(e => new Date(e.date) >= now);
  const pastEvents = filteredEvents.filter(e => new Date(e.date) < now);

  return (
    <div className="space-y-5">
      {/* Hero Section */}
      <div className="pt-2 pb-0">
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: '#7c3aed', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Mumbai · Electronic Music
        </p>
        <div className="flex flex-wrap items-baseline gap-x-3 mb-1">
          <h1
            className="text-4xl sm:text-5xl font-black tracking-tight leading-none"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Upcoming
          </h1>
          <span
            className="text-4xl sm:text-5xl font-black tracking-tight leading-none"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Events
          </span>
        </div>
        <p className="text-gray-500 text-sm max-w-lg mb-3">
          Curated techno, house & electronic events. No noise, just signal.
        </p>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${viewMode === 'list' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            style={viewMode === 'list' ? { background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 0 14px rgba(124,58,237,0.4)' } : {}}
          >
            <List className="w-3.5 h-3.5" />
            List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${viewMode === 'calendar' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            style={viewMode === 'calendar' ? { background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 0 14px rgba(124,58,237,0.4)' } : {}}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Calendar
          </button>
        </div>
      </div>

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && !loading && !error && (
        <CalendarGrid events={filteredEvents} />
      )}

      {/* LIST VIEW — search, filters, event cards */}
      {viewMode === 'list' && (
        <>
          {/* Search + Filter Row */}
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div
              className="relative flex items-center"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
              }}
            >
              <Search className="absolute left-4 w-4 h-4 text-gray-600" />
              <input
                type="text"
                placeholder="Search events, artists, venues..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-transparent pl-11 pr-10 py-3.5 text-sm text-gray-200 placeholder-gray-600 outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 text-gray-600 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Genre pills */}
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <button
                  key={g}
                  onClick={() => setFilter(g)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all genre-tag"
                  style={
                    filter === g
                      ? {
                          background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                          color: '#fff',
                          boxShadow: '0 0 16px rgba(124,58,237,0.4)',
                          border: '1px solid rgba(124,58,237,0.5)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.04)',
                          color: 'rgba(255,255,255,0.45)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }
                  }
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
              style={{ borderTopColor: '#7c3aed', borderRightColor: '#db2777' }}
            />
            <p className="text-gray-600 text-sm">Loading events...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="text-center py-24 rounded-2xl"
          style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <p className="text-red-400 font-semibold">Could not load events</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredEvents.length === 0 && (
        <div className="text-center py-32 text-gray-600">
          <p className="text-lg font-semibold">No events found</p>
          <p className="text-sm mt-1">Try a different genre or search term</p>
        </div>
      )}

      {/* Upcoming Events Grid — LIST VIEW ONLY */}
      {viewMode === 'list' && !loading && !error && upcomingEvents.length > 0 && (
        <section>
          <p
            className="text-xs font-bold tracking-widest uppercase text-gray-600 mb-5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {upcomingEvents.length} Upcoming
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event, i) => (
              <EventCard key={event.id} event={event} featured={i === 0 && filter === 'All' && search === ''} />
            ))}
          </div>
        </section>
      )}

      {/* Past Events — LIST VIEW ONLY */}
      {viewMode === 'list' && !loading && !error && pastEvents.length > 0 && (
        <section>
          <p
            className="text-xs font-bold tracking-widest uppercase text-gray-600 mb-5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Past Events
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50 hover:opacity-100 transition-opacity duration-500">
            {pastEvents.map(event => (
              <EventCard key={event.id} event={event} featured={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const EventCard = ({ event, featured }: { event: AppEvent; featured: boolean }) => {
  const color = getGenreColor(event.genre);

  return (
    <Link
      to={`/event/${event.id}`}
      className={`event-card group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ${
        featured ? 'sm:col-span-2 lg:col-span-2' : ''
      }`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.border = `1px solid ${color}40`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${color}15`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.06)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${featured ? 'h-56' : 'h-44'}`}>
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={e => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(3,3,3,0.95) 0%, rgba(3,3,3,0.3) 60%, transparent 100%)' }} />
        
        {/* Genre badge */}
        <div
          className="absolute top-3 left-3 genre-tag px-2.5 py-1 rounded-full"
          style={{ background: `${color}22`, color, border: `1px solid ${color}55`, backdropFilter: 'blur(8px)' }}
        >
          {event.genre}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-bold text-base leading-snug mb-1 text-white group-hover:text-purple-300 transition-colors line-clamp-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {event.title}
        </h3>
        <p className="text-gray-500 text-sm mb-4 truncate">{event.artist}</p>

        <div className="mt-auto flex items-center justify-between text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1.5 truncate ml-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{event.venue.split(',')[0]}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CalendarView;
