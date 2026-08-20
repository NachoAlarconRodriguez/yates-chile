import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { FloatingConcierge } from './components/layout/FloatingConcierge';
import { WelcomeSplash } from './components/modules/WelcomeSplash';
import { LoadingScreen } from './components/modules/LoadingScreen';

import { HomePage } from './pages/HomePage';
import { FlotaPage } from './pages/FlotaPage';
import { LodgePage } from './pages/LodgePage';
import { ExpedicionesPage } from './pages/ExpedicionesPage';
import { AdminPage } from './pages/AdminPage';
import { VegvisirDetailPage } from './pages/VegvisirDetailPage';
import { TerranovaDetailPage } from './pages/TerranovaDetailPage';
import { analyticsService } from './services/analyticsService';

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
          isVideoReady={isVideoReady} 
          duration={3200} 
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
            {currentPath === '/' && <HomePage onNavigate={navigate} />}
            {currentPath === '/flota' && <FlotaPage onNavigate={navigate} />}
            {currentPath === '/lodge' && <LodgePage onNavigate={navigate} />}
            {currentPath === '/expediciones' && <ExpedicionesPage onNavigate={navigate} />}
            {currentPath === '/admin' && <AdminPage onNavigate={navigate} />}
            {currentPath === '/velero-vegvisir' && <VegvisirDetailPage onNavigate={navigate} />}
            {currentPath === '/yate-terranova' && <TerranovaDetailPage onNavigate={navigate} />}
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
