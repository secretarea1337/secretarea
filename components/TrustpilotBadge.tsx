import React from 'react';
import { useLanguage } from '../src/contexts/LanguageContext';

export const TRUSTPILOT_REVIEW_URL = 'https://www.trustpilot.com/review/secretarea.site';

interface TrustpilotBadgeProps {
  variant?: 'pill' | 'button' | 'card';
  className?: string;
}

const TrustpilotStar: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 1.5l2.92 6.86 7.45.65-5.64 4.91 1.69 7.28L12 17.35l-6.42 3.85 1.69-7.28L1.63 9.01l7.45-.65L12 1.5z" />
  </svg>
);

const TrustpilotStarsRow: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => {
  const boxSize = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  const starSize = size === 'md' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5';
  return (
    <div dir="ltr" className="flex items-center gap-0.5 shrink-0" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((idx) => (
        <span
          key={idx}
          className={`${boxSize} bg-[#00B67A] text-white flex items-center justify-center rounded-[2px] shadow-2xs`}
        >
          <TrustpilotStar className={starSize} />
        </span>
      ))}
    </div>
  );
};

const TrustpilotBadge: React.FC<TrustpilotBadgeProps> = ({
  variant = 'pill',
  className = '',
}) => {
  const { t, dir } = useLanguage();

  if (variant === 'card') {
    return (
      <a
        href={TRUSTPILOT_REVIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        dir={dir}
        title={t('Review us on Trustpilot')}
        aria-label={t('Review us on Trustpilot')}
        className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 ring-1 ring-[#00B67A]/20 hover:border-[#00B67A] dark:hover:border-[#00B67A] hover:bg-emerald-50/50 dark:hover:bg-slate-800 shadow-xs hover:shadow-md hover:shadow-[#00B67A]/10 transition-all ${className}`}
      >
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#00B67A]/15 dark:bg-[#00B67A]/20 text-[#008A5C] dark:text-[#00B67A] flex items-center justify-center shrink-0">
            <TrustpilotStar className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('Review us on')}
              </span>
              <span dir="ltr" className="text-xs font-black text-[#007A52] dark:text-[#00B67A] inline-flex items-center gap-1">
                <TrustpilotStar className="w-3.5 h-3.5 text-[#00B67A]" />
                Trustpilot
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2 sm:truncate mt-0.5">
              {t('Support SecretArea for free with a review')}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 ps-10 sm:ps-0">
          <TrustpilotStarsRow size="sm" />
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-[#008A5C] dark:group-hover:text-[#00B67A] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-all"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </a>
    );
  }

  if (variant === 'button') {
    return (
      <a
        href={TRUSTPILOT_REVIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        dir={dir}
        title={t('Review us on Trustpilot')}
        aria-label={t('Review us on Trustpilot')}
        className={`group w-full sm:w-auto justify-center px-4 sm:px-6 py-3.5 sm:py-4 bg-white dark:bg-slate-900/95 hover:bg-emerald-50/80 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 ring-1 ring-[#00B67A]/30 hover:border-[#00B67A] dark:hover:border-[#00B67A] font-bold text-xs sm:text-sm rounded-2xl shadow-sm hover:shadow-[0_0_25px_rgba(0,182,122,0.22)] transition-all transform hover:-translate-y-1 active:translate-y-0 flex flex-wrap items-center gap-2.5 sm:gap-3 ${className}`}
      >
        <span className="flex items-center gap-1.5 font-black tracking-tight whitespace-nowrap">
          <TrustpilotStar className="w-4 h-4 text-[#00B67A] shrink-0 group-hover:scale-110 transition-transform" />
          <span>{t('Review us on')}</span>
          <span dir="ltr" className="text-[#007A52] dark:text-[#00B67A]">Trustpilot</span>
        </span>
        <TrustpilotStarsRow size="sm" />
      </a>
    );
  }

  // Default 'pill' variant (Footer, Community Squad, compact placements)
  return (
    <a
      href={TRUSTPILOT_REVIEW_URL}
      target="_blank"
      rel="noopener noreferrer"
      dir={dir}
      title={t('Review us on Trustpilot')}
      aria-label={t('Review us on Trustpilot')}
      className={`group inline-flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 min-h-[40px] py-1.5 sm:py-0 sm:h-10 px-3 sm:px-3.5 max-w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ring-1 ring-[#00B67A]/25 hover:border-[#00B67A] dark:hover:border-[#00B67A] text-slate-900 dark:text-white hover:bg-emerald-50/70 dark:hover:bg-[#00B67A]/15 transition-all shadow-sm hover:shadow-md hover:shadow-[#00B67A]/10 ${className}`}
    >
      <span className="flex items-center gap-1.5 text-xs font-extrabold tracking-tight whitespace-nowrap">
        <TrustpilotStar className="w-4 h-4 text-[#00B67A] shrink-0 group-hover:scale-110 transition-transform" />
        <span>{t('Review us on')}</span>
        <span dir="ltr" className="font-black text-[#007A52] dark:text-[#00B67A]">Trustpilot</span>
      </span>
      <TrustpilotStarsRow size="sm" />
    </a>
  );
};

export default TrustpilotBadge;
