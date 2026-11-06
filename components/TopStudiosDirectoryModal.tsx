import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../src/contexts/LanguageContext';
import Icon from './Icon';
import { StudioProfile, getStudioEcosystem } from './TopStudiosSection';

interface TopStudiosDirectoryModalProps {
  isOpen?: boolean;
  profiles: StudioProfile[];
  onClose: () => void;
  onSelect: (profile: StudioProfile) => void;
  categoryType: 'games' | 'tools';
}

export const TopStudiosDirectoryModal: React.FC<TopStudiosDirectoryModalProps> = ({
  isOpen = true,
  profiles,
  onClose,
  onSelect,
  categoryType,
}) => {
  const { dir, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'xbox' | 'playstation' | 'aaa' | 'japanese'>('all');
  const [sortBy, setSortBy] = useState<'most' | 'az'>('most');
  const [currentPage, setCurrentPage] = useState(1);
  const PROFILES_PER_PAGE = 24;

  // Enrich with totals and ecosystems
  const enrichedProfiles = useMemo(() => {
    return profiles
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
        const ecosystems = getStudioEcosystem(p.name);
        return {
          ...p,
          totalGames: count,
          ecosystems,
        };
      })
      .filter(p => p.totalGames > 0);
  }, [profiles, categoryType]);

  // Filter & Sort
  const filteredProfiles = useMemo(() => {
    let result = enrichedProfiles.filter(p => {
      const matchesFilter = selectedFilter === 'all' || p.ecosystems.includes(selectedFilter);
      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesFilter && matchesSearch;
    });

    if (sortBy === 'most') {
      result.sort((a, b) => b.totalGames - a.totalGames);
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [enrichedProfiles, selectedFilter, searchQuery, sortBy]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilter, sortBy]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const totalPages = Math.ceil(filteredProfiles.length / PROFILES_PER_PAGE) || 1;
  const paginatedProfiles = useMemo(() => {
    const start = (currentPage - 1) * PROFILES_PER_PAGE;
    return filteredProfiles.slice(start, start + PROFILES_PER_PAGE);
  }, [filteredProfiles, currentPage, PROFILES_PER_PAGE]);

  const filterTabs = [
    { id: 'all', label: t('All Studios'), count: enrichedProfiles.length },
    { id: 'xbox', label: t('Xbox Ecosystem'), count: enrichedProfiles.filter(p => p.ecosystems.includes('xbox')).length },
    { id: 'playstation', label: t('PlayStation Studios'), count: enrichedProfiles.filter(p => p.ecosystems.includes('playstation')).length },
    { id: 'aaa', label: t('AAA Giants'), count: enrichedProfiles.filter(p => p.ecosystems.includes('aaa')).length },
    { id: 'japanese', label: t('Japanese Masters'), count: enrichedProfiles.filter(p => p.ecosystems.includes('japanese')).length },
  ];

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        dir={dir}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-[#090d16] text-slate-900 dark:text-slate-100 w-full max-w-7xl h-[94vh] max-h-[960px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#0e1424] shrink-0">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-blue-500/5 to-transparent pointer-events-none"></div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Icon name="Briefcase" size={22} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{categoryType === 'games' ? t('Game Studios Directory') : t('All Companies')}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-mono font-bold">
                      {filteredProfiles.length}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium line-clamp-1">
                    {t('Browse the world’s most renowned gaming powerhouses, first-party studios, and legendary developers.')}
                  </p>
                </div>
              </div>

              {/* Action Affordances: Search & Close */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 pointer-events-none">
                    <Icon name="Search" size={16} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('Search studios or games...')}
                    className="w-full ps-9 pe-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-600 dark:text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="p-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shrink-0"
                  aria-label="Close"
                >
                  <Icon name="X" size={18} />
                </button>
              </div>
            </div>

            {/* Filter Tabs & Sort Selector */}
            <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 md:pb-0">
                {filterTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedFilter(tab.id as any)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
                      selectedFilter === tab.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] font-mono px-1 rounded ${
                      selectedFilter === tab.id ? 'bg-indigo-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSortBy('most')}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    sortBy === 'most'
                      ? 'bg-slate-200 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {t('Sort by: Most Games')}
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  onClick={() => setSortBy('az')}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    sortBy === 'az'
                      ? 'bg-slate-200 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {t('Sort by: Name (A-Z)')}
                </button>
              </div>
            </div>
          </div>

          {/* Grid Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-[#070b14] custom-scrollbar">
            {paginatedProfiles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {paginatedProfiles.map(profile => (
                  <div
                    key={profile.id}
                    onClick={() => onSelect(profile)}
                    className="group relative bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/60 rounded-2xl p-4 flex flex-col items-center justify-between text-center cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200"
                  >
                    {/* Ecosystem / Items counter */}
                    <div className="w-full flex items-center justify-between text-[10px] mb-2 font-bold text-slate-600 dark:text-slate-300">
                      <span className="text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[9px]">
                        {profile.ecosystems[0] || 'Studio'}
                      </span>
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {profile.totalGames}
                      </span>
                    </div>

                    {/* Logo */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center p-2.5 my-2 border border-slate-100 dark:border-slate-800/80 group-hover:scale-105 group-hover:border-indigo-500/30 transition-all shadow-inner overflow-hidden">
                      {profile.logoUrl ? (
                        <img
                          src={profile.logoUrl}
                          alt={profile.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain filter dark:brightness-110 group-hover:contrast-105 transition-all"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="font-black text-lg text-slate-600 dark:text-slate-400 group-hover:text-indigo-500">${profile.name.substring(0, 2).toUpperCase()}</span>`;
                            }
                          }}
                        />
                      ) : (
                        <span className="font-black text-lg text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 uppercase">
                          {profile.name.substring(0, 2)}
                        </span>
                      )}
                    </div>

                    {/* Studio Name */}
                    <div className="w-full mt-2">
                      <h4
                        className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                        title={profile.name}
                      >
                        {profile.name}
                      </h4>
                    </div>

                    {/* Action */}
                    <div className="mt-2 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>{t('Explore Catalog')}</span>
                      <Icon name="ArrowRight" size={11} className="rtl:rotate-180" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-center p-6">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-4">
                  <Icon name="Search" size={28} />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {t('No Profiles Found')}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mb-4">
                  {t('Try adjusting your search criteria.')}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedFilter('all');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  {t('Clear Filter')}
                </button>
              </div>
            )}
          </div>

          {/* Footer / Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1424] flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium hidden sm:block">
                <span>{t('Showing')} </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {(currentPage - 1) * PROFILES_PER_PAGE + 1}
                </span>
                <span> - </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {Math.min(currentPage * PROFILES_PER_PAGE, filteredProfiles.length)}
                </span>
                <span> {t('of')} </span>
                <span className="font-bold text-slate-900 dark:text-white">{filteredProfiles.length}</span>
              </div>

              <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Previous Page"
                >
                  <Icon name="ChevronLeft" size={16} className="rtl:rotate-180" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && page - prev > 1;
                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="px-1 text-slate-400">…</span>}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Next Page"
                >
                  <Icon name="ChevronRight" size={16} className="rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default TopStudiosDirectoryModal;
