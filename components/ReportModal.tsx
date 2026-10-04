import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { 
  TbAlertTriangle, 
  TbAlertCircle,
  TbLink, 
  TbArchive, 
  TbBug,
  TbRefresh, 
  TbHelpCircle, 
  TbX, 
  TbCheck, 
  TbCircleCheck,
  TbSend, 
  TbBrandWhatsapp, 
  TbDeviceGamepad2, 
  TbUser,
  TbUserCheck, 
  TbShieldCheck,
  TbGhost,
  TbMail,
  TbDownload,
  TbLoader2,
  TbClock
} from 'react-icons/tb';
import { useLanguage, Language } from '../src/contexts/LanguageContext';
import { auth } from '../src/firebase';
import { submitReport, getItemActiveReport } from '../src/services/reportService';
import { UserProfileData } from '../src/services/userService';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    category?: string;
    coverImage?: string;
    version?: string;
    links?: Record<string, any>;
  };
  currentUserProfile?: UserProfileData | null;
}

// Full 4-language dictionary covering EN, FR, ES (ESP), and AR
const MODAL_I18N: Record<string, Record<Language, string>> = {
  modalTitle: {
    en: 'Report an Issue',
    fr: 'Signaler un problème',
    es: 'Reportar un problema',
    ar: 'الإبلاغ عن مشكلة في المحتوى',
  },
  modalSubtitle: {
    en: 'Send data directly to Admin page to fix it',
    fr: 'Envoyer les données à la page Admin pour correction',
    es: 'Enviar los datos al panel Admin para solucionarlo',
    ar: 'إرسال بيانات البلاغ مباشرة للوحة تحكم الإدارة لإصلاحها',
  },
  loggedInAs: {
    en: 'Logged in as',
    fr: 'Connecté en tant que',
    es: 'Conectado como',
    ar: 'مسجل الدخول باسم',
  },
  visitingAs: {
    en: 'Visiting as',
    fr: 'Visite en tant que',
    es: 'Visitando como',
    ar: 'تتصفح حالياً كـ',
  },
  guestExplorer: {
    en: 'Guest Explorer',
    fr: 'Explorateur Invité',
    es: 'Explorador Invitado',
    ar: 'زائر مستكشف (غير مسجل)',
  },
  verifiedAccount: {
    en: 'Verified User',
    fr: 'Compte Vérifié',
    es: 'Cuenta Verificada',
    ar: 'عضو موثق',
  },
  guestMode: {
    en: 'Guest Mode',
    fr: 'Mode Invité',
    es: 'Modo Invitado',
    ar: 'وضع الزائر',
  },
  yourNameOptional: {
    en: 'Your Name / Nickname (Optional)',
    fr: 'Votre Nom / Pseudo (Optionnel)',
    es: 'Tu Nombre / Apodo (Opcional)',
    ar: 'اسمك أو لقبك (اختياري)',
  },
  namePlaceholder: {
    en: 'e.g. ShadowGamer',
    fr: 'ex. Joueur123',
    es: 'ej. GamerPro',
    ar: 'مثال: جيمر_السر',
  },
  contactOptional: {
    en: 'Email or Discord (Optional)',
    fr: 'Email ou Discord (Optionnel)',
    es: 'Correo o Discord (Opcional)',
    ar: 'البريد أو حساب ديسكورد (اختياري للإشعار)',
  },
  contactPlaceholder: {
    en: 'To notify you when fixed',
    fr: 'Pour vous avertir de la réparation',
    es: 'Para avisarte cuando se arregle',
    ar: 'لإشعارك فور قيام الإدارة بحل المشكلة',
  },
  whatIsIssue: {
    en: 'What is the issue?',
    fr: 'Quel est le problème ?',
    es: '¿Cuál es el problema?',
    ar: 'ما نوع المشكلة التي تواجهها؟',
  },
  whichLinkFailed: {
    en: 'Which download link failed?',
    fr: 'Quel lien de téléchargement a échoué ?',
    es: '¿Qué enlace de descarga falló?',
    ar: 'أي رابط تحميل به المشكلة؟',
  },
  linkAll: {
    en: 'All Links / General Download',
    fr: 'Tous les liens / Téléchargement général',
    es: 'Todos los enlaces / Descarga general',
    ar: 'جميع الروابط / التحميل بالكامل',
  },
  linkFull: {
    en: 'Direct Download / Master Magnet',
    fr: 'Téléchargement Direct / Lien Magnet Principal',
    es: 'Descarga Directa / Master Magnet',
    ar: 'التحميل المباشر / ملف الماغنت الرئيسي',
  },
  linkUtorrent: {
    en: 'Torrent / Magnet Link',
    fr: 'Lien Torrent / Magnet',
    es: 'Enlace Torrent / Magnet',
    ar: 'رابط التورنت / الماغنت',
  },
  linkPreInstalled: {
    en: 'Pre-Installed / Direct Play',
    fr: 'Version Pré-installée / Jeu Direct',
    es: 'Versión Pre-instalada / Juego Directo',
    ar: 'النسخة الجاهزة للتشغيل مباشرة (Pre-Installed)',
  },
  linkMirrors: {
    en: 'Backup Mirrors / Parts Links',
    fr: 'Miroirs de secours / Liens par parties',
    es: 'Servidores de respaldo / Enlaces por partes',
    ar: 'السيرفرات الاحتياطية / روابط الأجزاء المقسمة',
  },
  additionalDetails: {
    en: 'Additional Details for Admin (Optional)',
    fr: 'Détails supplémentaires pour l\'Admin (Optionnel)',
    es: 'Detalles adicionales para el Administrador (Opcional)',
    ar: 'تفاصيل إضافية للإدارة لمساعدتك (اختياري)',
  },
  detailsPlaceholder: {
    en: 'Explain what happened (e.g., link gives 404, asks for unknown archive password, crashes on startup with error...)',
    fr: 'Expliquez ce qui s\'est passé (ex. lien mort 404, mot de passe d\'archive inconnu, crash au démarrage...)',
    es: 'Explica qué pasó (ej. enlace da 404, pide contraseña desconocida, el juego se cierra al iniciar...)',
    ar: 'اشرح ما حدث بدقة (مثال: الرابط يظهر 404، يطلب كلمة سر أرشيف غير موجودة، اللعبة تغلق فجأة برسالة خطأ...)',
  },
  sendToAdmin: {
    en: 'Send to Admin Page',
    fr: 'Envoyer à l\'administration',
    es: 'Enviar al panel de Admin',
    ar: 'إرسال لصفحة الإدارة',
  },
  sendingToAdmin: {
    en: 'Sending to Admin...',
    fr: 'Envoi à l\'admin...',
    es: 'Enviando al Admin...',
    ar: 'جارٍ الإرسال للإدارة...',
  },
  whatsappDirect: {
    en: 'WhatsApp Support',
    fr: 'Support WhatsApp',
    es: 'Soporte WhatsApp',
    ar: 'مراسلة عبر واتساب',
  },
  successTitle: {
    en: 'Report Sent to Admin!',
    fr: 'Signalement envoyé à l\'admin !',
    es: '¡Reporte enviado al Admin!',
    ar: 'تم إرسال البلاغ للإدارة بنجاح!',
  },
  successDesc: {
    en: 'Thank you! Your report has been dispatched to the SecretArea Admin dashboard. The administrator will inspect and fix the links manually.',
    fr: 'Merci ! Votre signalement a été transmis au tableau de bord Admin de SecretArea. L\'administrateur va vérifier et corriger les liens manuellement.',
    es: '¡Gracias! Tu reporte ha sido enviado al panel de administración de SecretArea. El administrador inspeccionará y corregirá los enlaces manualmente.',
    ar: 'شكراً لتعاونك! تم إرسال تقريرك مباشرة إلى لوحة تحكم إدارة SecretArea. سيقوم المشرف بفحص الروابط وإصلاحها يدوياً.',
  },
  statusPending: {
    en: 'Status: Pending Admin Fix',
    fr: 'Statut : En attente de correction Admin',
    es: 'Estado: Pendiente de arreglo por Admin',
    ar: 'الحالة: بانتظار تصحيح ومراجعة الإدارة',
  },
  activeStatusPending: {
    en: 'Current Status: Pending Admin Review',
    fr: 'Statut actuel : En attente de vérification Admin',
    es: 'Estado actual: Pendiente de revisión por Admin',
    ar: 'الحالة الحالية: البلاغ قيد المراجعة والانتظار لدى الإدارة',
  },
  activeStatusInProgress: {
    en: 'Current Status: Admin is Working on this Fix',
    fr: 'Statut actuel : L\'admin est en train de corriger cet élément',
    es: 'Estado actual: El Admin está trabajando en solucionarlo',
    ar: 'الحالة الحالية: الإدارة تعمل حالياً على إصلاح وتحديث الروابط',
  },
  activeStatusFixed: {
    en: 'Current Status: Verified & Fixed by Admin',
    fr: 'Statut actuel : Vérifié et corrigé par l\'admin',
    es: 'Estado actual: Verificado y arreglado por el Admin',
    ar: 'الحالة الحالية: تم فحص وإصلاح الروابط بنجاح من قبل الإدارة',
  },
  close: {
    en: 'Close',
    fr: 'Fermer',
    es: 'Cerrar',
    ar: 'إغلاق',
  },
};

