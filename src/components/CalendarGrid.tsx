import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AppEvent } from '../types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

interface CalendarGridProps {
  events: AppEvent[];
}

const CalendarGrid = ({ events }: CalendarGridProps) => {
  const navigate = useNavigate();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Build a map of date string → events
  const eventsByDate = useMemo(() => {
    const map: Record<string, AppEvent[]> = {};
    events.forEach(evt => {
      const d = new Date(evt.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(evt);
    });
    return map;
  }, [events]);

  // Get calendar grid cells
  const calendarCells = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // Monday = 0
    const totalDays = lastDay.getDate();

    const cells: Array<{ date: number | null; key: string; dateKey: string }> = [];

    // Leading empty cells
    for (let i = 0; i < startDow; i++) {
      cells.push({ date: null, key: `empty-before-${i}`, dateKey: '' });
    }

    // Day cells
    for (let d = 1; d <= totalDays; d++) {
      const dateKey = `${currentYear}-${currentMonth}-${d}`;
      cells.push({ date: d, key: dateKey, dateKey });
    }

    // Trailing empty cells to fill last row
    const remainder = cells.length % 7;
    if (remainder > 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        cells.push({ date: null, key: `empty-after-${i}`, dateKey: '' });
      }
    }

    return cells;
  }, [currentMonth, currentYear]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(null);
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long' });
  const isToday = (d: number) =>
    d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  const isPast = (d: number) => new Date(currentYear, currentMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  return (
    <div className="space-y-6">
      {/* Month Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {monthName}
            <span className="text-gray-600 ml-2 font-semibold text-2xl">{currentYear}</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all genre-tag"
            style={{
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.3)',
              color: '#7c3aed',
            }}
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Day names header */}
        <div className="grid grid-cols-7">
          {DAYS.map(day => (
            <div
              key={day}
              className="py-3 text-center text-xs font-bold tracking-widest uppercase"
              style={{
                color: 'rgba(255,255,255,0.25)',
                fontFamily: "'Space Grotesk', sans-serif",
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {calendarCells.map(cell => {
            const dayEvents = cell.dateKey ? (eventsByDate[cell.dateKey] || []) : [];
            const hasEvents = dayEvents.length > 0;
            const isSelected = cell.dateKey === selectedDate;
            const isHovered = cell.dateKey === hoveredDate;
            const todayCell = cell.date !== null && isToday(cell.date);
            const pastCell = cell.date !== null && isPast(cell.date);

            return (
              <div
                key={cell.key}
                className={`relative transition-all duration-200 ${cell.date !== null ? 'cursor-pointer' : ''}`}
                style={{
                  minHeight: '90px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  borderRight: '1px solid rgba(255,255,255,0.04)',
                  background: isSelected
                    ? 'rgba(124,58,237,0.08)'
                    : isHovered && hasEvents
                    ? 'rgba(255,255,255,0.04)'
                    : 'transparent',
                }}
                onClick={() => {
                  if (cell.dateKey && hasEvents) {
                    setSelectedDate(isSelected ? null : cell.dateKey);
                  }
                }}
                onMouseEnter={() => cell.dateKey && setHoveredDate(cell.dateKey)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                {cell.date !== null && (
                  <div className="p-2 h-full flex flex-col">
                    {/* Date number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                          todayCell ? 'text-white' : pastCell ? 'text-gray-700' : 'text-gray-400'
                        }`}
                        style={
                          todayCell
                            ? {
                                background: 'linear-gradient(135deg, #7c3aed, #db2777)',
                                boxShadow: '0 0 12px rgba(124,58,237,0.5)',
                              }
                            : isSelected
                            ? { background: 'rgba(124,58,237,0.2)' }
                            : {}
                        }
                      >
                        {cell.date}
                      </span>
                      {hasEvents && (
                        <span
                          className="text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                          style={{
                            background: 'rgba(124,58,237,0.15)',
                            color: '#a78bfa',
                          }}
                        >
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Event dots / pills */}
                    <div className="flex-1 space-y-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map(evt => {
                        const color = getGenreColor(evt.genre);
                        return (
                          <button
                            key={evt.id}
                            onClick={e => {
                              e.stopPropagation();
                              navigate(`/event/${evt.id}`);
                            }}
                            className="w-full text-left px-2 py-1 rounded-md text-[10px] font-semibold truncate transition-all hover:scale-[1.02] block"
                            style={{
                              background: `${color}18`,
                              color: color,
                              borderLeft: `2px solid ${color}`,
                            }}
                            title={evt.title}
                          >
                            {evt.title.length > 18 ? evt.title.slice(0, 18) + '…' : evt.title}
                          </button>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <p className="text-[9px] text-gray-600 font-medium pl-2">
                          +{dayEvents.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded event list for selected date */}
      {selectedDate && selectedEvents.length > 0 && (
        <div
          className="rounded-2xl p-5 space-y-3"
          style={{
            background: 'rgba(124,58,237,0.04)',
            border: '1px solid rgba(124,58,237,0.15)',
          }}
        >
          <p
            className="text-xs font-bold tracking-widest uppercase mb-3"
            style={{ color: '#7c3aed', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {selectedEvents.length} Event{selectedEvents.length > 1 ? 's' : ''} on{' '}
            {new Date(selectedEvents[0].date).toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>

          {selectedEvents.map(evt => {
            const color = getGenreColor(evt.genre);
            return (
              <button
                key={evt.id}
                onClick={() => navigate(`/event/${evt.id}`)}
                className="w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01] text-left group"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.border = `1px solid ${color}50`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${color}15`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {/* Time bubble */}
                <div
                  className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                  style={{ background: `${color}12`, border: `1px solid ${color}30` }}
                >
                  <span className="text-xs font-bold" style={{ color }}>
                    {new Date(evt.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Event info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                    {evt.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{evt.artist} · {evt.venue.split(',')[0]}</p>
                </div>

                {/* Genre badge */}
                <span
                  className="genre-tag px-2.5 py-1 rounded-full flex-shrink-0 hidden sm:inline-block"
                  style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
                >
                  {evt.genre}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CalendarGrid;
