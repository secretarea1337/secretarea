import { db, auth } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  increment,
} from 'firebase/firestore';
import {
  BlogPost,
  createBlockId,
  getComparisonRowCells,
  resolveArticleFlowOrder,
  slugifyBlogTitle,
} from '../types/blog';
import { estimateReadingTime } from '../utils/blogSeoAnalyzer';

const BLOG_COLLECTION = 'blog_posts';
const CACHE_KEY = 'secretarea_cached_blog_posts_v1';
const AUTOSAVE_PREFIX = 'secretarea_blog_autosave_v1_';

export enum BlogOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function normalizeBlogPost(raw: BlogPost): BlogPost {
  if (!raw || typeof raw !== 'object') return raw;
  const normalizedRows = Array.isArray(raw.comparisonTable?.rows)
    ? raw.comparisonTable.rows.map((row) => ({ cells: getComparisonRowCells(row) }))
    : [];

  const basePost: BlogPost = {
    ...raw,
    category: (raw.category || 'Gaming Guides').trim() || 'Gaming Guides',
    subCategory: (raw.subCategory || '').trim(),
    categoryIconUrl: (raw.categoryIconUrl || '').trim(),
    sections: Array.isArray(raw.sections)
      ? raw.sections.map((s) => ({
          ...s,
          headingLevel: s.headingLevel ?? 2,
          blocks: Array.isArray(s.blocks) ? s.blocks : [],
        }))
      : [],
    comparisonTable: raw.comparisonTable
      ? {
          ...raw.comparisonTable,
          columns: Array.isArray(raw.comparisonTable.columns) ? raw.comparisonTable.columns : [],
          rows: normalizedRows,
        }
      : {
          enabled: false,
          title: 'Comparison Table',
          columns: ['Title', 'Platform', 'Size / Price', 'Rating'],
          rows: [{ cells: ['', 'PC / Steam', 'Free', '9.5/10'] }],
        },
    metacriticReviews: raw.metacriticReviews
      ? {
          enabled: Boolean(raw.metacriticReviews.enabled),
          title: raw.metacriticReviews.title || 'Reviews & Scores',
          critic: {
            score:
              typeof raw.metacriticReviews.critic?.score === 'number'
                ? raw.metacriticReviews.critic.score
                : null,
            positiveCount: Number(raw.metacriticReviews.critic?.positiveCount || 0),
            mixedCount: Number(raw.metacriticReviews.critic?.mixedCount || 0),
            negativeCount: Number(raw.metacriticReviews.critic?.negativeCount || 0),
            summaryText: raw.metacriticReviews.critic?.summaryText || '',
          },
          user: {
            score:
              typeof raw.metacriticReviews.user?.score === 'number'
                ? raw.metacriticReviews.user.score
                : null,
            positiveCount: Number(raw.metacriticReviews.user?.positiveCount || 0),
            mixedCount: Number(raw.metacriticReviews.user?.mixedCount || 0),
            negativeCount: Number(raw.metacriticReviews.user?.negativeCount || 0),
            summaryText: raw.metacriticReviews.user?.summaryText || '',
          },
        }
      : {
          enabled: false,
          title: 'Reviews & Scores',
          critic: { score: null, positiveCount: 0, mixedCount: 0, negativeCount: 0, summaryText: '' },
          user: { score: null, positiveCount: 0, mixedCount: 0, negativeCount: 0, summaryText: '' },
        },
    whereToBuy: raw.whereToBuy
      ? {
          enabled: Boolean(raw.whereToBuy.enabled),
          title: raw.whereToBuy.title || 'Where to Buy',
          collapseAfter: typeof raw.whereToBuy.collapseAfter === 'number' ? raw.whereToBuy.collapseAfter : 2,
          offers: Array.isArray(raw.whereToBuy.offers) ? raw.whereToBuy.offers : [],
        }
      : {
          enabled: false,
          title: 'Where to Buy',
          collapseAfter: 2,
          offers: [],
        },
  };

