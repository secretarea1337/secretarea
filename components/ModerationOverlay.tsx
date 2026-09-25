import React from 'react';
import { TbBan, TbTrash, TbShieldX, TbAlertOctagon, TbArrowBackUp } from 'react-icons/tb';
import { useLanguage } from '../src/contexts/LanguageContext';

export interface ModerationBlockDetails {
  type: 'blacklisted' | 'removed' | null;
  email?: string;
  reason?: string;
  date?: string;
}

interface ModerationOverlayProps {
  details: ModerationBlockDetails | null;
  onDismiss: () => void;
}

export const ModerationOverlay: React.FC<ModerationOverlayProps> = ({ details, onDismiss }) => {
  const { t } = useLanguage();

  if (!details || !details.type) return null;

  const isBlacklisted = details.type === 'blacklisted';

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-[#06080e]/95 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-slate-950/90 border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(244,63,94,0.25)] text-center overflow-hidden">
        {/* Glow ambient backgrounds */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-72 h-72 bg-rose-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/15 rounded-full blur-[90px] pointer-events-none" />

        {/* Security / Ban Icon */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-rose-500/15 border-2 border-rose-500/40 flex items-center justify-center text-rose-500 mb-5 shadow-2xl shadow-rose-500/20">
          {isBlacklisted ? (
            <TbBan size={44} className="animate-pulse" />
          ) : (
            <TbTrash size={42} className="animate-pulse" />
          )}
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-black uppercase tracking-widest mb-3">
          <TbAlertOctagon size={16} />
          <span>{isBlacklisted ? t("BLACKLISTED ACCOUNT") : t("ACCOUNT PERMANENTLY REMOVED")}</span>
        </div>

        {/* Main Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {isBlacklisted ? t("LOGIN DENIED & ACCESS REVOKED") : t("ACCOUNT ERASED FROM SYSTEM")}
        </h2>

        {/* Subtitle / Explanation */}
        <p className="text-sm text-slate-300 mt-3 leading-relaxed max-w-md mx-auto">
          {isBlacklisted
            ? t("Your account credentials have been permanently blacklisted by the system administrator. Even with valid credentials, login is completely denied and access to the website is blocked.")
            : t("This account and its associated identifiers (email & device) have been permanently deleted and banned from SecretArea by an administrator.")}
        </p>

        {/* Details Box */}
        <div className="my-6 p-4 rounded-2xl bg-black/60 border border-slate-800 text-start space-y-2 text-xs">
          {details.email && (
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">{t("Target Account / Email")}:</span>
              <span className="font-mono text-white font-semibold">{details.email}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">{t("Status")}:</span>
            <span className="font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
              <TbShieldX size={14} /> {isBlacklisted ? t("Permanently Blacklisted") : t("Erased & Blocked")}
            </span>
          </div>

          <div className="pt-1">
            <span className="text-slate-400 block mb-1">{t("Moderation Reason")}:</span>
            <p className="text-slate-200 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs font-medium leading-relaxed">
              {details.reason || (isBlacklisted
                ? t("Account flagged for severe security violations or community guideline breach.")
                : t("Account permanently removed from the active system by administrative order."))}
            </p>
          </div>
        </div>

        {/* Support Note */}
        <p className="text-[11px] text-slate-400 mb-6">
          {t("This moderation action is authoritative. If you believe this is a technical mistake, contact administrator:")}{' '}
          <span className="text-rose-400 font-mono font-semibold">secretarea1337@gmail.com</span>
        </p>

        {/* Action Button */}
        <button
          onClick={onDismiss}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <TbArrowBackUp size={18} />
          <span>{t("Acknowledge & Exit")}</span>
        </button>
      </div>
    </div>
  );
};
