import React, { useState, useMemo, useId } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import {
  TbCopy,
  TbCheck,
  TbChevronLeft,
  TbChevronRight,
  TbPhotoOff,
  TbInfoCircle,
  TbBulb,
  TbAlertTriangle,
  TbQuote,
  TbExternalLink,
  TbMaximize,
  TbX,
  TbVideo,
  TbCheck as TbChecklistMark,
} from 'react-icons/tb';
import Icon from './Icon';
import { BlogContentBlock, BlogImageItem, HeadingLevel, slugifyBlogTitle } from '../src/types/blog';
import { useLanguage } from '../src/contexts/LanguageContext';

const ALLOWED_IFRAME_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'www.dailymotion.com',
  'player.twitch.tv',
];

let domPurifyConfigured = false;
function ensureDomPurifyHooks() {
  if (domPurifyConfigured || typeof window === 'undefined') return;
  domPurifyConfigured = true;
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'iframe') {
      const el = node as HTMLElement;
      const src = el.getAttribute('src') || '';
      try {
        const parsed = new URL(src, window.location.origin);
        const host = parsed.hostname.toLowerCase();
        const allowed = ALLOWED_IFRAME_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
        if (!allowed) {
          el.parentNode?.removeChild(el);
        }
      } catch {
        el.parentNode?.removeChild(el);
      }
    }
  });
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      const href = node.getAttribute('href') || '';
      if (href && !href.startsWith('/') && !href.startsWith('#')) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    }
    if (node.tagName === 'IMG') {
      if (!node.getAttribute('referrerpolicy')) {
        node.setAttribute('referrerpolicy', 'no-referrer');
      }
    }
  });
}

export function sanitizeRichHtml(rawHtml: string): string {
  if (!rawHtml?.trim()) return '';
  if (typeof window === 'undefined') return rawHtml;
  ensureDomPurifyHooks();
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'div', 'span', 'br', 'hr',
      'strong', 'b', 'em', 'i', 'u', 's', 'del', 'strike', 'mark', 'small', 'sub', 'sup',
      'ul', 'ol', 'li', 'dl', 'dt', 'dd',
      'blockquote', 'pre', 'code', 'kbd',
      'a', 'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
      'iframe', 'video', 'source',
      'details', 'summary', 'section', 'article', 'header', 'footer', 'aside', 'main', 'nav', 'font',
    ],
    ALLOWED_ATTR: [
      'id', 'class', 'style', 'dir', 'lang', 'title', 'role',
      'href', 'target', 'rel',
      'src', 'alt', 'width', 'height', 'loading', 'referrerpolicy',
      'controls', 'preload', 'poster', 'type',
      'allow', 'allowfullscreen', 'frameborder',
      'colspan', 'rowspan', 'color', 'face', 'size', 'align', 'open',
    ],
    ALLOW_DATA_ATTR: false,
  });
}

export function extractHtmlAndStyles(rawHtml: string): { bodyHtml: string; extractedCss: string } {
  const raw = rawHtml || '';
  if (!raw.trim()) return { bodyHtml: '', extractedCss: '' };
  const styles: string[] = [];
  const bodyHtml = raw.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_match, cssContent) => {
    if (cssContent && cssContent.trim()) {
      styles.push(cssContent.trim());
    }
    return '';
  });
  return {
    bodyHtml: bodyHtml.trim(),
    extractedCss: styles.join('\n\n'),
  };
}

