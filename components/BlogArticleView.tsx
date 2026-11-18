import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TbHome,
  TbChevronRight,
  TbCalendar,
  TbRefresh,
  TbClock,
  TbBulb,
  TbListDetails,
  TbChevronUp,
  TbChevronDown,
  TbCheck,
  TbX,
  TbPlus,
  TbMinus,
  TbExternalLink,
  TbShare,
  TbCopy,
  TbFlame,
  TbBookmark,
  TbTag,
  TbBook,
  TbEdit,
  TbDeviceGamepad2,
  TbShoppingCart,
  TbStarFilled,
} from 'react-icons/tb';
import { SiPlaystation, SiSteam, SiEpicgames, SiGogdotcom } from 'react-icons/si';
import { FaAmazon, FaXbox } from 'react-icons/fa';
import {
  BlogPost,
  BlogReviewBreakdown,
  BlogStorePlatform,
  HeadingLevel,
  getComparisonRowCells,
  resolveArticleFlowOrder,
  slugifyBlogTitle,
} from '../src/types/blog';
import { BlogBlockRenderer, ResilientBlogImage } from './BlogBlockRenderer';
import { BlogMenuBar, CategoryIconBadge } from './BlogMenuBar';
import { useLanguage } from '../src/contexts/LanguageContext';
import Icon from './Icon';

interface TocEntry {
  id: string;
  label: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

interface BlogArticleViewProps {
  post: BlogPost;
  allPosts?: BlogPost[];
  isPreview?: boolean;
  isAdmin?: boolean;
  onEditClick?: () => void;
}

function formatReadableDate(iso: string | undefined, lang: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const locale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US';
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function getScoreVisual(score: number | null) {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return {
      isEmpty: true,
      badgeClass:
        'border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-slate-900/60',
      textClass: 'text-slate-600 dark:text-slate-300',
      defaultVerdict: 'No reviews yet',
    };
  }
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  if (clamped >= 85) {
    return {
      isEmpty: false,
      badgeClass:
        'bg-emerald-500 border-2 border-emerald-500 text-white shadow-md shadow-emerald-500/25',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      defaultVerdict: 'Universal Acclaim',
    };
  }
  if (clamped >= 45) {
    return {
      isEmpty: false,
      badgeClass:
        'bg-amber-500 border-2 border-amber-500 text-white shadow-md shadow-amber-500/25',
      textClass: 'text-amber-600 dark:text-amber-400',
      defaultVerdict: 'Mixed or Favorable',
    };
  }
  return {
    isEmpty: false,
    badgeClass:
      'bg-rose-500 border-2 border-rose-500 text-white shadow-md shadow-rose-500/25',
    textClass: 'text-rose-600 dark:text-rose-400',
    defaultVerdict: 'Unfavorable',
  };
}

function renderPlatformBrandIcon(platform: BlogStorePlatform) {
  switch (platform) {
    case 'playstation':
      return <SiPlaystation size={20} className="shrink-0" />;
    case 'xbox':
      return <FaXbox size={18} className="shrink-0" />;
    case 'steam':
      return <SiSteam size={18} className="shrink-0" />;
    case 'epic':
      return <SiEpicgames size={18} className="shrink-0" />;
    case 'gog':
      return <SiGogdotcom size={18} className="shrink-0" />;
    case 'amazon':
      return <FaAmazon size={18} className="shrink-0" />;
    case 'nintendo':
      return <TbDeviceGamepad2 size={20} className="shrink-0" />;
    default:
      return <TbShoppingCart size={18} className="shrink-0" />;
  }
}

export const BlogArticleView: React.FC<BlogArticleViewProps> = ({
  post,
  allPosts = [],
  isPreview = false,
  isAdmin = false,
  onEditClick,
}) => {
  const { t, dir, language } = useLanguage();
  const [tocOpen, setTocOpen] = useState(true);
  const [openFaqIndices, setOpenFaqIndices] = useState<Record<number, boolean>>({ 0: true });
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Apply localized translation overrides if available for current UI language
  const localized = post.translations?.[language];
  const displayTitle = localized?.title?.trim() || post.title || t('Untitled Article');
  const displayIntro = localized?.introduction?.trim() || post.introduction || '';
  const displayQuickAnswer = localized?.quickAnswer?.trim() || post.quickAnswer || '';
  const displayConclusion = localized?.conclusion?.trim() || post.conclusion || '';

  const flowOrder = useMemo(() => resolveArticleFlowOrder(post), [post]);

  // Build Table of Contents dynamically in exact configured flow order
  const tocEntries = useMemo<TocEntry[]>(() => {
    const entries: TocEntry[] = [];
    const sectionById = new Map((post.sections || []).map((s, idx) => [`sec:${s.id}`, { section: s, idx }]));

    flowOrder.forEach((token) => {
      if (token.startsWith('sec:')) {
        const match = sectionById.get(token);
        if (!match) return;
        const { section: sec, idx } = match;
        if (sec.heading?.trim()) {
          entries.push({
            id: `sec-${slugifyBlogTitle(sec.heading, sec.id || String(idx))}`,
            label: sec.heading.trim(),
            level: (sec.headingLevel ?? 2) as HeadingLevel,
          });
        }
        (sec.blocks || []).forEach((blk) => {
          if (blk.type === 'subheading' && blk.text?.trim()) {
            const lvl = blk.level ?? 3;
            if (lvl <= 5) {
              entries.push({
                id: `sub-${slugifyBlogTitle(blk.text, blk.id)}`,
                label: blk.text.trim(),
                level: lvl,
              });
            }
          }
        });
      } else if (token === 'mod:comparison' && post.comparisonTable?.enabled && post.comparisonTable.columns?.length > 0) {
        entries.push({
          id: 'comparison-table',
          label: post.comparisonTable.title || t('Comparison Table'),
          level: 2,
        });
      } else if (
        token === 'mod:pros_cons' &&
        post.prosCons?.enabled &&
        ((post.prosCons.pros || []).some(Boolean) || (post.prosCons.cons || []).some(Boolean))
      ) {
        entries.push({
          id: 'pros-and-cons',
          label: post.prosCons.title || t('Pros & Cons'),
          level: 2,
        });
      } else if (
        token === 'mod:steps' &&
        post.stepByStep?.enabled &&
        (post.stepByStep.steps || []).some((s) => s.title?.trim() || s.description?.trim())
      ) {
        entries.push({
          id: 'step-by-step-guide',
          label: post.stepByStep.title || t('Step-by-Step Guide'),
          level: 2,
        });
      } else if (token === 'mod:reviews' && post.metacriticReviews?.enabled) {
        entries.push({
          id: 'reviews-scores',
          label: post.metacriticReviews.title || t('Reviews & Scores'),
          level: 2,
        });
      } else if (token === 'mod:where_to_buy' && post.whereToBuy?.enabled && (post.whereToBuy.offers || []).length > 0) {
        entries.push({
          id: 'where-to-buy',
          label: post.whereToBuy.title || t('Where to Buy'),
          level: 2,
        });
      } else if (token === 'mod:faq' && (post.faqs || []).some((f) => f.question?.trim() && f.answer?.trim())) {
        entries.push({
          id: 'faq-section',
          label: t('FAQ Section'),
          level: 2,
        });
      }
    });

    if (displayConclusion.trim()) {
      entries.push({
        id: 'conclusion-section',
        label: post.conclusionTitle || t('Conclusion'),
        level: 2,
      });
    }
    if ((post.sources || []).some((s) => s.label?.trim() && s.url?.trim())) {
      entries.push({
        id: 'sources-references',
        label: t('Sources & References'),
        level: 2,
      });
    }
    return entries;
  }, [post, flowOrder, displayConclusion, t]);

  // Related Articles: prioritize manual relatedSlugs, then same category, then latest
  const relatedPosts = useMemo(() => {
    const published = allPosts.filter((p) => p.status === 'published' && p.slug !== post.slug);
    const manualSet = new Set(post.relatedSlugs || []);
    const manual = published.filter((p) => manualSet.has(p.slug));
    const sameCategory = published.filter(
      (p) => !manualSet.has(p.slug) && p.category?.toLowerCase() === post.category?.toLowerCase()
    );
    const others = published.filter(
      (p) => !manualSet.has(p.slug) && p.category?.toLowerCase() !== post.category?.toLowerCase()
    );
    return [...manual, ...sameCategory, ...others].slice(0, 3);
  }, [allPosts, post.slug, post.category, post.relatedSlugs]);

  const popularPosts = useMemo(() => {
    return allPosts
      .filter((p) => p.status === 'published' && p.slug !== post.slug)
      .slice()
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 3);
  }, [allPosts, post.slug]);

