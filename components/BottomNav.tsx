import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../src/contexts/LanguageContext';
import Icon from './Icon';
import { auth } from '../src/firebase';
import { AnimatePresence, motion } from 'framer-motion';

const BottomNav: React.FC = () => {
  const { t, dir } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const checkGuest = () =>
    localStorage.getItem('nexa_guest_mode') === 'true' ||
    localStorage.getItem('secret_area_unlocked') === 'guest';

  const [isGuest, setIsGuest] = useState(checkGuest);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const handleAuth = () => {
      setIsGuest(checkGuest());
    };
    window.addEventListener('storage', handleAuth);
    window.addEventListener('authChange', handleAuth);

    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        setIsGuest(false);
      } else {
        setIsGuest(checkGuest());
      }
    });

    return () => {
      window.removeEventListener('storage', handleAuth);
      window.removeEventListener('authChange', handleAuth);
      unsub();
    };
  }, []);

  // Close menu on outside click or navigation
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleReturnToTerminal = () => {
    setIsMenuOpen(false);
    localStorage.removeItem('secret_area_unlocked');
    localStorage.removeItem('nexa_guest_mode');
    window.dispatchEvent(new Event('authChange'));
    window.dispatchEvent(new CustomEvent('return-to-terminal'));
    navigate('/');
  };

  const handleOpenLogin = () => {
    setIsMenuOpen(false);
    window.dispatchEvent(new CustomEvent('open-login-modal'));
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    localStorage.removeItem('secret_area_unlocked');
    localStorage.removeItem('nexa_guest_mode');
    try {
      if (auth && typeof auth.signOut === 'function') {
        await auth.signOut();
      }
    } catch (e) {
      console.error(e);
    }
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const handleScrollToLibrary = () => {
    setIsMenuOpen(false);
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
    }, 300);
  };

  return (
    <nav 
      aria-label="Mobile Bottom Navigation" 
      dir={dir} 
      className="md:hidden fixed bottom-0 start-0 end-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 pb-safe shadow-lg transition-colors duration-300"
    >
      {/* Dropdown Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full end-3 mb-2 w-72 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 overflow-hidden"
          >
            {/* Header / Guest Mode Info */}
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {t('Account & Terminal')}
              </span>
              {isGuest && !currentUser && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  {t('Guest mode')}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              {/* Login Button (if not logged in with real account) */}
              {!currentUser ? (
                <button
                  onClick={handleOpenLogin}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-98 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Icon name="LogIn" size={16} />
                    <span>{t('Login')}</span>
                  </span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md uppercase font-semibold tracking-wider">
                    Gmail / Discord
                  </span>
                </button>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {currentUser.displayName || currentUser.email || 'User'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  >
                    {t('Logout')}
                  </button>
                </div>
              )}

              {/* SecretArea Library Button */}
              <button
                onClick={handleScrollToLibrary}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/15 dark:bg-blue-500/15 dark:hover:bg-blue-500/20 text-slate-800 dark:text-slate-200 border border-blue-500/20 transition-all text-start active:scale-98 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Icon name="Gamepad2" size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex flex-col text-start">
                  <span className="font-bold text-blue-600 dark:text-blue-400">{t('SecretArea Library')}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {t('PC Games, Tools & Saves')}
                  </span>
                </div>
              </button>

              {/* Terminal Button */}
              <button
                onClick={handleReturnToTerminal}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 transition-colors text-start"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <Icon name="Terminal" size={14} className="text-slate-700 dark:text-slate-300" />
                </div>
                <div className="flex flex-col text-start">
                  <span className="font-bold">{t('Terminal')}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {t('Come back to terminal page')}
                  </span>
                </div>
              </button>

              {/* Quick links to Profile & Settings (Only for logged-in users) */}
              {currentUser && (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Icon name="User" size={15} />
                    <span>{t('My profile')}</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Icon name="Settings" size={15} />
                    <span>{t('Settings')}</span>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation Bar */}
      <div className="flex justify-around items-center h-16 relative max-w-md mx-auto px-1">
        {/* Home */}
        <Link 
          to="/"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors group active:scale-95 ${
            location.pathname === '/' 
              ? 'text-blue-600 dark:text-blue-400 font-bold' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Icon name="Home" size={20} className={location.pathname === '/' ? 'scale-110' : ''} />
          <span className="text-[10px] mt-1 font-medium truncate max-w-[65px]">{t('Home')}</span>
        </Link>

        {/* Personal Space */}
        <Link 
          to="/personal-space"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors group active:scale-95 ${
            location.pathname === '/personal-space' 
              ? 'text-blue-600 dark:text-blue-400 font-bold' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Icon name="Activity" size={20} className={location.pathname === '/personal-space' ? 'scale-110' : ''} />
          <span className="text-[10px] mt-1 font-medium truncate max-w-[65px]">{t('Personal')}</span>
        </Link>

        {/* Center SecretArea */}
        <Link
          to="/"
          className="flex flex-col items-center justify-center w-full h-full transition-all group active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <Icon name="Wolf" size={20} />
          </div>
          <span className="text-[10px] mt-1 font-bold text-slate-800 dark:text-slate-200 truncate max-w-[65px]">
            {t('SecretArea')}
          </span>
        </Link>

        {/* Roadmap */}
        <Link 
          to="/roadmap"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors group active:scale-95 ${
            location.pathname === '/roadmap' 
              ? 'text-blue-600 dark:text-blue-400 font-bold' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Icon name="Rocket" size={20} className={location.pathname === '/roadmap' ? 'scale-110' : ''} />
          <span className="text-[10px] mt-1 font-medium truncate max-w-[65px]">{t('Roadmap')}</span>
        </Link>

        {/* Menu Dropdown Trigger (with guest indicator if in guest mode) */}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={`relative flex flex-col items-center justify-center w-full h-full transition-colors group active:scale-95 ${
            isMenuOpen
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          aria-label={t('Menu')}
          aria-expanded={isMenuOpen}
        >
          <div className="relative">
            <Icon name={isMenuOpen ? "ChevronDown" : "Menu"} size={20} />
            {isGuest && !currentUser && (
              <span className="absolute -top-1 -end-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium truncate max-w-[65px]">
            {isGuest && !currentUser ? t('Guest mode') : t('Menu')}
          </span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
