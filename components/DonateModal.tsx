import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TbHeart, TbX, TbCopy, TbCheck, TbExternalLink, 
  TbShieldCheck, TbBolt, TbLock, TbRefresh, TbQrcode,
  TbMail
} from 'react-icons/tb';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { useLanguage, Language } from '../src/contexts/LanguageContext';

interface DonateModalProps {
  open: boolean;
  onClose: () => void;
}

type TabType = 'gateway' | 'direct';

const MONERO_ADDRESS = '48UqVGkdrErEXVUKWZ9dCkRFxG4qFyzorS2h77K96nG8fdHShgv95k4cPPYWGMoM267PdajjEoLUwG1kyvgSd8vX8VK8RkS';
const TROCADOR_URL = 'https://trocador.app/anonpay/?ticker_to=xmr&network_to=Mainnet&address=48UqVGkdrErEXVUKWZ9dCkRFxG4qFyzorS2h77K96nG8fdHShgv95k4cPPYWGMoM267PdajjEoLUwG1kyvgSd8vX8VK8RkS&donation=True&simple_mode=True&name=SecretArea&description=Support+our+mission+and+help+us+grow.+Every+contribution+makes+a+difference.&email=secretarea1337@gmail.com&buttonbgcolor=e11d48&textcolor=000000&bgcolor=00000000&direct=True';
const WIDGET_FRAME_URL = '/api/crypto-frame';
const CONTACT_EMAIL = 'admin.secretarea1337@proton.me';

