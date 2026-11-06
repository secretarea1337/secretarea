import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Heart, 
  Search, 
  Grid, 
  Columns3, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  HardDrive, 
  Check, 
  Flame,
  ArrowRight,
  Copy,
  Sparkles,
  Calendar,
  Clock,
  Gamepad2,
  Monitor,
  AlertCircle,
  Zap,
  Maximize2
} from 'lucide-react';
import { useLanguage } from '../src/contexts/LanguageContext';
import type { ResourceItem } from '../pages/SecretArea';

// ==========================================
// GTA 6 SYNTH SOUND ENGINE (Web Audio API)
// Active in background for authentic audio feedback
// ==========================================
class GTASoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isMuted = localStorage.getItem('gta6_sound_muted') === 'true';
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Vice City neon blip / click sound
  public playBlip(freq = 587.33, duration = 0.08) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Safe fallback
    }
  }

  // Favorite / chime sound
  public playChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [880, 1174.66].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.06);
        gain.gain.setValueAtTime(0.07, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.18);
      });
    } catch {
      // Safe fallback
    }
  }
}

const gtaAudio = new GTASoundEngine();

// ==========================================
// GTA 6 LOGO COMPONENT
// Using requested animated GIF with fallback
// ==========================================
export const GTA6Logo: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ size = 'md', className = '' }) => {
  const heightClasses = {
    sm: 'h-10 sm:h-12',
    md: 'h-14 sm:h-20',
    lg: 'h-20 sm:h-28'
  }[size];

  const [srcIndex, setSrcIndex] = useState(0);
  const logoSources = [
    "https://www.gifservice.fr/img/gif-vignette-large/4c8eb435de95b07cab32d1473a34a7ac/578552-gta-6-logo-grand-theft-auto-g-video-games-multi-media.gif",
    "https://logos-world.net/wp-content/uploads/2024/10/Gta-6-Logo.png"
  ];

  if (srcIndex >= logoSources.length) {
    return (
      <div className={`relative inline-flex items-center font-black italic select-none ${className}`}>
        <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-pink-500 via-rose-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(236,72,153,0.5)]">
          GTA VI
        </span>
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center select-none shrink-0 ${className}`}>
      <img
        src={logoSources[srcIndex]}
        alt="GTA 6 Animated Logo"
        referrerPolicy="no-referrer"
        className={`${heightClasses} w-auto object-contain drop-shadow-[0_4px_18px_rgba(236,72,153,0.6)] hover:scale-105 transition-transform duration-300`}
        onError={() => setSrcIndex(prev => prev + 1)}
      />
    </div>
  );
};

// ==========================================
// GTA 6 COUNTDOWN & CREW SHOWCASE COMPONENT
// Interactive animated live ticker and squad artwork
// ==========================================
export const GTA6CountdownAndCrewShowcase: React.FC = () => {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    // Release Date: November 19, 2026 (00:00:00 UTC)
    const targetDate = new Date('2026-11-19T00:00:00Z').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="mb-7 rounded-2xl p-4 sm:p-6 bg-slate-900/80 dark:bg-slate-950/85 backdrop-blur-md border border-pink-500/35 dark:border-pink-500/40 shadow-xl shadow-pink-500/10 text-white relative overflow-hidden">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 via-cyan-400 to-amber-400" />
        <div className="absolute -top-16 -end-16 w-52 h-52 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -start-16 w-52 h-52 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          
          {/* USER IMAGE SHOWCASE: public/images/gta6.png */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 dark:bg-slate-900/60 p-3.5 sm:p-4 rounded-xl border border-pink-500/30">
            <div 
              className="relative w-full sm:w-44 aspect-[4/3] rounded-lg overflow-hidden shrink-0 group cursor-pointer border border-pink-500/40 shadow-md shadow-pink-500/20"
              onClick={() => {
                gtaAudio.playBlip(750, 0.08);
                setShowLightbox(true);
              }}
              title="Click to view full crew artwork"
            >
              <img
                src="/images/gta6.png"
                alt="GTA 6 Crew Artwork"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = 'public/images/gta6.png';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-300 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded backdrop-blur-xs">
                  <Maximize2 size={11} /> {t('View Details')}
                </span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-start min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[10px] font-black uppercase tracking-wider mb-1.5">
                <Zap size={11} className="text-amber-400" />
                <span>{t('Special Squad Edition')}</span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-white uppercase tracking-tight truncate">
                {t('Vice City Crew')}
              </h4>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                Official tribute squad artwork featuring Jason, Lucia & the Royal Leonida syndicate.
              </p>
              <button
                type="button"
                onClick={() => {
                  gtaAudio.playBlip(750, 0.08);
                  setShowLightbox(true);
                }}
                className="mt-2 text-xs font-bold text-pink-400 hover:text-pink-300 inline-flex items-center gap-1 transition-colors"
              >
                <span>Full Artwork (HD)</span>
                <ArrowRight size={13} className="rtl:rotate-180" />
              </button>
            </div>
          </div>

          {/* COUNTDOWN & PLATFORM INTEL */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
            
            {/* Header row with Target Date */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-pink-400 animate-pulse" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">
                  {t('Release Countdown')} · {t('PS5 / Xbox Series X|S')}
                </span>
              </div>
              <span className="text-xs font-black text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                {t('November 19, 2026')}
              </span>
            </div>

            {/* Live Ticking Digits Grid */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {[
                { val: timeLeft.days, label: t('Days') },
                { val: timeLeft.hours, label: t('Hours') },
                { val: timeLeft.minutes, label: t('Minutes') },
                { val: timeLeft.seconds, label: t('Seconds') }
              ].map((slot, idx) => (
                <div
                  key={`countdown-digit-${idx}`}
                  className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl bg-slate-950/75 border border-pink-500/35 shadow-inner text-center group hover:border-pink-500/60 transition-colors"
                >
                  <span className="text-xl sm:text-3xl font-black font-mono tracking-tight bg-gradient-to-b from-white via-pink-100 to-pink-400 bg-clip-text text-transparent">
                    {slot.val < 10 ? `0${slot.val}` : slot.val}
                  </span>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-slate-400 group-hover:text-pink-300 mt-0.5">
                    {slot.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Platform Intel Badges Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-white/10">
              
              {/* Pre-Load Milestone */}
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/50 border border-cyan-500/30">
                <div className="w-7 h-7 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Calendar size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    {t('Pre-Load Start Date')}
                  </div>
                  <div className="text-xs font-black text-cyan-300 truncate">
                    {t('November 10, 2026')}
                  </div>
                </div>
              </div>

              {/* PC Official Status */}
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/50 border border-amber-500/30">
                <div className="w-7 h-7 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Monitor size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    {t('PC Official Date')}
                  </div>
                  <div className="text-xs font-black text-amber-300 truncate" title={t('Not officially confirmed by Rockstar Games yet')}>
                    {t('Not officially confirmed by Rockstar Games yet')}
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* LIGHTBOX MODAL FOR CREW ARTWORK */}
      {createPortal(
        <AnimatePresence>
          {showLightbox && (
            <motion.div
              key="gta6-crew-artwork-lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLightbox(false)}
              className="fixed inset-0 z-[10001] bg-black/90 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="relative max-w-5xl max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden border border-pink-500/40 shadow-2xl flex flex-col"
              >
                <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-slate-900">
                  <div className="flex items-center gap-2">
                    <GTA6Logo size="sm" />
                    <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                      {t('Vice City Crew')} · {t('Special Squad Edition')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLightbox(false)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-pink-600 text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-2 sm:p-4 overflow-auto flex items-center justify-center bg-black">
                  <img
                    src="/images/gta6.png"
                    alt="GTA 6 Crew Artwork Full Resolution"
                    className="max-h-[75vh] w-auto object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'public/images/gta6.png';
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

// ==========================================
// HELPER TO PARSE SIZES & CALCULATE SAVINGS
// ==========================================
const parseSizeInGB = (sizeStr?: string): number => {
  if (!sizeStr) return 0;
  const match = sizeStr.match(/([\d.]+)\s*(gb|mb|tb)?/i);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  const unit = (match[2] || 'gb').toLowerCase();
  if (unit === 'mb') return val / 1024;
  if (unit === 'tb') return val * 1024;
  return val;
};

const calculateSavings = (origStr?: string, repackStr?: string): number | null => {
  const orig = parseSizeInGB(origStr);
  const repack = parseSizeInGB(repackStr);
  if (orig > 0 && repack > 0 && orig > repack) {
    return Math.round(((orig - repack) / orig) * 100);
  }
  return null;
};

// ==========================================
// SAFE PAGINATION HELPER (Prevents Duplicate Keys)
// ==========================================
const getPageNumbers = (current: number, total: number, maxVisible = 5): number[] => {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  if (start + maxVisible - 1 > total) {
    start = Math.max(1, total - maxVisible + 1);
  }
  return Array.from({ length: maxVisible }, (_, i) => start + i);
};

// ==========================================
// QUICK PEEK MODAL COMPONENT (GTA 6 STYLE)
// ==========================================
interface QuickPeekModalProps {
  game: ResourceItem | null;
  onClose: () => void;
  onSelect: (game: ResourceItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const QuickPeekModal: React.FC<QuickPeekModalProps> = ({
  game,
  onClose,
  onSelect,
  isFavorite,
  onToggleFavorite
}) => {
  const { t, dir } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const images = useMemo(() => {
    if (!game) return ['https://placehold.co/800x450/0f172a/ec4899?text=VICE+CITY'];
    const list: string[] = [];
    if (game.coverImage) list.push(game.coverImage);
    if (game.image && !list.includes(game.image)) list.push(game.image);
    if (game.galleryImages && Array.isArray(game.galleryImages)) {
      game.galleryImages.forEach(img => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length ? list : ['https://placehold.co/800x450/0f172a/ec4899?text=VICE+CITY'];
  }, [game]);

  const savings = game ? calculateSavings(game.originalSize, game.repackSize) : null;
  const downloadLink = game ? (game.links?.full || game.links?.parts?.[0]?.link || game.links?.utorrent || game.links?.googleDrive || '') : '';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloadLink) {
      navigator.clipboard.writeText(downloadLink);
      setCopied(true);
      gtaAudio.playBlip(750, 0.12);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return createPortal(
    <AnimatePresence mode="wait">
      {game && (
        <motion.div 
          key={`quick-peek-overlay-${game.id || 'game'}`}
          dir={dir}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            key={`quick-peek-card-${game.id || 'game'}`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-pink-500/30 dark:border-pink-500/40 shadow-2xl shadow-pink-500/10 dark:shadow-[0_0_50px_rgba(236,72,153,0.15)] flex flex-col"
          >
            {/* Vice City Banner Accent Header */}
            <div className="relative h-2 bg-gradient-to-r from-pink-500 via-purple-600 via-cyan-400 to-amber-400 shrink-0" />

            {/* Top Bar */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <GTA6Logo size="sm" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-pink-600 dark:text-pink-400">
                    {t('Quick Peek')}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                    {game.name}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    gtaAudio.playChime();
                    onToggleFavorite(game.id);
                  }}
                  className={`p-2 rounded-xl border transition-colors ${
                    isFavorite 
                      ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/30' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-pink-500'
                  }`}
                  title={t('Favorites')}
                >
                  <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    gtaAudio.playBlip(440, 0.06);
                    onClose();
                  }}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title={t('Close Preview')}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Media Showcase */}
            <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
              <img
                src={images[activeImageIdx]}
                alt={game.name}
                className="w-full h-full object-cover transition-all duration-300"
                onError={e => {
                  e.currentTarget.src = 'https://placehold.co/800x450/0f172a/ec4899?text=ENCRYPTED';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />

              {/* Repacker badge */}
              <div className="absolute top-3 start-3 flex items-center gap-2">
                {game.repackBy && (
                  <span className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-pink-600 text-white shadow-lg shadow-pink-600/30 border border-pink-400/40">
                    {game.repackBy}
                  </span>
                )}
                {game.category === 'hypervisor' && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-purple-600 text-white shadow-lg border border-purple-400/40">
                    HV DENUVO
                  </span>
                )}
              </div>

              {/* Savings Callout */}
              {savings !== null && (
                <div className="absolute top-3 end-3 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                  ⚡ -{savings}% {t('Savings')}
                </div>
              )}

              {/* Image Gallery Thumbnails */}
              {images.length > 1 && (
                <div className="absolute bottom-3 start-3 end-3 flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {images.map((img, idx) => (
                    <button
                      key={`peek-thumb-${idx}`}
                      type="button"
                      onClick={() => {
                        setActiveImageIdx(idx);
                        gtaAudio.playBlip(600, 0.05);
                      }}
                      className={`relative w-16 h-10 rounded-md overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIdx === idx ? 'border-pink-500 scale-105 shadow-md' : 'border-white/40 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details & Specs */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Size Breakdown Bar */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                    <HardDrive size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {t('Repack Size')} vs {t('Original')}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {game.repackSize || 'N/A'}
                      </span>
                      {game.originalSize && (
                        <span className="text-xs text-slate-400 line-through">
                          {game.originalSize}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {game.genres && (
                  <div className="text-xs text-slate-600 dark:text-slate-300 max-w-xs font-medium">
                    <span className="text-pink-500 font-bold">{t('Genre')}:</span> {game.genres}
                  </div>
                )}
              </div>

              {/* Description */}
              {game.description && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {game.description}
                </p>
              )}

              {/* Actions Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    gtaAudio.playBlip(800, 0.1);
                    onClose();
                    onSelect(game);
                  }}
                  className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:via-rose-500 hover:to-amber-400 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <span>{t('View Details')}</span>
                  <ArrowRight size={18} className="rtl:rotate-180" />
                </button>

                {downloadLink && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-colors shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="text-emerald-500" />
                        <span className="text-emerald-500">{t('Link Copied!')}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>{t('Copy Magnet / Link')}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// ==========================================
// GTA 6 CARD COMPONENT
// Zero Image Zoom Effect & Zero Game Title text overlay
// Cover art remains 100% visible and unblocked
// ==========================================
interface GTARepackCardProps {
  game: ResourceItem;
  rank: number;
  onSelect: (game: ResourceItem) => void;
  onQuickPeek: (game: ResourceItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const GTARepackCard: React.FC<GTARepackCardProps> = ({
  game,
  rank,
  onSelect,
  onQuickPeek,
  isFavorite,
  onToggleFavorite
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const isHypervisor = game.category?.toLowerCase() === 'hypervisor';
  const savings = calculateSavings(game.originalSize, game.repackSize);

  const formattedRank = rank < 10 ? `0${rank}` : `${rank}`;
  const downloadLink = game.links?.full || game.links?.parts?.[0]?.link || game.links?.utorrent || '';

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloadLink) {
      navigator.clipboard.writeText(downloadLink);
      setCopied(true);
      gtaAudio.playBlip(720, 0.08);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="group relative flex flex-col cursor-pointer"
      title={game.name}
      onClick={() => {
        gtaAudio.playBlip(520, 0.06);
        onSelect(game);
      }}
    >
      {/* Outer Card Shell with subtle lift on hover (NO image zoom) */}
      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-pink-500/20 shadow-md transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-pink-500/80 group-hover:shadow-[0_12px_35px_rgba(236,72,153,0.35)]">
        
        {/* Game Cover Art - Pure high-res artwork, ZERO zoom effect */}
        <img
          src={game.image || game.coverImage || 'https://placehold.co/600x800/0f172a/334155?text=ENCRYPTED'}
          alt={game.name}
          className="w-full h-full object-cover saturate-[1.05] group-hover:brightness-110 transition-all duration-300"
          onError={e => {
            e.currentTarget.src = 'https://placehold.co/600x800/0f172a/334155?text=ENCRYPTED';
          }}
        />

        {/* Ambient Top and Bottom Scrim (Leaves Center Artwork 100% Clear) */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-950/70 via-transparent to-transparent pointer-events-none" />

        {/* TOP BADGES ZONE */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10 pointer-events-none">
          {/* Rank Badge with GTA VI Style Metallic Plate */}
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-pink-500/40 shadow-lg shadow-pink-500/20">
            <span className="text-[11px] font-black italic tracking-wider bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">
              #{formattedRank}
            </span>
          </div>

          {/* Repacker Tag */}
          <div className="flex items-center gap-1.5">
            {isHypervisor ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase bg-red-600/90 text-white shadow-md border border-red-400/40">
                HV
              </span>
            ) : game.repackBy ? (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider uppercase bg-pink-600/90 text-white shadow-md border border-pink-400/30 truncate max-w-[70px]">
                {game.repackBy.split(' ')[0]}
              </span>
            ) : null}
          </div>
        </div>

        {/* FLOATING QUICK ACTIONS (On Hover / Top Right Mobile) */}
        <div className="absolute end-2.5 top-11 z-20 flex flex-col gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 sm:translate-x-2 sm:group-hover:translate-x-0">
          {/* Quick Peek Button */}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              gtaAudio.playBlip(680, 0.08);
              onQuickPeek(game);
            }}
            className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-pink-600 text-white border border-pink-500/30 flex items-center justify-center transition-colors shadow-lg"
            title={t('Quick Peek')}
          >
            <Eye size={15} />
          </button>

          {/* Favorite Toggle Button */}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              gtaAudio.playChime();
              onToggleFavorite(game.id);
            }}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors shadow-lg ${
              isFavorite 
                ? 'bg-pink-600 text-white border-pink-400' 
                : 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700 hover:text-pink-400'
            }`}
            title={t('Favorites')}
          >
            <Heart size={15} className={isFavorite ? 'fill-current' : ''} />
          </button>

          {/* Quick Copy Link */}
          {downloadLink && (
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-cyan-600 text-white border border-cyan-500/30 flex items-center justify-center transition-colors shadow-lg"
              title={copied ? t('Link Copied!') : t('Copy Magnet / Link')}
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          )}
        </div>

        {/* BOTTOM CONTENT OVERLAY: Clean Size & Action (ZERO Game Title Text to Unblock Artwork) */}
        <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3 z-10 flex flex-col justify-end">
          {/* Size comparison row */}
          <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-slate-300">
            <span className="text-pink-400 font-bold flex items-center gap-1">
              <HardDrive size={12} />
              {game.repackSize || 'N/A'}
            </span>
            {savings !== null && (
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                -{savings}%
              </span>
            )}
          </div>

          {/* Interactive CTA pill revealed smoothly on hover */}
          <div className="mt-1 pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-slate-300 group-hover:text-white">
            <span className="uppercase tracking-wider text-[10px] text-pink-400 font-black">
              {t('Download Repack')}
            </span>
            <ArrowRight size={13} className="text-pink-400 transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// GTA 6 ALL REPACKS FULL-SCREEN MODAL
// True 100% full screen modal with edge-to-edge layout
// Zero zoom effect, zero game title text
// ==========================================
interface MostPopularRepacksModalProps {
  isOpen: boolean;
  games: ResourceItem[];
  onClose: () => void;
  onSelect: (item: ResourceItem) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const MostPopularRepacksModal: React.FC<MostPopularRepacksModalProps> = ({
  isOpen,
  games,
  onClose,
  onSelect,
  favorites,
  onToggleFavorite
}) => {
  const { dir, t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'favorites'>('all');
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [previewGame, setPreviewGame] = useState<ResourceItem | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(12);
      else if (window.innerWidth < 1024) setItemsPerPage(18);
      else setItemsPerPage(24);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter games based on search and favorites only
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = !search.trim() || 
        game.name.toLowerCase().includes(search.toLowerCase()) ||
        (game.repackBy && game.repackBy.toLowerCase().includes(search.toLowerCase())) ||
        (game.genres && game.genres.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedFilter === 'favorites') return favorites.includes(game.id);
      return true;
    });
  }, [games, search, selectedFilter, favorites]);

  // Reset to page 1 if filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredGames.length / itemsPerPage));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedGames = filteredGames.slice((validCurrentPage - 1) * itemsPerPage, validCurrentPage * itemsPerPage);

  const pageNumbers = useMemo(() => {
    return getPageNumbers(validCurrentPage, totalPages, 5);
  }, [validCurrentPage, totalPages]);

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div 
          key="gta6-fullscreen-modal-portal"
          dir={dir}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] w-screen h-screen flex flex-col bg-white dark:bg-slate-950 overflow-hidden"
        >
          {/* GTA 6 Vice Header Stripe */}
          <div className="h-2 bg-gradient-to-r from-pink-500 via-rose-500 via-purple-600 to-cyan-400 shrink-0" />

          {/* Full Screen Modal Header */}
          <div className="px-4 sm:px-8 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/80 shrink-0">
            <div className="flex items-center gap-3.5">
              <GTA6Logo size="sm" />
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <span>{t('Most Popular Repacks')}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {filteredGames.length} {t('Games')} {t('All Repacks in Vault')}
                </p>
              </div>
            </div>

            {/* Search Input & Close Button */}
            <div className="flex items-center gap-3 flex-1 sm:max-w-md justify-end">
              <div className="relative w-full max-w-sm">
                <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t('Search popular repacks...')}
                  className="w-full ps-9 pe-8 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-pink-500 transition-colors"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Fullscreen Close Button */}
              <button
                type="button"
                onClick={() => {
                  gtaAudio.playBlip(440, 0.06);
                  onClose();
                }}
                className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors shrink-0 shadow-sm"
                title={t('Close Vault')}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Filters Bar: ONLY All Repackers & Favorites */}
          <div className="px-4 sm:px-8 py-2.5 bg-slate-100/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            {[
              { id: 'all', label: t('All Repackers') },
              { id: 'favorites', label: `${t('Favorites')} (${favorites.length})` }
            ].map(tab => (
              <button
                key={`modal-tab-${tab.id}`}
                type="button"
                onClick={() => {
                  gtaAudio.playBlip(560, 0.05);
                  setSelectedFilter(tab.id as typeof selectedFilter);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  selectedFilter === tab.id
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-pink-500 border border-slate-200 dark:border-slate-700/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Games Grid Container with GTA 6 Vice City Sunset Background */}
          <div className="relative flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/50 dark:bg-slate-950/70">
            {/* Modal GTA 6 Background Art - 100% visible and unblocked */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-55 saturate-125">
              <img
                src="/images/gta6_bg.jpg"
                alt="GTA 6 Vice City Background"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.src = '/images/gta6.png';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/60 to-white/70 dark:from-slate-950/92 dark:via-slate-950/65 dark:to-slate-950/75" />
            </div>

            <div className="relative z-10">
            {paginatedGames.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-3">
                  <Search size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {t('No matching repacks found')}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  {t('Try clearing your search query or choosing another filter.')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSelectedFilter('all');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-pink-600 text-white hover:bg-pink-500 transition-colors"
                >
                  {t('Reset Filters')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-6">
                {paginatedGames.map((game, index) => {
                  const globalRank = (validCurrentPage - 1) * itemsPerPage + index + 1;
                  const itemKey = `modal-card-${game.id || game.name || index}-${globalRank}`;
                  return (
                    <GTARepackCard
                      key={itemKey}
                      game={game}
                      rank={globalRank}
                      onSelect={onSelect}
                      onQuickPeek={setPreviewGame}
                      isFavorite={favorites.includes(game.id)}
                      onToggleFavorite={onToggleFavorite}
                    />
                  );
                })}
              </div>
            )}
            </div>
          </div>

          {/* Pagination Footer with safe page keys */}
          {totalPages > 1 && (
            <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-center items-center shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    gtaAudio.playBlip(480, 0.05);
                    setCurrentPage(p => Math.max(p - 1, 1));
                  }}
                  disabled={validCurrentPage === 1}
                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-pink-600 hover:text-white disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={16} className="rtl:rotate-180" />
                </button>

                {pageNumbers.map(pageNum => (
                  <button
                    key={`modal-page-btn-${pageNum}`}
                    type="button"
                    onClick={() => {
                      gtaAudio.playBlip(560, 0.05);
                      setCurrentPage(pageNum);
                    }}
                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                      validCurrentPage === pageNum
                        ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    gtaAudio.playBlip(480, 0.05);
                    setCurrentPage(p => Math.min(p + 1, totalPages));
                  }}
                  disabled={validCurrentPage === totalPages}
                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-pink-600 hover:text-white disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={16} className="rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Quick Peek Drawer if active */}
      <QuickPeekModal
        game={previewGame}
        onClose={() => setPreviewGame(null)}
        onSelect={item => {
          setPreviewGame(null);
          onSelect(item);
        }}
        isFavorite={previewGame ? favorites.includes(previewGame.id) : false}
        onToggleFavorite={onToggleFavorite}
      />
    </AnimatePresence>,
    document.body
  );
};

// ==========================================
// MAIN COMPONENT: GTA 6 POPULAR REPACKS SECTION
// ==========================================
export interface MostPopularRepacksSectionProps {
  gameIds: string[];
  allResources: Record<string, ResourceItem[]>;
  onSelect: (item: ResourceItem) => void;
}

export const MostPopularRepacksSection: React.FC<MostPopularRepacksSectionProps> = ({
  gameIds,
  allResources,
  onSelect
}) => {
  const { dir, t } = useLanguage();
  const isRtl = dir === 'rtl';

  // Section State: Only 'all' and 'favorites'
  const [viewMode, setViewMode] = useState<'deck' | 'grid'>('deck');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all');
  const [showAllModal, setShowAllModal] = useState(false);
  const [previewGame, setPreviewGame] = useState<ResourceItem | null>(null);

  // Carousel ref for deck view
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('gta6_favorite_repacks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      if (typeof window !== 'undefined') {
        localStorage.setItem('gta6_favorite_repacks', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  // Compile full games list with strict ID de-duplication
  const allGames = useMemo(() => {
    const flattened = Object.values(allResources).flat();
    let result: ResourceItem[] = [];

    // 1. First map directly matched IDs from props
    if (gameIds && gameIds.length > 0) {
      result = gameIds
        .map(id => flattened.find(i => String(i.id).toLowerCase() === String(id).toLowerCase()))
        .filter(Boolean) as ResourceItem[];
    }

    // 2. Fallback to rich list of repacks if fewer than 6 found
    if (result.length < 6) {
      const fallbackGames = flattened.filter(item => {
        const isGameCat = item.category === 'game' || item.category === 'hypervisor' || item.category === 'steamtools';
        const hasRepackInfo = Boolean(item.repackSize || item.repackBy || item.links?.full);
        return isGameCat && hasRepackInfo && !result.some(r => r.id === item.id);
      });
      result = [...result, ...fallbackGames];
    }

    // Strict de-duplication by guaranteed unique key
    const seen = new Set<string>();
    return result.filter((item, idx) => {
      const uid = String(item.id || item.name || idx);
      if (seen.has(uid)) return false;
      seen.add(uid);
      return true;
    });
  }, [gameIds, allResources]);

  // Filtered Games (Only Search & Favorites)
  const processedGames = useMemo(() => {
    return allGames.filter(game => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          game.name.toLowerCase().includes(q) ||
          (game.repackBy && game.repackBy.toLowerCase().includes(q)) ||
          (game.genres && game.genres.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (activeFilter === 'favorites') return favorites.includes(game.id);
      return true;
    });
  }, [allGames, searchQuery, activeFilter, favorites]);

  // Display limit for main section on page
  const displayLimit = 18;
  const displayedGames = processedGames.slice(0, displayLimit);

  // Carousel scroll handler
  const updateScrollButtons = useCallback(() => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    if (isRtl) {
      setCanScrollRight(Math.abs(scrollLeft) > 10);
      setCanScrollLeft(Math.abs(scrollLeft) < scrollWidth - clientWidth - 10);
    } else {
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, [isRtl]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.clientWidth * 0.75;
    const delta = direction === 'left' ? -scrollAmount : scrollAmount;
    carouselRef.current.scrollBy({ left: isRtl ? -delta : delta, behavior: 'smooth' });
    gtaAudio.playBlip(620, 0.06);
    setTimeout(updateScrollButtons, 350);
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    updateScrollButtons();
    return () => el.removeEventListener('scroll', updateScrollButtons);
  }, [updateScrollButtons, displayedGames, viewMode]);

  if (!allGames || allGames.length === 0) return null;

  return (
    <>
      <section 
        id="popular-repacks-section"
        dir={dir}
        className="mt-14 mb-10 relative z-10 w-full overflow-hidden scroll-mt-24"
      >
        {/* GTA 6 High-Res Vice City Sunset Background Artwork - 100% visible and unblocked */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
          <img
            src="/images/gta6_bg.jpg"
            alt="GTA 6 Vice City Sunset Background"
            className="w-full h-full object-cover object-center opacity-45 dark:opacity-60 saturate-125"
            onError={(e) => {
              e.currentTarget.src = '/images/gta6.png';
            }}
          />
          {/* Rich Vice City Contrast Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/60 to-white/70 dark:from-slate-950/90 dark:via-slate-950/65 dark:to-slate-950/75" />
          {/* Subtle Retro Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(236,72,153,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.06)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-80" />
        </div>

        {/* CONTAINER SHELL */}
        <div className="relative z-10 rounded-3xl p-4 sm:p-7 md:p-8 backdrop-blur-md border border-pink-500/20 dark:border-pink-500/30 shadow-xl shadow-pink-500/5">

          {/* SECTION HEADER ZONE */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 mb-6 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
            
            {/* Title & Official GTA VI Logo Lockup */}
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-5">
              <GTA6Logo size="md" />

              <div>
                {/* GTA VI Kicker */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-pink-600 dark:text-pink-400">
                    {t('Vice City Edition')}
                  </span>
                </div>

                {/* Main Heading */}
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <span>{t('Most Popular Repacks')}</span>
                  <Flame size={24} className="text-pink-500 hidden sm:inline-block animate-pulse" />
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-xl">
                  {t('Top community favorites this year')} · {t('Explore the most compressed, highly verified game releases of the year.')}
                </p>
              </div>
            </div>

            {/* Header Right Actions (View Mode + See All Button) */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
              
              {/* View Mode Toggle (Deck vs Grid) */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('deck');
                    gtaAudio.playBlip(540, 0.05);
                  }}
                  className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    viewMode === 'deck'
                      ? 'bg-white dark:bg-pink-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={t('Cinematic Deck')}
                >
                  <Columns3 size={16} />
                  <span className="hidden md:inline">{t('Cinematic Deck')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('grid');
                    gtaAudio.playBlip(540, 0.05);
                  }}
                  className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-pink-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={t('Grid View')}
                >
                  <Grid size={16} />
                  <span className="hidden md:inline">{t('Grid View')}</span>
                </button>
              </div>

              {/* SEE MORE GAMES BUTTON */}
              <button
                type="button"
                onClick={() => {
                  gtaAudio.playBlip(700, 0.08);
                  setShowAllModal(true);
                }}
                className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:via-rose-500 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-pink-600/25 flex items-center gap-2 transition-all hover:scale-105 shrink-0"
              >
                <span>{t('SEE MORE GAMES')}</span>
                <ArrowRight size={15} className="transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
              </button>
            </div>
          </div>

          {/* GTA 6 COUNTDOWN & SPECIAL SQUAD ARTWORK SHOWCASE */}
          <GTA6CountdownAndCrewShowcase />

          {/* INTERACTIVE CONTROLS TOOLBAR: ONLY All Repackers & Favorites + Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
            
            {/* Filter Tabs: ONLY All Repackers & Favorites */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'all', label: t('All Repackers') },
                { id: 'favorites', label: `${t('Favorites')} (${favorites.length})` }
              ].map(tab => (
                <button
                  key={`section-tab-${tab.id}`}
                  type="button"
                  onClick={() => {
                    setActiveFilter(tab.id as typeof activeFilter);
                    gtaAudio.playBlip(560, 0.05);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeFilter === tab.id
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/30'
                      : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-pink-500 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Bar & Carousel Controls */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 sm:w-64">
                <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('Search popular repacks...')}
                  className="w-full ps-8 pe-7 py-1.5 text-xs rounded-xl bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-pink-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Carousel Arrows (only in deck view) */}
              {viewMode === 'deck' && (
                <div className="hidden sm:flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => scrollCarousel('left')}
                    disabled={!canScrollLeft}
                    className="w-8 h-8 rounded-xl bg-white/80 dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-pink-600 hover:text-white disabled:opacity-30 transition-colors flex items-center justify-center border border-slate-200 dark:border-slate-800"
                    title={t('Previous Repack')}
                  >
                    <ChevronLeft size={16} className="rtl:rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCarousel('right')}
                    disabled={!canScrollRight}
                    className="w-8 h-8 rounded-xl bg-white/80 dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-pink-600 hover:text-white disabled:opacity-30 transition-colors flex items-center justify-center border border-slate-200 dark:border-slate-800"
                    title={t('Next Repack')}
                  >
                    <ChevronRight size={16} className="rtl:rotate-180" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* MAIN CONTENT ZONE: DECK VIEW OR GRID VIEW */}
          {displayedGames.length === 0 ? (
            <div className="h-56 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-center p-6">
              <GTA6Logo size="sm" className="mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t('No matching repacks found')}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {t('Try clearing your search query or choosing another filter.')}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="mt-3 px-4 py-1.5 rounded-xl text-xs font-bold bg-pink-600 text-white hover:bg-pink-500 transition-colors"
              >
                {t('Reset Filters')}
              </button>
            </div>
          ) : viewMode === 'deck' ? (
            /* CINEMATIC SNAP CAROUSEL (ZERO Image Zoom & ZERO Title Text) */
            <div className="relative -mx-2 sm:mx-0">
              <div
                ref={carouselRef}
                className="flex gap-3 sm:gap-4.5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-2 sm:px-0 py-2"
                style={{ scrollbarWidth: 'none' }}
              >
                {displayedGames.map((game, index) => {
                  const itemKey = `deck-card-${game.id || game.name || index}-${index}`;
                  return (
                    <div
                      key={itemKey}
                      className="shrink-0 w-[44vw] sm:w-[28vw] md:w-[22vw] lg:w-[15vw] max-w-[220px] snap-start"
                    >
                      <GTARepackCard
                        game={game}
                        rank={index + 1}
                        onSelect={onSelect}
                        onQuickPeek={setPreviewGame}
                        isFavorite={favorites.includes(game.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Mobile Swipe Guidance bar */}
              <div className="flex sm:hidden justify-center items-center gap-1.5 mt-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  ← {t('Swipe for more')} →
                </span>
              </div>
            </div>
          ) : (
            /* RESPONSIVE GRID VIEW (2 cols mobile, 3-4 cols tablet, 6 cols desktop) */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
              {displayedGames.map((game, index) => {
                const itemKey = `grid-card-${game.id || game.name || index}-${index}`;
                return (
                  <GTARepackCard
                    key={itemKey}
                    game={game}
                    rank={index + 1}
                    onSelect={onSelect}
                    onQuickPeek={setPreviewGame}
                    isFavorite={favorites.includes(game.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                );
              })}
            </div>
          )}

          {/* Bottom Bar: Quick Stats & Explore All Vault Link */}
          <div className="mt-7 pt-5 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-pink-500" />
              <span>
                {t('Showing')} <strong className="text-slate-800 dark:text-white font-bold">{displayedGames.length}</strong> {t('of')} <strong className="text-slate-800 dark:text-white font-bold">{processedGames.length}</strong> {t('verified community repacks')}.
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                gtaAudio.playBlip(720, 0.08);
                setShowAllModal(true);
              }}
              className="font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 flex items-center gap-1 transition-colors"
            >
              <span>{t('All Repacks in Vault')} ({allGames.length})</span>
              <ArrowRight size={14} className="rtl:rotate-180" />
            </button>
          </div>
        </div>
      </section>

      {/* FULL-SCREEN MODAL */}
      <MostPopularRepacksModal
        isOpen={showAllModal}
        games={allGames}
        onClose={() => setShowAllModal(false)}
        onSelect={game => {
          setShowAllModal(false);
          onSelect(game);
        }}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />

      {/* QUICK PEEK MODAL DRAWER */}
      <QuickPeekModal
        game={previewGame}
        onClose={() => setPreviewGame(null)}
        onSelect={item => {
          setPreviewGame(null);
          onSelect(item);
        }}
        isFavorite={previewGame ? favorites.includes(previewGame.id) : false}
        onToggleFavorite={toggleFavorite}
      />
    </>
  );
};

export default MostPopularRepacksSection;
