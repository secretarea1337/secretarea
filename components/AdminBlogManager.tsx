import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TbPlus,
  TbSearch,
  TbEdit,
  TbTrash,
  TbEye,
  TbCheck,
  TbAlertTriangle,
  TbX,
  TbArrowUp,
  TbArrowDown,
  TbCopy,
  TbSparkles,
  TbExternalLink,
  TbDeviceFloppy,
  TbSend,
  TbArrowLeft,
  TbPhoto,
  TbLayoutGrid,
  TbSlideshow,
  TbVideo,
  TbCode,
  TbClick,
  TbIcons,
  TbQuote,
  TbH1,
  TbH2,
  TbH3,
  TbH4,
  TbH5,
  TbH6,
  TbAlignLeft,
  TbLock,
  TbLockOpen,
  TbRefresh,
  TbTable,
  TbListCheck,
  TbHelp,
  TbLink,
  TbWorld,
  TbNews,
  TbCircleCheck,
  TbAlertCircle,
  TbArrowBackUp,
  TbArrowForwardUp,
  TbCalendarTime,
  TbClock,
  TbCloudCheck,
  TbCloudUpload,
  TbGripVertical,
  TbMaximize,
  TbMinimize,
  TbCheckbox,
  TbSeparatorHorizontal,
  TbChevronDown,
  TbChevronUp,
  TbChevronRight,
  TbCategory,
  TbStarFilled,
  TbShoppingCart,
  TbDeviceGamepad2,
  TbArrowsSort,
  TbSourceCode,
  TbWand,
  TbDownload,
  TbLayoutColumns,
  TbFileCode,
  TbBold,
  TbItalic,
  TbUnderline,
  TbStrikethrough,
  TbList,
  TbListNumbers,
} from 'react-icons/tb';
import { SiPlaystation, SiSteam, SiEpicgames, SiGogdotcom } from 'react-icons/si';
import { FaAmazon, FaXbox } from 'react-icons/fa';
import {
  BlogPost,
  BlogSection,
  BlogContentBlock,
  BlogBlockType,
  BlogLanguage,
  BlogStatus,
  BlogReviewBreakdown,
  BlogPlatformOffer,
  BlogStorePlatform,
  BlogModuleKey,
  HeadingLevel,
  createBlockId,
  getComparisonRowCells,
  resolveArticleFlowOrder,
  slugifyBlogTitle,
} from '../src/types/blog';
import {
  subscribeAllBlogPostsAdmin,
  saveBlogPost,
  deleteBlogPost,
  createEmptyBlogPost,
  createStarterSeoTemplate,
  saveLocalDraftBackup,
  loadLocalDraftBackup,
  clearLocalDraftBackup,
} from '../src/services/blogService';
import { analyzeBlogSeo, estimateReadingTime } from '../src/utils/blogSeoAnalyzer';
import { BlogArticleView } from './BlogArticleView';
import { RichTextBlockEditor } from './RichTextBlockEditor';
import {
  ScopedHtmlViewer,
  formatHtmlPretty,
  isHtmlContent,
  markdownToHtml,
  sanitizeRichHtml,
} from './BlogBlockRenderer';
import { useLanguage } from '../src/contexts/LanguageContext';
import Icon from './Icon';

const ICON_CHOICES = [
  'Gamepad2',
  'Download',
  'Rocket',
  'ShieldCheck',
  'Cpu',
  'Sparkles',
  'Zap',
  'Flame',
  'Star',
  'BookOpen',
  'Code',
  'Terminal',
  'Monitor',
  'Globe',
  'Play',
  'Heart',
  'Award',
  'Tools',
  'Link',
  'ExternalLink',
];

const CATEGORY_PRESETS = [
  'Gaming Guides',
  'PC Repacks',
  'Hardware & Specs',
  'Tools & Tutorials',
  'PS5 & Console',
  'Hypervisor',
  'News & Updates',
];

const SUBCATEGORY_PRESETS = [
  'PC Optimization',
  'Game Reviews',
  'Fix & Troubleshooting',
  'Multiplayer & Co-op',
  'GPU Benchmarks',
  'CPU & RAM',
  'Installation Guides',
  'Mods & Patches',
  'Emulator Guides',
  'Patch Notes',
];

type EditorTabId =
  | 'seo'
  | 'header'
  | 'quick_answer'
  | 'sections'
  | 'html_viewer'
  | 'extras'
  | 'reviews'
  | 'faqs'
  | 'conclusion'
  | 'sources'
  | 'translations';

const PLATFORM_PRESETS: Array<{
  platform: BlogStorePlatform;
  platformLabel: string;
  storeName: string;
  price: string;
}> = [
  { platform: 'playstation', platformLabel: 'PS5', storeName: 'PlayStation Store', price: '$69.99' },
  { platform: 'xbox', platformLabel: 'Xbox Series X|S', storeName: 'Xbox Store', price: '$69.99' },
  { platform: 'steam', platformLabel: 'Steam (PC)', storeName: 'Steam Store', price: '$59.99' },
  { platform: 'epic', platformLabel: 'Epic Games', storeName: 'Epic Games Store', price: '$59.99' },
  { platform: 'gog', platformLabel: 'GOG (DRM-Free)', storeName: 'GOG', price: '$59.99' },
  { platform: 'nintendo', platformLabel: 'Nintendo Switch', storeName: 'Nintendo eShop', price: '$59.99' },
  { platform: 'amazon', platformLabel: 'Physical / Key', storeName: 'Amazon', price: '$79.99' },
];

function renderAdminPlatformIcon(platform: BlogStorePlatform) {
  switch (platform) {
    case 'playstation':
      return <SiPlaystation size={16} />;
    case 'xbox':
      return <FaXbox size={15} />;
    case 'steam':
      return <SiSteam size={15} />;
    case 'epic':
      return <SiEpicgames size={15} />;
    case 'gog':
      return <SiGogdotcom size={15} />;
    case 'amazon':
      return <FaAmazon size={15} />;
    case 'nintendo':
      return <TbDeviceGamepad2 size={16} />;
    default:
      return <TbShoppingCart size={15} />;
  }
}

interface AdminBlogManagerProps {
  initialEditId?: string | null;
}

