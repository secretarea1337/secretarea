import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Search, 
  X, 
  ArrowRight, 
  Gamepad2, 
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { useLanguage } from '../src/contexts/LanguageContext';

// ==========================================
// AUDIO FEEDBACK HELPER (Safe Web Audio API)
// ==========================================
class StudioAudioFX {
  private ctx: AudioContext | null = null;

  private getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playBlip(freq = 600, duration = 0.05) {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio fallback
    }
  }

  playChime() {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.03, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.12);
      });
    } catch {
      // Silent fallback
    }
  }
}

const studioAudio = new StudioAudioFX();

// ==========================================
// ANIMATED NUMBER COMPONENT
// Smooth high-fps counting animation
// ==========================================
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const end = value;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }
    const duration = 1000;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(ease * end);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setDisplayValue(end);
      }
    };

    const handle = requestAnimationFrame(update);
    return () => cancelAnimationFrame(handle);
  }, [value]);

  return <span>{displayValue}</span>;
};

// ==========================================
// INTERFACES & EXPORTS
// ==========================================
export interface CompanyProfile {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  gameIds?: string[];
  hypervisorIds?: string[];
  steamtoolsIds?: string[];
  ps5Ids?: string[];
  architectIds?: string[];
  extraIds?: string[];
}

export type StudioProfile = CompanyProfile;

export const getStudioEcosystem = (studioName: string): ('xbox' | 'playstation' | 'aaa' | 'japanese')[] => {
  const s = (studioName || '').toLowerCase();
  const eco: ('xbox' | 'playstation' | 'aaa' | 'japanese')[] = [];

  const xboxKeywords = [
    'xbox', 'bethesda', 'id software', 'playground', 'mojang', 'ninja theory',
    'obsidian', 'machinegames', 'arkane', '343', 'halo', 'turn 10', 'coalition',
    'inxile', 'compulsion', 'double fine', 'rare', 'undead labs', 'treyarch',
    'infinity ward', 'raven', 'sledgehammer', 'blizzard', 'activision', 'high moon', 'toys for bob'
  ];
  const psKeywords = [
    'playstation', 'sony', 'naughty dog', 'santa monica', 'insomniac',
    'sucker punch', 'guerrilla', 'polyphony', 'housemarque', 'bluepoint',
    'firesprite', 'bungie', 'bend studio', 'team asobi', 'media molecule'
  ];
  const japaneseKeywords = [
    'capcom', 'fromsoftware', 'konami', 'bandai namco', 'square enix',
    'koei tecmo', 'sega', 'atlus', 'team ninja', 'platinumgames', 'nintendo'
  ];
  const aaaKeywords = [
    'rockstar', 'take-two', '2k', 'electronic arts', 'ea', 'ubisoft',
    'respawn', 'bioware', 'dice', 'cd projekt', 'io interactive', 'saber',
    'remedy', 'techland', 'warner bros', 'wb games', 'hangar 13'
  ];

  if (xboxKeywords.some(k => s.includes(k))) eco.push('xbox');
  if (psKeywords.some(k => s.includes(k))) eco.push('playstation');
  if (japaneseKeywords.some(k => s.includes(k))) eco.push('japanese');
  if (aaaKeywords.some(k => s.includes(k)) || eco.length > 0) eco.push('aaa');

  return eco;
};

export interface TopStudiosSectionProps {
  profiles: CompanyProfile[];
  onSelect: (profile: CompanyProfile) => void;
  onSeeAll: () => void;
  categoryType: 'games' | 'tools';
}

// Helper to generate safe pagination numbers without duplicates
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
// TRUE FULL-SCREEN TOP STUDIOS POPUP MODAL
// - Full Screen edge-to-edge
// - Next Pages (Pagination)
// - NO spaces between studios (gap-0 seamless matrix)
// - Just logo, name, games numbers
// ==========================================
interface TopStudiosPopupProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: (CompanyProfile & { totalGames: number })[];
  onSelect: (profile: CompanyProfile) => void;
  categoryType: 'games' | 'tools';
}

