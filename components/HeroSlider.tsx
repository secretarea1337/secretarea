import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../src/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

interface ResourceItem {
  id: string;
  category: string;
  name: string;
  version: string;
  repackSize: string;
  originalSize: string;
  genres: string;
  languages: string;
  repackBy: string;
  coverImage: string;
  galleryImages: string[];
  description: string;
  gameId?: string;
  developer?: string;
  dateAdded?: string;
  isFree: boolean;
  links: any;
}

interface HeroSliderProps {
  games: ResourceItem[];
  onSelectGame: (game: ResourceItem, action?: 'download' | 'details') => void;
}

const KNOWN_GAME_WALLPAPERS: Record<string, string> = {
  'grand theft auto': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/ss_32aa18ab3175e3002217862dd5917646d298ab6b.1920x1080.jpg?t=1765387725',
  'gta 5': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/ss_32aa18ab3175e3002217862dd5917646d298ab6b.1920x1080.jpg?t=1765387725',
  'gta v': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/ss_32aa18ab3175e3002217862dd5917646d298ab6b.1920x1080.jpg?t=1765387725',
  'cyberpunk': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/ss_e1d3e24b7a151b7425625bf9de24f2b1d06ffef3.1920x1080.jpg',
  'elden ring': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_27157833a640ce976451e3c983b632906e579737.1920x1080.jpg',
  'red dead': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/ss_fa61801fb2946cf61e4ea47be15e378c56e3b52d.1920x1080.jpg',
  'god of war': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1593500/ss_911f92e92c29bc952ba5620b7bcde317d7b0f023.1920x1080.jpg',
  'black myth': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/ss_3cecefe684be7b7325983ee23b6b8b939fbf422a.1920x1080.jpg',
  'forza': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1551360/ss_8d71206f4ee5e16cdfbce0c0e5a19280d0d8fb48.1920x1080.jpg',
  'witcher': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/ss_107600c1337e60e30de968811871eb2d944d43ac.1920x1080.jpg',
  'resident evil': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2050650/ss_69894e6378eec9b1e0f398495a89ce880a653457.1920x1080.jpg',
  'spiderman': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1817070/ss_2a7e78044734fc5143a5068a0ab4b600d80c3b88.1920x1080.jpg',
  'spider-man': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1817070/ss_2a7e78044734fc5143a5068a0ab4b600d80c3b88.1920x1080.jpg',
  'hogwarts': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/990080/ss_017b2f6ef512beae9ec5d4e11f7c11f76d4d1e2e.1920x1080.jpg',
};

