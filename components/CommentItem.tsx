import { useLanguage } from '../src/contexts/LanguageContext';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SiWolframlanguage } from 'react-icons/si';
import Icon from './Icon';
import { Comment, CommentReply } from './CommentsSection';

interface CommentItemProps {
  comment: Comment;
  onReaction: (commentId: string, replyId: string | null, type: 'like' | 'dislike' | 'love') => void;
  onReplySubmit: (commentId: string, replyText: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, onReaction, onReplySubmit }) => {
  const { dir, t } = useLanguage();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(true);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReplySubmit(comment.id, replyText);
    setReplyText('');
    setShowReplyForm(false);
    setShowReplies(true);
  };

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow mb-4"
    >
      <div className="flex gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-inner z-10">
          <SiWolframlanguage size={20} className="text-slate-800 dark:text-slate-200" />
        </div>

        {/* Comment Body */}
        <div className="flex-1 min-w-0 pb-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1.5">
            <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">
              {comment.author}
            </h4>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {new Date(comment.timestamp).toLocaleDateString()}
            </span>
          </div>
          
          {/* Tags */}
          {comment.tags && comment.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {comment.tags.map(tag => (
                <span 
                  key={tag} 
                  className="px-2.5 py-0.5 bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Comment Text */}
          <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words leading-relaxed mb-3 font-normal">
            {comment.text}
          </p>
          
          {/* Reactions & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800/80">
            {/* Helpful / Like button */}
            <button 
              onClick={() => onReaction(comment.id, null, 'like')}
              className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer"
              title={t('Helpful')}
            >
              <Icon name="ThumbsUp" size={13} />
              <span>{comment.reactions?.like || 0}</span>
            </button>

            {/* Love / Heart button */}
            <button 
              onClick={() => onReaction(comment.id, null, 'love')}
              className="flex items-center gap-1.5 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer"
              title={t('Love')}
            >
              <Icon name="Heart" size={13} />
              <span>{comment.reactions?.love || 0}</span>
            </button>

            {/* Reply toggle */}
            <button 
              onClick={() => setShowReplyForm(!showReplyForm)} 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-bold text-xs uppercase tracking-wider px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
            >
              {t('Reply')}
            </button>
            
            {/* Show/Hide Replies count */}
            {hasReplies && (
              <button 
                onClick={() => setShowReplies(!showReplies)} 
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors ms-auto flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {showReplies ? <Icon name="ChevronUp" size={14}/> : <Icon name="ChevronDown" size={14}/>}
                <span>{comment.replies!.length} {comment.replies!.length === 1 ? t('Reply') : t('Replies')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="mt-3.5 ms-10 sm:ms-14 mb-2">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400"
              autoFocus
            />
            <button 
              type="submit" 
              disabled={!replyText.trim()} 
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2 font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              {t('Post')}
            </button>
          </div>
        </form>
      )}

      {/* Replies list */}
      <AnimatePresence>
        {hasReplies && showReplies && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ms-4 sm:ms-6 ps-5 sm:ps-7 border-s-2 border-slate-200 dark:border-slate-800 mt-3 space-y-3 pt-2"
          >
            {comment.replies!.map((reply) => (
              <div key={reply.id} className="relative">
                {/* Horizontal connector line */}
                <div className="absolute -start-5 sm:-start-7 top-4 w-4 sm:w-6 h-[2px] bg-slate-200 dark:border-slate-800"></div>
                
                <div className="flex gap-2.5 sm:gap-3 bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    <SiWolframlanguage size={13} className="text-slate-700 dark:text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {reply.author}
                      </h5>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {new Date(reply.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words leading-relaxed font-normal">
                      <span className="text-blue-500 font-semibold">@{comment.author}</span> {reply.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
