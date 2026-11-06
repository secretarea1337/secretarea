import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TbDeviceGamepad2, 
  TbUsers, 
  TbChevronLeft, 
  TbChevronRight, 
  TbPlayerPlay, 
  TbGridDots, 
  TbLayoutList, 
  TbSearch, 
  TbWifi, 
  TbFlame,
  TbScreenShare
} from 'react-icons/tb';
import { useLanguage } from '../src/contexts/LanguageContext';
import type { ResourceItem } from '../pages/SecretArea';

export interface SheetOnlineGameEntry {
  id: string;
  category?: string;
}

interface TwoPlayersSectionProps {
  allGames: ResourceItem[];
  sheetOnlineGames?: (string | SheetOnlineGameEntry)[];
  sheetOnlineGameIds?: string[];
  onSelectGame: (game: ResourceItem, action?: string) => void;
}

// Built-in default IDs ONLY used when the Google Sheet tab has 0 entries
const DEFAULT_COOP_IDS = ['93', '100', '306', '72', '275', '228', '74', '2', '1'];
const GRID_ITEMS_PER_PAGE = 10;

export const TwoPlayersSection: React.FC<TwoPlayersSectionProps> = ({
  allGames,
  sheetOnlineGames = [],
  sheetOnlineGameIds = [],
  onSelectGame
}) => {
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const [activeFilter, setActiveFilter] = useState<'all' | 'online' | 'local' | 'story'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'deck' | 'grid'>('deck');
  const [gridPage, setGridPage] = useState(1);
  const [, setHoveredGameId] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Reset grid page when filters or search changes
  useEffect(() => {
    setGridPage(1);
  }, [activeFilter, searchQuery]);

  // Helper to normalize and match IDs reliably
  const findGameByIdOrName = (targetIdOrName: string): ResourceItem | undefined => {
    if (!targetIdOrName || !allGames.length) return undefined;
    const cleanTarget = String(targetIdOrName).trim().toLowerCase();
    const numericTarget = cleanTarget.replace(/^[a-z]+[-_]?/, '');

    // 1. Direct ID match
    let match = allGames.find(g => {
      const gId = String(g.id).toLowerCase();
      const gNumeric = gId.replace(/^[a-z]+[-_]?/, '');
      return gId === cleanTarget || (numericTarget && gNumeric === numericTarget);
    });
    if (match) return match;

    // 2. gameId match (Steam / secondary ID)
    match = allGames.find(g => {
      if (!g.gameId) return false;
      const gSteamId = String(g.gameId).toLowerCase();
      return gSteamId === cleanTarget || (numericTarget && gSteamId === numericTarget);
    });
    if (match) return match;

    // 3. Name match fallback
    return allGames.find(g => {
      const gName = String(g.name || '').toLowerCase();
      return gName === cleanTarget || gName.includes(cleanTarget);
    });
  };

  // Combine and normalize raw sheet inputs
  const rawEntries = useMemo(() => {
    const list: SheetOnlineGameEntry[] = [];
    if (sheetOnlineGames && sheetOnlineGames.length > 0) {
      sheetOnlineGames.forEach(item => {
        if (typeof item === 'string') {
          list.push({ id: item });
        } else if (item && typeof item === 'object' && item.id) {
          list.push(item);
        }
      });
    } else if (sheetOnlineGameIds && sheetOnlineGameIds.length > 0) {
      sheetOnlineGameIds.forEach(id => list.push({ id }));
    }
    return list;
  }, [sheetOnlineGames, sheetOnlineGameIds]);

  // Resolve games list:
  // If user added games to Google Sheet (even 1 game), show ONLY those exact games!
  // ONLY fallback to defaults if rawEntries is completely empty!
  const resolvedGames = useMemo(() => {
    const list: { game: ResourceItem; customCategory?: string }[] = [];
    const seenIds = new Set<string>();

    const addGame = (game: ResourceItem | undefined, customCategory?: string) => {
      if (!game || seenIds.has(String(game.id))) return;
      seenIds.add(String(game.id));
      list.push({ game, customCategory });
    };

    if (rawEntries.length > 0) {
      rawEntries.forEach(entry => {
        const found = findGameByIdOrName(entry.id);
        if (found) {
          addGame(found, entry.category);
        }
      });
    } else {
      DEFAULT_COOP_IDS.forEach(id => {
        const found = findGameByIdOrName(id);
        if (found) addGame(found);
      });
    }

    return list;
  }, [allGames, rawEntries]);

  // Filter games based on category and search query
  const filteredGames = useMemo(() => {
    let result = resolvedGames;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(({ game }) => 
        (game.name || '').toLowerCase().includes(q) ||
        (game.genres || '').toLowerCase().includes(q) ||
        (game.repackBy || '').toLowerCase().includes(q)
      );
    }

    if (activeFilter !== 'all') {
      result = result.filter(({ game, customCategory }) => {
        // 1. If category was explicitly specified in Google Sheet, it is authoritative!
        if (customCategory && customCategory.trim() !== '') {
          const c = customCategory.toLowerCase().trim();
          const cats = c.split(/[,\/&|;+]/).map(s => s.trim()).filter(Boolean);
          
          if (activeFilter === 'online') {
            return cats.some(part => part.includes('online') || part === 'co-op' || part === 'coop' || part.includes('multiplayer') || part.includes('p2p') || part.includes('net'));
          }
          if (activeFilter === 'local') {
            return cats.some(part => part.includes('local') || part.includes('split') || part.includes('screen') || part.includes('couch') || part.includes('shared'));
          }
          if (activeFilter === 'story') {
            return cats.some(part => part.includes('story') || part.includes('campaign') || part.includes('narrative') || part.includes('co-op campaign'));
          }
          return false;
        }

        // 2. Only if no category was specified in Google Sheet: infer from game metadata
        const gen = (game.genres || '').toLowerCase();
        const desc = (game.description || '').toLowerCase();

        if (activeFilter === 'online') {
          return gen.includes('online') || gen.includes('multiplayer') || desc.includes('online co-op') || desc.includes('online multiplayer');
        }
        if (activeFilter === 'local') {
          return gen.includes('split-screen') || gen.includes('split screen') || gen.includes('local co-op') || gen.includes('local multiplayer') || desc.includes('split-screen') || desc.includes('couch co-op');
        }
        if (activeFilter === 'story') {
          return gen.includes('campaign') || gen.includes('story rich') || gen.includes('story-driven') || desc.includes('campaign') || desc.includes('story-driven journey');
        }
        
        return false;
      });
    }

    return result;
  }, [resolvedGames, activeFilter, searchQuery]);

  // Pagination calculations for Full Grid View
  const totalPages = Math.ceil(filteredGames.length / GRID_ITEMS_PER_PAGE);
  const validGridPage = Math.min(Math.max(1, gridPage), Math.max(1, totalPages));
  const paginatedGridGames = useMemo(() => {
    return filteredGames.slice((validGridPage - 1) * GRID_ITEMS_PER_PAGE, validGridPage * GRID_ITEMS_PER_PAGE);
  }, [filteredGames, validGridPage]);

  // Scroll controls for the deck carousel
  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.clientWidth * 0.75;
    const multiplier = isRtl ? (direction === 'left' ? 1 : -1) : (direction === 'left' ? -1 : 1);
    carouselRef.current.scrollBy({ left: scrollAmount * multiplier, behavior: 'smooth' });
  };

  const handlePageChange = (newPage: number) => {
    setGridPage(newPage);
    if (gridContainerRef.current) {
      gridContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <section 
      dir={dir}
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-amber-500/20 bg-slate-50/90 dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-950 dark:to-black text-slate-900 dark:text-white shadow-xl dark:shadow-2xl p-4 sm:p-6 lg:p-10 my-8 sm:my-12 transition-colors duration-300"
      aria-label="Two Players PC Games Collection"
    >
      {/* Background Ambience & Tech Circuit Traces */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl" />

        {/* Diagonal Tech Hatching Lines */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #f59e0b 0, #f59e0b 1px, transparent 0, transparent 24px)`
          }}
        />

        {/* Top & Bottom Cyber Accent Bars */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-purple-600 via-amber-500 to-purple-600" />
      </div>

      {/* TOP HEADER: BADGE, TITLE, SUBTITLE & RESPONSIVE CHARACTER ART */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 pb-6 border-b border-slate-200 dark:border-white/10">
        
        {/* Left / Main Text Block */}
        <div className="flex-1 text-center lg:text-start flex flex-col items-center lg:items-start max-w-3xl">
          
          {/* Cyber Badge */}
          <div className="flex items-center justify-center lg:justify-start gap-2.5 sm:gap-3 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-md shadow-amber-500/20 transform -skew-x-6">
              <span className="transform skew-x-6 flex items-center gap-1.5">
                <TbDeviceGamepad2 className="w-4 h-4" />
                <span>{t('2-PLAYER CO-OP')}</span>
              </span>
            </div>

            {/* Tech Stripes Decal (//////) */}
            <div className="hidden sm:flex items-center gap-1 px-1 text-amber-500/70 font-mono text-xs select-none tracking-tighter">
              <span>///</span>
              <span>///</span>
              <span>///</span>
            </div>
          </div>

          {/* Exact Required Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
            <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 dark:from-amber-400 dark:via-yellow-200 dark:to-amber-500 bg-clip-text text-transparent drop-shadow-xs">
              {t('Two Players. Endless Fun.')}
            </span>
          </h2>

          {/* Exact Required Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-2xl">
            {t('Explore a curated collection of popular PC games, featuring online co-op, local multiplayer, and competitive experiences.')}
          </p>

        </div>

        {/* Right: Responsive Clean Character Artwork (`/images/online.png`) */}
        <div className="relative shrink-0 flex items-center justify-center mt-3 lg:mt-0 w-full lg:w-auto">
          {/* Dual Glow Backlight */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-transparent to-purple-600/20 dark:from-amber-500/35 dark:to-purple-600/35 blur-3xl rounded-full scale-110 pointer-events-none" />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex items-center justify-center w-full"
          >
            {/* Responsive Container: Native 3:2 Ratio matching the 1536x1024 asset */}
            <div className="relative w-64 sm:w-80 md:w-96 lg:w-[420px] xl:w-[480px] max-w-full aspect-[3/2] flex items-center justify-center">
              <img 
                src="/images/online.png" 
                alt="Two Players Co-Op Gaming" 
                className="w-full h-full object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_12px_30px_rgba(0,0,0,0.85)] transition-transform duration-500 hover:scale-105"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>

      </div>

      {/* CONTROLS BAR: CATEGORY TABS, SEARCH, VIEW TOGGLE & CAROUSEL ARROWS */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 py-4 sm:py-5">
        
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Co-op Games', icon: TbUsers },
            { id: 'online', label: 'Online Co-op', icon: TbWifi },
            { id: 'local', label: 'Split Screen / Local', icon: TbScreenShare },
            { id: 'story', label: 'Campaign & Story', icon: TbFlame },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-102 ring-1 ring-amber-400'
                    : 'bg-white dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 shadow-2xs'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{t(tab.label)}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input, View Mode Toggle & Navigation Arrows */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end">
          
          {/* Quick Search */}
          <div className="relative flex-1 md:w-48 lg:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search co-op games...')}
              className="w-full ps-8 pe-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-950/70 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-2xs transition-all"
            />
            <TbSearch className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* View Mode Toggle (Deck vs Grid) */}
          <div className="flex items-center p-0.5 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 shadow-2xs">
            <button
              onClick={() => setViewMode('deck')}
              title="Angled Deck Showcase"
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'deck' 
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TbLayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Full Grid View"
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TbGridDots className="w-4 h-4" />
            </button>
          </div>

          {/* Carousel Arrows (only in deck mode) */}
          {viewMode === 'deck' && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scroll('left')}
                aria-label="Previous Games"
                className="p-2 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <TbChevronLeft className="w-4 h-4 rtl:rotate-180" />
              </button>
              <button
                onClick={() => scroll('right')}
                aria-label="Next Games"
                className="p-2 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <TbChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* GAMES SHOWCASE: ANGLED DECK OR RESPONSIVE GRID */}
      <div ref={gridContainerRef} className="relative z-10 mt-2">
        {filteredGames.length > 0 ? (
          viewMode === 'deck' ? (
            /* ANGLED DECK SHOWCASE */
            <div 
              ref={carouselRef}
              className="flex items-stretch gap-3 sm:gap-4 lg:gap-5 overflow-x-auto pb-6 pt-2 px-1 scroll-smooth no-scrollbar snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredGames.map(({ game, customCategory }, index) => {
                const genresArr = (game.genres || 'Co-op').split(',').map(s => s.trim()).filter(Boolean);

                return (
                  <motion.div
                    key={`${game.id}-${index}`}
                    onMouseEnter={() => setHoveredGameId(String(game.id))}
                    onMouseLeave={() => setHoveredGameId(null)}
                    onClick={() => onSelectGame(game)}
                    className="group relative shrink-0 w-64 sm:w-72 md:w-80 h-[380px] sm:h-[430px] rounded-2xl overflow-hidden cursor-pointer snap-start border border-slate-300 dark:border-white/10 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 shadow-lg hover:shadow-[0_10px_30px_rgba(245,158,11,0.25)] flex flex-col justify-end bg-slate-950"
                  >
                    {/* Background Game Cover */}
                    <div className="absolute inset-0 bg-slate-950">
                      <img
                        src={game.coverImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'}
                        alt={game.name}
                        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                        loading="lazy"
                      />
                      {/* Vignette gradients */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent opacity-95 group-hover:opacity-90 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
                    </div>

                    {/* Top Cyber Accents: Slanted Rank / Badge & Repacker */}
                    <div className="absolute top-3 inset-x-3 flex items-start justify-between gap-2 z-20">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md transform -skew-x-6">
                          <span className="transform skew-x-6">
                            #{String(index + 1).padStart(2, '0')}
                          </span>
                        </span>
                        {game.repackBy && (
                          <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/15 text-amber-400 text-[10px] font-mono font-bold">
                            {game.repackBy}
                          </span>
                        )}
                      </div>

                      {game.version && (
                        <span className="px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-slate-300 text-[9px] font-mono font-bold truncate max-w-[110px]">
                          {game.version}
                        </span>
                      )}
                    </div>

                    {/* Angular Frame Cutout Accent in Corner */}
                    <div className="absolute bottom-0 end-0 w-8 h-8 bg-amber-500/10 border-b-2 border-e-2 border-amber-500 z-10 pointer-events-none" />

                    {/* Bottom Card Content */}
                    <div className="relative z-20 p-4 sm:p-5 flex flex-col gap-2">
                      
                      {/* Genre Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {t('2 Players')}
                        </span>
                        {customCategory ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            {t(customCategory)}
                          </span>
                        ) : (
                          genresArr.slice(0, 2).map((g, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-slate-200 backdrop-blur-xs">
                              {g}
                            </span>
                          ))
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-black text-white line-clamp-2 drop-shadow-md group-hover:text-amber-400 transition-colors">
                        {game.name}
                      </h3>

                      {/* Repack Size & Rating / Action */}
                      <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs text-slate-400">
                        <span className="font-mono text-slate-300 font-bold">
                          {game.repackSize || 'PC Game'}
                        </span>

                        {/* Interactive Play Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectGame(game);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md group-hover:scale-105 cursor-pointer"
                        >
                          <TbPlayerPlay className="w-3.5 h-3.5 fill-current" />
                          <span>{t('Play Now')}</span>
                        </button>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* RESPONSIVE FULL GRID VIEW WITH PAGINATION */
            <div className="flex flex-col gap-6 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {paginatedGridGames.map(({ game, customCategory }, index) => {
                  const globalIndex = (validGridPage - 1) * GRID_ITEMS_PER_PAGE + index;
                  return (
                    <div
                      key={`${game.id}-${globalIndex}`}
                      onClick={() => onSelectGame(game)}
                      className="group relative rounded-2xl overflow-hidden cursor-pointer border border-slate-300 dark:border-white/10 hover:border-amber-500 transition-all duration-300 bg-slate-950 flex flex-col aspect-[3/4] shadow-md hover:shadow-amber-500/20"
                    >
                      <img
                        src={game.coverImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'}
                        alt={game.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                            2P
                          </span>
                          {customCategory && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-500/40 text-[9px] font-bold truncate max-w-[100px]">
                              {t(customCategory)}
                            </span>
                          )}
                        </div>
                        {game.repackBy && (
                          <span className="px-1.5 py-0.5 rounded bg-black/80 text-amber-400 text-[9px] font-mono">
                            {game.repackBy}
                          </span>
                        )}
                      </div>

                      {/* Bottom info */}
                      <div className="absolute bottom-0 inset-x-0 p-3.5 z-10 flex flex-col gap-1">
                        <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                          {game.name}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{game.repackSize || 'PC Game'}</span>
                          <span className="text-amber-400 font-bold group-hover:underline flex items-center gap-1">
                            <span>{t('Details')}</span>
                            <TbChevronRight className="w-3 h-3 rtl:rotate-180" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION CONTROLS (IF MORE THAN 1 PAGE) */}
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-6 pb-2 border-t border-slate-200 dark:border-white/10">
                  {/* Previous Button */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.max(1, validGridPage - 1))}
                    disabled={validGridPage === 1}
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 shadow-xs"
                  >
                    <TbChevronLeft className="w-4 h-4 rtl:rotate-180" />
                    <span>{t('Prev')}</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      if (
                        totalPages > 7 &&
                        pageNum !== 1 &&
                        pageNum !== totalPages &&
                        Math.abs(pageNum - validGridPage) > 1
                      ) {
                        if (pageNum === 2 || pageNum === totalPages - 1) {
                          return <span key={`twoplayer-dots-${pageNum}`} className="px-1 text-slate-400 font-bold">...</span>;
                        }
                        return null;
                      }

                      const isActive = pageNum === validGridPage;
                      return (
                        <button
                          key={`twoplayer-page-${pageNum}`}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-105 ring-1 ring-amber-400'
                              : 'bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.min(totalPages, validGridPage + 1))}
                    disabled={validGridPage === totalPages}
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 shadow-xs"
                  >
                    <span>{t('Next')}</span>
                    <TbChevronRight className="w-4 h-4 rtl:rotate-180" />
                  </button>

                  {/* Page Indicator */}
                  <div className="w-full text-center text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
                    {t('Page')} {validGridPage} / {totalPages} ({filteredGames.length} {t('Games') || 'games'})
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          /* Empty State */
          <div className="py-16 flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-slate-300 dark:border-white/15 bg-white/50 dark:bg-white/5">
            <TbDeviceGamepad2 className="w-12 h-12 text-amber-500/70 mb-3" />
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {t('No games found')}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-4">
              {t('Try adjusting your search query or reset the filter.')}
            </p>
            {(searchQuery || activeFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
              >
                {t('Reset Filters')}
              </button>
            )}
          </div>
        )}
      </div>

    </section>
  );
};

export default TwoPlayersSection;