function splitCssSelectors(selectorGroup: string): string[] {
  const parts: string[] = [];
  let buf = '';
  let parenDepth = 0;
  let bracketDepth = 0;
  for (let i = 0; i < selectorGroup.length; i += 1) {
    const ch = selectorGroup[i];
    if (ch === '(') parenDepth += 1;
    else if (ch === ')') parenDepth = Math.max(0, parenDepth - 1);
    else if (ch === '[') bracketDepth += 1;
    else if (ch === ']') bracketDepth = Math.max(0, bracketDepth - 1);

    if (ch === ',' && parenDepth === 0 && bracketDepth === 0) {
      if (buf.trim()) parts.push(buf.trim());
      buf = '';
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts;
}

function sanitizeCssDeclarations(declBlock: string): string {
  return declBlock
    .replace(/expression\s*\([^)]*\)/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/behavior\s*:\s*[^;]+;?/gi, '')
    .replace(/-moz-binding\s*:\s*[^;]+;?/gi, '')
    .replace(/url\s*\(\s*(['"]?)\s*(?:javascript:|vbscript:|data:text\/html)[^)]*\)/gi, 'none');
}

function scopeCssRuleBlock(cssText: string, scopeClass: string): string {
  let out = '';
  let i = 0;
  const len = cssText.length;

  while (i < len) {
    // Skip whitespace
    while (i < len && /\s/.test(cssText[i])) {
      out += cssText[i];
      i += 1;
    }
    if (i >= len) break;

    const openIdx = cssText.indexOf('{', i);
    if (openIdx === -1) break;

    const prelude = cssText.slice(i, openIdx).trim();
    // Find matching closing brace
    let depth = 1;
    let j = openIdx + 1;
    while (j < len && depth > 0) {
      if (cssText[j] === '{') depth += 1;
      else if (cssText[j] === '}') depth -= 1;
      j += 1;
    }
    const body = cssText.slice(openIdx + 1, depth === 0 ? j - 1 : len);
    i = j;

    if (!prelude) continue;
    const lowerPrelude = prelude.toLowerCase();

    // Disallow external @import / @charset / @namespace
    if (
      lowerPrelude.startsWith('@import') ||
      lowerPrelude.startsWith('@charset') ||
      lowerPrelude.startsWith('@namespace')
    ) {
      continue;
    }

    // Preserve @keyframes verbatim (safe declarations)
    if (lowerPrelude.startsWith('@keyframes') || lowerPrelude.startsWith('@-webkit-keyframes')) {
      out += `${prelude} { ${sanitizeCssDeclarations(body)} }\n`;
      continue;
    }

    // Recurse inside @media / @supports / @container
    if (
      lowerPrelude.startsWith('@media') ||
      lowerPrelude.startsWith('@supports') ||
      lowerPrelude.startsWith('@container')
    ) {
      const innerScoped = scopeCssRuleBlock(body, scopeClass);
      if (innerScoped.trim()) {
        out += `${prelude} {\n${innerScoped}\n}\n`;
      }
      continue;
    }

    // Standard selector block
    const selectors = splitCssSelectors(prelude).map((sel) => {
      if (sel === ':root' || sel === 'html' || sel === 'body') {
        return `.${scopeClass}`;
      }
      if (sel.includes(`.${scopeClass}`)) {
        return sel;
      }
      // Handle leading html/body in descendant selectors
      const cleaned = sel.replace(/^(?:html|body)\b\s*/i, '');
      return cleaned ? `.${scopeClass} ${cleaned}` : `.${scopeClass}`;
    });

    const cleanBody = sanitizeCssDeclarations(body).trim();
    if (selectors.length > 0 && cleanBody) {
      out += `${selectors.join(', ')} {\n  ${cleanBody}\n}\n`;
    }
  }

  return out;
}

export function sanitizeScopedCss(rawCss: string, scopeClass: string): string {
  const raw = (rawCss || '').trim();
  if (!raw) return '';
  // Strip comments and dangerous patterns first
  const noComments = raw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<\/?style\b[^>]*>/gi, '')
    .replace(/@import[^;]+;?/gi, '');
  return scopeCssRuleBlock(noComments, scopeClass).trim();
}

export function isHtmlContent(value: string): boolean {
  const trimmed = (value || '').trim();
  if (!trimmed) return false;
  if (/^<(?:style|p|div|h[1-6]|ul|ol|li|blockquote|table|section|article|header|footer|aside|main|nav|figure|pre|hr|br|span|strong|b|em|i|u|s|del|strike|mark|a|img|iframe|video|font)\b/i.test(trimmed)) {
    return true;
  }
  const blockTagMatches = trimmed.match(/<\/(?:style|p|div|h[1-6]|ul|ol|li|blockquote|table|figure|pre|section|article|header|footer)>/gi);
  return Boolean(blockTagMatches && blockTagMatches.length >= 1);
}

export function markdownToHtml(md: string): string {
  const raw = md || '';
  if (!raw.trim()) return '';
  if (isHtmlContent(raw)) return raw;
  try {
    const parsed = marked.parse(raw, { gfm: true, breaks: true });
    return typeof parsed === 'string' ? parsed : raw;
  } catch {
    return raw;
  }
}

export function formatHtmlPretty(html: string): string {
  const raw = (html || '').trim();
  if (!raw) return '';
  const tokens = raw
    .replace(/>\s+</g, '><')
    .replace(/(<[^>]+>)/g, '\n$1\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const voidTags = new Set(['br', 'hr', 'img', 'input', 'source', 'meta', 'link']);
  let indent = 0;
  const out: string[] = [];

  for (const tok of tokens) {
    if (tok.startsWith('</')) {
      indent = Math.max(0, indent - 1);
      out.push(`${'  '.repeat(indent)}${tok}`);
    } else if (tok.startsWith('<') && !tok.startsWith('<!')) {
      const tagMatch = tok.match(/^<([a-zA-Z0-9]+)/);
      const tagName = tagMatch ? tagMatch[1].toLowerCase() : '';
      const selfClosing = tok.endsWith('/>') || voidTags.has(tagName);
      out.push(`${'  '.repeat(indent)}${tok}`);
      if (!selfClosing && !tok.includes(`</${tagName}>`)) {
        indent += 1;
      }
    } else {
      out.push(`${'  '.repeat(indent)}${tok}`);
    }
  }
  return out.join('\n');
}

export function processHtmlWithHeadingIds(html: string): {
  htmlWithIds: string;
  extractedCss: string;
  headings: Array<{ id: string; label: string; level: HeadingLevel }>;
} {
  const { bodyHtml, extractedCss } = extractHtmlAndStyles(html);
  const clean = sanitizeRichHtml(bodyHtml);
  if (!clean || typeof window === 'undefined') {
    return { htmlWithIds: clean, extractedCss, headings: [] };
  }
  try {
    const doc = new DOMParser().parseFromString(`<div>${clean}</div>`, 'text/html');
    const root = doc.body.firstElementChild;
    if (!root) return { htmlWithIds: clean, extractedCss, headings: [] };
    const headings: Array<{ id: string; label: string; level: HeadingLevel }> = [];
    const usedIds = new Set<string>();

    root.querySelectorAll('h1, h2, h3, h4').forEach((el, idx) => {
      const label = (el.textContent || '').trim();
      if (!label) return;
      const lvl = Math.min(6, Math.max(1, Number(el.tagName.slice(1)))) as HeadingLevel;
      let id = el.getAttribute('id') || `html-${slugifyBlogTitle(label, `sec-${idx + 1}`)}`;
      if (usedIds.has(id)) id = `${id}-${idx + 1}`;
      usedIds.add(id);
      el.setAttribute('id', id);
      el.classList.add('scroll-mt-24');
      headings.push({ id, label, level: lvl });
    });

    return { htmlWithIds: root.innerHTML, extractedCss, headings };
  } catch {
    return { htmlWithIds: clean, extractedCss, headings: [] };
  }
}

export const ScopedHtmlViewer: React.FC<{
  html: string;
  css?: string;
  scopeKey?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  alreadySanitizedHtml?: boolean;
}> = ({ html, css = '', scopeKey, align = 'left', className = '', alreadySanitizedHtml = false }) => {
  const reactId = useId();
  const scopeClass = useMemo(() => {
    const raw = (scopeKey || reactId || 'sa').replace(/[^a-zA-Z0-9_-]/g, '');
    return `sa-html-scope-${raw || 'viewer'}`;
  }, [scopeKey, reactId]);

  const { cleanHtml, scopedCss } = useMemo(() => {
    const { bodyHtml, extractedCss } = alreadySanitizedHtml
      ? { bodyHtml: html || '', extractedCss: '' }
      : extractHtmlAndStyles(html || '');
    const sanitizedBody = alreadySanitizedHtml ? bodyHtml : sanitizeRichHtml(bodyHtml);
    const mergedCss = [extractedCss, css].filter((part) => part && part.trim()).join('\n\n');
    const safeCss = mergedCss ? sanitizeScopedCss(mergedCss, scopeClass) : '';
    return { cleanHtml: sanitizedBody, scopedCss: safeCss };
  }, [html, css, scopeClass, alreadySanitizedHtml]);

  if (!cleanHtml?.trim() && !scopedCss?.trim()) return null;
  const alignCls =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-end' : 'text-start';

  return (
    <div className={`${scopeClass} sa-article-prose max-w-none overflow-x-auto text-[15px] sm:text-base ${alignCls} ${className}`}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    </div>
  );
};

export const RichMarkdownContent: React.FC<{
  content: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}> = ({ content, align = 'left', className = '' }) => {
  const htmlMode = useMemo(() => isHtmlContent(content), [content]);

  if (!content?.trim()) return null;
  const alignCls =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-end' : 'text-start';

  if (htmlMode) {
    return <ScopedHtmlViewer html={content} align={align} className={className} />;
  }

  return (
    <div
      className={`sa-article-prose max-w-none overflow-x-auto text-[15px] sm:text-base ${alignCls} ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ href, children }) => {
            const targetHref = href || '#';
            if (targetHref.startsWith('/') || targetHref.startsWith('#')) {
              return (
                <Link
                  to={targetHref}
                  className="text-[#0284c7] dark:text-[#38bdf8] font-semibold hover:underline"
                >
                  {children}
                </Link>
              );
            }
            return (
              <a
                href={targetHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#0284c7] dark:text-[#38bdf8] font-semibold hover:underline"
              >
                <span>{children}</span>
                <TbExternalLink size={13} className="inline shrink-0" />
              </a>
            );
          },
          u: ({ children }) => (
            <u className="underline decoration-[#29aaea]/85 decoration-2 underline-offset-4">
              {children}
            </u>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export const ResilientBlogImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
  onZoom?: () => void;
}> = ({ src, alt, className = '', aspectClass = 'aspect-video', onZoom }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`w-full ${aspectClass} rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-sky-50 dark:from-slate-900 dark:via-[#111623] dark:to-indigo-950/40 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center ${className}`}
      >
        <div className="w-12 h-12 rounded-xl bg-slate-200/80 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-2">
          <TbPhotoOff size={24} />
        </div>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 max-w-xs line-clamp-2">
          {alt || 'SecretArea Visual Media'}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 ${aspectClass} ${className}`}>
      <img
        src={src}
        alt={alt || 'SecretArea blog image'}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
      {onZoom && (
        <button
          type="button"
          onClick={onZoom}
          aria-label="Expand image"
          className="absolute top-3 end-3 w-9 h-9 rounded-xl bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer"
        >
          <TbMaximize size={16} />
        </button>
      )}
    </div>
  );
};

function parseVideoEmbed(rawUrl: string): { kind: 'iframe' | 'video' | 'invalid'; src: string } {
  const url = (rawUrl || '').trim();
  if (!url) return { kind: 'invalid', src: '' };

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v)}` };
      if (parsed.pathname.startsWith('/embed/')) {
        return { kind: 'iframe', src: url };
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.split('/')[2];
        if (id) return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` };
      }
    }

    if (host === 'youtu.be') {
      const id = parsed.pathname.replace(/^\//, '').split('/')[0];
      if (id) return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` };
    }

    if (host.includes('vimeo.com')) {
      const match = parsed.pathname.match(/\/(\d+)/);
      if (match?.[1]) {
        return { kind: 'iframe', src: `https://player.vimeo.com/video/${match[1]}` };
      }
    }

    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(parsed.pathname)) {
      return { kind: 'video', src: url };
    }

    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return { kind: 'video', src: url };
    }
  } catch {
    if (url.startsWith('/')) return { kind: 'video', src: url };
  }

  return { kind: 'invalid', src: '' };
}

const SliderBlockView: React.FC<{
  title?: string;
  slides: BlogImageItem[];
  onZoom: (item: BlogImageItem) => void;
}> = ({ title, slides, onZoom }) => {
  const { dir } = useLanguage();
  const [index, setIndex] = useState(0);
  const validSlides = (slides || []).filter((s) => s.url?.trim());

  if (validSlides.length === 0) return null;
  const active = validSlides[index % validSlides.length];

  const prev = () => setIndex((i) => (i - 1 + validSlides.length) % validSlides.length);
  const next = () => setIndex((i) => (i + 1) % validSlides.length);

  return (
    <div className="my-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0e1320] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
          {title || 'Media Slideshow'}
        </div>
        <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
          {(index % validSlides.length) + 1} / {validSlides.length}
        </div>
      </div>

      <div className="relative">
        <ResilientBlogImage
          src={active.url}
          alt={active.alt || title || 'Slide image'}
          aspectClass="aspect-[16/9]"
          onZoom={() => onZoom(active)}
        />

        {validSlides.length > 1 && (
          <>
            <button
              type="button"
              onClick={dir === 'rtl' ? next : prev}
              aria-label="Previous slide"
              className="absolute start-2 sm:start-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-950/75 hover:bg-slate-950 text-white flex items-center justify-center border border-white/15 backdrop-blur-sm transition-transform active:scale-95 cursor-pointer"
            >
              <TbChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={dir === 'rtl' ? prev : next}
              aria-label="Next slide"
              className="absolute end-2 sm:end-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-950/75 hover:bg-slate-950 text-white flex items-center justify-center border border-white/15 backdrop-blur-sm transition-transform active:scale-95 cursor-pointer"
            >
              <TbChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {active.caption && (
        <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 text-center italic">
          {active.caption}
        </p>
      )}

      {validSlides.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
          {validSlides.map((sl, idx) => (
            <button
              key={`${sl.url}-${idx}`}
              type="button"
              onClick={() => setIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === index % validSlides.length
                  ? 'w-7 bg-[#29aaea]'
                  : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CodeBlockView: React.FC<{ language: string; filename?: string; code: string }> = ({
  language,
  filename,
  code,
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="my-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 shadow-sm" dir="ltr">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-mono font-bold text-sky-400 uppercase tracking-wider">
            {language || 'code'}
          </span>
          {filename && (
            <>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-slate-400 truncate">{filename}</span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer shrink-0"
        >
          {copied ? <TbCheck size={14} className="text-emerald-400" /> : <TbCopy size={14} />}
          <span>{copied ? t('Copied') : t('Copy')}</span>
        </button>
      </div>
      <pre className="p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed text-slate-100 max-w-full">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const BlogBlockRenderer: React.FC<{
  block: BlogContentBlock;
  sectionIndex?: number;
}> = ({ block }) => {
  const [lightboxImage, setLightboxImage] = useState<BlogImageItem | null>(null);

  const renderLightbox = () =>
    lightboxImage && (
      <div
        className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setLightboxImage(null)}
      >
        <div
          className="relative max-w-5xl w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            aria-label="Close preview"
            className="absolute top-3 end-3 z-10 w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center border border-slate-700 cursor-pointer"
          >
            <TbX size={20} />
          </button>
          <img
            src={lightboxImage.url}
            alt={lightboxImage.alt || 'Expanded media'}
            referrerPolicy="no-referrer"
            className="w-full max-h-[80vh] object-contain bg-black"
          />
          {lightboxImage.caption && (
            <div className="px-5 py-3 text-sm text-slate-300 border-t border-slate-800 text-center">
              {lightboxImage.caption}
            </div>
          )}
        </div>
      </div>
    );

  switch (block.type) {
    case 'subheading': {
      if (!block.text?.trim()) return null;
      const anchorId = `sub-${slugifyBlogTitle(block.text, block.id)}`;
      const level = block.level ?? 3;
      const headingClasses: Record<number, string> = {
        1: 'scroll-mt-24 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-8 mb-4 tracking-tight',
        2: 'scroll-mt-24 text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-8 mb-3.5 tracking-tight',
        3: 'scroll-mt-24 text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-7 mb-3 tracking-tight',
        4: 'scroll-mt-24 text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2.5 tracking-tight',
        5: 'scroll-mt-24 text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mt-5 mb-2',
        6: 'scroll-mt-24 text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-400 mt-4 mb-2',
      };
      const cls = headingClasses[level] || headingClasses[3];
      if (level === 1) return <h1 id={anchorId} className={cls}>{block.text}</h1>;
      if (level === 2) return <h2 id={anchorId} className={cls}>{block.text}</h2>;
      if (level === 4) return <h4 id={anchorId} className={cls}>{block.text}</h4>;
      if (level === 5) return <h5 id={anchorId} className={cls}>{block.text}</h5>;
      if (level === 6) return <h6 id={anchorId} className={cls}>{block.text}</h6>;
      return <h3 id={anchorId} className={cls}>{block.text}</h3>;
    }

    case 'paragraph': {
      if (!block.content?.trim()) return null;
      return <RichMarkdownContent content={block.content} align={block.align} className="my-4" />;
    }

    case 'html': {
      if (!block.html?.trim() && !block.css?.trim()) return null;
      return (
        <div className="my-5">
          {block.title?.trim() && (
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              {block.title}
            </div>
          )}
          <ScopedHtmlViewer
            html={block.html || ''}
            css={block.css || ''}
            scopeKey={block.id}
          />
        </div>
      );
    }

    case 'image': {
      if (!block.url?.trim()) return null;
      return (
        <>
          <figure className="my-6">
            <ResilientBlogImage
              src={block.url}
              alt={block.alt || 'Article image'}
              aspectClass="aspect-[16/9]"
              onZoom={() => setLightboxImage({ url: block.url, alt: block.alt, caption: block.caption })}
            />
            {block.caption && (
              <figcaption className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center italic">
                {block.caption}
              </figcaption>
            )}
          </figure>
          {renderLightbox()}
        </>
      );
    }

    case 'multi_image': {
      const validImages = (block.images || []).filter((img) => img.url?.trim());
      if (validImages.length === 0) return null;
      const gridCols = block.columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2';
      return (
        <>
          <div className={`my-6 grid ${gridCols} gap-4`}>
            {validImages.map((img, i) => (
              <figure key={`${img.url}-${i}`} className="flex flex-col">
                <ResilientBlogImage
                  src={img.url}
                  alt={img.alt || `Gallery image ${i + 1}`}
                  aspectClass="aspect-[4/3]"
                  onZoom={() => setLightboxImage(img)}
                />
                {img.caption && (
                  <figcaption className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 italic">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
          {renderLightbox()}
        </>
      );
    }

    case 'slider':
      return (
        <>
          <SliderBlockView
            title={block.title}
            slides={block.slides || []}
            onZoom={(item) => setLightboxImage(item)}
          />
          {renderLightbox()}
        </>
      );

    case 'video': {
      const embed = parseVideoEmbed(block.url);
      if (embed.kind === 'invalid') {
        return (
          <div className="my-6 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <TbVideo size={20} className="shrink-0" />
            <span>{block.title || 'Video source unavailable'}</span>
          </div>
        );
      }
      return (
        <figure className="my-6">
          {block.title && (
            <div className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              {block.title}
            </div>
          )}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black shadow-sm">
            {embed.kind === 'iframe' ? (
              <iframe
                src={embed.src}
                title={block.title || 'Embedded video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <video
                src={embed.src}
                controls
                preload="metadata"
                className="w-full h-full object-contain"
              />
            )}
          </div>
          {block.caption && (
            <figcaption className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'code':
      if (!block.code?.trim()) return null;
      return <CodeBlockView language={block.language} filename={block.filename} code={block.code} />;

    case 'button': {
      if (!block.label?.trim() || !block.url?.trim()) return null;
      const variantClasses: Record<string, string> = {
        primary:
          'bg-[#29aaea] hover:bg-[#1d96d4] text-white shadow-md shadow-sky-500/20',
        gradient:
          'bg-gradient-to-r from-[#29aaea] via-indigo-600 to-violet-600 hover:brightness-110 text-white shadow-md shadow-indigo-500/25',
        secondary:
          'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 shadow-sm',
        outline:
          'bg-transparent border border-slate-300 dark:border-slate-700 hover:border-[#29aaea] text-slate-800 dark:text-slate-100 hover:text-[#29aaea]',
      };
      const cls = `inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${
        variantClasses[block.variant] || variantClasses.primary
      }`;
      const isInternal = block.url.startsWith('/');
      const content = (
        <>
          {block.icon && <Icon name={block.icon} size={18} className="shrink-0" />}
          <span>{block.label}</span>
          {!isInternal && block.openInNewTab !== false && <TbExternalLink size={15} className="shrink-0 opacity-80" />}
        </>
      );

      return (
        <div className="my-5 flex flex-wrap items-center">
          {isInternal && !block.openInNewTab ? (
            <Link to={block.url} className={cls}>
              {content}
            </Link>
          ) : (
            <a
              href={block.url}
              target={block.openInNewTab === false ? undefined : '_blank'}
              rel={block.openInNewTab === false ? undefined : 'noopener noreferrer'}
              className={cls}
            >
              {content}
            </a>
          )}
        </div>
      );
    }

    case 'icon_box': {
      if (!block.title?.trim() && !block.description?.trim()) return null;
      const accentStyles: Record<string, { wrap: string; iconBg: string }> = {
        sky: {
          wrap: 'bg-sky-50/70 dark:bg-sky-950/20 border-sky-200/80 dark:border-sky-500/25',
          iconBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
        },
        violet: {
          wrap: 'bg-violet-50/70 dark:bg-violet-950/20 border-violet-200/80 dark:border-violet-500/25',
          iconBg: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
        },
        emerald: {
          wrap: 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-500/25',
          iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        },
        amber: {
          wrap: 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-500/25',
          iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        },
        rose: {
          wrap: 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-500/25',
          iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
        },
      };
      const st = accentStyles[block.accent || 'sky'] || accentStyles.sky;

      return (
        <div className={`my-5 p-4 sm:p-5 rounded-2xl border ${st.wrap} flex items-start gap-4`}>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${st.iconBg}`}>
            <Icon name={block.icon || 'Sparkles'} size={22} />
          </div>
          <div className="min-w-0">
            {block.title && (
              <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">
                {block.title}
              </div>
            )}
            {block.description && (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {block.description}
              </p>
            )}
          </div>
        </div>
      );
    }

    case 'callout': {
      if (!block.content?.trim()) return null;
      const tones = {
        info: {
          box: 'bg-sky-50/70 dark:bg-sky-950/20 border-sky-200 dark:border-sky-500/30',
          icon: <TbInfoCircle size={20} className="text-sky-600 dark:text-sky-400 shrink-0" />,
        },
        tip: {
          box: 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30',
          icon: <TbBulb size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />,
        },
        warning: {
          box: 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/30',
          icon: <TbAlertTriangle size={20} className="text-amber-600 dark:text-amber-400 shrink-0" />,
        },
        quote: {
          box: 'bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800',
          icon: <TbQuote size={20} className="text-indigo-500 dark:text-indigo-400 shrink-0" />,
        },
      };
      const cfg = tones[block.tone || 'info'] || tones.info;

      return (
        <div className={`my-5 p-4 sm:p-5 rounded-2xl border ${cfg.box} flex items-start gap-3.5`}>
          <div className="mt-0.5">{cfg.icon}</div>
          <div className="min-w-0">
            {block.title && (
              <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {block.title}
              </div>
            )}
            <p className={`text-sm leading-relaxed ${block.tone === 'quote' ? 'italic text-slate-700 dark:text-slate-200' : 'text-slate-700 dark:text-slate-300'}`}>
              {block.content}
            </p>
          </div>
        </div>
      );
    }

    case 'checklist': {
      const validItems = (block.items || []).filter((it) => it.trim());
      if (validItems.length === 0) return null;
      return (
        <div className="my-5 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-500/25 bg-emerald-50/50 dark:bg-emerald-950/15">
          {block.title && (
            <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mb-3">
              {block.title}
            </div>
          )}
          <ul className="space-y-2.5">
            {validItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <TbChecklistMark size={13} />
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    case 'divider': {
      if (block.style === 'dots') {
        return (
          <div className="my-8 flex items-center justify-center gap-2.5" aria-hidden="true">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="w-2 h-2 rounded-full bg-[#29aaea]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
        );
      }
      if (block.style === 'glow') {
        return (
          <div
            className="my-8 h-[2px] w-full rounded-full bg-gradient-to-r from-transparent via-[#29aaea]/60 to-transparent"
            aria-hidden="true"
          />
        );
      }
      return <hr className="my-8 border-t border-slate-200 dark:border-slate-800" />;
    }

    default:
      return null;
  }
};
