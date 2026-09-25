import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language, translations } from '../src/contexts/LanguageContext';
import Icon from './Icon';
import { motion, AnimatePresence } from 'framer-motion';

// Re-export context items in case user imports translations from this file
export { translations };
export { useLanguage };
export type { Language };

const flags: Record<Language, string> = {
  en: 'https://imgs.search.brave.com/OHWzUwxMaExttIlCme1W0aPVH5MkY7Fu0kBvHG3JQbE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/cGl4YWJheS5jb20v/cGhvdG8vMjAyMC8x/MS8xMi8wNS8yMS9h/bWVyaWNhbi1mbGFn/LTU3MzQ0MjZfNjQw/LnBuZw',
  fr: 'https://imgs.search.brave.com/XzNHDQ3qOXErylDJ3_kOHLv3rESOXtya31ryVCbrutY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAxLzU4LzkwLzc2/LzM2MF9GXzE1ODkw/NzYyNl95aEw2YzMx/anBOVVRzVWRIUk5Y/TnlwSU9PNG44amZw/WC5qcGc',
  es: 'https://imgs.search.brave.com/RgTqPUvLUxz1KuN4Ed7rdhehiCD15-SMSuo8je2uRds/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTQy/MjkxODc0Ny9waG90/by9mbGFnLW9mLXNw/YWluLXdpdGgtYS1n/cnVuZ2UtdGV4dHVy/ZS5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9aFhpRjNaajEz/WkwxVlF3YzhCTTNI/WGhyc21keFc5MkpX/RWs2YWgyTzR5RT0',
  ar: 'https://imgs.search.brave.com/mcwKurm_HUe2clMR2s7_xb2zHAi0pOJay3i1JbvYy68/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wODMv/OTgzLzQ5MS9zbWFs/bC9tb3JvY2Nhbi1m/bGFnLXdpdGgtZ3Jl/ZW4tc3Rhci1vbi1y/ZWQtYmFja2dyb3Vu/ZC12aWRlby5qcGc'
};

const labels: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  ar: 'العربية'
};

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const languageOptions: Language[] = ['en', 'fr', 'es', 'ar'];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-slate-200/80 dark:hover:bg-slate-800/80 transition-colors text-slate-600 dark:text-slate-300 shrink-0 border border-slate-200/60 dark:border-slate-800/60 shadow-xs"
        title={labels[language] || 'Change Language'}
        aria-label="Change Language"
        aria-expanded={isOpen}
      >
        <img
          src={flags[language]}
          alt={labels[language] || language}
          className="w-5 h-3.5 sm:w-5 sm:h-3.5 rounded-[2px] object-cover shadow-xs pointer-events-none"
          referrerPolicy="no-referrer"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className={`absolute mt-2 w-44 py-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden ${
              dir === 'rtl' ? 'left-0' : 'right-0'
            }`}
          >
            {languageOptions.map((lang) => {
              const isSelected = language === lang;
              return (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={flags[lang]}
                      alt={labels[lang]}
                      className="w-5 h-3.5 rounded-[2px] object-cover shadow-2xs shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <span>{labels[lang]}</span>
                  </div>
                  {isSelected && (
                    <Icon name="Check" size={14} className="text-primary-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
