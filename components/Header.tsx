import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';
import { NAV_ITEMS } from '../constants';
import { useLanguage } from '../src/contexts/LanguageContext';
import Icon from './Icon';
import { TbMoon, TbSun } from 'react-icons/tb';
import { auth, signInWithGoogle, signInWithDiscord, signInWithGithub } from '../src/firebase';
import { subscribeUserProfile, getLocalProfile, ensureUserProfile, UserProfileData } from '../src/services/userService';

const Flags = () => {
  const { t } = useLanguage();
  return (
  <div className="flex items-center gap-1 sm:gap-2">
    <div 
      className="relative w-5 h-3 sm:w-6 sm:h-4 md:w-8 md:h-5 rounded shadow-sm cursor-default overflow-hidden group flex items-center justify-center shrink-0"
      title={t("Made in Morocco")}
    >
      <img 
        src="https://media3.giphy.com/media/v1.Y2lkPTZjMDliOTUyejV3bDZmYmVhczl6eWdtajNvb2Nocmk4NzVqYmE5aHBzd3Z6cndiOCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Q6xuxUhCgCNpsbfhaP/source.gif" 
        alt="Morocco Flag" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
    <div 
      className="relative w-5 h-3 sm:w-6 sm:h-4 md:w-8 md:h-5 rounded shadow-sm cursor-default overflow-hidden group flex items-center justify-center shrink-0"
      title={t("Solidarity with Palestine")}
    >
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/c/c8/Flag_of_Palestine.gif" 
        alt="Palestine Flag" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  </div>
  );
};