const GAME_LOCALIZED_SYNOPSIS: Record<string, { en: string; fr: string; es: string; ar: string }> = {
  'grand theft auto': {
    en: 'Enter the sun-soaked metropolis of Los Santos. Complete edition with all updates, Los Santos Drug Wars, and verified direct cloud links.',
    fr: 'Plongez dans la métropole ensoleillée de Los Santos. Édition complète avec toutes les mises à jour et liens cloud directs vérifiés.',
    es: 'Adéntrate en la metrópolis de Los Santos. Edición completa con todas las actualizaciones y descargas directas verificadas.',
    ar: 'انطلق في شوارع لوس سانتوس الصاخبة. النسخة الكاملة الشاملة لكافة التحديثات والمحتويات الإضافية مع روابط سحابية مباشرة وسريعة.'
  },
  'gta': {
    en: 'Enter the sun-soaked metropolis of Los Santos. Complete edition with all updates, Los Santos Drug Wars, and verified direct cloud links.',
    fr: 'Plongez dans la métropole ensoleillée de Los Santos. Édition complète avec toutes les mises à jour et liens cloud directs vérifiés.',
    es: 'Adéntrate en la metrópolis de Los Santos. Edición complète avec toutes les mises à jour et liens cloud directs vérifiés.',
    ar: 'انطلق في شوارع لوس سانتوس الصاخبة. النسخة الكاملة الشاملة لكافة التحديثات والمحتويات الإضافية مع روابط سحابية مباشرة وسريعة.'
  },
  'cyberpunk': {
    en: 'An immersive open-world action RPG set in Night City, a megalopolis obsessed with power, glamour, and body modification.',
    fr: 'Un RPG d\'action en monde ouvert immersif se déroulant à Night City, une mégalopole obsédée par la puissance et le cyberware.',
    es: 'Un RPG de acción inmersivo en mundo abierto ambientado en Night City, una megalópolis obsesionada con el poder y el ciberware.',
    ar: 'لعبة تقمّص أدوار وأكشن مذهلة في عالم مفتوح مستقبلي داخل نايت سيتي، المدينة المهووسة بالقوة والشهرة والتعديلات السيبرانية.'
  },
  'elden ring': {
    en: 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.',
    fr: 'Levez-vous, Sans-éclat, guidé par la grâce pour brandir la puissance du Cercle d\'Elden et régner sur l\'Entre-Terre.',
    es: 'Levántate, Sinluz, y déjate guiar por la gracia para esgrimir el poder del Círculo de Elden en las Tierras Intermedias.',
    ar: 'انهض أيها الملوّث، واسترشد بنور النعمة لتستحوذ على قوة خاتم الدن الأسطورية وتصبح الحاكم المطلق في الأراضي الوسطى.'
  },
  'red dead': {
    en: 'America, 1899. The end of the Wild West era has begun. Arthur Morgan and the Van der Linde gang fight to survive across rugged frontiers.',
    fr: 'Amérique, 1899. La fin de l\'ère du Far West a commencé. Arthur Morgan et la bande de Van der Linde luttent pour leur survie.',
    es: 'América, 1899. El fin del Salvaje Oeste ha comenzado. Arthur Morgan y la banda de Van der Linde luchan por sobrevivir.',
    ar: 'أمريكا، 1899. بداية نهاية عصر الغرب الأمريكي المتوحش. رافق آرثر مورغان وعصابة فان دير ليند في ملحمة البقاء والحرية.'
  },
  'god of war': {
    en: 'Venture into the brutal Norse realm with Kratos and Atreus, battling fierce creatures and powerful gods in a deeply personal journey.',
    fr: 'Aventurez-vous dans le royaume nordique impitoyable avec Kratos et Atreus, combattant créatures et dieux scandinaves.',
    es: 'Adéntrate en el implacable reino nórdico con Kratos y Atreus, luchando contra feroces criaturas y poderosos dioses.',
    ar: 'انطلق في مغامرة أسطورية في العالم النوردي العنيف مع كراتوس وابنه آتريوس بمواجهة آلهة الشمال ووحوشها الضارية.'
  },
  'black myth': {
    en: 'An action RPG rooted in Chinese mythology. Set out as the Destined One to uncover the obscured truth beneath a glorious legend.',
    fr: 'Un RPG d\'action ancré dans la mythologie chinoise. Incarnez le Prédestiné pour dévoiler la vérité enfouie sous la légende.',
    es: 'Un RPG de acción arraigado en la mitología china. Encarna al Predestinado para desvelar la verdad oculta tras la leyenda.',
    ar: 'لعبة أكشن وتقمّص أدوار مستوحاة من الأساطير الصينية. انطلق كالمختار لاكتشاف الحقائق الغامضة وراء أسطورة ملك القردة.'
  },
  'forza': {
    en: 'Explore the vibrant and ever-evolving open world landscapes of Mexico with limitless, fun driving action in hundreds of cars.',
    fr: 'Explorez les paysages vibrants du Mexique avec des courses exaltantes au volant de centaines des plus grands bolides.',
    es: 'Explora los vibrantes paisajes de México en un mundo abierto en constante evolución con cientos de coches legendarios.',
    ar: 'استكشف المناظر الطبيعية الخلابة في المكسيك عبر عالم مفتوح نابض بالحياة وسباقات لا محدودة مع مئات السيارات الأسطورية.'
  },
  'witcher': {
    en: 'Become Geralt of Rivia, a monster slayer for hire, traversing a war-torn continent infested with terrifying beasts and moral choices.',
    fr: 'Incarnez Geralt de Riv, chasseur de monstres à gages, parcourant un continent déchiré par la guerre et les monstres.',
    es: 'Conviértete en Geralt de Rivia, cazador de monstruos a sueldo, en un continente devastado por la guerra y criaturas oscuras.',
    ar: 'عش ملحمة جيرالت أوف ريفيا، صائد الوحوش المحترف، في عالم مفتوح شاسع تملؤه الوحوش الضارية والخيارات الأخلاقية الصعبة.'
  },
  'resident evil': {
    en: 'Survival horror masterpiece. Special agent Leon S. Kennedy is sent on a mission to rescue the kidnapped daughter of the President.',
    fr: 'Chef-d\'œuvre du survival-horror. L\'agent spécial Leon S. Kennedy est envoyé en mission pour sauver la fille du président.',
    es: 'Obra maestra del terror de supervivencia. El agente Leon S. Kennedy es enviado a rescatar a la hija secuestrada del presidente.',
    ar: 'تحفة رعب البقاء الأسطورية. ينطلق العميل ليون كينيدي في مهمة خطيرة لإنقاذ ابنة الرئيس في قرية معزولة تملؤها الكوابيس.'
  },
};

