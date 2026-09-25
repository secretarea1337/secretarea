import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage, Language } from '../src/contexts/LanguageContext';
import Icon from './Icon';

export type IntelCategory = 'GAME' | 'HYPERVISOR' | 'STEAMTOOLS' | 'ARCHITECT' | 'EXTRA';

export interface IntelItem {
  id: string;
  title: string;
  description: string;
  timestamp?: string;
  category: IntelCategory | string;
  type: 'NEW' | 'UPDATE';
  version?: string;
  sourceItem?: any;
}

interface LatestIntelPanelProps {
  open?: boolean;
  onClose?: () => void;
  items?: IntelItem[];
}

// Localized strings dictionary
const LOCALIZED = {
  title: {
    en: 'Recent products',
    fr: 'Produits récents',
    es: 'Productos recientes',
    ar: 'أحدث المنتجات'
  },
  subtitle: {
    en: 'Live catalog additions, versions & changelogs',
    fr: 'Ajouts au catalogue en direct, versions et journaux',
    es: 'Novedades del catálogo en vivo, versiones y cambios',
    ar: 'إضافات الكتالوج المباشرة والإصدارات وسجلات التغيير'
  },
  live: {
    en: 'Live Feed',
    fr: 'Flux en direct',
    es: 'Feed en vivo',
    ar: 'بث مباشر'
  },
  all: {
    en: 'All',
    fr: 'Tous',
    es: 'Todos',
    ar: 'الكل'
  },
  allTypes: {
    en: 'All Types',
    fr: 'Tous types',
    es: 'Todos',
    ar: 'جميع الأنواع'
  },
  newArrivals: {
    en: 'New',
    fr: 'Nouveautés',
    es: 'Novedades',
    ar: 'جديد'
  },
  updates: {
    en: 'Updates',
    fr: 'Mises à jour',
    es: 'Actualizaciones',
    ar: 'تحديثات'
  },
  noProductsFound: {
    en: 'No recent products found',
    fr: 'Aucun produit récent trouvé',
    es: 'No se encontraron productos recientes',
    ar: 'لم يتم العثور على منتجات حديثة'
  },
  adjustFilter: {
    en: 'Try selecting a different category or filter.',
    fr: 'Essayez de sélectionner une autre catégorie ou filtre.',
    es: 'Prueba seleccionando una categoría o filtro diferente.',
    ar: 'حاول اختيار فئة أو تصفية أخرى.'
  },
  clearFilters: {
    en: 'Reset filters',
    fr: 'Réinitialiser les filtres',
    es: 'Restablecer filtros',
    ar: 'إعادة ضبط التصفية'
  },
  recordsVerified: {
    en: 'records verified',
    fr: 'enregistrements vérifiés',
    es: 'registros verificados',
    ar: 'عناصر تم التحقق منها'
  },
  newBadge: {
    en: 'NEW',
    fr: 'NOUVEAU',
    es: 'NUEVO',
    ar: 'جديد'
  },
  updateBadge: {
    en: 'UPDATE',
    fr: 'MÀJ',
    es: 'ACTUALIZACIÓN',
    ar: 'تحديث'
  },
  newPrefix: {
    en: 'New addition:',
    fr: 'Nouvel ajout :',
    es: 'Nueva adición:',
    ar: 'إضافة جديدة:'
  },
  updatePrefix: {
    en: 'Updated to',
    fr: 'Mis à jour vers',
    es: 'Actualizado a',
    ar: 'تم التحديث إلى'
  }
};

const CATEGORY_NAMES: Record<string, Record<Language, string>> = {
  ALL: { en: 'All', fr: 'Tous', es: 'Todos', ar: 'الكل' },
  GAME: { en: 'Games', fr: 'Jeux', es: 'Juegos', ar: 'الألعاب' },
  ARCHITECT: { en: 'Tools', fr: 'Outils', es: 'Herramientas', ar: 'الأدوات' },
  HYPERVISOR: { en: 'Hypervisor', fr: 'Hyperviseur', es: 'Hipervisor', ar: 'الهايبرفايزر' },
  STEAMTOOLS: { en: 'SteamTools', fr: 'SteamTools', es: 'SteamTools', ar: 'أدوات ستيم' },
  EXTRA: { en: 'SaveGame', fr: 'Sauvegardes', es: 'Guardados', ar: 'ملفات الحفظ' },
};

