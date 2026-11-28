import React from 'react';
import { useLanguage } from '../src/contexts/LanguageContext';
import Icon from './Icon';

export const DESKTOP_RELEASES = {
  windows: 'https://github.com/secretarea1337/secretarea-desktop/releases/latest/download/SecretArea.exe',
  linuxDeb: 'https://github.com/secretarea1337/secretarea-desktop/releases/latest/download/SecretArea-linux-amd64.deb',
  linuxAppImage: 'https://github.com/secretarea1337/secretarea-desktop/releases/latest/download/SecretArea-linux-x86_64.AppImage',
} as const;

interface DesktopAppSectionProps {
  variant?: 'home' | 'detail';
  className?: string;
}

const DesktopAppSection: React.FC<DesktopAppSectionProps> = ({
  variant = 'home',
  className = '',
}) => {
  const { dir, t } = useLanguage();
  const isHome = variant === 'home';

  return (
    <section
      dir={dir}
      className={`w-full relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl dark:shadow-2xl transition-colors duration-300 ${
        isHome ? 'my-8 sm:my-12' : ''
      } ${className}`}
      aria-label={t('Meet SecretArea Desktop')}
    >
      {/* Background Ambient Layers (Light & Dark) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-sky-50/70 dark:from-slate-950 dark:via-[#0b1120] dark:to-indigo-950/30 transition-colors duration-300" />
        <div className="absolute -top-24 -end-24 w-72 h-72 sm:w-96 sm:h-96 bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -start-24 w-72 h-72 sm:w-96 sm:h-96 bg-amber-500/10 dark:bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      <div
        className={`relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10 ${
          isHome ? 'p-6 sm:p-10 lg:p-14 xl:p-16' : 'p-5 sm:p-8 lg:p-10'
        }`}
      >
        {/* Artwork Stage (Top on mobile/tablet, Right/End on laptop) */}
        <div className="order-1 lg:order-2 lg:col-span-5 flex items-center justify-center">
          <div className="relative w-full max-w-[300px] sm:max-w-[380px] md:max-w-[420px] lg:max-w-full flex items-center justify-center group">
            <div
              className="absolute inset-4 rounded-full blur-2xl opacity-60 dark:opacity-80 pointer-events-none transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, rgba(0, 162, 237, 0.22) 0%, rgba(168, 85, 247, 0.16) 45%, transparent 75%)',
              }}
            />
            <img
              src="/images/desktop_app.png"
              alt={t('Meet SecretArea Desktop')}
              loading="lazy"
              className="relative z-10 w-full h-auto max-h-[260px] sm:max-h-[320px] lg:max-h-[380px] object-contain select-none drop-shadow-[0_14px_28px_rgba(15,23,42,0.22)] dark:drop-shadow-[0_18px_36px_rgba(0,0,0,0.65)] transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </div>

        {/* Content & Platform Download Buttons (Bottom on mobile/tablet, Left/Start on laptop) */}
        <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col text-start space-y-4 sm:space-y-5">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-widest w-max">
            <Icon name="Monitor" size={14} className="shrink-0" />
            <span>{t('Desktop App')}</span>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-2">
            <h2
              className={`font-black text-slate-900 dark:text-white tracking-tight leading-[1.12] ${
                isHome ? 'text-2xl sm:text-4xl lg:text-5xl' : 'text-2xl sm:text-3xl lg:text-4xl'
              }`}
            >
              {t('Meet SecretArea Desktop')}
            </h2>
            <h3 className="text-base sm:text-xl font-extrabold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 dark:from-sky-400 dark:via-cyan-300 dark:to-indigo-400 bg-clip-text text-transparent">
              {t('Your Gaming World. Beyond the Browser.')}
            </h3>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
            {t(
              'Discover the next level of SecretArea with a dedicated desktop experience. Enjoy your gaming hub with powerful desktop tools, downloads, hardware monitoring, and more.'
            )}
          </p>

          {/* Responsive 4-Platform Download Grid (1 col on small mobile, 2 cols on tablet & laptop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Windows (.exe) */}
            <a
              href={DESKTOP_RELEASES.windows}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-slate-50 hover:bg-[#00a2ed]/10 dark:bg-slate-900/90 dark:hover:bg-[#00a2ed]/15 border border-slate-200 dark:border-slate-700/80 hover:border-[#00a2ed] dark:hover:border-[#00a2ed] text-slate-900 dark:text-white shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#00a2ed]/15 text-[#00a2ed] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                  <Icon name="Windows" size={20} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t('Download for')}
                  </div>
                  <div className="text-sm font-black truncate">{t('Windows')}</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00a2ed]/15 text-[#00a2ed] dark:text-sky-300 text-[11px] font-bold shrink-0">
                <Icon name="Download" size={13} />
                <span>.exe</span>
              </span>
            </a>

            {/* Linux (.deb) */}
            <a
              href={DESKTOP_RELEASES.linuxDeb}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-slate-50 hover:bg-amber-500/10 dark:bg-slate-900/90 dark:hover:bg-amber-500/15 border border-slate-200 dark:border-slate-700/80 hover:border-amber-500 dark:hover:border-amber-400 text-slate-900 dark:text-white shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                  <Icon name="Linux" size={20} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t('Download for')}
                  </div>
                  <div className="text-sm font-black truncate">{t('Linux')}</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] font-bold shrink-0">
                <Icon name="Download" size={13} />
                <span>.deb</span>
              </span>
            </a>

            {/* Linux (.AppImage) */}
            <a
              href={DESKTOP_RELEASES.linuxAppImage}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-slate-50 hover:bg-emerald-500/10 dark:bg-slate-900/90 dark:hover:bg-emerald-500/15 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 dark:hover:border-emerald-400 text-slate-900 dark:text-white shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                  <Icon name="Linux" size={20} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t('Download for')}
                  </div>
                  <div className="text-sm font-black truncate">{t('Linux')}</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold shrink-0">
                <Icon name="Download" size={13} />
                <span>.AppImage</span>
              </span>
            </a>

            {/* macOS (Coming Soon) */}
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-85 text-start"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500/80 dark:text-purple-400/80 flex items-center justify-center shrink-0">
                  <Icon name="Apple" size={20} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {t('Desktop App')}
                  </div>
                  <div className="text-sm font-black truncate text-slate-700 dark:text-slate-300">
                    {t('macOS')}
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                {t('Coming Soon')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesktopAppSection;
