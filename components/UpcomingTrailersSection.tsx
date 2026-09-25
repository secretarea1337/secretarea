import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause,
  Calendar, 
  Check, 
  Film, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Clapperboard,
  Flame,
  MonitorPlay,
  Share2,
  Tv,
  ExternalLink
} from 'lucide-react';
import { TbBrandYoutube } from 'react-icons/tb';
import { SiImdb } from 'react-icons/si';
import { useLanguage } from '../src/contexts/LanguageContext';

export interface TrailerItem {
  id: string; // YouTube Video ID
  title: {
    en: string;
    fr: string;
    es: string;
    ar: string;
  };
  type?: 'reveal' | 'gameplay' | 'cinematic' | 'teaser' | 'launch';
  url: string;
}

export interface UpcomingGameTrailer {
  id: string;
  title: {
    en: string;
    fr: string;
    es: string;
    ar: string;
  };
  developer: string;
  releaseDate: {
    en: string;
    fr: string;
    es: string;
    ar: string;
  };
  genre: {
    en: string;
    fr: string;
    es: string;
    ar: string;
  };
  categoryKey: 'action_rpg' | 'open_world' | 'shooter' | 'scifi' | 'adventure' | 'all';
  platforms: string[];
  coverImage: string;
  backdropImage?: string;
  description: {
    en: string;
    fr: string;
    es: string;
    ar: string;
  };
  tag: {
    en: string;
    fr: string;
    es: string;
    ar: string;
  };
  trailers: TrailerItem[];
  isFeatured?: boolean;
  imdbUrl?: string;
}

// Automatically resolves or creates the IMDb game lookup URL
export const getGameImdbUrl = (game: UpcomingGameTrailer): string => {
  if (game.imdbUrl && game.imdbUrl.trim()) {
    return game.imdbUrl.trim();
  }
  // Title detection for IMDb lookup
  const rawTitle = game.title?.en || game.title?.fr || game.title?.es || game.title?.ar || '';
  // Clean special notes or parentheses that might hinder exact title matching
  const cleanTitle = rawTitle
    .replace(/\s*\((?:upcoming|coming soon|leak|trailer|rumor|\d{4})\)/gi, '')
    .trim();
  return `https://www.imdb.com/find/?q=${encodeURIComponent(cleanTitle || rawTitle)}`;
};

// Robust YouTube Video ID extractor supporting all formats
export const extractYouTubeId = (urlOrId: string): string => {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  // If it's already an 11-character alphanumeric ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  // Handles: youtu.be, youtube.com/watch?v=, youtube.com/embed/, /v/, /shorts/, /live/
  const regExp = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regExp);
  if (match && match[1]) return match[1];

  // Secondary search for ?v= or &v=
  const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (vMatch && vMatch[1]) return vMatch[1];

  return trimmed;
};

// High quality YouTube thumbnail getter
export const getYouTubeThumbnail = (videoId: string, quality: 'maxres' | 'hq' = 'hq'): string => {
  if (!videoId) return '';
  return quality === 'maxres' 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

// Clean date formatter (formats ISO dates like 2026-11-19T00:00:00.000Z to readable dates)
export const formatReleaseDate = (val: string, lang: string = 'en'): string => {
  if (!val) return '';
  const trimmed = val.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    try {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        const locale = lang === 'ar' ? 'ar-EG' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US';
        return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
      }
    } catch {
      // ignore
    }
  }
  return trimmed;
};

