import { BlogPost, BlogContentBlock } from '../types/blog';

export type SeoCheckStatus = 'pass' | 'warn' | 'fail';

export interface SeoCheckItem {
  id: string;
  category: 'metadata' | 'header' | 'content' | 'media' | 'engagement' | 'technical';
  label: string;
  hint: string;
  status: SeoCheckStatus;
  points: number;
  maxPoints: number;
  targetSection?: string;
}

export interface BlogSeoAnalysis {
  score: number;
  grade: 'Needs Work' | 'Fair' | 'Strong' | 'SEO Ready';
  wordCount: number;
  estimatedReadingMinutes: number;
  h2Count: number;
  h3Count: number;
  imageCount: number;
  imagesWithAltCount: number;
  internalLinksCount: number;
  externalLinksCount: number;
  checks: SeoCheckItem[];
}

function stripHtmlTags(raw: string): string {
  return String(raw || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ');
}

function extractTextFromBlock(block: BlogContentBlock): string {
  switch (block.type) {
    case 'subheading':
      return block.text || '';
    case 'paragraph':
      return stripHtmlTags(block.content || '');
    case 'html':
      return stripHtmlTags(block.html || '');
    case 'callout':
      return `${block.title || ''} ${block.content || ''}`;
    case 'icon_box':
      return `${block.title || ''} ${block.description || ''}`;
    case 'button':
      return block.label || '';
    case 'code':
      return block.code || '';
    case 'image':
      return block.caption || '';
    case 'multi_image':
      return (block.images || []).map((i) => i.caption || '').join(' ');
    case 'slider':
      return `${block.title || ''} ${(block.slides || []).map((s) => s.caption || '').join(' ')}`;
    case 'video':
      return `${block.title || ''} ${block.caption || ''}`;
    case 'checklist':
      return `${block.title || ''} ${(block.items || []).join(' ')}`;
    case 'divider':
      return '';
    default:
      return '';
  }
}

function countWords(text: string): number {
  const cleaned = stripHtmlTags(text)
    .replace(/[#*_`>\[\]()]/g, ' ')
    .trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

function extractUrlsFromText(text: string): string[] {
  if (!text) return [];
  const matches: string[] = [];
  const mdLinkRegex = /\[[^\]]*\]\(([^)\s]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = mdLinkRegex.exec(text)) !== null) {
    if (m[1]) matches.push(m[1]);
  }
  const rawUrlRegex = /https?:\/\/[^\s)"'<>]+/g;
  while ((m = rawUrlRegex.exec(text)) !== null) {
    if (m[0]) matches.push(m[0]);
  }
  return matches;
}

function isInternalUrl(url: string): boolean {
  const trimmed = (url || '').trim().toLowerCase();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) return true;
  if (trimmed.includes('secretarea.site') || trimmed.includes('secretarea.vercel.app')) return true;
  return false;
}

export function estimateReadingTime(post: Partial<BlogPost>): { wordCount: number; minutes: number } {
  const textParts: string[] = [
    post.title || '',
    post.introduction || '',
    post.quickAnswer || '',
    post.conclusion || '',
  ];

  if (post.useCustomHtml && post.customHtml) {
    textParts.push(stripHtmlTags(post.customHtml));
  }

  (post.sections || []).forEach((sec) => {
    textParts.push(sec.heading || '');
    (sec.blocks || []).forEach((blk) => {
      textParts.push(extractTextFromBlock(blk));
    });
  });

  if (post.prosCons?.enabled) {
    textParts.push(...(post.prosCons.pros || []), ...(post.prosCons.cons || []));
  }

  if (post.stepByStep?.enabled) {
    (post.stepByStep.steps || []).forEach((st) => {
      textParts.push(st.title || '', st.description || '', st.tip || '');
    });
  }

  (post.faqs || []).forEach((f) => {
    textParts.push(f.question || '', f.answer || '');
  });

  const wordCount = countWords(textParts.join(' '));
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return { wordCount, minutes };
}

export function analyzeBlogSeo(post: BlogPost): BlogSeoAnalysis {
  const { wordCount, minutes } = estimateReadingTime(post);
  const kw = (post.focusKeyword || '').trim().toLowerCase();

  let h2Count = 0;
  let h3Count = 0;
  let imageCount = post.featuredImage?.trim() ? 1 : 0;
  let imagesWithAltCount = post.featuredImage?.trim() && post.featuredImageAlt?.trim() ? 1 : 0;
  let hasRichMedia = false;

  const collectedUrls: string[] = [];
  if (post.conclusionCtaUrl?.trim()) collectedUrls.push(post.conclusionCtaUrl.trim());
  (post.sources || []).forEach((s) => {
    if (s.url?.trim()) collectedUrls.push(s.url.trim());
  });
  (post.relatedSlugs || []).forEach((slug) => {
    if (slug?.trim()) collectedUrls.push(`/blog/${slug.trim()}`);
  });

  const auditHtmlSnippets = (html: string) => {
    if (!html) return;
    h2Count += (html.match(/<h2\b/gi) || []).length;
    h3Count += (html.match(/<h3\b/gi) || []).length;
    const imgTags = html.match(/<img\b[^>]*>/gi) || [];
    imgTags.forEach((tag) => {
      imageCount += 1;
      hasRichMedia = true;
      if (/alt\s*=\s*["'][^"']+["']/i.test(tag)) imagesWithAltCount += 1;
    });
    const hrefMatches = html.matchAll(/href\s*=\s*["']([^"']+)["']/gi);
    for (const m of hrefMatches) {
      if (m[1]) collectedUrls.push(m[1]);
    }
    if (/<(?:table|iframe|video|blockquote)\b/i.test(html)) hasRichMedia = true;
  };

  if (post.useCustomHtml && post.customHtml?.trim()) {
    auditHtmlSnippets(post.customHtml);
  }

  (post.sections || []).forEach((sec) => {
    if (sec.heading?.trim()) {
      const secLvl = sec.headingLevel ?? 2;
      if (secLvl === 2) h2Count += 1;
      else h3Count += 1;
    }
    (sec.blocks || []).forEach((blk) => {
      if (blk.type === 'subheading' && blk.text?.trim()) {
        const lvl = blk.level ?? 3;
        if (lvl === 2) h2Count += 1;
        else h3Count += 1;
      } else if (blk.type === 'paragraph') {
        collectedUrls.push(...extractUrlsFromText(blk.content || ''));
        auditHtmlSnippets(blk.content || '');
      } else if (blk.type === 'html') {
        collectedUrls.push(...extractUrlsFromText(blk.html || ''));
        auditHtmlSnippets(blk.html || '');
      } else if (blk.type === 'callout') {
        collectedUrls.push(...extractUrlsFromText(blk.content || ''));
      } else if (blk.type === 'image' && blk.url?.trim()) {
        imageCount += 1;
        hasRichMedia = true;
        if (blk.alt?.trim()) imagesWithAltCount += 1;
      } else if (blk.type === 'multi_image') {
        (blk.images || []).forEach((img) => {
          if (img.url?.trim()) {
            imageCount += 1;
            hasRichMedia = true;
            if (img.alt?.trim()) imagesWithAltCount += 1;
          }
        });
      } else if (blk.type === 'slider') {
        (blk.slides || []).forEach((sl) => {
          if (sl.url?.trim()) {
            imageCount += 1;
            hasRichMedia = true;
            if (sl.alt?.trim()) imagesWithAltCount += 1;
          }
        });
      } else if (blk.type === 'video' && blk.url?.trim()) {
        hasRichMedia = true;
      } else if (blk.type === 'code' && blk.code?.trim()) {
        hasRichMedia = true;
      } else if (blk.type === 'button' && blk.url?.trim()) {
        collectedUrls.push(blk.url.trim());
      }
    });
  });

  if (post.whereToBuy?.enabled) {
    (post.whereToBuy.offers || []).forEach((offer) => {
      if (offer.affiliateUrl?.trim()) {
        collectedUrls.push(offer.affiliateUrl.trim());
      }
    });
  }

  if (post.stepByStep?.enabled) {
    (post.stepByStep.steps || []).forEach((st) => {
      if (st.imageUrl?.trim()) {
        imageCount += 1;
        hasRichMedia = true;
        if (st.imageAlt?.trim()) imagesWithAltCount += 1;
      }
    });
  }

  const internalLinksCount = collectedUrls.filter(isInternalUrl).length;
  const externalLinksCount = collectedUrls.filter((u) => !isInternalUrl(u) && /^https?:\/\//i.test(u)).length;

  const checks: SeoCheckItem[] = [];

  // 1. SEO Title (max 8 pts)
  const seoTitleLen = (post.seoTitle || '').trim().length;
  const seoTitleHasKw = kw ? (post.seoTitle || '').toLowerCase().includes(kw) : false;
  checks.push({
    id: 'seo_title',
    category: 'metadata',
    label: 'SEO Title (30–65 chars) + Focus Keyword',
    hint:
      seoTitleLen === 0
        ? 'Add an SEO title between 30 and 65 characters.'
        : seoTitleLen < 30 || seoTitleLen > 65
        ? `Currently ${seoTitleLen} chars. Aim for 30–65 chars${kw && !seoTitleHasKw ? ' and include your focus keyword' : ''}.`
        : kw && !seoTitleHasKw
        ? 'Great length! Include your focus keyword in the SEO Title.'
        : `Optimal (${seoTitleLen} chars)${kw ? ' with focus keyword' : ''}.`,
    status: seoTitleLen >= 30 && seoTitleLen <= 65 && (!kw || seoTitleHasKw) ? 'pass' : seoTitleLen > 0 ? 'warn' : 'fail',
    points: seoTitleLen >= 30 && seoTitleLen <= 65 && (!kw || seoTitleHasKw) ? 8 : seoTitleLen > 0 ? 4 : 0,
    maxPoints: 8,
    targetSection: 'seo',
  });

  // 2. Meta Description (max 8 pts)
  const metaLen = (post.metaDescription || '').trim().length;
  const metaHasKw = kw ? (post.metaDescription || '').toLowerCase().includes(kw) : false;
  checks.push({
    id: 'meta_description',
    category: 'metadata',
    label: 'Meta Description (120–160 chars)',
    hint:
      metaLen === 0
        ? 'Write a compelling summary (120–160 chars) for Google snippets.'
        : metaLen < 120 || metaLen > 165
        ? `Currently ${metaLen} chars. Optimal snippet length is 120–160 chars.`
        : kw && !metaHasKw
        ? 'Good length! Try naturally adding your focus keyword.'
        : `Optimal (${metaLen} chars).`,
    status: metaLen >= 120 && metaLen <= 165 && (!kw || metaHasKw) ? 'pass' : metaLen > 0 ? 'warn' : 'fail',
    points: metaLen >= 120 && metaLen <= 165 && (!kw || metaHasKw) ? 8 : metaLen > 0 ? 4 : 0,
    maxPoints: 8,
    targetSection: 'seo',
  });

  // 3. URL Slug & Focus Keyword (max 8 pts)
  const slugOk = Boolean(post.slug?.trim()) && /^[a-z0-9\u0600-\u06ff-]+$/.test(post.slug.trim());
  const kwOk = kw.length >= 2 && (post.secondaryKeywords || []).length >= 1;
  checks.push({
    id: 'slug_keywords',
    category: 'metadata',
    label: 'Clean URL Slug & Keywords',
    hint: !slugOk
      ? 'Set a clean hyphenated URL slug generated from the title.'
      : !kw
      ? 'Add a Focus Keyword and 1+ Secondary Keywords.'
      : 'Clean indexable slug and target keywords configured.',
    status: slugOk && kwOk ? 'pass' : slugOk || kw.length >= 2 ? 'warn' : 'fail',
    points: slugOk && kwOk ? 8 : slugOk || kw.length >= 2 ? 4 : 0,
    maxPoints: 8,
    targetSection: 'seo',
  });

  // 4. Canonical URL (max 4 pts)
  const hasCanonical = Boolean(post.canonicalUrl?.trim());
  checks.push({
    id: 'canonical',
    category: 'metadata',
    label: 'Canonical URL Set',
    hint: hasCanonical ? 'Canonical URL prevents duplicate indexing.' : 'Set or auto-fill the canonical URL.',
    status: hasCanonical ? 'pass' : 'warn',
    points: hasCanonical ? 4 : 1,
    maxPoints: 4,
    targetSection: 'seo',
  });

  // 5. Article Header (H1, Intro, Category) (max 8 pts)
  const hasH1 = Boolean(post.title?.trim());
  const hasIntro = (post.introduction || '').trim().length >= 40;
  const hasCategory = Boolean(post.category?.trim());
  checks.push({
    id: 'article_header',
    category: 'header',
    label: 'H1 Title, Category & Introduction',
    hint: hasH1 && hasIntro && hasCategory ? 'Article header is complete and reader-ready.' : 'Fill H1 Title, Category, and a 40+ char Short Introduction.',
    status: hasH1 && hasIntro && hasCategory ? 'pass' : hasH1 ? 'warn' : 'fail',
    points: hasH1 && hasIntro && hasCategory ? 8 : hasH1 ? 4 : 0,
    maxPoints: 8,
    targetSection: 'header',
  });

  // 6. Featured Image & Alt Text (max 8 pts)
  const hasFeatured = Boolean(post.featuredImage?.trim());
  const hasFeaturedAlt = Boolean(post.featuredImageAlt?.trim());
  checks.push({
    id: 'featured_image',
    category: 'media',
    label: 'Featured Image & Alt Attribute',
    hint:
      hasFeatured && hasFeaturedAlt
        ? 'Featured image and descriptive alt attribute present.'
        : hasFeatured
        ? 'Add descriptive Alt text for accessibility & Google Image SEO.'
        : 'Add a Featured Image URL and Alt text.',
    status: hasFeatured && hasFeaturedAlt ? 'pass' : hasFeatured ? 'warn' : 'fail',
    points: hasFeatured && hasFeaturedAlt ? 8 : hasFeatured ? 4 : 0,
    maxPoints: 8,
    targetSection: 'header',
  });

  // 7. Quick Answer (max 7 pts)
  const quickLen = stripHtmlTags(post.quickAnswer || '').trim().length;
  checks.push({
    id: 'quick_answer',
    category: 'content',
    label: 'Quick Answer (AI & Featured Snippet Ready)',
    hint: quickLen >= 40 ? 'Concise Quick Answer ready for AI Overviews & featured snippets.' : 'Write a clear 1–3 sentence Quick Answer summary.',
    status: quickLen >= 40 ? 'pass' : quickLen > 0 ? 'warn' : 'fail',
    points: quickLen >= 40 ? 7 : quickLen > 0 ? 3 : 0,
    maxPoints: 7,
    targetSection: 'quick_answer',
  });

  // 8. H2 / H3 Heading Hierarchy (max 10 pts)
  checks.push({
    id: 'heading_hierarchy',
    category: 'content',
    label: 'Structured H2 Sections & H3 Subsections',
    hint:
      h2Count >= 3 && h3Count >= 2
        ? `${h2Count} H2 sections and ${h3Count} H3 subsections structured.`
        : `Currently ${h2Count} H2 and ${h3Count} H3. Aim for 3+ H2 sections and 2+ H3 subsections.`,
    status: h2Count >= 3 && h3Count >= 2 ? 'pass' : h2Count >= 1 ? 'warn' : 'fail',
    points: h2Count >= 3 && h3Count >= 2 ? 10 : h2Count >= 2 ? 6 : h2Count >= 1 ? 3 : 0,
    maxPoints: 10,
    targetSection: 'sections',
  });

  // 9. Content Depth / Word Count (max 10 pts)
  checks.push({
    id: 'word_count',
    category: 'content',
    label: 'Article Depth (600+ words recommended)',
    hint:
      wordCount >= 600
        ? `Strong depth: ${wordCount} words (~${minutes} min read).`
        : `Currently ${wordCount} words. Aim for 600+ words for competitive ranking.`,
    status: wordCount >= 600 ? 'pass' : wordCount >= 250 ? 'warn' : 'fail',
    points: wordCount >= 600 ? 10 : wordCount >= 250 ? 6 : wordCount > 50 ? 2 : 0,
    maxPoints: 10,
    targetSection: 'sections',
  });

  // 10. Rich Media & Image Alt Audit (max 8 pts)
  const allImagesHaveAlt = imageCount > 0 && imagesWithAltCount === imageCount;
  checks.push({
    id: 'rich_media',
    category: 'media',
    label: 'Rich Media Blocks & Image Alt Tags',
    hint:
      hasRichMedia && allImagesHaveAlt
        ? `${imageCount} image(s) with 100% alt coverage + rich media.`
        : imageCount > 0 && !allImagesHaveAlt
        ? `${imagesWithAltCount}/${imageCount} images have alt text. Fill missing alt text.`
        : 'Add inline images, slides, video, code, or interactive buttons.',
    status: hasRichMedia && allImagesHaveAlt ? 'pass' : imageCount > 0 || hasRichMedia ? 'warn' : 'fail',
    points: hasRichMedia && allImagesHaveAlt ? 8 : imageCount > 0 || hasRichMedia ? 4 : 0,
    maxPoints: 8,
    targetSection: 'sections',
  });

  // 11. Structured Enhancements (Table / Pros & Cons / Step Guide) (max 5 pts)
  const extrasCount =
    (post.comparisonTable?.enabled ? 1 : 0) +
    (post.prosCons?.enabled ? 1 : 0) +
    (post.stepByStep?.enabled ? 1 : 0);
  checks.push({
    id: 'structured_modules',
    category: 'content',
    label: 'Comparison Table, Pros & Cons, or Step Guide',
    hint:
      extrasCount >= 1
        ? `${extrasCount} optional structured UX module(s) active.`
        : 'Enable a Comparison Table, Pros & Cons, or Step-by-Step Guide to boost engagement.',
    status: extrasCount >= 1 ? 'pass' : 'warn',
    points: extrasCount >= 1 ? 5 : 0,
    maxPoints: 5,
    targetSection: 'extras',
  });

  // 12. FAQ Section (max 6 pts)
  const validFaqs = (post.faqs || []).filter((f) => f.question?.trim() && f.answer?.trim());
  checks.push({
    id: 'faq_section',
    category: 'engagement',
    label: 'FAQ Section (2–4+ Questions for Rich Snippets)',
    hint:
      validFaqs.length >= 2
        ? `${validFaqs.length} FAQ items ready with FAQPage JSON-LD schema.`
        : 'Add at least 2–4 FAQ questions & answers to unlock Google FAQ rich snippets.',
    status: validFaqs.length >= 2 ? 'pass' : validFaqs.length === 1 ? 'warn' : 'fail',
    points: validFaqs.length >= 2 ? 6 : validFaqs.length === 1 ? 3 : 0,
    maxPoints: 6,
    targetSection: 'faqs',
  });

  // 13. Conclusion & Author Bio (max 5 pts)
  const hasConclusion = stripHtmlTags(post.conclusion || '').trim().length >= 30;
  const hasAuthorBio = Boolean(post.authorName?.trim()) && (post.authorBio || '').trim().length >= 20;
  checks.push({
    id: 'conclusion_author',
    category: 'engagement',
    label: 'Conclusion & E-E-A-T Author Bio',
    hint:
      hasConclusion && hasAuthorBio
        ? 'Conclusion and E-E-A-T Author Bio complete.'
        : 'Complete both the Conclusion and Author Bio for E-E-A-T trust.',
    status: hasConclusion && hasAuthorBio ? 'pass' : hasConclusion || hasAuthorBio ? 'warn' : 'fail',
    points: hasConclusion && hasAuthorBio ? 5 : hasConclusion || hasAuthorBio ? 3 : 0,
    maxPoints: 5,
    targetSection: 'conclusion',
  });

  // 14. Internal Links, Sources & Related Articles (max 5 pts)
  const hasSources = (post.sources || []).some((s) => s.label?.trim() && s.url?.trim());
  checks.push({
    id: 'links_sources',
    category: 'technical',
    label: 'Internal Links & Trusted Sources',
    hint:
      internalLinksCount >= 1 && (hasSources || externalLinksCount >= 1)
        ? `${internalLinksCount} internal link(s), ${externalLinksCount} external link(s).`
        : 'Add internal links (e.g. /game, /blog/...) and 1+ trusted Source/Reference.',
    status: internalLinksCount >= 1 && (hasSources || externalLinksCount >= 1) ? 'pass' : internalLinksCount >= 1 || hasSources ? 'warn' : 'fail',
    points: internalLinksCount >= 1 && (hasSources || externalLinksCount >= 1) ? 5 : internalLinksCount >= 1 || hasSources ? 3 : 0,
    maxPoints: 5,
    targetSection: 'sources',
  });

  // Total score out of 100
  const earned = checks.reduce((acc, c) => acc + c.points, 0);
  const maxTotal = checks.reduce((acc, c) => acc + c.maxPoints, 0) || 100;
  const score = Math.min(100, Math.round((earned / maxTotal) * 100));

  const grade: BlogSeoAnalysis['grade'] =
    score >= 85 ? 'SEO Ready' : score >= 65 ? 'Strong' : score >= 40 ? 'Fair' : 'Needs Work';

  return {
    score,
    grade,
    wordCount,
    estimatedReadingMinutes: minutes,
    h2Count,
    h3Count,
    imageCount,
    imagesWithAltCount,
    internalLinksCount,
    externalLinksCount,
    checks,
  };
}
