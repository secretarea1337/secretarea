import React, { useRef, useState } from 'react';
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
  TbAlignLeft,
  TbAlignCenter,
  TbAlignRight,
  TbEye,
  TbPencil,
  TbLayoutColumns,
  TbSeparatorHorizontal,
  TbCheck,
  TbX,
} from 'react-icons/tb';
import { RichMarkdownContent } from './BlogBlockRenderer';
import { useLanguage } from '../src/contexts/LanguageContext';

interface RichTextBlockEditorProps {
  value: string;
  onChange: (nextValue: string) => void;
  align?: 'left' | 'center' | 'right';
  onAlignChange?: (nextAlign: 'left' | 'center' | 'right') => void;
  placeholder?: string;
  minRows?: number;
}

export const RichTextBlockEditor: React.FC<RichTextBlockEditorProps> = ({
  value,
  onChange,
  align = 'left',
  onAlignChange,
  placeholder,
  minRows = 6,
}) => {
  const { t } = useLanguage();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [mode, setMode] = useState<'write' | 'split' | 'preview'>('write');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const wrapSelection = (before: string, after: string, fallbackText = 'text') => {
    const el = textareaRef.current;
    const current = value || '';
    if (!el) {
      onChange(`${current}${before}${fallbackText}${after}`);
      return;
    }

    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const selected = current.slice(start, end);
    const replacement = selected
      ? `${before}${selected}${after}`
      : `${before}${fallbackText}${after}`;

    const next = current.slice(0, start) + replacement + current.slice(end);
    onChange(next);

    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      textareaRef.current.focus();
      if (selected) {
        textareaRef.current.setSelectionRange(
          start + before.length,
          start + before.length + selected.length
        );
      } else {
        textareaRef.current.setSelectionRange(
          start + before.length,
          start + before.length + fallbackText.length
        );
      }
    });
  };

  const prefixCurrentLine = (prefix: string) => {
    const el = textareaRef.current;
    const current = value || '';
    if (!el) {
      onChange(`${current ? `${current}\n` : ''}${prefix}`);
      return;
    }

    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const lineStart = current.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const lineEndIdx = current.indexOf('\n', end);
    const lineEnd = lineEndIdx === -1 ? current.length : lineEndIdx;
    const blockText = current.slice(lineStart, lineEnd);

    const lines = blockText.split('\n');
    const isHeadingPrefix = /^#{1,6}\s$/.test(prefix);
    const transformed = lines
      .map((ln, idx) => {
        if (isHeadingPrefix) {
          const stripped = ln.replace(/^#{1,6}\s+/, '');
          return `${prefix}${stripped}`;
        }
        if (prefix === '1. ') {
          const stripped = ln.replace(/^\d+\.\s+/, '');
          return `${idx + 1}. ${stripped}`;
        }
        if (prefix === '- ' || prefix === '> ') {
          if (ln.startsWith(prefix)) return ln.slice(prefix.length);
          return `${prefix}${ln}`;
        }
        return `${prefix}${ln}`;
      })
      .join('\n');

    const next = current.slice(0, lineStart) + transformed + current.slice(lineEnd);
    onChange(next);

    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(lineStart, lineStart + transformed.length);
    });
  };

  const openLinkPopover = () => {
    const el = textareaRef.current;
    if (el) {
      const selected = (value || '').slice(el.selectionStart || 0, el.selectionEnd || 0).trim();
      setLinkText(selected || '');
    } else {
      setLinkText('');
    }
    setLinkUrl('');
    setShowLinkInput(true);
  };

  const applyLink = () => {
    const cleanUrl = linkUrl.trim() || 'https://';
    const cleanText = linkText.trim() || cleanUrl;
    wrapSelection('[', `](${cleanUrl})`, cleanText);
    setShowLinkInput(false);
    setLinkText('');
    setLinkUrl('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      const k = e.key.toLowerCase();
      if (k === 'b') {
        e.preventDefault();
        wrapSelection('**', '**', 'bold text');
      } else if (k === 'i') {
        e.preventDefault();
        wrapSelection('*', '*', 'italic text');
      } else if (k === 'u') {
        e.preventDefault();
        wrapSelection('<u>', '</u>', 'underlined text');
      }
    }
  };

  const wordCount = (value || '').trim() ? (value || '').trim().split(/\s+/).length : 0;
  const charCount = (value || '').length;

  const toolBtnCls =
    'p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 overflow-hidden">
      {/* Formatting Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap px-2.5 py-2 bg-slate-100/90 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-0.5 flex-wrap">
          {/* Text Styles */}
          <button
            type="button"
            onClick={() => wrapSelection('**', '**', 'bold text')}
            className={toolBtnCls}
            title="Bold (Ctrl+B)"
          >
            <TbBold size={15} />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('*', '*', 'italic text')}
            className={toolBtnCls}
            title="Italic (Ctrl+I)"
          >
            <TbItalic size={15} />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('<u>', '</u>', 'underlined text')}
            className={toolBtnCls}
            title="Underline (Ctrl+U)"
          >
            <TbUnderline size={15} />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('~~', '~~', 'strikethrough')}
            className={toolBtnCls}
            title="Strikethrough"
          >
            <TbStrikethrough size={15} />
          </button>

          <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* H1 - H6 Heading Inserts */}
          <button type="button" onClick={() => prefixCurrentLine('# ')} className={toolBtnCls} title="H1 Heading">
            <TbH1 size={15} />
          </button>
          <button type="button" onClick={() => prefixCurrentLine('## ')} className={toolBtnCls} title="H2 Heading">
            <TbH2 size={15} />
          </button>
          <button type="button" onClick={() => prefixCurrentLine('### ')} className={toolBtnCls} title="H3 Heading">
            <TbH3 size={15} />
          </button>
          <button type="button" onClick={() => prefixCurrentLine('#### ')} className={toolBtnCls} title="H4 Heading">
            <TbH4 size={15} />
          </button>
          <button type="button" onClick={() => prefixCurrentLine('##### ')} className={toolBtnCls} title="H5 Heading">
            <TbH5 size={15} />
          </button>
          <button type="button" onClick={() => prefixCurrentLine('###### ')} className={toolBtnCls} title="H6 Heading">
            <TbH6 size={15} />
          </button>

          <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Lists, Quote, Code, Link, HR */}
          <button type="button" onClick={() => prefixCurrentLine('- ')} className={toolBtnCls} title="Bullet List">
            <TbList size={15} />
          </button>
          <button type="button" onClick={() => prefixCurrentLine('1. ')} className={toolBtnCls} title="Numbered List">
            <TbListNumbers size={15} />
          </button>
          <button type="button" onClick={() => prefixCurrentLine('> ')} className={toolBtnCls} title="Blockquote">
            <TbQuote size={15} />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('`', '`', 'code')}
            className={toolBtnCls}
            title="Inline Code"
          >
            <TbCode size={15} />
          </button>
          <button type="button" onClick={openLinkPopover} className={toolBtnCls} title="Insert Link">
            <TbLink size={15} />
          </button>
          <button
            type="button"
            onClick={() => onChange(`${value ? `${value}\n\n` : ''}---\n\n`)}
            className={toolBtnCls}
            title="Insert Horizontal Rule"
          >
            <TbSeparatorHorizontal size={15} />
          </button>

          {onAlignChange && (
            <>
              <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
              <button
                type="button"
                onClick={() => onAlignChange('left')}
                className={`${toolBtnCls} ${align === 'left' ? 'bg-[#29aaea]/15 text-[#29aaea]' : ''}`}
                title="Align Left"
              >
                <TbAlignLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() => onAlignChange('center')}
                className={`${toolBtnCls} ${align === 'center' ? 'bg-[#29aaea]/15 text-[#29aaea]' : ''}`}
                title="Align Center"
              >
                <TbAlignCenter size={15} />
              </button>
              <button
                type="button"
                onClick={() => onAlignChange('right')}
                className={`${toolBtnCls} ${align === 'right' ? 'bg-[#29aaea]/15 text-[#29aaea]' : ''}`}
                title="Align Right"
              >
                <TbAlignRight size={15} />
              </button>
            </>
          )}
        </div>

        {/* Mode Switcher: Write | Split | Preview */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setMode('write')}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
              mode === 'write'
                ? 'bg-[#29aaea] text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TbPencil size={12} />
            <span>{t('Write')}</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('split')}
            className={`hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
              mode === 'split'
                ? 'bg-[#29aaea] text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TbLayoutColumns size={12} />
            <span>{t('Split')}</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
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

      {/* Inline Link Inserter */}
      {showLinkInput && (
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
            <span>{t('Insert')}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 cursor-pointer"
          >
            <TbX size={14} />
          </button>
        </div>
      )}

      {/* Editor + Markdown Preview Body */}
      <div
        className={`grid ${
          mode === 'split' ? 'grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800' : 'grid-cols-1'
        }`}
      >
        {(mode === 'write' || mode === 'split') && (
          <textarea
            ref={textareaRef}
            rows={minRows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              placeholder ||
              'Write rich Markdown prose (**bold**, *italic*, <u>underline</u>, # H1..###### H6, lists, [internal](/game) or [external](https://...))...'
            }
            className={`w-full bg-white dark:bg-[#0d121e] px-3.5 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none resize-y ${
              align === 'center' ? 'text-center' : align === 'right' ? 'text-end' : 'text-start'
            }`}
          />
        )}

        {(mode === 'preview' || mode === 'split') && (
          <div className="p-4 bg-white/80 dark:bg-[#0b101b] min-h-[150px] overflow-auto">
            {value?.trim() ? (
              <RichMarkdownContent content={value} align={align} />
            ) : (
              <div className="text-xs text-slate-400 italic py-4">
                {t('Markdown preview will appear here as you type...')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400">
        <span>Markdown + H1–H6 + Underline</span>
        <span className="tabular-nums">
          {wordCount} words · {charCount} chars
        </span>
      </div>
    </div>
  );
};
