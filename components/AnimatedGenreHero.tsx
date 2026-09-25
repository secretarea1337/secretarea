import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../src/contexts/LanguageContext';
import Icon from './Icon';

interface ResourceItem {
  id: string;
  name: string;
  coverImage: string;
  links?: {
    ankerParts?: any[];
  };
}

interface AnimatedGenreHeroProps {
  onBack: () => void;
  genre: string;
  games: ResourceItem[];
}

const AnimatedGenreHero: React.FC<AnimatedGenreHeroProps> = ({ genre, games, onBack }) => {
  const { t } = useLanguage();
  const { cols, durations, preInstalledCount } = useMemo(() => {
    // 1. Get the count of pre-installed games
    const preInstalledCount = games.filter(g => 
        (g.links?.ankerParts && g.links.ankerParts.length > 0) || 
        ((g.links as any)?.preInstalled?.download || (g.links as any)?.preInstalled?.cloudDrop || (g.links as any)?.preInstalled?.torrent)
    ).length;

    // 2. Prepare the base array (shuffle it once)
    const allGames = [...games].sort(() => 0.5 - Math.random());
    
    // Shift array helper to offset games across columns
    const shiftArray = (arr: ResourceItem[], offset: number) => {
        if (arr.length === 0) return arr;
        const shift = offset % arr.length;
        return [...arr.slice(shift), ...arr.slice(0, shift)];
    };

    // Create 3 offset arrays so all games are in each column but staggered
    const offset2 = Math.max(1, Math.floor(allGames.length / 3));
    const offset3 = Math.max(2, Math.floor((allGames.length * 2) / 3));
    
    const c1 = shiftArray(allGames, 0);
    const c2 = shiftArray(allGames, offset2);
    const c3 = shiftArray(allGames, offset3);

    // Pad arrays so they are long enough for a seamless loop screen-fill
    const padToMin = (col: ResourceItem[], min: number) => {
        if (col.length === 0) return [];
        let padded = [...col];
        while (padded.length < min) {
            padded = [...padded, ...col];
        }
        return padded;
    };

    const minItems = 12; // Minimum items required to ensure the column is taller than the screen
    const b1 = padToMin(c1, minItems);
    const b2 = padToMin(c2, minItems);
    const b3 = padToMin(c3, minItems);

    return {
        preInstalledCount,
        // Duplicate exactly once to allow a seamless 50% translation loop
        cols: [
            [...b1, ...b1], 
            [...b2, ...b2],
            [...b3, ...b3]
        ],
        // Duration proportional to the base length for constant scroll speed
        durations: [
            b1.length * 4.5,
            b2.length * 4.5,
            b3.length * 4.5
        ]
    };
  }, [games]);

  if (games.length === 0) return null;

  // Smart UI for single game
  if (games.length === 1) {
    const singleGame = games[0];
    return (
      <div className="w-full bg-transparent flex flex-col lg:flex-row items-center relative mb-12 min-h-[400px] sm:min-h-[500px] pt-16 sm:pt-20 lg:px-8">
          <div className="w-full lg:w-3/5 xl:w-1/2 px-6 sm:px-8 md:px-12 lg:px-16 pt-0 pb-6 sm:pb-8 z-10 flex flex-col justify-center min-h-[400px] sm:min-h-[500px] relative pointer-events-none before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-slate-50/90 before:via-slate-50/70 before:to-transparent dark:before:from-slate-950/90 dark:before:via-slate-950/70 dark:before:to-transparent before:-z-10">
              <div className="pointer-events-auto w-fit mb-8">
                  <button 
                      onClick={onBack}
                      className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-2 font-bold text-sm uppercase tracking-wider group"
                  >
                      <Icon name="ArrowLeft" size={16} className="rtl:rotate-180 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" /> {t('Back to Dashboard')}
                  </button>
              </div>
              
              <div className="mb-4 relative inline-block text-start pointer-events-auto">
                  <h1 
                      className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] xl:text-[8.5rem] text-slate-900 dark:text-white drop-shadow-2xl uppercase leading-none" 
                      style={{ fontFamily: "'Permanent Marker', cursive", letterSpacing: '0.05em' }}
                  >
                      <span className="text-slate-900 dark:text-white block mb-[-0.1em]">{genre}</span>
                      <span className="text-[#38BDF8]">{t('GAMES')}</span>
                  </h1>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium mb-8 max-w-md">
                  Dive into the ultimate {genre} experience. We found this exclusive masterpiece just for you!
              </p>
          </div>
          
          <div className="w-full md:w-1/2 p-6 sm:p-8 z-10 flex items-center justify-center">
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-100 dark:border-slate-800 transform rotate-2 hover:rotate-0 transition-transform duration-500 group">
                <img src={singleGame.coverImage} alt={singleGame.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <h3 className="text-white font-bold text-2xl drop-shadow-md">{singleGame.name}</h3>
                </div>
                <div className="absolute top-4 end-4 bg-emerald-500 text-white font-black px-3 py-1 rounded-full text-xs uppercase tracking-widest shadow-lg">
                  Featured
                </div>
            </div>
          </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-transparent flex flex-col md:flex-row items-center relative mb-12 min-h-[500px] -mt-16 pt-24 lg:px-8">
        {/* Left Side Content */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-16 z-10 flex flex-col justify-center min-h-[500px] relative pointer-events-none">
            <div className="pointer-events-auto w-fit mb-8">
                <button 
                    onClick={onBack}
                    className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-2 font-bold text-sm uppercase tracking-wider group"
                >
                    <Icon name="ArrowLeft" size={16} className="rtl:rotate-180 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" /> {t('Back to Dashboard')}
                </button>
            </div>
            
            <div className="mb-4 relative inline-block text-start pointer-events-auto">
                <h1 
                    className="text-6xl md:text-8xl lg:text-[8rem] text-slate-900 dark:text-white drop-shadow-2xl uppercase leading-none" 
                    style={{ fontFamily: "'Permanent Marker', cursive", letterSpacing: '0.05em' }}
                >
                    <span className="text-slate-900 dark:text-white block mb-[-0.1em]">{genre}</span>
                    <span className="text-[#38BDF8]">{t('GAMES')}</span>
                </h1>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium mb-8 max-w-md">
                {t('Dive into the best')} {genre} {t('games available. Explore, download, and enjoy hand-picked titles!')}
            </p>
            
            
            
            <div className="flex flex-col xl:flex-row xl:items-end gap-12 xl:gap-24 w-full pointer-events-auto mt-4">
                <div className="flex items-center gap-8">
                    <div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{games.length}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">{t('Total Games')}</div>
                    </div>
                    <div className="w-px h-10 bg-slate-300 dark:bg-slate-800"></div>
                    <div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white flex items-center">
                            <Icon name="Zap" size={24} className="text-emerald-500 me-2" />
                            {preInstalledCount}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">{t('Pre-installed')}</div>
                    </div>
                </div>

                <div className="flex flex-col items-center text-slate-500 dark:text-slate-400 pb-2 xl:mx-auto">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] mb-3">{t('Scroll For Updates')}</span>
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-5 h-8 border-2 border-slate-400 dark:border-slate-500 rounded-full flex justify-center p-1">
                            <motion.div 
                                className="w-1 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full"
                                animate={{ 
                                    y: [0, 8, 0],
                                    opacity: [1, 0, 1]
                                }}
                                transition={{ 
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>
                        <motion.div
                            animate={{ y: [0, 5, 0] }}
                            transition={{ 
                                duration: 1.5, 
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Icon name="ArrowDown" size={14} />
                        </motion.div>
                    </div>
                </div>
            </div>


        </div>

        {/* Right Side Animation */}
        <div 
            className="flex w-full lg:w-1/2 absolute -top-[10vh] -bottom-[10vh] end-0 overflow-hidden px-2 sm:px-4 opacity-30 lg:opacity-100 mask-image-linear-gradient z-0 pointer-events-none"
        >
            <style dangerouslySetInnerHTML={{__html: `
                .mask-image-linear-gradient {
                    mask-image: linear-gradient(to right, transparent 0%, black 40%, black 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
                    mask-composite: intersect;
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 40%, black 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
                    -webkit-mask-composite: source-in;
                }
                @keyframes scroll-up {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
                @keyframes scroll-down {
                    0% { transform: translateY(-50%); }
                    100% { transform: translateY(0); }
                }
                .animate-scroll-up {
                    animation-name: scroll-up;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
                .animate-scroll-down {
                    animation-name: scroll-down;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
                .pause-on-hover:hover {
                    animation-play-state: paused;
                }
            `}} />
            
            {/* Column 1 (Scrolls Up) */}
            <div 
                className="flex-1 flex flex-col h-max animate-scroll-up pause-on-hover pointer-events-auto px-1.5 sm:px-2"
                style={{ animationDuration: `${durations[0]}s` }}
            >
                {cols[0].map((game, idx) => (
                    <div key={'col1-' + idx} className="w-full pb-3 sm:pb-4 shrink-0">
                        <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-white/5 bg-slate-800 transition-transform duration-300 hover:scale-105">
                            <img src={game.coverImage} alt={game.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Column 2 (Scrolls Down) */}
            <div 
                className="flex-1 flex flex-col h-max animate-scroll-down pause-on-hover pointer-events-auto px-1.5 sm:px-2"
                style={{ animationDuration: `${durations[1]}s` }}
            >
                {cols[1].map((game, idx) => (
                    <div key={'col2-' + idx} className="w-full pb-3 sm:pb-4 shrink-0">
                        <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-white/5 bg-slate-800 transition-transform duration-300 hover:scale-105">
                            <img src={game.coverImage} alt={game.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Column 3 (Scrolls Up) - visible on larger screens */}
            <div 
                className="hidden md:flex flex-1 flex-col h-max animate-scroll-up pause-on-hover pointer-events-auto px-1.5 sm:px-2" 
                style={{ 
                    animationDuration: `${durations[2]}s`, 
                    animationDelay: `-${durations[2] / 2}s` 
                }}
            >
                {cols[2].map((game, idx) => (
                    <div key={'col3-' + idx} className="w-full pb-3 sm:pb-4 shrink-0">
                        <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-white/5 bg-slate-800 transition-transform duration-300 hover:scale-105">
                            <img src={game.coverImage} alt={game.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default AnimatedGenreHero;
