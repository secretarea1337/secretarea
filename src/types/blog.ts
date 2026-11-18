export type BlogLanguage = 'en' | 'fr' | 'es' | 'ar';
export type BlogStatus = 'draft' | 'published' | 'scheduled';
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type BlogBlockType =
  | 'subheading'
  | 'paragraph'
  | 'html'
  | 'image'
  | 'multi_image'
  | 'slider'
  | 'video'
  | 'code'
  | 'button'
  | 'icon_box'
  | 'callout'
  | 'checklist'
  | 'divider';

export interface BlogImageItem {
  url: string;
  alt: string;
  caption?: string;
}

export interface SubheadingBlock {
  id: string;
  type: 'subheading';
  level?: HeadingLevel;
  text: string;
}

export interface ParagraphBlock {
  id: string;
  type: 'paragraph';
  content: string;
  align?: 'left' | 'center' | 'right';
}

export interface HtmlBlock {
  id: string;
  type: 'html';
  title?: string;
  html: string;
  css?: string;
}

export interface ImageBlock {
  id: string;
  type: 'image';
  url: string;
  alt: string;
  caption?: string;
}

export interface MultiImageBlock {
  id: string;
  type: 'multi_image';
  columns: 2 | 3;
  images: BlogImageItem[];
}

export interface SliderBlock {
  id: string;
  type: 'slider';
  title?: string;
  slides: BlogImageItem[];
}

export interface VideoBlock {
  id: string;
  type: 'video';
  url: string;
  title?: string;
  caption?: string;
}

export interface CodeBlock {
  id: string;
  type: 'code';
  language: string;
  filename?: string;
  code: string;
}

export interface ButtonBlock {
  id: string;
  type: 'button';
  label: string;
  url: string;
  variant: 'primary' | 'secondary' | 'outline' | 'gradient';
  icon?: string;
  openInNewTab?: boolean;
}

export interface IconBoxBlock {
  id: string;
  type: 'icon_box';
  icon: string;
  title: string;
  description: string;
  accent?: 'sky' | 'violet' | 'emerald' | 'amber' | 'rose';
}

export interface CalloutBlock {
  id: string;
  type: 'callout';
  tone: 'info' | 'tip' | 'warning' | 'quote';
  title?: string;
  content: string;
}

export interface ChecklistBlock {
  id: string;
  type: 'checklist';
  title?: string;
  items: string[];
}

export interface DividerBlock {
  id: string;
  type: 'divider';
  style?: 'line' | 'dots' | 'glow';
}

export type BlogContentBlock =
  | SubheadingBlock
  | ParagraphBlock
  | HtmlBlock
  | ImageBlock
  | MultiImageBlock
  | SliderBlock
  | VideoBlock
  | CodeBlock
  | ButtonBlock
  | IconBoxBlock
  | CalloutBlock
  | ChecklistBlock
  | DividerBlock;

export interface BlogSection {
  id: string;
  heading: string;
  headingLevel?: HeadingLevel;
  blocks: BlogContentBlock[];
}

export interface BlogReviewBreakdown {
  score: number | null; // 0-100 or null for tbd
  positiveCount: number;
  mixedCount: number;
  negativeCount: number;
  summaryText?: string;
}

export interface BlogMetacriticReviews {
  enabled: boolean;
  title?: string;
  critic: BlogReviewBreakdown;
  user: BlogReviewBreakdown;
}

export type BlogStorePlatform =
  | 'playstation'
  | 'xbox'
  | 'steam'
  | 'epic'
  | 'nintendo'
  | 'gog'
  | 'amazon'
  | 'other';

export interface BlogPlatformOffer {
  id: string;
  platform: BlogStorePlatform;
  platformLabel: string;
  price: string;
  storeName?: string;
  affiliateUrl: string;
  badge?: string;
}

export interface BlogWhereToBuy {
  enabled: boolean;
  title?: string;
  offers: BlogPlatformOffer[];
  collapseAfter?: number;
}

export interface BlogComparisonRow {
  cells: string[];
}

export interface BlogComparisonTable {
  enabled: boolean;
  title: string;
  columns: string[];
  rows: BlogComparisonRow[];
}

export interface BlogProsCons {
  enabled: boolean;
  title?: string;
  pros: string[];
  cons: string[];
}

export interface BlogStepItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  tip?: string;
}

export interface BlogStepByStep {
  enabled: boolean;
  title: string;
  steps: BlogStepItem[];
}

export interface BlogFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface BlogSourceItem {
  id: string;
  label: string;
  url: string;
}

export interface BlogTranslationOverride {
  title?: string;
  seoTitle?: string;
  metaDescription?: string;
  introduction?: string;
  quickAnswer?: string;
  conclusion?: string;
}