const CATEGORY_ICONS: Record<string, string> = {
  ALL: 'Grid',
  GAME: 'Gamepad',
  ARCHITECT: 'Tools',
  HYPERVISOR: 'Cpu',
  STEAMTOOLS: 'Box',
  EXTRA: 'Save',
};

// Smart Relative Time Formatter
const formatRelativeTime = (timestamp: string | undefined, lang: Language): string => {
  if (!timestamp) {
    switch (lang) {
      case 'ar': return 'حديث';
      case 'fr': return 'Récent';
      case 'es': return 'Reciente';
      default: return 'Recent';
    }
  }

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return timestamp;
  }

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) {
    switch (lang) {
      case 'ar': return 'الآن';
      case 'fr': return 'À l\'instant';
      case 'es': return 'Ahora mismo';
      default: return 'Just now';
    }
  }

  if (diffMin < 60) {
    switch (lang) {
      case 'ar': return `منذ ${diffMin} دقيقة`;
      case 'fr': return `Il y a ${diffMin} min`;
      case 'es': return `Hace ${diffMin} min`;
      default: return `${diffMin}m ago`;
    }
  }

  if (diffHours < 24) {
    switch (lang) {
      case 'ar':
        if (diffHours === 1) return 'منذ ساعة';
        if (diffHours === 2) return 'منذ ساعتين';
        if (diffHours >= 3 && diffHours <= 10) return `منذ ${diffHours} ساعات`;
        return `منذ ${diffHours} ساعة`;
      case 'fr': return `Il y a ${diffHours}h`;
      case 'es': return `Hace ${diffHours}h`;
      default: return `${diffHours}h ago`;
    }
  }

  if (diffDays === 1) {
    switch (lang) {
      case 'ar': return 'أمس';
      case 'fr': return 'Hier';
      case 'es': return 'Ayer';
      default: return 'Yesterday';
    }
  }

  if (diffDays === 2) {
    switch (lang) {
      case 'ar': return 'منذ يومين';
      case 'fr': return 'Il y a 2 jours';
      case 'es': return 'Hace 2 días';
      default: return '2 days ago';
    }
  }

  if (diffDays < 30) {
    switch (lang) {
      case 'ar':
        if (diffDays >= 3 && diffDays <= 10) return `منذ ${diffDays} أيام`;
        return `منذ ${diffDays} يوم`;
      case 'fr': return `Il y a ${diffDays} jours`;
      case 'es': return `Hace ${diffDays} días`;
      default: return `${diffDays}d ago`;
    }
  }

  try {
    const locale = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return timestamp;
  }
};

