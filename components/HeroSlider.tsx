import React, { useState, useEffect } from 'react';
import { useLanguage } from '../src/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

interface ResourceItem {
  id: string;
  category: string;
  name: string;
  version: string;
  repackSize: string;
  originalSize: string;
  genres: string;
  languages: string;
  repackBy: string;
  coverImage: string;
  galleryImages: string[];
  description: string;
  gameId?: string;
  developer?: string;
  dateAdded?: string;
  isFree: boolean;
  links: any;
}

interface HeroSliderProps {
  games: ResourceItem[];
  onSelectGame: (game: ResourceItem, action?: 'download' | 'details') => void;
}

const KNOWN_GAME_WALLPAPERS: Record<string, string> = {
  'grand theft auto': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/ss_32aa18ab3175e3002217862dd5917646d298ab6b.1920x1080.jpg?t=1765387725',
  'gta 5': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/ss_32aa18ab3175e3002217862dd5917646d298ab6b.1920x1080.jpg?t=1765387725',
  'gta v': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/ss_32aa18ab3175e3002217862dd5917646d298ab6b.1920x1080.jpg?t=1765387725',
};

const resolveBackgroundCandidates = (item: ResourceItem | undefined): string[] => {
  if (!item) return ['https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop'];

  const candidates: string[] = [];
  const lowerName = (item.name || '').toLowerCase();

  for (const [key, url] of Object.entries(KNOWN_GAME_WALLPAPERS)) {
    if (lowerName.includes(key)) {
      candidates.push(url);
      break;
    }
  }

  // Safe gallery images (exclude hostnames known to block cross-origin or 404)
  if (item.galleryImages && item.galleryImages.length > 0) {
    item.galleryImages.forEach(img => {
      if (img && !img.includes('wallpaperswide.com') && !img.includes('7wallpapers.net')) {
        candidates.push(img);
      }
    });
  }

  // Pinterest or other gallery fallbacks
  const pin = item.galleryImages?.find(img => img && img.includes('pinimg.com'));
  if (pin && !candidates.includes(pin)) {
    candidates.push(pin);
  }

  // Cover image as reliable fallback
  if (item.coverImage && !candidates.includes(item.coverImage)) {
    candidates.push(item.coverImage);
  }

  // High quality default gaming backdrop
  candidates.push('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop');

  return candidates;
};

