import React, { useState, useEffect } from 'react';
import { TbLock, TbClock, TbX, TbAlertTriangle } from 'react-icons/tb';
import { useLanguage } from '../src/contexts/LanguageContext';

interface BlockedContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockedUntil?: string;
  blockedAt?: string;
  reason?: string;
}

export const BlockedContentModal: React.FC<BlockedContentModalProps> = ({
  isOpen,
  onClose,
  blockedUntil,
  blockedAt,
  reason
}) => {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 24,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    if (!isOpen) return;

    // Calculate target expiration time
    let targetMs: number;
    if (blockedUntil) {
      targetMs = new Date(blockedUntil).getTime();
    } else if (blockedAt) {
      targetMs = new Date(blockedAt).getTime() + 24 * 3600 * 1000;
    } else {
      targetMs = Date.now() + 24 * 3600 * 1000;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetMs - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOpen, blockedUntil, blockedAt]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl text-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Amber accent background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          title={t("Close")}
        >
          <TbX size={18} />
        </button>

        {/* Lock Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
          <TbLock size={32} className="animate-bounce-subtle" />
        </div>

        {/* Badge & Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
          <TbAlertTriangle size={14} />
          <span>{t("Account Suspended / Blocked")}</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {t("Content Access Locked")}
        </h3>

        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          {reason || t("Your account is currently in a blocked state by an administrator. You may view your profile, but downloading, launching, and interactive content are temporarily restricted.")}
        </p>

        {/* Live Countdown Box */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
            <TbClock size={15} />
            <span>{t("Restriction Lift Countdown")}</span>
          </div>

          {timeLeft.isExpired ? (
            <div className="text-emerald-400 font-bold text-sm py-2">
              {t("Restriction period has expired. Please refresh your profile.")}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {t("Hours")}
                </span>
              </div>
              <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {t("Minutes")}
                </span>
              </div>
              <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {t("Seconds")}
                </span>
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-400 mt-3 flex items-center justify-center gap-1.5">
            <TbAlertTriangle size={13} className="text-amber-400 shrink-0" />
            <span>{t("Countdown updates automatically in real time.")}</span>
          </p>
        </div>

        {/* Footer Support Info */}
        <p className="text-[11px] text-slate-400 mb-5">
          {t("For appeals or urgent inquiries, please contact")}{' '}
          <span className="text-slate-200 font-mono">secretarea1337@gmail.com</span>
        </p>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
        >
          {t("Understood / Close")}
        </button>
      </div>
    </div>
  );
};