  return {
    ...basePost,
    contentOrder: resolveArticleFlowOrder(basePost),
  };
}

function sanitizeForFirestore<T = any>(data: T): T {
  if (data === undefined) return null as any;
  if (data === null || typeof data !== 'object') return data;
  if (
    ('_methodName' in (data as any)) ||
    ((data as any).constructor && (data as any).constructor.name === 'FieldValue')
  ) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => {
        const sanitized = sanitizeForFirestore(item);
        // Firestore strictly forbids nested arrays (Array directly inside Array)
        if (Array.isArray(sanitized)) {
          return { cells: sanitized };
        }
        return sanitized;
      }) as any;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean as any;
}

function handleBlogFirestoreError(
  error: unknown,
  operationType: BlogOperationType,
  path: string | null
) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo:
        auth?.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
  };
  console.error('Firestore Blog Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function getCachedBlogPosts(): BlogPost[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((p) => normalizeBlogPost(p));
    }
  } catch {
    // ignore storage parse failure
  }
  return [];
}

function setCachedBlogPosts(posts: BlogPost[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(posts.slice(0, 50)));
  } catch {
    // ignore quota errors
  }
}

export function saveLocalDraftBackup(draftKey: string, post: BlogPost): void {
  try {
    localStorage.setItem(
      `${AUTOSAVE_PREFIX}${draftKey || 'new'}`,
      JSON.stringify({ savedAt: Date.now(), post })
    );
  } catch {
    // ignore quota errors
  }
}