const GENRE_TRANSLATIONS: Record<string, { en: string; fr: string; es: string; ar: string }> = {
  action: { en: 'Action', fr: 'Action', es: 'Acción', ar: 'أكشن' },
  adventure: { en: 'Adventure', fr: 'Aventure', es: 'Aventura', ar: 'مغامرات' },
  rpg: { en: 'RPG', fr: 'RPG', es: 'RPG', ar: 'تقمّص أدوار' },
  'open world': { en: 'Open World', fr: 'Monde Ouvert', es: 'Mundo Abierto', ar: 'عالم مفتوح' },
  shooter: { en: 'Shooter', fr: 'Tir', es: 'Disparos', ar: 'إطلاق نار' },
  fps: { en: 'FPS', fr: 'FPS', es: 'FPS', ar: 'تصويب منظور أول' },
  racing: { en: 'Racing', fr: 'Course', es: 'Carreras', ar: 'سباق' },
  horror: { en: 'Horror', fr: 'Horreur', es: 'Terror', ar: 'رعب' },
  'sci-fi': { en: 'Sci-Fi', fr: 'Science-Fiction', es: 'Ciencia Ficción', ar: 'خيال علمي' },
  survival: { en: 'Survival', fr: 'Survie', es: 'Supervivencia', ar: 'بقاء' },
  strategy: { en: 'Strategy', fr: 'Stratégie', es: 'Estrategia', ar: 'استراتيجية' },
  sports: { en: 'Sports', fr: 'Sports', es: 'Deportes', ar: 'رياضة' },
  simulation: { en: 'Simulation', fr: 'Simulation', es: 'Simulación', ar: 'محاكاة' },
  stealth: { en: 'Stealth', fr: 'Infiltration', es: 'Sigilo', ar: 'تسلل' },
};

const resolveBackgroundCandidates = (item: ResourceItem | undefined): string[] => {
  if (!item) return ['https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop'];

  const candidates: string[] = [];
  const lowerName = (item.name || '').toLowerCase();

  for (const [key, url] of Object.entries(KNOWN_GAME_WALLPAPERS)) {
    if (lowerName.includes(key)) {
      candidates.push(url);
      break;
    }
  }

  if (item.galleryImages && item.galleryImages.length > 0) {
    item.galleryImages.forEach(img => {
      if (img && !img.includes('wallpaperswide.com') && !img.includes('7wallpapers.net')) {
        candidates.push(img);
      }
    });
  }

  const pin = item.galleryImages?.find(img => img && img.includes('pinimg.com'));
  if (pin && !candidates.includes(pin)) {
    candidates.push(pin);
  }

  if (item.coverImage && !candidates.includes(item.coverImage)) {
    candidates.push(item.coverImage);
  }

  candidates.push('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop');

  return candidates;
};