// Rich Curated Games with Multi-Trailers
const CURATED_TRAILERS: UpcomingGameTrailer[] = [
  {
    id: 'gta-6',
    title: {
      en: 'Grand Theft Auto VI',
      fr: 'Grand Theft Auto VI',
      es: 'Grand Theft Auto VI',
      ar: 'جراند ثفت أوتو 6'
    },
    developer: 'Rockstar Games',
    releaseDate: {
      en: 'Fall 2025',
      fr: 'Automne 2025',
      es: 'Otoño 2025',
      ar: 'خريف 2025'
    },
    genre: {
      en: 'Open World Action',
      fr: 'Action Monde Ouvert',
      es: 'Acción Mundo Abierto',
      ar: 'عالم مفتوح وأكشن'
    },
    categoryKey: 'open_world',
    platforms: ['PS5', 'Xbox Series X/S', 'PC'],
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    backdropImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
    description: {
      en: 'Grand Theft Auto VI heads to the state of Leonida, home to the neon-soaked streets of Vice City and beyond in the biggest, most immersive evolution of the GTA franchise yet.',
      fr: 'Grand Theft Auto VI vous emmène dans l\'état de Leonida, abritant les rues baignées de néons de Vice City dans l\'évolution la plus immersive de la série.',
      es: 'Grand Theft Auto VI se traslada al estado de Leonida, hogar de las calles iluminadas con neón de Vice City en la entrega más ambiciosa de la saga.',
      ar: 'تأخذنا لعبة GTA VI إلى ولاية ليونيدا وشوارع فايس سيتي الأيقونية المضاءة بالنيون في أضخم وأعمق تطور لسلسلة جراند ثفت أوتو التاريخية.'
    },
    tag: {
      en: 'World Premiere',
      fr: 'Première Mondiale',
      es: 'Estreno Mundial',
      ar: 'عرض أول عالمي'
    },
    isFeatured: true,
    trailers: [
      {
        id: 'QdBZY2fkU-0',
        url: 'https://www.youtube.com/watch?v=QdBZY2fkU-0',
        title: {
          en: 'Trailer 1: Official Reveal',
          fr: 'Bande-annonce 1 : Révélation Officielle',
          es: 'Tráiler 1: Revelación Oficial',
          ar: 'العرض 1: الكشف الرسمي'
        },
        type: 'reveal'
      },
      {
        id: 'vqZ6tNfS4lE',
        url: 'https://www.youtube.com/watch?v=vqZ6tNfS4lE',
        title: {
          en: 'Trailer 2: Vice City Deep Dive',
          fr: 'Bande-annonce 2 : Immersion Vice City',
          es: 'Tráiler 2: Vistazo a Vice City',
          ar: 'العرض 2: نظرة متعمقة على فايس سيتي'
        },
        type: 'gameplay'
      },
      {
        id: 'TrxzrVbV3z8',
        url: 'https://www.youtube.com/watch?v=TrxzrVbV3z8',
        title: {
          en: 'Trailer 3: Next-Gen Engine Showcase',
          fr: 'Bande-annonce 3 : Moteur Next-Gen',
          es: 'Tráiler 3: Motor de Nueva Generación',
          ar: 'العرض 3: استعراض محرك الجيل الجديد'
        },
        type: 'cinematic'
      }
    ]
  },
  {
    id: 'witcher-4-polaris',
    title: {
      en: 'The Witcher 4 (Polaris)',
      fr: 'The Witcher 4 (Polaris)',
      es: 'The Witcher 4 (Polaris)',
      ar: 'ذا ويتشر 4 (بولاريس)'
    },
    developer: 'CD Projekt Red',
    releaseDate: {
      en: '2026',
      fr: '2026',
      es: '2026',
      ar: '2026'
    },
    genre: {
      en: 'Action RPG',
      fr: 'Action RPG',
      es: 'RPG de Acción',
      ar: 'أكشن وتقمص أدوار'
    },
    categoryKey: 'action_rpg',
    platforms: ['PC', 'PS5', 'Xbox Series X/S'],
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
    description: {
      en: 'A new saga begins. Built from the ground up on Unreal Engine 5, Project Polaris kicks off a brand new triple-A Witcher trilogy.',
      fr: 'Une nouvelle saga commence. Développé sous Unreal Engine 5, le projet Polaris inaugure une toute nouvelle trilogie The Witcher.',
      es: 'Comienza una nueva saga. Creado desde cero en Unreal Engine 5, el proyecto Polaris inicia una nueva trilogía épica de The Witcher.',
      ar: 'بداية ملحمة أسطورية جديدة مبنية بالكامل بمحرك أنريل إنجن 5 لتبدأ ثلاثية جديدة ضخمة في عالم ذا ويتشر الساحر.'
    },
    tag: {
      en: 'New Saga',
      fr: 'Nouvelle Saga',
      es: 'Nueva Saga',
      ar: 'ملحمة جديدة'
    },
    trailers: [
      {
        id: 'p2L2_jWn_Cg',
        url: 'https://www.youtube.com/watch?v=p2L2_jWn_Cg',
        title: {
          en: 'Trailer 1: Cinematic Announcement',
          fr: 'Bande-annonce 1 : Annonce Cinématique',
          es: 'Tráiler 1: Anuncio Cinemático',
          ar: 'العرض 1: الإعلان السينمائي'
        },
        type: 'cinematic'
      },
      {
        id: '8d_jU7k9j-A',
        url: 'https://www.youtube.com/watch?v=8d_jU7k9j-A',
        title: {
          en: 'Trailer 2: UE5 Tech Spotlight',
          fr: 'Bande-annonce 2 : Présentation Technique UE5',
          es: 'Tráiler 2: Demostración Técnica UE5',
          ar: 'العرض 2: استعراض تقنيات أنريل إنجن 5'
        },
        type: 'teaser'
      }
    ]
  },
  {
    id: 'death-stranding-2',
    title: {
      en: 'Death Stranding 2: On The Beach',
      fr: 'Death Stranding 2: On The Beach',
      es: 'Death Stranding 2: On The Beach',
      ar: 'ديث ستراندينغ 2: على الشاطئ'
    },
    developer: 'Kojima Productions',
    releaseDate: {
      en: '2025',
      fr: '2025',
      es: '2025',
      ar: '2025'
    },
    genre: {
      en: 'Sci-Fi Adventure',
      fr: 'Aventure Sci-Fi',
      es: 'Aventura de Ciencia Ficción',
      ar: 'مغامرة وخيال علمي'
    },
    categoryKey: 'scifi',
    platforms: ['PS5', 'PC'],
    coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
    description: {
      en: 'Hideo Kojima presents an awe-inspiring vision where Sam Porter Bridges embarks on a desperate journey beyond the UCA to save humanity from extinction.',
      fr: 'Hideo Kojima présente une vision captivante où Sam Porter Bridges se lance dans une mission pour sauver l\'humanité.',
      es: 'Hideo Kojima presenta una aventura cinematográfica donde Sam Porter Bridges viaja más allá de la UCA para salvar a la humanidad.',
      ar: 'رؤية سينمائية استثنائية من هيديو كوجيما حيث ينطلق سام بريدجز في رحلة محفوفة بالمخاطر لإنقاذ البشرية من الانقراض.'
    },
    tag: {
      en: 'Kojima Masterpiece',
      fr: 'Chef-d\'œuvre Kojima',
      es: 'Obra de Kojima',
      ar: 'تحفة كوجيما'
    },
    trailers: [
      {
        id: 'pC_lC2N8v4M',
        url: 'https://www.youtube.com/watch?v=pC_lC2N8v4M',
        title: {
          en: 'Trailer 1: State of Play 10-Min Reveal',
          fr: 'Bande-annonce 1 : Gameplay State of Play (10 min)',
          es: 'Tráiler 1: Avance Extendido de 10 min',
          ar: 'العرض 1: استعراض مطول 10 دقائق'
        },
        type: 'gameplay'
      },
      {
        id: 'TrxzrVbV3z8',
        url: 'https://www.youtube.com/watch?v=TrxzrVbV3z8',
        title: {
          en: 'Trailer 2: The Game Awards Teaser',
          fr: 'Bande-annonce 2 : Teaser The Game Awards',
          es: 'Tráiler 2: Teaser The Game Awards',
          ar: 'العرض 2: الإعلان التشويقي لجوائز اللعبة TGA'
        },
        type: 'teaser'
      }
    ]
  },
  {
    id: 'doom-dark-ages',
    title: {
      en: 'Doom: The Dark Ages',
      fr: 'Doom: The Dark Ages',
      es: 'Doom: The Dark Ages',
      ar: 'دوم: العصور المظلمة'
    },
    developer: 'id Software / Bethesda',
    releaseDate: {
      en: '2025',
      fr: '2025',
      es: '2025',
      ar: '2025'
    },
    genre: {
      en: 'FPS Action',
      fr: 'FPS / Action Brutale',
      es: 'FPS y Acción Brutal',
      ar: 'تصويب منظور أول وأكشن'
    },
    categoryKey: 'shooter',
    platforms: ['PC', 'PS5', 'Xbox Series X/S'],
    coverImage: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1200&auto=format&fit=crop',
    description: {
      en: 'The single-player action FPS prequel to DOOM (2016) and DOOM Eternal. Witness the origin story of the DOOM Slayer\'s rage in a dark fantasy medieval war.',
      fr: 'Le préquel d\'action FPS solo retraçant les origines de la fureur du DOOM Slayer dans une guerre médiévale sombre.',
      es: 'La precuela de acción en primera persona que revela el origen de la ira del DOOM Slayer en una brutal guerra medieval de fantasía oscura.',
      ar: 'الجزء السابق الملحمي لسلسلة دووم يكشف أصول غضب دووم سلاير في حرب خيالية مظلمة مفعمة بالأسلحة الثقيلة والدروع الفتاكة.'
    },
    tag: {
      en: 'Brutal Action',
      fr: 'Action Brutale',
      es: 'Acción Brutal',
      ar: 'أكشن حماسي'
    },
    trailers: [
      {
        id: '4tk8lkmYGWw',
        url: 'https://www.youtube.com/watch?v=4tk8lkmYGWw',
        title: {
          en: 'Trailer 1: Official World Premiere Gameplay',
          fr: 'Bande-annonce 1 : Gameplay Première Mondiale',
          es: 'Tráiler 1: Gameplay de Estreno Mundial',
          ar: 'العرض 1: استعراض أسلوب اللعب الأول عالمياً'
        },
        type: 'gameplay'
      },
      {
        id: 'z-a0j3yB0bE',
        url: 'https://www.youtube.com/watch?v=z-a0j3yB0bE',
        title: {
          en: 'Trailer 2: Shield Saw & Arsenal Showcase',
          fr: 'Bande-annonce 2 : Bouclier-Scie & Arsenal',
          es: 'Tráiler 2: Escudo Sierra y Arsenal',
          ar: 'العرض 2: استعراض درع المنشار والترسانة الحربية'
        },
        type: 'reveal'
      }
    ]
  },
  {
    id: 'marvel-wolverine',
    title: {
      en: "Marvel's Wolverine",
      fr: "Marvel's Wolverine",
      es: "Marvel's Wolverine",
      ar: 'مارفل وولفرين'
    },
    developer: 'Insomniac Games',
    releaseDate: {
      en: '2026',
      fr: '2026',
      es: '2026',
      ar: '2026'
    },
    genre: {
      en: 'Superhero Action',
      fr: 'Action Super-héros',
      es: 'Acción de Superhéroes',
      ar: 'أكشن ومغامرات خارقة'
    },
    categoryKey: 'action_rpg',
    platforms: ['PS5', 'PC'],
    coverImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop',
    description: {
      en: 'Insomniac Games brings Marvel’s beloved mutant Logan to life in an intense, mature, and visceral standalone action-adventure masterpiece.',
      fr: 'Insomniac Games donne vie au mutant Logan dans un jeu d\'action-aventure mature, viscéral et spectaculaire.',
      es: 'Insomniac Games da vida al icónico mutante Logan en una aventura de acción madura, visceral y cinematográfica.',
      ar: 'تقدم إنسومنياك جيمز تجربة ملحمية لشخصية لوجان الشهيرة في مغامرة أكشن ناضجة ودموية بمخالب الأدمانتيوم الحادة.'
    },
    tag: {
      en: 'Mature Rated',
      fr: 'Classé Mature',
      es: 'Clasificación Maduro',
      ar: 'مغامرة للكبار'
    },
    trailers: [
      {
        id: 'zLBNl_r4K3E',
        url: 'https://www.youtube.com/watch?v=zLBNl_r4K3E',
        title: {
          en: 'Trailer 1: Official Teaser Reveal',
          fr: 'Bande-annonce 1 : Teaser d\'Annonce',
          es: 'Tráiler 1: Teaser Oficial de Revelación',
          ar: 'العرض 1: الإعلان التشويقي الرسمي'
        },
        type: 'teaser'
      },
      {
        id: 'X2h2y6R7K8s',
        url: 'https://www.youtube.com/watch?v=X2h2y6R7K8s',
        title: {
          en: 'Trailer 2: Claws & Combat Extended Look',
          fr: 'Bande-annonce 2 : Griffes et Combat Étendu',
          es: 'Tráiler 2: Combate y Garras Extendido',
          ar: 'العرض 2: استعراض القتال والمخالب'
        },
        type: 'gameplay'
      }
    ]
  },
  {
    id: 'monster-hunter-wilds',
    title: {
      en: 'Monster Hunter Wilds',
      fr: 'Monster Hunter Wilds',
      es: 'Monster Hunter Wilds',
      ar: 'مونستر هنتر وايلدز'
    },
    developer: 'Capcom',
    releaseDate: {
      en: '2025',
      fr: '2025',
      es: '2025',
      ar: '2025'
    },
    genre: {
      en: 'Action RPG / Hunting',
      fr: 'Action RPG / Chasse',
      es: 'RPG de Acción / Caza',
      ar: 'صيد وتقمص أدوار'
    },
    categoryKey: 'action_rpg',
    platforms: ['PC', 'PS5', 'Xbox Series X/S'],
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
    description: {
      en: 'Dynamic, ever-changing biomes full of relentless predators and fierce weather conditions. Experience next-gen monster hunting and riding companions.',
      fr: 'Des biomes dynamiques et changeants remplis de prédateurs féroces et de conditions météo extrêmes.',
      es: 'Ecosistemas dinámicos y vivos con manadas de bestias implacables y clima cambiante.',
      ar: 'بيئات حية ومتقلبة تعج بالوحوش الضارية وعواصف رملية عاتية، تأخذك في الجيل القادم من متعة الصيد الاستراتيجي.'
    },
    tag: {
      en: 'Next-Gen Hunt',
      fr: 'Chasse Nouvelle Génération',
      es: 'Caza de Nueva Generación',
      ar: 'صيد الجيل الجديد'
    },
    trailers: [
      {
        id: 'vE124Z1xGvg',
        url: 'https://www.youtube.com/watch?v=vE124Z1xGvg',
        title: {
          en: 'Trailer 1: 1st Official Trailer',
          fr: 'Bande-annonce 1 : 1ère Bande-annonce Officielle',
          es: 'Tráiler 1: Primer Tráiler Oficial',
          ar: 'العرض 1: الإعلان الرسمي الأول'
        },
        type: 'reveal'
      },
      {
        id: 'h_JqU0v0WvY',
        url: 'https://www.youtube.com/watch?v=h_JqU0v0WvY',
        title: {
          en: 'Trailer 2: Ecosystem Gameplay Showcase',
          fr: 'Bande-annonce 2 : Gameplay de l\'Écosystème',
          es: 'Tráiler 2: Demostración de Jugabilidad',
          ar: 'العرض 2: استعراض النظام البيئي وأسلوب اللعب'
        },
        type: 'gameplay'
      }
    ]
  },
  {
    id: 'judas',
    title: {
      en: 'Judas',
      fr: 'Judas',
      es: 'Judas',
      ar: 'يهوذا (Judas)'
    },
    developer: 'Ghost Story Games',
    releaseDate: {
      en: '2025 / 2026',
      fr: '2025 / 2026',
      es: '2025 / 2026',
      ar: '2025 / 2026'
    },
    genre: {
      en: 'Narrative Sci-Fi FPS',
      fr: 'FPS Narratif Sci-Fi',
      es: 'FPS Narrativo de Ciencia Ficción',
      ar: 'تصويب منظور أول وخيال علمي'
    },
    categoryKey: 'shooter',
    platforms: ['PC', 'PS5', 'Xbox Series X/S'],
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    description: {
      en: 'From the creative mind behind BioShock (Ken Levine), Judas is a single-player narrative first-person shooter set aboard a disintegrating starship.',
      fr: 'Par le créateur de BioShock (Ken Levine), Judas est un FPS narratif à bord d\'un vaisseau spatial en perdition.',
      es: 'Del creador de BioShock (Ken Levine), Judas es un shooter narrativo en primera persona a bordo de una nave espacial en ruinas.',
      ar: 'من مبتكر سلسلة بايوشوك الأسطورية كين ليفين، قصة غامضة ومثيرة على متن سفينة فضائية عملاقة تتفكك في أعماق الفضاء.'
    },
    tag: {
      en: 'BioShock Creator',
      fr: 'Par le créateur de BioShock',
      es: 'Del creador de BioShock',
      ar: 'من مطور بايوشوك'
    },
    trailers: [
      {
        id: 'Y3t01BfvB5k',
        url: 'https://www.youtube.com/watch?v=Y3t01BfvB5k',
        title: {
          en: 'Trailer 1: Who is Judas? Story Trailer',
          fr: 'Bande-annonce 1 : Qui est Judas ?',
          es: 'Tráiler 1: ¿Quién es Judas? Tráiler de Historia',
          ar: 'العرض 1: من هي يهوذا؟ عرض القصة'
        },
        type: 'cinematic'
      },
      {
        id: 'e3L06hR0p-Q',
        url: 'https://www.youtube.com/watch?v=e3L06hR0p-Q',
        title: {
          en: 'Trailer 2: Official Reveal Trailer',
          fr: 'Bande-annonce 2 : Révélation Officielle',
          es: 'Tráiler 2: Revelación Oficial',
          ar: 'العرض 2: الإعلان الرسمي'
        },
        type: 'reveal'
      }
    ]
  },
  {
    id: 'intergalactic',
    title: {
      en: 'Intergalactic: The Heretic Prophet',
      fr: 'Intergalactic: The Heretic Prophet',
      es: 'Intergalactic: The Heretic Prophet',
      ar: 'بين المجرات: النبي المنشق'
    },
    developer: 'Naughty Dog / Sony',
    releaseDate: {
      en: '2026+',
      fr: '2026+',
      es: '2026+',
      ar: '2026+'
    },
    genre: {
      en: 'Space RPG',
      fr: 'RPG Spatial',
      es: 'RPG Espacial',
      ar: 'تقمص أدوار واستكشاف فضاء'
    },
    categoryKey: 'scifi',
    platforms: ['PS5', 'PC'],
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    description: {
      en: 'Venture across uncharted star systems, engage in zero-g boarding actions, and confront galactic political conspiracies in this cinematic space odyssey.',
      fr: 'Explorez des systèmes stellaires inconnus et vivez une odyssée spatiale cinématique.',
      es: 'Viaja por sistemas estelares inexplorados y descubre conspiraciones en una odisea espacial sin precedentes.',
      ar: 'رحلة عبر أجرام سماوية مجهولة ومعارك فضائية بانعدام الجاذبية ومؤامرات كوكبية كبرى في أضخم ملحمة فضاء سينمائية.'
    },
    tag: {
      en: 'Sci-Fi Odyssey',
      fr: 'Odyssée Sci-Fi',
      es: 'Odisea de Ciencia Ficción',
      ar: 'ملحمة فضاء'
    },
    trailers: [
      {
        id: 'K0w6p_ePz2E',
        url: 'https://www.youtube.com/watch?v=K0w6p_ePz2E',
        title: {
          en: 'Trailer 1: Deep Space Cinematic Reveal',
          fr: 'Bande-annonce 1 : Révélation Cinématique de l\'Espace',
          es: 'Tráiler 1: Revelación Cinemática del Espacio',
          ar: 'العرض 1: الكشف السينمائي لأعماق الفضاء'
        },
        type: 'cinematic'
      },
      {
        id: 'mU38Y7Gg7iQ',
        url: 'https://www.youtube.com/watch?v=mU38Y7Gg7iQ',
        title: {
          en: 'Trailer 2: Planet Exploration & Flight Demo',
          fr: 'Bande-annonce 2 : Démo de Vol et Exploration Planétaire',
          es: 'Tráiler 2: Vuelo y Exploración Planetaria',
          ar: 'العرض 2: استعراض استكشاف الكواكب والطيران'
        },
        type: 'gameplay'
      }
    ]
  }
];