function toLocalDatetimeInputValue(isoOrDate?: string): string {
  const base = isoOrDate ? new Date(isoOrDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const d = Number.isNaN(base.getTime()) ? new Date(Date.now() + 24 * 60 * 60 * 1000) : base;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const AdminBlogManager: React.FC<AdminBlogManagerProps> = ({ initialEditId }) => {
  const { t, dir } = useLanguage();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BlogStatus>('all');

  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [slugLocked, setSlugLocked] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState<EditorTabId>('header');
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [translationLang, setTranslationLang] = useState<BlogLanguage>('fr');

  // Undo / Redo history stacks
  const [undoStack, setUndoStack] = useState<BlogPost[]>([]);
  const [redoStack, setRedoStack] = useState<BlogPost[]>([]);
  const lastHistoryPushRef = useRef<number>(0);

  // Auto-save & draft recovery
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaveState, setAutoSaveState] = useState<'idle' | 'local' | 'saving' | 'synced'>('idle');
  const [lastSavedLabel, setLastSavedLabel] = useState<string>('');
  const [recoverableDraft, setRecoverableDraft] = useState<{ savedAt: number; post: BlogPost } | null>(null);
  const isDirtyRef = useRef(false);
  const isRestoringHistoryRef = useRef(false);

  // Schedule picker
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState<string>(() => toLocalDatetimeInputValue());

  // Drag & Drop state (Sections + Blocks + Unified Article Flow)
  const [draggedSectionIdx, setDraggedSectionIdx] = useState<number | null>(null);
  const [dragOverSectionIdx, setDragOverSectionIdx] = useState<number | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<{ sIdx: number; bIdx: number } | null>(null);
  const [dragOverBlock, setDragOverBlock] = useState<{ sIdx: number; bIdx: number } | null>(null);
  const dragKindRef = useRef<'section' | 'block' | 'flow' | null>(null);
  const [showFlowOrganizer, setShowFlowOrganizer] = useState(true);
  const [draggedFlowIdx, setDraggedFlowIdx] = useState<number | null>(null);
  const [dragOverFlowIdx, setDragOverFlowIdx] = useState<number | null>(null);

  // Smart Section Heading Level & Collapse state
  const [defaultSectionLevel, setDefaultSectionLevel] = useState<HeadingLevel>(2);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Full Article HTML Viewer & Manual HTML + CSS state
  const [htmlViewerPaneMode, setHtmlViewerPaneMode] = useState<'split' | 'code' | 'viewer'>('split');
  const [htmlCodeSubTab, setHtmlCodeSubTab] = useState<'html' | 'css'>('html');
  const [htmlBlockViewMode, setHtmlBlockViewMode] = useState<Record<string, 'split' | 'code' | 'viewer'>>({});
  const [htmlBlockLangTab, setHtmlBlockLangTab] = useState<Record<string, 'html' | 'css'>>({});
  const [mobileSeoExpanded, setMobileSeoExpanded] = useState(false);
  const [htmlCopied, setHtmlCopied] = useState(false);
  const fullHtmlTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Comma-separated string helpers so typing keywords/tags feels fluid
  const [secondaryKwInput, setSecondaryKwInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    const unsub = subscribeAllBlogPostsAdmin(
      (list) => {
        setPosts(list);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (initialEditId && posts.length > 0 && !editingPost) {
      const target = posts.find((p) => p.id === initialEditId || p.slug === initialEditId);
      if (target) {
        openEditor(target);
      }
    }
  }, [initialEditId, posts]);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const openEditor = (post: BlogPost, lockSlug = true) => {
    const copy: BlogPost = JSON.parse(JSON.stringify(post));
    setEditingPost(copy);
    setSlugLocked(lockSlug && Boolean(copy.slug));
    setSecondaryKwInput((copy.secondaryKeywords || []).join(', '));
    setTagsInput((copy.tags || []).join(', '));
    setShowPreview(false);
    setShowSchedulePicker(false);
    setScheduleDateTime(toLocalDatetimeInputValue(copy.scheduledAt || undefined));
    setActiveEditorTab('header');
    setUndoStack([]);
    setRedoStack([]);
    isDirtyRef.current = false;
    setAutoSaveState('idle');
    setLastSavedLabel('');

    const backup = loadLocalDraftBackup(copy.id || 'new');
    const postUpdatedMs = copy.updatedAt ? new Date(copy.updatedAt).getTime() : 0;
    if (backup && backup.savedAt > postUpdatedMs + 3000) {
      setRecoverableDraft(backup);
    } else {
      setRecoverableDraft(null);
    }
  };

  const handleCreateNew = () => {
    openEditor(createEmptyBlogPost(), false);
  };

  const handleLoadTemplate = () => {
    openEditor(createStarterSeoTemplate(), false);
  };

  const handleDuplicate = (post: BlogPost) => {
    const copy: BlogPost = JSON.parse(JSON.stringify(post));
    copy.id = '';
    copy.status = 'draft';
    copy.scheduledAt = '';
    copy.scheduledAtMs = null;
    copy.title = `${copy.title} (Copy)`;
    copy.slug = slugifyBlogTitle(copy.title);
    copy.canonicalUrl = '';
    copy.views = 0;
    openEditor(copy, false);
  };

  const seoAnalysis = useMemo(() => {
    if (!editingPost) return null;
    return analyzeBlogSeo(editingPost);
  }, [editingPost]);

  const existingCategoryMeta = useMemo(() => {
    const iconByCat: Record<string, string> = {};
    const subsByCat: Record<string, Set<string>> = {};
    const allCats = new Set<string>(CATEGORY_PRESETS);

    posts.forEach((p) => {
      const cat = (p.category || '').trim();
      if (!cat) return;
      allCats.add(cat);
      const key = cat.toLowerCase();
      if (p.categoryIconUrl?.trim() && !iconByCat[key]) {
        iconByCat[key] = p.categoryIconUrl.trim();
      }
      if (p.subCategory?.trim()) {
        if (!subsByCat[key]) subsByCat[key] = new Set<string>();
        subsByCat[key].add(p.subCategory.trim());
      }
    });

    return {
      allCategories: Array.from(allCats),
      iconByCat,
      subsByCat,
      savedIcons: Object.entries(iconByCat).map(([key, url]) => ({
        category:
          Array.from(allCats).find((c) => c.toLowerCase() === key) || key,
        url,
      })),
    };
  }, [posts]);

  const pushHistorySnapshot = useCallback((snapshot: BlogPost, force = false) => {
    if (isRestoringHistoryRef.current) return;
    const now = Date.now();
    if (!force && now - lastHistoryPushRef.current < 650) {
      return;
    }
    lastHistoryPushRef.current = now;
    const cloned: BlogPost = JSON.parse(JSON.stringify(snapshot));
    setUndoStack((prev) => [...prev.slice(-39), cloned]);
    setRedoStack([]);
  }, []);

  const updateField = <K extends keyof BlogPost>(key: K, value: BlogPost[K], forceSnapshot = false) => {
    isDirtyRef.current = true;
    setEditingPost((prev) => {
      if (!prev) return prev;
      pushHistorySnapshot(prev, forceSnapshot);
      const next = { ...prev, [key]: value };
      if (key === 'title' && !slugLocked) {
        const autoSlug = slugifyBlogTitle(String(value || ''));
        next.slug = autoSlug;
        if (!prev.seoTitle || prev.seoTitle === prev.title) {
          next.seoTitle = String(value || '');
        }
        const origin =
          typeof window !== 'undefined' && window.location.origin
            ? window.location.origin.replace(/\/+$/, '')
            : 'https://secretarea.site';
        next.canonicalUrl = autoSlug ? `${origin}/blog/${autoSlug}` : '';
      }
      if (key === 'slug') {
        const clean = slugifyBlogTitle(String(value || ''), '');
        next.slug = clean;
        const origin =
          typeof window !== 'undefined' && window.location.origin
            ? window.location.origin.replace(/\/+$/, '')
            : 'https://secretarea.site';
        next.canonicalUrl = clean ? `${origin}/blog/${clean}` : '';
      }
      const { minutes } = estimateReadingTime(next);
      next.readingTimeMinutes = minutes;
      return next;
    });
  };

  const handleUndo = useCallback(() => {
    if (!editingPost || undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    isRestoringHistoryRef.current = true;
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev.slice(-39), JSON.parse(JSON.stringify(editingPost))]);
    setEditingPost(previous);
    setSecondaryKwInput((previous.secondaryKeywords || []).join(', '));
    setTagsInput((previous.tags || []).join(', '));
    isDirtyRef.current = true;
    requestAnimationFrame(() => {
      isRestoringHistoryRef.current = false;
    });
  }, [editingPost, undoStack]);

  const handleRedo = useCallback(() => {
    if (!editingPost || redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    isRestoringHistoryRef.current = true;
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev.slice(-39), JSON.parse(JSON.stringify(editingPost))]);
    setEditingPost(nextState);
    setSecondaryKwInput((nextState.secondaryKeywords || []).join(', '));
    setTagsInput((nextState.tags || []).join(', '));
    isDirtyRef.current = true;
    requestAnimationFrame(() => {
      isRestoringHistoryRef.current = false;
    });
  }, [editingPost, redoStack]);

  const handleSave = useCallback(async (
    targetStatus: BlogStatus,
    customScheduledIso?: string,
    silent = false
  ) => {
    if (!editingPost) return;
    if (!editingPost.title.trim()) {
      if (!silent) {
        showNotice(t('Please enter an H1 Main Title before saving.'), 'error');
        setActiveEditorTab('header');
      }
      return;
    }

    if (targetStatus === 'scheduled') {
      const chosenIso = customScheduledIso || (scheduleDateTime ? new Date(scheduleDateTime).toISOString() : '');
      if (!chosenIso || Number.isNaN(new Date(chosenIso).getTime())) {
        if (!silent) showNotice(t('Please choose a valid schedule date & time.'), 'error');
        return;
      }
    }

    if (silent) {
      setAutoSaveState('saving');
    } else {
      setSaving(true);
    }

    try {
      const previousKey = editingPost.id || 'new';
      const scheduledIso =
        targetStatus === 'scheduled'
          ? customScheduledIso || new Date(scheduleDateTime).toISOString()
          : '';

      const toSave: BlogPost = {
        ...editingPost,
        status: targetStatus,
        scheduledAt: scheduledIso,
        scheduledAtMs: scheduledIso ? Math.floor(new Date(scheduledIso).getTime()) : null,
        slug: editingPost.slug.trim() || slugifyBlogTitle(editingPost.title),
        seoTitle: editingPost.seoTitle.trim() || editingPost.title.trim(),
        secondaryKeywords: secondaryKwInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        tags: tagsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const saved = await saveBlogPost(toSave, posts);
      clearLocalDraftBackup(previousKey);
      clearLocalDraftBackup(saved.id);
      isDirtyRef.current = false;
      setRecoverableDraft(null);
      setEditingPost(saved);
      setSlugLocked(true);
      setShowSchedulePicker(false);
      setAutoSaveState('synced');
      setLastSavedLabel(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      if (!silent) {
        showNotice(
          targetStatus === 'published'
            ? t('Article published and live for indexing!')
            : targetStatus === 'scheduled'
            ? t('Article scheduled for automatic publishing!')
            : t('Draft saved successfully.'),
          'success'
        );
      }
    } catch (err: any) {
      if (silent) {
        setAutoSaveState('local');
      } else {
        let cleanMsg = err?.message || t('Failed to save article.');
        try {
          const parsed = JSON.parse(cleanMsg);
          if (parsed && typeof parsed.error === 'string') {
            cleanMsg = parsed.error;
          }
        } catch {
          // Not JSON, use original message
        }
        showNotice(cleanMsg, 'error');
      }
    } finally {
      if (!silent) setSaving(false);
    }
  }, [editingPost, scheduleDateTime, secondaryKwInput, tagsInput, posts, t]);

  // Automatic Local Backup + Cloud Draft Auto-Save
  useEffect(() => {
    if (!editingPost || !isDirtyRef.current) return;

    const draftKey = editingPost.id || 'new';
    const localTimer = setTimeout(() => {
      saveLocalDraftBackup(draftKey, editingPost);
      setAutoSaveState((prev) => (prev === 'saving' ? prev : 'local'));
      setLastSavedLabel(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 700);

    let cloudTimer: ReturnType<typeof setTimeout> | null = null;
    if (
      autoSaveEnabled &&
      editingPost.title.trim().length >= 3 &&
      editingPost.status === 'draft' &&
      !saving
    ) {
      cloudTimer = setTimeout(() => {
        handleSave('draft', undefined, true);
      }, 4500);
    }

    return () => {
      clearTimeout(localTimer);
      if (cloudTimer) clearTimeout(cloudTimer);
    };
  }, [editingPost, autoSaveEnabled, saving, handleSave]);

  // Keyboard shortcuts: Ctrl+S (Save), Ctrl+Z / Ctrl+Y (Undo/Redo when outside inputs)
  useEffect(() => {
    if (!editingPost) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        handleSave(editingPost.status || 'draft');
        return;
      }
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      const isTextField = tag === 'input' || tag === 'textarea';
      if (!isTextField && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((!isTextField && key === 'y') || (!isTextField && key === 'z' && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editingPost, handleSave, handleUndo, handleRedo]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const idToDelete = deleteTarget.id;
    setDeleteTarget(null);
    try {
      await deleteBlogPost(idToDelete);
      if (editingPost?.id === idToDelete) {
        setEditingPost(null);
      }
      showNotice(t('Article deleted.'), 'success');
    } catch (err: any) {
      showNotice(err?.message || t('Failed to delete article.'), 'error');
    }
  };

  // Flexible Article Layout Flow helpers (Sections + Comparison + Pros/Cons + Steps + Reviews + Stores + FAQ)
  const currentFlowOrder = useMemo(
    () => (editingPost ? resolveArticleFlowOrder(editingPost) : []),
    [editingPost]
  );

  const commitFlowOrder = (nextOrder: string[]) => {
    isDirtyRef.current = true;
    setEditingPost((prev) => {
      if (!prev) return prev;
      pushHistorySnapshot(prev, true);
      const secMap = new Map((prev.sections || []).map((s) => [`sec:${s.id}`, s]));
      const reorderedSections: BlogSection[] = [];
      nextOrder.forEach((tok) => {
        if (tok.startsWith('sec:')) {
          const found = secMap.get(tok);
          if (found) reorderedSections.push(found);
        }
      });
      // Append any orphan sections defensively
      (prev.sections || []).forEach((s) => {
        if (!reorderedSections.some((rs) => rs.id === s.id)) {
          reorderedSections.push(s);
        }
      });
      const updated = {
        ...prev,
        sections: reorderedSections,
        contentOrder: nextOrder,
      };
      const { minutes } = estimateReadingTime(updated);
      updated.readingTimeMinutes = minutes;
      return updated;
    });
  };

  const moveFlowToken = (token: string, delta: -1 | 1) => {
    if (!editingPost) return;
    const next = [...resolveArticleFlowOrder(editingPost)];
    const idx = next.indexOf(token);
    if (idx === -1) return;
    const target = idx + delta;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    commitFlowOrder(next);
  };

  const reorderFlowDrop = (fromIdx: number, toIdx: number) => {
    if (!editingPost || fromIdx === toIdx) return;
    const next = [...resolveArticleFlowOrder(editingPost)];
    if (fromIdx < 0 || fromIdx >= next.length || toIdx < 0 || toIdx >= next.length) return;
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    commitFlowOrder(next);
  };

  const placeModuleAtAnchor = (moduleKey: BlogModuleKey, anchor: string) => {
    if (!editingPost) return;
    const modTok = `mod:${moduleKey}`;
    const base = resolveArticleFlowOrder(editingPost).filter((t) => t !== modTok);
    if (anchor === 'before_all') {
      base.unshift(modTok);
    } else if (anchor === 'after_all') {
      base.push(modTok);
    } else if (anchor.startsWith('after_sec:')) {
      const secTok = `sec:${anchor.slice('after_sec:'.length)}`;
      const secIdx = base.indexOf(secTok);
      if (secIdx !== -1) {
        base.splice(secIdx + 1, 0, modTok);
      } else {
        base.push(modTok);
      }
    } else {
      base.push(modTok);
    }
    commitFlowOrder(base);
  };

  const getModulePlacementInfo = (moduleKey: BlogModuleKey) => {
    const order = currentFlowOrder;
    const modTok = `mod:${moduleKey}`;
    const modIdx = order.indexOf(modTok);

    let anchorValue = 'after_all';
    if (modIdx === 0) {
      anchorValue = 'before_all';
    } else if (modIdx > 0) {
      let lastSecTok: string | null = null;
      let hasLaterSection = false;
      for (let i = 0; i < modIdx; i++) {
        if (order[i].startsWith('sec:')) lastSecTok = order[i];
      }
      for (let i = modIdx + 1; i < order.length; i++) {
        if (order[i].startsWith('sec:')) {
          hasLaterSection = true;
          break;
        }
      }
      if (!lastSecTok) {
        anchorValue = 'before_all';
      } else if (!hasLaterSection) {
        anchorValue = 'after_all';
      } else {
        anchorValue = `after_sec:${lastSecTok.slice(4)}`;
      }
    }

    return {
      positionIndex: modIdx,
      totalItems: order.length,
      anchorValue,
    };
  };

  const renderModulePlacementBar = (moduleKey: BlogModuleKey) => {
    if (!editingPost) return null;
    const { positionIndex, totalItems, anchorValue } = getModulePlacementInfo(moduleKey);
    const sections = editingPost.sections || [];

    return (
      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0d121e] flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-mono font-extrabold tabular-nums">
            #{positionIndex >= 0 ? positionIndex + 1 : totalItems}
          </span>
          <span className="font-bold text-slate-700 dark:text-slate-200">
            {t('Article Placement')}:
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <select
            aria-label={t('Place Position Inside Article')}
            value={anchorValue}
            onChange={(e) => placeModuleAtAnchor(moduleKey, e.target.value)}
            className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#29aaea] cursor-pointer max-w-[240px]"
          >
            <option value="before_all">{t('Before Section 1 (Top)')}</option>
            {sections.map((sec, idx) => (
              <option key={sec.id} value={`after_sec:${sec.id}`}>
                {t('After Section')} {idx + 1}
                {sec.heading?.trim() ? `: ${sec.heading.slice(0, 26)}` : ''}
              </option>
            ))}
            <option value="after_all">{t('After All Sections (Bottom)')}</option>
          </select>

          <button
            type="button"
            disabled={positionIndex <= 0}
            onClick={() => moveFlowToken(`mod:${moduleKey}`, -1)}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#29aaea] disabled:opacity-40 cursor-pointer"
            title={t('Move Up in Article Flow')}
          >
            <TbArrowUp size={14} />
          </button>
          <button
            type="button"
            disabled={positionIndex === -1 || positionIndex >= totalItems - 1}
            onClick={() => moveFlowToken(`mod:${moduleKey}`, 1)}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#29aaea] disabled:opacity-40 cursor-pointer"
            title={t('Move Down in Article Flow')}
          >
            <TbArrowDown size={14} />
          </button>
        </div>
      </div>
    );
  };

  // Section & Block mutation helpers
  const addSection = (level: HeadingLevel = defaultSectionLevel, insertAfterIdx?: number) => {
    if (!editingPost) return;
    const newSec: BlogSection = {
      id: createBlockId('sec'),
      heading: '',
      headingLevel: level,
      blocks: [{ id: createBlockId('blk'), type: 'paragraph', content: '' }],
    };
    const next = [...(editingPost.sections || [])];
    const flow = [...resolveArticleFlowOrder(editingPost)];
    const newTok = `sec:${newSec.id}`;

    if (typeof insertAfterIdx === 'number' && insertAfterIdx >= 0 && insertAfterIdx < next.length) {
      const prevSec = next[insertAfterIdx];
      next.splice(insertAfterIdx + 1, 0, newSec);
      const prevFlowIdx = flow.indexOf(`sec:${prevSec.id}`);
      if (prevFlowIdx !== -1) {
        flow.splice(prevFlowIdx + 1, 0, newTok);
      } else {
        flow.push(newTok);
      }
    } else {
      const lastExistingSec = next[next.length - 1];
      next.push(newSec);
      if (lastExistingSec) {
        const lastIdx = flow.indexOf(`sec:${lastExistingSec.id}`);
        if (lastIdx !== -1) flow.splice(lastIdx + 1, 0, newTok);
        else flow.push(newTok);
      } else {
        flow.unshift(newTok);
      }
    }
    isDirtyRef.current = true;
    setEditingPost((prev) => {
      if (!prev) return prev;
      pushHistorySnapshot(prev, true);
      const updated = { ...prev, sections: next, contentOrder: flow };
      const { minutes } = estimateReadingTime(updated);
      updated.readingTimeMinutes = minutes;
      return updated;
    });
  };

  const updateSectionHeading = (secIdx: number, heading: string) => {
    if (!editingPost) return;
    const next = [...(editingPost.sections || [])];
    next[secIdx] = { ...next[secIdx], heading };
    updateField('sections', next);
  };

  const updateSectionHeadingLevel = (secIdx: number, headingLevel: HeadingLevel) => {
    if (!editingPost) return;
    const next = [...(editingPost.sections || [])];
    next[secIdx] = { ...next[secIdx], headingLevel };
    updateField('sections', next, true);
  };

  const moveSection = (secIdx: number, delta: -1 | 1) => {
    if (!editingPost) return;
    const next = [...(editingPost.sections || [])];
    const target = secIdx + delta;
    if (target < 0 || target >= next.length) return;
    const tokA = `sec:${next[secIdx].id}`;
    const tokB = `sec:${next[target].id}`;
    [next[secIdx], next[target]] = [next[target], next[secIdx]];
    const flow = [...resolveArticleFlowOrder(editingPost)];
    const iA = flow.indexOf(tokA);
    const iB = flow.indexOf(tokB);
    if (iA !== -1 && iB !== -1) {
      [flow[iA], flow[iB]] = [flow[iB], flow[iA]];
    }
    isDirtyRef.current = true;
    setEditingPost((prev) => {
      if (!prev) return prev;
      pushHistorySnapshot(prev, true);
      return { ...prev, sections: next, contentOrder: flow };
    });
  };

  const reorderSectionDrop = (fromIdx: number, toIdx: number) => {
    if (!editingPost || fromIdx === toIdx) return;
    const next = [...(editingPost.sections || [])];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    // Rebuild section token order while keeping module positions between sections intact
    const flow = [...resolveArticleFlowOrder(editingPost)];
    const secPositions: number[] = [];
    flow.forEach((tok, i) => {
      if (tok.startsWith('sec:')) secPositions.push(i);
    });
    next.forEach((sec, idx) => {
      if (idx < secPositions.length) {
        flow[secPositions[idx]] = `sec:${sec.id}`;
      }
    });
    isDirtyRef.current = true;
    setEditingPost((prev) => {
      if (!prev) return prev;
      pushHistorySnapshot(prev, true);
      return { ...prev, sections: next, contentOrder: flow };
    });
  };

  const removeSection = (secIdx: number) => {
    if (!editingPost) return;
    const targetSec = (editingPost.sections || [])[secIdx];
    const next = (editingPost.sections || []).filter((_, i) => i !== secIdx);
    const flow = targetSec
      ? resolveArticleFlowOrder(editingPost).filter((t) => t !== `sec:${targetSec.id}`)
      : resolveArticleFlowOrder(editingPost);
    isDirtyRef.current = true;
    setEditingPost((prev) => {
      if (!prev) return prev;
      pushHistorySnapshot(prev, true);
      const updated = { ...prev, sections: next, contentOrder: flow };
      const { minutes } = estimateReadingTime(updated);
      updated.readingTimeMinutes = minutes;
      return updated;
    });
  };

  const createNewBlock = (type: BlogBlockType): BlogContentBlock => {
    const id = createBlockId('blk');
    switch (type) {
      case 'subheading':
        return { id, type: 'subheading', level: 3, text: '' };
      case 'paragraph':
        return { id, type: 'paragraph', content: '', align: 'left' };
      case 'html':
        return {
          id,
          type: 'html',
          title: '',
          html: '<div class="sa-custom-card">\n  <h3>Custom HTML + CSS Section</h3>\n  <p>Edit <strong>HTML</strong> or switch to the <strong>CSS</strong> tab to style this block.</p>\n</div>',
          css: '.sa-custom-card {\n  padding: 16px 20px;\n  border-radius: 14px;\n  border: 1px solid rgba(41, 170, 234, 0.35);\n  background: rgba(41, 170, 234, 0.08);\n}',
        };
      case 'image':
        return { id, type: 'image', url: '', alt: '', caption: '' };
      case 'multi_image':
        return {
          id,
          type: 'multi_image',
          columns: 2,
          images: [
            { url: '', alt: '', caption: '' },
            { url: '', alt: '', caption: '' },
          ],
        };
      case 'slider':
        return {
          id,
          type: 'slider',
          title: 'Media Slideshow',
          slides: [
            { url: '', alt: '', caption: '' },
            { url: '', alt: '', caption: '' },
          ],
        };
      case 'video':
        return { id, type: 'video', url: '', title: '', caption: '' };
      case 'code':
        return { id, type: 'code', language: 'bash', filename: '', code: '' };
      case 'button':
        return {
          id,
          type: 'button',
          label: 'Explore Now',
          url: '/game',
          variant: 'gradient',
          icon: 'Gamepad2',
          openInNewTab: false,
        };
      case 'icon_box':
        return {
          id,
          type: 'icon_box',
          icon: 'Sparkles',
          title: '',
          description: '',
          accent: 'sky',
        };
      case 'callout':
        return { id, type: 'callout', tone: 'tip', title: 'Pro Tip', content: '' };
      case 'checklist':
        return { id, type: 'checklist', title: 'Key Takeaways', items: [''] };
      case 'divider':
        return { id, type: 'divider', style: 'glow' };
    }
  };

  const addBlockToSection = (secIdx: number, type: BlogBlockType) => {
    if (!editingPost) return;
    const next = [...(editingPost.sections || [])];
    next[secIdx] = {
      ...next[secIdx],
      blocks: [...(next[secIdx].blocks || []), createNewBlock(type)],
    };
    updateField('sections', next, true);
  };

  const updateBlock = (secIdx: number, blkIdx: number, updated: BlogContentBlock) => {
    if (!editingPost) return;
    const next = [...(editingPost.sections || [])];
    const blocks = [...(next[secIdx].blocks || [])];
    blocks[blkIdx] = updated;
    next[secIdx] = { ...next[secIdx], blocks };
    updateField('sections', next);
  };

  const duplicateBlock = (secIdx: number, blkIdx: number) => {
    if (!editingPost) return;
    const next = [...(editingPost.sections || [])];
    const blocks = [...(next[secIdx].blocks || [])];
    const clone: BlogContentBlock = {
      ...JSON.parse(JSON.stringify(blocks[blkIdx])),
      id: createBlockId('blk'),
    };
    blocks.splice(blkIdx + 1, 0, clone);
    next[secIdx] = { ...next[secIdx], blocks };
    updateField('sections', next, true);
  };

  const moveBlock = (secIdx: number, blkIdx: number, delta: -1 | 1) => {
    if (!editingPost) return;
    const next = [...(editingPost.sections || [])];
    const blocks = [...(next[secIdx].blocks || [])];
    const target = blkIdx + delta;
    if (target < 0 || target >= blocks.length) return;
    [blocks[blkIdx], blocks[target]] = [blocks[target], blocks[blkIdx]];
    next[secIdx] = { ...next[secIdx], blocks };
    updateField('sections', next, true);
  };

  const reorderBlockDrop = (
    from: { sIdx: number; bIdx: number },
    to: { sIdx: number; bIdx: number }
  ) => {
    if (!editingPost) return;
    if (from.sIdx === to.sIdx && from.bIdx === to.bIdx) return;
    const next = (editingPost.sections || []).map((s) => ({
      ...s,
      blocks: [...(s.blocks || [])],
    }));
    const sourceBlocks = next[from.sIdx]?.blocks;
    const targetBlocks = next[to.sIdx]?.blocks;
    if (!sourceBlocks || !targetBlocks) return;
    const [moved] = sourceBlocks.splice(from.bIdx, 1);
    if (!moved) return;
    const clampedIndex = Math.max(0, Math.min(to.bIdx, targetBlocks.length));
    targetBlocks.splice(clampedIndex, 0, moved);
    updateField('sections', next, true);
  };

  const removeBlock = (secIdx: number, blkIdx: number) => {
    if (!editingPost) return;
    const next = [...(editingPost.sections || [])];
    const blocks = (next[secIdx].blocks || []).filter((_, i) => i !== blkIdx);
    next[secIdx] = { ...next[secIdx], blocks };
    updateField('sections', next, true);
  };

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (q) {
        return (
          (p.title || '').toLowerCase().includes(q) ||
          (p.slug || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.focusKeyword || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [posts, searchQuery, statusFilter]);

  const inputClass =
    'w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#29aaea] transition-all';
  const labelClass = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5';

  // ==================== LIST VIEW ====================
  if (!editingPost) {
    return (
      <div dir={dir} className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="p-2 rounded-xl bg-[#29aaea]/15 text-[#29aaea]">
                <TbNews size={20} />
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {t('Blog Studio & SEO Manager')}
              </h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 tabular-nums">
                {posts.length} {t('Articles')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('Write SEO-structured articles with live SEO progress tracking, rich media blocks, unique title URLs, and automatic sitemap indexing.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
            >
              <TbExternalLink size={15} />
              <span>{t('View Public Blog')}</span>
            </Link>
            <button
              type="button"
              onClick={handleLoadTemplate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 text-xs font-bold transition-colors cursor-pointer"
            >
              <TbSparkles size={15} />
              <span>{t('Load SEO Template')}</span>
            </button>
            <button
              type="button"
              onClick={handleCreateNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#29aaea] to-indigo-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 hover:brightness-110 transition-all cursor-pointer"
            >
              <TbPlus size={16} />
              <span>{t('New Article')}</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <TbCheck size={16} /> : <TbAlertTriangle size={16} />}
              <span>{feedback.text}</span>
            </div>
            <button type="button" onClick={() => setFeedback(null)} className="cursor-pointer">
              <TbX size={15} />
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <TbSearch size={17} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search by title, slug, keyword, or category...')}
              className={inputClass + ' ps-10'}
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 shrink-0 overflow-x-auto no-scrollbar">
            {(['all', 'published', 'scheduled', 'draft'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#29aaea] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t(st === 'all' ? 'All' : st === 'published' ? 'Published' : st === 'scheduled' ? 'Scheduled' : 'Drafts')}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Table / List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 p-10 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {t('No blog articles yet. Start from scratch or load the 15-section SEO Blueprint Template.')}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleLoadTemplate}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                {t('Load SEO Template')}
              </button>
              <button
                type="button"
                onClick={handleCreateNew}
                className="px-4 py-2 rounded-xl bg-[#29aaea] text-white text-xs font-bold cursor-pointer"
              >
                {t('Write Blank Article')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post) => {
              const analysis = analyzeBlogSeo(post);
              const scoreColor =
                analysis.score >= 85
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : analysis.score >= 60
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30'
                  : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30';

              return (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 hover:border-[#29aaea]/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={post.featuredImage || '/images/hero01.png'}
                      alt={post.featuredImageAlt || post.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/hero01.png';
                      }}
                      className="w-20 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            post.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : post.status === 'scheduled'
                              ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {post.status === 'published'
                            ? t('Published')
                            : post.status === 'scheduled'
                            ? `${t('Scheduled')}${post.scheduledAt ? ` · ${new Date(post.scheduledAt).toLocaleDateString()}` : ''}`
                            : t('Draft')}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#29aaea]">
                          {post.categoryIconUrl && (
                            <img
                              src={post.categoryIconUrl}
                              alt=""
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                              className="w-3.5 h-3.5 rounded object-cover shrink-0"
                            />
                          )}
                          <span>{post.category}</span>
                          {post.subCategory && (
                            <>
                              <TbChevronRight size={11} className={`opacity-60 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                              <span className="text-indigo-500 dark:text-indigo-400">{post.subCategory}</span>
                            </>
                          )}
                        </span>
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border tabular-nums ${scoreColor}`}>
                          SEO {analysis.score}%
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                        {post.title || t('Untitled Article')}
                      </h3>
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate" dir="ltr">
                        /blog/{post.slug}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap lg:justify-end shrink-0">
                    {post.status === 'published' && (
                      <Link
                        to={`/blog/${encodeURIComponent(post.slug)}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#29aaea]/15 text-slate-700 dark:text-slate-200 hover:text-[#29aaea] text-xs font-bold transition-colors"
                      >
                        <TbEye size={14} />
                        <span>{t('View')}</span>
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => openEditor(post)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#29aaea]/10 hover:bg-[#29aaea]/20 text-[#29aaea] text-xs font-bold transition-colors cursor-pointer"
                    >
                      <TbEdit size={14} />
                      <span>{t('Edit')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(post)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                      title={t('Duplicate')}
                    >
                      <TbCopy size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(post)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-colors cursor-pointer"
                      title={t('Delete')}
                    >
                      <TbTrash size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full rounded-2xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-500">
                <TbAlertTriangle size={24} />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {t('Delete Article?')}
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t('Are you sure you want to permanently delete')} <strong>"{deleteTarget.title}"</strong>?
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                >
                  {t('Delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==================== EDITOR + LIVE SEO PROGRESS VIEW ====================
  const score = seoAnalysis?.score ?? 0;
  const ringCircumference = 2 * Math.PI * 36;
  const ringDashOffset = ringCircumference * (1 - score / 100);
  const ringStrokeColor =
    score >= 85 ? '#10b981' : score >= 60 ? '#0ea5e9' : score >= 40 ? '#f59e0b' : '#f43f5e';

  const EDITOR_TABS: Array<{ id: EditorTabId; label: string }> = [
    { id: 'header', label: t('Header & Author') },
    { id: 'seo', label: t('SEO Metadata') },
    { id: 'quick_answer', label: t('Quick Answer & TOC') },
    { id: 'sections', label: t('Sections & Rich Blocks') },
    { id: 'html_viewer', label: t('HTML Viewer & Manual') },
    { id: 'extras', label: t('Table, Pros/Cons & Steps') },
    { id: 'reviews', label: t('Reviews & Stores') },
    { id: 'faqs', label: t('FAQ Section') },
    { id: 'conclusion', label: t('Conclusion') },
    { id: 'sources', label: t('Sources & Related') },
    { id: 'translations', label: t('Multi-Language') },
  ];

  const compilePostSectionsToHtml = (post: BlogPost): string => {
    const parts: string[] = [];
    (post.sections || []).forEach((sec) => {
      const lvl = sec.headingLevel ?? 2;
      if (sec.heading?.trim()) {
        parts.push(`<h${lvl}>${sec.heading.trim()}</h${lvl}>`);
      }
      (sec.blocks || []).forEach((blk) => {
        if (blk.type === 'subheading' && blk.text?.trim()) {
          const sl = blk.level ?? 3;
          parts.push(`<h${sl}>${blk.text.trim()}</h${sl}>`);
        } else if (blk.type === 'paragraph' && blk.content?.trim()) {
          parts.push(isHtmlContent(blk.content) ? blk.content : markdownToHtml(blk.content));
        } else if (blk.type === 'html' && blk.html?.trim()) {
          parts.push(blk.html);
        } else if (blk.type === 'image' && blk.url?.trim()) {
          parts.push(
            `<figure><img src="${blk.url}" alt="${blk.alt || ''}" referrerpolicy="no-referrer" />${
              blk.caption ? `<figcaption>${blk.caption}</figcaption>` : ''
            }</figure>`
          );
        } else if (blk.type === 'callout' && blk.content?.trim()) {
          parts.push(
            `<blockquote>${blk.title ? `<strong>${blk.title}:</strong> ` : ''}${blk.content}</blockquote>`
          );
        } else if (blk.type === 'checklist' && (blk.items || []).some(Boolean)) {
          const lis = (blk.items || [])
            .filter(Boolean)
            .map((it) => `  <li>${it}</li>`)
            .join('\n');
          parts.push(
            `${blk.title ? `<h4>${blk.title}</h4>\n` : ''}<ul>\n${lis}\n</ul>`
          );
        } else if (blk.type === 'code' && blk.code?.trim()) {
          const escaped = blk.code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          parts.push(`<pre><code>${escaped}</code></pre>`);
        } else if (blk.type === 'divider') {
          parts.push('<hr />');
        }
      });
    });
    return formatHtmlPretty(parts.join('\n'));
  };

  const wrapFullHtmlSelection = (before: string, after: string, fallback = 'text') => {
    if (!editingPost) return;
    const el = fullHtmlTextareaRef.current;
    const current = editingPost.customHtml || '';
    if (!el) {
      updateField('customHtml', `${current}${before}${fallback}${after}`);
      return;
    }
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const selected = current.slice(start, end);
    const replacement = selected ? `${before}${selected}${after}` : `${before}${fallback}${after}`;
    const next = current.slice(0, start) + replacement + current.slice(end);
    updateField('customHtml', next);
    requestAnimationFrame(() => {
      if (!fullHtmlTextareaRef.current) return;
      fullHtmlTextareaRef.current.focus();
      const s = start + before.length;
      fullHtmlTextareaRef.current.setSelectionRange(s, s + (selected || fallback).length);
    });
  };

  const convertManualHtmlToSections = () => {
    if (!editingPost || !editingPost.customHtml?.trim()) return;
    try {
      const clean = sanitizeRichHtml(editingPost.customHtml);
      const doc = new DOMParser().parseFromString(`<div>${clean}</div>`, 'text/html');
      const root = doc.body.firstElementChild;
      if (!root) return;

      const builtSections: BlogSection[] = [];
      let currentSec: BlogSection | null = null;
      let htmlBuffer: string[] = [];

      const flushBuffer = () => {
        const joined = htmlBuffer.join('\n').trim();
        htmlBuffer = [];
        if (!joined) return;
        if (!currentSec) {
          currentSec = {
            id: createBlockId('sec'),
            heading: editingPost.title || 'Overview',
            headingLevel: 2,
            blocks: [],
          };
          builtSections.push(currentSec);
        }
        currentSec.blocks.push({
          id: createBlockId('blk'),
          type: 'paragraph',
          content: joined,
          align: 'left',
        });
      };

      Array.from(root.childNodes).forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && /^H[1-2]$/i.test((node as Element).tagName)) {
          flushBuffer();
          const el = node as Element;
          const lvl = (Number(el.tagName.slice(1)) === 1 ? 1 : 2) as HeadingLevel;
          currentSec = {
            id: createBlockId('sec'),
            heading: (el.textContent || '').trim(),
            headingLevel: lvl,
            blocks: [],
          };
          builtSections.push(currentSec);
        } else {
          const wrapper = document.createElement('div');
          wrapper.appendChild(node.cloneNode(true));
          if (wrapper.innerHTML.trim()) {
            htmlBuffer.push(wrapper.innerHTML);
          }
        }
      });
      flushBuffer();

      if (builtSections.length > 0) {
        const nextFlow = [
          ...builtSections.map((s) => `sec:${s.id}`),
          ...resolveArticleFlowOrder(editingPost).filter((tok) => tok.startsWith('mod:')),
        ];
        setEditingPost((prev) =>
          prev
            ? {
                ...prev,
                sections: builtSections,
                contentOrder: nextFlow,
                useCustomHtml: false,
              }
            : prev
        );
        setActiveEditorTab('sections');
        showNotice(t('Converted manual HTML into structured sections!'), 'success');
      }
    } catch {
      showNotice(t('Could not parse HTML into sections.'), 'error');
    }
  };

  return (
    <div
      dir={dir}
      className={
        isFullscreen
          ? 'fixed inset-0 z-[90] overflow-y-auto bg-gray-50 dark:bg-slate-950 p-4 sm:p-6 space-y-6'
          : 'space-y-6'
      }
    >
      {/* Sticky Top Action Bar */}
      <div className="sticky top-2 z-30 p-3 sm:p-4 lg:p-5 rounded-2xl bg-white/95 dark:bg-[#111623]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                setIsFullscreen(false);
                setEditingPost(null);
              }}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer"
              title={t('Back to Articles')}
            >
              <TbArrowLeft size={18} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate max-w-[340px] sm:max-w-md">
                  {editingPost.title || t('New SEO Article')}
                </h2>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border shrink-0 ${
                    editingPost.status === 'published'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : editingPost.status === 'scheduled'
                      ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}
                >
                  {editingPost.status === 'published'
                    ? t('Published')
                    : editingPost.status === 'scheduled'
                    ? t('Scheduled')
                    : t('Draft')}
                </span>
                {/* Auto-Save Status Indicator */}
                <button
                  type="button"
                  onClick={() => setAutoSaveEnabled((v) => !v)}
                  title={t('Toggle Cloud Auto-Save')}
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer ${
                    autoSaveState === 'saving'
                      ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                      : autoSaveState === 'synced'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {autoSaveState === 'saving' ? (
                    <TbCloudUpload size={12} className="animate-pulse" />
                  ) : (
                    <TbCloudCheck size={12} />
                  )}
                  <span>
                    {autoSaveState === 'saving'
                      ? t('Auto-saving...')
                      : autoSaveState === 'synced'
                      ? `${t('Auto-saved')} · ${lastSavedLabel}`
                      : autoSaveState === 'local'
                      ? `${t('Saved locally')} · ${lastSavedLabel}`
                      : autoSaveEnabled
                      ? t('Auto-Save On')
                      : t('Auto-Save Off')}
                  </span>
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5" dir="ltr">
                <span className="truncate">/blog/{editingPost.slug || 'auto-from-title'}</span>
                {seoAnalysis && (
                  <span className="text-[11px] font-sans text-slate-400 shrink-0 tabular-nums">
                    · {seoAnalysis.wordCount} {t('Words')} · ~{seoAnalysis.estimatedReadingMinutes} min
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Undo / Redo */}
            <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5">
              <button
                type="button"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                title="Undo (Ctrl+Z)"
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-35 cursor-pointer"
              >
                <TbArrowBackUp size={16} />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                title="Redo (Ctrl+Y)"
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-35 cursor-pointer"
              >
                <TbArrowForwardUp size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen((f) => !f)}
              title={isFullscreen ? t('Exit Fullscreen') : t('Fullscreen Mode')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              {isFullscreen ? <TbMinimize size={16} /> : <TbMaximize size={16} />}
            </button>

            <button
              type="button"
              onClick={() => setShowPreview((p) => !p)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                showPreview
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#29aaea]'
              }`}
            >
              <TbEye size={15} />
              <span>{showPreview ? t('Back to Editor') : t('Live Preview')}</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold disabled:opacity-50 cursor-pointer"
            >
              <TbDeviceFloppy size={15} />
              <span>{t('Save Draft')}</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => setShowSchedulePicker((s) => !s)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                showSchedulePicker || editingPost.status === 'scheduled'
                  ? 'bg-violet-600/15 text-violet-600 dark:text-violet-400 border-violet-500/40'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-violet-500'
              }`}
            >
              <TbCalendarTime size={15} />
              <span>{t('Schedule')}</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('published')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#29aaea] to-indigo-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 hover:brightness-110 disabled:opacity-50 cursor-pointer"
            >
              <TbSend size={15} />
              <span>{editingPost.status === 'published' ? t('Update Published') : t('Publish Article')}</span>
            </button>
          </div>
        </div>

        {/* Inline Schedule Date/Time Bar */}
        {showSchedulePicker && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <TbClock size={16} className="text-violet-500" />
              <span className="font-bold">{t('Schedule Automatic Publish Date & Time')}:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="datetime-local"
                value={scheduleDateTime}
                onChange={(e) => setScheduleDateTime(e.target.value)}
                className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
              />
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave('scheduled', new Date(scheduleDateTime).toISOString())}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                <TbCheck size={14} />
                <span>{t('Confirm Schedule')}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSchedulePicker(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <TbX size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recoverable Local Auto-Save Draft Banner */}
      {recoverableDraft && (
        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold">
            <TbClock size={16} />
            <span>
              {t('Unsaved local auto-save found from')}{' '}
              {new Date(recoverableDraft.savedAt).toLocaleString()}.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingPost(recoverableDraft.post);
                setSecondaryKwInput((recoverableDraft.post.secondaryKeywords || []).join(', '));
                setTagsInput((recoverableDraft.post.tags || []).join(', '));
                setRecoverableDraft(null);
                showNotice(t('Recovered local auto-saved draft.'), 'success');
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold cursor-pointer"
            >
              {t('Restore Draft')}
            </button>
            <button
              type="button"
              onClick={() => {
                clearLocalDraftBackup(editingPost.id || 'new');
                setRecoverableDraft(null);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
            >
              {t('Dismiss')}
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <TbCheck size={16} /> : <TbAlertTriangle size={16} />}
            <span>{feedback.text}</span>
          </div>
          <button type="button" onClick={() => setFeedback(null)} className="cursor-pointer">
            <TbX size={15} />
          </button>
        </div>
      )}

      {showPreview ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 overflow-hidden">
          <BlogArticleView post={editingPost} allPosts={posts} isPreview />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
          {/* LEFT EDITOR WORKSPACE */}
          <div className="space-y-4 sm:space-y-5 min-w-0">
            {/* Compact Mobile / Tablet Live SEO Score Banner */}
            {seoAnalysis && (
              <div className="xl:hidden rounded-2xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setMobileSeoExpanded((v) => !v)}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-start cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs text-white shrink-0 tabular-nums"
                      style={{ backgroundColor: ringStrokeColor }}
                    >
                      {seoAnalysis.score}%
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {t('Live SEO Progress')} · {t(seoAnalysis.grade)}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums truncate">
                        {seoAnalysis.wordCount} {t('Words')} · H2/H3: {seoAnalysis.h2Count}/{seoAnalysis.h3Count} · Alt: {seoAnalysis.imagesWithAltCount}/{seoAnalysis.imageCount}
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#29aaea] shrink-0">
                    <span className="hidden sm:inline">{mobileSeoExpanded ? t('Hide') : t('SEO Checklist')}</span>
                    {mobileSeoExpanded ? <TbChevronUp size={16} /> : <TbChevronDown size={16} />}
                  </span>
                </button>
                {mobileSeoExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {seoAnalysis.checks.map((chk) => (
                      <button
                        key={chk.id}
                        type="button"
                        onClick={() => {
                          if (chk.targetSection && EDITOR_TABS.some((et) => et.id === chk.targetSection)) {
                            setActiveEditorTab(chk.targetSection as EditorTabId);
                            setMobileSeoExpanded(false);
                          }
                        }}
                        className="text-start p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2 cursor-pointer"
                      >
                        <span className="mt-0.5 shrink-0">
                          {chk.status === 'pass' ? (
                            <TbCircleCheck size={14} className="text-emerald-500" />
                          ) : chk.status === 'warn' ? (
                            <TbAlertCircle size={14} className="text-amber-500" />
                          ) : (
                            <TbAlertTriangle size={14} className="text-rose-500" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                            {chk.label} ({chk.points}/{chk.maxPoints})
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {chk.hint}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sub-Navigation Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 rounded-2xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800">
              {EDITOR_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveEditorTab(tab.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeEditorTab === tab.id
                      ? 'bg-[#29aaea] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Editor Card */}
            <div className="rounded-2xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-6">
              {/* TAB: HEADER & AUTHOR */}
              {activeEditorTab === 'header' && (
                <div className="space-y-5">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {t('2. Article Header & Author Information')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className={labelClass}>{t('H1 – Main Title')} *</label>
                      <input
                        type="text"
                        value={editingPost.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        placeholder="e.g. Best Free PC Games in 2027: 15 Titles Worth Playing"
                        className={inputClass}
                      />
                    </div>

                    {/* Category Hierarchy: Main Category, Sub-Category & Custom Icon URL */}
                    <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0d121e] p-4 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        <TbCategory size={16} className="text-[#29aaea]" />
                        <span>{t('Category Hierarchy & Icon')}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>{t('Main Category')}</label>
                          <input
                            type="text"
                            list="blog-category-presets"
                            value={editingPost.category}
                            onChange={(e) => {
                              const nextCat = e.target.value;
                              const prevDefaultIcon =
                                existingCategoryMeta.iconByCat[(editingPost.category || '').trim().toLowerCase()] || '';
                              const nextDefaultIcon =
                                existingCategoryMeta.iconByCat[nextCat.trim().toLowerCase()] || '';
                              isDirtyRef.current = true;
                              setEditingPost((prev) => {
                                if (!prev) return prev;
                                pushHistorySnapshot(prev, false);
                                const shouldSwapIcon =
                                  !prev.categoryIconUrl?.trim() ||
                                  prev.categoryIconUrl.trim() === prevDefaultIcon;
                                return {
                                  ...prev,
                                  category: nextCat,
                                  categoryIconUrl:
                                    shouldSwapIcon && nextDefaultIcon
                                      ? nextDefaultIcon
                                      : prev.categoryIconUrl || '',
                                };
                              });
                            }}
                            placeholder="Gaming Guides"
                            className={inputClass}
                          />
                          <datalist id="blog-category-presets">
                            {existingCategoryMeta.allCategories.map((c) => (
                              <option key={c} value={c} />
                            ))}
                          </datalist>
                        </div>

                        <div>
                          <label className={labelClass}>{t('Sub-Category')} ({t('Optional')})</label>
                          <input
                            type="text"
                            list="blog-subcategory-presets"
                            value={editingPost.subCategory || ''}
                            onChange={(e) => updateField('subCategory', e.target.value)}
                            placeholder="e.g. PC Optimization, GPU Benchmarks"
                            className={inputClass}
                          />
                          <datalist id="blog-subcategory-presets">
                            {Array.from(
                              new Set([
                                ...Array.from(
                                  existingCategoryMeta.subsByCat[(editingPost.category || '').trim().toLowerCase()] || []
                                ),
                                ...SUBCATEGORY_PRESETS,
                              ])
                            ).map((sub) => (
                              <option key={sub} value={sub} />
                            ))}
                          </datalist>
                        </div>

                        <div className="md:col-span-2">
                          <label className={labelClass}>{t('Category Icon URL')} ({t('Optional')})</label>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                              {editingPost.categoryIconUrl?.trim() ? (
                                <img
                                  src={editingPost.categoryIconUrl.trim()}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                  }}
                                  className="w-6 h-6 object-contain"
                                />
                              ) : (
                                <TbCategory size={18} className="text-[#29aaea]" />
                              )}
                            </div>
                            <input
                              type="text"
                              value={editingPost.categoryIconUrl || ''}
                              onChange={(e) => updateField('categoryIconUrl', e.target.value)}
                              placeholder="https://... or /images/icons/gaming.png"
                              className={inputClass}
                            />
                            {editingPost.categoryIconUrl?.trim() && (
                              <button
                                type="button"
                                onClick={() => updateField('categoryIconUrl', '')}
                                className="p-2.5 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                                title={t('Clear')}
                              >
                                <TbX size={15} />
                              </button>
                            )}
                          </div>
                          <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                            {t('Displayed inside the Blog Menu bar, Mega Menu, Dropdowns, and article badges.')}
                          </p>
                          {existingCategoryMeta.savedIcons.length > 0 && (
                            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {t('Reuse existing icon')}:
                              </span>
                              {existingCategoryMeta.savedIcons.slice(0, 8).map((item) => (
                                <button
                                  key={item.category}
                                  type="button"
                                  onClick={() => updateField('categoryIconUrl', item.url)}
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#29aaea] text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                                >
                                  <img
                                    src={item.url}
                                    alt=""
                                    referrerPolicy="no-referrer"
                                    className="w-3.5 h-3.5 object-contain rounded-sm"
                                  />
                                  <span>{item.category}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>{t('Primary Language')}</label>
                      <select
                        value={editingPost.language}
                        onChange={(e) => updateField('language', e.target.value as BlogLanguage)}
                        className={inputClass}
                      >
                        <option value="en">English (EN)</option>
                        <option value="fr">Français (FR)</option>
                        <option value="es">Español (ES)</option>
                        <option value="ar">العربية (AR)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelClass}>{t('Short Introduction')}</label>
                      <textarea
                        rows={3}
                        value={editingPost.introduction}
                        onChange={(e) => updateField('introduction', e.target.value)}
                        placeholder="Write a clear 1–2 sentence hook introducing the topic..."
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>{t('Featured Image URL')}</label>
                      <input
                        type="text"
                        value={editingPost.featuredImage}
                        onChange={(e) => updateField('featuredImage', e.target.value)}
                        placeholder="https://... or /images/hero01.png"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>{t('Featured Image Alt Text (SEO)')}</label>
                      <input
                        type="text"
                        value={editingPost.featuredImageAlt}
                        onChange={(e) => updateField('featuredImageAlt', e.target.value)}
                        placeholder="Descriptive alt attribute for Google Images & accessibility"
                        className={inputClass}
                      />
                    </div>

                    {editingPost.featuredImage?.trim() && (
                      <div className="md:col-span-2">
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 max-h-48 flex items-center justify-center">
                          <img
                            src={editingPost.featuredImage}
                            alt={editingPost.featuredImageAlt || editingPost.title || 'Featured preview'}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/hero01.png';
                            }}
                            className="w-full h-44 object-cover"
                          />
                        </div>
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <label className={labelClass}>{t('Tags (comma separated)')}</label>
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => {
                          setTagsInput(e.target.value);
                          updateField(
                            'tags',
                            e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean)
                          );
                        }}
                        placeholder="Gaming, Free Games, PC, 2027, Guides"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('Author Name')}</label>
                      <input
                        type="text"
                        value={editingPost.authorName}
                        onChange={(e) => updateField('authorName', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('Author Role')}</label>
                      <input
                        type="text"
                        value={editingPost.authorRole}
                        onChange={(e) => updateField('authorRole', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('Author Avatar URL')}</label>
                      <input
                        type="text"
                        value={editingPost.authorAvatar}
                        onChange={(e) => updateField('authorAvatar', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('Published Date (ISO)')}</label>
                      <input
                        type="date"
                        value={(editingPost.publishedAt || '').slice(0, 10)}
                        onChange={(e) =>
                          updateField(
                            'publishedAt',
                            e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString()
                          )
                        }
                        className={inputClass}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>{t('Author Bio (E-E-A-T)')}</label>
                      <textarea
                        rows={2}
                        value={editingPost.authorBio}
                        onChange={(e) => updateField('authorBio', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SEO METADATA */}
              {activeEditorTab === 'seo' && (
                <div className="space-y-5">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {t('1. SEO Metadata & Indexable URL')}
                  </h3>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t('SEO Title')}
                      </label>
                      <span
                        className={`text-[11px] font-mono tabular-nums ${
                          editingPost.seoTitle.length >= 30 && editingPost.seoTitle.length <= 65
                            ? 'text-emerald-500'
                            : 'text-amber-500'
                        }`}
                      >
                        {editingPost.seoTitle.length} / 60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={editingPost.seoTitle}
                      onChange={(e) => updateField('seoTitle', e.target.value)}
                      placeholder="Target 30–65 characters with Focus Keyword"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t('Meta Description')}
                      </label>
                      <span
                        className={`text-[11px] font-mono tabular-nums ${
                          editingPost.metaDescription.length >= 120 && editingPost.metaDescription.length <= 165
                            ? 'text-emerald-500'
                            : 'text-amber-500'
                        }`}
                      >
                        {editingPost.metaDescription.length} / 160 chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={editingPost.metaDescription}
                      onChange={(e) => updateField('metaDescription', e.target.value)}
                      placeholder="Write a 120–160 character summary for Google Search snippets..."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t('URL Slug (Unique URL from Title)')}
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const regenerated = slugifyBlogTitle(editingPost.title);
                            updateField('slug', regenerated);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#29aaea] hover:underline cursor-pointer"
                        >
                          <TbRefresh size={13} />
                          <span>{t('Sync from Title')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSlugLocked((l) => !l)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {slugLocked ? <TbLock size={13} /> : <TbLockOpen size={13} />}
                          <span>{slugLocked ? t('Locked') : t('Auto')}</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden" dir="ltr">
                      <span className="px-3 text-xs font-mono text-slate-400 border-e border-slate-200 dark:border-slate-800 py-2.5">
                        /blog/
                      </span>
                      <input
                        type="text"
                        value={editingPost.slug}
                        onChange={(e) => {
                          setSlugLocked(true);
                          updateField('slug', e.target.value);
                        }}
                        placeholder="best-free-pc-games-2027"
                        className="flex-1 bg-transparent px-3 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('Focus Keyword')}</label>
                      <input
                        type="text"
                        value={editingPost.focusKeyword}
                        onChange={(e) => updateField('focusKeyword', e.target.value)}
                        placeholder="e.g. best free pc games"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('Secondary Keywords (comma separated)')}</label>
                      <input
                        type="text"
                        value={secondaryKwInput}
                        onChange={(e) => {
                          setSecondaryKwInput(e.target.value);
                          updateField(
                            'secondaryKeywords',
                            e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean)
                          );
                        }}
                        placeholder="free pc games 2027, verified repacks"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('Canonical URL')}</label>
                      <input
                        type="text"
                        value={editingPost.canonicalUrl}
                        onChange={(e) => updateField('canonicalUrl', e.target.value)}
                        placeholder="https://secretarea.site/blog/..."
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('OG / Twitter Image Override (Optional)')}</label>
                      <input
                        type="text"
                        value={editingPost.ogImage || ''}
                        onChange={(e) => updateField('ogImage', e.target.value)}
                        placeholder="Defaults to Featured Image"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: QUICK ANSWER & TOC */}
              {activeEditorTab === 'quick_answer' && (
                <div className="space-y-5">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {t('3. Quick Answer & 4. Table of Contents')}
                  </h3>

                  <div>
                    <label className={labelClass}>{t('Quick Answer Heading')}</label>
                    <input
                      type="text"
                      value={editingPost.quickAnswerTitle || 'Quick Answer'}
                      onChange={(e) => updateField('quickAnswerTitle', e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>{t('Quick Answer Summary (AI Search & Snippet Box)')}</label>
                    <RichTextBlockEditor
                      value={editingPost.quickAnswer}
                      onChange={(val) => updateField('quickAnswer', val)}
                      placeholder="Give a direct, concise 40–60 word answer summarizing the key takeaway..."
                      minRows={4}
                    />
                  </div>

                  <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPost.showToc !== false}
                      onChange={(e) => updateField('showToc', e.target.checked)}
                      className="w-4 h-4 accent-[#29aaea]"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {t('Enable Automatic Table of Contents')}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {t('Automatically indexes all H2 sections, H3 subheadings, comparison tables, steps, and FAQs.')}
                      </div>
                    </div>
                  </label>
                </div>
              )}

              {/* TAB: SECTIONS & RICH BLOCK BUILDER */}
              {activeEditorTab === 'sections' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {t('5. Main Article Sections & Rich Block Builder')}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('Choose H1–H6 manually per section, collapse long sections, insert sections inline, or drag & drop to reorder.')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {(editingPost.sections || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const allCollapsed = (editingPost.sections || []).every(
                              (s) => collapsedSections[s.id]
                            );
                            if (allCollapsed) {
                              setCollapsedSections({});
                            } else {
                              const map: Record<string, boolean> = {};
                              (editingPost.sections || []).forEach((s) => {
                                map[s.id] = true;
                              });
                              setCollapsedSections(map);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          {(editingPost.sections || []).every((s) => collapsedSections[s.id]) ? (
                            <>
                              <TbChevronDown size={14} />
                              <span>{t('Expand All')}</span>
                            </>
                          ) : (
                            <>
                              <TbChevronUp size={14} />
                              <span>{t('Collapse All')}</span>
                            </>
                          )}
                        </button>
                      )}

                      <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5">
                        {([1, 2, 3, 4, 5, 6] as HeadingLevel[]).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setDefaultSectionLevel(lvl)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-mono font-black transition-colors cursor-pointer ${
                              defaultSectionLevel === lvl
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            H{lvl}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addSection(defaultSectionLevel)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#29aaea] hover:brightness-110 text-white text-xs font-bold cursor-pointer shadow-sm"
                      >
                        <TbPlus size={15} />
                        <span>{t('Add Section')} (H{defaultSectionLevel})</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Drag & Drop Unified Article Layout & Module Flow Organizer */}
                  <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-500/30 bg-indigo-50/40 dark:bg-[#0d121e] p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <TbArrowsSort size={17} className="text-[#29aaea]" />
                        <div>
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                            {t('Article Flow & Section Placement (Drag & Drop)')}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {t('Drag any Main Section, Comparison Table, Pros & Cons, Steps, Reviews, Where to Buy, or FAQ to place it anywhere inside your article.')}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowFlowOrganizer((v) => !v)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        {showFlowOrganizer ? t('Hide') : t('Show')} ({currentFlowOrder.length})
                      </button>
                    </div>

                    {showFlowOrganizer && (
                      <div className="space-y-1.5 pt-1">
                        {currentFlowOrder.map((token, fIdx) => {
                          let label = '';
                          let badge = '';
                          let isActive = true;
                          let jumpTab: EditorTabId | null = null;

                          if (token.startsWith('sec:')) {
                            const sIdx = (editingPost.sections || []).findIndex((s) => `sec:${s.id}` === token);
                            const sec = sIdx !== -1 ? editingPost.sections[sIdx] : null;
                            if (!sec) return null;
                            badge = `H${sec.headingLevel ?? 2}`;
                            label = sec.heading?.trim() || `${t('Section')} ${sIdx + 1}`;
                          } else if (token === 'mod:comparison') {
                            badge = 'TABLE';
                            label = editingPost.comparisonTable?.title || t('Comparison Table');
                            isActive = Boolean(editingPost.comparisonTable?.enabled);
                            jumpTab = 'extras';
                          } else if (token === 'mod:pros_cons') {
                            badge = 'PROS/CONS';
                            label = editingPost.prosCons?.title || t('Pros & Cons');
                            isActive = Boolean(editingPost.prosCons?.enabled);
                            jumpTab = 'extras';
                          } else if (token === 'mod:steps') {
                            badge = 'STEPS';
                            label = editingPost.stepByStep?.title || t('Step-by-Step Guide');
                            isActive = Boolean(editingPost.stepByStep?.enabled);
                            jumpTab = 'extras';
                          } else if (token === 'mod:reviews') {
                            badge = 'REVIEWS';
                            label = editingPost.metacriticReviews?.title || t('Reviews & Scores');
                            isActive = Boolean(editingPost.metacriticReviews?.enabled);
                            jumpTab = 'reviews';
                          } else if (token === 'mod:where_to_buy') {
                            badge = 'STORES';
                            label = editingPost.whereToBuy?.title || t('Where to Buy');
                            isActive = Boolean(editingPost.whereToBuy?.enabled);
                            jumpTab = 'reviews';
                          } else if (token === 'mod:faq') {
                            badge = 'FAQ';
                            label = t('FAQ Section');
                            isActive = (editingPost.faqs || []).some((f) => f.question?.trim() && f.answer?.trim());
                            jumpTab = 'faqs';
                          }

                          const isFlowDragOver =
                            dragKindRef.current === 'flow' &&
                            dragOverFlowIdx === fIdx &&
                            draggedFlowIdx !== fIdx;

                          return (
                            <div
                              key={token}
                              draggable
                              onDragStart={(e) => {
                                dragKindRef.current = 'flow';
                                setDraggedFlowIdx(fIdx);
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onDragOver={(e) => {
                                if (dragKindRef.current === 'flow') {
                                  e.preventDefault();
                                  setDragOverFlowIdx(fIdx);
                                }
                              }}
                              onDrop={(e) => {
                                if (dragKindRef.current === 'flow' && draggedFlowIdx !== null) {
                                  e.preventDefault();
                                  reorderFlowDrop(draggedFlowIdx, fIdx);
                                  setDraggedFlowIdx(null);
                                  setDragOverFlowIdx(null);
                                  dragKindRef.current = null;
                                }
                              }}
                              onDragEnd={() => {
                                setDraggedFlowIdx(null);
                                setDragOverFlowIdx(null);
                                dragKindRef.current = null;
                              }}
                              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs transition-all ${
                                isFlowDragOver
                                  ? 'border-[#29aaea] ring-2 ring-[#29aaea]/30 bg-sky-50 dark:bg-sky-950/30'
                                  : isActive
                                  ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111623]'
                                  : 'border-dashed border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 opacity-65'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-slate-400 hover:text-[#29aaea] cursor-grab active:cursor-grabbing shrink-0">
                                  <TbGripVertical size={15} />
                                </span>
                                <span className="text-[10px] font-mono font-bold text-slate-400 tabular-nums shrink-0">
                                  #{fIdx + 1}
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-black shrink-0 ${
                                    token.startsWith('sec:')
                                      ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                                      : 'bg-sky-500/15 text-[#29aaea]'
                                  }`}
                                >
                                  {badge}
                                </span>
                                <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                                  {label}
                                </span>
                                {!isActive && (
                                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                                    ({t('Off')})
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {jumpTab && (
                                  <button
                                    type="button"
                                    onClick={() => setActiveEditorTab(jumpTab!)}
                                    className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:text-[#29aaea] text-[10px] font-bold cursor-pointer"
                                  >
                                    {t('Edit')}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  disabled={fIdx === 0}
                                  onClick={() => moveFlowToken(token, -1)}
                                  className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                                  title={t('Move Up')}
                                >
                                  <TbArrowUp size={13} />
                                </button>
                                <button
                                  type="button"
                                  disabled={fIdx === currentFlowOrder.length - 1}
                                  onClick={() => moveFlowToken(token, 1)}
                                  className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                                  title={t('Move Down')}
                                >
                                  <TbArrowDown size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-5">
                    {(editingPost.sections || []).map((section, sIdx) => {
                      const isSectionDragOver =
                        dragKindRef.current === 'section' &&
                        dragOverSectionIdx === sIdx &&
                        draggedSectionIdx !== sIdx;
                      const secLevel: HeadingLevel = section.headingLevel ?? 2;
                      const isCollapsed = !!collapsedSections[section.id];
                      return (
                      <div
                        key={section.id}
                        onDragOver={(e) => {
                          if (dragKindRef.current === 'section') {
                            e.preventDefault();
                            setDragOverSectionIdx(sIdx);
                          }
                        }}
                        onDrop={(e) => {
                          if (dragKindRef.current === 'section' && draggedSectionIdx !== null) {
                            e.preventDefault();
                            reorderSectionDrop(draggedSectionIdx, sIdx);
                            setDraggedSectionIdx(null);
                            setDragOverSectionIdx(null);
                            dragKindRef.current = null;
                          }
                        }}
                        className={`rounded-2xl border bg-slate-50/70 dark:bg-[#0d121e] p-4 sm:p-5 space-y-4 transition-all ${
                          isSectionDragOver
                            ? 'border-[#29aaea] ring-2 ring-[#29aaea]/30'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div
                          draggable
                          onDragStart={(e) => {
                            if (dragKindRef.current === 'block') return;
                            dragKindRef.current = 'section';
                            setDraggedSectionIdx(sIdx);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragEnd={() => {
                            setDraggedSectionIdx(null);
                            setDragOverSectionIdx(null);
                            dragKindRef.current = null;
                          }}
                          className="flex flex-wrap sm:flex-nowrap items-center gap-2"
                        >
                          <span
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#29aaea] hover:bg-white dark:hover:bg-slate-800 cursor-grab active:cursor-grabbing shrink-0"
                            title={t('Drag section to reorder')}
                          >
                            <TbGripVertical size={17} />
                          </span>

                          {/* Manual H1-H6 Heading Selector */}
                          <select
                            aria-label="Section Heading Level"
                            value={secLevel}
                            onChange={(e) =>
                              updateSectionHeadingLevel(sIdx, Number(e.target.value) as HeadingLevel)
                            }
                            className="h-9 px-2 rounded-lg bg-indigo-600 text-white text-xs font-mono font-black shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#29aaea]"
                          >
                            {([1, 2, 3, 4, 5, 6] as HeadingLevel[]).map((lvl) => (
                              <option key={lvl} value={lvl} className="bg-slate-900 text-white">
                                H{lvl}
                              </option>
                            ))}
                          </select>

                          <input
                            type="text"
                            value={section.heading}
                            onChange={(e) => updateSectionHeading(sIdx, e.target.value)}
                            placeholder={`Section ${sIdx + 1} Heading (H${secLevel})...`}
                            className={inputClass + ' font-bold min-w-[160px]'}
                          />

                          <div className="flex items-center gap-1.5 shrink-0 ms-auto">
                            <button
                              type="button"
                              onClick={() => addSection(secLevel, sIdx)}
                              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-[#29aaea]/10 hover:bg-[#29aaea]/20 text-[#29aaea] text-[11px] font-bold cursor-pointer"
                              title={t('Add Section Below')}
                            >
                              <TbPlus size={14} />
                              <span className="hidden md:inline">{t('Below')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setCollapsedSections((prev) => ({
                                  ...prev,
                                  [section.id]: !prev[section.id],
                                }))
                              }
                              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                              title={isCollapsed ? t('Expand') : t('Collapse')}
                            >
                              {isCollapsed ? <TbChevronDown size={15} /> : <TbChevronUp size={15} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSection(sIdx, -1)}
                              disabled={sIdx === 0}
                              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                              title={t('Move Up')}
                            >
                              <TbArrowUp size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSection(sIdx, 1)}
                              disabled={sIdx === (editingPost.sections || []).length - 1}
                              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                              title={t('Move Down')}
                            >
                              <TbArrowDown size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSection(sIdx)}
                              className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer"
                              title={t('Delete Section')}
                            >
                              <TbTrash size={15} />
                            </button>
                          </div>
                        </div>

                        {isCollapsed ? (
                          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                            <span>
                              {(section.blocks || []).length} {t('blocks inside')}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setCollapsedSections((prev) => ({ ...prev, [section.id]: false }))
                              }
                              className="font-bold text-[#29aaea] hover:underline cursor-pointer"
                            >
                              {t('Expand Section')}
                            </button>
                          </div>
                        ) : (
                        <>
                        {/* Blocks inside Section */}
                        <div
                          className="space-y-3 min-h-[24px]"
                          onDragOver={(e) => {
                            if (dragKindRef.current === 'block' && (section.blocks || []).length === 0) {
                              e.preventDefault();
                              setDragOverBlock({ sIdx, bIdx: 0 });
                            }
                          }}
                          onDrop={(e) => {
                            if (dragKindRef.current === 'block' && draggedBlock && (section.blocks || []).length === 0) {
                              e.preventDefault();
                              e.stopPropagation();
                              reorderBlockDrop(draggedBlock, { sIdx, bIdx: 0 });
                              setDraggedBlock(null);
                              setDragOverBlock(null);
                              dragKindRef.current = null;
                            }
                          }}
                        >
                          {(section.blocks || []).length === 0 && (
                            <div className="py-5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                              {t('Drop a block here or choose one below to insert.')}
                            </div>
                          )}

                          {(section.blocks || []).map((block, bIdx) => {
                            const isBlockTarget =
                              dragKindRef.current === 'block' &&
                              dragOverBlock?.sIdx === sIdx &&
                              dragOverBlock?.bIdx === bIdx &&
                              !(draggedBlock?.sIdx === sIdx && draggedBlock?.bIdx === bIdx);
                            return (
                            <div
                              key={block.id}
                              draggable
                              onDragStart={(e) => {
                                e.stopPropagation();
                                dragKindRef.current = 'block';
                                setDraggedBlock({ sIdx, bIdx });
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onDragOver={(e) => {
                                if (dragKindRef.current === 'block') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDragOverBlock({ sIdx, bIdx });
                                }
                              }}
                              onDrop={(e) => {
                                if (dragKindRef.current === 'block' && draggedBlock) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  reorderBlockDrop(draggedBlock, { sIdx, bIdx });
                                  setDraggedBlock(null);
                                  setDragOverBlock(null);
                                  dragKindRef.current = null;
                                }
                              }}
                              onDragEnd={() => {
                                setDraggedBlock(null);
                                setDragOverBlock(null);
                                dragKindRef.current = null;
                              }}
                              className={`rounded-xl bg-white dark:bg-[#111623] border p-4 space-y-3 transition-all ${
                                isBlockTarget
                                  ? 'border-[#29aaea] ring-2 ring-[#29aaea]/30'
                                  : 'border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="p-1 rounded-md text-slate-400 hover:text-[#29aaea] cursor-grab active:cursor-grabbing"
                                    title={t('Drag block to reorder')}
                                  >
                                    <TbGripVertical size={15} />
                                  </span>
                                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#29aaea]">
                                    {block.type === 'subheading'
                                      ? `Heading H${block.level ?? 3}`
                                      : block.type === 'paragraph'
                                      ? 'Rich Text / Compose & HTML'
                                      : block.type === 'html'
                                      ? 'HTML Viewer / Custom HTML'
                                      : block.type.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => duplicateBlock(sIdx, bIdx)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#29aaea] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                    title={t('Duplicate Block')}
                                  >
                                    <TbCopy size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveBlock(sIdx, bIdx, -1)}
                                    disabled={bIdx === 0}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                                  >
                                    <TbArrowUp size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveBlock(sIdx, bIdx, 1)}
                                    disabled={bIdx === (section.blocks || []).length - 1}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                                  >
                                    <TbArrowDown size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeBlock(sIdx, bIdx)}
                                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                  >
                                    <TbTrash size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* Block-specific Editors */}
                              {block.type === 'subheading' && (
                                <div className="space-y-2.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {([1, 2, 3, 4, 5, 6] as HeadingLevel[]).map((lvl) => {
                                      const activeLvl = (block.level ?? 3) === lvl;
                                      const HeadIcon = [TbH1, TbH2, TbH3, TbH4, TbH5, TbH6][lvl - 1];
                                      return (
                                        <button
                                          key={lvl}
                                          type="button"
                                          onClick={() => updateBlock(sIdx, bIdx, { ...block, level: lvl })}
                                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold border transition-colors cursor-pointer ${
                                            activeLvl
                                              ? 'bg-[#29aaea] text-white border-[#29aaea]'
                                              : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#29aaea]'
                                          }`}
                                        >
                                          <HeadIcon size={14} />
                                          <span>H{lvl}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                  <input
                                    type="text"
                                    value={block.text}
                                    onChange={(e) => updateBlock(sIdx, bIdx, { ...block, text: e.target.value })}
                                    placeholder={`H${block.level ?? 3} Heading text...`}
                                    className={inputClass + ' font-bold'}
                                  />
                                </div>
                              )}

                              {block.type === 'paragraph' && (
                                <RichTextBlockEditor
                                  value={block.content}
                                  align={block.align || 'left'}
                                  onAlignChange={(align) => updateBlock(sIdx, bIdx, { ...block, align })}
                                  onChange={(content) => updateBlock(sIdx, bIdx, { ...block, content })}
                                />
                              )}

                              {block.type === 'html' && (() => {
                                const pane = htmlBlockViewMode[block.id] || 'split';
                                const langTab = htmlBlockLangTab[block.id] || 'html';
                                return (
                                  <div className="space-y-2.5">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <input
                                        type="text"
                                        value={block.title || ''}
                                        onChange={(e) =>
                                          updateBlock(sIdx, bIdx, { ...block, title: e.target.value })
                                        }
                                        placeholder="Optional HTML block label..."
                                        className={`${inputClass} sm:max-w-xs`}
                                      />
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        {/* Responsive Split / Code / Viewer Toggle */}
                                        <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                          {(
                                            [
                                              ['split', t('Split')],
                                              ['code', t('Code')],
                                              ['viewer', t('Viewer')],
                                            ] as const
                                          ).map(([modeKey, modeLabel]) => (
                                            <button
                                              key={modeKey}
                                              type="button"
                                              onClick={() =>
                                                setHtmlBlockViewMode((prev) => ({
                                                  ...prev,
                                                  [block.id]: modeKey,
                                                }))
                                              }
                                              className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                                                pane === modeKey
                                                  ? 'bg-[#29aaea] text-white'
                                                  : 'text-slate-600 dark:text-slate-300'
                                              }`}
                                            >
                                              {modeLabel}
                                            </button>
                                          ))}
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateBlock(sIdx, bIdx, {
                                              ...block,
                                              html: formatHtmlPretty(block.html || ''),
                                            })
                                          }
                                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-[#29aaea] text-xs font-bold cursor-pointer"
                                        >
                                          <TbWand size={13} />
                                          <span>{t('Format HTML')}</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateBlock(sIdx, bIdx, {
                                              ...block,
                                              html: `${
                                                block.html ? `${block.html}\n` : ''
                                              }<div class="sa-feature-box">\n  <h4>Featured Highlight</h4>\n  <p>Custom styled HTML &amp; CSS box inside your article.</p>\n</div>`,
                                              css: `${
                                                block.css ? `${block.css}\n\n` : ''
                                              }.sa-feature-box {\n  padding: 16px 20px;\n  border-radius: 14px;\n  border: 1px solid rgba(41, 170, 234, 0.35);\n  background: linear-gradient(135deg, rgba(41, 170, 234, 0.12), rgba(99, 102, 241, 0.1));\n}\n.sa-feature-box h4 { margin: 0 0 6px; font-weight: 800; color: #29aaea; }\n.sa-feature-box p { margin: 0; }`,
                                            })
                                          }
                                          className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold cursor-pointer"
                                        >
                                          + {t('Card Snippet')}
                                        </button>
                                      </div>
                                    </div>

                                    <div
                                      className={`grid rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 ${
                                        pane === 'split'
                                          ? 'grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800'
                                          : 'grid-cols-1'
                                      }`}
                                    >
                                      {(pane === 'split' || pane === 'code') && (
                                        <div className="flex flex-col bg-slate-950">
                                          <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
                                            <div className="inline-flex items-center gap-1">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setHtmlBlockLangTab((prev) => ({ ...prev, [block.id]: 'html' }))
                                                }
                                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase cursor-pointer ${
                                                  langTab === 'html'
                                                    ? 'bg-[#29aaea] text-white'
                                                    : 'text-slate-400 hover:text-white'
                                                }`}
                                              >
                                                HTML
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setHtmlBlockLangTab((prev) => ({ ...prev, [block.id]: 'css' }))
                                                }
                                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase cursor-pointer ${
                                                  langTab === 'css'
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'text-slate-400 hover:text-white'
                                                }`}
                                              >
                                                CSS {block.css?.trim() ? '●' : ''}
                                              </button>
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-500">
                                              &lt;style&gt; + CSS supported
                                            </span>
                                          </div>

                                          {langTab === 'html' ? (
                                            <textarea
                                              dir="ltr"
                                              rows={8}
                                              value={block.html}
                                              onChange={(e) =>
                                                updateBlock(sIdx, bIdx, { ...block, html: e.target.value })
                                              }
                                              placeholder="<style>&#10;  .card { padding: 16px; border-radius: 12px; }&#10;</style>&#10;<div class='card'>Custom HTML + CSS</div>"
                                              className="w-full flex-1 bg-slate-950 text-sky-300 font-mono text-xs leading-relaxed p-3.5 focus:outline-none resize-y"
                                            />
                                          ) : (
                                            <textarea
                                              dir="ltr"
                                              rows={8}
                                              value={block.css || ''}
                                              onChange={(e) =>
                                                updateBlock(sIdx, bIdx, { ...block, css: e.target.value })
                                              }
                                              placeholder=".sa-custom-card {&#10;  padding: 16px;&#10;  border-radius: 12px;&#10;  background: rgba(41,170,234,0.1);&#10;}"
                                              className="w-full flex-1 bg-slate-950 text-emerald-300 font-mono text-xs leading-relaxed p-3.5 focus:outline-none resize-y"
                                            />
                                          )}
                                        </div>
                                      )}

                                      {(pane === 'split' || pane === 'viewer') && (
                                        <div className="flex flex-col bg-white dark:bg-[#0b101b]">
                                          <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                            {t('Live HTML Viewer')} (HTML + CSS)
                                          </div>
                                          <div className="p-3.5 max-h-[320px] overflow-auto">
                                            {block.html?.trim() || block.css?.trim() ? (
                                              <ScopedHtmlViewer
                                                html={block.html || ''}
                                                css={block.css || ''}
                                                scopeKey={block.id}
                                                className="text-sm"
                                              />
                                            ) : (
                                              <p className="text-xs text-slate-400 italic">
                                                {t('Live HTML output appears here...')}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}

                              {block.type === 'image' && (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                      type="text"
                                      value={block.url}
                                      onChange={(e) => updateBlock(sIdx, bIdx, { ...block, url: e.target.value })}
                                      placeholder="Image URL (https://... or /images/...)"
                                      className={inputClass}
                                    />
                                    <input
                                      type="text"
                                      value={block.alt}
                                      onChange={(e) => updateBlock(sIdx, bIdx, { ...block, alt: e.target.value })}
                                      placeholder="Image Alt Text (required for SEO)..."
                                      className={inputClass}
                                    />
                                    <input
                                      type="text"
                                      value={block.caption || ''}
                                      onChange={(e) => updateBlock(sIdx, bIdx, { ...block, caption: e.target.value })}
                                      placeholder="Optional caption..."
                                      className={inputClass + ' md:col-span-2'}
                                    />
                                  </div>
                                  {block.url?.trim() && (
                                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 max-h-40 flex items-center justify-center">
                                      <img
                                        src={block.url}
                                        alt={block.alt || 'Preview'}
                                        referrerPolicy="no-referrer"
                                        className="max-h-40 w-full object-cover"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}

                              {block.type === 'multi_image' && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <select
                                      value={block.columns}
                                      onChange={(e) =>
                                        updateBlock(sIdx, bIdx, {
                                          ...block,
                                          columns: Number(e.target.value) === 3 ? 3 : 2,
                                        })
                                      }
                                      className="rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-bold"
                                    >
                                      <option value={2}>2 Columns Grid</option>
                                      <option value={3}>3 Columns Grid</option>
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateBlock(sIdx, bIdx, {
                                          ...block,
                                          images: [...(block.images || []), { url: '', alt: '', caption: '' }],
                                        })
                                      }
                                      className="text-xs font-bold text-[#29aaea] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                      <TbPlus size={14} /> {t('Add Image')}
                                    </button>
                                  </div>
                                  {(block.images || []).map((img, iIdx) => (
                                    <div key={iIdx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
                                      <input
                                        type="text"
                                        value={img.url}
                                        onChange={(e) => {
                                          const imgs = [...block.images];
                                          imgs[iIdx] = { ...imgs[iIdx], url: e.target.value };
                                          updateBlock(sIdx, bIdx, { ...block, images: imgs });
                                        }}
                                        placeholder={`Image ${iIdx + 1} URL`}
                                        className={inputClass}
                                      />
                                      <input
                                        type="text"
                                        value={img.alt}
                                        onChange={(e) => {
                                          const imgs = [...block.images];
                                          imgs[iIdx] = { ...imgs[iIdx], alt: e.target.value };
                                          updateBlock(sIdx, bIdx, { ...block, images: imgs });
                                        }}
                                        placeholder="Alt text"
                                        className={inputClass}
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateBlock(sIdx, bIdx, {
                                            ...block,
                                            images: block.images.filter((_, k) => k !== iIdx),
                                          })
                                        }
                                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                      >
                                        <TbTrash size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {block.type === 'slider' && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <input
                                      type="text"
                                      value={block.title || ''}
                                      onChange={(e) => updateBlock(sIdx, bIdx, { ...block, title: e.target.value })}
                                      placeholder="Slider Title..."
                                      className={inputClass}
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateBlock(sIdx, bIdx, {
                                          ...block,
                                          slides: [...(block.slides || []), { url: '', alt: '', caption: '' }],
                                        })
                                      }
                                      className="text-xs font-bold text-[#29aaea] whitespace-nowrap hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                      <TbPlus size={14} /> {t('Add Slide')}
                                    </button>
                                  </div>
                                  {(block.slides || []).map((sl, slIdx) => (
                                    <div key={slIdx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2">
                                      <input
                                        type="text"
                                        value={sl.url}
                                        onChange={(e) => {
                                          const slides = [...block.slides];
                                          slides[slIdx] = { ...slides[slIdx], url: e.target.value };
                                          updateBlock(sIdx, bIdx, { ...block, slides });
                                        }}
                                        placeholder={`Slide ${slIdx + 1} URL`}
                                        className={inputClass}
                                      />
                                      <input
                                        type="text"
                                        value={sl.alt}
                                        onChange={(e) => {
                                          const slides = [...block.slides];
                                          slides[slIdx] = { ...slides[slIdx], alt: e.target.value };
                                          updateBlock(sIdx, bIdx, { ...block, slides });
                                        }}
                                        placeholder="Alt text"
                                        className={inputClass}
                                      />
                                      <input
                                        type="text"
                                        value={sl.caption || ''}
                                        onChange={(e) => {
                                          const slides = [...block.slides];
                                          slides[slIdx] = { ...slides[slIdx], caption: e.target.value };
                                          updateBlock(sIdx, bIdx, { ...block, slides });
                                        }}
                                        placeholder="Slide caption"
                                        className={inputClass}
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateBlock(sIdx, bIdx, {
                                            ...block,
                                            slides: block.slides.filter((_, k) => k !== slIdx),
                                          })
                                        }
                                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                      >
                                        <TbTrash size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {block.type === 'video' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    value={block.url}
                                    onChange={(e) => updateBlock(sIdx, bIdx, { ...block, url: e.target.value })}
                                    placeholder="YouTube, Vimeo, or direct MP4 URL..."
                                    className={inputClass + ' md:col-span-2'}
                                  />
                                  <input
                                    type="text"
                                    value={block.title || ''}
                                    onChange={(e) => updateBlock(sIdx, bIdx, { ...block, title: e.target.value })}
                                    placeholder="Video Title..."
                                    className={inputClass}
                                  />
                                  <input
                                    type="text"
                                    value={block.caption || ''}
                                    onChange={(e) => updateBlock(sIdx, bIdx, { ...block, caption: e.target.value })}
                                    placeholder="Caption..."
                                    className={inputClass}
                                  />
                                </div>
                              )}

                              {block.type === 'code' && (
                                <div className="space-y-3" dir="ltr">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input
                                      type="text"
                                      value={block.language}
                                      onChange={(e) => updateBlock(sIdx, bIdx, { ...block, language: e.target.value })}
                                      placeholder="Language (bash, powershell, ts, json)"
                                      className={inputClass}
                                    />
                                    <input
                                      type="text"
                                      value={block.filename || ''}
                                      onChange={(e) => updateBlock(sIdx, bIdx, { ...block, filename: e.target.value })}
                                      placeholder="Optional filename (e.g. setup.ps1)"
                                      className={inputClass}
                                    />
                                  </div>
                                  <textarea
                                    rows={4}
                                    value={block.code}
                                    onChange={(e) => updateBlock(sIdx, bIdx, { ...block, code: e.target.value })}
                                    placeholder="Paste code snippet..."
                                    className={inputClass + ' font-mono text-xs'}
                                  />
                                </div>
                              )}

                              {block.type === 'button' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    value={block.label}
                                    onChange={(e) => updateBlock(sIdx, bIdx, { ...block, label: e.target.value })}
                                    placeholder="Button Text..."
                                    className={inputClass}
                                  />
                                  <input
                                    type="text"
                                    value={block.url}
                                    onChange={(e) => updateBlock(sIdx, bIdx, { ...block, url: e.target.value })}
                                    placeholder="Target URL (/game or https://...)"
                                    className={inputClass}
                                  />
                                  <select
                                    value={block.variant}
                                    onChange={(e) =>
                                      updateBlock(sIdx, bIdx, {
                                        ...block,
                                        variant: e.target.value as any,
                                      })
                                    }
                                    className={inputClass}
                                  >
                                    <option value="gradient">Gradient CTA</option>
                                    <option value="primary">Sky Primary</option>
                                    <option value="secondary">Dark / Contrast</option>
                                    <option value="outline">Outline</option>
                                  </select>
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={block.icon || ''}
                                      onChange={(e) => updateBlock(sIdx, bIdx, { ...block, icon: e.target.value })}
                                      className={inputClass}
                                    >
                                      <option value="">No Icon</option>
                                      {ICON_CHOICES.map((ic) => (
                                        <option key={ic} value={ic}>
                                          {ic}
                                        </option>
                                      ))}
                                    </select>
                                    {block.icon && (
                                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                                        <Icon name={block.icon} size={18} />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {block.type === 'icon_box' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={block.icon}
                                      onChange={(e) => updateBlock(sIdx, bIdx, { ...block, icon: e.target.value })}
                                      className={inputClass}
                                    >
                                      {ICON_CHOICES.map((ic) => (
                                        <option key={ic} value={ic}>
                                          {ic}
                                        </option>
                                      ))}
                                    </select>
                                    <div className="p-2.5 rounded-xl bg-sky-500/10 text-[#29aaea] shrink-0">
                                      <Icon name={block.icon || 'Sparkles'} size={20} />
                                    </div>
                                  </div>
                                  <select
                                    value={block.accent || 'sky'}
                                    onChange={(e) =>
                                      updateBlock(sIdx, bIdx, { ...block, accent: e.target.value as any })
                                    }
                                    className={inputClass}
                                  >
                                    <option value="sky">Sky Accent</option>
                                    <option value="violet">Violet Accent</option>
                                    <option value="emerald">Emerald Accent</option>
                                    <option value="amber">Amber Accent</option>
                                    <option value="rose">Rose Accent</option>
                                  </select>
                                  <input
                                    type="text"
                                    value={block.title}
                                    onChange={(e) => updateBlock(sIdx, bIdx, { ...block, title: e.target.value })}
                                    placeholder="Feature Title..."
                                    className={inputClass + ' md:col-span-2'}
                                  />
                                  <textarea
                                    rows={2}
                                    value={block.description}
                                    onChange={(e) =>
                                      updateBlock(sIdx, bIdx, { ...block, description: e.target.value })
                                    }
                                    placeholder="Feature description..."
                                    className={inputClass + ' md:col-span-2'}
                                  />
                                </div>
                              )}

                              {block.type === 'callout' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <select
                                    value={block.tone}
                                    onChange={(e) =>
                                      updateBlock(sIdx, bIdx, { ...block, tone: e.target.value as any })
                                    }
                                    className={inputClass}
                                  >
                                    <option value="info">Info Box</option>
                                    <option value="tip">Pro Tip</option>
                                    <option value="warning">Warning</option>
                                    <option value="quote">Editorial Quote</option>
                                  </select>
                                  <input
                                    type="text"
                                    value={block.title || ''}
                                    onChange={(e) => updateBlock(sIdx, bIdx, { ...block, title: e.target.value })}
                                    placeholder="Optional Title..."
                                    className={inputClass}
                                  />
                                  <textarea
                                    rows={3}
                                    value={block.content}
                                    onChange={(e) => updateBlock(sIdx, bIdx, { ...block, content: e.target.value })}
                                    placeholder="Callout or quote text..."
                                    className={inputClass + ' md:col-span-2'}
                                  />
                                </div>
                              )}

                              {block.type === 'checklist' && (
                                <div className="space-y-2.5">
                                  <input
                                    type="text"
                                    value={block.title || ''}
                                    onChange={(e) => updateBlock(sIdx, bIdx, { ...block, title: e.target.value })}
                                    placeholder="Checklist Title (e.g. Key Takeaways)..."
                                    className={inputClass}
                                  />
                                  {(block.items || []).map((item, itIdx) => (
                                    <div key={itIdx} className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => {
                                          const items = [...(block.items || [])];
                                          items[itIdx] = e.target.value;
                                          updateBlock(sIdx, bIdx, { ...block, items });
                                        }}
                                        placeholder={`Checklist item ${itIdx + 1}...`}
                                        className={inputClass}
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateBlock(sIdx, bIdx, {
                                            ...block,
                                            items: (block.items || []).filter((_, k) => k !== itIdx),
                                          })
                                        }
                                        className="p-2 text-rose-500 cursor-pointer"
                                      >
                                        <TbTrash size={14} />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateBlock(sIdx, bIdx, {
                                        ...block,
                                        items: [...(block.items || []), ''],
                                      })
                                    }
                                    className="text-xs font-bold text-[#29aaea] hover:underline cursor-pointer"
                                  >
                                    + {t('Add Checklist Item')}
                                  </button>
                                </div>
                              )}

                              {block.type === 'divider' && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-slate-500">{t('Divider Style')}:</span>
                                  {(['glow', 'line', 'dots'] as const).map((st) => (
                                    <button
                                      key={st}
                                      type="button"
                                      onClick={() => updateBlock(sIdx, bIdx, { ...block, style: st })}
                                      className={`px-3 py-1 rounded-lg text-xs font-bold capitalize border cursor-pointer ${
                                        (block.style || 'glow') === st
                                          ? 'bg-[#29aaea] text-white border-[#29aaea]'
                                          : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                                      }`}
                                    >
                                      {st}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                          })}
                        </div>

                        {/* Add Block Palette */}
                        <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800">
                          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                            {t('Insert Block into Section')}:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(
                              [
                                ['paragraph', 'Rich Text / Compose', TbAlignLeft],
                                ['html', 'HTML / Viewer', TbSourceCode],
                                ['subheading', 'Heading (H1–H6)', TbH3],
                                ['image', 'Image URL', TbPhoto],
                                ['multi_image', 'Multi Images', TbLayoutGrid],
                                ['slider', 'Slides', TbSlideshow],
                                ['video', 'Video URL', TbVideo],
                                ['code', 'Code', TbCode],
                                ['button', 'Button', TbClick],
                                ['icon_box', 'Icon Box', TbIcons],
                                ['callout', 'Callout / Quote', TbQuote],
                                ['checklist', 'Checklist', TbCheckbox],
                                ['divider', 'Divider', TbSeparatorHorizontal],
                              ] as Array<[BlogBlockType, string, React.ElementType]>
                            ).map(([bType, bLabel, BIcon]) => (
                              <button
                                key={bType}
                                type="button"
                                onClick={() => addBlockToSection(sIdx, bType)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 hover:border-[#29aaea] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#29aaea] transition-colors cursor-pointer"
                              >
                                <BIcon size={14} />
                                <span>{t(bLabel)}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        </>
                        )}
                      </div>
                      );
                    })}
                  </div>

                  {/* Smart Bottom Add Section Dock (Zero Scroll-Up Needed) */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {t('Quickly append a new section with your chosen heading level')}:
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {([1, 2, 3, 4, 5, 6] as HeadingLevel[]).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => {
                            setDefaultSectionLevel(lvl);
                            addSection(lvl);
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-black border transition-all cursor-pointer ${
                            lvl === defaultSectionLevel
                              ? 'bg-[#29aaea] text-white border-[#29aaea] shadow-sm'
                              : 'bg-white dark:bg-[#111623] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#29aaea] hover:text-[#29aaea]'
                          }`}
                        >
                          <TbPlus size={13} />
                          <span>H{lvl}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: COMPARISON TABLE, PROS/CONS & STEP-BY-STEP GUIDE */}
              {activeEditorTab === 'extras' && (
                <div className="space-y-8">
                  {/* 6. Comparison Table */}
                  <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TbTable size={19} className="text-[#29aaea]" />
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {t('6. Comparison Table (Optional)')}
                        </h3>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingPost.comparisonTable.enabled}
                          onChange={(e) =>
                            updateField('comparisonTable', {
                              ...editingPost.comparisonTable,
                              enabled: e.target.checked,
                            })
                          }
                          className="accent-[#29aaea]"
                        />
                        <span>{t('Enabled')}</span>
                      </label>
                    </div>

                    {renderModulePlacementBar('comparison')}

                    {editingPost.comparisonTable.enabled && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingPost.comparisonTable.title}
                          onChange={(e) =>
                            updateField('comparisonTable', {
                              ...editingPost.comparisonTable,
                              title: e.target.value,
                            })
                          }
                          placeholder="Comparison Table Heading"
                          className={inputClass}
                        />

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-500">{t('Columns')}:</span>
                          {editingPost.comparisonTable.columns.map((col, cIdx) => (
                            <div key={cIdx} className="flex items-center gap-1">
                              <input
                                type="text"
                                value={col}
                                onChange={(e) => {
                                  const cols = [...editingPost.comparisonTable.columns];
                                  cols[cIdx] = e.target.value;
                                  updateField('comparisonTable', {
                                    ...editingPost.comparisonTable,
                                    columns: cols,
                                  });
                                }}
                                className="w-28 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs"
                              />
                              {editingPost.comparisonTable.columns.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cols = editingPost.comparisonTable.columns.filter((_, k) => k !== cIdx);
                                    const rows = editingPost.comparisonTable.rows.map((r) => ({
                                      cells: getComparisonRowCells(r).filter((_, k) => k !== cIdx),
                                    }));
                                    updateField('comparisonTable', {
                                      ...editingPost.comparisonTable,
                                      columns: cols,
                                      rows,
                                    });
                                  }}
                                  className="text-rose-500 cursor-pointer"
                                >
                                  <TbX size={13} />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const cols = [...editingPost.comparisonTable.columns, 'New Column'];
                              const rows = editingPost.comparisonTable.rows.map((r) => ({
                                cells: [...getComparisonRowCells(r), ''],
                              }));
                              updateField('comparisonTable', {
                                ...editingPost.comparisonTable,
                                columns: cols,
                                rows,
                              });
                            }}
                            className="text-xs font-bold text-[#29aaea] hover:underline cursor-pointer"
                          >
                            + {t('Column')}
                          </button>
                        </div>

                        <div className="space-y-2">
                          {editingPost.comparisonTable.rows.map((row, rIdx) => {
                            const rowCells = getComparisonRowCells(row);
                            return (
                              <div key={rIdx} className="flex items-center gap-2 flex-wrap">
                                {editingPost.comparisonTable.columns.map((_, cIdx) => (
                                  <input
                                    key={cIdx}
                                    type="text"
                                    value={rowCells[cIdx] || ''}
                                    onChange={(e) => {
                                      const rows = editingPost.comparisonTable.rows.map((r) => ({
                                        cells: [...getComparisonRowCells(r)],
                                      }));
                                      while (rows[rIdx].cells.length <= cIdx) {
                                        rows[rIdx].cells.push('');
                                      }
                                      rows[rIdx].cells[cIdx] = e.target.value;
                                      updateField('comparisonTable', {
                                        ...editingPost.comparisonTable,
                                        rows,
                                      });
                                    }}
                                    placeholder={`Row ${rIdx + 1}`}
                                    className="flex-1 min-w-[110px] rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs"
                                  />
                                ))}
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateField('comparisonTable', {
                                      ...editingPost.comparisonTable,
                                      rows: editingPost.comparisonTable.rows.filter((_, k) => k !== rIdx),
                                    })
                                  }
                                  className="p-1.5 text-rose-500 cursor-pointer"
                                >
                                  <TbTrash size={14} />
                                </button>
                              </div>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() =>
                              updateField('comparisonTable', {
                                ...editingPost.comparisonTable,
                                rows: [
                                  ...editingPost.comparisonTable.rows,
                                  { cells: editingPost.comparisonTable.columns.map(() => '') },
                                ],
                              })
                            }
                            className="text-xs font-bold text-[#29aaea] hover:underline cursor-pointer"
                          >
                            + {t('Add Row')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 8. Pros & Cons */}
                  <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TbListCheck size={19} className="text-emerald-500" />
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {t('8. Pros & Cons (Optional)')}
                        </h3>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingPost.prosCons.enabled}
                          onChange={(e) =>
                            updateField('prosCons', { ...editingPost.prosCons, enabled: e.target.checked })
                          }
                          className="accent-[#29aaea]"
                        />
                        <span>{t('Enabled')}</span>
                      </label>
                    </div>

                    {renderModulePlacementBar('pros_cons')}

                    {editingPost.prosCons.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {t('Pros')}
                          </label>
                          {editingPost.prosCons.pros.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={p}
                                onChange={(e) => {
                                  const pros = [...editingPost.prosCons.pros];
                                  pros[idx] = e.target.value;
                                  updateField('prosCons', { ...editingPost.prosCons, pros });
                                }}
                                placeholder="Add pro..."
                                className={inputClass}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateField('prosCons', {
                                    ...editingPost.prosCons,
                                    pros: editingPost.prosCons.pros.filter((_, k) => k !== idx),
                                  })
                                }
                                className="p-2 text-rose-500 cursor-pointer"
                              >
                                <TbTrash size={14} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              updateField('prosCons', {
                                ...editingPost.prosCons,
                                pros: [...editingPost.prosCons.pros, ''],
                              })
                            }
                            className="text-xs font-bold text-emerald-500 hover:underline cursor-pointer"
                          >
                            + {t('Add Pro')}
                          </button>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-rose-600 dark:text-rose-400">
                            {t('Cons')}
                          </label>
                          {editingPost.prosCons.cons.map((c, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={c}
                                onChange={(e) => {
                                  const cons = [...editingPost.prosCons.cons];
                                  cons[idx] = e.target.value;
                                  updateField('prosCons', { ...editingPost.prosCons, cons });
                                }}
                                placeholder="Add con..."
                                className={inputClass}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateField('prosCons', {
                                    ...editingPost.prosCons,
                                    cons: editingPost.prosCons.cons.filter((_, k) => k !== idx),
                                  })
                                }
                                className="p-2 text-rose-500 cursor-pointer"
                              >
                                <TbTrash size={14} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              updateField('prosCons', {
                                ...editingPost.prosCons,
                                cons: [...editingPost.prosCons.cons, ''],
                              })
                            }
                            className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                          >
                            + {t('Add Con')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 9. Step-by-Step Guide */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {t('9. Step-by-Step Guide (Optional)')}
                      </h3>
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingPost.stepByStep.enabled}
                          onChange={(e) =>
                            updateField('stepByStep', {
                              ...editingPost.stepByStep,
                              enabled: e.target.checked,
                            })
                          }
                          className="accent-[#29aaea]"
                        />
                        <span>{t('Enabled')}</span>
                      </label>
                    </div>

                    {renderModulePlacementBar('steps')}

                    {editingPost.stepByStep.enabled && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingPost.stepByStep.title}
                          onChange={(e) =>
                            updateField('stepByStep', {
                              ...editingPost.stepByStep,
                              title: e.target.value,
                            })
                          }
                          placeholder="How-To Guide Heading..."
                          className={inputClass}
                        />
                        {editingPost.stepByStep.steps.map((step, idx) => (
                          <div
                            key={step.id || idx}
                            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-[#29aaea]">
                                Step {idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateField('stepByStep', {
                                    ...editingPost.stepByStep,
                                    steps: editingPost.stepByStep.steps.filter((_, k) => k !== idx),
                                  })
                                }
                                className="text-rose-500 cursor-pointer"
                              >
                                <TbTrash size={14} />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={step.title}
                              onChange={(e) => {
                                const steps = [...editingPost.stepByStep.steps];
                                steps[idx] = { ...steps[idx], title: e.target.value };
                                updateField('stepByStep', { ...editingPost.stepByStep, steps });
                              }}
                              placeholder="Step Title"
                              className={inputClass}
                            />
                            <textarea
                              rows={2}
                              value={step.description}
                              onChange={(e) => {
                                const steps = [...editingPost.stepByStep.steps];
                                steps[idx] = { ...steps[idx], description: e.target.value };
                                updateField('stepByStep', { ...editingPost.stepByStep, steps });
                              }}
                              placeholder="Step Instructions..."
                              className={inputClass}
                            />
                            <input
                              type="text"
                              value={step.tip || ''}
                              onChange={(e) => {
                                const steps = [...editingPost.stepByStep.steps];
                                steps[idx] = { ...steps[idx], tip: e.target.value };
                                updateField('stepByStep', { ...editingPost.stepByStep, steps });
                              }}
                              placeholder="Optional quick tip..."
                              className={inputClass}
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            updateField('stepByStep', {
                              ...editingPost.stepByStep,
                              steps: [
                                ...editingPost.stepByStep.steps,
                                { id: createBlockId('stp'), title: '', description: '', tip: '' },
                              ],
                            })
                          }
                          className="text-xs font-bold text-[#29aaea] hover:underline cursor-pointer"
                        >
                          + {t('Add Step')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: REVIEWS & ALL PLATFORMS STORES (OPTIONAL) */}
              {activeEditorTab === 'reviews' && (() => {
                const reviewsState = editingPost.metacriticReviews || {
                  enabled: false,
                  title: 'Reviews & Scores',
                  critic: { score: null, positiveCount: 0, mixedCount: 0, negativeCount: 0, summaryText: '' },
                  user: { score: null, positiveCount: 0, mixedCount: 0, negativeCount: 0, summaryText: '' },
                };
                const whereState = editingPost.whereToBuy || {
                  enabled: false,
                  title: 'Where to Buy',
                  collapseAfter: 2,
                  offers: [],
                };

                const updateReviewsField = (
                  kind: 'critic' | 'user',
                  patch: Partial<BlogReviewBreakdown>
                ) => {
                  updateField('metacriticReviews', {
                    ...reviewsState,
                    [kind]: {
                      ...reviewsState[kind],
                      ...patch,
                    },
                  });
                };

                const addPlatformOffer = (preset?: (typeof PLATFORM_PRESETS)[number]) => {
                  const newOffer: BlogPlatformOffer = {
                    id: createBlockId('off'),
                    platform: preset?.platform || 'steam',
                    platformLabel: preset?.platformLabel || 'PC Store',
                    price: preset?.price || '$59.99',
                    storeName: preset?.storeName || 'Steam Store',
                    affiliateUrl: '',
                    badge: '',
                  };
                  updateField(
                    'whereToBuy',
                    {
                      ...whereState,
                      enabled: true,
                      offers: [...(whereState.offers || []), newOffer],
                    },
                    true
                  );
                };

                const getAdminScoreTone = (score: number | null) => {
                  if (score === null || Number.isNaN(score)) {
                    return 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 bg-transparent';
                  }
                  if (score >= 85) return 'bg-emerald-500 border-emerald-500 text-white';
                  if (score >= 45) return 'bg-amber-500 border-amber-500 text-white';
                  return 'bg-rose-500 border-rose-500 text-white';
                };

                return (
                  <div className="space-y-8">
                    {/* Metacritic-Style Reviews Editor */}
                    <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <TbStarFilled size={19} className="text-amber-500" />
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                              {t('Critic & User Reviews (Optional)')}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {t('85+ Green · 45–84 Orange · Under 45 Red · Blank = auto from counts or --')}
                            </p>
                          </div>
                        </div>
                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                          <input
                            type="checkbox"
                            checked={reviewsState.enabled}
                            onChange={(e) =>
                              updateField(
                                'metacriticReviews',
                                { ...reviewsState, enabled: e.target.checked },
                                true
                              )
                            }
                            className="accent-[#29aaea]"
                          />
                          <span>{t('Show on Article')}</span>
                        </label>
                      </div>

                      {renderModulePlacementBar('reviews')}

                      {reviewsState.enabled && (
                        <div className="space-y-5">
                          <div>
                            <label className={labelClass}>{t('Reviews Section Title')}</label>
                            <input
                              type="text"
                              value={reviewsState.title || ''}
                              onChange={(e) =>
                                updateField('metacriticReviews', { ...reviewsState, title: e.target.value })
                              }
                              placeholder="Reviews & Scores"
                              className={inputClass}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {([
                              { key: 'critic' as const, label: t('Critic Reviews'), tag: t('Critic Score'), shape: 'rounded-xl' },
                              { key: 'user' as const, label: t('User Reviews'), tag: t('User Score'), shape: 'rounded-full' },
                            ]).map((panel) => {
                              const data = reviewsState[panel.key];
                              const pos = Math.max(0, Number(data.positiveCount || 0));
                              const mix = Math.max(0, Number(data.mixedCount || 0));
                              const neg = Math.max(0, Number(data.negativeCount || 0));
                              const total = pos + mix + neg;
                              const posPct = total > 0 ? Math.round((pos / total) * 100) : 0;
                              const mixPct = total > 0 ? Math.round((mix / total) * 100) : 0;
                              const negPct = total > 0 ? Math.max(0, 100 - posPct - mixPct) : 0;
                              const hasManual = typeof data.score === 'number' && !Number.isNaN(data.score);
                              const previewScore = hasManual
                                ? Math.round(data.score as number)
                                : total > 0
                                ? Math.round(((pos + mix * 0.5) / total) * 100)
                                : null;

                              return (
                                <div
                                  key={panel.key}
                                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0d121e] p-4 space-y-3"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        {panel.tag}
                                      </div>
                                      <div className="text-sm font-black text-slate-900 dark:text-white">
                                        {panel.label}
                                      </div>
                                    </div>
                                    <div
                                      className={`w-12 h-12 border-2 flex items-center justify-center font-black text-lg tabular-nums ${panel.shape} ${getAdminScoreTone(
                                        previewScore
                                      )}`}
                                    >
                                      {previewScore === null ? '--' : previewScore}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div>
                                      <label className={labelClass}>{t('Score (0–100, blank = auto)')}</label>
                                      <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={data.score === null ? '' : data.score}
                                        onChange={(e) => {
                                          const raw = e.target.value.trim();
                                          if (raw === '') {
                                            updateReviewsField(panel.key, { score: null });
                                          } else {
                                            const num = Math.max(0, Math.min(100, Number(raw)));
                                            updateReviewsField(panel.key, { score: Number.isNaN(num) ? null : num });
                                          }
                                        }}
                                        placeholder={previewScore !== null ? String(previewScore) : 'Auto'}
                                        className={inputClass}
                                      />
                                    </div>
                                    <div>
                                      <label className={labelClass}>{t('Verdict Label (Optional)')}</label>
                                      <input
                                        type="text"
                                        value={data.summaryText || ''}
                                        onChange={(e) =>
                                          updateReviewsField(panel.key, { summaryText: e.target.value })
                                        }
                                        placeholder="e.g. Universal Acclaim"
                                        className={inputClass}
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <label className="block text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 mb-1">
                                        {t('Positive')} ({posPct}%)
                                      </label>
                                      <input
                                        type="number"
                                        min={0}
                                        value={data.positiveCount}
                                        onChange={(e) =>
                                          updateReviewsField(panel.key, {
                                            positiveCount: Math.max(0, Number(e.target.value) || 0),
                                          })
                                        }
                                        className={inputClass}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-extrabold text-amber-600 dark:text-amber-400 mb-1">
                                        {t('Mixed')} ({mixPct}%)
                                      </label>
                                      <input
                                        type="number"
                                        min={0}
                                        value={data.mixedCount}
                                        onChange={(e) =>
                                          updateReviewsField(panel.key, {
                                            mixedCount: Math.max(0, Number(e.target.value) || 0),
                                          })
                                        }
                                        className={inputClass}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-extrabold text-rose-600 dark:text-rose-400 mb-1">
                                        {t('Negative')} ({negPct}%)
                                      </label>
                                      <input
                                        type="number"
                                        min={0}
                                        value={data.negativeCount}
                                        onChange={(e) =>
                                          updateReviewsField(panel.key, {
                                            negativeCount: Math.max(0, Number(e.target.value) || 0),
                                          })
                                        }
                                        className={inputClass}
                                      />
                                    </div>
                                  </div>

                                  <div className="h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex">
                                    {total > 0 && (
                                      <>
                                        {pos > 0 && (
                                          <div style={{ width: `${(pos / total) * 100}%` }} className="bg-emerald-500 h-full" />
                                        )}
                                        {mix > 0 && (
                                          <div style={{ width: `${(mix / total) * 100}%` }} className="bg-amber-500 h-full" />
                                        )}
                                        {neg > 0 && (
                                          <div style={{ width: `${(neg / total) * 100}%` }} className="bg-rose-500 h-full" />
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Where to Buy / All Platforms Affiliate Links Editor */}
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <TbShoppingCart size={19} className="text-[#29aaea]" />
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                              {t('Where to Buy & Platform Affiliate Links (Optional)')}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {t('Add PlayStation Store, Xbox Store, Steam Store, Epic Games Store, GOG, Amazon, or custom affiliate links.')}
                            </p>
                          </div>
                        </div>
                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                          <input
                            type="checkbox"
                            checked={whereState.enabled}
                            onChange={(e) =>
                              updateField(
                                'whereToBuy',
                                { ...whereState, enabled: e.target.checked },
                                true
                              )
                            }
                            className="accent-[#29aaea]"
                          />
                          <span>{t('Show on Article')}</span>
                        </label>
                      </div>

                      {renderModulePlacementBar('where_to_buy')}

                      {whereState.enabled && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>{t('Section Heading')}</label>
                              <input
                                type="text"
                                value={whereState.title || ''}
                                onChange={(e) =>
                                  updateField('whereToBuy', { ...whereState, title: e.target.value })
                                }
                                placeholder="Where to Buy"
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                {t('Show Initially Before "View All Buy Options"')}
                              </label>
                              <input
                                type="number"
                                min={1}
                                max={20}
                                value={whereState.collapseAfter ?? 2}
                                onChange={(e) =>
                                  updateField('whereToBuy', {
                                    ...whereState,
                                    collapseAfter: Math.max(1, Number(e.target.value) || 2),
                                  })
                                }
                                className={inputClass}
                              />
                            </div>
                          </div>

                          {/* Quick Platform Presets */}
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              {t('Quick Add Platform Store')}:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {PLATFORM_PRESETS.map((preset) => (
                                <button
                                  key={preset.platform}
                                  type="button"
                                  onClick={() => addPlatformOffer(preset)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-700 hover:border-[#29aaea] text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#29aaea] transition-colors cursor-pointer"
                                >
                                  {renderAdminPlatformIcon(preset.platform)}
                                  <span>+ {preset.storeName}</span>
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => addPlatformOffer()}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#29aaea]/10 text-[#29aaea] text-xs font-bold cursor-pointer"
                              >
                                <TbPlus size={14} />
                                <span>{t('Custom Store')}</span>
                              </button>
                            </div>
                          </div>

                          {/* Offers List */}
                          <div className="space-y-3">
                            {(whereState.offers || []).map((offer, idx) => (
                              <div
                                key={offer.id || idx}
                                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-white">
                                    <span className="p-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-[#29aaea]">
                                      {renderAdminPlatformIcon(offer.platform)}
                                    </span>
                                    <span>
                                      {offer.platformLabel || `Store #${idx + 1}`}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => {
                                        const nextOffers = [...whereState.offers];
                                        [nextOffers[idx - 1], nextOffers[idx]] = [
                                          nextOffers[idx],
                                          nextOffers[idx - 1],
                                        ];
                                        updateField('whereToBuy', { ...whereState, offers: nextOffers }, true);
                                      }}
                                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                                    >
                                      <TbArrowUp size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === whereState.offers.length - 1}
                                      onClick={() => {
                                        const nextOffers = [...whereState.offers];
                                        [nextOffers[idx], nextOffers[idx + 1]] = [
                                          nextOffers[idx + 1],
                                          nextOffers[idx],
                                        ];
                                        updateField('whereToBuy', { ...whereState, offers: nextOffers }, true);
                                      }}
                                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                                    >
                                      <TbArrowDown size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateField(
                                          'whereToBuy',
                                          {
                                            ...whereState,
                                            offers: whereState.offers.filter((_, k) => k !== idx),
                                          },
                                          true
                                        )
                                      }
                                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                    >
                                      <TbTrash size={14} />
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                  <div>
                                    <label className={labelClass}>{t('Platform')}</label>
                                    <select
                                      value={offer.platform}
                                      onChange={(e) => {
                                        const nextOffers = [...whereState.offers];
                                        nextOffers[idx] = {
                                          ...nextOffers[idx],
                                          platform: e.target.value as BlogStorePlatform,
                                        };
                                        updateField('whereToBuy', { ...whereState, offers: nextOffers });
                                      }}
                                      className={inputClass}
                                    >
                                      <option value="playstation">PlayStation Store</option>
                                      <option value="xbox">Xbox Store</option>
                                      <option value="steam">Steam Store</option>
                                      <option value="epic">Epic Games Store</option>
                                      <option value="gog">GOG</option>
                                      <option value="nintendo">Nintendo eShop</option>
                                      <option value="amazon">Amazon</option>
                                      <option value="other">Other Store</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className={labelClass}>{t('Display Badge')}</label>
                                    <input
                                      type="text"
                                      value={offer.platformLabel}
                                      onChange={(e) => {
                                        const nextOffers = [...whereState.offers];
                                        nextOffers[idx] = { ...nextOffers[idx], platformLabel: e.target.value };
                                        updateField('whereToBuy', { ...whereState, offers: nextOffers });
                                      }}
                                      placeholder="PS5 / Steam / Xbox Series X"
                                      className={inputClass}
                                    />
                                  </div>
                                  <div>
                                    <label className={labelClass}>{t('Price')}</label>
                                    <input
                                      type="text"
                                      value={offer.price}
                                      onChange={(e) => {
                                        const nextOffers = [...whereState.offers];
                                        nextOffers[idx] = { ...nextOffers[idx], price: e.target.value };
                                        updateField('whereToBuy', { ...whereState, offers: nextOffers });
                                      }}
                                      placeholder="$79.99 / Free"
                                      className={inputClass}
                                    />
                                  </div>
                                  <div>
                                    <label className={labelClass}>{t('Store Name')}</label>
                                    <input
                                      type="text"
                                      value={offer.storeName || ''}
                                      onChange={(e) => {
                                        const nextOffers = [...whereState.offers];
                                        nextOffers[idx] = { ...nextOffers[idx], storeName: e.target.value };
                                        updateField('whereToBuy', { ...whereState, offers: nextOffers });
                                      }}
                                      placeholder="PlayStation Store"
                                      className={inputClass}
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-2.5">
                                  <div>
                                    <label className={labelClass}>{t('Affiliate URL')}</label>
                                    <input
                                      type="text"
                                      value={offer.affiliateUrl}
                                      onChange={(e) => {
                                        const nextOffers = [...whereState.offers];
                                        nextOffers[idx] = { ...nextOffers[idx], affiliateUrl: e.target.value };
                                        updateField('whereToBuy', { ...whereState, offers: nextOffers });
                                      }}
                                      placeholder="https://store.steampowered.com/...?ref=..."
                                      className={inputClass}
                                    />
                                  </div>
                                  <div>
                                    <label className={labelClass}>{t('Discount Tag (Optional)')}</label>
                                    <input
                                      type="text"
                                      value={offer.badge || ''}
                                      onChange={(e) => {
                                        const nextOffers = [...whereState.offers];
                                        nextOffers[idx] = { ...nextOffers[idx], badge: e.target.value };
                                        updateField('whereToBuy', { ...whereState, offers: nextOffers });
                                      }}
                                      placeholder="-25%"
                                      className={inputClass}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* TAB: FAQ SECTION */}
              {activeEditorTab === 'faqs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TbHelp size={19} className="text-indigo-500" />
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {t('10. FAQ Section (H3 Questions + FAQPage Schema)')}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateField('faqs', [
                          ...(editingPost.faqs || []),
                          { id: createBlockId('faq'), question: '', answer: '' },
                        ])
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#29aaea] text-white text-xs font-bold cursor-pointer"
                    >
                      <TbPlus size={14} /> {t('Add Question')}
                    </button>
                  </div>

                  {renderModulePlacementBar('faq')}

                  {(editingPost.faqs || []).map((faq, idx) => (
                    <div
                      key={faq.id || idx}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-500">H3 · Question {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateField(
                              'faqs',
                              editingPost.faqs.filter((_, k) => k !== idx)
                            )
                          }
                          className="text-rose-500 cursor-pointer"
                        >
                          <TbTrash size={14} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => {
                          const faqs = [...editingPost.faqs];
                          faqs[idx] = { ...faqs[idx], question: e.target.value };
                          updateField('faqs', faqs);
                        }}
                        placeholder="FAQ Question..."
                        className={inputClass}
                      />
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => {
                          const faqs = [...editingPost.faqs];
                          faqs[idx] = { ...faqs[idx], answer: e.target.value };
                          updateField('faqs', faqs);
                        }}
                        placeholder="Clear concise answer..."
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* TAB: CONCLUSION */}
              {activeEditorTab === 'conclusion' && (
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {t('11. Conclusion & Call to Action')}
                  </h3>
                  <div>
                    <label className={labelClass}>{t('Conclusion Title')}</label>
                    <input
                      type="text"
                      value={editingPost.conclusionTitle || 'Conclusion'}
                      onChange={(e) => updateField('conclusionTitle', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('Conclusion Summary')}</label>
                    <RichTextBlockEditor
                      value={editingPost.conclusion}
                      onChange={(val) => updateField('conclusion', val)}
                      placeholder="Wrap up the article and guide the reader to the next step..."
                      minRows={4}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t('CTA Button Label (Optional)')}</label>
                      <input
                        type="text"
                        value={editingPost.conclusionCtaLabel || ''}
                        onChange={(e) => updateField('conclusionCtaLabel', e.target.value)}
                        placeholder="Explore Games Catalog"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('CTA Button URL (Internal /game or External)')}</label>
                      <input
                        type="text"
                        value={editingPost.conclusionCtaUrl || ''}
                        onChange={(e) => updateField('conclusionCtaUrl', e.target.value)}
                        placeholder="/game"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SOURCES & RELATED ARTICLES */}
              {activeEditorTab === 'sources' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TbLink size={18} className="text-[#29aaea]" />
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {t('14. Sources & References')}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateField('sources', [
                            ...(editingPost.sources || []),
                            { id: createBlockId('src'), label: '', url: '' },
                          ])
                        }
                        className="text-xs font-bold text-[#29aaea] hover:underline cursor-pointer"
                      >
                        + {t('Add Source')}
                      </button>
                    </div>

                    {(editingPost.sources || []).map((src, idx) => (
                      <div key={src.id || idx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
                        <input
                          type="text"
                          value={src.label}
                          onChange={(e) => {
                            const sources = [...editingPost.sources];
                            sources[idx] = { ...sources[idx], label: e.target.value };
                            updateField('sources', sources);
                          }}
                          placeholder="Source Name"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={src.url}
                          onChange={(e) => {
                            const sources = [...editingPost.sources];
                            sources[idx] = { ...sources[idx], url: e.target.value };
                            updateField('sources', sources);
                          }}
                          placeholder="https://..."
                          className={inputClass}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateField(
                              'sources',
                              editingPost.sources.filter((_, k) => k !== idx)
                            )
                          }
                          className="p-2 text-rose-500 cursor-pointer"
                        >
                          <TbTrash size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {t('13. Related Articles (Internal Linking)')}
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {posts
                        .filter((p) => p.id !== editingPost.id && p.slug !== editingPost.slug)
                        .map((other) => {
                          const checked = (editingPost.relatedSlugs || []).includes(other.slug);
                          return (
                            <label
                              key={other.id}
                              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const current = editingPost.relatedSlugs || [];
                                  updateField(
                                    'relatedSlugs',
                                    e.target.checked
                                      ? [...current, other.slug]
                                      : current.filter((s) => s !== other.slug)
                                  );
                                }}
                                className="accent-[#29aaea]"
                              />
                              <span className="font-bold text-slate-900 dark:text-white truncate">
                                {other.title}
                              </span>
                              <span className="text-slate-400 font-mono ms-auto shrink-0">
                                /blog/{other.slug}
                              </span>
                            </label>
                          );
                        })}
                      {posts.filter((p) => p.id !== editingPost.id).length === 0 && (
                        <p className="text-xs text-slate-500">
                          {t('More published articles will appear here for manual internal linking.')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MULTI-LANGUAGE TRANSLATIONS */}
              {activeEditorTab === 'translations' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <TbWorld size={19} className="text-[#29aaea]" />
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {t('Multi-Language Article Overrides')}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {(['en', 'fr', 'es', 'ar'] as BlogLanguage[]).map((lg) => (
                        <button
                          key={lg}
                          type="button"
                          onClick={() => setTranslationLang(lg)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold uppercase cursor-pointer ${
                            translationLang === lg
                              ? 'bg-[#29aaea] text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {lg}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(() => {
                    const tr = editingPost.translations?.[translationLang] || {};
                    const setTr = (field: keyof typeof tr, val: string) => {
                      updateField('translations', {
                        ...(editingPost.translations || {}),
                        [translationLang]: { ...tr, [field]: val },
                      });
                    };
                    return (
                      <div className="space-y-3" dir={translationLang === 'ar' ? 'rtl' : 'ltr'}>
                        <div>
                          <label className={labelClass}>Title ({translationLang.toUpperCase()})</label>
                          <input
                            type="text"
                            value={tr.title || ''}
                            onChange={(e) => setTr('title', e.target.value)}
                            placeholder="Optional localized H1 title..."
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>SEO Title ({translationLang.toUpperCase()})</label>
                          <input
                            type="text"
                            value={tr.seoTitle || ''}
                            onChange={(e) => setTr('seoTitle', e.target.value)}
                            placeholder="Optional localized SEO title..."
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Meta Description ({translationLang.toUpperCase()})</label>
                          <textarea
                            rows={2}
                            value={tr.metaDescription || ''}
                            onChange={(e) => setTr('metaDescription', e.target.value)}
                            placeholder="Optional localized meta description..."
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Introduction ({translationLang.toUpperCase()})</label>
                          <textarea
                            rows={2}
                            value={tr.introduction || ''}
                            onChange={(e) => setTr('introduction', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Quick Answer ({translationLang.toUpperCase()})</label>
                          <textarea
                            rows={2}
                            value={tr.quickAnswer || ''}
                            onChange={(e) => setTr('quickAnswer', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Conclusion ({translationLang.toUpperCase()})</label>
                          <textarea
                            rows={2}
                            value={tr.conclusion || ''}
                            onChange={(e) => setTr('conclusion', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB: HTML VIEWER & MANUAL FULL HTML ARTICLE */}
              {activeEditorTab === 'html_viewer' && (() => {
                const isManual = Boolean(editingPost.useCustomHtml);
                const activeHtml = isManual
                  ? editingPost.customHtml || ''
                  : compilePostSectionsToHtml(editingPost);

                const handleCopyArticleHtml = async () => {
                  try {
                    await navigator.clipboard.writeText(activeHtml);
                    setHtmlCopied(true);
                    setTimeout(() => setHtmlCopied(false), 1800);
                  } catch {
                    // ignore clipboard error
                  }
                };

                const handleDownloadHtml = () => {
                  try {
                    const blob = new Blob([activeHtml], { type: 'text/html;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${editingPost.slug || 'article'}.html`;
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch {
                    // ignore
                  }
                };

                return (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <TbFileCode size={20} className="text-[#29aaea] shrink-0" />
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                            {t('HTML Viewer & Manual HTML Article')}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {t('Inspect the complete article HTML or write/paste your own full manual HTML article with live preview.')}
                          </p>
                        </div>
                      </div>

                      {/* Pane View Switcher */}
                      <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
                        {(
                          [
                            ['split', t('Split'), TbLayoutColumns],
                            ['code', t('HTML Code'), TbSourceCode],
                            ['viewer', t('HTML Viewer'), TbEye],
                          ] as const
                        ).map(([pMode, pLabel, PIcon]) => (
                          <button
                            key={pMode}
                            type="button"
                            onClick={() => setHtmlViewerPaneMode(pMode)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                              htmlViewerPaneMode === pMode
                                ? 'bg-[#29aaea] text-white'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <PIcon size={14} />
                            <span>{pLabel}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Article Body Source Mode Toggle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => updateField('useCustomHtml', false)}
                        className={`text-start p-4 rounded-2xl border transition-all cursor-pointer ${
                          !isManual
                            ? 'border-[#29aaea] bg-sky-50/70 dark:bg-sky-950/25 ring-2 ring-[#29aaea]/20'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {t('Structured Sections Mode (Default)')}
                          </span>
                          {!isManual && (
                            <span className="px-2 py-0.5 rounded-md bg-[#29aaea] text-white text-[10px] font-black">
                              {t('Active')}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {t('Public article renders from Sections & Rich Blocks. Here you can inspect, copy, or export the generated HTML.')}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!editingPost.customHtml?.trim()) {
                            updateField('customHtml', compilePostSectionsToHtml(editingPost));
                          }
                          updateField('useCustomHtml', true);
                        }}
                        className={`text-start p-4 rounded-2xl border transition-all cursor-pointer ${
                          isManual
                            ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/25 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {t('Manual Full HTML Article Mode')}
                          </span>
                          {isManual && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black">
                              {t('Active')}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {t('Write or paste complete manual HTML below — headings auto-sync to Table of Contents.')}
                        </p>
                      </button>
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-1 flex-wrap">
                        {isManual && (
                          <>
                            <button
                              type="button"
                              onClick={() => wrapFullHtmlSelection('<h1>', '</h1>', 'Heading 1')}
                              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                              title="<h1>"
                            >
                              <TbH1 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => wrapFullHtmlSelection('<h2>', '</h2>', 'Section Heading')}
                              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                              title="<h2>"
                            >
                              <TbH2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => wrapFullHtmlSelection('<h3>', '</h3>', 'Subsection')}
                              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                              title="<h3>"
                            >
                              <TbH3 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => wrapFullHtmlSelection('<strong>', '</strong>', 'bold')}
                              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                              title="<strong>"
                            >
                              <TbBold size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => wrapFullHtmlSelection('<em>', '</em>', 'italic')}
                              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                              title="<em>"
                            >
                              <TbItalic size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => wrapFullHtmlSelection('<u>', '</u>', 'underline')}
                              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                              title="<u>"
                            >
                              <TbUnderline size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => wrapFullHtmlSelection('<s>', '</s>', 'strikethrough')}
                              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                              title="<s>"
                            >
                              <TbStrikethrough size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => wrapFullHtmlSelection('<ul>\n  <li>', '</li>\n</ul>', 'List item')}
                              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                              title="<ul>"
                            >
                              <TbList size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => wrapFullHtmlSelection('<ol>\n  <li>', '</li>\n</ol>', 'Step 1')}
                              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                              title="<ol>"
                            >
                              <TbListNumbers size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => wrapFullHtmlSelection('<blockquote>', '</blockquote>', 'Quote')}
                              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                              title="<blockquote>"
                            >
                              <TbQuote size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateField('customHtml', formatHtmlPretty(editingPost.customHtml || ''))
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#29aaea] cursor-pointer ms-1"
                            >
                              <TbWand size={13} />
                              <span>{t('Format HTML')}</span>
                            </button>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isManual && (
                          <button
                            type="button"
                            onClick={() => {
                              updateField(
                                'customHtml',
                                `${editingPost.customHtml ? `${editingPost.customHtml}\n` : ''}<div class="sa-callout-grid">\n  <div class="sa-callout-card">\n    <h3>Highlight One</h3>\n    <p>Styled cleanly with custom CSS.</p>\n  </div>\n  <div class="sa-callout-card">\n    <h3>Highlight Two</h3>\n    <p>Responsive grid adapts automatically.</p>\n  </div>\n</div>`
                              );
                              updateField(
                                'customCss',
                                `${editingPost.customCss ? `${editingPost.customCss}\n\n` : ''}.sa-callout-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin: 16px 0; }\n.sa-callout-card { padding: 16px; border-radius: 14px; border: 1px solid rgba(41, 170, 234, 0.35); background: rgba(41, 170, 234, 0.08); }\n.sa-callout-card h3 { margin: 0 0 6px; font-size: 1rem; color: #29aaea; }`
                              );
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 text-[#29aaea] text-[11px] font-bold hover:bg-sky-500/20 cursor-pointer"
                          >
                            + {t('HTML + CSS Card Grid')}
                          </button>
                        )}
                        {isManual ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                updateField('customHtml', compilePostSectionsToHtml(editingPost))
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:border-[#29aaea] cursor-pointer"
                            >
                              {t('Sync From Sections')}
                            </button>
                            <button
                              type="button"
                              onClick={convertManualHtmlToSections}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold hover:bg-indigo-500/20 cursor-pointer"
                            >
                              {t('Convert HTML to Sections')}
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              updateField('customHtml', compilePostSectionsToHtml(editingPost));
                              updateField('useCustomHtml', true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold cursor-pointer"
                          >
                            {t('Edit Manually in HTML')}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleCopyArticleHtml}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          {htmlCopied ? <TbCheck size={13} className="text-emerald-500" /> : <TbCopy size={13} />}
                          <span>{htmlCopied ? t('Copied') : t('Copy HTML')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadHtml}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          <TbDownload size={13} />
                          <span>.HTML</span>
                        </button>
                      </div>
                    </div>

                    {/* Split Code + HTML/CSS Viewer Workspace */}
                    <div
                      className={`grid rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 ${
                        htmlViewerPaneMode === 'split'
                          ? 'grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800'
                          : 'grid-cols-1'
                      }`}
                    >
                      {(htmlViewerPaneMode === 'split' || htmlViewerPaneMode === 'code') && (
                        <div className="flex flex-col bg-slate-950 min-h-[420px]">
                          <div className="px-3 sm:px-4 py-2 text-[11px] font-mono font-bold text-slate-400 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setHtmlCodeSubTab('html')}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase cursor-pointer ${
                                  htmlCodeSubTab === 'html'
                                    ? 'bg-[#29aaea] text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                HTML {isManual ? '' : '(Compiled)'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setHtmlCodeSubTab('css')}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase cursor-pointer ${
                                  htmlCodeSubTab === 'css'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                Custom CSS {(editingPost.customCss || '').trim() ? '●' : ''}
                              </button>
                            </div>
                            <span className="tabular-nums">
                              {htmlCodeSubTab === 'html'
                                ? `${activeHtml.length} chars`
                                : `${(editingPost.customCss || '').length} chars`}
                            </span>
                          </div>

                          {htmlCodeSubTab === 'html' ? (
                            <textarea
                              ref={fullHtmlTextareaRef}
                              dir="ltr"
                              readOnly={!isManual}
                              value={activeHtml}
                              onChange={(e) => {
                                if (isManual) updateField('customHtml', e.target.value);
                              }}
                              placeholder="<style>&#10;  .hero-note { padding: 16px; border-radius: 12px; }&#10;</style>&#10;<h2>Introduction</h2>&#10;<p>Write your complete article HTML + CSS here...</p>"
                              className="w-full flex-1 min-h-[380px] bg-slate-950 text-sky-300 font-mono text-xs leading-relaxed p-4 focus:outline-none resize-y"
                            />
                          ) : (
                            <textarea
                              dir="ltr"
                              value={editingPost.customCss || ''}
                              onChange={(e) => updateField('customCss', e.target.value)}
                              placeholder="/* Scoped automatically to this article */&#10;.sa-callout-card {&#10;  padding: 16px;&#10;  border-radius: 14px;&#10;  border: 1px solid rgba(41,170,234,0.35);&#10;}"
                              className="w-full flex-1 min-h-[380px] bg-slate-950 text-emerald-300 font-mono text-xs leading-relaxed p-4 focus:outline-none resize-y"
                            />
                          )}
                        </div>
                      )}

                      {(htmlViewerPaneMode === 'split' || htmlViewerPaneMode === 'viewer') && (
                        <div className="flex flex-col bg-white dark:bg-[#0b101b] min-h-[420px]">
                          <div className="px-4 py-2 text-[11px] font-mono font-bold text-indigo-500 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <span>{t('Live HTML Viewer')} (HTML + CSS)</span>
                            <span className="text-[10px] text-slate-400">Scoped</span>
                          </div>
                          <div className="p-4 sm:p-5 max-h-[560px] overflow-auto">
                            {activeHtml.trim() || editingPost.customCss?.trim() ? (
                              <ScopedHtmlViewer
                                html={activeHtml}
                                css={editingPost.customCss || ''}
                                scopeKey={editingPost.id || 'studio-full-viewer'}
                              />
                            ) : (
                              <div className="text-xs text-slate-400 italic py-8 text-center">
                                {t('HTML output preview will render here.')}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* RIGHT STICKY AUTOMATIC SEO PROGRESS TRACKER */}
          {seoAnalysis && (
            <aside className="xl:sticky xl:top-24 rounded-2xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    {t('Live SEO Progress')}
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {t(seoAnalysis.grade)}
                  </div>
                </div>

                {/* Radial Progress Ring */}
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 88 88">
                    <circle
                      cx="44"
                      cy="44"
                      r="36"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="7"
                      className="text-slate-100 dark:text-slate-800"
                    />
                    <circle
                      cx="44"
                      cy="44"
                      r="36"
                      fill="none"
                      stroke={ringStrokeColor}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringDashOffset}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <span className="absolute text-base font-mono font-black text-slate-900 dark:text-white tabular-nums">
                    {seoAnalysis.score}%
                  </span>
                </div>
              </div>

              {/* Live Telemetry Counters */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                  <div className="text-sm font-mono font-black text-slate-900 dark:text-white tabular-nums">
                    {seoAnalysis.wordCount}
                  </div>
                  <div className="text-[10px] text-slate-500">{t('Words')}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                  <div className="text-sm font-mono font-black text-slate-900 dark:text-white tabular-nums">
                    {seoAnalysis.h2Count}/{seoAnalysis.h3Count}
                  </div>
                  <div className="text-[10px] text-slate-500">H2 / H3</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                  <div className="text-sm font-mono font-black text-slate-900 dark:text-white tabular-nums">
                    {seoAnalysis.imagesWithAltCount}/{seoAnalysis.imageCount}
                  </div>
                  <div className="text-[10px] text-slate-500">{t('Alt Tags')}</div>
                </div>
              </div>

              {/* Actionable SEO Checklist */}
              <div className="space-y-2 max-h-[420px] overflow-y-auto pe-1">
                {seoAnalysis.checks.map((chk) => (
                  <button
                    key={chk.id}
                    type="button"
                    onClick={() => {
                      if (chk.targetSection && EDITOR_TABS.some((et) => et.id === chk.targetSection)) {
                        setActiveEditorTab(chk.targetSection as EditorTabId);
                      }
                    }}
                    className="w-full text-start p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/70 dark:border-slate-800 transition-colors flex items-start gap-2.5 cursor-pointer"
                  >
                    <span className="mt-0.5 shrink-0">
                      {chk.status === 'pass' ? (
                        <TbCircleCheck size={16} className="text-emerald-500" />
                      ) : chk.status === 'warn' ? (
                        <TbAlertCircle size={16} className="text-amber-500" />
                      ) : (
                        <TbAlertTriangle size={16} className="text-rose-500" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {chk.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 tabular-nums shrink-0">
                          {chk.points}/{chk.maxPoints}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                        {chk.hint}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Technical SEO Auto-Generation Summary */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <div className="font-bold text-slate-700 dark:text-slate-300">
                  {t('15. Technical SEO (Auto-Injected)')}
                </div>
                <p>
                  BlogPosting JSON-LD · BreadcrumbList · FAQPage · HowTo · Open Graph · Twitter Card
                </p>
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBlogManager;