const getLocalizedGameDescription = (item: ResourceItem, lang: 'en' | 'fr' | 'es' | 'ar'): string => {
  const lower = (item.name || '').toLowerCase();
  for (const [key, data] of Object.entries(GAME_LOCALIZED_SYNOPSIS)) {
    if (lower.includes(key)) {
      return data[lang];
    }
  }

  if (lang === 'ar') {
    return `استمتع بالنسخة الكاملة للعبة ${item.name} على الكمبيوتر الشخصي. ريباك مفحوص وآمن 100%، يشمل كافة التحديثات والإضافات مع روابط تحميل مباشرة وسريعة.`;
  }
  if (lang === 'fr') {
    return `Découvrez l'édition PC complète de ${item.name}. Repack vérifié et sécurisé avec toutes les mises à jour et téléchargement direct rapide.`;
  }
  if (lang === 'es') {
    return `Disfruta de la edición completa de ${item.name} para PC. Repack verificado y seguro con todas las actualizaciones y descargas directas de alta velocidad.`;
  }
  return item.description || `Experience the complete PC edition of ${item.name} with verified repack, all DLCs, and fast direct cloud downloads.`;
};

const getLocalizedGenre = (genres: string | undefined, lang: 'en' | 'fr' | 'es' | 'ar'): string => {
  if (!genres) return lang === 'ar' ? 'لعبة كمبيوتر' : 'PC Game';
  const first = genres.split(',')[0].trim().toLowerCase();
  for (const [key, trans] of Object.entries(GENRE_TRANSLATIONS)) {
    if (first.includes(key)) {
      return trans[lang];
    }
  }
  return genres.split(',')[0].trim();
};