// Localized strings dictionary covering en, fr, es, ar
const I18N = {
  badge: {
    en: 'Supporter Hub',
    fr: 'Espace Donateur',
    es: 'Zona de Apoyo',
    ar: 'مركز الدعم والتبرع'
  },
  modalTitle: {
    en: 'Support SecretArea',
    fr: 'Soutenez SecretArea',
    es: 'Apoya a SecretArea',
    ar: 'ادعم منصة SecretArea'
  },
  modalSubtitle: {
    en: '100% Ad-Free, Community Funded & Autonomous',
    fr: '100% Sans Pub, Financé par la Communauté & Autonome',
    es: '100% Sin Publicidad, Financiado por la Comunidad',
    ar: '100% بدون إعلانات، مدعوم من المجتمع ومستقل بالكامل'
  },
  heroHeadline: {
    en: 'Keep the Library Alive',
    fr: 'Gardons la Bibliothèque Libre',
    es: 'Mantén la Biblioteca Libre',
    ar: 'معاً للحفاظ على استمرار المكتبة'
  },
  heroDescription: {
    en: 'SecretArea is crafted by gamers for gamers. We never run aggressive popup ads, monetized shorteners, or data trackers. Your support directly finances fast cloud mirrors, seedboxes, and catalog curation.',
    fr: 'SecretArea est créé par des joueurs pour les joueurs. Jamais de bannières agressives, de réducteurs de liens ou de traqueurs. Vos dons financent directement les serveurs ultra-rapides et les seedboxes.',
    es: 'SecretArea está hecho por jugadores para jugadores. Nunca verás publicidad invasiva ni rastreadores. Tu donación financia directamente servidores de alta velocidad y el mantenimiento del catálogo.',
    ar: 'صُممت منصة SecretArea من مجتمع اللاعبين ولأجلهم. لا إعلانات مزعجة، لا روابط اختصار ربحية، ولا تتبع للبيانات. تبرعاتك تُغطي تكاليف الخوادم السريعة وسيرفرات التحميل وصيانة المحتوى.'
  },
  feature1Title: {
    en: '100% Ad-Free & Clean',
    fr: '100% Sans Pub & Propre',
    es: '100% Sin Publicidad ni Spam',
    ar: '100% خالية من الإعلانات تماماً'
  },
  feature1Desc: {
    en: 'No mining scripts, intrusive popups, or paywalls.',
    fr: 'Pas de mineurs crypto, de popups intrusifs ou de paywall.',
    es: 'Sin minería oculta, popups molestos ni muros de pago.',
    ar: 'بلا برمجيات تعدين، بلا نوافذ منبثقة وبلا اشتراكات مدفوعة.'
  },
  feature2Title: {
    en: 'High-Speed Mirrors & Storage',
    fr: 'Miroirs et Stockage Haute Vitesse',
    es: 'Servidores y Espejos de Alta Velocidad',
    ar: 'سيرفرات تحميل وتخزين فائقة السرعة'
  },
  feature2Desc: {
    en: 'Maintaining fast torrent swarms and verified direct cloud archives.',
    fr: 'Maintien de seeders torrents véloces et archives cloud directes.',
    es: 'Mantiene semillas rápidas de torrent y archivos directos en la nube.',
    ar: 'تأمين اتصالات تورنت نشطة وروابط سحابية مباشرة وسريعة.'
  },
  feature3Title: {
    en: 'Direct Monero (XMR) & Crypto Gateway',
    fr: 'Monero Direct (XMR) & Passerelle Crypto',
    es: 'Monero Directo (XMR) y Pasarela Crypto',
    ar: 'دعم مباشر عبر مونيرو (XMR) وبوابة العملات'
  },
  feature3Desc: {
    en: 'Decentralized, untraceable, and censorship-resistant.',
    fr: 'Décentralisé, intraçable et résistant à la censure.',
    es: 'Descentralizado, no rastreable y resistente a la censura.',
    ar: 'لامركزي، مجهول الهوية بالكامل وغير خاضع لأي قيود.'
  },
  tabGateway: {
    en: 'Instant Crypto Widget',
    fr: 'Widget Crypto Instantané',
    es: 'Widget Crypto Instantáneo',
    ar: 'بوابة الدفع الفوري (Widget)'
  },
  tabDirect: {
    en: 'Direct Monero (XMR)',
    fr: 'Monero Direct (XMR)',
    es: 'Monero Directo (XMR)',
    ar: 'تحويل مونيرو المباشر'
  },
  gatewayBannerTitle: {
    en: 'Pay With Any Cryptocurrency',
    fr: 'Payez avec n\'importe quelle crypto',
    es: 'Paga con cualquier criptomoneda',
    ar: 'ادفع بأي عملة مشفرة متوفرة لديك'
  },
  gatewayBannerSubtitle: {
    en: 'Pay seamlessly with Bitcoin, Ethereum, USDT, Solana, Litecoin, etc. automatically forwarded to our anonymous Monero vault.',
    fr: 'Payez simplement en Bitcoin, Ethereum, USDT, Solana, Litecoin, convertis automatiquement vers notre coffre Monero.',
    es: 'Paga fácilmente con Bitcoin, Ethereum, USDT, Solana, Litecoin, convertidos automáticamente a nuestra bóveda segura.',
    ar: 'ادفع ببيتكوين، إيثيريوم، USDT، سولانا، لايتكوين وغيرها، ويتم تحويلها تلقائياً وبأمان لمستودع مونيرو المستقل.'
  },
  openExternal: {
    en: 'Open in New Window',
    fr: 'Ouvrir dans une nouvelle fenêtre',
    es: 'Abrir en nueva ventana',
    ar: 'فتح في نافذة جديدة'
  },
  reloadGateway: {
    en: 'Reload Widget',
    fr: 'Recharger',
    es: 'Recargar',
    ar: 'إعادة التحميل'
  },
  loadingGateway: {
    en: 'Connecting to Trocador AnonPay Widget...',
    fr: 'Connexion au widget de paiement...',
    es: 'Conectando con el widget de pago...',
    ar: 'جارٍ الاتصال ببوابة الدفع المشفرة...'
  },
  directAddressTitle: {
    en: 'Monero (XMR) Official Wallet',
    fr: 'Adresse Officielle Monero (XMR)',
    es: 'Dirección Oficial de Monero (XMR)',
    ar: 'عنوان محفظة مونيرو الرسمية (XMR)'
  },
  directNetwork: {
    en: 'Network: Monero Mainnet',
    fr: 'Réseau : Monero Mainnet',
    es: 'Red: Monero Mainnet',
    ar: 'الشبكة: شبكة مونيرو الرئيسية (Mainnet)'
  },
  copyAddress: {
    en: 'Copy Address',
    fr: 'Copier l\'adresse',
    es: 'Copiar dirección',
    ar: 'نسخ عنوان المحفظة'
  },
  copiedSuccess: {
    en: 'Address Copied! Thank you!',
    fr: 'Adresse copiée ! Merci !',
    es: '¡Dirección copiada! ¡Gracias!',
    ar: 'تم نسخ العنوان بنجاح! شكراً لك!'
  },
  scanQrPrompt: {
    en: 'Scan with your mobile crypto wallet (Cake Wallet, Monerujo, Feather, etc.)',
    fr: 'Scannez avec votre portefeuille mobile (Cake Wallet, Monerujo, Feather...)',
    es: 'Escanea con tu billetera móvil (Cake Wallet, Monerujo, Feather, etc.)',
    ar: 'امسح الرمز بواسطة محفظتك بالهاتف أو الحاسوب (Cake Wallet، Monerujo، Feather وغيرها)'
  },
  contactNote: {
    en: 'Direct contact & administration inquiries:',
    fr: 'Contact direct & administration :',
    es: 'Contacto directo y administración:',
    ar: 'للتواصل المباشر مع الإدارة والاستفسارات:'
  },
  closeBtn: {
    en: 'Close',
    fr: 'Fermer',
    es: 'Cerrar',
    ar: 'إغلاق'
  },
  thankYouHeart: {
    en: 'Thank you for keeping SecretArea free for everyone!',
    fr: 'Merci d\'aider SecretArea à rester libre pour tous !',
    es: '¡Gracias por mantener SecretArea libre para todos!',
    ar: 'شكراً لك على دعمك لاستمرار SecretArea حرة للجميع!'
  },
  adblockBadge: {
    en: 'Shield / AdBlocker Active',
    fr: 'Bloqueur / Bouclier Détecté',
    es: 'Escudo / Bloqueador Activo',
    ar: 'مانع الإعلانات أو حظر الإطارات مفعل'
  },
  adblockHeadline: {
    en: 'Embedded Gateway Restricted',
    fr: 'Passerelle Intégrée Restreinte',
    es: 'Pasarela Integrada Bloqueada',
    ar: 'تعذر تشغيل الإطار المدمج للعملات'
  },
  adblockDescription: {
    en: 'Browser shields (Brave, uBlock, AdGuard) block third-party crypto iframes. Open the standalone secure checkout or pay via direct Monero.',
    fr: 'Votre navigateur ou bloqueur bloque les widgets crypto tiers. Ouvrez la page sécurisée ou payez via Monero direct.',
    es: 'Los escudos del navegador bloquean los iframes de criptomonedas. Abre el pago seguro directo o usa la dirección Monero.',
    ar: 'تقوم حماية المتصفح أو مانع الإعلانات بحظر إطارات الدفع. يرجى فتح صفحة الدفع المباشرة أو استخدام محفظة مونيرو مباشرة.'
  },
  adblockOpenBtn: {
    en: 'Open Crypto Checkout (Trocador)',
    fr: 'Ouvrir le Paiement Crypto (Trocador)',
    es: 'Abrir Pasarela Crypto (Trocador)',
    ar: 'فتح بوابة الدفع الفوري (Trocador)'
  },
  adblockDirectBtn: {
    en: 'Switch to Direct Monero (XMR)',
    fr: 'Passer au Monero Direct (XMR)',
    es: 'Cambiar a Monero Directo (XMR)',
    ar: 'التحويل المباشر عبر مونيرو (XMR)'
  },
  adblockRetryBtn: {
    en: 'Retry Loading Widget',
    fr: 'Réessayer le widget',
    es: 'Reintentar cargar widget',
    ar: 'إعادة محاولة التحميل'
  },
  adblockNotice: {
    en: 'Having issues with AdBlocker?',
    fr: 'Problème avec le bloqueur ?',
    es: '¿Problemas con el bloqueador?',
    ar: 'هل تواجه مشكلة مع مانع الإعلانات؟'
  },
  openDirectCheckout: {
    en: 'Open Direct Checkout ↗',
    fr: 'Ouvrir le paiement direct ↗',
    es: 'Abrir pago directo ↗',
    ar: 'فتح الدفع المباشر ↗'
  }
};

