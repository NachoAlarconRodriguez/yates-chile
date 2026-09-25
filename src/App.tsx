import { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { FloatingConcierge } from './components/layout/FloatingConcierge';
import { WelcomeSplash } from './components/modules/WelcomeSplash';
import { LoadingScreen } from './components/modules/LoadingScreen';
import { MaintenanceScreen } from './components/modules/MaintenanceScreen';
import { analyticsService } from './services/analyticsService';

// =========================================================================
// INTERRUPTOR DE MODO MANTENCIÓN:
// - Poner en `true` para activar la pantalla de mantención con el video de Vegvisir.
// - Poner en `false` para restaurar todo el sitio web exactamente a su estado normal.
// =========================================================================
export const IS_MAINTENANCE_MODE = true;

// Claves secretas autorizadas para vista previa privada del cliente:
// Permite ingresar mediante: https://yateschile.cl/?preview=yates2026 (o ?preview=cliente)
export const CLIENT_PREVIEW_KEYS = ['yates2026', 'cliente', 'vip'];
export const PREVIEW_STORAGE_KEY = 'yates_client_preview_access';

export function checkClientPreviewAccess(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const searchVal = searchParams.get('preview')?.toLowerCase().trim();

    let hashVal: string | null = null;
    if (window.location.hash && window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.split('?')[1];
      hashVal = new URLSearchParams(hashQuery).get('preview')?.toLowerCase().trim() || null;
    }

    const previewParam = searchVal || hashVal;

    if (previewParam) {
      if (previewParam === 'exit' || previewParam === 'lock' || previewParam === 'false') {
        localStorage.removeItem(PREVIEW_STORAGE_KEY);
        return false;
      }
      if (CLIENT_PREVIEW_KEYS.includes(previewParam)) {
        localStorage.setItem(PREVIEW_STORAGE_KEY, 'true');
        return true;
      }
    }

    return localStorage.getItem(PREVIEW_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}


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
const VesselDetailPage = lazy(() => import('./pages/VesselDetailPage').then((m) => ({ default: m.VesselDetailPage })));

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
  const [hasPreviewAccess, setHasPreviewAccess] = useState<boolean>(() => checkClientPreviewAccess());

  useEffect(() => {
    if (checkClientPreviewAccess()) {
      setHasPreviewAccess(true);
    }
  }, []);

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
  const baseRoute = currentPath.split('?')[0];

  const renderSEO = () => {
    switch (baseRoute) {
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
        if (baseRoute.startsWith('/flota/')) {
          const rawParam = baseRoute.replace('/flota/', '');
          const formattedName = rawParam.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
          return (
            <SEOHead
              title={`${formattedName} — Flota de Expedición Yates Chile`}
              description={`Conoce los detalles, características técnicas y reservas para navegar a bordo de ${formattedName} en la Patagonia y Archipiélago Juan Fernández.`}
              canonicalPath={baseRoute}
            />
          );
        }
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

  // Modo mantención: bloquea el sitio público y muestra la pantalla con el video de Vegvisir
  // Se desbloquea automáticamente si el usuario ingresa con la clave de vista previa (?preview=yates2026)
  const isMaintenanceActive = IS_MAINTENANCE_MODE && !hasPreviewAccess;

  if (isMaintenanceActive) {
    if (baseRoute === '/admin') {
      return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
          <Suspense fallback={<PageLoaderFallback />}>
            <AdminPage onNavigate={navigate} />
          </Suspense>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans">
        <SEOHead
          title="Sitio en Mantención — Yates Chile"
          description="Estamos renovando nuestra experiencia digital de navegación y expediciones marítimas de ultralujo. Volveremos muy pronto."
          canonicalPath="/"
          ogImage="https://yateschile.cl/expediciones-hero.jpg"
        />
        <MaintenanceScreen onBypass={() => navigate('/admin')} />
      </div>
    );
  }

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
          {baseRoute !== '/admin' && <Header currentPath={baseRoute} onNavigate={navigate} />}

          {/* Multi-Page View Container */}
          <main className="flex-1">
            <Suspense fallback={<PageLoaderFallback />}>
              {baseRoute === '/' && <HomePage onNavigate={navigate} />}
              {baseRoute === '/flota' && <FlotaPage onNavigate={navigate} />}
              {baseRoute === '/lodge' && <LodgePage onNavigate={navigate} />}
              {baseRoute === '/expediciones' && <ExpedicionesPage onNavigate={navigate} currentPath={currentPath} />}
              {baseRoute === '/contacto' && <ContactoPage />}
              {baseRoute === '/admin' && <AdminPage onNavigate={navigate} />}
              {(baseRoute === '/velero-vegvisir' || baseRoute === '/flota/vegvisir') && (
                <VegvisirDetailPage onNavigate={navigate} />
              )}
              {(baseRoute === '/yate-terranova' || baseRoute === '/flota/terranova') && (
                <TerranovaDetailPage onNavigate={navigate} />
              )}
              {baseRoute.startsWith('/flota/') && baseRoute !== '/flota/vegvisir' && baseRoute !== '/flota/terranova' && (
                <VesselDetailPage vesselIdOrSlug={baseRoute.replace('/flota/', '')} onNavigate={navigate} />
              )}
              {/* Dynamic slug route fallback like /velero-punta-sur */}
              {!['/', '/flota', '/lodge', '/expediciones', '/contacto', '/admin', '/welcome', '/intro'].includes(baseRoute) &&
                !baseRoute.startsWith('/flota/') &&
                baseRoute !== '/velero-vegvisir' &&
                baseRoute !== '/yate-terranova' && (
                  <VesselDetailPage vesselIdOrSlug={baseRoute.replace(/^\//, '')} onNavigate={navigate} />
              )}
            </Suspense>
          </main>

          {/* Footer (hidden in Admin) */}
          {baseRoute !== '/admin' && <Footer onNavigate={navigate} />}

          {/* Persistent Concierge WhatsApp Button (hidden in Admin) */}
          {baseRoute !== '/admin' && <FloatingConcierge />}
        </>
      )}

      {/* Indicador discreto de vista previa privada durante mantención */}
      {IS_MAINTENANCE_MODE && hasPreviewAccess && (
        <div className="fixed bottom-4 left-4 z-50 bg-[#0b192c]/90 text-white text-[11px] font-mono px-3.5 py-1.5 rounded-full border border-sky-400/40 shadow-xl backdrop-blur-md flex items-center gap-2 pointer-events-auto select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-200">Vista Previa Privada</span>
        </div>
      )}
    </div>
  );
}

export default App;

