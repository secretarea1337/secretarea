import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaTelegram, FaDiscord, FaReddit } from 'react-icons/fa6';
import Icon from './Icon';
import { LowPolyBackground } from './LowPolyBackground';

interface MaintenanceProps {
  endTime: string | null;
  message: string;
}

const parseDateStr = (dateStr: string) => {
    const timestamp = Date.parse(dateStr);
    if (!isNaN(timestamp)) {
        return timestamp;
    }
    const parts = dateStr.split(/[\sT]+/);
    if (parts.length > 0) {
        const datePart = parts[0];
        const timePart = parts[1] || '00:00:00';
        const dateParts = datePart.split(/[\/\-]/);
        if (dateParts.length === 3) {
            let year, month, day;
            if (dateParts[0].length === 4) {
                year = dateParts[0];
                month = dateParts[1];
                day = dateParts[2];
            } else {
                day = dateParts[0];
                month = dateParts[1];
                year = dateParts[2];
            }
            return Date.parse(`${year}-${month}-${day}T${timePart}`);
        }
    }
    return new Date().getTime();
};

const MaintenancePage: React.FC<MaintenanceProps> = ({ endTime, message }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const targetTime = parseDateStr(endTime);
      const difference = targetTime - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const pad = (num: number) => num.toString().padStart(2, '0');

  const flipCard = (val: number, label: string) => (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-20 sm:w-24 sm:h-28 bg-white dark:bg-slate-900 rounded-lg shadow-xl dark:shadow-2xl flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-700/50 dark:to-slate-900/50 opacity-50 pointer-events-none transition-colors duration-300" />
        <div className="absolute top-1/2 start-0 w-full h-[1px] bg-slate-300 dark:bg-slate-950/80 shadow-sm z-10 transition-colors duration-300" />
        <span className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter z-0 transition-colors duration-300">
          {pad(val)}
        </span>
      </div>
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-500 dark:text-slate-400 transition-colors duration-300">
        {label}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-50 dark:bg-[#0B0F19] overflow-hidden flex flex-col items-center justify-center text-center p-4 transition-colors duration-300">
      {/* Animated Background Gradients & Textures */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-300/20 via-slate-50 to-slate-50 dark:from-[#ff0055]/20 dark:via-[#0B0F19] dark:to-[#0B0F19] pointer-events-none transition-colors duration-300" 
      />
      
      <LowPolyBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center"
      >
        {/* Logo Area */}
        <div className="mb-10 flex items-center gap-3 relative">
            <div className="relative group w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                <Icon name="Wolf" className="w-full h-full text-slate-900 dark:text-white relative z-10 animate-pulse transition-colors duration-300" />
                <Icon name="Wolf" className="w-full h-full text-red-500 absolute inset-0 z-0 opacity-70 animate-[glitch_2s_infinite]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)', transform: 'translate(-2px, 2px)' }} />
                <Icon name="Wolf" className="w-full h-full text-blue-500 absolute inset-0 z-0 opacity-70 animate-[glitch_3s_infinite_reverse]" style={{ clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)', transform: 'translate(2px, -2px)' }} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-widest uppercase transition-colors duration-300">SecretArea</h1>
        </div>

        <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-light text-slate-900 dark:text-white mb-4 tracking-tight transition-colors duration-300 whitespace-nowrap">
          We're Under <span className="font-bold">Maintenance</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-500 dark:text-slate-400 mb-12 max-w-lg mx-auto leading-relaxed transition-colors duration-300">
          {message}
        </p>

        {endTime && (
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-16">
            {flipCard(timeLeft.days, 'Days')}
            {flipCard(timeLeft.hours, 'Hours')}
            {flipCard(timeLeft.minutes, 'Minutes')}
            {flipCard(timeLeft.seconds, 'Seconds')}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-4 relative z-20">
           <a href="https://t.me/secretarea1337" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:scale-110 shadow-lg shadow-slate-200 dark:shadow-slate-900/50"><FaTelegram size={22} /></a>
           <a href="https://discord.gg/pygmDWFAHK" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:scale-110 shadow-lg shadow-slate-200 dark:shadow-slate-900/50"><FaDiscord size={22} /></a>
           <a href="https://www.reddit.com/r/SecretArea1337/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:scale-110 shadow-lg shadow-slate-200 dark:shadow-slate-900/50"><FaReddit size={22} /></a>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes glitch {
            0% { transform: translate(0) }
            20% { transform: translate(-2px, 2px) }
            40% { transform: translate(-2px, -2px) }
            60% { transform: translate(2px, 2px) }
            80% { transform: translate(2px, -2px) }
            100% { transform: translate(0) }
        }
      `}} />
    </div>
  );
};

export default MaintenancePage;