  const scrollToAnchor = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCopyUrl = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : post.canonicalUrl;
      await navigator.clipboard.writeText(url || '');
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  let runningSectionCounter = 0;

  return (
    <article
      dir={dir}
      className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 sm:pb-16 text-slate-900 dark:text-slate-100"
    >
      {/* Dedicated Blog Navigation Bar with Dropdowns, Mega Menu & Smart Search */}
      {!isPreview && (
        <div className="mb-5 sm:mb-6">
          <BlogMenuBar
            posts={allPosts}
            selectedCategory={post.category || 'All'}
            selectedSubCategory={post.subCategory || ''}
          />
        </div>
      )}

      {/* Main Article Shell Card matching SecretArea clean elevated surfaces */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#111623] border border-slate-200/90 dark:border-slate-800/90 shadow-xl shadow-slate-200/40 dark:shadow-black/40 p-4 sm:p-7 lg:p-10">
        {/* 2. ARTICLE HEADER: Breadcrumb + Edit Shortcut */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <Link to="/" className="inline-flex items-center gap-1 hover:text-[#29aaea] transition-colors font-medium">
              <TbHome size={15} />
              <span>{t('Home')}</span>
            </Link>
            <TbChevronRight size={14} className={dir === 'rtl' ? 'rotate-180 opacity-60' : 'opacity-60'} />
            <Link to="/blog" className="hover:text-[#29aaea] transition-colors font-medium">
              {t('Blog')}
            </Link>
            {post.category && (
              <>
                <TbChevronRight size={14} className={dir === 'rtl' ? 'rotate-180 opacity-60' : 'opacity-60'} />
                <Link
                  to={`/blog?category=${encodeURIComponent(post.category)}`}
                  className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  <CategoryIconBadge iconUrl={post.categoryIconUrl} sizeClass="w-3.5 h-3.5" fallbackSize={13} />
                  <span>{post.category}</span>
                </Link>
              </>
            )}
            {post.subCategory && (
              <>
                <TbChevronRight size={14} className={dir === 'rtl' ? 'rotate-180 opacity-60' : 'opacity-60'} />
                <Link
                  to={`/blog?category=${encodeURIComponent(post.category || '')}&sub=${encodeURIComponent(post.subCategory)}`}
                  className="text-[#29aaea] font-semibold hover:underline"
                >
                  {post.subCategory}
                </Link>
              </>
            )}
          </nav>

          {isAdmin && !isPreview && (
            <div className="flex items-center gap-2">
              {onEditClick ? (
                <button
                  type="button"
                  onClick={onEditClick}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#29aaea]/15 text-slate-700 dark:text-slate-200 hover:text-[#29aaea] text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <TbEdit size={14} />
                  <span>{t('Edit Article')}</span>
                </button>
              ) : (
                <Link
                  to={`/admin?tab=blog&edit=${encodeURIComponent(post.id || post.slug)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#29aaea]/15 text-slate-700 dark:text-slate-200 hover:text-[#29aaea] text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <TbEdit size={14} />
                  <span>{t('Edit Article')}</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Hero Header: Category -> Title -> Intro -> Featured Image ABOVE Author Info */}
        <header className="space-y-5 sm:space-y-6 mb-8 sm:mb-10">
          <div className="space-y-3 sm:space-y-4">
            {post.category && (
              <div className="inline-flex items-center gap-2 flex-wrap text-xs font-extrabold uppercase tracking-[0.16em] text-[#29aaea]">
                <span className="inline-flex items-center gap-1.5">
                  <CategoryIconBadge iconUrl={post.categoryIconUrl} sizeClass="w-4 h-4" fallbackSize={14} />
                  <span>{post.category}</span>
                </span>
                {post.subCategory && (
                  <>
                    <TbChevronRight size={13} className={`opacity-60 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                    <span className="text-indigo-500 dark:text-indigo-400">{post.subCategory}</span>
                  </>
                )}
              </div>
            )}

            <h1
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.65rem] font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-4xl"
              style={{ textWrap: 'balance' }}
            >
              {displayTitle}
            </h1>

            {displayIntro && (
              <p className="text-sm sm:text-base lg:text-[17px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                {displayIntro}
              </p>
            )}
          </div>

          {/* Featured Image positioned ABOVE Author Info */}
          <ResilientBlogImage
            src={post.featuredImage}
            alt={post.featuredImageAlt || displayTitle}
            aspectClass="aspect-[16/9] sm:aspect-[21/9]"
            className="shadow-lg"
          />

          {/* Author & Dates Metadata Bar cleanly below Featured Image */}
          <div className="pt-1 pb-2 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-2.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2.5">
              <img
                src={post.authorAvatar || '/images/logo04.png'}
                alt={post.authorName || 'Author'}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/logo04.png';
                }}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0"
              />
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  {post.authorName || 'SecretArea Team'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {post.authorRole || t('Author')}
                </div>
              </div>
            </div>

            <span className="hidden sm:inline text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>

            {post.publishedAt && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <TbCalendar size={15} className="text-slate-400 shrink-0" />
                <span>
                  <span className="text-slate-400 me-1">{t('Published')}:</span>
                  <strong className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                    {formatReadableDate(post.publishedAt, language)}
                  </strong>
                </span>
              </div>
            )}

            {post.updatedAt && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <TbRefresh size={15} className="text-slate-400 shrink-0" />
                <span>
                  <span className="text-slate-400 me-1">{t('Updated')}:</span>
                  <strong className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                    {formatReadableDate(post.updatedAt, language)}
                  </strong>
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <TbClock size={15} className="text-[#29aaea] shrink-0" />
              <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                {post.readingTimeMinutes || 5} {t('min read')}
              </span>
            </div>
          </div>
        </header>

        {/* Main 2-Column Body + Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px] gap-7 lg:gap-10 items-start">
          {/* LEFT MAIN ARTICLE BODY */}
          <div className="min-w-0 space-y-7 sm:space-y-8">
            {/* 3. QUICK ANSWER */}
            {displayQuickAnswer && (
              <section
                aria-label="Quick Answer"
                className="rounded-2xl bg-gradient-to-br from-indigo-50/90 via-sky-50/70 to-white dark:from-indigo-950/35 dark:via-[#141b2d] dark:to-[#111623] border border-indigo-200/80 dark:border-indigo-500/30 p-5 sm:p-6 shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 dark:bg-indigo-500/25 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <TbBulb size={22} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mb-1.5">
                      {post.quickAnswerTitle || t('Quick Answer')}
                    </h2>
                    <p className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-200 leading-relaxed">
                      {displayQuickAnswer}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* 4. TABLE OF CONTENTS */}
            {post.showToc !== false && tocEntries.length > 0 && (
              <nav
                aria-label="Table of Contents"
                className="rounded-2xl bg-slate-50/80 dark:bg-[#0d121e] border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setTocOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-5 py-4 text-start hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <TbListDetails size={20} className="text-indigo-500 dark:text-indigo-400" />
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {t('Table of Contents')}
                    </span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400">
                    {tocOpen ? <TbChevronUp size={18} /> : <TbChevronDown size={18} />}
                  </span>
                </button>

                {tocOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-200/70 dark:border-slate-800/70">
                    <ol className="space-y-2 mt-3">
                      {(() => {
                        let topIdx = 0;
                        return tocEntries.map((entry) => {
                          const isTopLevel = entry.level <= 2;
                          if (isTopLevel) topIdx += 1;
                          const indentClass =
                            entry.level <= 2
                              ? ''
                              : entry.level === 3
                              ? 'ps-6'
                              : entry.level === 4
                              ? 'ps-10'
                              : 'ps-14';
                          return (
                            <li
                              key={entry.id}
                              className={indentClass}
                            >
                              <button
                                type="button"
                                onClick={() => scrollToAnchor(entry.id)}
                                className={`text-start text-sm transition-colors hover:text-[#29aaea] flex items-baseline gap-2.5 cursor-pointer ${
                                  isTopLevel
                                    ? 'font-semibold text-slate-800 dark:text-slate-200'
                                    : 'font-normal text-slate-500 dark:text-slate-400 text-xs sm:text-sm'
                                }`}
                              >
                                {isTopLevel ? (
                                  <span className="text-xs font-mono font-bold text-indigo-500 dark:text-indigo-400 tabular-nums shrink-0">
                                    {topIdx}.
                                  </span>
                                ) : (
                                  <span className="text-slate-400 shrink-0">–</span>
                                )}
                                <span>{entry.label}</span>
                              </button>
                            </li>
                          );
                        });
                      })()}
                    </ol>
                  </div>
                )}
              </nav>
            )}

            {/* 5–10. FLEXIBLE ORDERED MAIN SECTIONS & MODULAR BLOCKS */}
            <div className="space-y-10">
              {flowOrder.map((token) => {
                // Main Content Section ('sec:<id>')
                if (token.startsWith('sec:')) {
                  const sIdx = (post.sections || []).findIndex((s) => `sec:${s.id}` === token);
                  if (sIdx === -1) return null;
                  const section = post.sections[sIdx];
                  if (!section.heading?.trim() && (!section.blocks || section.blocks.length === 0)) {
                    return null;
                  }
                  const secLevel: HeadingLevel = section.headingLevel ?? 2;
                  const isMajorSection = secLevel <= 2;
                  if (isMajorSection) {
                    runningSectionCounter += 1;
                  }
                  const secNum = runningSectionCounter;
                  const secAnchor = `sec-${slugifyBlogTitle(section.heading || `section-${sIdx + 1}`, section.id)}`;
                  const HeadingTag = `h${secLevel}` as keyof React.JSX.IntrinsicElements;
                  const headingSizeClass =
                    secLevel === 1
                      ? 'text-2xl sm:text-3xl font-black pb-2.5 border-b border-slate-200 dark:border-slate-800'
                      : secLevel === 2
                      ? 'text-xl sm:text-2xl font-black pb-2 border-b border-slate-100 dark:border-slate-800/80'
                      : secLevel === 3
                      ? 'text-lg sm:text-xl font-extrabold'
                      : secLevel === 4
                      ? 'text-base sm:text-lg font-extrabold'
                      : secLevel === 5
                      ? 'text-sm sm:text-base font-bold'
                      : 'text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300';

                  return (
                    <section key={section.id || sIdx} id={secAnchor} className="scroll-mt-24">
                      {section.heading?.trim() && (
                        <HeadingTag
                          className={`flex items-center gap-3 text-slate-900 dark:text-white tracking-tight mb-4 ${headingSizeClass}`}
                        >
                          {isMajorSection ? (
                            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-[#29aaea] text-white text-xs font-mono font-black flex items-center justify-center shrink-0 tabular-nums shadow-sm">
                              {secNum}
                            </span>
                          ) : (
                            <span className="w-1.5 h-5 rounded-full bg-[#29aaea] shrink-0" />
                          )}
                          <span>{section.heading}</span>
                        </HeadingTag>
                      )}

                      <div className="space-y-2">
                        {(section.blocks || []).map((blk, bIdx) => (
                          <BlogBlockRenderer key={blk.id || bIdx} block={blk} sectionIndex={sIdx} />
                        ))}
                      </div>
                    </section>
                  );
                }

                // 6. COMPARISON TABLE
                if (token === 'mod:comparison') {
                  if (!post.comparisonTable?.enabled || !(post.comparisonTable.columns?.length > 0)) return null;
                  runningSectionCounter += 1;
                  return (
                    <section key="mod:comparison" id="comparison-table" className="scroll-mt-24 pt-2">
                      <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-[#29aaea] text-white text-xs font-mono font-black flex items-center justify-center shrink-0 tabular-nums shadow-sm">
                          {runningSectionCounter}
                        </span>
                        <span>{post.comparisonTable.title || t('Comparison Table')}</span>
                      </h2>

                      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d121e]">
                        <table className="w-full text-start border-collapse text-sm">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
                              {post.comparisonTable.columns.map((col, idx) => (
                                <th
                                  key={idx}
                                  className="px-4 py-3.5 text-start font-bold text-slate-900 dark:text-white whitespace-nowrap"
                                >
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                            {(post.comparisonTable.rows || []).map((row, rIdx) => {
                              const cells = getComparisonRowCells(row);
                              return (
                                <tr
                                  key={rIdx}
                                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                                >
                                  {post.comparisonTable.columns.map((_, cIdx) => (
                                    <td
                                      key={cIdx}
                                      className={`px-4 py-3 text-slate-700 dark:text-slate-300 tabular-nums ${
                                        cIdx === 0 ? 'font-semibold text-slate-900 dark:text-white' : ''
                                      }`}
                                    >
                                      {cells[cIdx] || '—'}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  );
                }

                // 8. PROS & CONS
                if (token === 'mod:pros_cons') {
                  if (
                    !post.prosCons?.enabled ||
                    (!(post.prosCons.pros || []).some(Boolean) && !(post.prosCons.cons || []).some(Boolean))
                  ) {
                    return null;
                  }
                  runningSectionCounter += 1;
                  return (
                    <section key="mod:pros_cons" id="pros-and-cons" className="scroll-mt-24 pt-2">
                      <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-[#29aaea] text-white text-xs font-mono font-black flex items-center justify-center shrink-0 tabular-nums shadow-sm">
                          {runningSectionCounter}
                        </span>
                        <span>{post.prosCons.title || t('Pros & Cons')}</span>
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 p-5">
                          <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                            <TbCheck size={18} />
                            <span>{t('Pros')}</span>
                          </h3>
                          <ul className="space-y-2.5">
                            {(post.prosCons.pros || [])
                              .filter((item) => item?.trim())
                              .map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                    <TbCheck size={12} />
                                  </span>
                                  <span>{item}</span>
                                </li>
                              ))}
                          </ul>
                        </div>

                        <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-950/20 p-5">
                          <h3 className="text-sm font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-2">
                            <TbX size={18} />
                            <span>{t('Cons')}</span>
                          </h3>
                          <ul className="space-y-2.5">
                            {(post.prosCons.cons || [])
                              .filter((item) => item?.trim())
                              .map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                                    <TbX size={12} />
                                  </span>
                                  <span>{item}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    </section>
                  );
                }

                // 9. STEP-BY-STEP GUIDE
                if (token === 'mod:steps') {
                  if (
                    !post.stepByStep?.enabled ||
                    !(post.stepByStep.steps || []).some((s) => s.title?.trim() || s.description?.trim())
                  ) {
                    return null;
                  }
                  runningSectionCounter += 1;
                  return (
                    <section key="mod:steps" id="step-by-step-guide" className="scroll-mt-24 pt-2">
                      <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-5">
                        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-[#29aaea] text-white text-xs font-mono font-black flex items-center justify-center shrink-0 tabular-nums shadow-sm">
                          {runningSectionCounter}
                        </span>
                        <span>{post.stepByStep.title || t('Step-by-Step Guide')}</span>
                      </h2>

                      <div className="space-y-4">
                        {(post.stepByStep.steps || [])
                          .filter((s) => s.title?.trim() || s.description?.trim())
                          .map((step, idx) => (
                            <div
                              key={step.id || idx}
                              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0d121e] p-5 flex items-start gap-4"
                            >
                              <div className="w-8 h-8 rounded-full bg-[#29aaea] text-white font-mono font-black text-sm flex items-center justify-center shrink-0 tabular-nums shadow-sm">
                                {idx + 1}
                              </div>
                              <div className="min-w-0 flex-1 space-y-2">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                  {step.title}
                                </h3>
                                {step.description && (
                                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {step.description}
                                  </p>
                                )}
                                {step.tip && (
                                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg">
                                    <TbBulb size={14} className="shrink-0" />
                                    <span>{step.tip}</span>
                                  </div>
                                )}
                                {step.imageUrl && (
                                  <div className="pt-2">
                                    <ResilientBlogImage
                                      src={step.imageUrl}
                                      alt={step.imageAlt || step.title || `Step ${idx + 1}`}
                                      aspectClass="aspect-video"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </section>
                  );
                }

                // METACRITIC-STYLE REVIEWS & SCORES
                if (token === 'mod:reviews') {
                  if (!post.metacriticReviews?.enabled) return null;
                  runningSectionCounter += 1;
                  return (
                    <section key="mod:reviews" id="reviews-scores" className="scroll-mt-24 pt-2">
                      <h2 className="flex items-center gap-2.5 sm:gap-3 text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4 sm:mb-5">
                        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-[#29aaea] text-white text-xs font-mono font-black flex items-center justify-center shrink-0 tabular-nums shadow-sm">
                          {runningSectionCounter}
                        </span>
                        <span>{post.metacriticReviews.title || t('Reviews & Scores')}</span>
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {([
                          {
                            kind: 'critic' as const,
                            heading: t('Critic Reviews'),
                            scoreLabel: t('Critic Score'),
                            unitLabel: t('Reviews'),
                            roundedClass: 'rounded-2xl',
                            emptyText: t('Critic reviews are not available yet'),
                            data: post.metacriticReviews.critic,
                          },
                          {
                            kind: 'user' as const,
                            heading: t('User Reviews'),
                            scoreLabel: t('User Score'),
                            unitLabel: t('Ratings'),
                            roundedClass: 'rounded-full',
                            emptyText: t('User reviews are not available yet'),
                            data: post.metacriticReviews.user,
                          },
                        ] satisfies Array<{
                          kind: 'critic' | 'user';
                          heading: string;
                          scoreLabel: string;
                          unitLabel: string;
                          roundedClass: string;
                          emptyText: string;
                          data: BlogReviewBreakdown;
                        }>).map((panel) => {
                          const pos = Math.max(0, Number(panel.data?.positiveCount || 0));
                          const mix = Math.max(0, Number(panel.data?.mixedCount || 0));
                          const neg = Math.max(0, Number(panel.data?.negativeCount || 0));
                          const total = pos + mix + neg;
                          const posPct = total > 0 ? Math.round((pos / total) * 100) : 0;
                          const mixPct = total > 0 ? Math.round((mix / total) * 100) : 0;
                          const negPct = total > 0 ? Math.max(0, 100 - posPct - mixPct) : 0;

                          const hasManualScore =
                            typeof panel.data?.score === 'number' && !Number.isNaN(panel.data.score);
                          const effectiveScore = hasManualScore
                            ? Math.round(panel.data.score as number)
                            : total > 0
                            ? Math.round(((pos + mix * 0.5) / total) * 100)
                            : null;

                          const visual = getScoreVisual(effectiveScore);
                          const summary = panel.data?.summaryText?.trim()
                            ? panel.data.summaryText
                            : visual.isEmpty
                            ? panel.emptyText
                            : t(visual.defaultVerdict);

                          return (
                            <div
                              key={panel.kind}
                              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0d121e] p-4 sm:p-5 space-y-4 min-w-0"
                            >
                              <div className="pb-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                                  {panel.heading}
                                </h3>
                                <TbStarFilled size={16} className={`${visual.textClass} shrink-0`} />
                              </div>

                              <div className="flex items-center justify-between gap-3 sm:gap-4">
                                <div className="min-w-0 space-y-1">
                                  <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                    {panel.scoreLabel}
                                  </div>
                                  <div
                                    className={`text-xs sm:text-sm font-bold leading-snug ${
                                      visual.isEmpty ? 'text-slate-700 dark:text-slate-200' : visual.textClass
                                    }`}
                                  >
                                    {summary}
                                  </div>
                                </div>

                                <div
                                  className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center font-black text-xl sm:text-2xl tabular-nums ${panel.roundedClass} ${visual.badgeClass}`}
                                >
                                  {visual.isEmpty ? '--' : effectiveScore}
                                </div>
                              </div>

                              {/* Segmented Progress Bar + Single-Line Breakdown */}
                              <div className="space-y-3 pt-1">
                                <div className="h-2.5 w-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex">
                                  {total > 0 && (
                                    <>
                                      {pos > 0 && (
                                        <div
                                          style={{ width: `${(pos / total) * 100}%` }}
                                          className="bg-emerald-500 h-full transition-all"
                                        />
                                      )}
                                      {mix > 0 && (
                                        <div
                                          style={{ width: `${(mix / total) * 100}%` }}
                                          className="bg-amber-500 h-full transition-all"
                                        />
                                      )}
                                      {neg > 0 && (
                                        <div
                                          style={{ width: `${(neg / total) * 100}%` }}
                                          className="bg-rose-500 h-full transition-all"
                                        />
                                      )}
                                    </>
                                  )}
                                </div>

                                <div className="grid grid-cols-3 divide-x rtl:divide-x-reverse divide-slate-200 dark:divide-slate-800 text-center">
                                  <div className="px-1 min-w-0 flex flex-col items-center">
                                    <div className="text-[10px] sm:text-[11px] font-extrabold tabular-nums whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                                      {posPct}% {t('Positive')}
                                    </div>
                                    <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap mt-0.5">
                                      {pos} {panel.unitLabel}
                                    </div>
                                  </div>
                                  <div className="px-1 min-w-0 flex flex-col items-center">
                                    <div className="text-[10px] sm:text-[11px] font-extrabold tabular-nums whitespace-nowrap text-amber-600 dark:text-amber-400">
                                      {mixPct}% {t('Mixed')}
                                    </div>
                                    <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap mt-0.5">
                                      {mix} {panel.unitLabel}
                                    </div>
                                  </div>
                                  <div className="px-1 min-w-0 flex flex-col items-center">
                                    <div className="text-[10px] sm:text-[11px] font-extrabold tabular-nums whitespace-nowrap text-rose-600 dark:text-rose-400">
                                      {negPct}% {t('Negative')}
                                    </div>
                                    <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap mt-0.5">
                                      {neg} {panel.unitLabel}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                }

                // WHERE TO BUY / ALL PLATFORMS AFFILIATE LINKS
                if (token === 'mod:where_to_buy') {
                  if (!post.whereToBuy?.enabled || !(post.whereToBuy.offers || []).length) return null;
                  runningSectionCounter += 1;
                  const offers = post.whereToBuy.offers || [];
                  const collapseLimit = Math.max(1, Number(post.whereToBuy.collapseAfter || 2));
                  const hasHiddenOffers = offers.length > collapseLimit;
                  const visibleOffers = showAllOffers || !hasHiddenOffers ? offers : offers.slice(0, collapseLimit);

                  return (
                    <section key="mod:where_to_buy" id="where-to-buy" className="scroll-mt-24 pt-2">
                      <h2 className="flex items-center gap-2.5 sm:gap-3 text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-[#29aaea] text-white text-xs font-mono font-black flex items-center justify-center shrink-0 tabular-nums shadow-sm">
                          {runningSectionCounter}
                        </span>
                        <span>{post.whereToBuy.title || t('Where to Buy')}</span>
                      </h2>

                      <div className="space-y-2.5">
                        {visibleOffers.map((offer, idx) => {
                          const hasUrl = Boolean(offer.affiliateUrl?.trim());
                          const content = (
                            <div className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-[#1a2234] dark:hover:bg-[#232d45] border border-slate-700/80 dark:border-slate-700 px-3.5 sm:px-5 py-3 sm:py-3.5 text-white transition-all flex items-center justify-between gap-2.5 sm:gap-4 shadow-sm">
                              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 sm:min-w-[155px]">
                                <span className="text-white/95 shrink-0">
                                  {renderPlatformBrandIcon(offer.platform)}
                                </span>
                                <span className="text-[11px] sm:text-sm font-black uppercase tracking-wide whitespace-nowrap">
                                  {offer.platformLabel}
                                </span>
                              </div>

                              <div className="flex items-center justify-end sm:justify-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                                <span className="text-xs sm:text-sm md:text-base font-extrabold text-white tabular-nums whitespace-nowrap truncate">
                                  {offer.price || t('Check Price')}
                                  {offer.storeName?.trim() ? (
                                    <span className="font-semibold text-slate-200 ms-1">
                                      {t('on')} {offer.storeName}
                                    </span>
                                  ) : null}
                                </span>
                                {offer.badge?.trim() && (
                                  <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] sm:text-[11px] font-black tabular-nums shrink-0 whitespace-nowrap">
                                    {offer.badge}
                                  </span>
                                )}
                              </div>

                              <span className="text-slate-300 group-hover:text-white transition-colors shrink-0">
                                <TbExternalLink size={17} />
                              </span>
                            </div>
                          );

                          return hasUrl ? (
                            <a
                              key={offer.id || idx}
                              href={offer.affiliateUrl}
                              target="_blank"
                              rel="sponsored noopener noreferrer"
                              className="block group"
                            >
                              {content}
                            </a>
                          ) : (
                            <div key={offer.id || idx} className="opacity-85">
                              {content}
                            </div>
                          );
                        })}

                        {hasHiddenOffers && (
                          <button
                            type="button"
                            onClick={() => setShowAllOffers((prev) => !prev)}
                            className="w-full py-2.5 sm:py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-[#29aaea] text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span className="whitespace-nowrap">
                              {showAllOffers
                                ? t('Hide Extra Buy Options')
                                : `${t('View All Buy Options')} (${offers.length})`}
                            </span>
                            {showAllOffers ? <TbChevronUp size={16} /> : <TbChevronDown size={16} />}
                          </button>
                        )}
                      </div>
                    </section>
                  );
                }

                // 10. FAQ SECTION
                if (token === 'mod:faq') {
                  if (!(post.faqs || []).some((f) => f.question?.trim() && f.answer?.trim())) return null;
                  runningSectionCounter += 1;
                  return (
                    <section key="mod:faq" id="faq-section" className="scroll-mt-24 pt-2">
                      <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-[#29aaea] text-white text-xs font-mono font-black flex items-center justify-center shrink-0 tabular-nums shadow-sm">
                          {runningSectionCounter}
                        </span>
                        <span>{t('FAQ Section')}</span>
                      </h2>

                      <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0d121e] overflow-hidden">
                        {(post.faqs || [])
                          .filter((f) => f.question?.trim() && f.answer?.trim())
                          .map((faq, idx) => {
                            const isOpen = !!openFaqIndices[idx];
                            return (
                              <div key={faq.id || idx}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenFaqIndices((prev) => ({ ...prev, [idx]: !prev[idx] }))
                                  }
                                  aria-expanded={isOpen}
                                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-start hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                                >
                                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    {faq.question}
                                  </h3>
                                  <span className="w-7 h-7 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                                    {isOpen ? <TbMinus size={15} /> : <TbPlus size={15} />}
                                  </span>
                                </button>
                                {isOpen && (
                                  <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {faq.answer}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </section>
                  );
                }

                return null;
              })}
            </div>

            {/* 11. CONCLUSION */}
            {displayConclusion.trim() && (
              <section
                id="conclusion-section"
                className="scroll-mt-24 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-sky-50/60 dark:from-[#0d121e] dark:to-indigo-950/20 p-6"
              >
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3">
                  {post.conclusionTitle || t('Conclusion')}
                </h2>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  {displayConclusion}
                </p>
                {post.conclusionCtaLabel?.trim() && post.conclusionCtaUrl?.trim() && (
                  <div className="mt-5">
                    {post.conclusionCtaUrl.startsWith('/') ? (
                      <Link
                        to={post.conclusionCtaUrl}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#29aaea] to-indigo-600 text-white text-sm font-bold shadow-md shadow-sky-500/20 hover:brightness-110 transition-all"
                      >
                        <span>{post.conclusionCtaLabel}</span>
                      </Link>
                    ) : (
                      <a
                        href={post.conclusionCtaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#29aaea] to-indigo-600 text-white text-sm font-bold shadow-md shadow-sky-500/20 hover:brightness-110 transition-all"
                      >
                        <span>{post.conclusionCtaLabel}</span>
                        <TbExternalLink size={15} />
                      </a>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* 12. AUTHOR BIO */}
            {post.authorName?.trim() && (
              <section
                aria-label="Author Bio"
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d121e] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <img
                  src={post.authorAvatar || '/images/logo04.png'}
                  alt={post.authorName}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/logo04.png';
                  }}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#29aaea] mb-0.5">
                    {t('About the Author')}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {post.authorName}
                    </h3>
                    {post.authorRole && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        · {post.authorRole}
                      </span>
                    )}
                  </div>
                  {post.authorBio && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {post.authorBio}
                    </p>
                  )}
                </div>
              </section>
            )}

          </div>

          {/* RIGHT STICKY SIDEBAR: Share Article -> Explore SecretArea -> Sources & References -> Related -> Popular -> Tags */}
          <aside className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5 lg:gap-6 lg:sticky lg:top-24">
            {/* 1. Share Article */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0d121e] p-4 sm:p-5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                <TbShare size={15} className="text-[#29aaea]" />
                <span>{t('Share Article')}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#29aaea] text-xs font-bold text-slate-800 dark:text-slate-100 transition-colors cursor-pointer"
              >
                {copiedUrl ? (
                  <>
                    <TbCheck size={15} className="text-emerald-500" />
                    <span>{t('Link Copied!')}</span>
                  </>
                ) : (
                  <>
                    <TbCopy size={15} />
                    <span>{t('Copy Article URL')}</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Explore SecretArea */}
            <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-600/10 via-sky-500/10 to-transparent p-5">
              <div className="flex items-center gap-2.5 mb-2">
                <Icon name="Wolf" size={24} />
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {t('Explore SecretArea')}
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                {t('Access verified PC game repacks, PS5 releases, Hypervisor runtimes, and join our community.')}
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  to="/game"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#29aaea] to-indigo-600 text-white text-xs font-bold text-center hover:brightness-110 transition-all shadow-sm"
                >
                  {t('Browse Games Catalog')}
                </Link>
                <a
                  href="https://discord.gg/pygmDWFAHK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold text-center hover:border-[#5865F2] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Icon name="Discord" size={15} />
                  <span>{t('Join Our Discord')}</span>
                </a>
              </div>
            </div>

            {/* 3. Sources & References */}
            {(post.sources || []).some((s) => s.label?.trim() && s.url?.trim()) && (
              <section
                id="sources-references"
                className="scroll-mt-24 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0d121e] p-5"
              >
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <TbBook size={17} className="text-[#29aaea]" />
                  <span>{t('Sources & References')}</span>
                </h2>
                <ol className="space-y-2 list-decimal list-inside text-xs">
                  {(post.sources || [])
                    .filter((s) => s.label?.trim() && s.url?.trim())
                    .map((src, idx) => (
                      <li key={src.id || idx} className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0284c7] dark:text-[#38bdf8] hover:underline font-semibold inline-flex items-center gap-1 break-words"
                        >
                          <span>{src.label}</span>
                          <TbExternalLink size={12} className="shrink-0" />
                        </a>
                      </li>
                    ))}
                </ol>
              </section>
            )}

            {/* Related Articles */}
            {relatedPosts.length > 0 && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0d121e] p-5">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <TbBookmark size={17} className="text-indigo-500" />
                  <span>{t('Related Articles')}</span>
                </h2>
                <div className="space-y-3.5">
                  {relatedPosts.map((rp) => (
                    <Link
                      key={rp.id}
                      to={`/blog/${encodeURIComponent(rp.slug)}`}
                      className="group flex items-start gap-3 p-2 -mx-2 rounded-xl hover:bg-white dark:hover:bg-slate-800/70 transition-colors"
                    >
                      <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200/70 dark:border-slate-700/60">
                        <img
                          src={rp.featuredImage || '/images/hero01.png'}
                          alt={rp.featuredImageAlt || rp.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/hero01.png';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#29aaea] transition-colors line-clamp-2 leading-snug">
                          {rp.translations?.[language]?.title || rp.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
                          {rp.readingTimeMinutes || 5} {t('min read')}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Posts */}
            {popularPosts.length > 0 && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0d121e] p-5">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <TbFlame size={17} className="text-amber-500" />
                  <span>{t('Popular Posts')}</span>
                </h2>
                <div className="space-y-3">
                  {popularPosts.map((pp, idx) => (
                    <Link
                      key={pp.id}
                      to={`/blog/${encodeURIComponent(pp.slug)}`}
                      className="group flex items-start gap-3 p-2 -mx-2 rounded-xl hover:bg-white dark:hover:bg-slate-800/70 transition-colors"
                    >
                      <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold flex items-center justify-center shrink-0 tabular-nums">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#29aaea] transition-colors line-clamp-2 leading-snug">
                          {pp.translations?.[language]?.title || pp.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {pp.category}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {(post.tags || []).filter(Boolean).length > 0 && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0d121e] p-5">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <TbTag size={16} className="text-[#29aaea]" />
                  <span>{t('Tags')}</span>
                </h2>
                <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs">
                  {(post.tags || [])
                    .filter(Boolean)
                    .map((tag, idx) => (
                      <Link
                        key={`${tag}-${idx}`}
                        to={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="text-slate-600 dark:text-slate-300 hover:text-[#29aaea] font-medium transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </article>
  );
};