// Parser helper for Google Sheets data
export const parseGoogleSheetsTrailers = (rawData: any[]): UpcomingGameTrailer[] => {
  if (!Array.isArray(rawData) || rawData.length === 0) return [];

  return rawData.map((row: any, idx: number) => {
    const getVal = (...keys: string[]) => {
      const rowKeys = Object.keys(row);
      for (const k of keys) {
        const normalized = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        const found = rowKeys.find(rk => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized);
        if (found && row[found] !== undefined && row[found] !== null && String(row[found]).trim() !== '') {
          return String(row[found]).trim();
        }
      }
      return '';
    };

    const titleEn = getVal('title', 'name', 'gamename', 'gametitle') || `Upcoming Game #${idx + 1}`;
    const titleFr = getVal('title_fr', 'name_fr') || titleEn;
    const titleEs = getVal('title_es', 'name_es') || titleEn;
    const titleAr = getVal('title_ar', 'name_ar') || titleEn;

    const dev = getVal('developer', 'studio', 'publisher', 'dev', 'company') || 'Game Studio';
    
    const rawRelease = getVal('releasedate', 'release', 'date', 'year') || 'Coming Soon';
    const releaseEn = formatReleaseDate(rawRelease, 'en');
    const releaseFr = formatReleaseDate(getVal('releasedate_fr', 'release_fr') || rawRelease, 'fr');
    const releaseEs = formatReleaseDate(getVal('releasedate_es', 'release_es') || rawRelease, 'es');
    const releaseAr = formatReleaseDate(getVal('releasedate_ar', 'release_ar') || rawRelease, 'ar');

    const genreEn = getVal('genre', 'category', 'type') || 'Action RPG';
    const genreFr = getVal('genre_fr', 'category_fr') || genreEn;
    const genreEs = getVal('genre_es', 'category_es') || genreEn;
    const genreAr = getVal('genre_ar', 'category_ar') || genreEn;

    const descEn = getVal('description', 'desc', 'overview', 'summary', 'about') || 'Watch the latest official trailers and reveals.';
    const descFr = getVal('description_fr', 'desc_fr') || descEn;
    const descEs = getVal('description_es', 'desc_es') || descEn;
    const descAr = getVal('description_ar', 'desc_ar') || descEn;

    const tagEn = getVal('tag', 'badge', 'status') || 'Upcoming';
    const tagFr = getVal('tag_fr', 'badge_fr') || tagEn;
    const tagEs = getVal('tag_es', 'badge_es') || tagEn;
    const tagAr = getVal('tag_ar', 'badge_ar') || tagEn;

    const platformsRaw = getVal('platforms', 'platform', 'devices');
    const platforms = platformsRaw ? platformsRaw.split(/[,|\/]/).map(s => s.trim()).filter(Boolean) : ['PC', 'PS5', 'Xbox Series X/S'];

    const parsedTrailers: TrailerItem[] = [];

    const multiUrlStr = getVal('trailerurls', 'trailers', 'youtubeurls', 'yt_urls', 'urls', 'trailer', 'video', 'link');
    if (multiUrlStr) {
      const splitted = multiUrlStr.split(/[\n,\|\;]/).map(s => s.trim()).filter(Boolean);
      splitted.forEach((entry, tIdx) => {
        let label = `Trailer ${tIdx + 1}`;
        let url = entry;
        if (entry.includes('http')) {
          const parts = entry.split(/(https?:\/\/.*)/i);
          if (parts.length >= 2 && parts[0].replace(/[:\-]/g, '').trim()) {
            label = parts[0].replace(/[:\-]/g, '').trim();
            url = parts[1];
          }
        }
        const ytId = extractYouTubeId(url);
        if (ytId) {
          parsedTrailers.push({
            id: ytId,
            url: `https://www.youtube.com/watch?v=${ytId}`,
            title: {
              en: label,
              fr: label,
              es: label,
              ar: `العرض ${tIdx + 1}`
            }
          });
        }
      });
    }

    ['trailer1', 'trailer2', 'trailer3', 'trailer4'].forEach((tCol, tIdx) => {
      const tVal = getVal(tCol);
      if (tVal) {
        const ytId = extractYouTubeId(tVal);
        if (ytId && !parsedTrailers.some(p => p.id === ytId)) {
          parsedTrailers.push({
            id: ytId,
            url: `https://www.youtube.com/watch?v=${ytId}`,
            title: {
              en: `Trailer ${tIdx + 1}`,
              fr: `Bande-annonce ${tIdx + 1}`,
              es: `Tráiler ${tIdx + 1}`,
              ar: `العرض ${tIdx + 1}`
            }
          });
        }
      }
    });

    if (parsedTrailers.length === 0) {
      parsedTrailers.push({
        id: 'QdBZY2fkU-0',
        url: 'https://www.youtube.com/watch?v=QdBZY2fkU-0',
        title: {
          en: 'Official Reveal Trailer',
          fr: 'Bande-annonce officielle',
          es: 'Tráiler oficial',
          ar: 'العرض الرسمي'
        }
      });
    }

    const firstYtId = parsedTrailers[0]?.id;
    const cover = getVal('coverimage', 'cover', 'image', 'thumbnail', 'poster') || 
      (firstYtId ? getYouTubeThumbnail(firstYtId, 'maxres') : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop');

    let categoryKey: 'action_rpg' | 'open_world' | 'shooter' | 'scifi' | 'adventure' | 'all' = 'action_rpg';
    const lowerGenre = genreEn.toLowerCase();
    if (lowerGenre.includes('open') || lowerGenre.includes('world')) categoryKey = 'open_world';
    else if (lowerGenre.includes('shoot') || lowerGenre.includes('fps')) categoryKey = 'shooter';
    else if (lowerGenre.includes('sci') || lowerGenre.includes('space') || lowerGenre.includes('horror')) categoryKey = 'scifi';
    else if (lowerGenre.includes('advent')) categoryKey = 'adventure';

    const imdbLink = getVal('imdb', 'imdblink', 'imdburl', 'imdb_url', 'imdb_link');

    return {
      id: `gs-trailer-${idx}`,
      title: { en: titleEn, fr: titleFr, es: titleEs, ar: titleAr },
      developer: dev,
      releaseDate: { en: releaseEn, fr: releaseFr, es: releaseEs, ar: releaseAr },
      genre: { en: genreEn, fr: genreFr, es: genreEs, ar: genreAr },
      categoryKey,
      platforms,
      coverImage: cover,
      description: { en: descEn, fr: descFr, es: descEs, ar: descAr },
      tag: { en: tagEn, fr: tagFr, es: tagEs, ar: tagAr },
      trailers: parsedTrailers,
      imdbUrl: imdbLink || undefined
    };
  });
};

/**
 * Compact horizontal trailer slide component for cards with multiple trailers.
 */
const CardTrailersSlide: React.FC<{
  game: UpcomingGameTrailer;
  onSelectTrailer: (game: UpcomingGameTrailer, trailerIdx: number) => void;
  getLoc: (obj: any) => string;
  isArabic: boolean;
}> = ({ game, onSelectTrailer, getLoc, isArabic }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const subTrailers = useMemo(() => game.trailers.slice(1), [game.trailers]);

  if (subTrailers.length === 0) return null;

  const handleScroll = (direction: 'next' | 'prev') => {
    if (scrollRef.current) {
      const scrollAmount = 140;
      const multiplier = isArabic ? -1 : 1;
      const offset = direction === 'next' ? scrollAmount * multiplier : -scrollAmount * multiplier;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full pt-2 pb-1">
      {/* Slide Header: Label & Slide Arrow Controls */}
      <div className="flex items-center justify-between gap-1 mb-1.5 px-0.5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
          <Clapperboard size={11} />
          <span>{isArabic ? 'عروض إضافية' : 'More Trailers'}</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300">
            +{subTrailers.length}
          </span>
        </span>

        {subTrailers.length > 2 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleScroll('prev')}
              aria-label="Previous"
              className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ChevronLeft size={12} className="rtl:rotate-180" />
            </button>
            <button
              onClick={() => handleScroll('next')}
              aria-label="Next"
              className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ChevronRight size={12} className="rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Carousel Slide */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 snap-x scroll-smooth -mx-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {subTrailers.map((tr, idx) => {
          const trailerRealIndex = idx + 1;
          const thumb = getYouTubeThumbnail(tr.id, 'hq');

          return (
            <button
              key={tr.id}
              onClick={() => onSelectTrailer(game, trailerRealIndex)}
              className="group/slide shrink-0 snap-start flex items-center gap-2 p-1.5 pe-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200/80 hover:border-purple-400 dark:border-slate-700/70 dark:hover:border-purple-500/60 transition-all text-start active:scale-95 shadow-xs"
              title={getLoc(tr.title)}
            >
              <div className="relative w-11 h-7 rounded-md overflow-hidden bg-slate-900 shrink-0">
                <img
                  src={thumb}
                  alt={getLoc(tr.title)}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover/slide:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover/slide:bg-purple-900/40 transition-colors flex items-center justify-center">
                  <Play size={10} fill="white" className="text-white" />
                </div>
              </div>

              <div className="flex flex-col min-w-0 max-w-[125px]">
                <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200 group-hover/slide:text-purple-600 dark:group-hover/slide:text-purple-300 truncate">
                  {getLoc(tr.title)}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                  <Play size={8} fill="currentColor" />
                  <span>{isArabic ? `عرض #${trailerRealIndex + 1}` : `Trailer #${trailerRealIndex + 1}`}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface UpcomingTrailersSectionProps {
  sheetTrailersData?: any[];
}

export const UpcomingTrailersSection: React.FC<UpcomingTrailersSectionProps> = ({ sheetTrailersData }) => {
  const { language, t, dir } = useLanguage();
  const isArabic = language === 'ar';

  // Compute games list
  const allGames = useMemo(() => {
    if (Array.isArray(sheetTrailersData) && sheetTrailersData.length > 0) {
      const parsed = parseGoogleSheetsTrailers(sheetTrailersData);
      if (parsed.length > 0) return parsed;
    }

    try {
      const cached = localStorage.getItem('cached_secret_resources');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        const matchKey = Object.keys(parsedCache).find(k => {
          const norm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          return norm === 'upcomingtrailers' || norm === 'trailers' || norm === 'upcominggametrailers' || norm === 'gametrailers';
        });
        if (matchKey && Array.isArray(parsedCache[matchKey]) && parsedCache[matchKey].length > 0) {
          const parsed = parseGoogleSheetsTrailers(parsedCache[matchKey]);
          if (parsed.length > 0) return parsed;
        }
      }
    } catch (e) {
      // ignore
    }

    return CURATED_TRAILERS;
  }, [sheetTrailersData]);

  // Main Cover Focus State & Autoplay (Slow 11-second cycle requested)
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);
  const [isBannerHovered, setIsBannerHovered] = useState<boolean>(false);
  const [isBannerAutoplay, setIsBannerAutoplay] = useState<boolean>(true);

  // Cinema Modal state
  const [activeCinemaGame, setActiveCinemaGame] = useState<UpcomingGameTrailer | null>(null);
  const [activeTrailerIndex, setActiveTrailerIndex] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Cards Horizontal Carousel Slider state & ref
  const cardsScrollRef = useRef<HTMLDivElement>(null);
  const [isCardsHovered, setIsCardsHovered] = useState<boolean>(false);
  const [isCardsAutoplay, setIsCardsAutoplay] = useState<boolean>(true);

  // Safe current game in Main Cover Focus
  const currentFeaturedGame = allGames[featuredIndex] || allGames[0];

  // 1. AUTOMATIC SLOW ANIMATED CYCLING FOR "MAIN COVER FOCUS" (11 seconds)
  useEffect(() => {
    if (!isBannerAutoplay || isBannerHovered || activeCinemaGame !== null || allGames.length <= 1) {
      return;
    }
    const timer = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % allGames.length);
    }, 11000); // 11 seconds per game (calm, slow rotation)

    return () => clearInterval(timer);
  }, [isBannerAutoplay, isBannerHovered, activeCinemaGame, allGames.length]);

  // 2. AUTOMATIC RELAXED SLIDING FOR THE TRAILER CARDS SLIDER (8 seconds)
  useEffect(() => {
    if (!isCardsAutoplay || isCardsHovered || activeCinemaGame !== null || allGames.length <= 1) {
      return;
    }
    const timer = setInterval(() => {
      if (cardsScrollRef.current) {
        const container = cardsScrollRef.current;
        const cardWidth = container.querySelector('div')?.clientWidth || 360;
        const isRTL = dir === 'rtl';
        const maxScroll = container.scrollWidth - container.clientWidth;

        if (Math.abs(container.scrollLeft) >= maxScroll - 30) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: isRTL ? -(cardWidth + 24) : (cardWidth + 24), behavior: 'smooth' });
        }
      }
    }, 8000);

    return () => clearInterval(timer);
  }, [isCardsAutoplay, isCardsHovered, activeCinemaGame, dir, allGames.length]);

  // Manual scroll for Cards Carousel
  const handleScrollCards = (direction: 'next' | 'prev') => {
    if (cardsScrollRef.current) {
      const container = cardsScrollRef.current;
      const cardWidth = container.querySelector('div')?.clientWidth || 360;
      const isRTL = dir === 'rtl';
      const offset = direction === 'next' ? (isRTL ? -(cardWidth + 24) : (cardWidth + 24)) : (isRTL ? (cardWidth + 24) : -(cardWidth + 24));
      container.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // ESC to close cinema modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveCinemaGame(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when cinema modal is open
  useEffect(() => {
    if (activeCinemaGame) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeCinemaGame]);

  const handleOpenCinema = (game: UpcomingGameTrailer, trailerIdx = 0) => {
    setActiveCinemaGame(game);
    setActiveTrailerIndex(trailerIdx);
    setCopiedLink(false);
  };

  const handleCopyTrailerUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const getLoc = (obj: any): string => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[language] || obj.en || Object.values(obj)[0] || '';
  };

  // Build clean YouTube embed URL that works across all mobile, tablet, and desktop environments
  const activeTrailerId = activeCinemaGame?.trailers[activeTrailerIndex]?.id;
  const embedUrl = useMemo(() => {
    if (!activeTrailerId) return '';
    return `https://www.youtube.com/embed/${activeTrailerId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`;
  }, [activeTrailerId]);

  return (
    <section 
      className="w-full relative my-8 sm:my-12 md:my-16 transition-colors duration-300"
      dir={dir}
      aria-label={t('Upcoming Games Trailers')}
    >
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 start-10 w-64 sm:w-80 md:w-[480px] h-64 sm:h-80 md:h-[480px] bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-[90px] md:blur-[110px]" />
        <div className="absolute bottom-1/4 end-10 w-64 sm:w-80 md:w-[480px] h-64 sm:h-80 md:h-[480px] bg-indigo-600/10 dark:bg-blue-600/15 rounded-full blur-[90px] md:blur-[110px]" />
      </div>

      <div className="w-full">
        {/* 
          STREAMLINED SECTION HEADER:
          - Responsive title and icon lockup (fixed alignment, never overflows on mobile).
          - Accurate multi-language translations (EN, FR, ES, AR).
        */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="space-y-2 sm:space-y-3">
            {/* Live broadcast status strip */}
            <div className="flex items-center gap-2 sm:gap-2.5 text-[11px] sm:text-xs font-mono font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-red-500"></span>
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-bold">{t('Official Reveals Trailers & GamePlay')}</span>
              <span aria-hidden="true" className="opacity-40">·</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">
                {allGames.length} {isArabic ? 'ألعاب مرتقبة' : t('upcoming titles')}
              </span>
              <span aria-hidden="true" className="opacity-40">·</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-bold">
                4K HDR
              </span>
            </div>

            {/* FIXED SECTION TITLE & ICON LOCKUP */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-2.5 md:p-3 rounded-2xl bg-gradient-to-br from-purple-500/15 via-indigo-500/15 to-purple-500/5 text-purple-600 dark:text-purple-400 border border-purple-500/25 shadow-sm shrink-0 flex items-center justify-center">
                <Film className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </div>
              
              <h2 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic flex flex-wrap items-baseline gap-x-2" 
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {isArabic ? (
                  <>
                    <span>عروض الألعاب</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 dark:from-purple-400 dark:via-indigo-400 dark:to-cyan-400">
                      المرتقبة
                    </span>
                  </>
                ) : language === 'fr' ? (
                  <>
                    <span>Bandes-Annonces des</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 dark:from-purple-400 dark:via-indigo-400 dark:to-cyan-400">
                      Jeux à Venir
                    </span>
                  </>
                ) : language === 'es' ? (
                  <>
                    <span>Tráilers de</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 dark:from-purple-400 dark:via-indigo-400 dark:to-cyan-400">
                      Próximos Juegos
                    </span>
                  </>
                ) : (
                  <>
                    <span>Upcoming Games</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 dark:from-purple-400 dark:via-indigo-400 dark:to-cyan-400">
                      Trailers
                    </span>
                  </>
                )}
              </h2>
            </div>

            {/* Description */}
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm md:text-base max-w-3xl font-medium leading-relaxed">
              {t('Watch the latest official 4K trailers, gameplay reveals, and exclusive announcements for the most anticipated upcoming titles.')}
            </p>
          </div>

          {/* Autoplay & Spotlight Counter controls */}
          <div className="flex items-center gap-2 self-start md:self-end shrink-0">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              {isArabic ? 'عرض' : 'Spotlight'}: <span className="text-purple-600 dark:text-purple-400">{featuredIndex + 1}</span> / {allGames.length}
            </span>
            <button
              onClick={() => setIsBannerAutoplay(!isBannerAutoplay)}
              className={`p-2 px-3 rounded-xl border transition-all text-xs flex items-center gap-1.5 shadow-xs ${
                isBannerAutoplay
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-800'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
              }`}
              title={isBannerAutoplay ? t('Autoplay On') : t('Autoplay Paused')}
            >
              {isBannerAutoplay ? <Pause size={13} /> : <Play size={13} />}
              <span className="text-[11px] font-semibold">
                {isBannerAutoplay ? (isArabic ? 'دوران هادئ' : 'Auto-Rotate') : (isArabic ? 'متوقف' : 'Paused')}
              </span>
            </button>
          </div>
        </div>

        {/* 
          1. MAIN COVER FOCUS (FEATURED SPOTLIGHT BANNER):
          - Slow switching (11s timer) with smooth cross-fade animation.
          - Fully responsive across mobile, tablet, and laptop.
          - Artwork anchored at object-[center_12%] so character heads are never cropped.
          - Ambient backdrop blur for widescreen edges.
        */}
        {currentFeaturedGame && (
          <div 
            onMouseEnter={() => setIsBannerHovered(true)}
            onMouseLeave={() => setIsBannerHovered(false)}
            className="mb-8 sm:mb-10 w-full rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-2xl relative group select-none"
          >
            <div className="relative w-full min-h-[440px] sm:min-h-[500px] md:min-h-[560px] lg:min-h-[620px] xl:min-h-[660px] flex flex-col justify-between overflow-hidden">
              
              {/* SLOW, SMOOTH ARTWORK TRANSITION */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeaturedGame.id}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.9, ease: 'easeInOut' }}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                >
                  {/* Ambient blur layer for widescreen fill */}
                  <img
                    src={currentFeaturedGame.backdropImage || currentFeaturedGame.coverImage}
                    alt=""
                    aria-hidden="true"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-40 scale-110 pointer-events-none"
                  />

                  {/* Main crisp cover image (Anchored top/center-10%) */}
                  <img
                    src={currentFeaturedGame.backdropImage || currentFeaturedGame.coverImage}
                    alt={getLoc(currentFeaturedGame.title)}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover object-[center_12%] sm:object-[center_10%] transition-transform duration-700 ease-out"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Gradient Scrims: text readability at bottom, clean art at top */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 via-45% to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 via-50% to-transparent pointer-events-none" />
              
              {/* Top Banner Bar: Tag + Game Selector Pills */}
              <div className="relative p-4 sm:p-6 md:p-7 z-10 flex items-center justify-between gap-2.5 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-purple-600 text-white rounded-xl backdrop-blur-md shadow-lg shadow-purple-600/30 flex items-center gap-1.5">
                    <Flame size={14} className="text-amber-300" />
                    {getLoc(currentFeaturedGame.tag) || t('Featured Premiere')}
                  </span>
                  <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-black/60 text-slate-200 rounded-xl backdrop-blur-md border border-white/10">
                    {currentFeaturedGame.trailers.length} {t('Trailers Available')}
                  </span>
                </div>

                {/* Game Pills / Quick Jump Indicators */}
                <div className="hidden xs:flex items-center gap-1 bg-black/50 backdrop-blur-md p-1 rounded-2xl border border-white/10 overflow-x-auto scrollbar-none max-w-full">
                  {allGames.map((g, idx) => {
                    const isCurrent = idx === featuredIndex;
                    return (
                      <button
                        key={g.id}
                        onClick={() => setFeaturedIndex(idx)}
                        className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-xl transition-all shrink-0 ${
                          isCurrent
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 ring-1 ring-purple-300 scale-105'
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                        title={getLoc(g.title)}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Floating Manual Previous / Next Buttons (Responsive sizing & placement) */}
              <button
                onClick={() => setFeaturedIndex((prev) => (prev - 1 + allGames.length) % allGames.length)}
                aria-label={t('Previous Game')}
                className="absolute start-2 sm:start-4 md:start-5 top-1/3 sm:top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-purple-600 text-white backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-xl"
              >
                <ChevronLeft size={20} className="rtl:rotate-180 sm:w-[22px] sm:h-[22px]" />
              </button>

              <button
                onClick={() => setFeaturedIndex((prev) => (prev + 1) % allGames.length)}
                aria-label={t('Next Game')}
                className="absolute end-2 sm:end-4 md:end-5 top-1/3 sm:top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-purple-600 text-white backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-xl"
              >
                <ChevronRight size={20} className="rtl:rotate-180 sm:w-[22px] sm:h-[22px]" />
              </button>

              {/* Bottom Content Area (Smooth Animated Text Transition) */}
              <div className="relative p-4 sm:p-7 md:p-10 z-10 text-white flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFeaturedGame.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="max-w-2xl space-y-2 sm:space-y-3"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm font-mono text-slate-300 flex-wrap">
                      <span className="font-semibold text-slate-200">{currentFeaturedGame.developer}</span>
                      <span aria-hidden="true" className="opacity-50">·</span>
                      <span>{getLoc(currentFeaturedGame.genre)}</span>
                      <span aria-hidden="true" className="opacity-50">·</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Calendar size={13} />
                        {getLoc(currentFeaturedGame.releaseDate)}
                      </span>
                      <span aria-hidden="true" className="opacity-50">·</span>
                      <span className="text-slate-300">{currentFeaturedGame.platforms.join(' / ')}</span>
                    </div>

                    <h3 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white drop-shadow-md">
                      {getLoc(currentFeaturedGame.title)}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-xl">
                      {getLoc(currentFeaturedGame.description)}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Primary Action & Additional Trailers Strip */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap">
                  {/* Main Play Button for Trailer 1 */}
                  <button
                    onClick={() => handleOpenCinema(currentFeaturedGame, 0)}
                    className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs sm:text-sm tracking-wide shadow-xl shadow-purple-600/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Play size={17} fill="currentColor" />
                    <span>{t('Watch Trailer')}</span>
                  </button>

                  {/* IMDb Game Profile Button */}
                  <a
                    href={getGameImdbUrl(currentFeaturedGame)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-[#F5C518]/15 hover:bg-[#F5C518] hover:text-black active:scale-95 text-[#F5C518] font-bold text-xs sm:text-sm tracking-wide border border-[#F5C518]/30 hover:border-[#F5C518] shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                    title={t('View in IMDB')}
                    aria-label={t('View in IMDB')}
                  >
                    <SiImdb size={18} />
                    <span>{t('View in IMDB')}</span>
                  </a>

                  {/* Multi-trailer switcher if available */}
                  {currentFeaturedGame.trailers.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                      {currentFeaturedGame.trailers.slice(1).map((tr, idx) => (
                        <button
                          key={tr.id}
                          onClick={() => handleOpenCinema(currentFeaturedGame, idx + 1)}
                          className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 shrink-0"
                          title={getLoc(tr.title)}
                        >
                          <Clapperboard size={13} className="text-purple-300" />
                          <span className="max-w-[130px] truncate">{getLoc(tr.title)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Calm Progress Bar: 11-second duration */}
              {isBannerAutoplay && !isBannerHovered && (
                <motion.div
                  key={`progress-${featuredIndex}`}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 11, ease: 'linear' }}
                  className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 z-30 opacity-80"
                />
              )}
            </div>
          </div>
        )}

        {/* 
          2. TRAILERS CARD SLIDE (HORIZONTAL CAROUSEL):
          - Touch swipe, snap-start, manual arrows & auto-scroll.
          - Responsive card widths on mobile, tablet, and laptop.
        */}
        <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
          {/* Slider Sub-header */}
          <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Tv size={16} className="text-purple-600 dark:text-purple-400" />
                <span>{isArabic ? 'أشرطة جميع الألعاب القادمة' : t('All Upcoming Game Reels')}</span>
              </span>
              <span className="text-xs font-mono text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                {allGames.length}
              </span>
            </div>

            {/* Slider Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setIsCardsAutoplay(!isCardsAutoplay)}
                className={`p-2 px-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                  isCardsAutoplay
                    ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                    : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
                }`}
                title={isCardsAutoplay ? t('Autoplay On') : t('Autoplay Paused')}
              >
                {isCardsAutoplay ? <Pause size={13} /> : <Play size={13} />}
                <span className="text-[11px] font-medium hidden sm:inline">
                  {isCardsAutoplay ? (isArabic ? 'انزلاق تلقائي' : 'Auto-Slide') : (isArabic ? 'توقف' : 'Paused')}
                </span>
              </button>

              <button
                onClick={() => handleScrollCards('prev')}
                aria-label="Previous Slide"
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-slate-800 transition-colors shadow-xs active:scale-95"
              >
                <ChevronLeft size={16} className="rtl:rotate-180" />
              </button>

              <button
                onClick={() => handleScrollCards('next')}
                aria-label="Next Slide"
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-slate-800 transition-colors shadow-xs active:scale-95"
              >
                <ChevronRight size={16} className="rtl:rotate-180" />
              </button>
            </div>
          </div>

          {/* Horizontal Slide Scroll Container (Mobile: peek 82vw, Tablet: 340px, Laptop: 380px) */}
          <div
            ref={cardsScrollRef}
            onMouseEnter={() => setIsCardsHovered(true)}
            onMouseLeave={() => setIsCardsHovered(false)}
            className="flex items-stretch gap-4 sm:gap-5 md:gap-6 overflow-x-auto scrollbar-none py-2 px-1 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {allGames.map((game, gIdx) => {
              const mainTrailer = game.trailers[0];
              const trailerCount = game.trailers.length;
              const hasMultiTrailers = trailerCount > 1;
              const isSelectedInSpotlight = gIdx === featuredIndex;

              return (
                <div
                  key={game.id}
                  className={`group shrink-0 snap-start w-[82vw] xs:w-[320px] sm:w-[340px] md:w-[360px] lg:w-[380px] rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl ${
                    isSelectedInSpotlight
                      ? 'border-purple-500 ring-2 ring-purple-500/25 shadow-purple-500/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-purple-500/50 dark:hover:border-purple-500/40'
                  }`}
                >
                  {/* MAIN COVER: 16:9 aspect, object-top so faces/logos are never cut */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    <img
                      src={game.coverImage || (mainTrailer?.id ? getYouTubeThumbnail(mainTrailer.id, 'hq') : '')}
                      alt={getLoc(game.title)}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top sm:object-[center_15%] group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    {/* Top Tag & Multi-trailer counter badge */}
                    <div className="absolute top-2.5 start-2.5 end-2.5 flex items-center justify-between pointer-events-none">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-purple-300 rounded-md border border-purple-500/30">
                        {getLoc(game.tag)}
                      </span>
                      {hasMultiTrailers && (
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-600/90 text-white rounded-md backdrop-blur-md shadow-xs">
                          {trailerCount} {isArabic ? 'عروض' : t('Trailers')}
                        </span>
                      )}
                    </div>

                    {/* Center Big Play Button: Launches Main Trailer */}
                    <button
                      onClick={() => handleOpenCinema(game, 0)}
                      aria-label={`${t('Watch Trailer')}: ${getLoc(game.title)}`}
                      className="absolute inset-0 m-auto w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-purple-600/95 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                      <Play size={19} fill="currentColor" className="ms-0.5" />
                    </button>

                    {/* Bottom Release Date & Genre */}
                    <div className="absolute bottom-2.5 start-2.5 end-2.5 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-300">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Calendar size={12} />
                        {getLoc(game.releaseDate)}
                      </span>
                      <span>{getLoc(game.genre)}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      {/* Developer & Platforms line */}
                      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                        <span className="truncate">{game.developer}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-600 dark:text-slate-300 truncate">
                          {game.platforms.join(', ')}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                        {getLoc(game.title)}
                      </h4>

                      {/* Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {getLoc(game.description)}
                      </p>
                    </div>

                    {/* Multi-Trailers mini slider if present */}
                    {hasMultiTrailers && (
                      <CardTrailersSlide
                        game={game}
                        onSelectTrailer={handleOpenCinema}
                        getLoc={getLoc}
                        isArabic={isArabic}
                      />
                    )}

                    {/* Card Footer Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenCinema(game, 0)}
                        className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-purple-600/10 hover:bg-purple-600 text-purple-700 hover:text-white dark:text-purple-400 dark:hover:text-white dark:bg-purple-500/10 dark:hover:bg-purple-600 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Play size={13} fill="currentColor" />
                        <span>{t('Watch Trailer')}</span>
                      </button>

                      {/* View in IMDB Button */}
                      <a
                        href={getGameImdbUrl(game)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-2 text-xs font-bold rounded-xl border transition-all shrink-0 flex items-center justify-center bg-[#F5C518]/10 hover:bg-[#F5C518] hover:text-black dark:bg-[#F5C518]/15 dark:hover:bg-[#F5C518] dark:hover:text-black text-[#E2B616] dark:text-[#F5C518] border-[#F5C518]/30 hover:border-[#F5C518] shadow-xs active:scale-95 group/imdb cursor-pointer"
                        title={t('View in IMDB')}
                        aria-label={t('View in IMDB')}
                      >
                        <SiImdb size={18} className="transition-transform group-hover/imdb:scale-110" />
                      </a>

                      {/* External YouTube Link */}
                      {mainTrailer?.url && (
                        <a
                          href={mainTrailer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
                          title={t('Open on YouTube')}
                        >
                          <TbBrandYoutube size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 
        CINEMA THEATER MODAL:
        - Renders via createPortal with z-[999999] directly to document.body (over navbar).
        - Playsinline, enablejsapi, and cross-origin compliant YouTube embed for 100% reliable playback.
      */}
      {createPortal(
        <AnimatePresence>
          {activeCinemaGame && (
            <div 
              className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 md:p-6" 
              dir={dir}
              role="dialog"
              aria-modal="true"
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveCinemaGame(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              />

              {/* Dialog */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
                className="relative w-full max-w-5xl rounded-2xl md:rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col z-10 max-h-[96vh]"
              >
                {/* Cinema Header */}
                <div className="px-3 sm:px-6 py-3 bg-slate-950/95 border-b border-slate-800/80 flex items-center justify-between gap-2.5 text-white">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 shrink-0">
                      <MonitorPlay size={18} />
                    </div>
                    <div className="truncate">
                      <h3 className="text-xs sm:text-base font-bold truncate">
                        {getLoc(activeCinemaGame.title)}
                      </h3>
                      <p className="text-[10px] sm:text-xs font-mono text-slate-400 truncate">
                        {activeCinemaGame.developer} · {getLoc(activeCinemaGame.releaseDate)}
                      </p>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyTrailerUrl(activeCinemaGame.trailers[activeTrailerIndex]?.url || '')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 active:scale-95"
                      title={t('Copy Trailer Link')}
                    >
                      {copiedLink ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span className="text-emerald-400 hidden sm:inline">{t('Trailer Link Copied')}</span>
                        </>
                      ) : (
                        <>
                          <Share2 size={14} />
                          <span className="hidden sm:inline">{t('Copy Trailer Link')}</span>
                        </>
                      )}
                    </button>

                    <a
                      href={getGameImdbUrl(activeCinemaGame)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-[#F5C518]/20 text-slate-200 hover:text-[#F5C518] transition-colors flex items-center justify-center"
                      title={t('View in IMDB')}
                      aria-label={t('View in IMDB')}
                    >
                      <SiImdb size={18} />
                    </a>

                    <a
                      href={activeCinemaGame.trailers[activeTrailerIndex]?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-red-600/20 text-slate-200 hover:text-red-400 transition-colors"
                      title={t('Open on YouTube')}
                    >
                      <TbBrandYoutube size={18} />
                    </a>

                    <button
                      onClick={() => setActiveCinemaGame(null)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title={t('Close Cinema Player')}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* 16:9 YouTube Video Embed Player */}
                <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                  {embedUrl ? (
                    <iframe
                      key={activeTrailerId}
                      src={embedUrl}
                      title={getLoc(activeCinemaGame.trailers[activeTrailerIndex].title)}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 p-6 text-center text-slate-400">
                      <Film size={32} />
                      <p className="text-sm">{t('Trailer video not available')}</p>
                      {activeCinemaGame.trailers[activeTrailerIndex]?.url && (
                        <a
                          href={activeCinemaGame.trailers[activeTrailerIndex]?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold flex items-center gap-2"
                        >
                          <ExternalLink size={14} />
                          <span>{t('Open on YouTube')}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Multi-Trailer Bar inside Cinema Player */}
                {activeCinemaGame.trailers.length > 1 && (
                  <div className="px-3 sm:px-6 py-2.5 bg-slate-950/95 border-t border-slate-800 flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none">
                    <span className="text-[11px] sm:text-xs font-mono font-semibold uppercase text-slate-400 shrink-0 flex items-center gap-1.5 me-1">
                      <Clapperboard size={13} className="text-purple-400" />
                      <span>{t('Switch Trailer')}:</span>
                    </span>

                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                      {activeCinemaGame.trailers.map((tr, idx) => {
                        const isCurrent = activeTrailerIndex === idx;
                        const thumb = getYouTubeThumbnail(tr.id, 'hq');

                        return (
                          <button
                            key={tr.id}
                            onClick={() => {
                              setActiveTrailerIndex(idx);
                              setCopiedLink(false);
                            }}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-all shrink-0 flex items-center gap-2 active:scale-95 ${
                              isCurrent
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-300'
                                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                            }`}
                          >
                            <div className="w-6 h-4 rounded overflow-hidden bg-black shrink-0">
                              <img src={thumb} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="truncate max-w-[140px] sm:max-w-[180px]">{getLoc(tr.title)}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1 py-0.2 rounded bg-white/20 font-mono">
                                {isArabic ? 'يعرض' : 'LIVE'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
};

export default UpcomingTrailersSection;
