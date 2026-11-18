import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { BlogPost } from '../src/types/blog';
import {
  getPublishedBlogPostBySlug,
  subscribePublishedBlogPosts,
  getCachedBlogPosts,
  incrementBlogPostView,
} from '../src/services/blogService';
import { BlogArticleView } from '../components/BlogArticleView';
import { useLanguage } from '../src/contexts/LanguageContext';
import { auth } from '../src/firebase';
import { isUserAdmin, subscribeUserProfile, UserProfileData } from '../src/services/userService';
import { estimateReadingTime } from '../src/utils/blogSeoAnalyzer';
import { TbArrowLeft, TbNews } from 'react-icons/tb';

const BlogArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, dir, language } = useLanguage();

  const [post, setPost] = useState<BlogPost | null>(() => {
    const cached = getCachedBlogPosts();
    return cached.find((p) => p.slug === slug) || null;
  });
  const [allPosts, setAllPosts] = useState<BlogPost[]>(() => getCachedBlogPosts());
  const [loading, setLoading] = useState<boolean>(!post);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);

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

  useEffect(() => {
    const unsub = subscribePublishedBlogPosts((list) => {
      setAllPosts(list);
      if (slug) {
        const found = list.find((p) => p.slug === slug);
        if (found) setPost(found);
      }
    });
    return () => unsub();
  }, [slug]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const fetched = await getPublishedBlogPostBySlug(slug);
        if (active) {
          setPost(fetched);
          setLoading(false);
          if (fetched?.id) {
            incrementBlogPostView(fetched.id);
          }
        }
      } catch {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [slug]);

  const isAdmin = isUserAdmin(currentUser?.email || profileData?.email, profileData?.role);

  // 15. TECHNICAL SEO: Metadata, Open Graph, Twitter Cards & Schema.org JSON-LD
  const seoMetadata = useMemo(() => {
    if (!post) return null;
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin.replace(/\/+$/, '')
        : 'https://secretarea.site';

    const loc = post.translations?.[language];
    const effectiveTitle = loc?.seoTitle?.trim() || post.seoTitle || loc?.title?.trim() || post.title;
    const effectiveDesc =
      loc?.metaDescription?.trim() || post.metaDescription || loc?.introduction?.trim() || post.introduction;
    const canonical = post.canonicalUrl?.trim() || `${origin}/blog/${encodeURIComponent(post.slug)}`;
    const rawImg = post.ogImage?.trim() || post.featuredImage?.trim() || '/images/hero01.png';
    const fullImg = rawImg.startsWith('http') ? rawImg : `${origin}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
    const keywords = [post.focusKeyword, ...(post.secondaryKeywords || []), ...(post.tags || [])]
      .filter(Boolean)
      .join(', ');
    const { wordCount } = estimateReadingTime(post);

    const graph: any[] = [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        name: effectiveTitle,
        description: effectiveDesc,
        image: [fullImg],
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        wordCount,
        articleSection: post.category || 'Gaming Guides',
        keywords,
        inLanguage: post.language || language || 'en',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonical,
        },
        author: {
          '@type': 'Person',
          name: post.authorName || 'SecretArea Team',
        },
        publisher: {
          '@type': 'Organization',
          name: 'SecretArea',
          logo: {
            '@type': 'ImageObject',
            url: `${origin}/images/logo04.png`,
          },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${origin}/blog` },
          ...(post.category
            ? [
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: post.category,
                  item: `${origin}/blog?category=${encodeURIComponent(post.category)}`,
                },
              ]
            : []),
          ...(post.subCategory
            ? [
                {
                  '@type': 'ListItem',
                  position: post.category ? 4 : 3,
                  name: post.subCategory,
                  item: `${origin}/blog?category=${encodeURIComponent(post.category || '')}&sub=${encodeURIComponent(post.subCategory)}`,
                },
              ]
            : []),
          {
            '@type': 'ListItem',
            position: 3 + (post.category ? 1 : 0) + (post.subCategory ? 1 : 0),
            name: post.title,
            item: canonical,
          },
        ],
      },
    ];

    const validFaqs = (post.faqs || []).filter((f) => f.question?.trim() && f.answer?.trim());
    if (validFaqs.length > 0) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: validFaqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      });
    }

    if (post.stepByStep?.enabled) {
      const validSteps = (post.stepByStep.steps || []).filter((s) => s.title?.trim() || s.description?.trim());
      if (validSteps.length > 0) {
        graph.push({
          '@type': 'HowTo',
          name: post.stepByStep.title || post.title,
          step: validSteps.map((s, idx) => ({
            '@type': 'HowToStep',
            position: idx + 1,
            name: s.title,
            text: s.description,
          })),
        });
      }
    }

    return {
      effectiveTitle,
      effectiveDesc,
      canonical,
      fullImg,
      keywords,
      robots: post.noIndex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': graph,
      },
    };
  }, [post, language]);

  if (loading) {
    return (
      <div dir={dir} className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto rounded-3xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 p-8 animate-pulse space-y-6">
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div dir={dir} className="min-h-[75vh] bg-gray-50 dark:bg-slate-950 pt-28 pb-20 px-4 flex items-center justify-center">
        <Helmet>
          <title>Article Not Found | Secret Area Blog</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#111623] border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <TbNews size={28} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            {t('Article Not Found')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {t('The article you are looking for may have been moved or is still in draft mode.')}
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#29aaea] text-white text-xs font-bold hover:brightness-110 transition-all"
          >
            <TbArrowLeft size={15} />
            <span>{t('Back to Blog')}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {seoMetadata && (
        <Helmet>
          <title>{seoMetadata.effectiveTitle}</title>
          <meta name="description" content={seoMetadata.effectiveDesc} />
          {seoMetadata.keywords && <meta name="keywords" content={seoMetadata.keywords} />}
          <meta name="robots" content={seoMetadata.robots} />
          <meta name="googlebot" content={seoMetadata.robots} />
          <link rel="canonical" href={seoMetadata.canonical} />

          {/* Open Graph */}
          <meta property="og:site_name" content="Secret Area" />
          <meta property="og:type" content="article" />
          <meta property="og:title" content={seoMetadata.effectiveTitle} />
          <meta property="og:description" content={seoMetadata.effectiveDesc} />
          <meta property="og:url" content={seoMetadata.canonical} />
          <meta property="og:image" content={seoMetadata.fullImg} />
          <meta property="og:image:alt" content={post.featuredImageAlt || post.title} />
          {post.publishedAt && <meta property="article:published_time" content={post.publishedAt} />}
          {post.updatedAt && <meta property="article:modified_time" content={post.updatedAt} />}
          {post.category && <meta property="article:section" content={post.category} />}
          {(post.tags || []).map((tg, i) => (
            <meta key={i} property="article:tag" content={tg} />
          ))}

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={seoMetadata.effectiveTitle} />
          <meta name="twitter:description" content={seoMetadata.effectiveDesc} />
          <meta name="twitter:image" content={seoMetadata.fullImg} />
          <meta name="twitter:image:alt" content={post.featuredImageAlt || post.title} />

          {/* Schema.org JSON-LD (BlogPosting + BreadcrumbList + FAQPage + HowTo) */}
          <script type="application/ld+json">{JSON.stringify(seoMetadata.jsonLd)}</script>
        </Helmet>
      )}

      <BlogArticleView post={post} allPosts={allPosts} isAdmin={isAdmin} />
    </div>
  );
};

export default BlogArticlePage;