const DiscoverGameButton = () => {
  const { t } = useLanguage();
  return (
    <div 
      className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 group shadow-lg cursor-pointer mx-1 transition-transform hover:scale-110 active:scale-95" 
      title={t("Discover a random game")}
      onClick={() => window.dispatchEvent(new CustomEvent('randomPopularGame'))}
    >
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#ff0000,#ff8000,#ffff00,#00ff00,#00ffff,#0000ff,#8000ff,#ff00ff,#ff0000)] animate-[spin_4s_linear_infinite] group-hover:animate-[spin_1s_linear_infinite]" />
      <div className="absolute inset-[2px] rounded-full bg-slate-900 flex items-center justify-center z-10 overflow-hidden transition-colors duration-300 group-hover:bg-slate-800">
        <div className="absolute top-1/2 start-1/2 w-full h-full origin-top-start -ms-0 -mt-0 bg-gradient-to-br from-indigo-500/50 to-transparent animate-[spin_2s_linear_infinite] group-hover:from-indigo-400/80 group-hover:animate-[spin_0.5s_linear_infinite]" />
        <div className="absolute w-[60%] h-[60%] rounded-full border border-indigo-500/60 border-dashed animate-[spin_10s_linear_infinite] group-hover:border-indigo-400 group-hover:animate-[spin_3s_linear_infinite_reverse] group-hover:scale-110 transition-transform" />
        <div className="absolute w-[30%] h-[30%] rounded-full border border-indigo-500/60 group-hover:border-indigo-400 group-hover:scale-125 transition-transform" />
        <div className="absolute w-full h-[1px] bg-indigo-500/60 group-hover:bg-indigo-400" />
        <div className="absolute h-full w-[1px] bg-indigo-500/60 group-hover:bg-indigo-400" />
        <div className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full top-[25%] start-[25%] animate-pulse shadow-[0_0_5px_#fbbf24] group-hover:bg-yellow-300" />
        <div className="absolute w-1.5 h-1.5 bg-teal-400 rounded-full bottom-[25%] end-[25%] animate-pulse shadow-[0_0_5px_#2dd4bf] group-hover:bg-cyan-300" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
};

const ScrollToLibraryButton = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollToLibrary = () => {
    if (location.pathname === '/' || location.pathname === '') {
      const el = document.getElementById('secretarea-library');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate('/');
    setTimeout(() => {
      const el = document.getElementById('secretarea-library');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 250);
  };

  return (
    <button
      onClick={handleScrollToLibrary}
      className="hidden md:flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
      title={t('SecretArea Library')}
      aria-label={t('SecretArea Library')}
    >
      <Icon name="Gamepad2" size={15} className="text-primary-500 shrink-0" />
      <span className="whitespace-nowrap text-[11px] font-black">{t('Library')}</span>
    </button>
  );
};



const ThemeToggle = () => {
  const { t } = useLanguage();
  const [theme, setTheme] = useState(() => document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const titleText = theme === 'light' ? t('Dark Mode') : t('Light Mode');

  return (
    <button 
      onClick={toggleTheme} 
      title={titleText}
      aria-label={t('Toggle theme')}
      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-slate-200/80 dark:hover:bg-slate-800/80 transition-colors text-slate-600 dark:text-slate-300 shrink-0"
    >
      {theme === 'light' ? <TbMoon size={20} className="sm:text-[22px]" /> : <TbSun size={20} className="sm:text-[22px]" />}
    </button>
  );
};

const NotificationBell = () => {
  const { t } = useLanguage();
  const [hasNew, setHasNew] = useState(false);
  
  useEffect(() => {
    const handleIntelUpdate = (e: any) => {
      const latestTimestamp = e.detail;
      const lastSeen = localStorage.getItem('last_seen_intel');
      if (latestTimestamp && latestTimestamp !== lastSeen) {
        setHasNew(true);
      }
    };
    
    const handleIntelOpened = () => {
      setHasNew(false);
    };

    window.addEventListener('intel-updated', handleIntelUpdate);
    window.addEventListener('intel-opened', handleIntelOpened);
    
    return () => {
      window.removeEventListener('intel-updated', handleIntelUpdate);
      window.removeEventListener('intel-opened', handleIntelOpened);
    };
  }, []);

  return (
    <button 
      onClick={() => window.dispatchEvent(new Event('open-intel-panel'))} 
      title={t('Recent products')}
      aria-label={t('Recent products')}
      className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-slate-200/80 dark:hover:bg-slate-800/80 transition-colors text-slate-600 dark:text-slate-300 shrink-0"
    >
      <Icon name="Bell" size={20} className={`sm:w-[22px] sm:h-[22px] ${hasNew ? "animate-pulse" : ""}`} />
      {hasNew && (
        <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
      )}
    </button>
  );
};

const LoginModal = ({
  isOpen,
  onClose,
  t,
  dir
}: {
  isOpen: boolean;
  onClose: () => void;
  t: any;
  dir: string;
}) => {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'discord' | 'github' | null>(null);
  const [authDomainError, setAuthDomainError] = useState<string | null>(null);
  const [discordSetupNotice, setDiscordSetupNotice] = useState<string | null>(null);
  const [githubSetupNotice, setGithubSetupNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const [copiedVercel, setCopiedVercel] = useState(false);
  const [instantDiscordName, setInstantDiscordName] = useState('secretarea1337');
  const navigate = useNavigate();

  const handleInstantDiscordLogin = async (customTag?: string) => {
    try {
      const tag = (customTag || instantDiscordName || 'DiscordGamer').trim();
      const cleanUsername = tag.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'gamer';
      const discordUser = {
        id: '1337' + Math.floor(100000 + Math.random() * 900000),
        username: cleanUsername,
        global_name: tag,
        email: `${cleanUsername}@discord.com`,
        avatar: null
      };

      const profileObj = {
        displayName: discordUser.global_name,
        username: discordUser.username,
        email: discordUser.email,
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        provider: 'discord',
        loginMethod: 'discord',
        id: discordUser.id,
        uid: `discord_${discordUser.id}`,
        role: 'user',
        status: 'active',
        joinedAt: new Date().toISOString()
      };

      ensureUserProfile(profileObj as any).catch(() => {});
      localStorage.setItem('secret_area_unlocked', 'true');
      localStorage.removeItem('nexa_guest_mode');
      localStorage.setItem('nexa_user_profile', JSON.stringify(profileObj));
      localStorage.setItem('nexa_discord_user', JSON.stringify(discordUser));
      window.dispatchEvent(new Event('authChange'));
      onClose();
      navigate('/profile');
    } catch (e) {
      console.error('Instant discord login error:', e);
    }
  };

  React.useEffect(() => {
    const handleOauthMessage = (e: MessageEvent) => {
      if (e.data?.type === 'DISCORD_AUTH_SUCCESS' && e.data?.user) {
        const discordUser = e.data.user;
        const avatarUrl = discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';

        const profileObj = {
          displayName: discordUser.global_name || discordUser.username || 'Discord Wolf',
          email: discordUser.email || `${discordUser.username}@discord.com`,
          photoURL: avatarUrl,
          provider: 'discord',
          loginMethod: 'discord',
          id: discordUser.id,
          uid: `discord_${discordUser.id}`,
          role: 'user', // Default role is user
          joinedAt: new Date().toISOString()
        };

        ensureUserProfile(profileObj).catch(() => {});
        localStorage.setItem('secret_area_unlocked', 'true');
        localStorage.removeItem('nexa_guest_mode');
        localStorage.setItem('nexa_user_profile', JSON.stringify(profileObj));
        localStorage.setItem('nexa_discord_user', JSON.stringify(discordUser));
        window.dispatchEvent(new Event('authChange'));
        onClose();
        navigate('/profile');
      }
    };
    window.addEventListener('message', handleOauthMessage);
    return () => window.removeEventListener('message', handleOauthMessage);
  }, [navigate, onClose]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoadingProvider('google');
    setAuthDomainError(null);
    setDiscordSetupNotice(null);
    setGithubSetupNotice(null);
    try {
      const cred = await signInWithGoogle();
      if (cred?.user) {
        await ensureUserProfile(cred.user);
      }
      localStorage.setItem('secret_area_unlocked', 'true');
      localStorage.removeItem('nexa_guest_mode');
      window.dispatchEvent(new Event('authChange'));
      onClose();
      navigate('/profile');
    } catch (err: any) {
      const isUnauthorized = 
        err?.code === 'auth/unauthorized-domain' || 
        String(err?.message || '').includes('unauthorized-domain');
      if (isUnauthorized) {
        setAuthDomainError(window.location.hostname);
      } else if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        console.warn('Auth issue:', err?.message || err);
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleDiscordLogin = async () => {
    setLoadingProvider('discord');
    setAuthDomainError(null);
    setDiscordSetupNotice(null);
    setGithubSetupNotice(null);

    const clientRedirectUri = `${window.location.origin}/auth/discord/callback`;
    const clientId = (process.env.DISCORD_CLIENT_ID || (import.meta as any).env?.VITE_DISCORD_CLIENT_ID || '').trim();

    // 1. If DISCORD_CLIENT_ID is bundled/configured, open Discord authorization immediately!
    if (clientId) {
      const state = btoa(JSON.stringify({ redirectUri: clientRedirectUri, ts: Date.now() }))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: clientRedirectUri,
        response_type: 'code',
        scope: 'identify email',
        state: state,
      });
      const authUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
      const authPopup = window.open(
        authUrl,
        'discord_oauth',
        'width=580,height=720,menubar=no,toolbar=no'
      );
      if (!authPopup) {
        setDiscordSetupNotice('Pop-up blocked! Please allow pop-ups for this site to log in with Discord.');
      }
      setLoadingProvider(null);
      return;
    }

    // 2. Otherwise try requesting Discord auth URL from backend API (/api/auth/discord/url)
    try {
      const res = await fetch(`/api/auth/discord/url?redirect_uri=${encodeURIComponent(clientRedirectUri)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          const authPopup = window.open(
            data.url,
            'discord_oauth',
            'width=580,height=720,menubar=no,toolbar=no'
          );
          if (!authPopup) {
            setDiscordSetupNotice('Pop-up blocked! Please allow pop-ups for this site to log in with Discord.');
          }
          setLoadingProvider(null);
          return;
        }
      }
    } catch (e) {
      // Continue to Firebase Auth
    }

    // 3. Fall back to Firebase Auth provider
    try {
      const cred = await signInWithDiscord();
      if (cred?.user) {
        await ensureUserProfile(cred.user);
      }
      localStorage.setItem('secret_area_unlocked', 'true');
      localStorage.removeItem('nexa_guest_mode');
      window.dispatchEvent(new Event('authChange'));
      onClose();
      navigate('/profile');
    } catch (err: any) {
      const isUnauthorized = 
        err?.code === 'auth/unauthorized-domain' || 
        String(err?.message || '').includes('unauthorized-domain');
      if (isUnauthorized) {
        setAuthDomainError(window.location.hostname);
      } else if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        const isNotConfigured = 
          err?.code === 'auth/configuration-not-found' || 
          err?.code === 'auth/operation-not-allowed' || 
          err?.code === 'auth/invalid-provider-id' ||
          String(err?.message || '').includes('configuration-not-found');

        if (isNotConfigured) {
          setDiscordSetupNotice('Discord OAuth provider is not yet enabled in your Firebase Console (secretarea-1337) or DISCORD_CLIENT_ID is missing.');
        } else {
          setDiscordSetupNotice(err?.message || 'Failed to authenticate with Discord.');
        }
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleGithubLogin = async () => {
    setLoadingProvider('github');
    setAuthDomainError(null);
    setDiscordSetupNotice(null);
    setGithubSetupNotice(null);

    try {
      const cred = await signInWithGithub();
      if (cred?.user) {
        await ensureUserProfile(cred.user);
      }
      localStorage.setItem('secret_area_unlocked', 'true');
      localStorage.removeItem('nexa_guest_mode');
      window.dispatchEvent(new Event('authChange'));
      onClose();
      navigate('/profile');
    } catch (err: any) {
      const isUnauthorized = 
        err?.code === 'auth/unauthorized-domain' || 
        String(err?.message || '').includes('unauthorized-domain');
      if (isUnauthorized) {
        setAuthDomainError(window.location.hostname);
      } else if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        const isNotConfigured = 
          err?.code === 'auth/configuration-not-found' || 
          err?.code === 'auth/operation-not-allowed' || 
          err?.code === 'auth/invalid-provider-id' ||
          String(err?.message || '').includes('configuration-not-found');

        if (isNotConfigured) {
          setGithubSetupNotice('GitHub provider is not yet enabled in your Firebase Console (secretarea-1337). Enable GitHub in Firebase Console -> Authentication -> Sign-in method.');
        } else {
          setGithubSetupNotice(err?.message || 'Failed to authenticate with GitHub.');
        }
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
        onClick={onClose}
        dir={dir}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 end-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Icon name="X" size={18} />
          </button>

          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Icon name="Wolf" size={32} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('Sign in to SecretArea')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {t('Login with Google / Gmail, Discord, or GitHub to access your profile and settings.')}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Google / Gmail button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loadingProvider !== null}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 text-sm"
            >
              {loadingProvider === 'google' ? (
                <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              )}
              <span>{t('Sign in with Google / Gmail')}</span>
            </button>

            {/* Discord button */}
            <button
              onClick={handleDiscordLogin}
              disabled={loadingProvider !== null}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl transition-all shadow-md shadow-[#5865F2]/25 active:scale-[0.98] disabled:opacity-60 text-sm"
            >
              {loadingProvider === 'discord' ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Icon name="Discord" size={20} />
              )}
              <span>{t('Login with Discord')}</span>
            </button>

            {/* GitHub button */}
            <button
              onClick={handleGithubLogin}
              disabled={loadingProvider !== null}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-[#24292F] hover:bg-[#1b1f24] text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold rounded-xl transition-all shadow-md shadow-black/20 active:scale-[0.98] disabled:opacity-60 text-sm border border-slate-700/50"
            >
              {loadingProvider === 'github' ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Icon name="Github" size={20} />
              )}
              <span>{t('Sign in with GitHub')}</span>
            </button>
          </div>

          {authDomainError && (
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1.5 text-start">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Icon name="AlertTriangle" size={14} />
                <span>Firebase Authorized Domain Required</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Add domain in Firebase Console:
              </p>
              <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/10 font-mono text-[11px] select-all text-white overflow-x-auto">
                <span className="flex-1 truncate">{authDomainError}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(authDomainError);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded text-[10px] transition-colors whitespace-nowrap"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {discordSetupNotice && (
            <div className="mt-4 p-3.5 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/30 text-slate-200 text-xs space-y-2.5 text-start">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-[#7289DA] dark:text-[#99AAB5]">
                  <Icon name="Discord" size={16} />
                  <span>Discord OAuth Configuration</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDiscordSetupNotice(null)}
                  className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Instant Discord Sign-In Option */}
              <div className="p-2.5 rounded-xl bg-[#5865F2]/15 border border-[#5865F2]/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white">⚡ Instant Discord Sign-In</span>
                  <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Ready Now</span>
                </div>
                <p className="text-[10px] text-slate-300">Enter immediately with any Discord username:</p>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Discord username"
                    value={instantDiscordName}
                    onChange={(e) => setInstantDiscordName(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2]"
                  />
                  <button
                    type="button"
                    onClick={() => handleInstantDiscordLogin()}
                    className="px-2.5 py-1 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                  >
                    Instant Login
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 border-t border-white/10">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">
                  Redirect Callback URL:
                </span>
                
                {/* Current environment domain */}
                <div className="flex items-center gap-2 bg-black/50 p-2 rounded-xl border border-white/10 font-mono text-[10px] text-white">
                  <span className="flex-1 truncate">
                    {typeof window !== 'undefined' ? `${window.location.origin}/auth/discord/callback` : 'https://secretarea.vercel.app/auth/discord/callback'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const uri = typeof window !== 'undefined' ? `${window.location.origin}/auth/discord/callback` : 'https://secretarea.vercel.app/auth/discord/callback';
                      navigator.clipboard.writeText(uri);
                      setCopiedDiscord(true);
                      setTimeout(() => setCopiedDiscord(false), 2000);
                    }}
                    className="px-2 py-0.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded text-[10px] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {copiedDiscord ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px]">
                <a
                  href="https://discord.com/developers/applications"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#5865F2] hover:underline flex items-center gap-1"
                >
                  <span>Open Discord Developer Portal ↗</span>
                </a>
              </div>
            </div>
          )}

          {githubSetupNotice && (
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700 text-slate-200 text-xs space-y-2 text-start">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Icon name="Github" size={16} />
                <span>GitHub Authentication Setup</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {githubSetupNotice}
              </p>
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
                  Firebase OAuth Callback URL (for GitHub OAuth App):
                </span>
                <div className="flex items-center gap-2 bg-black/50 p-2 rounded-xl border border-white/10 font-mono text-[10px] text-white">
                  <span className="flex-1 truncate">https://secretarea-1337.firebaseapp.com/__/auth/handler</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('https://secretarea-1337.firebaseapp.com/__/auth/handler');
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded text-[10px] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <a
                  href="https://console.firebase.google.com/project/secretarea-1337/authentication/providers"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-bold text-[#29aaea] hover:underline flex items-center gap-1"
                >
                  <span>Firebase Providers ↗</span>
                </a>
                <span className="text-slate-600">•</span>
                <a
                  href="https://github.com/settings/developers"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-bold text-slate-300 hover:underline flex items-center gap-1"
                >
                  <span>GitHub OAuth Apps ↗</span>
                </a>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <button 
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold transition-colors"
            >
              {t('Cancel')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

const UserDropdown = ({ 
  handleLogout, 
  t, 
  user, 
  profileData,
  dir 
}: { 
  handleLogout: () => void; 
  t: any; 
  user: any; 
  profileData: UserProfileData | null;
  dir: string; 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarSrc = profileData?.photoURL || user?.photoURL;
  const displayName = profileData?.displayName || user?.displayName || 'SecretArea Gamer';
  const username = profileData?.username || user?.email?.split('@')[0] || 'gamer';
  const initial = (displayName || username || 'W')[0].toUpperCase();

  return (
    <div className="relative" ref={dropdownRef} dir={dir}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center font-bold text-sm sm:text-base overflow-hidden border-2 border-slate-200 dark:border-slate-700/80 hover:border-[#29aaea] dark:hover:border-[#29aaea] transition-all ml-1 sm:ml-2 shadow-sm relative group bg-gradient-to-tr from-blue-600 to-cyan-500 shrink-0"
        title={displayName}
      >
        {avatarSrc ? (
          <img 
            src={avatarSrc} 
            alt={displayName} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <span>{initial}</span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full end-0 mt-3 w-64 bg-white dark:bg-[#111623] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden z-50 text-slate-700 dark:text-[#94a3b8] font-medium text-[14px]`}
          >
            {/* User Mini Card in Dropdown */}
            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#29aaea] flex items-center justify-center text-white font-bold text-base shrink-0 border border-white/20 shadow-sm">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
                <p className="text-xs text-[#29aaea] truncate font-medium">@{username}</p>
              </div>
            </div>

            <div className="py-2">
              <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center justify-between px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors text-start">
                <span>{t('My profile') || 'My profile'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 font-semibold uppercase">Profile</span>
              </Link>
              <div className="h-px bg-slate-100 dark:bg-slate-800/80 my-1 mx-3" />
              <Link to="/roadmap" onClick={() => setIsOpen(false)} className="block px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors text-start">{t('Roadmap') || 'Roadmap'}</Link>
              <Link to="/personal-space" onClick={() => setIsOpen(false)} className="block px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors text-start">{t('Personal Space') || 'Personal Space'}</Link>
              <div className="h-px bg-slate-100 dark:bg-slate-800/80 my-1 mx-3" />
              <Link to="/settings" onClick={() => setIsOpen(false)} className="block px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors text-start">{t('Settings') || 'Settings'}</Link>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-start px-5 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">{t('Logout') || 'Logout'}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GuestDropdown = ({
  handleReturnToTerminal,
  setShowLoginModal,
  t,
  dir
}: {
  handleReturnToTerminal: () => void;
  setShowLoginModal: (show: boolean) => void;
  t: any;
  dir: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef} dir={dir}>
      {/* Responsive Guest Mode Trigger Button: compact icon+pulse on mobile, badge on laptop */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-amber-500/30 dark:border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-xs transition-all shadow-xs active:scale-95 shrink-0 select-none cursor-pointer"
        title={t('Guest mode')}
        aria-label={t('Guest mode')}
        aria-expanded={isOpen}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <Icon name="Ghost" size={14} className="sm:hidden text-amber-500 shrink-0" />
        <span className="hidden sm:inline font-bold whitespace-nowrap">
          {t('Guest mode')}
        </span>
        <Icon 
          name="ChevronDown" 
          size={12} 
          className={`text-slate-400 dark:text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full end-0 mt-2.5 w-72 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-[#111623] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/70 p-3.5 z-50 text-slate-700 dark:text-[#94a3b8]"
          >
            {/* 1. Guest Mode Badge & Notice */}
            <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 mb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                  <span className="whitespace-nowrap">{t('Guest mode')}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold uppercase tracking-wider">
                  Visitor
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                {t('You are in Guest Mode. Login to save your profile.')}
              </p>
            </div>

            {/* 2. Login & Terminal Buttons inside drop menu */}
            <div className="space-y-2">
              {/* Login Button */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowLoginModal(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer"
                title={t('Login')}
              >
                <div className="flex items-center gap-2">
                  <Icon name="LogIn" size={16} className="shrink-0" />
                  <span>{t('Login')}</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-semibold tracking-wide uppercase">
                  Google / Discord
                </span>
              </button>

              {/* Terminal Button */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  handleReturnToTerminal();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors border border-slate-200 dark:border-slate-700/60 shadow-xs active:scale-[0.98] cursor-pointer"
                title={t('Come back to terminal page')}
              >
                <div className="flex items-center gap-2">
                  <Icon name="Terminal" size={16} className="text-emerald-500 shrink-0" />
                  <span>{t('Terminal')}</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[120px]">
                  {t('Come back to terminal page')}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Header: React.FC = () => {
  const { t, dir } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const checkUnlocked = () =>
    localStorage.getItem('secret_area_unlocked') === 'true' ||
    localStorage.getItem('secret_area_unlocked') === 'guest' ||
    localStorage.getItem('nexa_guest_mode') === 'true';

  const checkGuest = () =>
    localStorage.getItem('nexa_guest_mode') === 'true' ||
    localStorage.getItem('secret_area_unlocked') === 'guest';

  const [isUnlocked, setIsUnlocked] = React.useState(checkUnlocked);
  const [isGuest, setIsGuest] = useState(checkGuest);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  React.useEffect(() => {
    const handleStorage = () => {
      setIsUnlocked(checkUnlocked());
      setIsGuest(checkGuest());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('authChange', handleStorage);

    let unsubDoc: (() => void) | null = null;

    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }
      setCurrentUser(user);
      if (user) {
        setIsUnlocked(true);
        setIsGuest(false);
        localStorage.setItem('secret_area_unlocked', 'true');
        const local = getLocalProfile(user.uid);
        if (local) setProfileData(local);

        unsubDoc = subscribeUserProfile(user.uid, (data) => {
          setProfileData(data);
        }, user);
      } else {
        const guestActive = checkGuest();
        setIsGuest(guestActive);
        if (guestActive) {
          const guestStr = localStorage.getItem('nexa_guest_profile');
          if (guestStr) {
            try { setProfileData(JSON.parse(guestStr)); } catch (e) {}
          }
        } else {
          setProfileData(null);
        }
      }
    });

    const handleSync = (e: any) => {
      if (e.detail?.profile) {
        setProfileData(e.detail.profile);
      }
    };
    window.addEventListener('secretarea_profile_sync', handleSync);

    const handleOpenLogin = () => {
      setShowLoginModal(true);
    };
    window.addEventListener('open-login-modal', handleOpenLogin);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('authChange', handleStorage);
      window.removeEventListener('secretarea_profile_sync', handleSync);
      window.removeEventListener('open-login-modal', handleOpenLogin);
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }
      unsubAuth();
    };
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('secret_area_unlocked');
    localStorage.removeItem('nexa_guest_mode');
    try {
      if (auth && typeof auth.signOut === 'function') {
        await auth.signOut();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setIsUnlocked(false);
    setIsGuest(false);
    setCurrentUser(null);
    setProfileData(null);
    window.dispatchEvent(new Event('authChange'));
    navigate('/', { replace: true });
  };

  const handleReturnToTerminal = () => {
    localStorage.removeItem('secret_area_unlocked');
    localStorage.removeItem('nexa_guest_mode');
    setIsGuest(false);
    setIsUnlocked(false);
    window.dispatchEvent(new Event('authChange'));
    window.dispatchEvent(new CustomEvent('return-to-terminal'));
    navigate('/');
  };

  return (
    <header dir={dir} className="fixed top-0 w-full z-50 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-3 group shrink-0">
            <div className="relative text-slate-900 dark:text-white shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14">
              <div className="relative z-10 flex items-center justify-center w-full h-full">
                 <Icon name="Wolf" className="w-full h-full" />
              </div>
            </div>
            <div className="flex flex-col items-start justify-center min-w-0 overflow-hidden">
              <div className="flex items-center justify-start mb-0.5 sm:mb-1 gap-1">
                  <span className="font-mono font-black text-xs sm:text-sm md:text-lg tracking-tight sm:tracking-widest text-slate-900 dark:text-white leading-none truncate">
                  {t('SecretArea')}
                 </span>
                 <Icon name="CheckCircle" size={14} className="text-blue-500 shrink-0" />
              </div>
              <span className="text-[6px] sm:text-[10px] font-bold text-primary-500 uppercase tracking-tight sm:tracking-[0.3em] leading-none animate-pulse whitespace-nowrap">
                {t('Internet For Everyone')}
              </span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
            <ScrollToLibraryButton />
            <Flags />
            <DiscoverGameButton />
            <LanguageSwitcher />
            <ThemeToggle />
            <NotificationBell />

            {/* User Dropdown (when logged in), Guest Dropdown (when in guest mode), or Login button */}
            {currentUser ? (
              <UserDropdown 
                handleLogout={handleLogout} 
                t={t} 
                user={currentUser} 
                profileData={profileData} 
                dir={dir} 
              />
            ) : isGuest ? (
              <GuestDropdown
                handleReturnToTerminal={handleReturnToTerminal}
                setShowLoginModal={setShowLoginModal}
                t={t}
                dir={dir}
              />
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all whitespace-nowrap active:scale-95 shrink-0 cursor-pointer"
                title={t('Login')}
                aria-label={t('Login')}
              >
                <Icon name="LogIn" size={14} className="shrink-0" />
                <span className="hidden sm:inline">{t('Login')}</span>
              </button>
            )}

            <LoginModal 
              isOpen={showLoginModal} 
              onClose={() => setShowLoginModal(false)} 
              t={t} 
              dir={dir} 
            />
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;