const TopStudiosPopup: React.FC<TopStudiosPopupProps> = ({
  isOpen,
  onClose,
  profiles,
  onSelect,
  categoryType
}) => {
  const { dir, t } = useLanguage();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'most' | 'az'>('most');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Filter and sort
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = profiles.filter(p => !q || p.name.toLowerCase().includes(q));
    if (sortBy === 'most') {
      return list.sort((a, b) => b.totalGames - a.totalGames);
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [profiles, search, sortBy]);

  // Reset to page 1 on search or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedProfiles = filtered.slice((validCurrentPage - 1) * itemsPerPage, validCurrentPage * itemsPerPage);

  const pageNumbers = useMemo(() => {
    return getPageNumbers(validCurrentPage, totalPages, 5);
  }, [validCurrentPage, totalPages]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="top-studios-fullscreen-portal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          dir={dir}
          className="fixed inset-0 z-[9999] w-screen h-screen flex flex-col bg-white dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-white"
        >
          {/* Top Ambient Glow Stripe */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 to-pink-500 shrink-0" />

          {/* Full Screen Top Bar */}
          <div className="px-4 sm:px-8 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/90 backdrop-blur-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/25 shrink-0 shadow-sm">
                {categoryType === 'games' ? <Gamepad2 size={22} /> : <Briefcase size={22} />}
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
                  <span>{categoryType === 'games' ? t('Top Studios Directory') : t('Top Tech Companies')}</span>
                  <span className="relative inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-mono font-black border border-blue-500/20 shadow-sm shadow-blue-500/10">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                    </span>
                    <AnimatedNumber value={filtered.length} />
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  {categoryType === 'games'
                    ? t('Leading developers & creators shaping gaming worlds')
                    : t('Leading software developers & creative suites')}
                </p>
              </div>
            </div>

            {/* Search, Sort, and Close Controls */}
            <div className="flex items-center gap-2.5 flex-1 sm:max-w-md justify-end">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={categoryType === 'games' ? t('Search studios or franchises...') : t('Search software companies...')}
                  className="w-full ps-9 pe-8 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Sort Toggle */}
              <button
                type="button"
                onClick={() => {
                  studioAudio.playBlip(560, 0.05);
                  setSortBy(prev => (prev === 'most' ? 'az' : 'most'));
                }}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
                title={sortBy === 'most' ? t('Most Games') : t('Name (A-Z)')}
              >
                <ArrowUpDown size={14} />
                <span className="hidden md:inline">{sortBy === 'most' ? t('Most Games') : t('Name (A-Z)')}</span>
              </button>

              {/* Fullscreen Close Button */}
              <button
                type="button"
                onClick={() => {
                  studioAudio.playBlip(440, 0.06);
                  onClose();
                }}
                className="w-10 h-10 rounded-xl bg-slate-200/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-colors shrink-0 shadow-sm border border-slate-300/40 dark:border-slate-700/60"
                title={t('Close')}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Full Screen Body - Studios Grid (ZERO SPACES BETWEEN STUDIOS) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-100/60 dark:bg-slate-950/80">
            {filtered.length === 0 ? (
              <div className="py-24 text-center">
                <Building2 size={40} className="mx-auto text-slate-400 mb-3" />
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  {t('No studios found')}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {t('Try adjusting your search query or reset the filter.')}
                </p>
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-sm"
                >
                  {t('Reset Filters')}
                </button>
              </div>
            ) : (
              /* SEAMLESS MATRIX: gap-0 with divide borders between all studio cards */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0 border-t border-s border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xl bg-white dark:bg-slate-900">
                {paginatedProfiles.map((profile, idx) => {
                  const initials = (profile.name || 'Studio')
                    .split(' ')
                    .map(w => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={`popup-studio-${profile.id || profile.name}-${idx}`}
                      onClick={() => {
                        studioAudio.playBlip(620, 0.06);
                        onClose();
                        onSelect(profile);
                      }}
                      className="group border-b border-e border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 hover:bg-blue-50/70 dark:hover:bg-slate-800/90 transition-colors p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer select-none"
                    >
                      {/* 1. LOGO */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-2xl p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden mb-3 shadow-sm">
                        {profile.logoUrl ? (
                          <img
                            src={profile.logoUrl}
                            alt={profile.name}
                            className="w-full h-full object-contain filter group-hover:brightness-110 transition-all"
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="font-black text-sm text-blue-600 dark:text-blue-400">${initials}</span>`;
                              }
                            }}
                          />
                        ) : (
                          <span className="font-black text-sm text-blue-600 dark:text-blue-400">
                            {initials}
                          </span>
                        )}
                      </div>

                      {/* 2. NAME */}
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1 w-full group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {profile.name}
                      </h4>

                      {/* 3. GAMES NUMBERS */}
                      <div className="mt-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span className="font-mono font-black text-blue-600 dark:text-blue-400">
                          {profile.totalGames}
                        </span>
                        <span>{profile.totalGames === 1 ? t('Game') : t('Games')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* NEXT PAGES: Pagination Footer Bar */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-8 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>{t('Showing')}</span>{' '}
                <span className="font-mono text-slate-900 dark:text-white">
                  {(validCurrentPage - 1) * itemsPerPage + 1}–{Math.min(validCurrentPage * itemsPerPage, filtered.length)}
                </span>{' '}
                <span>{t('of')}</span>{' '}
                <span className="font-mono text-slate-900 dark:text-white">{filtered.length}</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    studioAudio.playBlip(480, 0.05);
                    setCurrentPage(p => Math.max(p - 1, 1));
                  }}
                  disabled={validCurrentPage === 1}
                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white disabled:opacity-30 transition-colors border border-slate-200 dark:border-slate-700"
                  title={t('Previous Page')}
                >
                  <ChevronLeft size={16} className="rtl:rotate-180" />
                </button>

                {pageNumbers.map(pageNum => (
                  <button
                    key={`studio-page-${pageNum}`}
                    type="button"
                    onClick={() => {
                      studioAudio.playBlip(560, 0.05);
                      setCurrentPage(pageNum);
                    }}
                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border ${
                      validCurrentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border-blue-500'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    studioAudio.playBlip(480, 0.05);
                    setCurrentPage(p => Math.min(p + 1, totalPages));
                  }}
                  disabled={validCurrentPage === totalPages}
                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white disabled:opacity-30 transition-colors border border-slate-200 dark:border-slate-700"
                  title={t('Next Page')}
                >
                  <ChevronRight size={16} className="rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// ==========================================
// MAIN COMPONENT: TOP STUDIOS SECTION
// ==========================================
export const TopStudiosSection: React.FC<TopStudiosSectionProps> = ({
  profiles,
  onSelect,
  onSeeAll,
  categoryType
}) => {
  const { dir, t } = useLanguage();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Compute total games and sort descending
  const processedProfiles = useMemo(() => {
    return [...profiles]
      .map(p => {
        let count = 0;
        if (categoryType === 'games') {
          count = 
            (p.gameIds?.length || 0) + 
            (p.hypervisorIds?.length || 0) + 
            (p.steamtoolsIds?.length || 0) + 
            (p.ps5Ids?.length || 0);
        } else {
          count = (p.architectIds?.length || 0) + (p.extraIds?.length || 0);
        }
        return {
          ...p,
          totalGames: count
        };
      })
      .filter(p => p.totalGames > 0)
      .sort((a, b) => b.totalGames - a.totalGames);
  }, [profiles, categoryType]);

  // User requirement: JUST TOP 3 STUDIOS
  const top3Profiles = useMemo(() => {
    return processedProfiles.slice(0, 3);
  }, [processedProfiles]);

  if (!processedProfiles || processedProfiles.length === 0) return null;

  return (
    <>
      <section 
        id="top-studios-section" 
        dir={dir}
        className="mt-14 mb-14 w-full relative z-10 scroll-mt-24"
      >
        {/* ========================================== */}
        {/* SECTION HEADER ZONE */}
        {/* ========================================== */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-3.5 px-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {categoryType === 'games' ? t('Game Studios') : t('Enterprise Software')}
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <motion.span
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-mono font-black text-xs border border-blue-500/25 shadow-sm shadow-blue-500/10"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                </span>
                <AnimatedNumber value={processedProfiles.length} />
              </motion.span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-sm shrink-0">
                {categoryType === 'games' ? <Gamepad2 size={22} /> : <Briefcase size={22} />}
              </div>
              <span>
                {categoryType === 'games' ? t('Top Studios') : t('Top Tech Companies')}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium max-w-xl">
              {categoryType === 'games'
                ? t('Leading developers & creators shaping gaming worlds')
                : t('Leading software developers & creative suites')}
            </p>
          </div>

          {/* Interactive Trigger: Opens Fullscreen Top Studios Popup */}
          <button
            type="button"
            onClick={() => {
              studioAudio.playBlip(700, 0.06);
              setIsPopupOpen(true);
            }}
            className="group cursor-pointer px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/40 shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto shrink-0"
          >
            <span>{t('View Full Directory')}</span>
            <ArrowRight size={15} className="text-blue-500 transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
          </button>
        </div>

        {/* ========================================== */}
        {/* CINEMATIC FRANCHISE HERO BANNER */}
        {/* Full width & height part of website layout */}
        {/* ZERO text overlay and ZERO zoom effects */}
        {/* ========================================== */}
        {categoryType === 'games' && (
          <div 
            onClick={() => {
              studioAudio.playBlip(680, 0.05);
              setIsPopupOpen(true);
            }}
            className="relative mb-6 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800/90 shadow-xl bg-slate-950 cursor-pointer w-full h-[220px] sm:h-[300px] md:h-[380px] lg:h-[440px] xl:h-[480px]"
            title={t('View Full Directory')}
          >
            {/* Top Glowing Ambient Line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 via-emerald-400 to-amber-400 z-10" />

            {/* Pure artwork without zoom effects */}
            <img
              src="https://assets-prd.ignimgs.com/2025/11/14/smash-ultimate-1763126090993.jpg"
              alt="Top Studios Franchise Hero Banner"
              className="w-full h-full object-cover object-center"
              onError={e => {
                e.currentTarget.src = '/images/smash_ultimate_banner.jpg';
              }}
            />
          </div>
        )}

        {/* ========================================== */}
        {/* TOP 3 STUDIOS SECTION */}
        {/* WITHOUT SPACES BETWEEN STUDIOS (gap-0 seamless block) */}
        {/* JUST LOGO, NAME, GAMES NUMBERS */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-200/80 dark:divide-slate-800/80 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/95 shadow-lg">
          {top3Profiles.map((profile, idx) => {
            const initials = (profile.name || 'Studio')
              .split(' ')
              .map(w => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <motion.div
                key={`top3-studio-${profile.id || profile.name}-${idx}`}
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.04)' }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.15 }}
                onClick={() => {
                  studioAudio.playBlip(620, 0.06);
                  onSelect(profile);
                }}
                className="group relative flex items-center gap-4 p-5 sm:p-6 md:p-7 cursor-pointer transition-colors"
              >
                {/* 1. LOGO */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/90 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {profile.logoUrl ? (
                    <img
                      src={profile.logoUrl}
                      alt={profile.name}
                      className="w-full h-full object-contain filter group-hover:brightness-110 transition-all"
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="font-black text-lg text-blue-600 dark:text-blue-400">${initials}</span>`;
                        }
                      }}
                    />
                  ) : (
                    <span className="font-black text-lg text-blue-600 dark:text-blue-400">
                      {initials}
                    </span>
                  )}
                </div>

                {/* 2. NAME & 3. GAMES NUMBERS */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {profile.name}
                  </h3>
                  
                  <div className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                    <span className="text-sm sm:text-base font-black font-mono text-blue-600 dark:text-blue-400">
                      {profile.totalGames}
                    </span>
                    <span>{profile.totalGames === 1 ? t('Game') : t('Games')}</span>
                  </div>
                </div>

                {/* Subtle Right Arrow Affordance */}
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 flex items-center justify-center shrink-0 transition-all transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                  <ArrowRight size={14} className="rtl:rotate-180" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ========================================== */}
      {/* TRUE FULLSCREEN TOP STUDIOS POPUP MODAL */}
      {/* ========================================== */}
      <TopStudiosPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        profiles={processedProfiles}
        onSelect={onSelect}
        categoryType={categoryType}
      />
    </>
  );
};

export default TopStudiosSection;
