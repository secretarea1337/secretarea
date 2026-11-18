import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  TbBold,
  TbItalic,
  TbUnderline,
  TbStrikethrough,
  TbH1,
  TbH2,
  TbH3,
  TbH4,
  TbH5,
  TbH6,
  TbList,
  TbListNumbers,
  TbQuote,
  TbCode,
  TbLink,
  TbLinkOff,
  TbPhoto,
  TbVideo,
  TbAlignLeft,
  TbAlignCenter,
  TbAlignRight,
  TbAlignJustified,
  TbIndentIncrease,
  TbIndentDecrease,
  TbEraser,
  TbPalette,
  TbPaletteOff,
  TbHighlight,
  TbHighlightOff,
  TbEye,
  TbPencil,
  TbSourceCode,
  TbLayoutColumns,
  TbSeparatorHorizontal,
  TbArrowBackUp,
  TbArrowForwardUp,
  TbSearch,
  TbWand,
  TbTextDirectionLtr,
  TbTextDirectionRtl,
  TbCheck,
  TbX,
} from 'react-icons/tb';
import {
  RichMarkdownContent,
  ScopedHtmlViewer,
  formatHtmlPretty,
  isHtmlContent,
  markdownToHtml,
} from './BlogBlockRenderer';
import { useLanguage } from '../src/contexts/LanguageContext';

interface RichTextBlockEditorProps {
  value: string;
  onChange: (nextValue: string) => void;
  align?: 'left' | 'center' | 'right';
  onAlignChange?: (nextAlign: 'left' | 'center' | 'right') => void;
  placeholder?: string;
  minRows?: number;
}

type EditorViewMode = 'compose' | 'html' | 'preview';
type ActivePopoverKind = 'none' | 'link' | 'image' | 'video' | 'textColor' | 'highlightColor';

interface ActiveFormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeThrough: boolean;
  unorderedList: boolean;
  orderedList: boolean;
  code: boolean;
  link: boolean;
  blockTag: string;
}

const TEXT_COLOR_SWATCHES = [
  '#0f172a',
  '#334155',
  '#ffffff',
  '#0284c7',
  '#29aaea',
  '#4f46e5',
  '#7c3aed',
  '#059669',
  '#d97706',
  '#dc2626',
  '#db2777',
];

const HIGHLIGHT_COLOR_SWATCHES = [
  '#fef08a',
  '#fde047',
  '#bbf7d0',
  '#bae6fd',
  '#ddd6fe',
  '#fbcfe8',
  '#fecaca',
  '#fed7aa',
  '#0ea5e9',
  '#6366f1',
];

const INLINE_FORMAT_TAGS = new Set([
  'b',
  'strong',
  'i',
  'em',
  'u',
  's',
  'del',
  'strike',
  'mark',
  'code',
  'font',
  'span',
  'small',
  'sub',
  'sup',
]);

function normalizeComposeHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<del(\b[^>]*)>/gi, '<s$1>')
    .replace(/<\/del>/gi, '</s>')
    .replace(/<strike(\b[^>]*)>/gi, '<s$1>')
    .replace(/<\/strike>/gi, '</s>');
}

function findAncestorElement(
  node: Node | null,
  root: HTMLElement,
  tagNames: string[]
): HTMLElement | null {
  const tagSet = new Set(tagNames.map((t) => t.toLowerCase()));
  let curr: Node | null = node;
  while (curr && curr !== root) {
    if (curr.nodeType === Node.ELEMENT_NODE) {
      const el = curr as HTMLElement;
      if (tagSet.has(el.tagName.toLowerCase())) {
        return el;
      }
    }
    curr = curr.parentNode;
  }
  return null;
}

function unwrapElementPreservingChildren(el: HTMLElement): Range | null {
  const parent = el.parentNode;
  if (!parent) return null;
  const firstChild = el.firstChild;
  const lastChild = el.lastChild;
  while (el.firstChild) {
    parent.insertBefore(el.firstChild, el);
  }
  parent.removeChild(el);
  if (firstChild && lastChild) {
    try {
      const range = document.createRange();
      range.setStartBefore(firstChild);
      range.setEndAfter(lastChild);
      return range;
    } catch {
      return null;
    }
  }
  return null;
}

function buildEmbedHtmlFromVideoUrl(rawUrl: string): string {
  const url = (rawUrl || '').trim();
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      const v = parsed.searchParams.get('v');
      if (v) {
        return `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(
          v
        )}" title="YouTube video" allowfullscreen></iframe><p><br></p>`;
      }
      if (parsed.pathname.startsWith('/embed/')) {
        return `<iframe src="${url}" title="YouTube video" allowfullscreen></iframe><p><br></p>`;
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.split('/')[2];
        if (id) {
          return `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(
            id
          )}" title="YouTube Shorts" allowfullscreen></iframe><p><br></p>`;
        }
      }
    }
    if (host === 'youtu.be') {
      const id = parsed.pathname.replace(/^\//, '').split('/')[0];
      if (id) {
        return `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(
          id
        )}" title="YouTube video" allowfullscreen></iframe><p><br></p>`;
      }
    }
    if (host.includes('vimeo.com')) {
      const match = parsed.pathname.match(/\/(\d+)/);
      if (match?.[1]) {
        return `<iframe src="https://player.vimeo.com/video/${match[1]}" title="Vimeo video" allowfullscreen></iframe><p><br></p>`;
      }
    }
  } catch {
    // fall through to <video>
  }
  return `<video src="${url}" controls preload="metadata"></video><p><br></p>`;
}

