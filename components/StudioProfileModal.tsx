import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../src/contexts/LanguageContext';
import Icon from './Icon';
import { FaPlaystation } from 'react-icons/fa';
import { StudioProfile } from './TopStudiosSection';

export interface StudioResourceItem {
  id: string;
  name: string;
  category: string;
  coverImage: string;
  version?: string;
  repackBy?: string;
  developer?: string;
  genre?: string;
  size?: string;
  rating?: number;
  [key: string]: any;
}

interface StudioProfileModalProps {
  profile: StudioProfile;
  resources: StudioResourceItem[];
  onClose: () => void;
  onItemClick: (item: StudioResourceItem) => void;
}

export const StudioProfileModal: React.FC<StudioProfileModalProps> = ({
  profile,
  resources,
  onClose,
  onItemClick,
}) => {
  const { dir, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [imgError, setImgError] = useState(false);
  const itemsPerPage = 24;

  useEffect(() => {
    setImgError(false);
  }, [profile.logoUrl]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(resources.map(r => r.category).filter(Boolean)));
  }, [resources]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const matchesCategory = activeCategory === 'all' || r.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (r.genre && r.genre.toLowerCase().includes(searchQuery.toLowerCase().trim()));
      return matchesCategory && matchesSearch;
    });
  }, [resources, activeCategory, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage) || 1;
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResources.slice(start, start + itemsPerPage);
  }, [filteredResources, currentPage, itemsPerPage]);

  // Statistics counters
  const pcCount = useMemo(() => resources.filter(r => r.category === 'game').length, [resources]);
  const steamCount = useMemo(() => resources.filter(r => r.category === 'steamtools').length, [resources]);
  const ps5Count = useMemo(() => resources.filter(r => r.category === 'ps5').length, [resources]);
  const hvCount = useMemo(() => resources.filter(r => r.category === 'hypervisor').length, [resources]);

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        dir={dir}
        className="fixed inset-0 z-[9999] flex flex-col bg-slate-50 dark:bg-[#070b14] overflow-hidden"
      >
        {/* Studio Hero Header */}
        <div className="relative shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0b101d]/95 backdrop-blur-md">
          {/* Subtle ambient glow in header */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-blue-500/5 to-purple-500/10 pointer-events-none"></div>

          <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 max-w-7xl mx-auto w-full">
            {/* Studio Identity lockup */}
            <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
              <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex items-center justify-center p-3 relative group">
                {!imgError && profile.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain filter dark:brightness-110"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-2xl text-slate-400 dark:text-slate-500 uppercase">
                    {profile.name.substring(0, 2)}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                    <Icon name="CheckCheck" size={12} />
                    <span>{t('Verified Studio')}</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    {resources.length} {t('Total Releases')}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                  {profile.name}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed max-w-3xl">
                  {profile.description ||
                    t("Welcome to this company's profile. Explore their ecosystem of products and releases below.")}
                </p>

                {/* Quick Platform Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  {pcCount > 0 && (
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded">
                      <Icon name="Gamepad2" size={13} className="text-amber-500" />
                      <span>{pcCount} PC</span>
                    </span>
                  )}
                  {steamCount > 0 && (
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded">
                      <Icon name="BrandSteam" size={13} className="text-blue-500" />
                      <span>{steamCount} Steam</span>
                    </span>
                  )}
                  {ps5Count > 0 && (
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded">
                      <FaPlaystation size={13} className="text-indigo-500" />
                      <span>{ps5Count} PS5</span>
                    </span>
                  )}
                  {hvCount > 0 && (
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded">
                      <span className="text-red-500 font-bold text-[10px]">HV</span>
                      <span>{hvCount} Hypervisor</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 self-start md:self-center shrink-0"
              aria-label="Close Studio Profile"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#070b14]/60 px-4 sm:px-6 lg:px-8 py-3">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Category Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeCategory === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{t('All Releases')}</span>
                  <span className={`text-[10px] font-mono px-1 rounded ${activeCategory === 'all' ? 'bg-indigo-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                    {resources.length}
                  </span>
                </button>

                {categories.map(cat => {
                  const count = resources.filter(r => r.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        activeCategory === cat
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <span>{t(cat === 'steamtools' ? 'SteamTools' : cat)}</span>
                      <span className={`text-[10px] font-mono px-1 rounded ${activeCategory === cat ? 'bg-indigo-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* In-Studio Search Input */}
              <div className="relative w-full sm:w-64 shrink-0">
                <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 pointer-events-none">
                  <Icon name="Search" size={14} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('Search games from this studio...')}
                  className="w-full ps-8 pe-8 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-600 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-600"
                  >
                    <Icon name="X" size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Body: Games Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {currentItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                {currentItems.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    onClick={() => onItemClick(item)}
                    className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-1 relative aspect-[9/14] flex flex-col justify-end"
                  >
                    {/* Cover Art */}
                    <img
                      src={item.coverImage}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Gradient Scrim for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60 pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-2 inset-x-2 flex justify-between items-start gap-1 z-10">
                      <div className="flex items-center gap-1 flex-wrap">
                        {item.category === 'hypervisor' && (
                          <div className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow">
                            HV
                          </div>
                        )}
                        {item.category === 'steamtools' && (
                          <div className="bg-[#171a21] text-[#66c0f4] p-1 rounded shadow border border-[#2a475e]">
                            <Icon name="BrandSteam" size={12} />
                          </div>
                        )}
                        {item.category === 'ps5' && (
                          <div className="bg-indigo-900 text-white p-1 rounded shadow border border-indigo-500/30">
                            <FaPlaystation size={12} />
                          </div>
                        )}
                        {item.category === 'game' && (
                          <div className="bg-slate-900/90 text-amber-400 px-1.5 py-0.5 rounded shadow border border-amber-500/30 flex items-center gap-1 text-[8px] font-bold">
                            <Icon name="Package" size={11} />
                            {item.repackBy && <span className="font-mono text-[7px]">{item.repackBy}</span>}
                          </div>
                        )}
                      </div>

                      {item.version && item.category !== 'steamtools' && (
                        <div className="bg-black/75 backdrop-blur-sm text-slate-200 border border-slate-700 px-1.5 py-0.5 rounded text-[7px] font-mono font-bold truncate max-w-[80px]">
                          {item.version}
                        </div>
                      )}
                    </div>

                    {/* Bottom Info Lockup */}
                    <div className="relative z-10 p-3">
                      <h4 className="text-white text-xs sm:text-sm font-bold line-clamp-2 leading-snug drop-shadow-md group-hover:text-indigo-400 transition-colors">
                        {item.name}
                      </h4>
                      {item.genre && (
                        <p className="text-[10px] text-slate-300 font-medium truncate mt-0.5">
                          {item.genre}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/40 dark:bg-slate-900/30">
                <Icon name="Search" size={40} className="text-slate-600 dark:text-slate-300 mb-3" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('No games found for this studio')}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {t('Try adjusting your search query or reset the filter.')}
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                >
                  {t('Reset Filters')}
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-1.5 pb-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Icon name="ChevronLeft" size={16} className="rtl:rotate-180" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Icon name="ChevronRight" size={16} className="rtl:rotate-180" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default StudioProfileModal;
