
import React, { useEffect, useRef, Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import LatestIntelPanel from './components/LatestIntelPanel';

import SecretArea from './pages/SecretArea';

const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const BlogListPage = lazy(() => import('./pages/BlogListPage'));
const BlogArticlePage = lazy(() => import('./pages/BlogArticlePage'));

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

// Logic to handle initial redirect and scrolling
const AppBehavior = () => {
  const { pathname } = useLocation();
  const prevPathnameRef = useRef(pathname);

  // Scroll to top on page-level route changes, preserving scroll when opening/closing game modals
  useEffect(() => {
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    const isIntraDashboardSwitch =
      prev !== pathname &&
      isGameSectionRoute(prev) &&
      isGameSectionRoute(pathname) &&
      prev !== '/terminal' &&
      pathname !== '/terminal';

    if (!isIntraDashboardSwitch) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

// Protected routes logic
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  let isUnlocked =
    localStorage.getItem('secret_area_unlocked') === 'true' ||
    localStorage.getItem('secret_area_unlocked') === 'guest' ||
    localStorage.getItem('secretarea_guest_mode') === 'true';
  if (!isUnlocked) {
    localStorage.setItem('secret_area_unlocked', 'guest');
    localStorage.setItem('secretarea_guest_mode', 'true');
    isUnlocked = true;
  }
  return <>{children}</>;
};

const CATEGORY_SEO: Record<string, { label: string; title: string; description: string; keywords: string }> = {
  '/game': {
    label: 'PC Games',
    title: 'PC Games & Repacks Catalog | Secret Area',
    description: 'Browse verified PC games, compressed repacks, system requirements, and direct download mirrors on Secret Area. Updated daily with new releases.',
    keywords: 'PC Games, Free PC Games, Game Repacks, FitGirl, DODI, SteamRIP, Direct Download Games, Secret Area',
  },
  '/ps5': {
    label: 'PS5 Games',
    title: 'PS5 Games – Direct Links & Firmware | Secret Area',
    description: 'Explore curated PlayStation 5 game releases, firmware compatibility notes, and verified direct download links curated on Secret Area.',
    keywords: 'PS5 Games, PlayStation 5 Games, PS5 Backups, PS5 Firmware, Secret Area',
  },
  '/hypervisor': {
    label: 'Game Hypervisor',
    title: 'Game Hypervisor – Bypass Tools & Guides | Secret Area',
    description: 'Discover Game Hypervisor releases, virtualization runtimes, kernel tools, and step-by-step setup guides curated on Secret Area.',
    keywords: 'Hypervisor Games, Game Hypervisor, Virtualization Gaming, Secret Area',
  },
  '/steamtools': {
    label: 'SteamTools',
    title: 'SteamTools – Manifests & Guides | Secret Area',
    description: 'Access SteamTools manifests, library utilities, and configuration guides with fast mirrors and clear installation steps on Secret Area.',
    keywords: 'SteamTools, Steam Manifests, Steam Library Tools, Secret Area',
  },
  '/tools': {
    label: 'Tools & Software',
    title: 'Software & Developer Tools | Secret Area',
    description: 'Download essential architecture, design, editing, and system utility software packages with verified specs curated on Secret Area.',
    keywords: 'Software Tools, Developer Utilities, Architect Software, PC Tools, Secret Area',
  },
  '/savegame': {
    label: 'SaveGame Archives',
    title: 'SaveGame Archives – 100% Saves | Secret Area',
    description: 'Download verified PC save game archives, 100% completion files, and backup utilities for top single-player titles on Secret Area.',
    keywords: 'SaveGame, 100% Save Games, Game Saves, PC Save Files, Secret Area',
  },
};

function formatSlugTitleFallback(rawSlug: string): string {
  try {
    return decodeURIComponent(rawSlug)
      .split('-')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  } catch {
    return rawSlug.replace(/-/g, ' ');
  }
}

const SeoHead = () => {
  const { pathname } = useLocation();
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin.replace(/\/+$/, '')
      : 'https://secretarea.site';

  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  if (normalizedPath === '/blog' || normalizedPath.startsWith('/blog/')) {
    return null;
  }
  const canonicalUrl = `${origin}${normalizedPath === '/' ? '/' : normalizedPath}`;
  const isPrivateRoute = ['/profile', '/admin', '/settings', '/terminal', '/disclaimer'].some((p) =>
    normalizedPath.startsWith(p)
  );

  const hubKey =
    normalizedPath === '/architect'
      ? '/tools'
      : normalizedPath === '/extra'
      ? '/savegame'
      : normalizedPath;
  const hubSeo = CATEGORY_SEO[hubKey];

  const itemMatch = normalizedPath.match(
    /^\/(game|ps5|hypervisor|steamtools|tools|architect|savegame|extra)\/([^/]+)$/
  );
  const itemHubKey = itemMatch
    ? itemMatch[1] === 'architect'
      ? '/tools'
      : itemMatch[1] === 'extra'
      ? '/savegame'
      : `/${itemMatch[1]}`
    : '';
  const itemHubMeta = itemHubKey ? CATEGORY_SEO[itemHubKey] : undefined;
  const fallbackItemName = itemMatch ? formatSlugTitleFallback(itemMatch[2]) : '';

  const title = hubSeo
    ? hubSeo.title
    : fallbackItemName && itemHubMeta
    ? `${fallbackItemName} – ${itemHubMeta.label} | Secret Area`
    : 'Secret Area – Free PC Games, PS5, Repacks & Hypervisor Hub';
  const description = hubSeo
    ? hubSeo.description
    : fallbackItemName && itemHubMeta
    ? `View ${fallbackItemName} (${itemHubMeta.label}) details, verified mirrors, version info, and system requirements on Secret Area.`
    : 'Explore Secret Area for verified PC game repacks, PS5 releases, Hypervisor tools, SteamTools, software utilities, and gaming guides with system specs.';
  const keywords = hubSeo
    ? hubSeo.keywords
    : fallbackItemName && itemHubMeta
    ? `${fallbackItemName}, ${itemHubMeta.label}, ${itemHubMeta.keywords}`
    : 'Secret Area, SecretArea, PC Games, Game Repacks, PS5 Games, Hypervisor, SteamTools, Save Games, Gaming Guides, Software Tools';
  const ogImage = `${origin}/images/hero01.png`;
  const robotsContent = isPrivateRoute
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${origin}/#organization`,
        name: 'SecretArea',
        alternateName: 'Secret Area',
        url: `${origin}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${origin}/images/logo04.png`,
        },
        sameAs: ['https://discord.gg/pygmDWFAHK'],
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        name: 'Secret Area',
        alternateName: 'SecretArea',
        url: `${origin}/`,
        description,
        inLanguage: ['en', 'fr', 'es', 'ar'],
        publisher: {
          '@id': `${origin}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${origin}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      ...(hubSeo
        ? [
            {
              '@type': 'CollectionPage',
              name: title,
              url: canonicalUrl,
              description,
              isPartOf: { '@id': `${origin}/#website` },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
                { '@type': 'ListItem', position: 2, name: hubSeo.label, item: canonicalUrl },
              ],
            },
          ]
        : []),
    ],
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="SecretArea" />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:site_name" content="Secret Area" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content="Secret Area – Digital Gaming Catalog, Guides & Hypervisor Hub" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="fr_FR" />
      <meta property="og:locale:alternate" content="es_ES" />
      <meta property="og:locale:alternate" content="ar_MA" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="Secret Area – Digital Gaming Catalog, Guides & Hypervisor Hub" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
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
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogArticlePage />} />
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
        <SeoHead />
        <Header />
        
        <MainContent />

        <BottomNav />
        <LatestIntelPanel />
      </div>
    </Router>
  );
};

export default App;