const HeroSlider: React.FC<HeroSliderProps> = ({ games, onSelectGame }) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [candidateIndex, setCandidateIndex] = useState(0);

  const scrollToLibrary = () => {
    const el = document.getElementById('secretarea-library');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setCandidateIndex(0);
  }, [currentIndex]);

  useEffect(() => {
    if (games.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [games.length, currentIndex]);

  if (games.length === 0) return null;

  const currentItem = games[currentIndex];
  const candidates = resolveBackgroundCandidates(currentItem);
  const bgImage = candidates[candidateIndex] || candidates[0];

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % games.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + games.length) % games.length);

  const handleImageError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex(prev => prev + 1);
    }
  };

  const hasPreInstallation = (currentItem.links?.ankerParts && currentItem.links.ankerParts.length > 0) || (currentItem.links?.preInstalled?.download || currentItem.links?.preInstalled?.cloudDrop || currentItem.links?.preInstalled?.torrent);

  return (
    <div className="relative w-full min-h-[100svh] md:min-h-[80vh] lg:min-h-[100svh] overflow-hidden bg-slate-100 dark:bg-[#030712] group flex flex-col pt-20 md:pt-24">
      <AnimatePresence initial={false}>
        <motion.div
          key={`${currentIndex}-${candidateIndex}`}
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1.02 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ 
            opacity: { duration: 0.9, ease: "easeInOut" },
            scale: { duration: 9, ease: "easeOut" }
          }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={bgImage} 
            alt={currentItem.name} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
            onError={handleImageError}
          />
          {/* Subtle balanced gradient overlays so background art remains vivid while preserving text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-100/85 via-slate-100/50 to-transparent dark:from-[#030712]/85 dark:via-[#030712]/50 dark:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-100/80 via-transparent to-slate-100/20 dark:from-[#030712]/80 dark:via-transparent dark:to-[#030712]/20" />
        </motion.div>
      </AnimatePresence>

      <div className="flex-1 flex flex-col justify-center relative z-10 w-full px-4 sm:px-10 lg:px-20 xl:px-32 py-8 md:py-12">
<div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center w-full my-auto">
          
          {/* Left Side: Content */}
          <div className="flex flex-col items-start gap-4 sm:gap-6 justify-center order-2 md:order-1 min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[380px]">
             <AnimatePresence mode="wait">
               <motion.div
                 key={currentIndex + '-title'}
                 initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                 animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                 exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                 className="flex flex-col gap-2 w-full min-h-[5rem] sm:min-h-[6rem] md:min-h-[7rem] lg:min-h-[11rem] justify-end"
               >
                 <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-2">
                    <span className="px-2 py-1 bg-emerald-500 text-white font-bold text-[10px] sm:text-xs rounded shadow-sm">
                      v{currentItem.version?.replace(/^v/i, '') || "1.0"}
                    </span>
                    <span className="px-2 py-1 bg-slate-800 border border-slate-700 text-white font-bold text-[10px] sm:text-xs rounded shadow-sm">
                      PC
                    </span>
                    {hasPreInstallation && (
                      <div className="px-2 py-1 bg-indigo-500/20 dark:bg-indigo-500/10 backdrop-blur-md border border-indigo-500/30 dark:border-indigo-400/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)] text-indigo-700 dark:text-indigo-100 rounded text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1">
                          <Icon name="Zap" size={12} className="text-amber-500 dark:text-amber-400" /> <span>Pre-installed</span>
                      </div>
                    )}
                 </div>
                 <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-tight uppercase italic tracking-tight drop-shadow-xl line-clamp-2">
                    {currentItem.name}
                 </h1>
               </motion.div>
             </AnimatePresence>

             <AnimatePresence mode="wait">
               <motion.p
                 key={currentIndex + '-desc'}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                 className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm md:text-base lg:text-lg max-w-xl line-clamp-2 sm:line-clamp-3 lg:line-clamp-4 leading-relaxed font-medium"
               >
                 {currentItem.description || 'No description available for this game.'}
               </motion.p>
             </AnimatePresence>

             <AnimatePresence mode="wait">
               <motion.div
                 key={currentIndex + '-btns'}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                 className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4"
               >
                  <button
                    onClick={() => onSelectGame(currentItem, 'download')}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#38BDF8] hover:bg-[#0EA5E9] text-slate-900 font-bold rounded-lg shadow-lg shadow-[#38BDF8]/30 transition-all active:scale-95 flex items-center gap-2 text-sm sm:text-base"
                  >
                    {t('Download Now')} <Icon name="ArrowRight" size={18} className="rtl:rotate-180" />
                  </button>
                  <button
                    onClick={() => onSelectGame(currentItem, 'details')}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 bg-slate-200/50 hover:bg-slate-300/50 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white backdrop-blur-sm border border-slate-300/50 dark:border-white/10 font-bold rounded-lg transition-all active:scale-95 flex items-center gap-2 text-sm sm:text-base"
                  >
                    {t('Details')} <Icon name="ChevronRight" size={18} className="rtl:rotate-180" />
                  </button>
               </motion.div>
             </AnimatePresence>
          </div>

          {/* Right Side: Game Card / Focus */}
          <div className="flex justify-center md:justify-end items-center perspective-1000 order-1 md:order-2 mb-6 md:mb-0">
             <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex + '-card'}
                  initial={{ opacity: 0, x: 80, rotateY: -25, rotateX: 10, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, rotateY: -10, rotateX: 5, scale: 1 }}
                  exit={{ opacity: 0, x: -80, rotateY: -25, rotateX: 10, scale: 0.9 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="w-48 sm:w-56 md:w-64 lg:w-72 xl:w-[22rem] aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-2 border-white/20 dark:border-white/10 group-hover:border-primary-500/50 transition-colors cursor-pointer mx-auto md:ms-auto md:me-0 relative"
                  onClick={() => onSelectGame(currentItem, 'details')}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <img 
                     src={currentItem.coverImage} 
                     alt={currentItem.name} 
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                     referrerPolicy="no-referrer"
                  />
                  {currentIndex < 3 && (
                      <div className="absolute top-4 end-4 z-20 px-3 py-1 bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-400">
                          NEW
                      </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex items-end p-6">
                     <span className="text-white font-bold tracking-widest uppercase text-xs sm:text-sm drop-shadow-md">
                        {currentItem.genres ? currentItem.genres.split(',')[0] : 'Game'}
                     </span>
                  </div>
                </motion.div>
             </AnimatePresence>
          </div>

      </div>
      </div>

      {/* Slide Navigation & Scroll Indicator (Bottom) */}
      <div className="relative z-20 flex flex-col items-center gap-3 px-4 pb-4 md:pb-6 mt-auto w-full">
        <div className="flex justify-center items-center gap-4 sm:gap-8 w-full">
          {/* Progress Bars */}
          <div className="flex items-center gap-1.5 sm:gap-2 max-w-[200px] sm:max-w-sm w-full">
            {games.map((_, idx) => (
              <div 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className="flex-1 h-1 sm:h-1.5 rounded-full bg-slate-300/50 dark:bg-white/20 cursor-pointer overflow-hidden backdrop-blur-sm transition-all hover:bg-slate-400/50 dark:hover:bg-white/40"
              >
                {idx === currentIndex && (
                  <motion.div 
                    key={'progress-' + idx + '-' + currentIndex}
                    className="h-full bg-[#38BDF8]"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 8, ease: "linear" }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Prev / Next Arrows */}
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={handlePrev}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white flex items-center justify-center backdrop-blur-md transition-colors"
            >
              <Icon name="ChevronLeft" size={18} className="rtl:rotate-180" />
            </button>
            <button 
              onClick={handleNext}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white flex items-center justify-center backdrop-blur-md transition-colors"
            >
              <Icon name="ChevronRight" size={18} className="rtl:rotate-180" />
            </button>
          </div>
        </div>

        {/* Scroll Indicator Button to SecretArea Library */}
        <button
          onClick={scrollToLibrary}
          className="group inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900/95 dark:bg-black/70 dark:hover:bg-black/95 text-slate-200 hover:text-white border border-white/15 hover:border-primary-500/60 shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          title={t('SecretArea Library')}
          aria-label={t('SecretArea Library')}
        >
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">{t('SecretArea Library')}</span>
          <motion.span
            animate={{ y: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="text-primary-400 group-hover:text-primary-300 flex items-center"
          >
            <Icon name="ChevronDown" size={13} />
          </motion.span>
        </button>
      </div>

    </div>
  );
};

export default HeroSlider;
