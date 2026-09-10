import { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { FloatingConcierge } from './components/layout/FloatingConcierge';
import { WelcomeSplash } from './components/modules/WelcomeSplash';
import { LoadingScreen } from './components/modules/LoadingScreen';
import { analyticsService } from './services/analyticsService';
import {
  SEOHead,
  EXPEDITIONS_FAQ_SCHEMA,
  LODGE_SCHEMA,
  VEGVISIR_VESSEL_SCHEMA,
  TERRANOVA_VESSEL_SCHEMA,
  CONTACT_SCHEMA,
} from './components/seo/SEOHead';

// Lazy-loaded pages for optimal bundle code-splitting
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const FlotaPage = lazy(() => import('./pages/FlotaPage').then((m) => ({ default: m.FlotaPage })));
const LodgePage = lazy(() => import('./pages/LodgePage').then((m) => ({ default: m.LodgePage })));
const ExpedicionesPage = lazy(() => import('./pages/ExpedicionesPage').then((m) => ({ default: m.ExpedicionesPage })));
const ContactoPage = lazy(() => import('./pages/ContactoPage').then((m) => ({ default: m.ContactoPage })));
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

  // Determine initial path from URL pathname or hash (supporting clean SEO URLs and legacy hash links)
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== '' && hash !== '/welcome' && hash !== '/intro') {
      return hash;
    }
    const pathname = window.location.pathname;
    if (pathname && pathname !== '/' && pathname !== '') {
      return pathname;
    }
    return '/welcome';
  });

  const [showSplash, setShowSplash] = useState<boolean>(() => {
    const hash = window.location.hash.replace('#', '');
    const pathname = window.location.pathname;
    if (hash && hash !== '/welcome' && hash !== '/intro') {
      return false;
    }
    if (pathname && pathname !== '/' && pathname !== '') {
      return false;
    }
    return true;
  });

  // Synchronize path with URL pathname & hash for seamless browser navigation & SEO indexing
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.replace('#', '');
      const pathname = window.location.pathname;

      let target = '/welcome';
      if (hash && hash !== '') {
        target = hash;
      } else if (pathname && pathname !== '/' && pathname !== '') {
        target = pathname;
      } else if (pathname === '/' && !showSplash) {
        target = '/';
      }

      if (target === '/welcome' || target === '/intro') {
        setShowSplash(true);
      } else {
        setShowSplash(false);
      }

      setCurrentPath(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Track public page visits
      if (target !== '/welcome' && target !== '/intro' && target !== '/admin') {
        analyticsService.trackPageView(target);
      }
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [showSplash]);

  const navigate = (path: string) => {
    if (path === '/welcome' || path === '/intro') {
      setShowSplash(true);
      window.history.pushState(null, '', '/');
    } else {
      setShowSplash(false);
      window.history.pushState(null, '', path);
    }
    if (window.location.hash) {
      window.history.replaceState(null, '', path === '/welcome' ? '/' : path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (path !== '/welcome' && path !== '/intro' && path !== '/admin') {
      analyticsService.trackPageView(path);
    }
  };

  const handleEnterSite = (targetPath: string = '/') => {
    setShowSplash(false);
    navigate(targetPath);
  };

  // Dynamic SEO, GEO & AEO metadata per route
  const renderSEO = () => {
    switch (currentPath) {
      case '/expediciones':
        return (
          <SEOHead
            title="Expediciones Marítimas a Juan Fernández y Cabo de Hornos"
            description="Travesías de alta mar guiadas por patrones certificados hacia la Isla Robinson Crusoe y la Patagonia. Gastronomía gourmet, navegación segura y confort oceánico."
            canonicalPath="/expediciones"
            ogImage="https://yateschile.cl/expediciones-hero.jpg"
            schema={EXPEDITIONS_FAQ_SCHEMA}
          />
        );
      case '/flota':
        return (
          <SEOHead
            title="Nuestra Flota de Alta Mar — Velero Vegvisir & Yate Terranova"
            description="Conoce nuestra flota de ultralujo: Velero Dufour 52.5 ft y Yate Hatteras 65 ft LRC con tecnología satelital Starlink, desalinizadores y certificación oceánica DIRECTEMAR."
            canonicalPath="/flota"
            ogImage="https://yateschile.cl/velero-vegvisir.jpg"
            schema={[VEGVISIR_VESSEL_SCHEMA, TERRANOVA_VESSEL_SCHEMA]}
          />
        );
      case '/velero-vegvisir':
      case '/flota/vegvisir':
        return (
          <SEOHead
            title="Velero Vegvisir — Dufour 52.5 ft de Crucero Oceánico"
            description="Velero francés de alta gama equipado para travesías oceánicas al Archipiélago Juan Fernández: 5 camarotes, 5 baños, desalinizador continuo y Starlink."
            canonicalPath="/flota/vegvisir"
            ogImage="https://yateschile.cl/velero-vegvisir.jpg"
            schema={VEGVISIR_VESSEL_SCHEMA}
          />
        );
      case '/yate-terranova':
      case '/flota/terranova':
        return (
          <SEOHead
            title="Yate Terranova — Hatteras 65 ft LRC de Gran Autonomía"
            description="Yate de expedición oceánica diseñado para navegar las aguas indómitas del Cabo de Hornos y Patagonia Austral con máxima seguridad y confort de alta gama."
            canonicalPath="/flota/terranova"
            ogImage="https://yateschile.cl/yate-terranova.jpg"
            schema={TERRANOVA_VESSEL_SCHEMA}
          />
        );
      case '/lodge':
        return (
          <SEOHead
            title="Lodge Cabo de Hornos — Refugio de Ultralujo en la Patagonia Austral"
            description="Hospedaje exclusivo en el confín del mundo. Experiencia de arquitectura austral, gastronomía patagónica de autor y expediciones marítimas privadas."
            canonicalPath="/lodge"
            ogImage="https://yateschile.cl/lodge-hero.jpg"
            schema={LODGE_SCHEMA}
          />
        );
      case '/contacto':
        return (
          <SEOHead
            title="Contacto & Concierge Náutico Exclusivo"
            description="Comunícate con nuestro equipo de Concierge privado para planificar tu próxima travesía a Juan Fernández, Cabo de Hornos o estadía en el Lodge."
            canonicalPath="/contacto"
            ogImage="https://yateschile.cl/expediciones-hero.jpg"
            schema={CONTACT_SCHEMA}
          />
        );
      case '/admin':
        return (
          <SEOHead
            title="Panel de Administración Privado"
            description="Sistema de gestión interna de Yates Chile."
            canonicalPath="/admin"
          />
        );
      default:
        return (
          <SEOHead
            title="Expediciones Marítimas de Ultralujo & Lodge"
            description="Expediciones marítimas privadas y chárter oceánico a bordo del velero Vegvisir y yate Terranova hacia el Archipiélago Juan Fernández y Cabo de Hornos. Lodge exclusivo en la Patagonia Austral."
            canonicalPath="/"
            ogImage="https://yateschile.cl/expediciones-hero.jpg"
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Headless Dynamic SEO, OpenGraph & GEO/AEO Schema */}
      {renderSEO()}

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
              {currentPath === '/contacto' && <ContactoPage />}
              {currentPath === '/admin' && <AdminPage onNavigate={navigate} />}
              {(currentPath === '/velero-vegvisir' || currentPath === '/flota/vegvisir') && (
                <VegvisirDetailPage onNavigate={navigate} />
              )}
              {(currentPath === '/yate-terranova' || currentPath === '/flota/terranova') && (
                <TerranovaDetailPage onNavigate={navigate} />
              )}
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

