import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { DUAS, Dua } from '../data/duas';

export const DuaPopup: React.FC = () => {
    const [currentDua, setCurrentDua] = useState<Dua | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [progress, setProgress] = useState(100);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const DURATION = 15000;

    useEffect(() => {
        if (localStorage.getItem('duaPopupDisabled') === 'true') {
            return;
        }

        // Initialize audio – soft notification dot type sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.4;
        audioRef.current = audio;

        // Unlock audio on first user interaction for strict browsers (Safari/Mobile)
        const unlockAudio = () => {
            if (audioRef.current) {
                audioRef.current.volume = 0; // mute for unlock
                audioRef.current.play().then(() => {
                    audioRef.current!.pause();
                    audioRef.current!.currentTime = 0;
                    audioRef.current!.volume = 0.4; // restore volume
                }).catch(() => {});
            }
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
            document.removeEventListener('scroll', unlockAudio);
        };

        document.addEventListener('click', unlockAudio, { once: true });
        document.addEventListener('touchstart', unlockAudio, { once: true });
        document.addEventListener('keydown', unlockAudio, { once: true });
        document.addEventListener('scroll', unlockAudio, { once: true });

        // Show first dua after 3 seconds of load
        const initialTimer = setTimeout(() => {
            showRandomDua();
        }, 3000);

        // Show a new random dua every 15 minutes (900000ms)
        const interval = setInterval(() => {
            showRandomDua();
        }, 900000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    // Progress bar and auto-hide logic
    useEffect(() => {
        if (!isVisible || isHovered) return;

        const tick = 50; // update every 50ms
        const step = (tick / DURATION) * 100;

        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev - step;
                if (next <= 0) {
                    setIsVisible(false);
                    return 0;
                }
                return next;
            });
        }, tick);

        return () => clearInterval(interval);
    }, [isVisible, isHovered]);

    const showRandomDua = () => {
        if (localStorage.getItem('duaPopupDisabled') === 'true') return;

        const randomIndex = Math.floor(Math.random() * DUAS.length);
        setCurrentDua(DUAS[randomIndex]);
        setProgress(100);
        setIsVisible(true);
        setIsHovered(false);
        
        // Play notification sound
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
        }
    };

    return (
        <AnimatePresence>
            {isVisible && currentDua && (
                <motion.div
                    initial={{ opacity: 0, x: 100, y: 50, scale: 0.9, rotate: -5 }}
                    animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, x: 100, scale: 0.9, filter: 'blur(5px)' }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
                    className="fixed bottom-4 end-4 sm:bottom-6 sm:end-6 z-[100] w-[calc(100vw-2rem)] sm:w-[380px] md:w-[420px] bg-white/95 dark:bg-slate-900/95 md:backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-200/50 dark:border-slate-700/50 overflow-hidden"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onTouchStart={() => setIsHovered(true)}
                    onTouchEnd={() => setIsHovered(false)}
                >
                    <div className="absolute top-0 start-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
                        <div 
                            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"
                            style={{ width: `${progress}%`, transition: 'width 50ms linear' }}
                        ></div>
                    </div>
                    
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="absolute top-3 end-3 p-1.5 rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 z-10"
                    >
                        <Icon name="X" size={14} />
                    </button>

                    <button 
                        onClick={() => {
                            localStorage.setItem('duaPopupDisabled', 'true');
                            setIsVisible(false);
                        }}
                        className="absolute top-3 start-3 px-2 py-1 rounded bg-slate-100/50 dark:bg-slate-800/50 text-[10px] text-slate-700 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 z-10"
                    >
                        Don't show again
                    </button>
                    
                    <div className="p-5 sm:p-6 pb-4 flex flex-col items-center justify-center space-y-3 relative">
                        <div className="absolute -top-6 -start-6 opacity-5 pointer-events-none transform rotate-[-20deg]">
                            <Icon name="BuildingMosque" size={120} className="text-current" />
                        </div>

                        <div className="text-xl sm:text-2xl font-arabic font-bold text-slate-900 dark:text-white leading-[2] tracking-wide rtl text-center px-4 pt-1 pb-3 max-h-[140px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] whitespace-pre-line" style={{ fontFamily: '"Amiri", "Scheherazade New", serif' }}>
                            {currentDua.arabic}
                        </div>
                        
                        <div className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 text-center max-h-[100px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            « {currentDua.english} »
                        </div>
                        
                        <div className="pt-3 w-full flex flex-col items-center gap-2 mt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                            <div className="flex items-center gap-2 mt-2">
                                <span className="inline-block px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 border-b border-indigo-200 dark:border-indigo-500/30 rounded text-[9px] sm:text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">
                                    {currentDua.source}
                                </span>
                            </div>
                            <div className="text-[10px] sm:text-xs text-slate-700 dark:text-slate-500 dark:text-slate-400 font-medium pb-1 flex items-center gap-1.5 justify-center mt-1">
                                <Icon name="Sparkles" size={12} className="text-amber-500" />
                                {currentDua.benefit}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
