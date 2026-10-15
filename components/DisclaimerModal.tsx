import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Globe, 
  Server, 
  Heart, 
  Scale, 
  CheckCircle2, 
  X,
  FileText
} from 'lucide-react';
import { useLanguage } from '../src/contexts/LanguageContext';

export type DisclaimerLang = 'EN' | 'FR' | 'ESP' | 'AR';

interface ClauseItem {
  icon: 'globe' | 'server' | 'heart';
  title: string;
  description: string;
}

interface DisclaimerContent {
  code: DisclaimerLang;
  label: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  badge: string;
  title: string;
  subtitle: string;
  clauses: ClauseItem[];
  userNotice: string;
  confirmBtn: string;
  fullTermsLink: string;
}

export const DISCLAIMER_LOCALES: Record<DisclaimerLang, DisclaimerContent> = {
  EN: {
    code: 'EN',
    label: 'EN',
    nativeName: 'English',
    dir: 'ltr',
    badge: 'Legal & Compliance Notice',
    title: 'Platform Disclaimer',
    subtitle: 'Please review our operational terms and ethical guidelines before entering SecretArea.',
    clauses: [
      {
        icon: 'globe',
        title: 'Public Open-Web Index',
        description: 'All links, guides, and resources listed on this platform are indexed from publicly accessible locations on the internet.'
      },
      {
        icon: 'server',
        title: 'Zero File Hosting & Modifications',
        description: 'SecretArea does not host, distribute, modify, or crack proprietary files. No copyrighted binaries reside on our infrastructure.'
      },
      {
        icon: 'heart',
        title: 'Support Game Creators & Publishers',
        description: 'We advocate strongly for supporting original developers and studios. Please purchase official copies and subscriptions whenever possible.'
      }
    ],
    userNotice: 'By continuing, you acknowledge that you are solely responsible for how you utilize external links and information.',
    confirmBtn: 'I Understand & Accept',
    fullTermsLink: 'View Full Terms'
  },
  FR: {
    code: 'FR',
    label: 'FR',
    nativeName: 'Français',
    dir: 'ltr',
    badge: 'Avis Légal & Conformité',
    title: 'Avertissement de la Plateforme',
    subtitle: 'Veuillez prendre connaissance de nos conditions d’utilisation avant d’accéder à SecretArea.',
    clauses: [
      {
        icon: 'globe',
        title: 'Index Public du Web Ouvert',
        description: 'Tous les liens et ressources partagés sur cette plateforme sont indexés depuis des sources déjà accessibles publiquement sur Internet.'
      },
      {
        icon: 'server',
        title: 'Aucun Hébergement ni Modification',
        description: 'SecretArea n’héberge, ne modifie ni ne cracke aucun fichier propriétaire. Aucun binaire sous droit d’auteur n’est stocké sur nos serveurs.'
      },
      {
        icon: 'heart',
        title: 'Soutenez les Développeurs & Éditeurs',
        description: 'Nous vous encourageons vivement à soutenir les créateurs et studios originaux en achetant les versions et licences officielles.'
      }
    ],
    userNotice: 'En poursuivant, vous reconnaissez assumer l’entière responsabilité légale et personnelle de l’utilisation des liens externes.',
    confirmBtn: 'J’ai compris & J’accepte',
    fullTermsLink: 'Voir les conditions complètes'
  },
  ESP: {
    code: 'ESP',
    label: 'ESP',
    nativeName: 'Español',
    dir: 'ltr',
    badge: 'Aviso Legal y Cumplimiento',
    title: 'Descargo de Responsabilidad',
    subtitle: 'Por favor, revise nuestras normas operativas y pautas éticas antes de acceder a SecretArea.',
    clauses: [
      {
        icon: 'globe',
        title: 'Índice de Acceso Público',
        description: 'Todos los recursos y enlaces listados en esta plataforma han sido indexados desde fuentes abiertas y públicas en Internet.'
      },
      {
        icon: 'server',
        title: 'Sin Alojamiento ni Manipulación de Archivos',
        description: 'SecretArea no aloja, modifica ni distribuye archivos protegidos. Ningún binario con copyright reside en nuestros servidores.'
      },
      {
        icon: 'heart',
        title: 'Apoyo a los Creadores y Desarrolladores',
        description: 'Promovemos firmemente el apoyo a los estudios oficiales adquiriendo siempre copias y licencias originales de juegos y software.'
      }
    ],
    userNotice: 'Al continuar, reconoces que eres el único responsable del uso que des a los enlaces e información externa.',
    confirmBtn: 'Entiendo y Acepto los Términos',
    fullTermsLink: 'Ver términos completos'
  },
  AR: {
    code: 'AR',
    label: 'AR',
    nativeName: 'العربية',
    dir: 'rtl',
    badge: 'إشعار قانوني والتزام تنظيمي',
    title: 'إخلاء المسؤولية القانونية',
    subtitle: 'يرجى قراءة بنود الاستخدام والتوجيهات الأخلاقية بعناية قبل تصفح منصة SecretArea.',
    clauses: [
      {
        icon: 'globe',
        title: 'فهرسة روابط عامة ومفتوحة',
        description: 'جميع الروابط والمراجع الرقمية المتوفرة على المنصة مفهرسة من مصادر عامة ومتاحة علناً على شبكة الإنترنت المفتوحة.'
      },
      {
        icon: 'server',
        title: 'لا نستضيف ولا نعدل أي ملفات',
        description: 'منصة SecretArea لا تستضيف، ولا توزع، ولا تعدل، ولا تكسر حماية أي برمجيات أو ألعاب؛ ولا يتم تخزين أي ملفات محمية على خوادمنا.'
      },
      {
        icon: 'heart',
        title: 'دعم المطورين وفرق الإنتاج الأصلية',
        description: 'نحث جميع الزوار بقوة على شراء النسخ والتراخيص الأصلية للألعاب والبرمجيات دعماً لفرق التطوير واستدامة الصناعة الرقمية.'
      }
    ],
    userNotice: 'بمتابعتك التصفح، فإنك تقر بأنك تتحمل وحدك كامل المسؤولية القانونية والشخصية عن كيفية استخدامك لأي روابط أو بيانات خارجية.',
    confirmBtn: 'أوافق وأفهم الشروط والمحددات',
    fullTermsLink: 'عرض الشروط الكاملة'
  }
};

