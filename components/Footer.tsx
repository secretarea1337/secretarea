import { useLanguage } from '../src/contexts/LanguageContext';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import DonateModal from './DonateModal';
import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import TrustpilotBadge from './TrustpilotBadge';

const WindowsLogo = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M2 5.09L11.36 3.73V11.5H2V5.09ZM12.64 3.55L22 2.18V11.5H12.64V3.55ZM12.64 12.5H22V21.82L12.64 20.45V12.5ZM2 12.5H11.36V20.27L2 18.91V12.5Z"/>
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
              <button onClick={(e) => { e.preventDefault(); setShowDonateModal(true); }} className="h-10 px-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:scale-105 transition-all shadow-sm cursor-pointer z-50 relative">
                <Icon name="Heart" size={18} className="animate-pulse" />
                <span className="text-sm font-bold">{t('Support Us')}</span>
              </button>
              <TrustpilotBadge variant="pill" />
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
              <Link to="/blog" className="flex items-center gap-3 text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors group">
                <Icon name="Newspaper" size={18} className="text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                <span>{t('Blog')}</span>
              </Link>
              <Link to="/profile" className="flex items-center gap-3 text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors group">
                <Icon name="User" size={18} className="text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                <span>{t('My profile')}</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2.5 w-full max-w-[340px] md:max-w-[250px]">
              <a
                href="https://github.com/secretarea1337/secretarea-desktop/releases/latest/download/SecretArea.exe"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#00a2ed] dark:hover:border-[#00a2ed] rounded-xl text-slate-900 dark:text-white hover:text-[#00a2ed] dark:hover:text-[#00a2ed] hover:shadow-md transition-all w-full text-start group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="text-slate-600 dark:text-slate-400 group-hover:text-[#00a2ed] transition-colors shrink-0"><WindowsLogo /></div>
                  <div className="font-sans min-w-0">
                    <div className="text-[10px] leading-tight font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">{t('Download for')}</div>
                    <div className="text-xs sm:text-sm font-black leading-tight text-slate-900 dark:text-white truncate">{t('Windows')}</div>
                  </div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00a2ed]/15 text-[#00a2ed] dark:text-sky-300 font-bold shrink-0">.exe</span>
              </a>

              <a
                href="https://github.com/secretarea1337/secretarea-desktop/releases/latest/download/SecretArea-linux-amd64.deb"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-400 rounded-xl text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 hover:shadow-md transition-all w-full text-start group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="text-slate-600 dark:text-slate-400 group-hover:text-amber-500 transition-colors shrink-0">
                    <Icon name="Linux" size={22} />
                  </div>
                  <div className="font-sans min-w-0">
                    <div className="text-[10px] leading-tight font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">{t('Download for')}</div>
                    <div className="text-xs sm:text-sm font-black leading-tight text-slate-900 dark:text-white truncate">{t('Linux')}</div>
                  </div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold shrink-0">.deb</span>
              </a>

              <a
                href="https://github.com/secretarea1337/secretarea-desktop/releases/latest/download/SecretArea-linux-x86_64.AppImage"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-xl text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-md transition-all w-full text-start group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0">
                    <Icon name="Linux" size={22} />
                  </div>
                  <div className="font-sans min-w-0">
                    <div className="text-[10px] leading-tight font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">{t('Download for')}</div>
                    <div className="text-xs sm:text-sm font-black leading-tight text-slate-900 dark:text-white truncate">{t('Linux')}</div>
                  </div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold shrink-0">.AppImage</span>
              </a>

              <button
                type="button"
                disabled
                aria-disabled="true"
                className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed w-full text-start opacity-85"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="text-purple-500/80 dark:text-purple-400/80 shrink-0">
                    <Icon name="Apple" size={22} />
                  </div>
                  <div className="font-sans min-w-0">
                    <div className="text-[10px] leading-tight font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{t('Desktop App')}</div>
                    <div className="text-xs sm:text-sm font-black leading-tight text-slate-700 dark:text-slate-300 truncate">{t('macOS')}</div>
                  </div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 font-extrabold uppercase shrink-0">
                  {t('Coming Soon')}
                </span>
              </button>
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