export const RichTextBlockEditor: React.FC<RichTextBlockEditorProps> = ({
  value,
  onChange,
  align = 'left',
  onAlignChange,
  placeholder,
  minRows = 7,
}) => {
  const { t } = useLanguage();

  const composeRef = useRef<HTMLDivElement | null>(null);
  const htmlTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const lastHtmlRef = useRef<string>('');
  const isComposeFocusedRef = useRef(false);

  // Real component-level Undo/Redo history stack across Compose & HTML view
  const historyRef = useRef<string[]>([value || '']);
  const historyIndexRef = useRef<number>(0);
  const skipNextHistoryResetRef = useRef<boolean>(false);
  const [historyMeta, setHistoryMeta] = useState({ canUndo: false, canRedo: false });

  const [mode, setMode] = useState<EditorViewMode>('compose');
  const [htmlSplitPreview, setHtmlSplitPreview] = useState(true);
  const [htmlDir, setHtmlDir] = useState<'ltr' | 'rtl'>('ltr');
  const [showHtmlSearch, setShowHtmlSearch] = useState(false);
  const [htmlSearchQuery, setHtmlSearchQuery] = useState('');
  const [htmlSearchIndex, setHtmlSearchIndex] = useState(0);

  // Popovers for Link, Image, Video, Colors
  const [activePopover, setActivePopover] = useState<ActivePopoverKind>('none');
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [imgAlt, setImgAlt] = useState('');
  const [vidUrl, setVidUrl] = useState('');
  const [textColor, setTextColor] = useState('#29aaea');
  const [highlightColor, setHighlightColor] = useState('#fef08a');

  const [activeFormats, setActiveFormats] = useState<ActiveFormatState>({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    unorderedList: false,
    orderedList: false,
    code: false,
    link: false,
    blockTag: 'p',
  });

  // Compute safe HTML representation whenever value is Markdown or HTML
  const normalizedHtml = useMemo(() => {
    const raw = value || '';
    if (!raw.trim()) return '';
    return isHtmlContent(raw) ? raw : markdownToHtml(raw);
  }, [value]);

  const syncHistoryMeta = useCallback(() => {
    setHistoryMeta({
      canUndo: historyIndexRef.current > 0,
      canRedo: historyIndexRef.current < historyRef.current.length - 1,
    });
  }, []);

  const pushHistorySnapshot = useCallback(
    (nextVal: string) => {
      const currentAtCursor = historyRef.current[historyIndexRef.current] ?? '';
      if (currentAtCursor === nextVal) return;
      const truncated = historyRef.current.slice(0, historyIndexRef.current + 1);
      truncated.push(nextVal);
      if (truncated.length > 80) {
        truncated.shift();
      }
      historyRef.current = truncated;
      historyIndexRef.current = truncated.length - 1;
      syncHistoryMeta();
    },
    [syncHistoryMeta]
  );

  // Track external value changes (e.g. switching articles) cleanly
  useEffect(() => {
    if (skipNextHistoryResetRef.current) {
      skipNextHistoryResetRef.current = false;
      return;
    }
    const curr = value || '';
    const atHead = historyRef.current[historyIndexRef.current];
    if (atHead !== curr) {
      pushHistorySnapshot(curr);
    }
  }, [value, pushHistorySnapshot]);

  const commitChange = useCallback(
    (nextVal: string) => {
      lastHtmlRef.current = nextVal;
      skipNextHistoryResetRef.current = true;
      pushHistorySnapshot(nextVal);
      onChange(nextVal);
    },
    [onChange, pushHistorySnapshot]
  );

  const refreshToolbarState = useCallback(() => {
    if (typeof document === 'undefined' || !composeRef.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const anchor = sel.anchorNode;
    if (!anchor || !composeRef.current.contains(anchor)) return;

    try {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    } catch {
      // ignore clone errors
    }

    let blockTag = 'p';
    let curr: Node | null = anchor;
    while (curr && curr !== composeRef.current) {
      if (curr.nodeType === Node.ELEMENT_NODE) {
        const tag = (curr as HTMLElement).tagName.toLowerCase();
        if (/^(h[1-6]|p|blockquote|pre|div)$/.test(tag)) {
          blockTag = tag === 'div' ? 'p' : tag;
          break;
        }
      }
      curr = curr.parentNode;
    }

    const root = composeRef.current;
    const hasCode = Boolean(findAncestorElement(anchor, root, ['code']));
    const hasLink = Boolean(findAncestorElement(anchor, root, ['a']));
    const hasBold = Boolean(findAncestorElement(anchor, root, ['b', 'strong']));
    const hasItalic = Boolean(findAncestorElement(anchor, root, ['i', 'em']));
    const hasUnderline = Boolean(findAncestorElement(anchor, root, ['u']));
    const hasStrike = Boolean(findAncestorElement(anchor, root, ['s', 'del', 'strike']));

    try {
      setActiveFormats({
        bold: document.queryCommandState('bold') || hasBold,
        italic: document.queryCommandState('italic') || hasItalic,
        underline: document.queryCommandState('underline') || hasUnderline,
        strikeThrough: document.queryCommandState('strikeThrough') || hasStrike,
        unorderedList: document.queryCommandState('insertUnorderedList'),
        orderedList: document.queryCommandState('insertOrderedList'),
        code: hasCode,
        link: hasLink,
        blockTag,
      });
    } catch {
      setActiveFormats((prev) => ({
        ...prev,
        bold: hasBold,
        italic: hasItalic,
        underline: hasUnderline,
        strikeThrough: hasStrike,
        code: hasCode,
        link: hasLink,
        blockTag,
      }));
    }
  }, []);

  useEffect(() => {
    if (mode !== 'compose') return;
    const handleSelectionChange = () => {
      refreshToolbarState();
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [mode, refreshToolbarState]);

  // Hydrate contentEditable only when entering Compose mode or external prop changes
  useEffect(() => {
    if (mode !== 'compose' || !composeRef.current) return;
    const nextHtml = normalizeComposeHtml(normalizedHtml);
    if (isComposeFocusedRef.current && lastHtmlRef.current === value) return;
    if (composeRef.current.innerHTML !== nextHtml && lastHtmlRef.current !== value) {
      composeRef.current.innerHTML = nextHtml;
      lastHtmlRef.current = value || '';
    }
  }, [mode, value, normalizedHtml]);

  const emitComposeHtml = useCallback(() => {
    if (!composeRef.current) return;
    const rawHtml = composeRef.current.innerHTML;
    const isEmpty =
      !rawHtml ||
      rawHtml === '<br>' ||
      rawHtml === '<p><br></p>' ||
      rawHtml === '<div><br></div>';
    const next = isEmpty ? '' : rawHtml;
    commitChange(next);
  }, [commitChange]);

  const ensureComposeSelection = useCallback(() => {
    const el = composeRef.current;
    if (!el) return;
    el.focus();

    // Ensure at least one <p><br></p> block exists if editor is completely empty
    const raw = el.innerHTML.trim();
    if (!raw || raw === '<br>') {
      el.innerHTML = '<p><br></p>';
      const p = el.querySelector('p');
      if (p) {
        const range = document.createRange();
        range.setStart(p, 0);
        range.collapse(true);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
          savedRangeRef.current = range.cloneRange();
        }
        return;
      }
    }

    const sel = window.getSelection();
    if (sel && savedRangeRef.current && el.contains(savedRangeRef.current.startContainer)) {
      try {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
        return;
      } catch {
        // fallback below
      }
    }

    // If selection is outside compose container, move caret to the end
    if (sel && (!sel.anchorNode || !el.contains(sel.anchorNode))) {
      try {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        savedRangeRef.current = range.cloneRange();
      } catch {
        // ignore
      }
    }
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const target = historyRef.current[historyIndexRef.current] ?? '';
    const hydrated = normalizeComposeHtml(
      target ? (isHtmlContent(target) ? target : markdownToHtml(target)) : ''
    );
    if (mode === 'compose' && composeRef.current) {
      composeRef.current.innerHTML = hydrated;
    }
    lastHtmlRef.current = target;
    skipNextHistoryResetRef.current = true;
    onChange(target);
    syncHistoryMeta();
    requestAnimationFrame(refreshToolbarState);
  }, [mode, onChange, refreshToolbarState, syncHistoryMeta]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    const target = historyRef.current[historyIndexRef.current] ?? '';
    const hydrated = normalizeComposeHtml(
      target ? (isHtmlContent(target) ? target : markdownToHtml(target)) : ''
    );
    if (mode === 'compose' && composeRef.current) {
      composeRef.current.innerHTML = hydrated;
    }
    lastHtmlRef.current = target;
    skipNextHistoryResetRef.current = true;
    onChange(target);
    syncHistoryMeta();
    requestAnimationFrame(refreshToolbarState);
  }, [mode, onChange, refreshToolbarState, syncHistoryMeta]);

  const execComposeCommand = (command: string, cmdValue?: string, useCss = false) => {
    if (!composeRef.current) return;
    ensureComposeSelection();
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
      document.execCommand('styleWithCSS', false, useCss ? 'true' : 'false');
    } catch {
      // optional commands
    }
    try {
      document.execCommand(command, false, cmdValue);
    } catch {
      // ignore command failure
    }
    emitComposeHtml();
    refreshToolbarState();
  };

  const applyHeadingBlock = (tag: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote') => {
    if (!composeRef.current) return;
    ensureComposeSelection();
    try {
      // Exit list first if applying a heading inside a bullet/numbered list
      if (tag !== 'p') {
        if (document.queryCommandState('insertUnorderedList')) {
          document.execCommand('insertUnorderedList', false);
        }
        if (document.queryCommandState('insertOrderedList')) {
          document.execCommand('insertOrderedList', false);
        }
      }
      const targetTag = activeFormats.blockTag === tag && tag !== 'p' ? 'p' : tag;
      const ok = document.execCommand('formatBlock', false, `<${targetTag}>`);
      if (!ok) {
        document.execCommand('formatBlock', false, targetTag);
      }
    } catch {
      try {
        document.execCommand('formatBlock', false, tag);
      } catch {
        // ignore
      }
    }
    emitComposeHtml();
    refreshToolbarState();
  };

  const toggleInlineCodeCompose = () => {
    const root = composeRef.current;
    if (!root) return;
    ensureComposeSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const existingCode = findAncestorElement(sel.anchorNode, root, ['code']);
    if (existingCode) {
      const nextRange = unwrapElementPreservingChildren(existingCode);
      if (nextRange) {
        sel.removeAllRanges();
        sel.addRange(nextRange);
        savedRangeRef.current = nextRange.cloneRange();
      }
      emitComposeHtml();
      refreshToolbarState();
      return;
    }

    const selectedText = sel.toString();
    const codeText = selectedText || 'code';
    const escaped = codeText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    document.execCommand('insertHTML', false, `<code>${escaped}</code>&#8203;`);
    emitComposeHtml();
    refreshToolbarState();
  };

  const resetTextColorCompose = () => {
    const root = composeRef.current;
    if (!root) return;
    ensureComposeSelection();
    try {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('foreColor', false, 'inherit');
    } catch {
      // ignore
    }
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      root.querySelectorAll('font[color], span[style]').forEach((el) => {
        if (range.intersectsNode(el) || el.contains(range.startContainer)) {
          const htmlEl = el as HTMLElement;
          if (htmlEl.tagName.toLowerCase() === 'font') {
            htmlEl.removeAttribute('color');
          }
          htmlEl.style.removeProperty('color');
          if (!htmlEl.getAttribute('style') && !htmlEl.getAttribute('class') && htmlEl.tagName.toLowerCase() === 'span') {
            unwrapElementPreservingChildren(htmlEl);
          }
        }
      });
    }
    emitComposeHtml();
    refreshToolbarState();
    setActivePopover('none');
  };

  const resetHighlightColorCompose = () => {
    const root = composeRef.current;
    if (!root) return;
    ensureComposeSelection();
    try {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('hiliteColor', false, 'transparent');
    } catch {
      // ignore
    }
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      root.querySelectorAll('mark, span[style]').forEach((el) => {
        if (range.intersectsNode(el) || el.contains(range.startContainer)) {
          const htmlEl = el as HTMLElement;
          if (htmlEl.tagName.toLowerCase() === 'mark') {
            unwrapElementPreservingChildren(htmlEl);
            return;
          }
          htmlEl.style.removeProperty('background-color');
          htmlEl.style.removeProperty('background');
          if (!htmlEl.getAttribute('style') && !htmlEl.getAttribute('class')) {
            unwrapElementPreservingChildren(htmlEl);
          }
        }
      });
    }
    emitComposeHtml();
    refreshToolbarState();
    setActivePopover('none');
  };

  const handleUnlink = () => {
    if (mode === 'compose') {
      const root = composeRef.current;
      if (!root) return;
      ensureComposeSelection();
      const sel = window.getSelection();
      const anchorEl = sel ? findAncestorElement(sel.anchorNode, root, ['a']) : null;
      if (anchorEl) {
        const nextRange = unwrapElementPreservingChildren(anchorEl);
        if (nextRange && sel) {
          sel.removeAllRanges();
          sel.addRange(nextRange);
          savedRangeRef.current = nextRange.cloneRange();
        }
      } else {
        try {
          document.execCommand('unlink', false);
        } catch {
          // ignore
        }
      }
      emitComposeHtml();
      refreshToolbarState();
      setActivePopover('none');
      return;
    }

    if (mode === 'html' && htmlTextareaRef.current) {
      const el = htmlTextareaRef.current;
      const current = isHtmlContent(value) ? value : markdownToHtml(value);
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? current.length;
      const selected = current.slice(start, end);
      if (selected) {
        const stripped = selected.replace(/<\/?a\b[^>]*>/gi, '');
        commitChange(current.slice(0, start) + stripped + current.slice(end));
      }
    }
  };

  const handleClearFormatting = () => {
    if (mode === 'html' && htmlTextareaRef.current) {
      const el = htmlTextareaRef.current;
      const current = isHtmlContent(value) ? value : markdownToHtml(value);
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      if (end > start) {
        const selected = current.slice(start, end);
        const stripped = selected.replace(/<\/?(?:b|strong|i|em|u|s|del|strike|mark|code|font|span|a)\b[^>]*>/gi, '');
        commitChange(current.slice(0, start) + stripped + current.slice(end));
      }
      return;
    }

    const root = composeRef.current;
    if (!root) return;
    ensureComposeSelection();
    try {
      document.execCommand('removeFormat', false);
      document.execCommand('unlink', false);
    } catch {
      // ignore
    }

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      // Unwrap any inline formatting elements intersecting selection or enclosing collapsed caret
      const candidates = Array.from(
        root.querySelectorAll('b, strong, i, em, u, s, del, strike, mark, code, font, span, small, sub, sup')
      );
      for (const node of candidates) {
        const htmlEl = node as HTMLElement;
        if (!INLINE_FORMAT_TAGS.has(htmlEl.tagName.toLowerCase())) continue;
        if (range.intersectsNode(htmlEl) || htmlEl.contains(range.startContainer)) {
          unwrapElementPreservingChildren(htmlEl);
        }
      }
    }

    emitComposeHtml();
    refreshToolbarState();
  };

  // HTML View manipulation helpers
  const switchMode = (nextMode: EditorViewMode) => {
    if (nextMode === mode) return;
    if (nextMode === 'html') {
      const currentHtml = isHtmlContent(value) ? value : markdownToHtml(value);
      if (currentHtml !== value) {
        commitChange(currentHtml);
      }
    } else if (nextMode === 'compose') {
      const nextHtml = normalizeComposeHtml(isHtmlContent(value) ? value : markdownToHtml(value));
      lastHtmlRef.current = '';
      if (composeRef.current) {
        composeRef.current.innerHTML = nextHtml;
      }
      if (nextHtml !== value) {
        onChange(nextHtml);
      }
    }
    setActivePopover('none');
    setMode(nextMode);
  };

  const wrapHtmlSelection = (before: string, after: string, fallback = 'text') => {
    const el = htmlTextareaRef.current;
    const current = isHtmlContent(value) ? value : markdownToHtml(value);
    if (!el) {
      commitChange(`${current}${before}${fallback}${after}`);
      return;
    }
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const selected = current.slice(start, end);

    // If the selection already starts with `before` and ends with `after`, toggle it OFF cleanly!
    if (selected && before && after && selected.startsWith(before) && selected.endsWith(after)) {
      const unwrapped = selected.slice(before.length, selected.length - after.length);
      const next = current.slice(0, start) + unwrapped + current.slice(end);
      commitChange(next);
      requestAnimationFrame(() => {
        if (!htmlTextareaRef.current) return;
        htmlTextareaRef.current.focus();
        htmlTextareaRef.current.setSelectionRange(start, start + unwrapped.length);
      });
      return;
    }

    const replacement = selected ? `${before}${selected}${after}` : `${before}${fallback}${after}`;
    const next = current.slice(0, start) + replacement + current.slice(end);
    commitChange(next);
    requestAnimationFrame(() => {
      if (!htmlTextareaRef.current) return;
      htmlTextareaRef.current.focus();
      const innerStart = start + before.length;
      const innerLen = (selected || fallback).length;
      htmlTextareaRef.current.setSelectionRange(innerStart, innerStart + innerLen);
    });
  };

  const handleBeautifyHtml = () => {
    const currentHtml = isHtmlContent(value) ? value : markdownToHtml(value);
    commitChange(formatHtmlPretty(currentHtml));
  };

  const htmlSearchMatches = useMemo(() => {
    if (!htmlSearchQuery.trim() || !value) return [] as number[];
    const q = htmlSearchQuery.toLowerCase();
    const hay = value.toLowerCase();
    const indices: number[] = [];
    let pos = 0;
    while ((pos = hay.indexOf(q, pos)) !== -1) {
      indices.push(pos);
      pos += q.length;
    }
    return indices;
  }, [htmlSearchQuery, value]);

  const jumpHtmlMatch = (step: 1 | -1 = 1) => {
    if (!htmlTextareaRef.current || htmlSearchMatches.length === 0) return;
    const nextIdx = (htmlSearchIndex + step + htmlSearchMatches.length) % htmlSearchMatches.length;
    setHtmlSearchIndex(nextIdx);
    const pos = htmlSearchMatches[nextIdx];
    htmlTextareaRef.current.focus();
    htmlTextareaRef.current.setSelectionRange(pos, pos + htmlSearchQuery.length);
  };

  // Popover openers
  const openPopover = (kind: Exclude<ActivePopoverKind, 'none'>) => {
    if (kind === 'link') {
      if (mode === 'compose' && composeRef.current) {
        const sel = window.getSelection();
        const existingA = sel ? findAncestorElement(sel.anchorNode, composeRef.current, ['a']) : null;
        if (existingA) {
          setLinkText((existingA.textContent || '').trim());
          setLinkUrl(existingA.getAttribute('href') || '');
        } else {
          setLinkText(sel && sel.rangeCount > 0 ? sel.toString().trim() : '');
          setLinkUrl('');
        }
      } else if (mode === 'html' && htmlTextareaRef.current) {
        const el = htmlTextareaRef.current;
        setLinkText((value || '').slice(el.selectionStart || 0, el.selectionEnd || 0).trim());
        setLinkUrl('');
      }
    } else if (kind === 'image') {
      setImgUrl('');
      setImgAlt('');
    } else if (kind === 'video') {
      setVidUrl('');
    }
    setActivePopover((prev) => (prev === kind ? 'none' : kind));
  };

  const applyLink = () => {
    const cleanUrl = linkUrl.trim() || 'https://';
    const cleanText = linkText.trim() || cleanUrl;
    const isExternal = !cleanUrl.startsWith('/') && !cleanUrl.startsWith('#');
    const safeHref = cleanUrl.replace(/"/g, '&quot;');
    const safeLabel = cleanText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const htmlSnippet = `<a href="${safeHref}"${
      isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
    }>${safeLabel}</a>`;

    if (mode === 'compose' && composeRef.current) {
      ensureComposeSelection();
      const sel = window.getSelection();
      const existingA = sel ? findAncestorElement(sel.anchorNode, composeRef.current, ['a']) : null;
      if (existingA) {
        existingA.setAttribute('href', cleanUrl);
        if (isExternal) {
          existingA.setAttribute('target', '_blank');
          existingA.setAttribute('rel', 'noopener noreferrer');
        } else {
          existingA.removeAttribute('target');
          existingA.removeAttribute('rel');
        }
        if (cleanText) existingA.textContent = cleanText;
      } else {
        document.execCommand('insertHTML', false, `${htmlSnippet}&nbsp;`);
      }
      emitComposeHtml();
      refreshToolbarState();
    } else {
      wrapHtmlSelection(
        `<a href="${safeHref}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}>`,
        '</a>',
        cleanText
      );
    }
    setActivePopover('none');
  };

  const applyImage = () => {
    const cleanUrl = imgUrl.trim();
    if (!cleanUrl) return;
    const safeUrl = cleanUrl.replace(/"/g, '&quot;');
    const safeAlt = (imgAlt.trim() || 'Article image').replace(/"/g, '&quot;');
    const htmlSnippet = `<p><img src="${safeUrl}" alt="${safeAlt}" referrerpolicy="no-referrer" /></p>`;

    if (mode === 'compose') {
      ensureComposeSelection();
      document.execCommand('insertHTML', false, htmlSnippet);
      emitComposeHtml();
    } else {
      wrapHtmlSelection(htmlSnippet, '', '');
    }
    setActivePopover('none');
  };

  const applyVideo = () => {
    const embedHtml = buildEmbedHtmlFromVideoUrl(vidUrl);
    if (!embedHtml) return;
    if (mode === 'compose') {
      ensureComposeSelection();
      document.execCommand('insertHTML', false, embedHtml);
      emitComposeHtml();
    } else {
      wrapHtmlSelection(embedHtml, '', '');
    }
    setActivePopover('none');
  };

  const handleComposeKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      const k = e.key.toLowerCase();
      if (k === 'b') {
        e.preventDefault();
        execComposeCommand('bold');
      } else if (k === 'i') {
        e.preventDefault();
        execComposeCommand('italic');
      } else if (k === 'u') {
        e.preventDefault();
        execComposeCommand('underline');
      } else if (k === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (k === 'y' || (k === 'z' && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
      }
    }
  };

  const plainTextForCount = useMemo(
    () =>
      (value || '')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .trim(),
    [value]
  );
  const wordCount = plainTextForCount ? plainTextForCount.split(/\s+/).filter(Boolean).length : 0;
  const charCount = plainTextForCount.length;

  const toolBtn = (active = false, disabled = false) =>
    `min-w-[30px] min-h-[30px] p-1.5 rounded-lg inline-flex items-center justify-center transition-colors ${
      disabled
        ? 'opacity-35 cursor-not-allowed text-slate-400 dark:text-slate-600'
        : active
        ? 'bg-[#29aaea]/20 text-[#0284c7] dark:text-[#38bdf8] ring-1 ring-[#29aaea]/40 cursor-pointer'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer'
    }`;

  const preventFocusLoss = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 overflow-hidden">
      {/* Top Responsive Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-2 sm:px-2.5 py-2 bg-slate-100/90 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        {mode === 'compose' ? (
          <div className="flex items-center gap-0.5 flex-wrap min-w-0">
            {/* Undo / Redo */}
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={handleUndo}
              disabled={!historyMeta.canUndo}
              className={toolBtn(false, !historyMeta.canUndo)}
              title={`${t('Undo')} (Ctrl+Z)`}
            >
              <TbArrowBackUp size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={handleRedo}
              disabled={!historyMeta.canRedo}
              className={toolBtn(false, !historyMeta.canRedo)}
              title={`${t('Redo')} (Ctrl+Y)`}
            >
              <TbArrowForwardUp size={15} />
            </button>

            <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5 sm:mx-1" />

            {/* Normal / H1-H6 Format Dropdown */}
            <select
              aria-label="Heading format"
              value={activeFormats.blockTag}
              onChange={(e) =>
                applyHeadingBlock(
                  e.target.value as 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote'
                )
              }
              className="h-[30px] px-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#29aaea] cursor-pointer me-1"
            >
              <option value="p">{t('Normal')}</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="h5">Heading 5</option>
              <option value="h6">Heading 6</option>
              <option value="blockquote">Blockquote</option>
            </select>

            {/* Quick H1–H6 Buttons */}
            <button type="button" onMouseDown={preventFocusLoss} onClick={() => applyHeadingBlock('h1')} className={toolBtn(activeFormats.blockTag === 'h1')} title="Heading 1">
              <TbH1 size={15} />
            </button>
            <button type="button" onMouseDown={preventFocusLoss} onClick={() => applyHeadingBlock('h2')} className={toolBtn(activeFormats.blockTag === 'h2')} title="Heading 2">
              <TbH2 size={15} />
            </button>
            <button type="button" onMouseDown={preventFocusLoss} onClick={() => applyHeadingBlock('h3')} className={toolBtn(activeFormats.blockTag === 'h3')} title="Heading 3">
              <TbH3 size={15} />
            </button>
            <button type="button" onMouseDown={preventFocusLoss} onClick={() => applyHeadingBlock('h4')} className={toolBtn(activeFormats.blockTag === 'h4')} title="Heading 4">
              <TbH4 size={15} />
            </button>
            <button type="button" onMouseDown={preventFocusLoss} onClick={() => applyHeadingBlock('h5')} className={toolBtn(activeFormats.blockTag === 'h5')} title="Heading 5">
              <TbH5 size={15} />
            </button>
            <button type="button" onMouseDown={preventFocusLoss} onClick={() => applyHeadingBlock('h6')} className={toolBtn(activeFormats.blockTag === 'h6')} title="Heading 6">
              <TbH6 size={15} />
            </button>

            <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5 sm:mx-1" />

            {/* Bold, Italic, Underline, Strikethrough */}
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => execComposeCommand('bold')}
              className={toolBtn(activeFormats.bold)}
              title="Bold (Ctrl+B)"
            >
              <TbBold size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => execComposeCommand('italic')}
              className={toolBtn(activeFormats.italic)}
              title="Italic (Ctrl+I)"
            >
              <TbItalic size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => execComposeCommand('underline')}
              className={toolBtn(activeFormats.underline)}
              title="Underline (Ctrl+U)"
            >
              <TbUnderline size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => execComposeCommand('strikeThrough')}
              className={toolBtn(activeFormats.strikeThrough)}
              title="Strikethrough"
            >
              <TbStrikethrough size={15} />
            </button>

            {/* Text Color & Highlight Popover Triggers */}
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => openPopover('textColor')}
              className={toolBtn(activePopover === 'textColor')}
              title={t('Text Color')}
            >
              <TbPalette size={15} style={{ color: textColor }} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => openPopover('highlightColor')}
              className={toolBtn(activePopover === 'highlightColor')}
              title={t('Highlight Color')}
            >
              <TbHighlight size={15} />
            </button>

            <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5 sm:mx-1" />

            {/* Link, Unlink, Image, Video */}
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => openPopover('link')}
              className={toolBtn(activePopover === 'link' || activeFormats.link)}
              title={t('Insert Link')}
            >
              <TbLink size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={handleUnlink}
              className={toolBtn(false, !activeFormats.link)}
              disabled={!activeFormats.link}
              title={t('Remove Link')}
            >
              <TbLinkOff size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => openPopover('image')}
              className={toolBtn(activePopover === 'image')}
              title={t('Insert Image URL')}
            >
              <TbPhoto size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => openPopover('video')}
              className={toolBtn(activePopover === 'video')}
              title={t('Insert Video')}
            >
              <TbVideo size={15} />
            </button>

            <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5 sm:mx-1" />

            {/* Bullet List, Numbered List, Quote, Code, HR */}
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => execComposeCommand('insertUnorderedList')}
              className={toolBtn(activeFormats.unorderedList)}
              title="Bullet List"
            >
              <TbList size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => execComposeCommand('insertOrderedList')}
              className={toolBtn(activeFormats.orderedList)}
              title="Numbered List"
            >
              <TbListNumbers size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => applyHeadingBlock('blockquote')}
              className={toolBtn(activeFormats.blockTag === 'blockquote')}
              title="Blockquote"
            >
              <TbQuote size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={toggleInlineCodeCompose}
              className={toolBtn(activeFormats.code)}
              title="Inline Code (Toggle)"
            >
              <TbCode size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => execComposeCommand('insertHorizontalRule')}
              className={toolBtn()}
              title="Insert Horizontal Rule"
            >
              <TbSeparatorHorizontal size={15} />
            </button>

            <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5 sm:mx-1" />

            {/* Alignment, Indent & Clear Formatting */}
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => {
                onAlignChange?.('left');
                execComposeCommand('justifyLeft');
              }}
              className={toolBtn(align === 'left')}
              title="Align Left"
            >
              <TbAlignLeft size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => {
                onAlignChange?.('center');
                execComposeCommand('justifyCenter');
              }}
              className={toolBtn(align === 'center')}
              title="Align Center"
            >
              <TbAlignCenter size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => {
                onAlignChange?.('right');
                execComposeCommand('justifyRight');
              }}
              className={toolBtn(align === 'right')}
              title="Align Right"
            >
              <TbAlignRight size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => execComposeCommand('justifyFull')}
              className={toolBtn()}
              title="Justify"
            >
              <TbAlignJustified size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => execComposeCommand('indent')}
              className={toolBtn()}
              title="Indent"
            >
              <TbIndentIncrease size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => execComposeCommand('outdent')}
              className={toolBtn()}
              title="Outdent"
            >
              <TbIndentDecrease size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={handleClearFormatting}
              className={toolBtn()}
              title={t('Clear Formatting')}
            >
              <TbEraser size={15} />
            </button>
          </div>
        ) : mode === 'html' ? (
          /* HTML VIEW TOOLBAR */
          <div className="flex items-center gap-0.5 flex-wrap min-w-0">
            <button
              type="button"
              onClick={handleUndo}
              disabled={!historyMeta.canUndo}
              className={toolBtn(false, !historyMeta.canUndo)}
              title={t('Undo')}
            >
              <TbArrowBackUp size={15} />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={!historyMeta.canRedo}
              className={toolBtn(false, !historyMeta.canRedo)}
              title={t('Redo')}
            >
              <TbArrowForwardUp size={15} />
            </button>

            <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5 sm:mx-1" />

            <button
              type="button"
              onClick={() => setShowHtmlSearch((s) => !s)}
              className={toolBtn(showHtmlSearch)}
              title={t('Find in HTML')}
            >
              <TbSearch size={15} />
            </button>
            <button
              type="button"
              onClick={handleBeautifyHtml}
              className={toolBtn()}
              title={t('Format / Beautify HTML')}
            >
              <TbWand size={15} />
            </button>
            <button
              type="button"
              onClick={() => setHtmlDir((d) => (d === 'ltr' ? 'rtl' : 'ltr'))}
              className={toolBtn()}
              title={htmlDir === 'ltr' ? 'LTR' : 'RTL'}
            >
              {htmlDir === 'ltr' ? <TbTextDirectionLtr size={15} /> : <TbTextDirectionRtl size={15} />}
            </button>
            <button
              type="button"
              onClick={() => setHtmlSplitPreview((v) => !v)}
              className={toolBtn(htmlSplitPreview)}
              title={t('Toggle Split HTML Viewer')}
            >
              <TbLayoutColumns size={15} />
            </button>

            <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5 sm:mx-1" />

            <button type="button" onClick={() => wrapHtmlSelection('<strong>', '</strong>', 'bold text')} className={toolBtn()} title="<strong> (Toggle)">
              <TbBold size={15} />
            </button>
            <button type="button" onClick={() => wrapHtmlSelection('<em>', '</em>', 'italic text')} className={toolBtn()} title="<em> (Toggle)">
              <TbItalic size={15} />
            </button>
            <button type="button" onClick={() => wrapHtmlSelection('<u>', '</u>', 'underlined text')} className={toolBtn()} title="<u> (Toggle)">
              <TbUnderline size={15} />
            </button>
            <button type="button" onClick={() => wrapHtmlSelection('<s>', '</s>', 'strikethrough')} className={toolBtn()} title="<s> (Toggle)">
              <TbStrikethrough size={15} />
            </button>
            <button type="button" onClick={() => wrapHtmlSelection('<code>', '</code>', 'code')} className={toolBtn()} title="<code> (Toggle)">
              <TbCode size={15} />
            </button>

            <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5 sm:mx-1" />

            <button type="button" onClick={() => wrapHtmlSelection('<h1>', '</h1>', 'Heading 1')} className={toolBtn()} title="<h1>">
              <TbH1 size={15} />
            </button>
            <button type="button" onClick={() => wrapHtmlSelection('<h2>', '</h2>', 'Heading 2')} className={toolBtn()} title="<h2>">
              <TbH2 size={15} />
            </button>
            <button type="button" onClick={() => wrapHtmlSelection('<h3>', '</h3>', 'Heading 3')} className={toolBtn()} title="<h3>">
              <TbH3 size={15} />
            </button>
            <button type="button" onClick={() => wrapHtmlSelection('<h4>', '</h4>', 'Heading 4')} className={toolBtn()} title="<h4>">
              <TbH4 size={15} />
            </button>
            <button type="button" onClick={() => wrapHtmlSelection('<h5>', '</h5>', 'Heading 5')} className={toolBtn()} title="<h5>">
              <TbH5 size={15} />
            </button>
            <button type="button" onClick={() => wrapHtmlSelection('<h6>', '</h6>', 'Heading 6')} className={toolBtn()} title="<h6>">
              <TbH6 size={15} />
            </button>

            <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5 sm:mx-1" />

            <button
              type="button"
              onClick={() => wrapHtmlSelection('<ul>\n  <li>', '</li>\n</ul>', 'List item')}
              className={toolBtn()}
              title="<ul>"
            >
              <TbList size={15} />
            </button>
            <button
              type="button"
              onClick={() => wrapHtmlSelection('<ol>\n  <li>', '</li>\n</ol>', 'Step 1')}
              className={toolBtn()}
              title="<ol>"
            >
              <TbListNumbers size={15} />
            </button>
            <button
              type="button"
              onClick={() => wrapHtmlSelection('<blockquote>', '</blockquote>', 'Quote')}
              className={toolBtn()}
              title="<blockquote>"
            >
              <TbQuote size={15} />
            </button>
            <button type="button" onClick={() => openPopover('link')} className={toolBtn(activePopover === 'link')} title="<a>">
              <TbLink size={15} />
            </button>
            <button type="button" onClick={handleUnlink} className={toolBtn()} title={t('Remove Link')}>
              <TbLinkOff size={15} />
            </button>
            <button type="button" onClick={() => openPopover('image')} className={toolBtn(activePopover === 'image')} title="<img>">
              <TbPhoto size={15} />
            </button>
            <button type="button" onClick={() => openPopover('video')} className={toolBtn(activePopover === 'video')} title="<video>">
              <TbVideo size={15} />
            </button>
            <button
              type="button"
              onClick={() => wrapHtmlSelection('<style>\n  .sa-box { padding: 14px; border-radius: 12px; border: 1px solid rgba(41,170,234,0.35); background: rgba(41,170,234,0.08); }\n</style>\n<div class="sa-box">', '</div>', 'Styled block')}
              className="px-2 h-[30px] rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold cursor-pointer"
              title="Insert <style> CSS snippet"
            >
              + CSS
            </button>
            <button type="button" onClick={handleClearFormatting} className={toolBtn()} title={t('Clear Formatting')}>
              <TbEraser size={15} />
            </button>
          </div>
        ) : (
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
            {t('Live Rendered Output Preview')}
          </div>
        )}

        {/* Mode Switcher: Compose | HTML View <> | Preview */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => switchMode('compose')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
              mode === 'compose'
                ? 'bg-[#29aaea] text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TbPencil size={12} />
            <span>{t('Compose')}</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('html')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
              mode === 'html'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TbSourceCode size={13} />
            <span>{t('HTML View')}</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('preview')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
              mode === 'preview'
                ? 'bg-[#29aaea] text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TbEye size={12} />
            <span>{t('Preview')}</span>
          </button>
        </div>
      </div>

      {/* Inline HTML Search Bar */}
      {mode === 'html' && showHtmlSearch && (
        <div className="flex items-center gap-2 flex-wrap px-3 py-2 bg-indigo-500/5 border-b border-slate-200 dark:border-slate-800">
          <TbSearch size={14} className="text-indigo-500 shrink-0" />
          <input
            type="text"
            value={htmlSearchQuery}
            onChange={(e) => {
              setHtmlSearchQuery(e.target.value);
              setHtmlSearchIndex(0);
            }}
            placeholder={t('Search inside HTML code...')}
            className="flex-1 min-w-[160px] rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
            {htmlSearchMatches.length} {t('matches')}
          </span>
          <button
            type="button"
            disabled={htmlSearchMatches.length === 0}
            onClick={() => jumpHtmlMatch(1)}
            className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold disabled:opacity-40 cursor-pointer"
          >
            {t('Find Next')}
          </button>
          <button
            type="button"
            onClick={() => setShowHtmlSearch(false)}
            className="p-1 rounded-lg text-slate-500 hover:text-rose-500 cursor-pointer"
          >
            <TbX size={14} />
          </button>
        </div>
      )}

      {/* Text Color Popover */}
      {activePopover === 'textColor' && (
        <div className="flex items-center justify-between gap-2 flex-wrap px-3 py-2 bg-sky-500/5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 me-1">
              {t('Text Color')}:
            </span>
            {TEXT_COLOR_SWATCHES.map((hex) => (
              <button
                key={hex}
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => {
                  setTextColor(hex);
                  execComposeCommand('foreColor', hex, true);
                  setActivePopover('none');
                }}
                aria-label={`Color ${hex}`}
                style={{ backgroundColor: hex }}
                className="w-6 h-6 rounded-md border border-slate-300 dark:border-slate-600 shadow-xs hover:scale-110 transition-transform cursor-pointer"
              />
            ))}
            <label className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
              <span>{t('Custom')}</span>
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  execComposeCommand('foreColor', e.target.value, true);
                }}
                className="w-4 h-4 bg-transparent border-0 p-0 cursor-pointer"
              />
            </label>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={resetTextColorCompose}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold cursor-pointer"
            >
              <TbPaletteOff size={14} />
              <span>{t('Reset Color')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePopover('none')}
              className="p-1 rounded-lg text-slate-500 hover:text-rose-500 cursor-pointer"
            >
              <TbX size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Highlight Color Popover */}
      {activePopover === 'highlightColor' && (
        <div className="flex items-center justify-between gap-2 flex-wrap px-3 py-2 bg-amber-500/5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 me-1">
              {t('Highlight Color')}:
            </span>
            {HIGHLIGHT_COLOR_SWATCHES.map((hex) => (
              <button
                key={hex}
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => {
                  setHighlightColor(hex);
                  execComposeCommand('hiliteColor', hex, true);
                  setActivePopover('none');
                }}
                aria-label={`Highlight ${hex}`}
                style={{ backgroundColor: hex }}
                className="w-6 h-6 rounded-md border border-slate-300 dark:border-slate-600 shadow-xs hover:scale-110 transition-transform cursor-pointer"
              />
            ))}
            <label className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
              <span>{t('Custom')}</span>
              <input
                type="color"
                value={highlightColor}
                onChange={(e) => {
                  setHighlightColor(e.target.value);
                  execComposeCommand('hiliteColor', e.target.value, true);
                }}
                className="w-4 h-4 bg-transparent border-0 p-0 cursor-pointer"
              />
            </label>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={resetHighlightColorCompose}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold cursor-pointer"
            >
              <TbHighlightOff size={14} />
              <span>{t('Remove Highlight')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePopover('none')}
              className="p-1 rounded-lg text-slate-500 hover:text-rose-500 cursor-pointer"
            >
              <TbX size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Inline Link / Image / Video Popover */}
      {activePopover === 'link' && (
        <div className="flex items-center gap-2 flex-wrap px-3 py-2 bg-sky-500/5 border-b border-slate-200 dark:border-slate-800">
          <input
            type="text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="Anchor text..."
            className="flex-1 min-w-[120px] rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#29aaea]"
          />
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="URL (/game or https://...)"
            className="flex-1 min-w-[160px] rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#29aaea]"
          />
          <button
            type="button"
            onClick={applyLink}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#29aaea] text-white text-xs font-bold cursor-pointer"
          >
            <TbCheck size={13} />
            <span>{activeFormats.link ? t('Update') : t('Insert')}</span>
          </button>
          {activeFormats.link && (
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={handleUnlink}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold cursor-pointer"
            >
              <TbLinkOff size={13} />
              <span>{t('Unlink')}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setActivePopover('none')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 cursor-pointer"
          >
            <TbX size={14} />
          </button>
        </div>
      )}

      {activePopover === 'image' && (
        <div className="flex items-center gap-2 flex-wrap px-3 py-2 bg-sky-500/5 border-b border-slate-200 dark:border-slate-800">
          <input
            type="text"
            value={imgUrl}
            onChange={(e) => setImgUrl(e.target.value)}
            placeholder="Image URL (https://... or /images/...)"
            className="flex-1 min-w-[180px] rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#29aaea]"
          />
          <input
            type="text"
            value={imgAlt}
            onChange={(e) => setImgAlt(e.target.value)}
            placeholder="Alt text (SEO)..."
            className="flex-1 min-w-[120px] rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#29aaea]"
          />
          <button
            type="button"
            onClick={applyImage}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#29aaea] text-white text-xs font-bold cursor-pointer"
          >
            <TbCheck size={13} />
            <span>{t('Insert')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePopover('none')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 cursor-pointer"
          >
            <TbX size={14} />
          </button>
        </div>
      )}

      {activePopover === 'video' && (
        <div className="flex items-center gap-2 flex-wrap px-3 py-2 bg-sky-500/5 border-b border-slate-200 dark:border-slate-800">
          <input
            type="text"
            value={vidUrl}
            onChange={(e) => setVidUrl(e.target.value)}
            placeholder="YouTube, Vimeo, or MP4 video URL..."
            className="flex-1 min-w-[200px] rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#29aaea]"
          />
          <button
            type="button"
            onClick={applyVideo}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#29aaea] text-white text-xs font-bold cursor-pointer"
          >
            <TbCheck size={13} />
            <span>{t('Insert')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePopover('none')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 cursor-pointer"
          >
            <TbX size={14} />
          </button>
        </div>
      )}

      {/* Main Editor Body */}
      {mode === 'compose' && (
        <div
          ref={composeRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => {
            emitComposeHtml();
            refreshToolbarState();
          }}
          onKeyUp={refreshToolbarState}
          onMouseUp={refreshToolbarState}
          onKeyDown={handleComposeKeyDown}
          onFocus={() => {
            isComposeFocusedRef.current = true;
            refreshToolbarState();
          }}
          onBlur={() => {
            isComposeFocusedRef.current = false;
            emitComposeHtml();
          }}
          data-placeholder={
            placeholder ||
            'Write visually here — highlight any text and click Bold, Italic, Underline, Strikethrough, H1–H6, Bullet/Numbered List...'
          }
          style={{ minHeight: `${Math.max(5, minRows) * 1.6}rem` }}
          className={`sa-article-prose sa-compose-editable w-full bg-white dark:bg-[#0d121e] px-4 py-3.5 text-[15px] focus:outline-none overflow-y-auto max-h-[520px] ${
            align === 'center' ? 'text-center' : align === 'right' ? 'text-end' : 'text-start'
          }`}
        />
      )}

      {mode === 'html' && (
        <div
          className={`grid ${
            htmlSplitPreview
              ? 'grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800'
              : 'grid-cols-1'
          }`}
        >
          <textarea
            ref={htmlTextareaRef}
            dir={htmlDir}
            rows={Math.max(9, minRows + 2)}
            value={isHtmlContent(value) ? value : markdownToHtml(value)}
            onChange={(e) => commitChange(e.target.value)}
            placeholder="<style>&#10;  .card { padding: 14px; border-radius: 12px; }&#10;</style>&#10;<h2>Section Heading</h2>&#10;<p>Write or paste manual HTML + CSS here...</p>"
            className="w-full bg-slate-950 text-sky-300 font-mono text-xs leading-relaxed px-4 py-3.5 focus:outline-none resize-y"
          />
          {htmlSplitPreview && (
            <div className="p-4 bg-white dark:bg-[#0b101b] min-h-[200px] max-h-[420px] overflow-auto">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-2">
                {t('Live HTML Viewer')}
              </div>
              {value?.trim() ? (
                <ScopedHtmlViewer
                  html={isHtmlContent(value) ? value : markdownToHtml(value)}
                  align={align}
                />
              ) : (
                <div className="text-xs text-slate-400 italic py-4">
                  {t('HTML preview will appear here as you type...')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {mode === 'preview' && (
        <div className="p-4 bg-white dark:bg-[#0b101b] min-h-[170px] overflow-auto">
          {value?.trim() ? (
            <RichMarkdownContent content={value} align={align} />
          ) : (
            <div className="text-xs text-slate-400 italic py-4">
              {t('Preview will appear here as you type...')}
            </div>
          )}
        </div>
      )}

      {/* Footer stats */}
      <div className="flex items-center justify-between gap-2 flex-wrap px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400">
        <span>
          {mode === 'compose'
            ? 'Visual Compose · WYSIWYG + H1–H6 + Clear/Unlink'
            : mode === 'html'
            ? 'HTML + CSS Source · Scoped Live Viewer'
            : 'Rendered Output Preview'}
        </span>
        <span className="tabular-nums">
          {wordCount} words · {charCount} chars
        </span>
      </div>
    </div>
  );
};