interface DisclaimerModalProps {
  open: boolean;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ open, onClose }) => {
  const { language } = useLanguage();

  // Match initial modal language with the platform language
  const getInitialLanguage = (): DisclaimerLang => {
    if (language === 'ar') return 'AR';
    if (language === 'fr') return 'FR';
    if (language === 'es') return 'ESP';
    return 'EN';
  };

  const [activeLang, setActiveLang] = useState<DisclaimerLang>(() => getInitialLanguage());

  // Sync if outer app language changes while modal is active
  useEffect(() => {
    setActiveLang(getInitialLanguage());
  }, [language]);

  const currentContent = DISCLAIMER_LOCALES[activeLang] || DISCLAIMER_LOCALES.EN;
  const isRTL = currentContent.dir === 'rtl';

  return (
    <AnimatePresence>
      {open && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disclaimer-title"
        >
        {/* Backdrop click dismiss */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 14 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          dir={currentContent.dir}
          className={`relative z-10 w-full max-w-lg sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85),0_0_35px_-5px_rgba(14,165,233,0.18)] ${
            isRTL ? 'font-arabic' : 'font-sans'
          }`}
        >
          {/* Top Ambient Glow Ribbon */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 via-primary-500 to-cyan-400" />

          {/* Header Bar */}
          <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-950/60 flex items-center justify-between gap-3 shrink-0">
            {/* Language Switcher Tabs */}
            <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/40 dark:border-slate-700/60" role="tablist">
              {(['EN', 'FR', 'ESP', 'AR'] as DisclaimerLang[]).map((langKey) => {
                const isActive = activeLang === langKey;
                const locale = DISCLAIMER_LOCALES[langKey];
                return (
                  <button
                    key={langKey}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveLang(langKey)}
                    className={`relative px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg text-xs font-bold transition-all select-none ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs border border-slate-200 dark:border-slate-700'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title={locale.nativeName}
                  >
                    <span>{locale.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Dismiss Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors"
              aria-label="Close disclaimer modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Modal Body */}
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 space-y-5 custom-scrollbar text-slate-800 dark:text-slate-100">
            
            {/* Hero Badge & Title */}
            <div className={`flex flex-col gap-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} className="text-sky-500 dark:text-sky-400" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  {currentContent.badge}
                </span>
              </div>

              <h2 id="disclaimer-title" className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {currentContent.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {currentContent.subtitle}
              </p>
            </div>

            {/* 3 Structured Key Clauses */}
            <div className="space-y-3">
              {currentContent.clauses.map((clause, idx) => {
                const getIcon = () => {
                  switch (clause.icon) {
                    case 'globe':
                      return <Globe size={18} className="text-sky-500 dark:text-sky-400 shrink-0" />;
                    case 'server':
                      return <Server size={18} className="text-sky-500 dark:text-sky-400 shrink-0" />;
                    case 'heart':
                      return <Heart size={18} className="text-rose-500 dark:text-rose-400 shrink-0" />;
                    default:
                      return <Scale size={18} className="text-sky-500 dark:text-sky-400 shrink-0" />;
                  }
                };

                return (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800/70 transition-all hover:border-sky-500/30"
                  >
                    <div className={`flex items-start gap-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className="mt-0.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs shrink-0">
                        {getIcon()}
                      </div>
                      <div className="space-y-1 flex-1">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                          {clause.title}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {clause.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* User Responsibility Callout */}
            <div className={`p-3.5 rounded-xl sm:rounded-2xl bg-sky-50/80 dark:bg-sky-950/25 border border-sky-200/60 dark:border-sky-800/40 text-slate-700 dark:text-slate-300 text-xs leading-relaxed flex items-start gap-2.5 ${isRTL ? 'text-right' : 'text-left'}`}>
              <CheckCircle2 size={16} className="text-sky-500 dark:text-sky-400 mt-0.5 shrink-0" />
              <p className="text-[11px] sm:text-xs text-sky-950 dark:text-sky-200">
                {currentContent.userNotice}
              </p>
            </div>

          </div>

          {/* Sticky Modal Footer */}
          <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/95 dark:bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <a
              href="/disclaimer"
              className="text-[11px] font-semibold text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-1.5 order-2 sm:order-1"
            >
              <FileText size={13} />
              <span>{currentContent.fullTermsLink}</span>
            </a>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-500/20 hover:shadow-sky-500/30 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              <CheckCircle2 size={16} />
              <span>{currentContent.confirmBtn}</span>
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};

export default DisclaimerModal;