export interface BlogPost {
  id: string;
  status: BlogStatus;
  language: BlogLanguage;

  // 1. SEO Metadata
  seoTitle: string;
  metaDescription: string;
  slug: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  canonicalUrl: string;
  ogImage?: string;
  noIndex?: boolean;

  // 2. Article Header
  category: string;
  subCategory?: string;
  categoryIconUrl?: string;
  tags: string[];
  title: string;
  introduction: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  authorBio: string;
  authorTwitter?: string;
  authorGithub?: string;
  publishedAt: string;
  updatedAt: string;
  scheduledAt?: string;
  scheduledAtMs?: number | null;
  readingTimeMinutes: number;
  featuredImage: string;
  featuredImageAlt: string;

  // 3. Quick Answer
  quickAnswerTitle?: string;
  quickAnswer: string;

  // 4. Table of Contents
  showToc: boolean;

  // 5. Main Article Sections (H2 + H3 + Rich Blocks)
  sections: BlogSection[];

  // 6. Comparison Table (Optional)
  comparisonTable: BlogComparisonTable;

  // 8. Pros & Cons (Optional)
  prosCons: BlogProsCons;

  // 9. Step-by-Step Guide (Optional)
  stepByStep: BlogStepByStep;

  // Optional Metacritic-style Reviews & Platform Store Affiliate Links
  metacriticReviews?: BlogMetacriticReviews;
  whereToBuy?: BlogWhereToBuy;

  // 10. FAQ Section
  faqs: BlogFaqItem[];

  // 11. Conclusion
  conclusionTitle?: string;
  conclusion: string;
  conclusionCtaLabel?: string;
  conclusionCtaUrl?: string;

  // 13. Related Articles
  relatedSlugs: string[];

  // 14. Sources & References
  sources: BlogSourceItem[];

  // Localized Overrides (Optional)
  translations?: Partial<Record<BlogLanguage, BlogTranslationOverride>>;

  // Flexible Layout Ordering (tokens: 'sec:<id>' | 'mod:<BlogModuleKey>')
  contentOrder?: string[];

  // Optional Manual Full HTML Article Mode
  useCustomHtml?: boolean;
  customHtml?: string;
  customCss?: string;

  // Engagement & Ownership
  views?: number;
  createdByUid?: string;
  createdByEmail?: string;
}

export type BlogModuleKey =
  | 'comparison'
  | 'pros_cons'
  | 'steps'
  | 'reviews'
  | 'where_to_buy'
  | 'faq';

export const BLOG_MODULE_KEYS: BlogModuleKey[] = [
  'comparison',
  'pros_cons',
  'steps',
  'reviews',
  'where_to_buy',
  'faq',
];

export function resolveArticleFlowOrder(post: BlogPost): string[] {
  const sectionTokens = (post.sections || []).map((s) => `sec:${s.id}`);
  const moduleTokens = BLOG_MODULE_KEYS.map((k) => `mod:${k}`);
  const validSet = new Set<string>([...sectionTokens, ...moduleTokens]);
  const raw = Array.isArray(post.contentOrder) ? post.contentOrder : [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const tok of raw) {
    if (typeof tok === 'string' && validSet.has(tok) && !seen.has(tok)) {
      seen.add(tok);
      result.push(tok);
    }
  }

  for (let i = 0; i < sectionTokens.length; i++) {
    const tok = sectionTokens[i];
    if (seen.has(tok)) continue;
    let insertAt = -1;
    for (let prev = i - 1; prev >= 0; prev--) {
      const idx = result.indexOf(sectionTokens[prev]);
      if (idx !== -1) {
        insertAt = idx + 1;
        break;
      }
    }
    if (insertAt === -1) {
      const firstModIdx = result.findIndex((item) => item.startsWith('mod:'));
      insertAt = firstModIdx !== -1 ? firstModIdx : result.length;
    }
    result.splice(insertAt, 0, tok);
    seen.add(tok);
  }

  for (const mTok of moduleTokens) {
    if (!seen.has(mTok)) {
      seen.add(mTok);
      result.push(mTok);
    }
  }

  return result;
}

export function slugifyBlogTitle(input: string, fallback = 'untitled-article'): string {
  const cleaned = String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`"]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || fallback;
}

export function createBlockId(prefix = 'blk'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function getComparisonRowCells(row: BlogComparisonRow | string[] | unknown): string[] {
  if (Array.isArray(row)) {
    return row.map((cell) => String(cell ?? ''));
  }
  if (row && typeof row === 'object' && Array.isArray((row as BlogComparisonRow).cells)) {
    return (row as BlogComparisonRow).cells.map((cell) => String(cell ?? ''));
  }
  return [];
}
