import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  TbClock,
  TbCalendar,
  TbArrowRight,
  TbArrowLeft,
  TbChevronRight,
  TbChevronLeft,
  TbPlus,
  TbNews,
  TbTag,
  TbX,
} from 'react-icons/tb';
import { BlogPost } from '../src/types/blog';
import { getCachedBlogPosts, subscribePublishedBlogPosts } from '../src/services/blogService';
import { useLanguage } from '../src/contexts/LanguageContext';
import { auth } from '../src/firebase';
import { isUserAdmin, subscribeUserProfile, UserProfileData } from '../src/services/userService';
import { ResilientBlogImage } from '../components/BlogBlockRenderer';
import {
  BlogMenuBar,
  CategoryIconBadge,
  buildBlogCategoryTree,
  matchesBlogSearch,
} from '../components/BlogMenuBar';

const ARTICLES_PER_PAGE = 9;

function formatShortDate(iso: string | undefined, lang: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const locale = lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US';
    return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

function getVisiblePageNumbers(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: Array<number | 'ellipsis'> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('ellipsis');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

const BlogListPage: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const articlesSectionRef = useRef<HTMLDivElement>(null);

  const [posts, setPosts] = useState<BlogPost[]>(() => getCachedBlogPosts());
  const [loading, setLoading] = useState<boolean>(() => getCachedBlogPosts().length === 0);
  const [searchQuery, setSearchQuery] = useState<string>(() => searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(() => searchParams.get('category') || 'All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(() => searchParams.get('sub') || '');
  const [selectedTag, setSelectedTag] = useState<string>(() => searchParams.get('tag') || '');
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const raw = Number(searchParams.get('page') || 1);
    return Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 1;
  });

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);

  useEffect(() => {
    const catParam = searchParams.get('category');
    const subParam = searchParams.get('sub');
    const tagParam = searchParams.get('tag');
    const qParam = searchParams.get('q');
    const pageParam = Number(searchParams.get('page') || 1);

    setSelectedCategory(catParam || 'All');
    setSelectedSubCategory(subParam || '');
    setSelectedTag(tagParam || '');
    if (qParam !== null) setSearchQuery(qParam);
    setCurrentPage(Number.isFinite(pageParam) && pageParam >= 1 ? Math.floor(pageParam) : 1);
  }, [searchParams]);

  useEffect(() => {
    const unsub = subscribePublishedBlogPosts(
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
    let unsubProfile: (() => void) | null = null;
    const unsubAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }
      if (user) {
        unsubProfile = subscribeUserProfile(user.uid, (p) => setProfileData(p), user);
      } else {
        setProfileData(null);
      }
    });
    return () => {
      if (unsubProfile) unsubProfile();
      unsubAuth();
    };
  }, []);

  const isAdmin = isUserAdmin(currentUser?.email || profileData?.email, profileData?.role);

  const categoryTree = useMemo(() => buildBlogCategoryTree(posts), [posts]);

  const activeCategoryNode = useMemo(() => {
    if (selectedCategory === 'All') return null;
    return categoryTree.find((c) => c.name.toLowerCase() === selectedCategory.toLowerCase()) || null;
  }, [categoryTree, selectedCategory]);

  const syncUrlParams = (updates: {
    category?: string;
    sub?: string;
    tag?: string;
    q?: string;
    page?: number;
  }) => {
    const next = new URLSearchParams(searchParams);
    const apply = (key: string, val: string | undefined, omitValue?: string) => {
      if (val === undefined) return;
      if (!val || (omitValue && val === omitValue)) {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    };
    apply('category', updates.category, 'All');
    apply('sub', updates.sub);
    apply('tag', updates.tag);
    apply('q', updates.q);
    if (updates.page !== undefined) {
      if (updates.page <= 1) next.delete('page');
      else next.set('page', String(updates.page));
    }
    setSearchParams(next, { replace: true });
  };

  const handleSelectFilter = (cat: string, sub = '') => {
    setSelectedCategory(cat);
    setSelectedSubCategory(sub);
    setCurrentPage(1);
    syncUrlParams({ category: cat, sub, page: 1 });
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
    syncUrlParams({ q: q.trim(), page: 1 });
  };

  const handleSelectTag = (tg: string) => {
    setSelectedTag(tg);
    setCurrentPage(1);
    syncUrlParams({ tag: tg, page: 1 });
  };

  const clearTagFilter = () => {
    setSelectedTag('');
    setCurrentPage(1);
    syncUrlParams({ tag: '', page: 1 });
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSubCategory('');
    setSelectedTag('');
    setCurrentPage(1);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (
        selectedCategory !== 'All' &&
        (post.category || '').trim().toLowerCase() !== selectedCategory.trim().toLowerCase()
      ) {
        return false;
      }
      if (
        selectedSubCategory &&
        (post.subCategory || '').trim().toLowerCase() !== selectedSubCategory.trim().toLowerCase()
      ) {
        return false;
      }
      if (selectedTag) {
        const tags = (post.tags || []).map((tg) => tg.toLowerCase());
        if (!tags.includes(selectedTag.toLowerCase())) return false;
      }
      if (searchQuery.trim()) {
        return matchesBlogSearch(post, searchQuery, language);
      }
      return true;
    });
  }, [posts, searchQuery, selectedCategory, selectedSubCategory, selectedTag, language]);

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    Boolean(selectedSubCategory) ||
    Boolean(selectedTag) ||
    Boolean(searchQuery.trim());

  // Pagination calculation
  const showLeadBanner = !hasActiveFilters && currentPage === 1 && filteredPosts.length > 0;
  const leadPost = showLeadBanner ? filteredPosts[0] : null;
  const gridSource = !hasActiveFilters ? filteredPosts.slice(1) : filteredPosts;

  const totalPages = Math.max(1, Math.ceil(gridSource.length / ARTICLES_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedGridPosts = useMemo(() => {
    const start = (safePage - 1) * ARTICLES_PER_PAGE;
    return gridSource.slice(start, start + ARTICLES_PER_PAGE);
  }, [gridSource, safePage]);

  const goToPage = (pageNum: number) => {
    const clamped = Math.min(Math.max(1, pageNum), totalPages);
    setCurrentPage(clamped);
    syncUrlParams({ page: clamped });
    if (articlesSectionRef.current) {
      articlesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin.replace(/\/+$/, '')
      : 'https://secretarea.site';
  const canonicalUrl = `${origin}/blog`;
  const seoTitle = 'Secret Area Blog – Gaming Guides, PC Repacks & Tech Tutorials';
  const seoDesc =
    'Read expert PC gaming guides, repack safety tutorials, hardware benchmarks, and Secret Area platform updates structured for fast answers.';

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        name: 'Secret Area Blog',
        url: canonicalUrl,
        description: seoDesc,
        publisher: {
          '@type': 'Organization',
          name: 'SecretArea',
          logo: { '@type': 'ImageObject', url: `${origin}/images/logo04.png` },
        },
        blogPost: posts.slice(0, 20).map((p) => ({
          '@type': 'BlogPosting',
          headline: p.title,
          url: `${origin}/blog/${encodeURIComponent(p.slug)}`,
          datePublished: p.publishedAt,
          dateModified: p.updatedAt || p.publishedAt,
          image: p.featuredImage?.startsWith('http')
            ? p.featuredImage
            : `${origin}${p.featuredImage || '/images/hero01.png'}`,
          author: { '@type': 'Person', name: p.authorName || 'SecretArea Team' },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: canonicalUrl },
        ],
      },
    ],
  };

  const visiblePages = getVisiblePageNumbers(safePage, totalPages);
  const displayedStart = filteredPosts.length === 0 ? 0 : !hasActiveFilters ? (safePage === 1 ? 1 : (safePage - 1) * ARTICLES_PER_PAGE + 2) : (safePage - 1) * ARTICLES_PER_PAGE + 1;
  const displayedEnd = filteredPosts.length === 0 ? 0 : !hasActiveFilters ? Math.min(filteredPosts.length, (safePage - 1) * ARTICLES_PER_PAGE + 1 + paginatedGridPosts.length) : Math.min(filteredPosts.length, (safePage - 1) * ARTICLES_PER_PAGE + paginatedGridPosts.length);

  return (
    <div dir={dir} className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pt-20 sm:pt-24 pb-16 sm:pb-20">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:site_name" content="Secret Area" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={`${origin}/images/hero01.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content={`${origin}/images/hero01.png`} />
        <script type="application/ld+json">{JSON.stringify(blogJsonLd)}</script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* DEDICATED BLOG-ONLY NAVIGATION MENU, DROPDOWNS, MEGA MENU & SMART SEARCH */}
        <BlogMenuBar
          posts={posts}
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSelectFilter={handleSelectFilter}
          onSelectTag={handleSelectTag}
        />

        {/* Hero Header */}
        <section className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 p-5 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6">
            <div className="max-w-2xl space-y-2.5 sm:space-y-3">
              <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.18em] text-[#29aaea]">
                <TbNews size={16} />
                <span>{t('SecretArea Journal & Guides')}</span>
              </div>
              <h1
                className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight"
                style={{ textWrap: 'balance' }}
              >
                {t('Articles, Guides & Technical Intel')}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('In-depth PC gaming guides, repack safety checklists, hardware benchmarks, and tutorials crafted for fast answers.')}
              </p>
            </div>

            {isAdmin && (
              <div className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => navigate('/admin?tab=blog')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#29aaea] to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-500/20 hover:brightness-110 transition-all whitespace-nowrap cursor-pointer"
                >
                  <TbPlus size={16} />
                  <span>{t('Write Article')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Category Pills & Active Sub-Category Strip */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full">
                <button
                  type="button"
                  onClick={() => handleSelectFilter('All', '')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === 'All'
                      ? 'bg-[#29aaea] text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800'
                  }`}
                >
                  {t('All Articles')}
                </button>

                {categoryTree.map((cat) => {
                  const active = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => handleSelectFilter(cat.name, '')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        active
                          ? 'bg-[#29aaea] text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800'
                      }`}
                    >
                      <CategoryIconBadge iconUrl={cat.iconUrl} sizeClass="w-3.5 h-3.5" fallbackSize={13} />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {(hasActiveFilters) && (
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {selectedTag && (
                    <button
                      type="button"
                      onClick={clearTagFilter}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-500/20 cursor-pointer"
                    >
                      <TbTag size={13} />
                      <span>#{selectedTag}</span>
                      <TbX size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:text-rose-500 cursor-pointer"
                  >
                    <TbX size={13} />
                    <span>{t('Reset Filters')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sub-Category Filter Pills when a Main Category with Sub-Categories is active */}
            {activeCategoryNode && activeCategoryNode.subCategories.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  {t('Sub-Categories')}:
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectFilter(activeCategoryNode.name, '')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    !selectedSubCategory
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {t('All')} ({activeCategoryNode.count})
                </button>
                {activeCategoryNode.subCategories.map((sub) => {
                  const subActive = selectedSubCategory.toLowerCase() === sub.name.toLowerCase();
                  return (
                    <button
                      key={sub.name}
                      type="button"
                      onClick={() => handleSelectFilter(activeCategoryNode.name, sub.name)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        subActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {sub.name} ({sub.count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Scroll Anchor for Articles & Pagination */}
        <div ref={articlesSectionRef} id="blog-articles-section" className="scroll-mt-24 space-y-6 sm:space-y-8">
          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-80 rounded-2xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredPosts.length === 0 && (
            <div className="rounded-3xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
                <TbNews size={30} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {t('No articles published yet')}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                {hasActiveFilters
                  ? t('Try clearing your search or category filter to view more articles.')
                  : t('Articles published from the Admin Blog Studio will appear here automatically.')}
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    {t('Reset Filters')}
                  </button>
                )}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => navigate('/admin?tab=blog')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#29aaea] to-indigo-600 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    {t('Open Blog Studio')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Lead Featured Story (Page 1 when unfiltered) */}
          {!loading && leadPost && (
            <Link
              to={`/blog/${encodeURIComponent(leadPost.slug)}`}
              className="group block rounded-3xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 hover:border-[#29aaea]/50 transition-all overflow-hidden shadow-sm hover:shadow-xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                <div className="lg:col-span-7 p-4 sm:p-6 lg:p-8 flex items-center">
                  <div className="w-full">
                    <ResilientBlogImage
                      src={leadPost.featuredImage}
                      alt={leadPost.featuredImageAlt || leadPost.title}
                      aspectClass="aspect-[16/9]"
                    />
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8 lg:py-10 lg:pe-10 lg:ps-2 flex flex-col justify-center">
                  <div className="flex items-center gap-2 flex-wrap text-xs font-extrabold uppercase tracking-wider text-[#29aaea] mb-2">
                    <span className="inline-flex items-center gap-1.5">
                      <CategoryIconBadge iconUrl={leadPost.categoryIconUrl} sizeClass="w-4 h-4" fallbackSize={14} />
                      <span>{leadPost.category || t('Featured Guide')}</span>
                    </span>
                    {leadPost.subCategory && (
                      <>
                        <TbChevronRight size={13} className={`opacity-60 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                        <span className="text-indigo-500 dark:text-indigo-400">{leadPost.subCategory}</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-[#29aaea] transition-colors leading-tight mb-3">
                    {leadPost.translations?.[language]?.title || leadPost.title}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-6">
                    {leadPost.translations?.[language]?.introduction || leadPost.introduction}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-6">
                    <div className="flex items-center gap-2">
                      <img
                        src={leadPost.authorAvatar || '/images/logo04.png'}
                        alt={leadPost.authorName || 'Author'}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/logo04.png';
                        }}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {leadPost.authorName}
                      </span>
                    </div>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 tabular-nums">
                      <TbCalendar size={14} />
                      {formatShortDate(leadPost.publishedAt, language)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 tabular-nums">
                      <TbClock size={14} />
                      {leadPost.readingTimeMinutes || 5} {t('min read')}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 text-sm font-bold text-[#29aaea]">
                    <span>{t('Read Full Article')}</span>
                    {dir === 'rtl' ? <TbArrowLeft size={16} /> : <TbArrowRight size={16} />}
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Article Grid */}
          {!loading && paginatedGridPosts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {paginatedGridPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${encodeURIComponent(post.slug)}`}
                  className="group flex flex-col rounded-2xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 hover:border-[#29aaea]/50 transition-all overflow-hidden shadow-sm hover:shadow-lg"
                >
                  <div className="p-3 pb-0">
                    <ResilientBlogImage
                      src={post.featuredImage}
                      alt={post.featuredImageAlt || post.title}
                      aspectClass="aspect-[16/10]"
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-extrabold uppercase tracking-wider text-[#29aaea] mb-2">
                      <span className="inline-flex items-center gap-1.5">
                        <CategoryIconBadge iconUrl={post.categoryIconUrl} sizeClass="w-3.5 h-3.5" fallbackSize={12} />
                        <span>{post.category}</span>
                      </span>
                      {post.subCategory && (
                        <>
                          <TbChevronRight size={11} className={`opacity-60 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                          <span className="text-indigo-500 dark:text-indigo-400">{post.subCategory}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-[#29aaea] transition-colors leading-snug mb-2 line-clamp-2">
                      {post.translations?.[language]?.title || post.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-5 flex-1">
                      {post.translations?.[language]?.introduction || post.introduction}
                    </p>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                        {post.authorName}
                      </span>
                      <div className="flex items-center gap-2 tabular-nums shrink-0">
                        <span>{formatShortDate(post.publishedAt, language)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{post.readingTimeMinutes || 5} {t('min read')}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination Bar */}
          {!loading && filteredPosts.length > 0 && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                {t('Showing')} <strong className="text-slate-800 dark:text-slate-200">{displayedStart}–{displayedEnd}</strong> {t('of')}{' '}
                <strong className="text-slate-800 dark:text-slate-200">{filteredPosts.length}</strong> {t('articles')}
                {totalPages > 1 && (
                  <span className="ms-2 text-slate-400">
                    ({t('Page')} {safePage} / {totalPages})
                  </span>
                )}
              </div>

              {totalPages > 1 && (
                <nav aria-label="Blog pagination" className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => goToPage(safePage - 1)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-[#29aaea] hover:text-[#29aaea] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    {dir === 'rtl' ? <TbChevronRight size={15} /> : <TbChevronLeft size={15} />}
                    <span>{t('Previous')}</span>
                  </button>

                  {visiblePages.map((item, idx) =>
                    item === 'ellipsis' ? (
                      <span key={`el_${idx}`} className="px-2 text-xs text-slate-400 select-none">
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => goToPage(item)}
                        aria-current={item === safePage ? 'page' : undefined}
                        className={`min-w-[36px] h-9 px-2.5 rounded-xl text-xs font-extrabold tabular-nums transition-all cursor-pointer ${
                          item === safePage
                            ? 'bg-[#29aaea] text-white shadow-md shadow-sky-500/20'
                            : 'bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#29aaea] hover:text-[#29aaea]'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => goToPage(safePage + 1)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-[#29aaea] hover:text-[#29aaea] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <span>{t('Next')}</span>
                    {dir === 'rtl' ? <TbChevronLeft size={15} /> : <TbChevronRight size={15} />}
                  </button>
                </nav>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogListPage;