export function loadLocalDraftBackup(draftKey: string): { savedAt: number; post: BlogPost } | null {
  try {
    const raw = localStorage.getItem(`${AUTOSAVE_PREFIX}${draftKey || 'new'}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.post && typeof parsed.savedAt === 'number') {
      return { savedAt: parsed.savedAt, post: normalizeBlogPost(parsed.post) };
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

export function clearLocalDraftBackup(draftKey: string): void {
  try {
    localStorage.removeItem(`${AUTOSAVE_PREFIX}${draftKey || 'new'}`);
  } catch {
    // ignore
  }
}

export function subscribePublishedBlogPosts(
  onUpdate: (posts: BlogPost[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(
    collection(db, BLOG_COLLECTION),
    where('status', '==', 'published'),
    orderBy('publishedAt', 'desc'),
    limit(100)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: BlogPost[] = snapshot.docs.map((d) =>
        normalizeBlogPost({
          ...(d.data() as BlogPost),
          id: d.id,
        })
      );
      setCachedBlogPosts(items);
      onUpdate(items);
    },
    (error) => {
      // Fallback query without composite index requirement if index isn't built yet
      if (String(error?.message || '').toLowerCase().includes('index')) {
        const simpleQ = query(
          collection(db, BLOG_COLLECTION),
          where('status', '==', 'published')
        );
        onSnapshot(
          simpleQ,
          (snap) => {
            const items = snap.docs
              .map((d) => normalizeBlogPost({ ...(d.data() as BlogPost), id: d.id }))
              .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
            setCachedBlogPosts(items);
            onUpdate(items);
          },
          (err2) => {
            try {
              handleBlogFirestoreError(err2, BlogOperationType.LIST, BLOG_COLLECTION);
            } catch (thrown) {
              if (onError) onError(thrown as Error);
            }
          }
        );
        return;
      }
      try {
        handleBlogFirestoreError(error, BlogOperationType.LIST, BLOG_COLLECTION);
      } catch (thrown) {
        if (onError) onError(thrown as Error);
      }
    }
  );
}

export function subscribeAllBlogPostsAdmin(
  onUpdate: (posts: BlogPost[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, BLOG_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const nowMs = Date.now();
      const items: BlogPost[] = snapshot.docs
        .map((d) => normalizeBlogPost({ ...(d.data() as BlogPost), id: d.id }))
        .sort((a, b) => (b.updatedAt || b.publishedAt || '').localeCompare(a.updatedAt || a.publishedAt || ''));

      // Automatically promote due scheduled articles to published when an admin views Blog Studio
      items.forEach((p) => {
        if (p.status === 'scheduled' && typeof p.scheduledAtMs === 'number' && p.scheduledAtMs <= nowMs) {
          updateDoc(doc(db, BLOG_COLLECTION, p.id), {
            status: 'published',
            publishedAt: p.scheduledAt || p.publishedAt || new Date(p.scheduledAtMs).toISOString(),
            updatedAt: new Date().toISOString(),
          }).catch(() => {});
        }
      });

      onUpdate(items);
    },
    (error) => {
      try {
        handleBlogFirestoreError(error, BlogOperationType.LIST, BLOG_COLLECTION);
      } catch (thrown) {
        if (onError) onError(thrown as Error);
      }
    }
  );
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const cleanSlug = decodeURIComponent(slug || '').trim().toLowerCase();
  if (!cleanSlug) return null;

  try {
    const q = query(
      collection(db, BLOG_COLLECTION),
      where('slug', '==', cleanSlug),
      where('status', '==', 'published'),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return normalizeBlogPost({ ...(docSnap.data() as BlogPost), id: docSnap.id });
    }

    // Check due scheduled posts (scheduledAtMs <= now - 5s clock buffer)
    try {
      const schedQ = query(
        collection(db, BLOG_COLLECTION),
        where('slug', '==', cleanSlug),
        where('status', '==', 'scheduled'),
        where('scheduledAtMs', '<=', Date.now() - 5000),
        limit(1)
      );
      const schedSnap = await getDocs(schedQ);
      if (!schedSnap.empty) {
        const d = schedSnap.docs[0];
        return normalizeBlogPost({ ...(d.data() as BlogPost), id: d.id });
      }
    } catch {
      // Optional secondary query; ignore if index missing
    }

    // Fallback: try direct doc ID match
    const directRef = doc(db, BLOG_COLLECTION, cleanSlug);
    const directSnap = await getDoc(directRef);
    if (directSnap.exists()) {
      const data = directSnap.data() as BlogPost;
      if (
        data.status === 'published' ||
        (data.status === 'scheduled' && typeof data.scheduledAtMs === 'number' && data.scheduledAtMs <= Date.now())
      ) {
        return normalizeBlogPost({ ...data, id: directSnap.id });
      }
    }
    return null;
  } catch (error) {
    // Also check if admin is previewing a draft via direct doc lookup
    if (auth?.currentUser) {
      try {
        const adminQ = query(
          collection(db, BLOG_COLLECTION),
          where('slug', '==', cleanSlug),
          limit(1)
        );
        const adminSnap = await getDocs(adminQ);
        if (!adminSnap.empty) {
          const d = adminSnap.docs[0];
          return normalizeBlogPost({ ...(d.data() as BlogPost), id: d.id });
        }
      } catch {
        // proceed to handle error
      }
    }
    handleBlogFirestoreError(error, BlogOperationType.GET, `${BLOG_COLLECTION}/${cleanSlug}`);
    return null;
  }
}

export async function saveBlogPost(post: BlogPost, existingPosts: BlogPost[] = []): Promise<BlogPost> {
  const nowIso = new Date().toISOString();
  const baseSlug = slugifyBlogTitle(post.slug || post.title || 'article');
  let uniqueSlug = baseSlug;

  // Ensure slug uniqueness across other posts
  const conflicting = existingPosts.filter((p) => p.id !== post.id && p.slug === uniqueSlug);
  if (conflicting.length > 0) {
    uniqueSlug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
  }

  const docId = (post.id && /^[a-zA-Z0-9_-]+$/.test(post.id))
    ? post.id
    : `post_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

  const { minutes } = estimateReadingTime(post);
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin.replace(/\/+$/, '')
      : 'https://secretarea.site';

  const parsedScheduledMs =
    post.status === 'scheduled' && post.scheduledAt
      ? Math.floor(new Date(post.scheduledAt).getTime())
      : null;

  const validScheduledMs =
    typeof parsedScheduledMs === 'number' && Number.isFinite(parsedScheduledMs) ? parsedScheduledMs : null;

  const normalizedPost: BlogPost = normalizeBlogPost({
    ...post,
    id: docId,
    slug: uniqueSlug,
    seoTitle: (post.seoTitle || post.title || '').trim(),
    canonicalUrl: (post.canonicalUrl || `${origin}/blog/${uniqueSlug}`).trim(),
    publishedAt:
      post.status === 'scheduled' && post.scheduledAt
        ? post.scheduledAt
        : post.publishedAt || nowIso,
    updatedAt: nowIso,
    scheduledAt: post.status === 'scheduled' ? (post.scheduledAt || nowIso) : '',
    scheduledAtMs: post.status === 'scheduled' ? validScheduledMs : null,
    readingTimeMinutes: post.readingTimeMinutes > 0 ? post.readingTimeMinutes : minutes,
    createdByUid: post.createdByUid || auth?.currentUser?.uid || '',
    createdByEmail: post.createdByEmail || auth?.currentUser?.email || '',
    views: typeof post.views === 'number' ? post.views : 0,
  });

  const payload = sanitizeForFirestore(normalizedPost);

  try {
    await setDoc(doc(db, BLOG_COLLECTION, docId), payload, { merge: true });
    return normalizedPost;
  } catch (error) {
    handleBlogFirestoreError(error, BlogOperationType.WRITE, `${BLOG_COLLECTION}/${docId}`);
    return normalizedPost;
  }
}

export async function deleteBlogPost(postId: string): Promise<void> {
  if (!postId) return;
  try {
    await deleteDoc(doc(db, BLOG_COLLECTION, postId));
  } catch (error) {
    handleBlogFirestoreError(error, BlogOperationType.DELETE, `${BLOG_COLLECTION}/${postId}`);
  }
}

export async function incrementBlogPostView(postId: string): Promise<void> {
  if (!postId) return;
  try {
    const storageKey = `viewed_blog_${postId}`;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(storageKey)) {
      return;
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(storageKey, '1');
    }
    // Only authenticated users or public view counter if allowed; fail silently if unauthenticated
    if (auth?.currentUser) {
      await updateDoc(doc(db, BLOG_COLLECTION, postId), {
        views: increment(1),
      });
    }
  } catch {
    // Non-critical analytics metric
  }
}

export function createEmptyBlogPost(): BlogPost {
  const nowIso = new Date().toISOString();
  const user = auth?.currentUser;
  return {
    id: '',
    status: 'draft',
    language: 'en',
    seoTitle: '',
    metaDescription: '',
    slug: '',
    focusKeyword: '',
    secondaryKeywords: [],
    canonicalUrl: '',
    ogImage: '',
    noIndex: false,
    category: 'Gaming Guides',
    subCategory: '',
    categoryIconUrl: '',
    tags: [],
    title: '',
    introduction: '',
    authorName: user?.displayName || 'Marouan Anouar',
    authorRole: 'Lead Editor · SecretArea',
    authorAvatar: user?.photoURL || '/images/logo04.png',
    authorBio: 'Founder & Lead Architect at SecretArea, curating verified PC repacks, hypervisor runtimes, and performance guides.',
    authorTwitter: '',
    authorGithub: '',
    publishedAt: nowIso,
    updatedAt: nowIso,
    readingTimeMinutes: 5,
    featuredImage: '/images/hero01.png',
    featuredImageAlt: '',
    quickAnswerTitle: 'Quick Answer',
    quickAnswer: '',
    showToc: true,
    sections: [
      {
        id: createBlockId('sec'),
        heading: '',
        headingLevel: 2,
        blocks: [
          {
            id: createBlockId('blk'),
            type: 'paragraph',
            content: '',
          },
        ],
      },
    ],
    comparisonTable: {
      enabled: false,
      title: 'Comparison Table',
      columns: ['Title', 'Platform', 'Size / Price', 'Rating'],
      rows: [{ cells: ['', 'PC / Steam', 'Free', '9.5/10'] }],
    },
    prosCons: {
      enabled: false,
      title: 'Pros & Cons',
      pros: [''],
      cons: [''],
    },
    stepByStep: {
      enabled: false,
      title: 'Step-by-Step Guide',
      steps: [
        {
          id: createBlockId('stp'),
          title: '',
          description: '',
          imageUrl: '',
          imageAlt: '',
          tip: '',
        },
      ],
    },
    metacriticReviews: {
      enabled: false,
      title: 'Reviews & Scores',
      critic: { score: null, positiveCount: 0, mixedCount: 0, negativeCount: 0, summaryText: '' },
      user: { score: null, positiveCount: 0, mixedCount: 0, negativeCount: 0, summaryText: '' },
    },
    whereToBuy: {
      enabled: false,
      title: 'Where to Buy',
      collapseAfter: 2,
      offers: [
        {
          id: createBlockId('off'),
          platform: 'playstation',
          platformLabel: 'PlayStation Store',
          price: '$69.99',
          storeName: 'PlayStation Store',
          affiliateUrl: '',
        },
        {
          id: createBlockId('off'),
          platform: 'xbox',
          platformLabel: 'Xbox Store',
          price: '$69.99',
          storeName: 'Xbox Store',
          affiliateUrl: '',
        },
        {
          id: createBlockId('off'),
          platform: 'steam',
          platformLabel: 'Steam Store',
          price: '$59.99',
          storeName: 'Steam Store',
          affiliateUrl: '',
        },
        {
          id: createBlockId('off'),
          platform: 'epic',
          platformLabel: 'Epic Games Store',
          price: '$59.99',
          storeName: 'Epic Games Store',
          affiliateUrl: '',
        },
      ],
    },
    faqs: [
      {
        id: createBlockId('faq'),
        question: '',
        answer: '',
      },
    ],
    conclusionTitle: 'Conclusion',
    conclusion: '',
    conclusionCtaLabel: 'Explore SecretArea Catalog',
    conclusionCtaUrl: '/game',
    relatedSlugs: [],
    sources: [],
    translations: {},
    views: 0,
  };
}

export function createStarterSeoTemplate(): BlogPost {
  const nowIso = new Date().toISOString();
  const user = auth?.currentUser;
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin.replace(/\/+$/, '')
      : 'https://secretarea.site';
  const slug = 'best-free-pc-games-2027-complete-guide';

  return {
    id: '',
    status: 'draft',
    language: 'en',
    seoTitle: 'Best Free PC Games in 2027: Top Picks & Safe Repacks Guide',
    metaDescription:
      'Discover the best free PC games in 2027 with verified system specs, safe installation steps, pros and cons, and side-by-side comparison tables.',
    slug,
    focusKeyword: 'best free pc games',
    secondaryKeywords: ['free pc games 2027', 'verified pc repacks', 'secretarea gaming guide'],
    canonicalUrl: `${origin}/blog/${slug}`,
    ogImage: '/images/pc_games_banner.jpg',
    noIndex: false,
    category: 'Gaming Guides',
    subCategory: 'PC Optimization',
    categoryIconUrl: '',
    tags: ['PC Gaming', 'Free Games', '2027', 'Guides', 'Repacks'],
    title: 'Best Free PC Games in 2027: 15 Titles Worth Playing Right Now',
    introduction:
      'Discover the best free PC games in 2027 with our expert performance picks, verified download checklist, hardware compatibility notes, and side-by-side comparison.',
    authorName: user?.displayName || 'Marouan Anouar',
    authorRole: 'Chief Curator · SecretArea',
    authorAvatar: user?.photoURL || '/images/logo04.png',
    authorBio:
      'PC gaming architect and SecretArea creator focused on clean benchmarks, verified repacks, and hardware optimization for modern rigs.',
    publishedAt: nowIso,
    updatedAt: nowIso,
    readingTimeMinutes: 8,
    featuredImage: '/images/pc_games_banner.jpg',
    featuredImageAlt: 'Best Free PC Games in 2027 showcase banner on SecretArea',
    quickAnswerTitle: 'Quick Answer',
    quickAnswer:
      'The best free PC games in 2027 combine zero pay-to-win progression with strong 60+ FPS optimization on mid-range GPUs. Top picks span competitive shooters, co-op RPGs, and verified community repacks listed in the SecretArea catalog.',
    showToc: true,
    sections: [
      {
        id: createBlockId('sec'),
        heading: 'Best Free PC Games in 2027 Overview',
        blocks: [
          {
            id: createBlockId('blk'),
            type: 'paragraph',
            content:
              'Finding genuinely great **best free pc games** without bloated installers or intrusive launchers takes careful curation. Below we break down standout releases tested across budget and high-end GPUs, and you can browse our live [PC Games Catalog](/game) or [Co-op & Hypervisor Hub](/hypervisor) anytime.',
          },
          {
            id: createBlockId('blk'),
            type: 'subheading',
            text: 'Performance & Hardware Requirements',
          },
          {
            id: createBlockId('blk'),
            type: 'icon_box',
            icon: 'Cpu',
            title: '60 FPS Target Hardware Baseline',
            description: 'Tested on GTX 1660 Super / RTX 3060 with 16GB DDR4 RAM and NVMe SSD storage for fast asset streaming.',
            accent: 'sky',
          },
          {
            id: createBlockId('blk'),
            type: 'subheading',
            text: 'Visual Showcase & Gameplay Captures',
          },
          {
            id: createBlockId('blk'),
            type: 'slider',
            title: 'Featured 2027 PC Worlds',
            slides: [
              {
                url: '/images/hero01.png',
                alt: 'SecretArea featured PC gaming showcase',
                caption: 'Curated AAA & Indie PC lineup ready to explore',
              },
              {
                url: '/images/gta6_bg.jpg',
                alt: 'Next-gen open world sunset skyline',
                caption: 'Open-world benchmarks & ultra-wide support',
              },
            ],
          },
        ],
      },
      {
        id: createBlockId('sec'),
        heading: 'Verifying File Integrity Before Installing',
        blocks: [
          {
            id: createBlockId('blk'),
            type: 'paragraph',
            content:
              'Always verify SHA-256 checksums after downloading large game archives or community repacks so corrupted blocks never interrupt installation.',
          },
          {
            id: createBlockId('blk'),
            type: 'code',
            language: 'powershell',
            filename: 'verify-checksum.ps1',
            code: 'Get-FileHash -Path ".\\GameArchive.iso" -Algorithm SHA256 | Format-List',
          },
          {
            id: createBlockId('blk'),
            type: 'button',
            label: 'Browse Verified PC Games',
            url: '/game',
            variant: 'gradient',
            icon: 'Gamepad2',
            openInNewTab: false,
          },
        ],
      },
    ],
    comparisonTable: {
      enabled: true,
      title: 'Top Picks Comparison Table',
      columns: ['Game / Category', 'Platform', 'Storage', 'Rating'],
      rows: [
        { cells: ['Competitive Tactical FPS', 'PC / Steam', '42 GB', '9.6 / 10'] },
        { cells: ['Open-World Co-op RPG', 'PC / Crossplay', '68 GB', '9.4 / 10'] },
        { cells: ['Next-Gen Racing Sim', 'PC / Controller', '54 GB', '9.2 / 10'] },
      ],
    },
    prosCons: {
      enabled: true,
      title: 'Pros & Cons of Free-to-Play & Repack Releases',
      pros: [
        'Zero upfront cost with full single-player or co-op campaigns',
        'Verified hash integrity and clean direct cloud mirrors',
        'Low-spec scalability down to 1080p Medium at 60 FPS',
      ],
      cons: [
        'Large initial downloads require stable storage space',
        'Competitive titles require anti-cheat kernel drivers',
      ],
    },
    stepByStep: {
      enabled: true,
      title: 'How to Download and Install Safely',
      steps: [
        {
          id: createBlockId('stp'),
          title: 'Check System Compatibility',
          description: 'Compare your GPU, CPU, and RAM against the recommended baseline before queuing a large download.',
          tip: 'Use the Hardware Compatibility tab inside any SecretArea game card.',
        },
        {
          id: createBlockId('stp'),
          title: 'Verify Mirror & Checksum',
          description: 'Select a fast direct mirror or magnet link and verify the file hash once completed.',
        },
        {
          id: createBlockId('stp'),
          title: 'Install & Optimize Settings',
          description: 'Install onto an SSD, update GPU drivers, and enable DLSS/FSR for smooth frame pacing.',
        },
      ],
    },
    metacriticReviews: {
      enabled: true,
      title: 'Reviews & Scores',
      critic: {
        score: 88,
        positiveCount: 42,
        mixedCount: 5,
        negativeCount: 1,
        summaryText: 'Universal Acclaim',
      },
      user: {
        score: 86,
        positiveCount: 310,
        mixedCount: 34,
        negativeCount: 16,
        summaryText: 'Generally Favorable',
      },
    },
    whereToBuy: {
      enabled: true,
      title: 'Where to Buy',
      collapseAfter: 2,
      offers: [
        {
          id: createBlockId('off'),
          platform: 'playstation',
          platformLabel: 'PlayStation Store',
          price: '$69.99',
          storeName: 'PlayStation Store',
          affiliateUrl: 'https://store.playstation.com/',
        },
        {
          id: createBlockId('off'),
          platform: 'xbox',
          platformLabel: 'Xbox Store',
          price: '$69.99',
          storeName: 'Xbox Store',
          affiliateUrl: 'https://www.xbox.com/games/store',
        },
        {
          id: createBlockId('off'),
          platform: 'steam',
          platformLabel: 'Steam Store',
          price: '$59.99',
          storeName: 'Steam Store',
          affiliateUrl: 'https://store.steampowered.com/',
          badge: 'PC Verified',
        },
        {
          id: createBlockId('off'),
          platform: 'epic',
          platformLabel: 'Epic Games Store',
          price: '$59.99',
          storeName: 'Epic Games Store',
          affiliateUrl: 'https://store.epicgames.com/',
        },
      ],
    },
    faqs: [
      {
        id: createBlockId('faq'),
        question: 'Are all featured PC games free to download and play?',
        answer: 'Yes. Every title highlighted in this guide is either free-to-play or available via verified community archives without hidden paywalls.',
      },
      {
        id: createBlockId('faq'),
        question: 'What GPU do I need for 1080p 60 FPS in 2027?',
        answer: 'An NVIDIA RTX 3060 or AMD RX 6600 XT with 16GB RAM comfortably handles nearly every release on High settings at 1080p.',
      },
      {
        id: createBlockId('faq'),
        question: 'How do I report a broken mirror link on SecretArea?',
        answer: 'Open any game detail modal and click Report an Issue so our admin team can update mirrors immediately.',
      },
    ],
    conclusionTitle: 'Final Verdict & Next Steps',
    conclusion:
      'Whether you prefer competitive multiplayer arenas or story-driven open worlds, 2027 offers unprecedented quality for PC players without spending a dime. Explore our live catalog to filter by genre, co-op support, and storage size.',
    conclusionCtaLabel: 'Open SecretArea Game Hub',
    conclusionCtaUrl: '/game',
    relatedSlugs: [],
    sources: [
      {
        id: createBlockId('src'),
        label: 'SecretArea PC Games & Repacks Catalog',
        url: 'https://secretarea.site/game',
      },
      {
        id: createBlockId('src'),
        label: 'SecretArea Tools & Utilities Hub',
        url: 'https://secretarea.site/tools',
      },
    ],
    translations: {},
    views: 0,
  };
}
