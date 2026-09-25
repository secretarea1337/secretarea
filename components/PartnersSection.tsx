import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../src/contexts/LanguageContext';
import { 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  Layers, 
  Gamepad2, 
  Download, 
  Terminal, 
  HardDrive, 
  Film, 
  Cpu, 
  Box, 
  Check, 
  Copy, 
  Flame, 
  Search,
  Activity,
  ArrowUpRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface PartnerData {
  id: string;
  name: string;
  category: {
    en: string;
    fr: string;
    es: string;
    ar: string;
  };
  description: {
    en: string;
    fr: string;
    es: string;
    ar: string;
  };
  badge: {
    en: string;
    fr: string;
    es: string;
    ar: string;
  };
  tag: string;
  themeColor: {
    border: string;
    glow: string;
    bgBadge: string;
    textBadge: string;
    gradient: string;
    accent: string;
  };
  stats: {
    en: string;
    fr: string;
    es: string;
    ar: string;
  };
  url?: string;
  iconType: 'game' | 'download' | 'terminal' | 'storage' | 'film' | 'cpu' | 'box' | 'layers';
}

export const PARTNERS_DATA: PartnerData[] = [
  {
    id: 'fitgirl',
    name: 'FitgirlRepacks',
    category: {
      en: 'Lossless Game Repacks',
      fr: 'Repacks de Jeux Sans Perte',
      es: 'Repacks de Juegos Sin Pérdidas',
      ar: 'حزم ريباك ألعاب فائقة الضغط'
    },
    description: {
      en: 'World-renowned ultra-compressed game repacks with rigorous MD5 checksum verification.',
      fr: 'Repacks de jeux ultra-compressés reconnus mondialement avec vérification MD5 rigoureuse.',
      es: 'Repacks de juegos ultracomprimidos de renombre mundial con verificación MD5 exhaustiva.',
      ar: 'أشهر حزم ريباك عالمية للألعاب فائقة الضغط مع فحص مطابقة وتأكيد النزاهة الرقمية.'
    },
    badge: {
      en: 'Verified Repacker',
      fr: 'Repacker Vérifié',
      es: 'Repacker Verificado',
      ar: 'معيد حزم معتمد'
    },
    tag: 'REPACKS',
    themeColor: {
      border: 'hover:border-emerald-500/60 dark:hover:border-emerald-400/60',
      glow: 'hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)]',
      bgBadge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      textBadge: 'text-emerald-500',
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      accent: '#10b981'
    },
    stats: {
      en: '100% Lossless',
      fr: '100% Sans Perte',
      es: '100% Sin Pérdidas',
      ar: '100% جودة كاملة'
    },
    url: 'https://fitgirl-repacks.site',
    iconType: 'game'
  },
  {
    id: 'steamunlocked',
    name: 'SteamUnlocked',
    category: {
      en: 'Pre-Installed PC Games',
      fr: 'Jeux PC Pré-Installés',
      es: 'Juegos PC Preinstalados',
      ar: 'ألعاب كمبيوتر مجهزة مسبقاً'
    },
    description: {
      en: 'Pre-installed direct games with runtime libraries included, ready to unpack and play immediately.',
      fr: 'Jeux directs pré-installés avec bibliothèques d\'exécution incluses, prêts à jouer immédiatement.',
      es: 'Juegos directos preinstalados con librerías incluidas, listos para descomprimir y jugar.',
      ar: 'ألعاب جاهزة ومجهزة مسبقاً مع حزم التشغيل الأساسية، قم بفك الضغط والعب فوراً.'
    },
    badge: {
      en: 'Instant Play',
      fr: 'Jeu Instantané',
      es: 'Juego Directo',
      ar: 'تشغيل فوري'
    },
    tag: 'PRE-INSTALLED',
    themeColor: {
      border: 'hover:border-sky-500/60 dark:hover:border-sky-400/60',
      glow: 'hover:shadow-[0_8px_30px_rgba(14,165,233,0.2)]',
      bgBadge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
      textBadge: 'text-sky-500',
      gradient: 'from-sky-500/20 via-blue-500/10 to-transparent',
      accent: '#0ea5e9'
    },
    stats: {
      en: 'Direct Run',
      fr: 'Exécution Directe',
      es: 'Ejecución Directa',
      ar: 'تشغيل مباشر'
    },
    url: 'https://steamunlocked.net',
    iconType: 'download'
  },
  {
    id: 'ankergames',
    name: 'AnkerGames',
    category: {
      en: 'High-Bandwidth Mirrors',
      fr: 'Miroirs Haut Débit',
      es: 'Servidores de Alta Velocidad',
      ar: 'سيرفرات تحميل فائقة السرعة'
    },
    description: {
      en: 'Blazing fast cloud mirrors, unthrottled multipart gaming packages and multi-host support.',
      fr: 'Miroirs cloud ultra rapides, paquets de jeux multi-parties sans bridage et multi-hébergeurs.',
      es: 'Servidores en la nube de alta velocidad con descargas multiparte sin límites.',
      ar: 'سيرفرات سحابية صاروخية تدعم تقسيم الأجزاء وسرعات غير محدودة بروابط مباشرة.'
    },
    badge: {
      en: 'Fast Cloud Mirror',
      fr: 'Miroir Cloud Rapide',
      es: 'Espejo Cloud Rápido',
      ar: 'سيرفر سحابي سريع'
    },
    tag: 'CLOUD MIRROR',
    themeColor: {
      border: 'hover:border-indigo-500/60 dark:hover:border-indigo-400/60',
      glow: 'hover:shadow-[0_8px_30px_rgba(99,102,241,0.2)]',
      bgBadge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      textBadge: 'text-indigo-500',
      gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
      accent: '#6366f1'
    },
    stats: {
      en: 'Multi-Part CDN',
      fr: 'CDN Multi-Parties',
      es: 'CDN Multiparte',
      ar: 'سيرفرات CDN'
    },
    url: 'https://ankergames.net',
    iconType: 'storage'
  },
  {
    id: 'stemtools',
    name: 'StemTools',
    category: {
      en: 'Game Depot & Platform Tools',
      fr: 'Outils Dépôt & Plateformes',
      es: 'Herramientas de Depot y Juegos',
      ar: 'أدوات إدارة وحزم الألعاب'
    },
    description: {
      en: 'Essential gaming utilities, Steam manifest handlers, depot unlockers, and management scripts.',
      fr: 'Utilitaires gaming essentiels, gestionnaires de manifestes Steam et scripts d\'administration.',
      es: 'Utilidades esenciales de juegos, gestores de manifiestos y scripts de desbloqueo.',
      ar: 'أدوات أساسية لإدارة ملفات المنصات، قراءة ملفات المانفيست، وأتمتة إدارة الألعاب.'
    },
    badge: {
      en: 'Tool Suite',
      fr: 'Suite d\'Outils',
      es: 'Suite de Herramientas',
      ar: 'حزمة أدوات'
    },
    tag: 'UTILITIES',
    themeColor: {
      border: 'hover:border-cyan-500/60 dark:hover:border-cyan-400/60',
      glow: 'hover:shadow-[0_8px_30px_rgba(6,182,212,0.2)]',
      bgBadge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      textBadge: 'text-cyan-500',
      gradient: 'from-cyan-500/20 via-teal-500/10 to-transparent',
      accent: '#06b6d4'
    },
    stats: {
      en: 'Depot & Manifests',
      fr: 'Dépôts & Manifestes',
      es: 'Depots y Manifiestos',
      ar: 'إدارة المانفيست'
    },
    url: 'https://steamtools.net',
    iconType: 'terminal'
  },
  {
    id: '1337x',
    name: '1337x',
    category: {
      en: 'Curated P2P Torrent Index',
      fr: 'Index Torrent P2P Vérifié',
      es: 'Índice Torrent P2P Verificado',
      ar: 'فهرس تورنت P2P موثوق'
    },
    description: {
      en: 'Community-moderated peer-to-peer directory with active seeders, VIP uploads, and clean tracker links.',
      fr: 'Répertoire pair-à-pair modéré par la communauté avec seeders actifs et liens de trackers vérifiés.',
      es: 'Directorio P2P moderado por la comunidad con seeders activos y enlaces limpios.',
      ar: 'فهرس مجتمعي منظم لملفات التورنت مع سرعات عالية ومشاركين نشطين وإصدارات مفحوصة.'
    },
    badge: {
      en: 'VIP Tracker',
      fr: 'Tracker VIP',
      es: 'Tracker VIP',
      ar: 'تراكر موثوق'
    },
    tag: 'TORRENT P2P',
    themeColor: {
      border: 'hover:border-amber-500/60 dark:hover:border-amber-400/60',
      glow: 'hover:shadow-[0_8px_30px_rgba(245,158,11,0.2)]',
      bgBadge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      textBadge: 'text-amber-500',
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      accent: '#f59e0b'
    },
    stats: {
      en: 'High Seeder Ratio',
      fr: 'Ratio de Seed Élevé',
      es: 'Alto Ratio de Seeders',
      ar: 'سرعات عالية'
    },
    url: 'https://1337x.to',
    iconType: 'layers'
  },
  {
    id: 'crackshash',
    name: 'CracksHash',
    category: {
      en: 'Clean Windows & OS Software',
      fr: 'Logiciels PC & Utilitaires OS',
      es: 'Software Limpio para Windows',
      ar: 'برمجيات وأنظمة تشغيل نظيفة'
    },
    description: {
      en: 'Verified digital software releases with SHA-256 hash checks and zero-malware policy.',
      fr: 'Distributions logicielles vérifiées avec hachages SHA-256 et politique zéro malware.',
      es: 'Lanzamientos de software verificados con hashes SHA-256 y política estricta de seguridad.',
      ar: 'إصدارات برمجية مفحوصة مع مطابقة شفرات التشفير SHA-256 وسياسة أمان صارمة.'
    },
    badge: {
      en: 'Verified Hash',
      fr: 'Hash Vérifié',
      es: 'Hash Verificado',
      ar: 'بصمة موثقة'
    },
    tag: 'CLEAN SOFTWARE',
    themeColor: {
      border: 'hover:border-rose-500/60 dark:hover:border-rose-400/60',
      glow: 'hover:shadow-[0_8px_30px_rgba(244,63,94,0.2)]',
      bgBadge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      textBadge: 'text-rose-500',
      gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
      accent: '#f43f5e'
    },
    stats: {
      en: 'SHA-256 Verified',
      fr: 'Vérifié SHA-256',
      es: 'Verificado SHA-256',
      ar: 'فحص SHA-256'
    },
    url: 'https://crackshash.com',
    iconType: 'cpu'
  },
  {
    id: 'yts',
    name: 'yts',
    category: {
      en: 'High-Efficiency Cinema Encodes',
      fr: 'Encodages Cinéma Haute Efficacité',
      es: 'Codificaciones de Cine Eficientes',
      ar: 'ترميز سينمائي فائق الدقة'
    },
    description: {
      en: 'Optimized x264/x265 high-definition encodes delivering crystal 1080p and 4K at minimal file sizes.',
      fr: 'Encodages haute définition x264/x265 optimisés avec qualité 1080p/4K et taille de fichier minimale.',
      es: 'Codificaciones optimizadas en x264/x265 con excelente calidad 1080p/4K y tamaño mínimo.',
      ar: 'ترميز متقدم x264 وx265 يوفر دقة 1080p و4K فائقة النقاء بأصغر أحجام ممكنة.'
    },
    badge: {
      en: 'HD Encodes',
      fr: 'Encodages HD',
      es: 'Codificación HD',
      ar: 'ترميز عالي النقاء'
    },
    tag: 'CINEMA 4K',
    themeColor: {
      border: 'hover:border-red-500/60 dark:hover:border-red-400/60',
      glow: 'hover:shadow-[0_8px_30px_rgba(239,68,68,0.2)]',
      bgBadge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
      textBadge: 'text-red-500',
      gradient: 'from-red-500/20 via-rose-500/10 to-transparent',
      accent: '#ef4444'
    },
    stats: {
      en: '1080p & 4K x265',
      fr: '1080p & 4K x265',
      es: '1080p y 4K x265',
      ar: '1080p و 4K'
    },
    url: 'https://yts.mx',
    iconType: 'film'
  },
  {
    id: 'appdoze',
    name: 'AppDoze',
    category: {
      en: 'Curated Windows & Mac Suites',
      fr: 'Suites Windows & Mac Sélectionnées',
      es: 'Suites Seleccionadas Windows y Mac',
      ar: 'تطبيقات مختارة لويندوز وماك'
    },
    description: {
      en: 'Reliable distribution of productivity tools, audio workstations, video suites, and design software.',
      fr: 'Distribution fiable d\'outils de productivité, stations audio, suites vidéo et logiciels de design.',
      es: 'Distribución confiable de herramientas de productividad, diseño gráfico y edición multimedia.',
      ar: 'توزيع موثوق لبرامج التصميم والمونتاج، أدوات الإنتاجية، والتطبيقات الإبداعية لأنظمة التشغيل.'
    },
    badge: {
      en: 'Creator Suite',
      fr: 'Suite Créateur',
      es: 'Suite Creativa',
      ar: 'برامج المبدعين'
    },
    tag: 'CREATIVE APPS',
    themeColor: {
      border: 'hover:border-blue-500/60 dark:hover:border-blue-400/60',
      glow: 'hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)]',
      bgBadge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      textBadge: 'text-blue-500',
      gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
      accent: '#3b82f6'
    },
    stats: {
      en: 'Mac & PC Tested',
      fr: 'Testé Mac & PC',
      es: 'Probado en Mac y PC',
      ar: 'متوافق مع ويندوز وماك'
    },
    url: 'https://appdoze.com',
    iconType: 'box'
  },
  {
    id: 'filecr',
    name: 'FileCR',
    category: {
      en: 'Direct Engineering & PC Soft',
      fr: 'Logiciels PC & Ingénierie Directs',
      es: 'Software de Ingeniería y PC Directo',
      ar: 'برمجيات الهندسة والتصميم'
    },
    description: {
      en: 'Massive direct-download library of CAD, 3D modeling, rendering plugins, and professional toolkits.',
      fr: 'Vaste bibliothèque en téléchargement direct de logiciels CAO, modélisation 3D et plugins professionnels.',
      es: 'Gran biblioteca de descarga directa para software CAD, modelado 3D, plugins y herramientas de ingeniería.',
      ar: 'مكتبة ضخمة للتحميل المباشر لبرامج الهندسة والتصميم ثلاثي الأبعاد وملحقات التصيير الاحترافية.'
    },
    badge: {
      en: 'Direct Download',
      fr: 'Téléchargement Direct',
      es: 'Descarga Directa',
      ar: 'تحميل مباشر'
    },
    tag: 'PRO TOOLKIT',
    themeColor: {
      border: 'hover:border-purple-500/60 dark:hover:border-purple-400/60',
      glow: 'hover:shadow-[0_8px_30px_rgba(168,85,247,0.2)]',
      bgBadge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      textBadge: 'text-purple-500',
      gradient: 'from-purple-500/20 via-fuchsia-500/10 to-transparent',
      accent: '#a855f7'
    },
    stats: {
      en: 'High Speed Cloud',
      fr: 'Cloud Haute Vitesse',
      es: 'Nube de Alta Velocidad',
      ar: 'تحميل سحابي'
    },
    url: 'https://filecr.com',
    iconType: 'layers'
  },
  {
    id: 'mutaz',
    name: 'Mutaz',
    category: {
      en: 'Essential Drivers & System Tools',
      fr: 'Pilotes Essentiels & Utilitaires',
      es: 'Controladores y Herramientas Esenciales',
      ar: 'برامج أساسية وتعريفات النظام'
    },
    description: {
      en: 'Legendary one-click software portal providing clean essential runtimes, antivirus, and utilities.',
      fr: 'Portail légendaire de logiciels en un clic fournissant runtimes essentiels, antivirus et utilitaires.',
      es: 'Legendario portal de software en un clic que ofrece componentes esenciales, antivirus y utilidades.',
      ar: 'الموقع العربي العريق لتحميل أهم البرامج الأساسية بضغطة واحدة مع حزم التعريفات والتشغيل النظيفة.'
    },
    badge: {
      en: 'Essential Utilities',
      fr: 'Utilitaires Essentiels',
      es: 'Utilidades Esenciales',
      ar: 'برامج لا غنى عنها'
    },
    tag: 'ESSENTIALS',
    themeColor: {
      border: 'hover:border-teal-500/60 dark:hover:border-teal-400/60',
      glow: 'hover:shadow-[0_8px_30px_rgba(20,184,166,0.2)]',
      bgBadge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30',
      textBadge: 'text-teal-500',
      gradient: 'from-teal-500/20 via-emerald-500/10 to-transparent',
      accent: '#14b8a6'
    },
    stats: {
      en: 'One-Click Direct',
      fr: 'Direct en Un Clic',
      es: 'Directo en Un Clic',
      ar: 'تحميل بضغطة واحدة'
    },
    url: 'https://mutaz.net',
    iconType: 'terminal'
  }
];

const renderPartnerIcon = (type: PartnerData['iconType'], color: string) => {
  const props = { size: 18, style: { color } };
  switch (type) {
    case 'game':
      return <Gamepad2 {...props} />;
    case 'download':
      return <Download {...props} />;
    case 'terminal':
      return <Terminal {...props} />;
    case 'storage':
      return <HardDrive {...props} />;
    case 'film':
      return <Film {...props} />;
    case 'cpu':
      return <Cpu {...props} />;
    case 'box':
      return <Box {...props} />;
    case 'layers':
    default:
      return <Layers {...props} />;
  }
};

export const PartnersSection: React.FC = () => {
  const { language, dir, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const showCards = isExpanded || searchQuery.trim().length > 0;

  const langKey = (language as 'en' | 'fr' | 'es' | 'ar') || 'en';

  const tags = ['ALL', 'REPACKS', 'PRE-INSTALLED', 'CLOUD MIRROR', 'UTILITIES', 'TORRENT P2P', 'CLEAN SOFTWARE', 'CINEMA 4K', 'CREATIVE APPS', 'PRO TOOLKIT', 'ESSENTIALS'];

  const filteredPartners = PARTNERS_DATA.filter(partner => {
    const matchesTag = selectedTag === 'ALL' || partner.tag === selectedTag;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesTag;

    const matchesName = partner.name.toLowerCase().includes(query);
    const matchesCat = partner.category[langKey]?.toLowerCase().includes(query);
    const matchesDesc = partner.description[langKey]?.toLowerCase().includes(query);

    return matchesTag && (matchesName || matchesCat || matchesDesc);
  });

  const handleCopyLink = (partner: PartnerData) => {
    if (partner.url) {
      navigator.clipboard.writeText(partner.url);
      setCopiedId(partner.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const marqueeList = [...PARTNERS_DATA, ...PARTNERS_DATA];

  return (
    <section 
      id="partners-ecosystem-section"
      className="relative w-full py-8 md:py-14 my-4 md:my-8 transition-colors duration-300"
      dir={dir}
    >
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 end-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-full">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8 px-1">
          <div className="space-y-2">
            {/* Top Pill Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300">
                {t('Network Status: Operational')}
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                10 {t('Active Partners')}
              </span>
            </div>

            {/* Main Title */}
            <div className="flex items-center gap-3">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                {t('Official Partners')}
              </h2>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <ShieldCheck size={26} className="rtl:rotate-0" />
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base max-w-2xl font-medium leading-relaxed">
              {t('Access verified repacks, direct cloud archives, developer suites, and clean torrent indexes.')}
            </p>
          </div>

          {/* Search bar & Live animation label */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative min-w-[240px]">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search partners...')}
                className="w-full ps-9 pe-4 py-2 rounded-xl text-xs sm:text-sm font-medium backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 shadow-sm transition-all text-start"
              />
            </div>

            <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl backdrop-blur-md bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <Activity size={14} className="text-emerald-500 animate-pulse" />
              <span>{t('Auto-scrolling ticker active')}</span>
            </div>
          </div>
        </div>

        {/* --- AUTOMATIC ANIMATION: INFINITE GLASS MARQUEE TICKER --- */}
        <div className="w-full relative overflow-hidden py-3 mb-8 rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-gradient-to-r from-slate-200/40 via-white/50 to-slate-200/40 dark:from-slate-900/50 dark:via-slate-950/70 dark:to-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 shadow-inner group">
          
          {/* Glass Fade Edges */}
          <div className="pointer-events-none absolute inset-y-0 start-0 w-12 sm:w-20 bg-gradient-to-r from-gray-50 dark:from-slate-950 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 end-0 w-12 sm:w-20 bg-gradient-to-l from-gray-50 dark:from-slate-950 to-transparent z-10" />

          {/* Marquee Track with Pause-on-Hover */}
          <div className={`flex items-center gap-4 pause-on-hover ${dir === 'rtl' ? 'animate-partner-marquee-rtl' : 'animate-partner-marquee-ltr'}`}>
            {marqueeList.map((partner, index) => {
              const borderGlow = partner.themeColor.border;
              const shadowGlow = partner.themeColor.glow;
              return (
                <div
                  key={`marquee-${partner.id}-${index}`}
                  onClick={() => partner.url && window.open(partner.url, '_blank', 'noopener,noreferrer')}
                  className={`flex items-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 ${borderGlow} ${shadowGlow} shadow-sm transition-all duration-300 cursor-pointer shrink-0 select-none group/item hover:scale-[1.03] active:scale-95`}
                >
                  {/* Icon Circle */}
                  <div 
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/20 shadow-sm"
                    style={{ backgroundColor: `${partner.themeColor.accent}15` }}
                  >
                    {renderPartnerIcon(partner.iconType, partner.themeColor.accent)}
                  </div>

                  {/* Partner Name & Tag */}
                  <div className="flex flex-col text-start">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs sm:text-sm tracking-wide text-slate-900 dark:text-white uppercase group-hover/item:text-cyan-500 dark:group-hover/item:text-cyan-400 transition-colors">
                        {partner.name}
                      </span>
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                      {partner.badge[langKey]}
                    </span>
                  </div>

                  {/* External Indicator */}
                  <div className="ps-2 opacity-50 group-hover/item:opacity-100 transition-opacity">
                    <ArrowUpRight size={14} className="text-slate-400 group-hover/item:text-cyan-400 rtl:rotate-[-90deg]" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center items-center gap-1 mt-2 text-[10px] font-mono text-slate-400 dark:text-slate-500">
            <span>✨ {t('Pause on hover')}</span>
          </div>
        </div>

        {/* --- EXPAND / COLLAPSE TOGGLE BAR --- */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-sm mb-6 transition-all">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <Layers size={20} />
            </div>
            <div className="text-start min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {t('Verified Ecosystem & Trusted Sources')}
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/30">
                  {PARTNERS_DATA.length} {t('Verified Sources')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {showCards ? t('Click to collapse partner cards') : t('Click to expand grid & filter categories')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm select-none active:scale-95 shrink-0 ${
              showCards 
                ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700' 
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/25 shadow-md border border-cyan-400/30'
            }`}
          >
            <span>{showCards ? t('Hide Partner Directory') : t('Explore Partner Directory')}</span>
            <motion.div
              animate={{ rotate: showCards ? 180 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </button>
        </div>

        {/* --- COLLAPSIBLE PARTNER CARDS & CATEGORY PILLS --- */}
        <AnimatePresence>
          {showCards && (
            <motion.div
              key="collapsible-partners-wrapper"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {/* Category Pills (Filter) */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6 pt-1">
                {tags.map((tag) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 border cursor-pointer select-none ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                          : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tag === 'ALL' ? t('All Partners') : tag}
                    </button>
                  );
                })}
              </div>

              {/* --- RESPONSIVE PARTNERS GRID --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
                <AnimatePresence mode="popLayout">
                  {filteredPartners.map((partner) => {
                    const borderGlow = partner.themeColor.border;
                    const shadowGlow = partner.themeColor.glow;
                    const isCopied = copiedId === partner.id;

                    return (
                      <motion.div
                        key={partner.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.25 }}
                        className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl sm:rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 ${borderGlow} ${shadowGlow} shadow-md dark:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
                      >
                        {/* Subtle Top Gradient Accent */}
                        <div 
                          className="absolute inset-x-0 top-0 h-1 sm:h-1.5 opacity-80 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: partner.themeColor.accent }}
                        />

                        {/* Top Row: Icon + Badge */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div 
                              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center border border-white/20 dark:border-white/10 shadow-sm group-hover:scale-105 transition-transform"
                              style={{ backgroundColor: `${partner.themeColor.accent}20` }}
                            >
                              {renderPartnerIcon(partner.iconType, partner.themeColor.accent)}
                            </div>

                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${partner.themeColor.bgBadge}`}>
                              {partner.tag}
                            </span>
                          </div>

                          {/* Partner Name */}
                          <div className="space-y-1 text-start">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                              <span>{partner.name}</span>
                              <Sparkles size={14} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h3>

                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 line-clamp-1">
                              {partner.category[langKey]}
                            </p>

                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pt-1.5 line-clamp-3">
                              {partner.description[langKey]}
                            </p>
                          </div>
                        </div>

                        {/* Bottom Row: Feature Stat & Action Buttons */}
                        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2 py-1 rounded-md">
                            {partner.stats[langKey]}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {partner.url && (
                              <button
                                type="button"
                                onClick={() => handleCopyLink(partner)}
                                title="Copy Link"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              >
                                {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                              </button>
                            )}

                            {partner.url && (
                              <a
                                href={partner.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                                style={{ backgroundColor: partner.themeColor.accent }}
                              >
                                <span>{t('Visit')}</span>
                                <ArrowUpRight size={12} className="rtl:rotate-[-90deg]" />
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {filteredPartners.length === 0 && (
                <div className="p-8 text-center rounded-2xl backdrop-blur-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-500">
                  <p className="text-sm font-medium">{t('No partners found matching your search.')}</p>
                </div>
              )}

              {/* Bottom Collapse Button */}
              <div className="flex justify-center mt-6 mb-2">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur-md bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <ChevronUp size={15} />
                  <span>{t('Hide Partner Directory')}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default PartnersSection;