const DonateModal: React.FC<DonateModalProps> = ({ open, onClose }) => {
  const { language, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('gateway');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [widgetBlocked, setWidgetBlocked] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const currentLang = (['en', 'fr', 'es', 'ar'].includes(language) ? language : 'en') as Language;

  // Localized string resolver
  const text = (key: keyof typeof I18N): string => {
    return I18N[key]?.[currentLang] || I18N[key]?.en || '';
  };

  // Generate QR Code on mount
  useEffect(() => {
    let isMounted = true;
    const generateQr = async () => {
      try {
        const url = await QRCode.toDataURL(
          `monero:${MONERO_ADDRESS}?tx_description=SecretArea%20Donation`,
          {
            width: 320,
            margin: 1.5,
            color: {
              dark: '#0f172a',
              light: '#ffffff'
            }
          }
        );
        if (isMounted) {
          setQrDataUrl(url);
        }
      } catch (err) {
        console.error('Failed to generate QR code', err);
      }
    };
    generateQr();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Copy Monero address with animation and confetti
  const handleCopyAddress = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(MONERO_ADDRESS);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = MONERO_ADDRESS;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#f43f5e', '#fb7185', '#fbbf24', '#f59e0b', '#ec4899']
        });
      } catch {
        // ignore if not supported
      }

      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Monitor loading of iframe to detect adblocker blocks or timeout
  useEffect(() => {
    if (!open || activeTab !== 'gateway') return;
    setIframeLoaded(false);
    setWidgetBlocked(false);

    const timer = setTimeout(() => {
      // If after 4500ms the frame hasn't loaded, trigger adblocker/shield solution
      setIframeLoaded((prevLoaded) => {
        if (!prevLoaded) {
          setWidgetBlocked(true);
        }
        return prevLoaded;
      });
    }, 4500);

    return () => clearTimeout(timer);
  }, [open, activeTab, iframeKey]);

  const handleReloadIframe = () => {
    setIframeLoaded(false);
    setWidgetBlocked(false);
    setIframeKey((prev) => prev + 1);
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[999999] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        dir={dir}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]"
        >
          {/* Top Brand & Gradient Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

          {/* Modal Header Bar */}
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/60">
            {/* Title & Badge */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/60 dark:border-rose-500/30">
                <TbHeart className="w-5 h-5 fill-rose-500/20" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 id="support-modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                    {text('modalTitle')}
                  </h2>
                  <span className="hidden sm:inline-flex text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                    {text('badge')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {text('modalSubtitle')}
                </p>
              </div>
            </div>

            {/* Right Controls: Close Button (Language buttons removed as requested) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer"
                aria-label={text('closeBtn')}
              >
                <TbX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Main Content Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
            {/* Left Column: Mascot Showcase & Project Impact (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-gradient-to-b from-rose-50/50 via-slate-50 to-white dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
              <div>
                {/* Visual Mascot Container */}
                <div className="relative flex justify-center items-center py-2 sm:py-3 group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 via-amber-500/10 to-transparent rounded-3xl blur-xl group-hover:opacity-100 transition-opacity" />
                  <img
                    src="/images/Donation.png"
                    alt="SecretArea Mascot Supporter"
                    className="relative z-10 w-36 sm:w-44 md:w-52 lg:w-56 h-auto object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
                    loading="eager"
                  />
                </div>

                {/* Hero Title & Description */}
                <div className="mt-2 sm:mt-4 text-center lg:text-start">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {text('heroHeadline')}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {text('heroDescription')}
                  </p>
                </div>

                {/* Trust & Impact Points */}
                <div className="mt-4 sm:mt-5 space-y-2.5">
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                      <TbShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {text('feature1Title')}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                        {text('feature1Desc')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                      <TbBolt className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {text('feature2Title')}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                        {text('feature2Desc')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                      <TbLock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {text('feature3Title')}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                        {text('feature3Desc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact email footer note */}
              <div className="mt-5 pt-3 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <a 
                  href={`mailto:${CONTACT_EMAIL}`} 
                  className="flex items-center gap-1.5 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium"
                >
                  <TbMail className="w-3.5 h-3.5 text-rose-500" />
                  <span className="font-mono text-[11px]">{CONTACT_EMAIL}</span>
                </a>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  SecretArea ❤️
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Tabs & Gateways (lg:col-span-7) */}
            <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col bg-white dark:bg-slate-900">
              {/* Navigation Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 shrink-0">
                <button
                  onClick={() => setActiveTab('gateway')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'gateway'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <TbBolt className="w-4 h-4 shrink-0" />
                  <span className="truncate">{text('tabGateway')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('direct')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'direct'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <TbQrcode className="w-4 h-4 shrink-0" />
                  <span className="truncate">{text('tabDirect')}</span>
                </button>
              </div>

              {/* Tab Content Panels */}
              <div className="mt-4 flex-1 flex flex-col min-h-0">
                {/* TAB 1: TROCADOR ANONPAY GATEWAY WIDGET */}
                {activeTab === 'gateway' && (
                  <motion.div
                    key="tab-gateway"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-col flex-1"
                  >
                    {/* Gateway explainer card */}
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300/50 dark:border-amber-500/30 flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
                          <TbBolt className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {text('gatewayBannerTitle')}
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-0.5">
                            {text('gatewayBannerSubtitle')}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={handleReloadIframe}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
                          title={text('reloadGateway')}
                          aria-label={text('reloadGateway')}
                        >
                          <TbRefresh className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={TROCADOR_URL}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                          title={text('openExternal')}
                          aria-label={text('openExternal')}
                        >
                          <TbExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Styled Widget Container */}
                    <div className="relative flex-1 min-h-[370px] w-full bg-slate-50 dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-slate-800/90 shadow-inner flex flex-col items-center justify-center p-2 sm:p-3 overflow-hidden">
                      {!iframeLoaded && !widgetBlocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center z-10 bg-slate-50/90 dark:bg-[#080d1a]/90 backdrop-blur-xs">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                            className="text-rose-500"
                          >
                            <TbRefresh className="w-7 h-7" />
                          </motion.div>
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 animate-pulse uppercase tracking-wider">
                            {text('loadingGateway')}
                          </p>
                        </div>
                      )}

                      {/* Responsive Styled Iframe Widget or Anti-Adblock Resolution */}
                      <div className="w-full max-w-[340px] flex items-center justify-center overflow-hidden rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-950/80 min-h-[350px]">
                        {widgetBlocked ? (
                          <div className="w-[310px] h-[350px] p-5 flex flex-col items-center justify-between text-center bg-slate-900/95 text-white rounded-xl border border-amber-500/25 shadow-inner">
                            <div className="flex flex-col items-center pt-1">
                              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-2.5">
                                <TbShieldCheck className="w-6 h-6 text-amber-400" />
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-1.5">
                                {text('adblockBadge')}
                              </span>
                              <h4 className="text-sm font-bold text-white mb-1">
                                {text('adblockHeadline')}
                              </h4>
                              <p className="text-[11px] text-slate-400 leading-snug max-w-[260px]">
                                {text('adblockDescription')}
                              </p>
                            </div>

                            <div className="w-full space-y-2 pb-1">
                              <a
                                href={TROCADOR_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                              >
                                <TbExternalLink className="w-4 h-4" />
                                <span>{text('adblockOpenBtn')}</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => setActiveTab('direct')}
                                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                              >
                                <TbQrcode className="w-3.5 h-3.5 text-amber-400" />
                                <span>{text('adblockDirectBtn')}</span>
                              </button>

                              <button
                                type="button"
                                onClick={handleReloadIframe}
                                className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1 mx-auto pt-0.5 cursor-pointer"
                              >
                                <TbRefresh className="w-3 h-3" />
                                <span>{text('adblockRetryBtn')}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <iframe
                            key={iframeKey}
                            src={WIDGET_FRAME_URL}
                            width="310"
                            height="350"
                            title="Trocador AnonPay Support Widget"
                            className="w-[310px] h-[350px] dark:opacity-95 rounded-lg border-0"
                            style={{
                              border: 0,
                              opacity: iframeLoaded ? 1 : 0,
                              transition: 'opacity 0.4s ease-in-out'
                            }}
                            scrolling="no"
                            onLoad={() => {
                              setIframeLoaded(true);
                              setWidgetBlocked(false);
                            }}
                            onError={() => {
                              setWidgetBlocked(true);
                            }}
                          />
                        )}
                      </div>
                      
                      {/* Responsive single-line footer text */}
                      <div className="mt-2.5 w-full flex items-center justify-center text-center px-1">
                        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-sans tracking-tight">
                          <span className="whitespace-nowrap">Powered by Trocador AnonPay · Instant Swap to Monero</span>
                          <span className="text-slate-400 dark:text-slate-600">·</span>
                          <a
                            href={TROCADOR_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whitespace-nowrap text-amber-600 dark:text-amber-400/90 hover:text-amber-500 dark:hover:text-amber-300 transition-colors underline decoration-dotted font-medium inline-flex items-center gap-0.5"
                          >
                            <span>{text('adblockNotice')} {text('openDirectCheckout')}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 2: DIRECT MONERO (XMR) & QR CODE */}
                {activeTab === 'direct' && (
                  <motion.div
                    key="tab-direct"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-col flex-1 space-y-4"
                  >
                    {/* Header info card */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm">
                          XMR
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {text('directAddressTitle')}
                          </h4>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            {text('directNetwork')}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                        Mainnet · 0% Fee
                      </span>
                    </div>

                    {/* QR Code Presentation Box */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                        {qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt="Monero XMR QR Code"
                            className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-lg"
                          />
                        ) : (
                          <div className="w-36 h-36 flex items-center justify-center text-slate-400">
                            <TbRefresh className="w-6 h-6 animate-spin" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 text-center sm:text-start">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white mb-1">
                          <TbQrcode className="w-4 h-4 text-rose-500" />
                          <span>{text('tabDirect')}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                          {text('scanQrPrompt')}
                        </p>

                        <button
                          onClick={handleCopyAddress}
                          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer ${
                            copied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600 hover:bg-rose-700 text-white'
                          }`}
                        >
                          {copied ? (
                            <>
                              <TbCheck className="w-4 h-4" />
                              <span>{text('copiedSuccess')}</span>
                            </>
                          ) : (
                            <>
                              <TbCopy className="w-4 h-4" />
                              <span>{text('copyAddress')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Address Box */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>Direct Monero (XMR) Address</span>
                        <span className="text-[10px] text-slate-400 font-mono">95 chars</span>
                      </div>
                      <div className="relative group">
                        <div 
                          onClick={handleCopyAddress}
                          className="w-full p-3 bg-slate-100 dark:bg-slate-950 font-mono text-[11px] sm:text-xs text-slate-800 dark:text-slate-200 rounded-xl border border-slate-300/80 dark:border-slate-800 break-all select-all hover:border-rose-400 dark:hover:border-rose-500 transition-colors cursor-pointer"
                        >
                          {MONERO_ADDRESS}
                        </div>
                        <button
                          onClick={handleCopyAddress}
                          className="absolute end-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-rose-50 dark:hover:bg-slate-700 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          {copied ? text('copiedSuccess') : text('copyAddress')}
                        </button>
                      </div>
                    </div>

                    {/* Privacy Note */}
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                      <TbShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Monero transactions are cryptographically private, untraceable, and decentralized. Your support directly empowers SecretArea infrastructure.</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer Banner */}
          <div className="px-4 py-3 sm:px-6 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium text-center sm:text-start flex items-center gap-1.5">
              <span>{text('thankYouHeart')}</span>
            </p>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {CONTACT_EMAIL}
              </a>
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
              >
                {text('closeBtn')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default DonateModal;
