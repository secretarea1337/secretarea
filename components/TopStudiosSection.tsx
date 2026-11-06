import React, { useState, useMemo } from 'react';
import { useLanguage } from '../src/contexts/LanguageContext';
import Icon from './Icon';

export interface StudioProfile {
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

interface TopStudiosSectionProps {
  profiles: StudioProfile[];
  onOpenAllStudios: () => void;
  onSelectStudio: (profile: StudioProfile) => void;
}

// Studio Ecosystem tagging helper
export const getStudioEcosystem = (name: string): ('xbox' | 'playstation' | 'aaa' | 'japanese' | 'indie')[] => {
  const n = (name || '').toLowerCase();
  const tags: ('xbox' | 'playstation' | 'aaa' | 'japanese' | 'indie')[] = [];

  // Xbox ecosystem studios (including acquisitions)
  if (
    n.includes('xbox') || n.includes('playground') || n.includes('turn 10') ||
    n.includes('obsidian') || n.includes('ninja theory') || n.includes('mojang') ||
    n.includes('343') || n.includes('bethesda') || n.includes('id software') ||
    n.includes('arkane') || n.includes('machinegames') || n.includes('rare') ||
    n.includes('coalition') || n.includes('undead labs') || n.includes('double fine') ||
    n.includes('compulsion') || n.includes('tango') || n.includes('infinity ward') ||
    n.includes('treyarch') || n.includes('sledgehammer') || n.includes('raven') ||
    n.includes('activision') || n.includes('blizzard') || n.includes('toys for bob')
  ) {
    tags.push('xbox');
  }

  // PlayStation Studios
  if (
    n.includes('playstation') || n.includes('naughty dog') || n.includes('insomniac') ||
    n.includes('santa monica') || n.includes('sucker punch') || n.includes('guerrilla') ||
    n.includes('bend studio') || n.includes('polyphony') || n.includes('housemarque') ||
    n.includes('bluepoint')
  ) {
    tags.push('playstation');
  }

  // Japanese Masters
  if (
    n.includes('capcom') || n.includes('fromsoftware') || n.includes('from software') ||
    n.includes('bandai') || n.includes('square enix') || n.includes('konami') ||
    n.includes('sega') || n.includes('atlus') || n.includes('team ninja') ||
    n.includes('koei') || n.includes('kojima') || n.includes('game science') ||
    n.includes('ryu ga gotoku') || n.includes('spike chunsoft') || n.includes('nintendo')
  ) {
    tags.push('japanese');
  }

  // AAA Industry Giants
  if (
    n.includes('rockstar') || n.includes('ubisoft') || n.includes('electronic arts') ||
    n.includes('ea') || n.includes('cd projekt') || n.includes('2k') ||
    n.includes('warner') || n.includes('remedy') || n.includes('techland') ||
    n.includes('valve') || n.includes('dice') || n.includes('io interactive')
  ) {
    tags.push('aaa');
  }

  // Indie or Acclaimed
  if (tags.length === 0) {
    tags.push('indie');
  }

  return tags;
};

export const TopStudiosSection: React.FC<TopStudiosSectionProps> = ({
  profiles,
  onOpenAllStudios,
  onSelectStudio,
}) => {
  const { dir, t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<'all' | 'xbox' | 'playstation' | 'aaa' | 'japanese'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate totals and enrich studios
  const enrichedStudios = useMemo(() => {
    return profiles
      .map(p => {
        const totalCount =
          (p.gameIds?.length || 0) +
          (p.hypervisorIds?.length || 0) +
          (p.steamtoolsIds?.length || 0) +
          (p.ps5Ids?.length || 0);
        const ecosystems = getStudioEcosystem(p.name);
        return {
          ...p,
          totalCount,
          ecosystems,
        };
      })
      .filter(p => p.totalCount > 0)
      .sort((a, b) => b.totalCount - a.totalCount);
  }, [profiles]);

  // Filtered list
  const filteredStudios = useMemo(() => {
    return enrichedStudios.filter(s => {
      const matchesFilter = activeFilter === 'all' || s.ecosystems.includes(activeFilter);
      const matchesSearch =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesFilter && matchesSearch;
    });
  }, [enrichedStudios, activeFilter, searchQuery]);

  // Top showcased slice (first 18 for high impact mosaic)
  const displayStudios = filteredStudios.slice(0, 18);

  const filterTabs = [
    { id: 'all', label: t('All Studios'), count: enrichedStudios.length },
    { id: 'xbox', label: t('Xbox Ecosystem'), count: enrichedStudios.filter(s => s.ecosystems.includes('xbox')).length },
    { id: 'playstation', label: t('PlayStation Studios'), count: enrichedStudios.filter(s => s.ecosystems.includes('playstation')).length },
    { id: 'aaa', label: t('AAA Giants'), count: enrichedStudios.filter(s => s.ecosystems.includes('aaa')).length },
    { id: 'japanese', label: t('Japanese Masters'), count: enrichedStudios.filter(s => s.ecosystems.includes('japanese')).length },
  ];

  return (
    <section 
      dir={dir} 
      className="w-full relative mt-16 mb-24 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070b14] shadow-2xl transition-colors duration-300"
    >
      {/* Background Ambience inspired by the Xbox Studios banner */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] dark:opacity-[0.06]"></div>
        {/* Radial ambient glow */}
        <div className="absolute -top-40 start-1/4 w-[600px] h-[300px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 end-1/4 w-[600px] h-[300px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl"></div>
        {/* Gradient scrim overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/5 dark:to-black/60"></div>
      </div>

      <div className="relative z-10 p-6 sm:p-8 lg:p-12">
        {/* Top Marquee Header: Inspired by the Xbox Game Studios + Activision + Blizzard banner */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-400 text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <Icon name="Gamepad2" size={15} />
            <span>{t('Top Studios & Publishers')}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
            {t('THE WORLD’S GREATEST STUDIOS')}
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl font-medium leading-relaxed">
            {t('We brought the best games from the best studios.')}
          </p>

          {/* Titan Publishers Showcase Strip (direct homage to screenshot header) */}
          <div className="mt-8 w-full py-4 px-4 sm:px-8 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <Icon name="BrandXbox" size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span>Xbox Game Studios</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-light">+</span>
            <span className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">PS</span>
              <span>PlayStation Studios</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-light">+</span>
            <span className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              Bethesda
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-light">+</span>
            <span className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              Rockstar Games
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-light">+</span>
            <span className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
              Capcom
            </span>
          </div>
        </div>

        {/* Horizontal Hairline Divider Rail (like the screenshot) */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-[#070b14] px-4 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
              {t('Featured First-Party & Titan Studios')}
            </span>
          </div>
        </div>

        {/* Filter Bar & Quick Search (Responsive: horizontal scroll on mobile, flex on desktop) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Segmented Filter Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-2 text-xs font-bold rounded-lg whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
                  activeFilter === tab.id
                    ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-indigo-500'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeFilter === tab.id
                    ? 'bg-slate-100 dark:bg-indigo-700 text-slate-800 dark:text-white'
                    : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 pointer-events-none">
              <Icon name="Search" size={15} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('Search studios or games...')}
              className="w-full ps-9 pe-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-600 dark:text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
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
        </div>

        {/* Studios Grid: Inspired by the screenshot's multi-column studio rows */}
        {displayStudios.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {displayStudios.map((studio) => {
              return (
                <div
                  key={studio.id}
                  onClick={() => onSelectStudio(studio)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectStudio(studio);
                    }
                  }}
                  className="group relative flex flex-col items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/60 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer text-center"
                >
                  {/* Subtle top indicator for studio category */}
                  <div className="w-full flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {studio.ecosystems[0] === 'xbox' ? 'Xbox' : studio.ecosystems[0] === 'playstation' ? 'PS' : studio.ecosystems[0] === 'japanese' ? 'JP' : 'AAA'}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-800/80 px-1.5 py-0.5 rounded">
                      {studio.totalCount} {t('Games')}
                    </span>
                  </div>

                  {/* Studio Logo container (crisp contrast on both light and dark) */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-slate-950 rounded-xl flex items-center justify-center p-2.5 my-2 border border-slate-200/60 dark:border-slate-800 shadow-inner group-hover:scale-105 group-hover:border-indigo-500/40 transition-all overflow-hidden">
                    {studio.logoUrl ? (
                      <img
                        src={studio.logoUrl}
                        alt={studio.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain filter dark:brightness-110 group-hover:contrast-105 transition-all"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `<span class="font-black text-lg text-slate-600 dark:text-slate-400 group-hover:text-indigo-500">${studio.name.substring(0, 2).toUpperCase()}</span>`;
                          }
                        }}
                      />
                    ) : (
                      <span className="font-black text-lg text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 uppercase">
                        {studio.name.substring(0, 2)}
                      </span>
                    )}
                  </div>

                  {/* Studio Name */}
                  <div className="w-full mt-2">
                    <h3 
                      className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" 
                      title={studio.name}
                    >
                      {studio.name}
                    </h3>
                  </div>

                  {/* Hover action indicator */}
                  <div className="mt-2.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <span>{t('Explore Catalog')}</span>
                    <Icon name="ArrowRight" size={11} className="rtl:rotate-180" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Icon name="Search" size={36} className="mx-auto text-slate-600 dark:text-slate-300 mb-3" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">{t('No studios match your filter')}</h4>
            <button
              onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
              className="mt-3 px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {t('Clear Filter')}
            </button>
          </div>
        )}

        {/* Second Horizontal Divider Rail */}
        <div className="my-8 border-t border-slate-200 dark:border-slate-800"></div>

        {/* Bottom CTA Row: Open All Studios Directory */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 text-center sm:text-start">
            <span className="font-bold text-slate-900 dark:text-white">{enrichedStudios.length}+</span> {t('Leading developers by released items')}
          </div>

          <button
            onClick={onOpenAllStudios}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2.5 shrink-0"
          >
            <Icon name="Trophy" size={18} />
            <span>{t('Explore All Studios')}</span>
            <Icon name="ArrowRight" size={16} className="rtl:rotate-180" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopStudiosSection;