const REPORT_REASONS = [
  {
    id: 'broken_link',
    icon: TbLink,
    color: 'rose',
    title: {
      en: 'Broken / Dead Download Link',
      fr: 'Lien de téléchargement mort / cassé',
      es: 'Enlace de descarga caído / roto',
      ar: 'رابط تحميل معطل أو محذوف',
    },
    desc: {
      en: 'Links give 404, file removed, or download fails to start',
      fr: 'Erreur 404, fichier supprimé ou téléchargement impossible',
      es: 'Error 404, archivo eliminado o descarga fallida',
      ar: 'الروابط تعطي خطأ 404، تم حذف الملف، أو فشل التحميل',
    },
  },
  {
    id: 'corrupt_archive',
    icon: TbArchive,
    color: 'amber',
    title: {
      en: 'Corrupted Archive / Missing Files',
      fr: 'Archive corrompue / Fichiers manquants',
      es: 'Archivo corrupto / Archivos faltantes',
      ar: 'أرشيف تالف أو ملفات ناقصة',
    },
    desc: {
      en: 'CRC checksum error, unrar failure, or missing parts',
      fr: 'Erreur de checksum CRC, échec de décompression ou parties manquantes',
      es: 'Error de suma CRC, fallo al descomprimir o faltan partes',
      ar: 'خطأ فحص CRC، فشل فك الضغط unrar، أو أجزاء مفقودة',
    },
  },
  {
    id: 'game_crash',
    icon: TbBug,
    color: 'red',
    title: {
      en: 'Game Crash / Won\'t Launch',
      fr: 'Le jeu plante / Ne se lance pas',
      es: 'El juego se cierra / No inicia',
      ar: 'اللعبة لا تعمل أو تغلق فجأة',
    },
    desc: {
      en: 'Black screen, missing DLLs, or crashes on startup',
      fr: 'Écran noir, DLLs manquantes ou fermeture brutale au démarrage',
      es: 'Pantalla negra, faltan DLLs o se cierra al iniciar',
      ar: 'شاشة سوداء، ملفات DLL ناقصة، أو إغلاق مفاجئ عند البدء',
    },
  },
  {
    id: 'outdated_version',
    icon: TbRefresh,
    color: 'sky',
    title: {
      en: 'Outdated Version / Needs Update',
      fr: 'Version obsolète / Mise à jour requise',
      es: 'Versión desactualizada / Requiere actualización',
      ar: 'نسخة قديمة بحاجة لتحديث',
    },
    desc: {
      en: 'New game patch, hotfix, or DLC released',
      fr: 'Nouveau patch, correctif ou DLC disponible',
      es: 'Nuevo parche, actualización o DLC lanzado',
      ar: 'صدر تحديث رسمي جديد، باتش تصحيحي، أو إضافات DLC',
    },
  },
  {
    id: 'wrong_info',
    icon: TbHelpCircle,
    color: 'purple',
    title: {
      en: 'Incorrect Info / Other Issue',
      fr: 'Infos incorrectes / Autre problème',
      es: 'Información incorrecta / Otro problema',
      ar: 'بيانات غير صحيحة أو مشكلة أخرى',
    },
    desc: {
      en: 'Wrong title, wrong description, or other technical issue',
      fr: 'Mauvais titre, mauvaise description ou autre souci technique',
      es: 'Título incorrecto, descripción errónea u otro detalle',
      ar: 'اسم غير مطابق، وصف خاطئ، أو مشكلة تقنية أخرى',
    },
  },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  item,
  currentUserProfile,
}) => {
  const { language } = useLanguage();
  const currentLang: Language = (['en', 'fr', 'es', 'ar'].includes(language) ? language : 'en') as Language;
  const isRtl = currentLang === 'ar';

  const currentUser = auth.currentUser;
  const isGuest = !currentUser;

  const [selectedReason, setSelectedReason] = useState<string>('broken_link');
  const [selectedLinkType, setSelectedLinkType] = useState<string>('all');
  const [details, setDetails] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [guestContact, setGuestContact] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if item has an existing active report so user knows what admin is doing
  const existingReport = item?.id ? getItemActiveReport(item.id) : undefined;

  // Helper function to get text safely in active language
  const tr = (key: string): string => {
    return MODAL_I18N[key]?.[currentLang] || MODAL_I18N[key]?.en || key;
  };

  // Lock body scroll and handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const reporterName = !isGuest
        ? currentUserProfile?.displayName || currentUser?.displayName || 'Logged-in User'
        : guestName.trim() || tr('guestExplorer');

      const reporterEmail = !isGuest
        ? currentUserProfile?.email || currentUser?.email || ''
        : guestContact.trim() || '';

      const reasonObj = REPORT_REASONS.find(r => r.id === selectedReason);
      const reasonLabel = reasonObj ? reasonObj.title[currentLang] : selectedReason;

      await submitReport({
        itemId: item.id || 'unknown',
        itemName: item.name || 'Untitled Resource',
        itemCategory: item.category || 'game',
        itemCoverImage: item.coverImage || '',
        itemVersion: item.version || 'v1.0',
        downloadLinks: item.links || {},
        brokenLinkType: selectedLinkType,
        reason: reasonLabel,
        details: details.trim(),
        reporterType: isGuest ? 'guest' : 'user',
        reportedBy: {
          uid: currentUser?.uid || 'guest',
          displayName: reporterName,
          email: reporterEmail,
          guestName: isGuest ? reporterName : undefined,
        },
      });

      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setErrorMessage(err?.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppDirect = () => {
    const reasonObj = REPORT_REASONS.find(r => r.id === selectedReason);
    const reasonLabel = reasonObj ? reasonObj.title[currentLang] : selectedReason;
    const whatsappMessage = `*Report in Secret Area*\n\n*Item:* ${item.name} (${item.id})\n*Category:* ${item.category || 'Game'}\n*Reason:* ${reasonLabel}\n*Details:* ${details || 'Broken link'}\n*From:* ${!isGuest ? currentUser?.email || 'User' : guestName || 'Guest'}`;
    const phoneNumber = '212723242286';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  const modalContent = (
    <div 
      id="report-issue-modal-backdrop"
      className="fixed inset-0 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto overscroll-contain transition-colors"
      style={{ zIndex: 9999999 }}
      onClick={onClose}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 14 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: isRtl ? "'Cairo', sans-serif" : undefined }}
        className="relative w-full max-w-lg md:max-w-xl bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92dvh] sm:max-h-[88vh]"
      >
        {/* Modal Header */}
        <div className="relative px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent shrink-0">
          <div className="flex items-center justify-between gap-3">
            {/* Title & Icon */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-xl sm:rounded-2xl border border-rose-500/25 shrink-0 shadow-xs">
                <TbAlertTriangle size={22} className="sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                  {tr('modalTitle')}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-1">
                  {tr('modalSubtitle')}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label={tr('close')}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <TbX size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {submittedSuccess ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <TbCircleCheck size={36} />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">
              {tr('successTitle')}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              {tr('successDesc')}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold font-mono border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{tr('statusPending')}</span>
            </div>
          </div>
        ) : (
          <form 
            onSubmit={handleSubmit} 
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* Scrollable Form Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-4.5 overflow-y-auto overscroll-contain custom-scrollbar flex-1">
              
              {/* Existing Admin Status Banner (Users can see what admin did) */}
              {existingReport && (
                <div 
                  dir={isRtl ? 'rtl' : 'ltr'}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                    isRtl ? 'text-right' : 'text-left'
                  } ${
                    existingReport.status === 'in_progress'
                      ? 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400'
                      : existingReport.status === 'fixed'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                }`}>
                  {existingReport.status === 'in_progress' ? (
                    <TbRefresh size={18} className="animate-spin shrink-0 text-sky-500" />
                  ) : existingReport.status === 'fixed' ? (
                    <TbCircleCheck size={18} className="shrink-0 text-emerald-500" />
                  ) : (
                    <TbClock size={18} className="shrink-0 text-amber-500" />
                  )}
                  <span className="leading-snug">
                    {existingReport.status === 'in_progress'
                      ? tr('activeStatusInProgress')
                      : existingReport.status === 'fixed'
                      ? tr('activeStatusFixed')
                      : tr('activeStatusPending')}
                  </span>
                </div>
              )}

              {/* Item Preview Card */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.name}
                    className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl object-cover shadow-sm shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 border border-slate-300/60 dark:border-slate-700/60">
                    <TbDeviceGamepad2 size={24} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                      {item.category || 'Game'}
                    </span>
                    {item.version && (
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {item.version}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {item.name}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    ID: {item.id}
                  </p>
                </div>
              </div>

              {/* User / Guest Status Tag */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  {!isGuest ? (
                    <TbUserCheck size={18} className="text-emerald-500 shrink-0" />
                  ) : (
                    <TbGhost size={18} className="text-amber-500 shrink-0" />
                  )}
                  <span className="text-slate-700 dark:text-slate-300 truncate">
                    {!isGuest ? (
                      <>
                        {tr('loggedInAs')}: <strong className="text-slate-900 dark:text-white font-bold">{currentUserProfile?.displayName || currentUser?.displayName || currentUser?.email}</strong>
                      </>
                    ) : (
                      <>
                        {tr('visitingAs')}: <strong className="text-amber-600 dark:text-amber-400 font-bold">{tr('guestExplorer')}</strong>
                      </>
                    )}
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                  !isGuest 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  {!isGuest ? (
                    <>
                      <TbShieldCheck size={12} />
                      <span>{tr('verifiedAccount')}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      <span>{tr('guestMode')}</span>
                    </>
                  )}
                </span>
              </div>

              {/* Guest Form Fields (if visiting as guest) */}
              {isGuest && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('yourNameOptional')}
                    </label>
                    <div className="relative">
                      <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${isRtl ? 'right-3' : 'left-3'}`}>
                        <TbUser size={15} />
                      </div>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder={tr('namePlaceholder')}
                        className={`w-full py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all ${
                          isRtl ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {tr('contactOptional')}
                    </label>
                    <div className="relative">
                      <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${isRtl ? 'right-3' : 'left-3'}`}>
                        <TbMail size={15} />
                      </div>
                      <input
                        type="text"
                        value={guestContact}
                        onChange={(e) => setGuestContact(e.target.value)}
                        placeholder={tr('contactPlaceholder')}
                        className={`w-full py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all ${
                          isRtl ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Issue Reason Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  {tr('whatIsIssue')} <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((reason) => {
                    const isSelected = selectedReason === reason.id;
                    const IconComp = reason.icon;
                    return (
                      <div
                        key={reason.id}
                        onClick={() => setSelectedReason(reason.id)}
                        className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 shadow-sm'
                            : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className={`mt-0.5 p-2 rounded-xl shrink-0 transition-colors ${
                          isSelected 
                            ? 'bg-rose-500 text-white shadow-xs' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          <IconComp size={18} />
                        </div>
                        <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {reason.title[currentLang] || reason.title.en}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {reason.desc[currentLang] || reason.desc.en}
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 transition-all ${
                          isSelected 
                            ? 'border-rose-500 bg-rose-500 text-white' 
                            : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isSelected && <TbCheck size={11} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Specific Link Selection */}
              {selectedReason === 'broken_link' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    {tr('whichLinkFailed')}
                  </label>
                  <div className="relative">
                    <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${isRtl ? 'right-3' : 'left-3'}`}>
                      <TbDownload size={15} />
                    </div>
                    <select
                      value={selectedLinkType}
                      onChange={(e) => setSelectedLinkType(e.target.value)}
                      className={`w-full py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 transition-all ${
                        isRtl ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                      }`}
                    >
                      <option value="all">{tr('linkAll')}</option>
                      <option value="full">{tr('linkFull')}</option>
                      <option value="utorrent">{tr('linkUtorrent')}</option>
                      <option value="preInstalled">{tr('linkPreInstalled')}</option>
                      <option value="mirrors">{tr('linkMirrors')}</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Description Textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  {tr('additionalDetails')}
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder={tr('detailsPlaceholder')}
                    className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 resize-none transition-all ${
                      isRtl ? 'text-right' : 'text-left'
                    }`}
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2">
                  <TbAlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Sticky Modal Footer: Submit & WhatsApp Buttons */}
            <div className="shrink-0 p-3 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-xs flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <TbLoader2 size={18} className="animate-spin" />
                    <span>{tr('sendingToAdmin')}</span>
                  </>
                ) : (
                  <>
                    <TbSend size={18} className={isRtl ? '-scale-x-100' : ''} />
                    <span>{tr('sendToAdmin')}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppDirect}
                title={tr('whatsappDirect')}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all shrink-0 active:scale-98 min-h-[44px]"
              >
                <TbBrandWhatsapp size={19} className="text-emerald-500 shrink-0" />
                <span>{tr('whatsappDirect')}</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );

  // Mount at document.body level via React Portal so it is ALWAYS on top of everything, including fixed navbars
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};

export default ReportModal;
