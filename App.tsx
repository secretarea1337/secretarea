
import React, { useEffect, Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import LatestIntelPanel from './components/LatestIntelPanel';

import SecretArea from './pages/SecretArea';

const Roadmap = lazy(() => import('./pages/Roadmap'));
const CategoryDetail = lazy(() => import('./pages/CategoryDetail'));
const PersonalFinance = lazy(() => import('./pages/PersonalFinance'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

// Logic to handle initial redirect and scrolling
const AppBehavior = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Protected routes logic
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  let isUnlocked =
    localStorage.getItem('secret_area_unlocked') === 'true' ||
    localStorage.getItem('secret_area_unlocked') === 'guest' ||
    localStorage.getItem('nexa_guest_mode') === 'true';
  if (!isUnlocked) {
    localStorage.setItem('secret_area_unlocked', 'guest');
    localStorage.setItem('nexa_guest_mode', 'true');
    isUnlocked = true;
  }
  return <>{children}</>;
};

const isGameSectionRoute = (pathname: string): boolean => {
  return (
    pathname === '/' ||
    pathname === '/terminal' ||
    pathname.startsWith('/game/') ||
    pathname === '/game' ||
    pathname.startsWith('/hypervisor/') ||
    pathname === '/hypervisor' ||
    pathname.startsWith('/steamtools/') ||
    pathname === '/steamtools' ||
    pathname.startsWith('/ps5/') ||
    pathname === '/ps5' ||
    pathname.startsWith('/tools/') ||
    pathname === '/tools' ||
    pathname.startsWith('/architect/') ||
    pathname === '/architect' ||
    pathname.startsWith('/savegame/') ||
    pathname === '/savegame' ||
    pathname.startsWith('/extra/') ||
    pathname === '/extra'
  );
};

const MainContent = () => {
  const location = useLocation();
  const isDashboard = isGameSectionRoute(location.pathname);
  const isTerminal = location.pathname === '/terminal';

  return (
    <main className="flex-grow">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"><div className="animate-pulse flex flex-col items-center"><div className="w-12 h-12 border-4 border-slate-300 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div><div className="mt-4 text-slate-500 font-mono text-sm tracking-widest uppercase">Loading Core...</div></div></div>}>
        <div style={{ display: (isDashboard || isTerminal) ? 'block' : 'none' }}>
          <SecretArea isTerminalRoute={isTerminal} />
        </div>
        <Routes>
          <Route path="/" element={<div />} />
          <Route path="/terminal" element={<div />} />
          <Route path="/game/*" element={<div />} />
          <Route path="/hypervisor/*" element={<div />} />
          <Route path="/steamtools/*" element={<div />} />
          <Route path="/ps5/*" element={<div />} />
          <Route path="/tools/*" element={<div />} />
          <Route path="/architect/*" element={<div />} />
          <Route path="/savegame/*" element={<div />} />
          <Route path="/extra/*" element={<div />} />
          <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
          <Route path="/roadmap/:id" element={<ProtectedRoute><CategoryDetail /></ProtectedRoute>} />
          <Route path="/personal-space" element={<ProtectedRoute><PersonalFinance /></ProtectedRoute>} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Profile defaultTab="Reports & Fixes" />} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Footer />
    </main>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
      ) {
        e.preventDefault();
      }
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return (
    <Router>
      <AppBehavior />
      <div className="min-h-screen flex flex-col font-sans select-none">
        
        
        <Helmet>
          <title>Secret Area – Digital Gaming Catalog & Hypervisor Ecosystem</title>
          <meta name="description" content="Discover premium tools, gaming resources, digital assets, and an exclusive hypervisor ecosystem crafted by SecretArea." />
          <meta name="keywords" content="games Repack, Secret Area, Premium Tools, Hypervisor, PS5 Games, SteamTools, Gaming Resources" />
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta property="og:title" content="Secret Area – Digital Gaming Catalog & Hypervisor Ecosystem" />
          <meta property="og:description" content="Discover premium tools, gaming resources, digital assets, and an exclusive hypervisor ecosystem crafted by SecretArea." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://nexa1337.com/" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Secret Area – Digital Gaming Catalog & Hypervisor Ecosystem" />
          <meta name="twitter:description" content="Discover premium tools, gaming resources, digital assets, and an exclusive hypervisor ecosystem crafted by SecretArea." />
          <link rel="canonical" href="https://nexa1337.com/" />
          <script type="application/ld+json">
            {`{"@context":"https://schema.org","@type":"WebSite","name":"Secret Area","url":"https://nexa1337.com/","description":"Discover premium tools, gaming resources, digital assets, and an exclusive hypervisor ecosystem crafted by SecretArea.","potentialAction":{"@type":"SearchAction","target":"https://nexa1337.com/?q={search_term_string}","query-input":"required name=search_term_string"}}`}
          </script>
        </Helmet>
        <Header />
        
        <MainContent />

        <BottomNav />
        <LatestIntelPanel />
      </div>
    </Router>
  );
};

export default App;