import { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { FloatingConcierge } from './components/layout/FloatingConcierge';
import { WelcomeSplash } from './components/modules/WelcomeSplash';
import { LoadingScreen } from './components/modules/LoadingScreen';
import { analyticsService } from './services/analyticsService';

// Lazy-loaded pages for optimal bundle code-splitting
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const FlotaPage = lazy(() => import('./pages/FlotaPage').then((m) => ({ default: m.FlotaPage })));
const LodgePage = lazy(() => import('./pages/LodgePage').then((m) => ({ default: m.LodgePage })));
const ExpedicionesPage = lazy(() => import('./pages/ExpedicionesPage').then((m) => ({ default: m.ExpedicionesPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const VegvisirDetailPage = lazy(() => import('./pages/VegvisirDetailPage').then((m) => ({ default: m.VegvisirDetailPage })));
const TerranovaDetailPage = lazy(() => import('./pages/TerranovaDetailPage').then((m) => ({ default: m.TerranovaDetailPage })));

const PageLoaderFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
    <div className="relative w-16 h-16 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-900/30 animate-spin" style={{ animationDuration: '14s' }} />
      <img src="/vegvisir-emblem-dark.png" alt="Cargando" className="w-9 h-9 object-contain opacity-75 animate-pulse" />
    </div>
  </div>
);

export function App() {
  const [appLoading, setAppLoading] = useState<boolean>(true);
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>('/welcome');
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Synchronize path with URL hash for MPA experience and track analytics
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/welcome';
      if (hash === '/welcome' || hash === '/intro') {
        setShowSplash(true);
      } else {
        setShowSplash(false);
      }
      setCurrentPath(hash);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Track public page visits
      if (hash !== '/welcome' && hash !== '/intro' && hash !== '/admin') {
        analyticsService.trackPageView(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    if (path === '/welcome' || path === '/intro') {
      setShowSplash(true);
    } else {
      setShowSplash(false);
    }
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnterSite = (targetPath: string = '/') => {
    setShowSplash(false);
    navigate(targetPath);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Loading Screen on top of everything */}
      {appLoading && (
        <LoadingScreen 
          onComplete={() => setAppLoading(false)} 
          isReady={!showSplash || isVideoReady}
          isVideoReady={isVideoReady} 
          minDuration={400} 
        />
      )}

      {/* 100vh Fullscreen Cinematic Video Splash Screen */}
      {showSplash && (
        <WelcomeSplash 
          onEnterSite={handleEnterSite} 
          onVideoLoaded={() => setIsVideoReady(true)}
        />
      )}

      {/* Main Website Experience (shown when splash is closed) */}
      {!showSplash && (
        <>
          {/* Main Header Navigation (hidden in Admin) */}
          {currentPath !== '/admin' && <Header currentPath={currentPath} onNavigate={navigate} />}

          {/* Multi-Page View Container */}
          <main className="flex-1">
            <Suspense fallback={<PageLoaderFallback />}>
              {currentPath === '/' && <HomePage onNavigate={navigate} />}
              {currentPath === '/flota' && <FlotaPage onNavigate={navigate} />}
              {currentPath === '/lodge' && <LodgePage onNavigate={navigate} />}
              {currentPath === '/expediciones' && <ExpedicionesPage onNavigate={navigate} />}
              {currentPath === '/admin' && <AdminPage onNavigate={navigate} />}
              {currentPath === '/velero-vegvisir' && <VegvisirDetailPage onNavigate={navigate} />}
              {currentPath === '/yate-terranova' && <TerranovaDetailPage onNavigate={navigate} />}
            </Suspense>
          </main>

          {/* Footer (hidden in Admin) */}
          {currentPath !== '/admin' && <Footer onNavigate={navigate} />}

          {/* Persistent Concierge WhatsApp Button (hidden in Admin) */}
          {currentPath !== '/admin' && <FloatingConcierge />}
        </>
      )}

    </div>
  );
}

export default App;
