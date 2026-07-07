import { useState } from 'react';
import { X, User, Phone, Camera, Globe, Lock, Users } from 'lucide-react';
import type { Profile } from '../types';

interface GoingModalProps {
  eventTitle: string;
  profile?: Profile | null;
  onClose: () => void;
  onConfirm: (data: GoingData) => void;
  loading?: boolean;
}

export interface GoingData {
  name: string;
  whatsapp?: string;
  instagram?: string;
  visibility: 'name-only' | 'show-all' | 'selective';
}

const VISIBILITY_OPTIONS = [
  {
    id: 'name-only' as const,
    icon: User,
    label: 'Just my name',
    description: 'Only your name is visible to other attendees. Nothing else.',
    disabled: false,
  },
  {
    id: 'show-all' as const,
    icon: Globe,
    label: 'Open to connect',
    description: 'Your name + any contact you filled is visible to all other attendees of this event.',
    disabled: false,
  },
  {
    id: 'selective' as const,
    icon: Users,
    label: 'Choose who sees me',
    description: 'Coming soon — request-based sharing in a future update.',
    disabled: true,
  },
];

const GoingModal = ({ eventTitle, profile, onClose, onConfirm, loading = false }: GoingModalProps) => {
  const [name, setName] = useState(profile?.name || '');
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp || '');
  const [instagram, setInstagram] = useState(profile?.instagram || '');
  const [visibility, setVisibility] = useState<GoingData['visibility']>(
    (profile?.default_visibility as GoingData['visibility']) || 'name-only'
  );
  const [nameError, setNameError] = useState(false);

  const handleConfirm = () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    onConfirm({
      name: name.trim(),
      whatsapp: whatsapp.trim() || undefined,
      instagram: instagram.trim() || undefined,
      visibility,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed z-50 top-1/2 left-1/2 w-full max-w-md"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <div
          className="rounded-3xl p-6 shadow-2xl"
          style={{
            background: '#0f0f0f',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 0 80px rgba(124,58,237,0.2)',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div
                className="text-xs font-bold tracking-widest uppercase mb-1"
                style={{ color: '#7c3aed', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                You're going
              </div>
              <h2
                className="text-xl font-black text-white leading-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {eventTitle}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-3 transition-all hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Your Name <span style={{ color: '#7c3aed' }}>*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="How should others know you?"
                  value={name}
                  onChange={e => { setName(e.target.value); setNameError(false); }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: nameError ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                  onBlur={e => (e.target.style.borderColor = nameError ? '#ef4444' : 'rgba(255,255,255,0.08)')}
                />
              </div>
              {nameError && <p className="text-red-500 text-xs mt-1">Name is required</p>}
            </div>

            {/* WhatsApp */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  WhatsApp <span className="text-gray-600 normal-case font-normal tracking-normal">optional</span>
                </label>
                <span className="flex items-center gap-1 text-[10px] text-gray-600">
                  <Lock className="w-2.5 h-2.5" /> Not shown unless you choose
                </span>
              </div>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </div>
            </div>

            {/* Instagram */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Instagram <span className="text-gray-600 normal-case font-normal tracking-normal">optional</span>
                </label>
                <span className="flex items-center gap-1 text-[10px] text-gray-600">
                  <Lock className="w-2.5 h-2.5" /> Not shown unless you choose
                </span>
              </div>
              <div className="relative">
                <Camera className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="@yourhandle"
                  value={instagram}
                  onChange={e => setInstagram(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Who can see your info?
              </label>
              <div className="space-y-2">
                {VISIBILITY_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = visibility === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => !opt.disabled && setVisibility(opt.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                      style={{
                        background: isSelected && !opt.disabled ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.03)',
                        border: isSelected && !opt.disabled ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.06)',
                      }}
                      disabled={opt.disabled}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: isSelected && !opt.disabled ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)' }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: isSelected && !opt.disabled ? '#a78bfa' : 'rgba(255,255,255,0.3)' }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {opt.label}
                          {opt.disabled && <span className="ml-2 text-[10px] font-normal text-gray-600 uppercase tracking-wider">soon</span>}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{opt.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-70"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                color: '#fff',
                boxShadow: '0 0 20px rgba(124,58,237,0.4)',
              }}
            >
              {loading ? 'Saving...' : "I'm Going ✓"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GoingModal;
