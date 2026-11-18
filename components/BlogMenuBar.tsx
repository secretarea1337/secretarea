import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TbLayoutGrid,
  TbChevronDown,
  TbChevronRight,
  TbSearch,
  TbX,
  TbCategory,
  TbMenu2,
  TbClock,
  TbSparkles,
  TbTag,
  TbArrowRight,
  TbArrowLeft,
  TbNews,
} from 'react-icons/tb';
import { BlogPost } from '../src/types/blog';
import { useLanguage } from '../src/contexts/LanguageContext';

export interface BlogSubCategoryNode {
  name: string;
  count: number;
}

export interface BlogCategoryNode {
  name: string;
  iconUrl: string;
  count: number;
  subCategories: BlogSubCategoryNode[];
  latestPosts: BlogPost[];
}

interface BlogMenuBarProps {
  posts: BlogPost[];
  selectedCategory?: string;
  selectedSubCategory?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSelectFilter?: (category: string, subCategory?: string) => void;
  onSelectTag?: (tag: string) => void;
}

export function buildBlogCategoryTree(posts: BlogPost[]): BlogCategoryNode[] {
  const map = new Map<
    string,
    {
      name: string;
      iconUrl: string;
      count: number;
      subMap: Map<string, { name: string; count: number }>;
      latestPosts: BlogPost[];
    }
  >();

  posts.forEach((post) => {
    const rawCat = (post.category || 'Gaming Guides').trim() || 'Gaming Guides';
    const catKey = rawCat.toLowerCase();
    let entry = map.get(catKey);
    if (!entry) {
      entry = {
        name: rawCat,
        iconUrl: (post.categoryIconUrl || '').trim(),
        count: 0,
        subMap: new Map(),
        latestPosts: [],
      };
      map.set(catKey, entry);
    }

    if (!entry.iconUrl && post.categoryIconUrl?.trim()) {
      entry.iconUrl = post.categoryIconUrl.trim();
    }

    entry.count += 1;
    if (entry.latestPosts.length < 3) {
      entry.latestPosts.push(post);
    }

    const rawSub = (post.subCategory || '').trim();
    if (rawSub) {
      const subKey = rawSub.toLowerCase();
      const subEntry = entry.subMap.get(subKey);
      if (subEntry) {
        subEntry.count += 1;
      } else {
        entry.subMap.set(subKey, { name: rawSub, count: 1 });
      }
    }
  });

  return Array.from(map.values())
    .map((entry) => ({
      name: entry.name,
      iconUrl: entry.iconUrl,
      count: entry.count,
      subCategories: Array.from(entry.subMap.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      latestPosts: entry.latestPosts,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function matchesBlogSearch(post: BlogPost, rawQuery: string, language: 'en' | 'fr' | 'es' | 'ar'): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;

  const localized = post.translations?.[language];
  const haystackParts = [
    localized?.title,
    post.title,
    localized?.seoTitle,
    post.seoTitle,
    localized?.introduction,
    post.introduction,
    localized?.quickAnswer,
    post.quickAnswer,
    post.focusKeyword,
    ...(post.secondaryKeywords || []),
    ...(post.tags || []),
    post.category,
    post.subCategory,
    post.authorName,
    ...(post.sections || []).map((s) => s.heading),
  ];

  const terms = q.split(/\s+/).filter(Boolean);
  const combined = haystackParts.filter(Boolean).join(' ').toLowerCase();
  return terms.every((term) => combined.includes(term));
}

export const CategoryIconBadge: React.FC<{
  iconUrl?: string;
  sizeClass?: string;
  fallbackSize?: number;
}> = ({ iconUrl, sizeClass = 'w-4 h-4', fallbackSize = 15 }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [iconUrl]);

  if (iconUrl?.trim() && !failed) {
    return (
      <img
        src={iconUrl.trim()}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${sizeClass} rounded object-contain shrink-0`}
      />
    );
  }
  return <TbCategory size={fallbackSize} className="shrink-0 opacity-85" />;
};

export const BlogMenuBar: React.FC<BlogMenuBarProps> = ({
  posts,
  selectedCategory = 'All',
  selectedSubCategory = '',
  searchQuery,
  onSearchChange,
  onSelectFilter,
  onSelectTag,
}) => {
  const { t, dir, language } = useLanguage();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [internalSearch, setInternalSearch] = useState(searchQuery || '');
  const activeQuery = searchQuery !== undefined ? searchQuery : internalSearch;

  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [openDropdownCat, setOpenDropdownCat] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const categoryTree = useMemo(() => buildBlogCategoryTree(posts), [posts]);

  // Visible inline menu categories on desktop (up to 5; overflow accessible in Mega Menu)
  const topBarCategories = useMemo(() => categoryTree.slice(0, 5), [categoryTree]);

  // Featured posts for Mega Menu right column
  const featuredMegaPosts = useMemo(() => {
    return posts.slice(0, 3);
  }, [posts]);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
        setOpenDropdownCat(null);
        setSearchFocused(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMegaMenuOpen(false);
        setOpenDropdownCat(null);
        setSearchFocused(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  const handleFilterNavigate = (category: string, subCategory = '') => {
    setMegaMenuOpen(false);
    setOpenDropdownCat(null);
    setMobileMenuOpen(false);
    setSearchFocused(false);

    if (onSelectFilter) {
      onSelectFilter(category, subCategory);
      return;
    }

    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (subCategory) params.set('sub', subCategory);
    const qs = params.toString();
    navigate(qs ? `/blog?${qs}` : '/blog');
  };

  const handleQueryInput = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFocused(false);
    if (!onSearchChange) {
      const params = new URLSearchParams();
      if (activeQuery.trim()) params.set('q', activeQuery.trim());
      const qs = params.toString();
      navigate(qs ? `/blog?${qs}` : '/blog');
    }
  };

  // Smart search autocomplete matches (Articles + Categories/SubCategories + Tags)
  const smartMatches = useMemo(() => {
    const q = activeQuery.trim().toLowerCase();
    if (!q) return { articles: [], categories: [], tags: [] };

    const matchingArticles = posts.filter((p) => matchesBlogSearch(p, q, language));
    const matchingCategories: Array<{ category: string; subCategory?: string; iconUrl: string; count: number }> = [];

    categoryTree.forEach((cat) => {
      if (cat.name.toLowerCase().includes(q)) {
        matchingCategories.push({
          category: cat.name,
          iconUrl: cat.iconUrl,
          count: cat.count,
        });
      }
      cat.subCategories.forEach((sub) => {
        if (sub.name.toLowerCase().includes(q)) {
          matchingCategories.push({
            category: cat.name,
            subCategory: sub.name,
            iconUrl: cat.iconUrl,
            count: sub.count,
          });
        }
      });
    });

    const tagSet = new Set<string>();
    posts.forEach((p) => {
      (p.tags || []).forEach((tg) => {
        if (tg.toLowerCase().includes(q)) tagSet.add(tg);
      });
    });

    return {
      articles: matchingArticles.slice(0, 6),
      totalArticles: matchingArticles.length,
      categories: matchingCategories.slice(0, 4),
      tags: Array.from(tagSet).slice(0, 5),
    };
  }, [activeQuery, posts, categoryTree, language]);

  const showSmartDropdown = searchFocused && activeQuery.trim().length > 0;

  return (
    <div
      ref={containerRef}
      dir={dir}
      className="relative z-40 rounded-2xl bg-white/95 dark:bg-[#111623]/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 shadow-sm"
    >
      {/* MAIN BAR ROW */}
      <div className="px-3 sm:px-5 py-2.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* LEFT: BLOG BRAND + MEGA MENU + MAIN CATEGORY DROPDOWNS */}
        <div className="flex items-center justify-between lg:justify-start gap-2 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap lg:flex-nowrap">
            {/* Mega Menu Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setMegaMenuOpen((o) => !o);
                setOpenDropdownCat(null);
              }}
              aria-expanded={megaMenuOpen}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                megaMenuOpen
                  ? 'bg-[#29aaea] text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-[#29aaea]/15 hover:text-[#29aaea] border border-slate-200/70 dark:border-slate-800'
              }`}
            >
              <TbLayoutGrid size={16} />
              <span>{t('Mega Menu')}</span>
              <TbChevronDown
                size={14}
                className={`transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* All Articles Pill/Link */}
            <button
              type="button"
              onClick={() => handleFilterNavigate('All', '')}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'All' && !selectedSubCategory
                  ? 'bg-[#29aaea]/15 text-[#29aaea] border border-[#29aaea]/35'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }`}
            >
              <TbNews size={15} />
              <span>{t('All')}</span>
              <span className="text-[10px] font-mono opacity-75">({posts.length})</span>
            </button>

            {/* Desktop Horizontal Main Category Items with Sub-Category Dropdowns */}
            <nav aria-label="Blog Categories" className="hidden lg:flex items-center gap-1">
              {topBarCategories.map((cat) => {
                const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                const hasSubs = cat.subCategories.length > 0;
                const isDropdownOpen = openDropdownCat === cat.name;

                return (
                  <div
                    key={cat.name}
                    className="relative"
                    onMouseEnter={() => {
                      if (hasSubs) {
                        setOpenDropdownCat(cat.name);
                        setMegaMenuOpen(false);
                      }
                    }}
                    onMouseLeave={() => {
                      if (openDropdownCat === cat.name) setOpenDropdownCat(null);
                    }}
                  >
                    <div className="inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => handleFilterNavigate(cat.name, '')}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          hasSubs ? 'rounded-s-xl pe-1.5' : 'rounded-xl'
                        } ${
                          isActive
                            ? 'bg-[#29aaea] text-white shadow-sm'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-[#29aaea]'
                        }`}
                      >
                        <CategoryIconBadge iconUrl={cat.iconUrl} sizeClass="w-4 h-4" fallbackSize={14} />
                        <span>{cat.name}</span>
                      </button>

                      {hasSubs && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMegaMenuOpen(false);
                            setOpenDropdownCat((cur) => (cur === cat.name ? null : cat.name));
                          }}
                          aria-label={`${cat.name} ${t('Sub-Categories')}`}
                          aria-expanded={isDropdownOpen}
                          className={`px-1.5 py-2 rounded-e-xl text-xs transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#29aaea] text-white/90 hover:text-white'
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-[#29aaea]'
                          }`}
                        >
                          <TbChevronDown
                            size={13}
                            className={`transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Sub-Category Dropdown Menu */}
                    {hasSubs && isDropdownOpen && (
                      <div className="absolute top-full start-0 pt-2 w-64 z-50">
                        <div className="rounded-2xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/15 dark:shadow-black/60 p-2 space-y-1">
                          <button
                            type="button"
                            onClick={() => handleFilterNavigate(cat.name, '')}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-extrabold text-slate-900 dark:text-white hover:bg-[#29aaea]/10 hover:text-[#29aaea] transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2 min-w-0 truncate">
                              <CategoryIconBadge iconUrl={cat.iconUrl} sizeClass="w-4 h-4" fallbackSize={14} />
                              <span className="truncate">{cat.name}</span>
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              {cat.count}
                            </span>
                          </button>

                          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                          <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            {t('Sub-Categories')}
                          </div>

                          {cat.subCategories.map((sub) => {
                            const subActive =
                              isActive && selectedSubCategory.toLowerCase() === sub.name.toLowerCase();
                            return (
                              <button
                                key={sub.name}
                                type="button"
                                onClick={() => handleFilterNavigate(cat.name, sub.name)}
                                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                                  subActive
                                    ? 'bg-[#29aaea]/15 text-[#29aaea]'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-[#29aaea]'
                                }`}
                              >
                                <span className="truncate">{sub.name}</span>
                                <span className="text-[10px] font-mono opacity-70">{sub.count}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Mobile / Tablet Drawer Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((v) => !v);
              setMegaMenuOpen(false);
            }}
            aria-expanded={mobileMenuOpen}
            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-bold cursor-pointer shrink-0"
          >
            {mobileMenuOpen ? <TbX size={16} /> : <TbMenu2 size={16} />}
            <span>{t('Categories')}</span>
          </button>
        </div>

        {/* RIGHT: SMART ARTICLE SEARCH BAR */}
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-80 xl:w-96 shrink-0">
          <div className="relative flex items-center">
            <TbSearch
              size={17}
              className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={activeQuery}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => {
                handleQueryInput(e.target.value);
                setSearchFocused(true);
              }}
              placeholder={t('Smart search articles, topics, keywords...')}
              className="w-full ps-10 pe-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#29aaea] focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
            {activeQuery && (
              <button
                type="button"
                onClick={() => handleQueryInput('')}
                aria-label={t('Clear search')}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <TbX size={15} />
              </button>
            )}
          </div>

          {/* Smart Live Search Autocomplete Panel */}
          {showSmartDropdown && (
            <div className="absolute top-full end-0 start-0 lg:start-auto lg:w-[440px] mt-2 rounded-2xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/20 dark:shadow-black/70 overflow-hidden z-50">
              {/* Matching Categories & Sub-Categories */}
              {smartMatches.categories.length > 0 && (
                <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {t('Matching Categories')}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {smartMatches.categories.map((mc) => (
                      <button
                        key={`${mc.category}-${mc.subCategory || ''}`}
                        type="button"
                        onClick={() => handleFilterNavigate(mc.category, mc.subCategory || '')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-[#29aaea]/15 hover:text-[#29aaea] text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-800 transition-colors cursor-pointer"
                      >
                        <CategoryIconBadge iconUrl={mc.iconUrl} sizeClass="w-3.5 h-3.5" fallbackSize={13} />
                        <span>{mc.category}</span>
                        {mc.subCategory && (
                          <>
                            <TbChevronRight size={12} className={dir === 'rtl' ? 'rotate-180 opacity-60' : 'opacity-60'} />
                            <span className="text-[#29aaea]">{mc.subCategory}</span>
                          </>
                        )}
                        <span className="text-[10px] font-mono opacity-60">({mc.count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Tags */}
              {smartMatches.tags.length > 0 && (
                <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                  <TbTag size={13} className="text-slate-400 shrink-0" />
                  {smartMatches.tags.map((tg) => (
                    <button
                      key={tg}
                      type="button"
                      onClick={() => {
                        setSearchFocused(false);
                        if (onSelectTag) {
                          onSelectTag(tg);
                        } else {
                          navigate(`/blog?tag=${encodeURIComponent(tg)}`);
                        }
                      }}
                      className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold hover:bg-indigo-500/20 cursor-pointer"
                    >
                      #{tg}
                    </button>
                  ))}
                </div>
              )}

              {/* Matching Articles */}
              <div className="p-2 max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/70">
                {smartMatches.articles.length === 0 ? (
                  <div className="py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    {t('No matching articles found for')} "{activeQuery}".
                  </div>
                ) : (
                  smartMatches.articles.map((art) => (
                    <Link
                      key={art.id}
                      to={`/blog/${encodeURIComponent(art.slug)}`}
                      onClick={() => setSearchFocused(false)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <img
                        src={art.featuredImage || '/images/hero01.png'}
                        alt={art.featuredImageAlt || art.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/hero01.png';
                        }}
                        className="w-14 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#29aaea] truncate">
                          <CategoryIconBadge iconUrl={art.categoryIconUrl} sizeClass="w-3 h-3" fallbackSize={11} />
                          <span>{art.category}</span>
                          {art.subCategory && <span className="text-slate-400">· {art.subCategory}</span>}
                        </div>
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                          {art.translations?.[language]?.title || art.title}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 tabular-nums">
                          <TbClock size={11} />
                          <span>{art.readingTimeMinutes || 5} {t('min read')}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {smartMatches.totalArticles > 0 && (
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 text-xs font-extrabold text-[#29aaea] hover:bg-[#29aaea]/10 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>
                    {t('Show all matching articles')} ({smartMatches.totalArticles})
                  </span>
                  {dir === 'rtl' ? <TbArrowLeft size={14} /> : <TbArrowRight size={14} />}
                </button>
              )}
            </div>
          )}
        </form>
      </div>

      {/* DESKTOP & TABLET FULL MEGA MENU PANEL */}
      {megaMenuOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 sm:p-6 bg-white dark:bg-[#0f1523] rounded-b-2xl shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Categories & Sub-Categories Directory Grid */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('Explore Categories & Sub-Categories')}
                </div>
                <button
                  type="button"
                  onClick={() => handleFilterNavigate('All', '')}
                  className="text-xs font-bold text-[#29aaea] hover:underline cursor-pointer"
                >
                  {t('View All Articles')} ({posts.length})
                </button>
              </div>

              {categoryTree.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                  {t('No categories published yet.')}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {categoryTree.map((cat) => {
                    const isCatActive = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                    return (
                      <div
                        key={cat.name}
                        className={`rounded-2xl border p-3.5 transition-all ${
                          isCatActive
                            ? 'border-[#29aaea]/50 bg-[#29aaea]/5'
                            : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 hover:border-[#29aaea]/40'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleFilterNavigate(cat.name, '')}
                          className="w-full flex items-center justify-between gap-2 text-start group cursor-pointer"
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <span className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                              <CategoryIconBadge iconUrl={cat.iconUrl} sizeClass="w-5 h-5" fallbackSize={16} />
                            </span>
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-[#29aaea] truncate">
                              {cat.name}
                            </span>
                          </span>
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700 shrink-0">
                            {cat.count}
                          </span>
                        </button>

                        {cat.subCategories.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800 flex flex-wrap gap-1.5">
                            {cat.subCategories.map((sub) => {
                              const subActive =
                                isCatActive && selectedSubCategory.toLowerCase() === sub.name.toLowerCase();
                              return (
                                <button
                                  key={sub.name}
                                  type="button"
                                  onClick={() => handleFilterNavigate(cat.name, sub.name)}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                                    subActive
                                      ? 'bg-[#29aaea] text-white'
                                      : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-[#29aaea] border border-slate-200/80 dark:border-slate-700'
                                  }`}
                                >
                                  <span>{sub.name}</span>
                                  <span className="opacity-65 text-[10px]">({sub.count})</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Featured / Latest Articles */}
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-s border-slate-200 dark:border-slate-800 pt-5 lg:pt-0 lg:ps-6 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#29aaea]">
                <TbSparkles size={15} />
                <span>{t('Latest Highlights')}</span>
              </div>
              <div className="space-y-2.5">
                {featuredMegaPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${encodeURIComponent(post.slug)}`}
                    onClick={() => setMegaMenuOpen(false)}
                    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <img
                      src={post.featuredImage || '/images/hero01.png'}
                      alt={post.featuredImageAlt || post.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/hero01.png';
                      }}
                      className="w-16 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#29aaea] truncate">
                        <span>{post.category}</span>
                        {post.subCategory && <span className="text-slate-400">· {post.subCategory}</span>}
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#29aaea] line-clamp-2 leading-snug">
                        {post.translations?.[language]?.title || post.title}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE & TABLET COLLAPSIBLE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-[#0f1523] rounded-b-2xl space-y-2.5">
          <button
            type="button"
            onClick={() => handleFilterNavigate('All', '')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer ${
              selectedCategory === 'All' && !selectedSubCategory
                ? 'bg-[#29aaea] text-white'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <TbNews size={15} />
              <span>{t('All Articles')}</span>
            </span>
            <span className="font-mono text-[11px]">{posts.length}</span>
          </button>

          {categoryTree.map((cat) => {
            const hasSubs = cat.subCategories.length > 0;
            const expanded = expandedMobileCat === cat.name;
            const isCatActive = selectedCategory.toLowerCase() === cat.name.toLowerCase();

            return (
              <div
                key={cat.name}
                className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleFilterNavigate(cat.name, '')}
                    className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-start cursor-pointer ${
                      isCatActive ? 'text-[#29aaea]' : 'text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    <CategoryIconBadge iconUrl={cat.iconUrl} sizeClass="w-4 h-4" fallbackSize={15} />
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">({cat.count})</span>
                  </button>

                  {hasSubs && (
                    <button
                      type="button"
                      onClick={() => setExpandedMobileCat((cur) => (cur === cat.name ? null : cat.name))}
                      className="px-3 py-2.5 text-slate-500 dark:text-slate-400 cursor-pointer"
                      aria-label={t('Toggle Sub-Categories')}
                    >
                      <TbChevronDown
                        size={15}
                        className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </div>

                {hasSubs && expanded && (
                  <div className="px-3 pb-2.5 pt-1 border-t border-slate-200/70 dark:border-slate-800 flex flex-wrap gap-1.5">
                    {cat.subCategories.map((sub) => {
                      const subActive =
                        isCatActive && selectedSubCategory.toLowerCase() === sub.name.toLowerCase();
                      return (
                        <button
                          key={sub.name}
                          type="button"
                          onClick={() => handleFilterNavigate(cat.name, sub.name)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer ${
                            subActive
                              ? 'bg-[#29aaea] text-white'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {sub.name} ({sub.count})
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
