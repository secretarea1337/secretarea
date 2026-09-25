import { useLanguage } from '../src/contexts/LanguageContext';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import DonateModal from './DonateModal';
import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';

const WindowsLogo = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M2 5.09L11.36 3.73V11.5H2V5.09ZM12.64 3.55L22 2.18V11.5H12.64V3.55ZM12.64 12.5H22V21.82L12.64 20.45V12.5ZM2 12.5H11.36V20.27L2 18.91V12.5Z"/>
  </svg>
);

const AndroidLogo = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M15 4l1.4-1.9c.2-.3.1-.7-.2-.9-.3-.2-.7-.1-.9.2L13.8 3.5c-1.3-.4-2.8-.4-4 0L8.2 1.4C8 1.1 7.6 1 7.3 1.2c-.3.2-.4.6-.2.9L8.5 4C4.3 6 1.4 10.1 1 14.8h22C22.6 10.1 19.7 6 15 4zm-7.5 7.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm8.5 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z"/>
  </svg>
);

const Footer: React.FC = () => {
  const { dir, t } = useLanguage();
  const [showDonateModal, setShowDonateModal] = useState(false);

  return (
    <footer dir={dir} className="relative z-20 w-full bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white py-12 lg:py-16 pb-24 md:pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & Socials */}
          <div className="lg:col-span-2 flex flex-col items-center md:items-start text-center md:text-start">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <Icon name="Wolf" size={36} className="group-hover:scale-105 transition-transform" />
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase">{t('SecretArea')}</h3>
            </Link>
            <p className="text-sm max-w-sm mb-8 text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {t('Our goal is simple: bring the best games together in one place, so you can spend less time searching and more time playing.')}
            </p>
            <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
              <a href="https://discord.gg/pygmDWFAHK" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-[#5865F2] hover:border-[#5865F2]/40 hover:bg-[#5865F2]/5 transition-all shadow-sm" aria-label="Discord">
                <Icon name="Discord" size={20} />
              </a>
              <a href="https://t.me/secretarea1337" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-[#0088cc] hover:border-[#0088cc]/40 hover:bg-[#0088cc]/5 transition-all shadow-sm" aria-label="Telegram">
                <Icon name="Telegram" size={20} />
              </a>
              <a href="https://www.reddit.com/r/SecretArea1337/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-[#FF4500] hover:border-[#FF4500]/40 hover:bg-[#FF4500]/5 transition-all shadow-sm" aria-label="Reddit">
                <Icon name="Reddit" size={20} />
              </a>
              <button onClick={(e) => { e.preventDefault(); setShowDonateModal(true); }} className="h-10 px-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:scale-105 transition-all shadow-sm cursor-pointer z-50 relative">
                <Icon name="Heart" size={18} className="animate-pulse" />
                <span className="text-sm font-bold">{t('Support Us')}</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start text-center md:text-start">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-6">{t('Navigation')}</h3>
            <div className="flex flex-col gap-4 font-semibold text-sm">
              <Link to="/" className="flex items-center gap-3 text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors group">
                <Icon name="Wolf" size={18} className="transition-transform group-hover:scale-110" />
                <span>{t('Secret Area')}</span>
              </Link>
              <Link to="/personal-space" className="flex items-center gap-3 text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors group">
                <Icon name="User" size={18} className="text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                <span>{t('Personal Space')}</span>
              </Link>
              <Link to="/roadmap" className="flex items-center gap-3 text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors group">
                <Icon name="Rocket" size={18} className="text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                <span>{t('Roadmap')}</span>
              </Link>
              <Link to="/disclaimer" className="flex items-center gap-3 text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors group">
                <Icon name="ShieldAlert" size={18} className="text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                <span>{t('Disclaimer')}</span>
              </Link>
            </div>
          </div>

          {/* Apps */}
          <div className="flex flex-col items-center md:items-start text-center md:text-start">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-6">{t('Apps')}</h3>
            <div className="flex flex-col gap-3 w-full max-w-[200px]">
              <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#00a2ed] dark:hover:border-[#00a2ed] rounded-xl text-slate-900 dark:text-white hover:text-[#00a2ed] dark:hover:text-[#00a2ed] hover:shadow-md transition-all w-full text-start group">
                <div className="text-slate-600 dark:text-slate-400 group-hover:text-[#00a2ed] transition-colors"><WindowsLogo /></div>
                <div className="font-sans">
                  <div className="text-[10px] leading-tight font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">{t('Download for')}</div>
                  <div className="text-sm font-black leading-tight text-slate-900 dark:text-white">{t('Desktop App')}</div>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#3DDC84] dark:hover:border-[#3DDC84] rounded-xl text-slate-900 dark:text-white hover:text-[#3DDC84] dark:hover:text-[#3DDC84] hover:shadow-md transition-all w-full text-start group">
                <div className="text-slate-600 dark:text-slate-400 group-hover:text-[#3DDC84] transition-colors"><AndroidLogo /></div>
                <div className="font-sans">
                  <div className="text-[10px] leading-tight font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">{t('Download for')}</div>
                  <div className="text-sm font-black leading-tight text-slate-900 dark:text-white">{t('Android App')}</div>
                </div>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-slate-200 dark:border-slate-800/60 text-sm gap-4 font-semibold text-slate-900 dark:text-white">
          <p className="text-center sm:text-start">
            © 2026 <span className="font-black text-slate-900 dark:text-white tracking-widest">{t('SecretArea')}</span>. {t('All rights reserved.')}
          </p>
          <p className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold">
            {t('Built by :')} <a href="https://atlasvcard.vercel.app/" target="_blank" rel="noreferrer" className="font-black text-slate-900 dark:text-white hover:text-primary-500 transition-colors">ATLAS</a>
          </p>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showDonateModal && (
            <DonateModal open={showDonateModal} onClose={() => setShowDonateModal(false)} />
          )}
        </AnimatePresence>
      </div>
    </footer>

  );
};

export default Footer;