const HeroSlider: React.FC<HeroSliderProps> = ({ games, onSelectGame }) => {
  const { t, language, dir } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isRTL = dir === 'rtl' || language === 'ar';
  const touchStartX = useRef<number | null>(null);

  const activeLang = (language === 'ar' || language === 'fr' || language === 'es' || language === 'en')
    ? language
    : 'en';

  const scrollToLibrary = () => {
    const el = document.getElementById('secretarea-library');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setCandidateIndex(0);
  }, [currentIndex]);

  // Slideshow auto-advance timer (8 seconds, pausable)
  useEffect(() => {
    if (games.length === 0 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [games.length, currentIndex, isPaused]);

  if (games.length === 0) return null;

  const currentItem = games[currentIndex];
  const candidates = resolveBackgroundCandidates(currentItem);
  const bgImage = candidates[candidateIndex] || candidates[0];

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % games.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + games.length) % games.length);

  const handleImageError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((prev) => prev + 1);
    }
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped left
        if (isRTL) handlePrev();
        else handleNext();
      } else {
        // Swiped right
        if (isRTL) handleNext();
        else handlePrev();
      }
    }
    touchStartX.current = null;
  };

  const hasPreInstallation =
    (currentItem.links?.ankerParts && currentItem.links.ankerParts.length > 0) ||
    Boolean(
      currentItem.links?.preInstalled?.download ||
      currentItem.links?.preInstalled?.cloudDrop ||
      currentItem.links?.preInstalled?.torrent
    );

  const gameSynopsis = getLocalizedGameDescription(currentItem, activeLang);
  const gameGenre = getLocalizedGenre(currentItem.genres, activeLang);

  return (
    <section
      aria-label="Featured Games Hero Showcase"
      dir={dir}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full min-h-[620px] sm:min-h-[640px] lg:min-h-[700px] h-[90svh] sm:h-[86vh] lg:h-[90svh] max-h-[920px] overflow-hidden bg-slate-100 dark:bg-[#030712] flex flex-col pt-16 sm:pt-20 md:pt-24 transition-colors duration-300 select-none"
    >
      {/* Dynamic Animated Ambient Wallpaper Background */}
      <AnimatePresence initial={false}>
        <motion.div
          key={`${currentIndex}-${candidateIndex}`}
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1.02 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{
            opacity: { duration: 0.9, ease: 'easeInOut' },
            scale: { duration: 9, ease: 'easeOut' },
          }}
          className="absolute inset-0 z-0 overflow-hidden"
        >
          <img
            src={bgImage}
            alt={currentItem.name}
            className="w-full h-full object-cover object-center filter saturate-[1.15] contrast-[1.05]"
            referrerPolicy="no-referrer"
            onError={handleImageError}
          />

          {/* High-fidelity light/dark mode dual scrim gradient - direction aware */}
          <div
            className={`absolute inset-0 transition-colors duration-300 ${
              isRTL
                ? 'bg-gradient-to-l from-slate-100/95 via-slate-100/80 to-slate-100/25 dark:from-[#030712]/95 dark:via-[#030712]/80 dark:to-[#030712]/20'
                : 'bg-gradient-to-r from-slate-100/95 via-slate-100/80 to-slate-100/25 dark:from-[#030712]/95 dark:via-[#030712]/80 dark:to-[#030712]/20'
            }`}
          />

          {/* Vertical fade to blend seamlessly into page content */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-transparent to-slate-100/40 dark:from-[#030712] dark:via-transparent dark:to-[#030712]/40" />

          {/* Subtle ambient colored radial glow */}
          <div className="absolute -top-32 -start-32 w-96 h-96 rounded-full bg-sky-500/15 dark:bg-sky-500/20 blur-[130px] pointer-events-none" />
          <div className="absolute -bottom-32 -end-32 w-96 h-96 rounded-full bg-amber-500/10 dark:bg-amber-500/15 blur-[130px] pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Main Content Showcase Grid */}
      <div className="flex-1 flex flex-col justify-center relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-6 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 lg:gap-12 items-center w-full my-auto">

          {/* Content Column (Text & CTAs) */}
          <div className="md:col-span-7 xl:col-span-8 flex flex-col items-start gap-4 sm:gap-5 justify-center order-2 md:order-1 text-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentIndex}-${activeLang}-content`}
                initial={{ opacity: 0, y: 25, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-3 sm:gap-4 w-full"
              >
                {/* Clean, Non-Pill Typographic Kicker & Specs Row */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {/* Spotlight label */}
                  <span className="font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest text-[11px] sm:text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                    {t('Featured Game')}
                  </span>

                  <span className="text-slate-400 dark:text-slate-600 select-none">·</span>
                  <span>{gameGenre}</span>

                  {currentItem.repackSize && (
                    <>
                      <span className="text-slate-400 dark:text-slate-600 select-none">·</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        {currentItem.repackSize}
                      </span>
                    </>
                  )}

                  {/* Pre-installed highlight badge if supported */}
                  {hasPreInstallation && (
                    <>
                      <span className="text-slate-400 dark:text-slate-600 select-none">·</span>
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                        <Icon name="Zap" size={13} />
                        {t('Pre-installed')}
                      </span>
                    </>
                  )}
                </div>

                {/* Main Cinematic Game Title - stable reserved height keeps hero section exactly the same size */}
                <div
                  className={`w-full text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] uppercase tracking-tight min-h-[2.25em] h-[2.25em] flex items-center ${
                    isRTL ? 'font-arabic' : ''
                  }`}
                  style={{
                    fontFamily: isRTL ? "'Noto Sans Arabic', 'Cairo', system-ui, sans-serif" : undefined,
                  }}
                >
                  <h1 className="text-slate-900 dark:text-white drop-shadow-md break-words line-clamp-2 leading-[1.1] w-full">
                    {currentItem.name}
                  </h1>
                </div>

                {/* Localized Synopsis (EN, FR, ES, AR) */}
                <div className="min-h-[4rem] sm:min-h-[4.5rem] md:min-h-[5rem] flex items-start">
                  <p
                    className={`text-slate-700 dark:text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl line-clamp-3 font-normal leading-relaxed ${
                      isRTL ? 'font-arabic leading-relaxed' : ''
                    }`}
                  >
                    {gameSynopsis}
                  </p>
                </div>

                {/* Zero-Pill Quick Specs Bar */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Icon name="CheckCircle" size={14} className="text-emerald-500 shrink-0" />
                    <span>{t('Verified Repack')}</span>
                  </span>
                  <span className="text-slate-400 dark:text-slate-600 select-none">/</span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="ShieldCheck" size={14} className="text-sky-500 shrink-0" />
                    <span>{t('Virus Free & Tested')}</span>
                  </span>
                  {currentItem.repackBy && (
                    <>
                      <span className="text-slate-400 dark:text-slate-600 select-none">/</span>
                      <span className="flex items-center gap-1">
                        <span className="text-slate-500 dark:text-slate-500">{t('Repack by')}:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{currentItem.repackBy}</span>
                      </span>
                    </>
                  )}
                </div>

                {/* Primary & Secondary Action CTAs */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3 sm:pt-4">
                  {/* Primary Download CTA */}
                  <button
                    onClick={() => onSelectGame(currentItem, 'download')}
                    className="group px-6 py-3 sm:px-7 sm:py-3.5 bg-sky-500 hover:bg-sky-600 dark:bg-sky-400 dark:hover:bg-sky-300 text-white dark:text-slate-950 font-black rounded-xl shadow-lg shadow-sky-500/25 transition-all duration-200 active:scale-95 flex items-center gap-2.5 text-sm sm:text-base cursor-pointer"
                  >
                    <Icon name="Download" size={18} className="shrink-0 group-hover:translate-y-0.5 transition-transform" />
                    <span>{t('Download Now')}</span>
                    <Icon
                      name="ArrowRight"
                      size={17}
                      className="shrink-0 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                    />
                  </button>

                  {/* Secondary Details CTA */}
                  <button
                    onClick={() => onSelectGame(currentItem, 'details')}
                    className="px-5 py-3 sm:px-6 sm:py-3.5 bg-slate-900/5 hover:bg-slate-900/10 dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white border border-slate-300/80 dark:border-white/15 font-bold rounded-xl backdrop-blur-md transition-all duration-200 active:scale-95 flex items-center gap-2 text-sm sm:text-base cursor-pointer"
                  >
                    <span>{t('Details')}</span>
                    <Icon
                      name="ChevronRight"
                      size={18}
                      className="shrink-0 rtl:rotate-180"
                    />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 3D Floating Game Cover / Poster Column */}
          <div className="md:col-span-5 xl:col-span-4 flex justify-center md:justify-end items-center order-1 md:order-2 my-2 md:my-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentIndex}-card`}
                initial={{
                  opacity: 0,
                  x: isRTL ? -50 : 50,
                  rotateY: isRTL ? 20 : -20,
                  scale: 0.92,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  rotateY: isRTL ? 10 : -10,
                  rotateX: 4,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  x: isRTL ? 50 : -50,
                  rotateY: isRTL ? -20 : 20,
                  scale: 0.92,
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-48 sm:w-56 md:w-64 lg:w-72 xl:w-80 aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/25 dark:shadow-[0_25px_60px_rgba(0,0,0,0.85)] border-2 border-white/80 dark:border-white/10 relative group cursor-pointer"
                onClick={() => onSelectGame(currentItem, 'details')}
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: 1200,
                }}
              >
                {/* Poster Cover Image */}
                <img
                  src={currentItem.coverImage}
                  alt={currentItem.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Top Badge: NEW or Top Pick */}
                {currentIndex < 3 && (
                  <div className="absolute top-3.5 end-3.5 z-20 px-2.5 py-1 rounded-md bg-rose-600 text-white font-black text-[10px] sm:text-xs tracking-wider uppercase shadow-md shadow-rose-600/40">
                    {t('NEW') || 'NEW'}
                  </div>
                )}

                {/* Bottom Poster Gradient & Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-6 text-start">
                  <span className="text-white/80 font-bold tracking-widest uppercase text-[10px] sm:text-xs">
                    {gameGenre}
                  </span>
                  <h3 className="text-white font-black text-sm sm:text-base leading-tight mt-1 line-clamp-1">
                    {currentItem.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/15 text-[11px] text-white/70">
                    <span>{currentItem.repackSize || 'PC Repack'}</span>
                    <span className="font-bold text-sky-400 group-hover:underline flex items-center gap-1">
                      {t('Details')}
                      <Icon name="ChevronRight" size={14} className="rtl:rotate-180" />
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Interactive Bottom Control Strip & Thumbnail Bar */}
      <div className="relative z-20 w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 pb-4 sm:pb-6 mt-auto">
        <div className="flex flex-col gap-3 w-full">

          {/* Laptop & Desktop Interactive Thumbnail Cards (>= 1024px) */}
          <div className="hidden lg:grid grid-cols-8 gap-2 w-full">
            {games.map((g, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={g.id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative p-2 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden flex items-center gap-2 text-start ${
                    isActive
                      ? 'bg-white/90 dark:bg-slate-900/90 border-sky-500 shadow-md shadow-sky-500/10'
                      : 'bg-white/40 hover:bg-white/70 dark:bg-slate-900/40 dark:hover:bg-slate-900/70 border-slate-200/60 dark:border-slate-800/60 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={g.coverImage}
                    alt={g.name}
                    className="w-8 h-10 object-cover rounded shrink-0 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] font-bold truncate ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {g.name}
                    </p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                      {g.repackSize || 'PC Game'}
                    </p>
                  </div>

                  {/* Active progress bar for currently spotlighted game */}
                  {isActive && (
                    <motion.div
                      key={`thumb-progress-${idx}-${currentIndex}`}
                      className="absolute bottom-0 start-0 h-0.5 bg-sky-500"
                      initial={{ width: 0 }}
                      animate={{ width: isPaused ? '100%' : '100%' }}
                      transition={{ duration: isPaused ? 0 : 8, ease: 'linear' }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Tablet & Mobile Slide Controls & Slide Counter (< 1024px) */}
          <div className="flex items-center justify-between gap-4 w-full">
            {/* Slide Index Counter */}
            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              <span className="text-sky-600 dark:text-sky-400">
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <span className="text-slate-400 dark:text-slate-600 mx-1">/</span>
              <span>{String(games.length).padStart(2, '0')}</span>
            </div>

            {/* Progress Bars Indicator */}
            <div className="flex items-center gap-1.5 flex-1 max-w-xs">
              {games.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className="flex-1 h-1.5 rounded-full bg-slate-300/70 dark:bg-white/20 cursor-pointer overflow-hidden backdrop-blur-sm transition-all hover:bg-slate-400 dark:hover:bg-white/40"
                >
                  {idx === currentIndex && (
                    <motion.div
                      key={`mobile-progress-${idx}-${currentIndex}`}
                      className="h-full bg-sky-500"
                      initial={{ width: 0 }}
                      animate={{ width: isPaused ? '100%' : '100%' }}
                      transition={{ duration: isPaused ? 0 : 8, ease: 'linear' }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Prev / Next Slide Navigation Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handlePrev}
                className="w-9 h-9 rounded-xl bg-white/80 hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white flex items-center justify-center shadow-xs transition-colors active:scale-95 cursor-pointer"
                title={t('Previous Game')}
                aria-label={t('Previous Game')}
              >
                <Icon name="ChevronLeft" size={17} className="rtl:rotate-180" />
              </button>
              <button
                onClick={handleNext}
                className="w-9 h-9 rounded-xl bg-white/80 hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white flex items-center justify-center shadow-xs transition-colors active:scale-95 cursor-pointer"
                title={t('Next Game')}
                aria-label={t('Next Game')}
              >
                <Icon name="ChevronRight" size={17} className="rtl:rotate-180" />
              </button>
            </div>
          </div>

          {/* Quick Jump to SecretArea Library Anchor Button */}
          <div className="flex justify-center w-full pt-1">
            <button
              onClick={scrollToLibrary}
              className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/75 hover:bg-slate-900 dark:bg-black/75 dark:hover:bg-black text-slate-200 hover:text-white border border-white/15 hover:border-sky-400/50 shadow-md backdrop-blur-md transition-all active:scale-95 cursor-pointer text-xs"
              title={t('SecretArea Library')}
              aria-label={t('SecretArea Library')}
            >
              <span className="font-bold tracking-wider uppercase text-[11px]">
                {t('SecretArea Library')}
              </span>
              <motion.span
                animate={{ y: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="text-sky-400 group-hover:text-sky-300 flex items-center"
              >
                <Icon name="ChevronDown" size={13} />
              </motion.span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
