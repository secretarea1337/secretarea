import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import confetti from 'canvas-confetti';
import Icon from './Icon';
import { useLanguage } from '../src/contexts/LanguageContext';
import { spinAudio } from '../src/utils/spinAudio';

export interface GameItem {
  id: string;
  name: string;
  title?: string;
  category?: string;
  coverImage?: string;
  image?: string;
  poster?: string;
  size?: string;
  description?: string;
  rating?: number | string;
  tags?: string[];
  [key: string]: any;
}

interface RandomGameSpinModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: any[];
  onSelectGame: (game: any) => void;
}

export const RandomGameSpinModal: React.FC<RandomGameSpinModalProps> = ({
  isOpen,
  onClose,
  games,
  onSelectGame,
}) => {
  const { t, dir } = useLanguage();
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningGame, setWinningGame] = useState<GameItem | null>(null);
  const [reelCandidates, setReelCandidates] = useState<GameItem[]>([]);
  const [isMuted, setIsMuted] = useState(() => spinAudio.getMuted());
  const [needleWobble, setNeedleWobble] = useState(false);
  const [showWinnerCard, setShowWinnerCard] = useState(false);

  const wheelControls = useAnimationControls();
  const reelControls = useAnimationControls();
  const rotationRef = useRef(0);
  const spinTimeoutRef = useRef<any>(null);
  const tickIntervalsRef = useRef<any[]>([]);

  // Fallback covers in case a game has missing image
  const getCover = (g: GameItem) => {
    return g.coverImage || g.image || g.poster || '/images/hero01.png';
  };

  const getTitle = (g: GameItem) => {
    return g.name || g.title || 'Featured Game';
  };

  // Launch a new spin with perfectly synchronized wheel and reel animations
  const startSpin = useCallback(() => {
    if (!games || games.length === 0 || isSpinning) return;

    // Reset states
    setIsSpinning(true);
    setShowWinnerCard(false);
    setWinningGame(null);

    // Pick random winner from games
    const selectedWinner = games[Math.floor(Math.random() * games.length)];
    setWinningGame(selectedWinner);

    // Build rolling reel strip: 45 items with the winner placed at index 32
    const TARGET_INDEX = 32;
    const strip: GameItem[] = [];
    for (let i = 0; i < 45; i++) {
      if (i === TARGET_INDEX) {
        strip.push(selectedWinner);
      } else {
        const rItem = games[Math.floor(Math.random() * games.length)];
        strip.push(rItem);
      }
    }
    setReelCandidates(strip);

    // Geometry calculation for exact center alignment
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const cardWidth = isMobile ? 120 : 150;
    const cardGap = 12;
    const cardStep = cardWidth + cardGap; // 132px on mobile, 162px on desktop
    const targetX = TARGET_INDEX * cardStep;

    // Calculate rotation: 6 full turns + random landing offset
    const randomExtraDegrees = Math.floor(Math.random() * 360);
    const targetRotation = rotationRef.current + (360 * 6) + randomExtraDegrees;
    rotationRef.current = targetRotation;

    // Instantly reset reel position to 0 without any lag
    reelControls.set({ x: 0 });

    // Start spin music
    spinAudio.startSpinMusic();

    // Start synchronized physics-based animations with exact same duration & cubic-bezier easing!
    const spinDuration = 3.6; // seconds
    const spinEase: [number, number, number, number] = [0.12, 0.9, 0.2, 1.0];

    wheelControls.start({
      rotate: targetRotation,
      transition: { duration: spinDuration, ease: spinEase },
    });

    reelControls.start({
      x: -targetX,
      transition: { duration: spinDuration, ease: spinEase },
    });

    // Schedule ticking audio matching deceleration physics
    tickIntervalsRef.current.forEach((t) => clearTimeout(t));
    tickIntervalsRef.current = [];

    const durationMs = spinDuration * 1000;
    const startTime = Date.now();
    let nextTickDelay = 35; // ms

    const scheduleNextTick = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= durationMs) return;

      spinAudio.playTick(1.0 + (1 - elapsed / durationMs) * 0.4);
      setNeedleWobble((prev) => !prev);

      // Deceleration curve: tick delay grows exponentially from 35ms up to 360ms
      const progress = elapsed / durationMs;
      nextTickDelay = 35 + Math.pow(progress, 2.5) * 340;

      const timer = setTimeout(scheduleNextTick, nextTickDelay);
      tickIntervalsRef.current.push(timer);
    };

    const firstTimer = setTimeout(scheduleNextTick, 35);
    tickIntervalsRef.current.push(firstTimer);

    // On spin completion
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    spinTimeoutRef.current = setTimeout(() => {
      completeSpin(selectedWinner);
    }, durationMs);
  }, [games, isSpinning, reelControls, wheelControls]);

  const completeSpin = (selectedWinner: GameItem) => {
    setIsSpinning(false);
    setShowWinnerCard(true);
    setWinningGame(selectedWinner);

    // Clear tick timers
    tickIntervalsRef.current.forEach((t) => clearTimeout(t));
    tickIntervalsRef.current = [];

    // Stop spin music smoothly
    // NOTE: Celebration & Confetti are NOT fired here; they only trigger when clicking "View Game Details"!
    spinAudio.stopSpinMusic();
    spinAudio.playTick(1.2);
  };

  // Called ONLY when the user clicks the "View Game Details" button
  const handleViewGameDetails = () => {
    if (!winningGame) return;

    // Trigger celebration sound & confetti ONLY on this explicit action!
    spinAudio.playWinFanfare();

    try {
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#38bdf8', '#10b981', '#ec4899', '#a855f7', '#ffd700'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 65,
          angle: 60,
          spread: 60,
          origin: { x: 0.15, y: 0.65 },
          colors: ['#ffd700', '#38bdf8', '#ff007f'],
        });
        confetti({
          particleCount: 65,
          angle: 120,
          spread: 60,
          origin: { x: 0.85, y: 0.65 },
          colors: ['#ffd700', '#10b981', '#8b5cf6'],
        });
      }, 200);
    } catch {
      // ignore
    }

    setTimeout(() => {
      spinAudio.stopAll();
      onSelectGame(winningGame);
      onClose();
    }, 500);
  };

  // Handle closing modal: stops audio and triggers NO confetti/celebration!
  const handleClose = () => {
    if (isSpinning) return;
    spinAudio.stopAll();
    onClose();
  };

  const handleSkip = () => {
    if (!isSpinning || !winningGame) return;
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    tickIntervalsRef.current.forEach((t) => clearTimeout(t));
    tickIntervalsRef.current = [];

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const cardStep = isMobile ? 132 : 162;
    reelControls.stop();
    reelControls.set({ x: -32 * cardStep });
    wheelControls.stop();
    wheelControls.set({ rotate: rotationRef.current });

    completeSpin(winningGame);
  };

  const toggleSound = () => {
    const nextMuted = spinAudio.toggleMute();
    setIsMuted(nextMuted);
  };

  // Close on Escape key press without celebration effects
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSpinning) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSpinning]);

  // Start spin automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        startSpin();
      }, 200);
      return () => {
        clearTimeout(timer);
        spinAudio.stopAll();
      };
    } else {
      spinAudio.stopAll();
      setIsSpinning(false);
      setShowWinnerCard(false);
    }
  }, [isOpen]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
      tickIntervalsRef.current.forEach((t) => clearTimeout(t));
      spinAudio.stopAll();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        dir={dir}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 w-screen h-screen z-[10000] overflow-y-auto bg-slate-100/98 dark:bg-slate-950/98 backdrop-blur-2xl text-slate-900 dark:text-white flex flex-col justify-between p-3 sm:p-6 md:p-8 select-none"
      >
        {/* Background Ambient Gaming Lights */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/4 start-1/2 -translate-x-1/2 w-[550px] sm:w-[750px] h-[550px] sm:h-[750px] rounded-full bg-radial from-amber-500/15 dark:from-amber-500/25 via-yellow-400/5 to-transparent blur-3xl animate-pulse" />
          <div className="absolute bottom-10 start-10 w-96 h-96 rounded-full bg-sky-500/10 dark:bg-sky-500/15 blur-3xl" />
          <div className="absolute top-10 end-10 w-96 h-96 rounded-full bg-purple-500/10 dark:bg-purple-500/15 blur-3xl" />
        </div>

        {/* Outer Full-Screen Layout Wrapper */}
        <div className="relative z-10 w-full max-w-5xl mx-auto flex-1 flex flex-col justify-between">
          
          {/* Top Bar: Title & High-Contrast Controls */}
          <div className="w-full flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-300/80 dark:border-white/10">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="relative flex h-3.5 w-3.5 sm:h-4 sm:w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-amber-500 border border-amber-300"></span>
              </span>
              <div>
                <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-wide uppercase text-slate-950 dark:text-white flex items-center gap-2">
                  <Icon name="Sparkles" size={24} className="text-amber-500 dark:text-amber-400 shrink-0" />
                  <span>{t('Lucky Game Wheel')}</span>
                </h1>
                <p className="hidden sm:block text-xs font-bold text-slate-700 dark:text-slate-400 mt-0.5">
                  {t('Discover a random game')}
                </p>
              </div>
            </div>

            {/* Sound & Close Buttons with High Contrast */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSound}
                className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                title={isMuted ? t('Unmute Sound') : t('Mute Sound')}
                aria-label={isMuted ? t('Unmute Sound') : t('Mute Sound')}
              >
                <Icon
                  name={isMuted ? 'VolumeX' : 'Volume2'}
                  size={20}
                  className={isMuted ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}
                />
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSpinning}
                className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 border-2 border-slate-300 dark:border-slate-700 hover:border-red-400 shadow-sm transition-all disabled:opacity-40 active:scale-95 cursor-pointer"
                title={t('Close')}
                aria-label={t('Close')}
              >
                <Icon name="X" size={20} />
              </button>
            </div>
          </div>

          {/* Center Arena: Status, 3D Wheel, and Horizontal Roll Strip */}
          <div className="w-full flex-1 flex flex-col items-center justify-center py-2 sm:py-4">
            
            {/* Status Pill Headline - Deep Black in Light Mode, Bright Gold in Dark Mode */}
            <div className="mb-2 sm:mb-4 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-amber-500/40 shadow-sm">
              <p className="text-xs sm:text-sm md:text-base font-black">
                {isSpinning ? (
                  <span className="text-slate-950 dark:text-amber-300 animate-pulse flex items-center justify-center gap-2">
                    <Icon name="Loader" size={17} className="animate-spin text-amber-500" />
                    {t('Rolling the lucky wheel for your next adventure...')}
                  </span>
                ) : showWinnerCard ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-black flex items-center justify-center gap-2">
                    <Icon name="Trophy" size={18} className="text-amber-500 shrink-0" />
                    {t('Winner Chosen! Ready to jump in?')}
                  </span>
                ) : (
                  <span className="text-slate-900 dark:text-slate-300 font-bold">
                    {t('Spin the wheel to discover an epic title!')}
                  </span>
                )}
              </p>
            </div>

            {/* The 3D Majestic Fortune Spin Wheel */}
            <div className="relative my-2 sm:my-3 flex items-center justify-center">
              {/* Outer chassis with glowing LEDs */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full p-2.5 sm:p-3 bg-gradient-to-tr from-slate-900 via-amber-500 to-slate-900 dark:from-amber-600 dark:via-yellow-300 dark:to-amber-700 shadow-[0_10px_35px_rgba(15,23,42,0.35)] dark:shadow-[0_0_50px_rgba(245,158,11,0.5)] border-4 border-slate-900/80 dark:border-amber-400 flex items-center justify-center">
                
                {/* 12 Chasing Micro-LED Lights */}
                {[...Array(12)].map((_, i) => {
                  const angle = (i * 360) / 12;
                  return (
                    <div
                      key={i}
                      className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 rounded-full pointer-events-none"
                      style={{
                        transform: `rotate(${angle}deg) translate(0, -${typeof window !== 'undefined' && window.innerWidth < 640 ? '106px' : typeof window !== 'undefined' && window.innerWidth < 768 ? '122px' : '150px'})`,
                      }}
                    >
                      <div
                        className={`w-full h-full rounded-full border border-slate-900/50 transition-colors duration-150 ${
                          isSpinning
                            ? (i % 2 === 0 ? 'bg-yellow-300 shadow-[0_0_10px_#fde047]' : 'bg-white shadow-[0_0_10px_#ffffff]')
                            : 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                        }`}
                      />
                    </div>
                  );
                })}

                {/* The Rotating Wheel Graphic animated synchronously via wheelControls */}
                <motion.div
                  animate={wheelControls}
                  className="relative w-full h-full rounded-full overflow-hidden border-4 border-amber-300 dark:border-amber-400 shadow-inner bg-slate-950 flex items-center justify-center cursor-pointer select-none"
                  onClick={() => {
                    if (!isSpinning) startSpin();
                  }}
                  title={isSpinning ? '' : t('Spin The Wheel')}
                >
                  <img
                    src="/assets/aistudio/image_2026-10-27_172409302_18fa3e59.png"
                    alt="Lucky Spin Wheel"
                    className="w-full h-full object-cover scale-[1.08] pointer-events-none"
                  />
                </motion.div>

                {/* 3D Flapper Needle Pointer at Top */}
                <div
                  className={`absolute -top-3.5 sm:-top-4 md:-top-5 start-1/2 -translate-x-1/2 z-30 pointer-events-none filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] transition-transform duration-75 ${
                    needleWobble ? 'rotate-[-10deg]' : 'rotate-[10deg]'
                  }`}
                >
                  <div className="w-0 h-0 border-l-[10px] sm:border-l-[12px] md:border-l-[14px] border-l-transparent border-r-[10px] sm:border-r-[12px] md:border-r-[14px] border-r-transparent border-t-[22px] sm:border-t-[26px] md:border-t-[30px] border-t-amber-500 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                </div>
              </div>
            </div>

            {/* Horizontal Slot Reel Carousel */}
            <div className="w-full my-2 sm:my-3">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider px-2 mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-900 dark:text-amber-400">
                  <Icon name="Shuffle" size={15} className="shrink-0 text-amber-500" />
                  {t('Rolling Reel')}
                </span>
                {isSpinning && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 text-xs font-black underline transition-colors cursor-pointer"
                  >
                    {t('Skip Animation')}
                  </button>
                )}
              </div>

              {/* Reel Container Strip */}
              <div
                dir="ltr"
                className="relative w-full h-20 sm:h-24 md:h-28 rounded-2xl bg-white dark:bg-slate-950/90 border-2 border-slate-300 dark:border-slate-800 overflow-hidden shadow-inner flex items-center"
              >
                {/* Center Target Crosshair Indicator with High Contrast */}
                <div className="absolute top-0 bottom-0 start-1/2 -translate-x-1/2 w-[128px] sm:w-[158px] border-3 border-amber-600 dark:border-amber-400 bg-amber-500/15 dark:bg-amber-400/20 rounded-xl z-20 pointer-events-none shadow-[0_0_20px_rgba(245,158,11,0.4)] flex flex-col justify-between items-center py-1">
                  <div className="text-[10px] sm:text-[11px] font-black uppercase text-amber-950 dark:text-amber-200 tracking-widest bg-amber-300 dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-amber-600 dark:border-amber-400 shadow-sm">
                    {t('Target')}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 animate-ping" />
                </div>

                {/* Side Fade Gradient Masks */}
                <div className="absolute top-0 bottom-0 start-0 w-12 sm:w-20 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 bottom-0 end-0 w-12 sm:w-20 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />

                {/* Horizontally Scrolling Reel Items animated synchronously via reelControls */}
                <motion.div
                  animate={reelControls}
                  className="flex items-center gap-3 ps-[calc(50%-60px)] sm:ps-[calc(50%-75px)] will-change-transform"
                >
                  {reelCandidates.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="relative w-[120px] sm:w-[150px] h-16 sm:h-20 md:h-24 rounded-xl overflow-hidden shrink-0 border-2 border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center p-1.5 gap-2 select-none shadow-sm"
                    >
                      <img
                        src={getCover(item)}
                        alt={getTitle(item)}
                        className="w-12 sm:w-16 h-full object-cover rounded-lg shrink-0 shadow-xs"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-center text-start">
                        <span className="text-[11px] sm:text-xs font-black text-slate-950 dark:text-white line-clamp-2 leading-tight">
                          {getTitle(item)}
                        </span>
                        {item.category && (
                          <span className="text-[9px] sm:text-[10px] text-amber-800 dark:text-amber-400 font-extrabold uppercase truncate mt-0.5">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Showcase Winner Game Card */}
            {showWinnerCard && winningGame && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-full mt-2 p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500 shadow-xl flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-start"
              >
                <img
                  src={getCover(winningGame)}
                  alt={getTitle(winningGame)}
                  className="w-16 h-20 sm:w-24 sm:h-28 object-cover rounded-xl shadow-md border-2 border-amber-500 shrink-0"
                />
                <div className="flex-1 min-w-0 text-center sm:text-start">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-950 dark:text-amber-300 font-black text-[11px] uppercase tracking-wider border border-amber-500 mb-1">
                    <Icon name="Trophy" size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
                    {t('Your Lucky Pick')}
                  </div>
                  <h2 className="text-base sm:text-xl md:text-2xl font-black text-slate-950 dark:text-white truncate">
                    {getTitle(winningGame)}
                  </h2>
                  {winningGame.description && (
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-300 line-clamp-2 mt-1 font-semibold">
                      {winningGame.description}
                    </p>
                  )}
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
                    {winningGame.category && (
                      <span className="px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] sm:text-xs font-black text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 uppercase">
                        {winningGame.category}
                      </span>
                    )}
                    {winningGame.size && (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-slate-800 text-[10px] sm:text-xs font-black text-emerald-950 dark:text-emerald-400 border border-emerald-400 dark:border-slate-700">
                        {winningGame.size}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="w-full pt-3 border-t border-slate-300/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3">
            {showWinnerCard && winningGame ? (
              <>
                <button
                  type="button"
                  onClick={handleViewGameDetails}
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-amber-500/30 transition-all hover:scale-102 active:scale-95 cursor-pointer"
                >
                  <Icon name="Play" size={20} className="shrink-0" />
                  {t('View Game Details')}
                </button>
                <button
                  type="button"
                  onClick={startSpin}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-black text-sm sm:text-base border-2 border-slate-700 shadow-md transition-all hover:scale-102 active:scale-95 cursor-pointer"
                >
                  <Icon name="RotateCcw" size={18} className="shrink-0" />
                  {t('Spin Again')}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startSpin}
                disabled={isSpinning}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-10 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base sm:text-lg uppercase tracking-wider shadow-xl shadow-amber-500/30 transition-all hover:scale-102 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Icon name="Sparkles" size={20} className="shrink-0" />
                {isSpinning ? t('Rolling...') : t('Spin The Wheel')}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RandomGameSpinModal;
