import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { useLanguage } from '../src/contexts/LanguageContext';

interface GameItem {
  name: string;
  isBest: boolean;
}

interface BestGameSeries {
  id: string;
  category: string;
  images: string[];
  title: string;
  background?: string;
  games?: GameItem[];
}

interface BestGameSeriesSectionProps {
  series: BestGameSeries[];
}

export const BestGameSeriesSection: React.FC<BestGameSeriesSectionProps> = ({ series }) => {
  const { t, dir } = useLanguage();
  const [selectedSeries, setSelectedSeries] = useState<BestGameSeries | null>(null);
  const [showGamesList, setShowGamesList] = useState(false);
  const [gamePage, setGamePage] = useState(0);
  const [seriesPage, setSeriesPage] = useState(0);

  if (!series || series.length === 0) return null;

  const GAMES_PER_PAGE = 10;
  const totalPages = selectedSeries?.games ? Math.ceil(selectedSeries.games.length / GAMES_PER_PAGE) : 0;
  const currentGames = selectedSeries?.games ? selectedSeries.games.slice(gamePage * GAMES_PER_PAGE, (gamePage + 1) * GAMES_PER_PAGE) : [];

  const SERIES_PER_PAGE = 10;
  const totalSeriesPages = Math.ceil(series.length / SERIES_PER_PAGE);
  const currentSeries = series.slice(seriesPage * SERIES_PER_PAGE, (seriesPage + 1) * SERIES_PER_PAGE);
  const paddedSeries = [...currentSeries, ...Array(Math.max(0, SERIES_PER_PAGE - currentSeries.length)).fill(null)];

  return (
    <div className="mt-16 sm:mt-20 md:mt-24 mb-16 sm:mb-20 w-full relative pt-2 sm:pt-4" dir={dir}>
      <div className="flex items-center gap-3 mb-6 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="p-2 bg-slate-200/50 dark:bg-white/10 rounded-xl border border-slate-300 dark:border-white/20 shrink-0">
          <img 
            src="https://media.tenor.com/FtjFEK0l7UQAAAAj/smiling-wolf-smiling-wolf-levin.gif" 
            alt="Wolf" 
            className="w-8 h-8 object-contain dark:invert opacity-80 dark:opacity-100"
          />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 sm:gap-3 flex-wrap">
            {t("The Best Game Series On PC")}
            <motion.span 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={series.length}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center justify-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-md bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-800 dark:text-slate-200 text-xs sm:text-sm md:text-base font-black shadow-sm"
            >
              {series.length}
            </motion.span>
          </h2>
          <p className="text-xs md:text-sm text-slate-700 dark:text-slate-500 dark:text-slate-400 font-medium mt-1">
            {t("Explore the most iconic and critically acclaimed gaming franchises of all time.")}
          </p>
        </div>
      </div>

      {/* Mobile & Tablet Horizontal Touch Carousel (< 1024px) */}
      <div className="lg:hidden w-full relative max-w-[1920px] mx-auto">
        <div
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 sm:px-6 py-2 scroll-smooth"
        >
          {series.map((item, index) => (
            <motion.div
              key={`mobile-series-${item.id}-${index}`}
              onClick={() => {
                setSelectedSeries(item);
                setShowGamesList(false);
                setGamePage(0);
              }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
              className="group relative shrink-0 snap-start w-[44vw] max-w-[185px] sm:w-[210px] md:w-[230px] aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer border border-slate-300/80 dark:border-white/15 bg-slate-900 shadow-lg active:scale-[0.97] transition-all"
            >
              <img
                src={item.images[0] || 'https://placehold.co/300x450/1e293b/334155'}
                alt={item.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-3 text-start">
                {item.category && (
                  <span className="inline-block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-indigo-300 line-clamp-1 mb-0.5">
                    {item.category}
                  </span>
                )}
                <h3 className="text-xs sm:text-sm font-black text-white leading-tight line-clamp-2 drop-shadow-sm">
                  {item.title}
                </h3>
                {item.games && item.games.length > 0 && (
                  <span className="inline-block mt-1 text-[10px] font-mono font-semibold text-slate-300">
                    {item.games.length} {t('Games')}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex sm:hidden justify-center items-center gap-1.5 mt-2">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
            ← {t('Swipe for more')} →
          </span>
        </div>
      </div>

      {/* Laptop & Desktop Expanding Accordion Strips (>= 1024px) */}
      <div className="hidden lg:block w-full relative overflow-hidden group/slider max-w-[1920px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div 
            key={seriesPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex w-full h-[440px] xl:h-[500px]"
          >
            {paddedSeries.map((item, index) => {
              if (!item) {
                return <div key={`empty-${index}`} className="flex-[1] min-w-0 border-e border-slate-900/20 dark:border-white/10 last:border-none opacity-0 pointer-events-none max-w-[333px]" />;
              }
              return (
              <motion.div
                key={`${item.id}-${index}`}
                onClick={() => {
                  setSelectedSeries(item);
                  setShowGamesList(false);
                  setGamePage(0);
                }}
                className="group/strip relative overflow-hidden cursor-pointer border-e border-slate-900/20 dark:border-white/10 last:border-none flex-[1] min-w-0 transition-[flex] duration-500 ease-out hover:flex-[20] max-w-[333px]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-300 group-hover/strip:brightness-110"
                  style={{ backgroundImage: `url(${item.images[0] || 'https://placehold.co/300x800/1e293b/334155'})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover/strip:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-start pointer-events-none">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 truncate">{item.category}</span>
                  <h3 className="text-lg font-black text-white leading-tight truncate">{item.title}</h3>
                </div>
              </motion.div>
            )})}
          </motion.div>
        </AnimatePresence>
      </div>

      {totalSeriesPages > 1 && (
        <div className="hidden lg:flex items-center justify-center gap-4 mt-6 px-4">
          <button 
            onClick={() => setSeriesPage(p => Math.max(0, p - 1))}
            disabled={seriesPage === 0}
            aria-label={t('Previous Page')}
            className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Icon name="ChevronLeft" size={24} className="rtl:rotate-180" />
          </button>
          <div className="text-sm font-bold text-slate-700 dark:text-slate-400">
            {seriesPage + 1} / {totalSeriesPages}
          </div>
          <button 
            onClick={() => setSeriesPage(p => Math.min(totalSeriesPages - 1, p + 1))}
            disabled={seriesPage === totalSeriesPages - 1}
            aria-label={t('Next Page')}
            className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Icon name="ChevronRight" size={24} className="rtl:rotate-180" />
          </button>
        </div>
      )}

      {createPortal(
        <AnimatePresence>
          {selectedSeries && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              dir={dir} className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 dark:bg-black/95 p-0 backdrop-blur-xl transition-colors duration-300"
              onClick={() => setSelectedSeries(null)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300"
                onClick={e => e.stopPropagation()}
              >
                {selectedSeries.background && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-[0.15] dark:opacity-10 pointer-events-none mix-blend-multiply dark:mix-blend-luminosity" 
                    style={{ backgroundImage: `url(${selectedSeries.background})` }}
                  />
                )}
                
                <div className="flex items-start sm:items-center justify-between p-4 sm:p-6 sm:pb-4 shrink-0 bg-white/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/5 sticky top-0 z-20 backdrop-blur-md transition-colors duration-300">
                  <div className="pe-4 relative z-10">
                    <h3 className="text-xl sm:text-2xl md:text-4xl font-black text-slate-900 dark:text-white transition-colors duration-300">{selectedSeries.title}</h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase text-xs sm:text-sm mt-1 transition-colors duration-300">{selectedSeries.category}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedSeries(null)}
                    className="p-2 sm:p-3 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white rounded-full backdrop-blur transition-colors shrink-0 relative z-10"
                  >
                    <Icon name="X" size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative z-10 p-2 sm:p-6 md:p-8 gap-4 sm:gap-6 no-scrollbar">
                  {selectedSeries.games && selectedSeries.games.length > 0 && (
                    <div className="w-full shrink-0 flex flex-col">
                      <button 
                        onClick={() => setShowGamesList(!showGamesList)}
                        className="flex items-center justify-between w-full p-3 sm:p-4 bg-slate-200/50 dark:bg-white/5 hover:bg-slate-300/50 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 rounded-xl transition-colors duration-300 mb-2"
                      >
                        <h4 className="text-slate-900 dark:text-white font-bold flex items-center gap-2 transition-colors duration-300">
                          <Icon name="List" size={18} className="text-indigo-500 dark:text-indigo-400" />
                          {t('Games in Series')}
                        </h4>
                        <Icon name={showGamesList ? "ChevronUp" : "ChevronDown"} size={20} className="text-slate-700 dark:text-slate-500 dark:text-slate-400" />
                      </button>
                      <AnimatePresence>
                        {showGamesList && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="relative pt-2">
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={gamePage}
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                  transition={{ duration: 0.2 }}
                                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 pb-2"
                                >
                                  {currentGames.map((game, idx) => (
                                    <div key={idx} className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors flex items-start sm:items-center justify-between gap-2 sm:gap-3 group/game min-w-0">
                                      <span className={`text-sm md:text-base leading-tight flex-1 break-words transition-colors duration-300 ${game.isBest ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-300'}`}>{game.name}</span>
                                      {game.isBest && (
                                        <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/30 shrink-0 mt-0.5 sm:mt-0">
                                          <Icon name="Star" size={12} className="fill-white hidden sm:block" />
                                          <Icon name="Star" size={10} className="fill-white sm:hidden" />
                                          Best
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </motion.div>
                              </AnimatePresence>

                              {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-3 px-1 pb-2">
                                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-500 dark:text-slate-400">
                                    {t('PAGE')} {gamePage + 1} {t('OF')} {totalPages}
                                  </div>
                                  <div className="flex gap-2">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setGamePage(p => Math.max(0, p - 1)); }}
                                        disabled={gamePage === 0}
                                        className="p-1.5 rounded-lg bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-300 dark:hover:bg-white/10 transition-colors"
                                      >
                                        <Icon name="ChevronLeft" size={16} className="rtl:rotate-180" />
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setGamePage(p => Math.min(totalPages - 1, p + 1)); }}
                                        disabled={gamePage === totalPages - 1}
                                        className="p-1.5 rounded-lg bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-300 dark:hover:bg-white/10 transition-colors"
                                      >
                                        <Icon name="ChevronRight" size={16} className="rtl:rotate-180" />
                                      </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  
                  <div className="shrink-0 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-black/50 p-3 sm:p-6 transition-colors duration-300">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
                      {selectedSeries.images.map((img, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="relative rounded-xl overflow-hidden aspect-[2/3] bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-white/5 transition-colors duration-300"
                        >
                          <img 
                            src={img} 
                            alt={`${selectedSeries.title} - Image ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                               const p = e.currentTarget.parentElement; if(p) p.style.display = 'none';
                            }}
                          />
                        </motion.div>
                      ))}
                      {selectedSeries.images.length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 dark:text-slate-500">
                          <Icon name="Image" size={48} className="mb-4 opacity-50" />
                          <p>{t('No additional images available for this series.')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <style>{`
        /* Responsive widths for the carousel items - overridden on large screens by flex-1 */
        @media (min-width: 640px) {
          .snap-center {
            width: 160px;
          }
        }
        @media (min-width: 1024px) {
          .snap-center {
            width: auto; /* flex takes over */
          }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