const extractIntelFromRawResources = (resources: Record<string, any[]>): IntelItem[] => {
  const items: IntelItem[] = [];
  let idCounter = 1;

  const addItems = (sourceItems: any[], intelCategory: IntelCategory) => {
    if (!Array.isArray(sourceItems)) return;
    const sorted = [...sourceItems].sort((a, b) => {
      const dA = new Date(a.dateAdded || a.timestamp || 0).getTime();
      const dB = new Date(b.dateAdded || b.timestamp || 0).getTime();
      if (!isNaN(dA) && !isNaN(dB)) return dB - dA;
      if (!isNaN(dA)) return -1;
      if (!isNaN(dB)) return 1;
      return 0;
    });

    // Capture up to 8 recent products per category
    const recent = sorted.slice(0, 8);
    recent.forEach((item) => {
      const v = String(item.version || '').toLowerCase();
      const title = String(item.name || item.title || '').toLowerCase();
      const isUpdate =
        (v && v !== '1.0' && v !== '1.0.0' && v !== 'v1.0' && v !== 'v1.0.0' && v !== 'release' && v !== 'n/a' && v !== 'tba') ||
        title.includes('update') ||
        title.includes('hotfix') ||
        title.includes('patch');
      const type = isUpdate ? 'UPDATE' : 'NEW';
      const descPrefix = isUpdate ? 'Updated to' : 'New addition:';

      items.push({
        id: `intel-${idCounter++}`,
        title: item.name || item.title || 'Unknown',
        description: `${descPrefix} ${item.version ? `(v${item.version})` : item.name || item.title}`,
        timestamp: item.dateAdded || item.timestamp || '',
        category: intelCategory,
        type: type,
        version: item.version,
        sourceItem: item
      });
    });
  };

  // Only released catalog categories: GAME, HYPERVISOR, STEAMTOOLS, ARCHITECT, EXTRA (no UPCOMING)
  addItems(resources['game'] || [], 'GAME');
  addItems(resources['hypervisor'] || [], 'HYPERVISOR');
  addItems(resources['steamtools'] || [], 'STEAMTOOLS');
  addItems(resources['architect'] || [], 'ARCHITECT');
  addItems(resources['extra'] || [], 'EXTRA');

  return items.sort((a, b) => {
    const dA = new Date(a.timestamp || 0).getTime();
    const dB = new Date(b.timestamp || 0).getTime();
    if (!isNaN(dA) && !isNaN(dB)) return dB - dA;
    if (!isNaN(dA)) return -1;
    if (!isNaN(dB)) return 1;
    return 0;
  });
};

export const LatestIntelPanel: React.FC<LatestIntelPanelProps> = ({
  open: controlledOpen,
  onClose: controlledOnClose,
  items: controlledItems
}) => {
  const { dir, language } = useLanguage();

  const [internalOpen, setInternalOpen] = useState(false);
  const [internalItems, setInternalItems] = useState<IntelItem[]>(() => {
    try {
      const saved = localStorage.getItem('cached_intel_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((it) => it.category?.toUpperCase() !== 'UPCOMING');
        }
      }
      const transformed = localStorage.getItem('cached_transformed_resources');
      if (transformed) {
        return extractIntelFromRawResources(JSON.parse(transformed));
      }
    } catch (e) {
      console.warn('Could not load cached intel items:', e);
    }
    return [];
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'NEW' | 'UPDATE'>('ALL');

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const activeLang: Language = (language as Language) || 'en';
  const isRtl = dir === 'rtl';

  // Helper translation getter
  const tr = useCallback((key: keyof typeof LOCALIZED): string => {
    return LOCALIZED[key]?.[activeLang] || LOCALIZED[key]?.en || '';
  }, [activeLang]);

  // Handle open / close custom events globally
  useEffect(() => {
    const handleOpen = () => {
      setInternalOpen(true);
      window.dispatchEvent(new Event('intel-opened'));
      const activeItems = controlledItems && controlledItems.length > 0 ? controlledItems : internalItems;
      if (activeItems.length > 0) {
        localStorage.setItem('last_seen_intel', String(new Date(activeItems[0].timestamp || Date.now()).getTime()));
      } else {
        localStorage.setItem('last_seen_intel', String(Date.now()));
      }
    };

    const handleClose = () => {
      setInternalOpen(false);
    };

    const handleItemsData = (e: any) => {
      if (e.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        // Ensure no upcoming items are admitted
        const filtered = e.detail.filter((it: any) => it.category?.toUpperCase() !== 'UPCOMING');
        setInternalItems(filtered);
      }
    };

    window.addEventListener('open-intel-panel', handleOpen);
    window.addEventListener('close-intel-panel', handleClose);
    window.addEventListener('intel-items-data', handleItemsData);

    return () => {
      window.removeEventListener('open-intel-panel', handleOpen);
      window.removeEventListener('close-intel-panel', handleClose);
      window.removeEventListener('intel-items-data', handleItemsData);
    };
  }, [controlledItems, internalItems]);

  // Escape key closes modal & lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Fallback background fetch if items are empty
  useEffect(() => {
    if (internalItems.length > 0) return;

    let isMounted = true;
    const fetchFallback = async () => {
      try {
        const res = await fetch(
          'https://script.google.com/macros/s/AKfycbzS2jQfIave1KcB0_JdlE7Akv0y5i2HzR2N_Cy3vrCTs5q7r-Uv8duxrlv7lZiAKA3eiw/exec'
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data) return;

        const extracted = extractIntelFromRawResources(data);
        if (extracted.length > 0) {
          setInternalItems(extracted);
          try {
            localStorage.setItem('cached_intel_items', JSON.stringify(extracted));
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Recent products background fetch note:', err);
      }
    };

    fetchFallback();
    return () => {
      isMounted = false;
    };
  }, [internalItems.length]);

  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalOpen(false);
    }
  };

  const allItems = useMemo(() => {
    const source = controlledItems && controlledItems.length > 0 ? controlledItems : internalItems;
    // Strictly filter out any upcoming products
    return source.filter((it) => it.category?.toUpperCase() !== 'UPCOMING');
  }, [controlledItems, internalItems]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: allItems.length };
    ['GAME', 'ARCHITECT', 'HYPERVISOR', 'STEAMTOOLS', 'EXTRA'].forEach((cat) => {
      counts[cat] = allItems.filter((item) => item.category?.toUpperCase() === cat).length;
    });
    return counts;
  }, [allItems]);

  // Filtered display items (by Category and Type)
  const displayItems = useMemo(() => {
    return allItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'ALL' && item.category?.toUpperCase() !== selectedCategory) {
        return false;
      }
      // Type filter
      if (selectedType !== 'ALL' && item.type !== selectedType) {
        return false;
      }
      return true;
    });
  }, [allItems, selectedCategory, selectedType]);

  // Localized description parser
  const getFormattedDescription = (item: IntelItem) => {
    const prefix = item.type === 'UPDATE' ? tr('updatePrefix') : tr('newPrefix');
    if (item.version) {
      return `${prefix} v${item.version}`;
    }
    return `${prefix} ${item.title}`;
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="recent-products-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[300] bg-black/60 dark:bg-black/75 backdrop-blur-md flex items-center justify-end p-0 sm:p-4"
          onClick={handleClose}
          dir={dir}
        >
          <motion.div
            key="recent-products-drawer"
            initial={{ x: isRtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className={`w-full sm:w-[480px] md:w-[500px] h-full sm:h-[90vh] sm:rounded-3xl border-0 sm:border border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-2xl flex flex-col shadow-2xl overflow-hidden ${
              isRtl ? 'font-arabic' : ''
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Section */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-sm shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Radar Pulse Beacon */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-2xl bg-primary-500/10 dark:bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-primary-500 dark:text-primary-400 shadow-sm">
                      <Icon name="Radar" size={22} className="text-primary-500 dark:text-primary-400 animate-pulse" />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0B1120]">
                      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight truncate">
                        {tr('title')}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 tracking-wide uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {tr('live')}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {tr('subtitle')}
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-slate-200/60 dark:bg-slate-800/70 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
                  aria-label="Close"
                >
                  <Icon name="X" size={18} />
                </button>
              </div>
            </div>

            {/* Smart Filters: Categories & Types */}
            <div className="px-4 py-3 bg-slate-100/70 dark:bg-slate-900/40 border-b border-slate-200/70 dark:border-slate-800/70 space-y-2.5 shrink-0">
              {/* Category Chips with Icons & Counts */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {['ALL', 'GAME', 'ARCHITECT', 'HYPERVISOR', 'STEAMTOOLS', 'EXTRA'].map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const label = CATEGORY_NAMES[cat]?.[activeLang] || cat;
                  const iconName = CATEGORY_ICONS[cat] || 'Folder';
                  const count = categoryCounts[cat] || 0;

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`h-7 px-2.5 rounded-lg text-[11px] font-bold tracking-tight transition-all whitespace-nowrap flex items-center gap-1.5 shadow-sm ${
                        isSelected
                          ? 'bg-primary-500 text-white shadow-primary-500/25 ring-2 ring-primary-500/30'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80'
                      }`}
                    >
                      <Icon name={iconName} size={13} className={isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-400'} />
                      <span>{label}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                          isSelected
                            ? 'bg-white/25 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Type Toggle: All / New / Updates */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800/90 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
                  <button
                    onClick={() => setSelectedType('ALL')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      selectedType === 'ALL'
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tr('allTypes')}
                  </button>
                  <button
                    onClick={() => setSelectedType('NEW')}
                    className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all ${
                      selectedType === 'NEW'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-emerald-500'
                    }`}
                  >
                    <Icon name="Sparkles" size={12} />
                    <span>{tr('newArrivals')}</span>
                  </button>
                  <button
                    onClick={() => setSelectedType('UPDATE')}
                    className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all ${
                      selectedType === 'UPDATE'
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-sky-500'
                    }`}
                  >
                    <Icon name="RefreshCw" size={12} />
                    <span>{tr('updates')}</span>
                  </button>
                </div>

                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  {displayItems.length} {tr('all')}
                </span>
              </div>
            </div>

            {/* Products Feed List */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 custom-scrollbar">
              {displayItems.map((item, idx) => {
                const isNew = item.type === 'NEW';
                const catKey = (item.category || '').toUpperCase();
                const catLabel = CATEGORY_NAMES[catKey]?.[activeLang] || item.category;
                const catIcon = CATEGORY_ICONS[catKey] || 'Folder';
                const relativeTime = formatRelativeTime(item.timestamp, activeLang);

                return (
                  <motion.div
                    key={item.id || `intel-item-${idx}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: Math.min(idx * 0.03, 0.3) }}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 relative overflow-hidden shadow-sm hover:border-primary-500/60 dark:hover:border-primary-500/60 hover:shadow-md transition-all group"
                  >
                    {/* Top Metadata Row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Type Badge */}
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider inline-flex items-center gap-1 ${
                            isNew
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                          }`}
                        >
                          <Icon name={isNew ? 'Sparkles' : 'RefreshCw'} size={11} />
                          {isNew ? tr('newBadge') : tr('updateBadge')}
                        </span>

                        {/* Category Chip */}
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-600/50 inline-flex items-center gap-1">
                          <Icon name={catIcon} size={11} className="text-slate-400" />
                          {catLabel}
                        </span>
                      </div>

                      {/* Relative Timestamp */}
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium inline-flex items-center gap-1 shrink-0">
                        <Icon name="Clock" size={12} className="opacity-70" />
                        <span>{relativeTime}</span>
                      </span>
                    </div>

                    {/* Title & Version */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-bold text-sm sm:text-[15px] text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                        {item.title}
                      </h3>
                      {item.version && item.category !== 'steamtools' && (
                        <span className="text-[10px] font-mono font-bold bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded border border-primary-500/20 shrink-0">
                          v{item.version}
                        </span>
                      )}
                    </div>

                    {/* Localized Changelog / Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {getFormattedDescription(item)}
                    </p>

                    {/* Date Subtext if present */}
                    {item.timestamp && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{item.timestamp.split('T')[0]}</span>
                        <span className="text-slate-400/80 capitalize">{catLabel}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Empty State */}
              {displayItems.length === 0 && (
                <div className="text-center py-12 px-4 text-slate-500 dark:text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Icon name="Folder" size={28} />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {tr('noProductsFound')}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    {tr('adjustFilter')}
                  </p>
                  {(selectedCategory !== 'ALL' || selectedType !== 'ALL') && (
                    <button
                      onClick={() => {
                        setSelectedCategory('ALL');
                        setSelectedType('ALL');
                      }}
                      className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-primary-500 text-white text-xs font-bold hover:bg-primary-600 transition-colors shadow-sm"
                    >
                      {tr('clearFilters')}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Clean Footer Section without NEXA 1337 network feed text */}
            <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/70 text-center shrink-0 flex items-center justify-center text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold">
                {displayItems.length} {tr('recordsVerified')}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default LatestIntelPanel;
