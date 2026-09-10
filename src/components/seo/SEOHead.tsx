import React, { useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  schema?: Record<string, any> | Record<string, any>[];
}

const DEFAULT_SEO = {
  title: 'Yates Chile — Expediciones Marítimas de Ultralujo & Lodge',
  description: 'Expediciones marítimas privadas y chárter oceánico a bordo del velero Vegvisir y yate Terranova hacia el Archipiélago Juan Fernández y Cabo de Hornos. Lodge exclusivo en la Patagonia Austral.',
  ogImage: 'https://yateschile.cl/expediciones-hero.jpg',
  siteUrl: 'https://yateschile.cl',
};

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalPath = '',
  ogImage,
  schema,
}) => {
  const { language } = useLanguage();

  useEffect(() => {
    // 1. Update Title
    const finalTitle = title 
      ? `${title} | Yates Chile` 
      : DEFAULT_SEO.title;
    document.title = finalTitle;

    // 2. Update or Create Meta Description
    const finalDesc = description || DEFAULT_SEO.description;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', finalDesc);

    // 3. Update Canonical Link
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const fullCanonicalUrl = `${DEFAULT_SEO.siteUrl}${cleanPath === '/' ? '' : cleanPath}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullCanonicalUrl);

    // 4. Update OpenGraph Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', finalTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', finalDesc);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', fullCanonicalUrl);

    const finalImage = ogImage || DEFAULT_SEO.ogImage;
    const ogImgEl = document.querySelector('meta[property="og:image"]');
    if (ogImgEl) ogImgEl.setAttribute('content', finalImage);

    // 5. Update HTML lang
    document.documentElement.setAttribute('lang', language === 'EN' ? 'en' : 'es');

    // 6. Dynamic JSON-LD injection for GEO & AEO
    const scriptId = 'dynamic-page-schema';
    let existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    if (schema) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      const schemaData = Array.isArray(schema) 
        ? { '@context': 'https://schema.org', '@graph': schema } 
        : { '@context': 'https://schema.org', ...schema };
      script.text = JSON.stringify(schemaData);
      document.head.appendChild(script);
    }

    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [title, description, canonicalPath, ogImage, schema, language]);

  return null;
};

// ==============================================================================
// Pre-configured Structured Data Schemas for GEO & AEO
// ==============================================================================

export const EXPEDITIONS_FAQ_SCHEMA = {
  '@type': 'FAQPage',
  'mainEntity': [
    {
      '@type': 'Question',
      'name': '¿Cómo llegar en velero al Archipiélago Juan Fernández y la Isla Robinson Crusoe?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Yates Chile opera expediciones oceánicas regulares hacia el Archipiélago Juan Fernández a bordo del velero de alta mar Vegvisir (Dufour 52.5 ft francés) y el yate Terranova (Hatteras 65 ft LRC). La navegación parte desde la costa central de Chile y dura aproximadamente 60 horas de travesía oceánica hasta fondear en la histórica Bahía Cumberland de Isla Robinson Crusoe.'
      }
    },
    {
      '@type': 'Question',
      'name': '¿Qué incluye la tarifa de las expediciones de Yates Chile?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'La tarifa individual o chárter privado incluye navegación con Patrón de Ultramar y tripulación certificada, pensión completa a bordo (gastronomía gourmet marina, desayunos, almuerzos, cenas calientes y aperitivos), combustible, agua desalinizada continua, uso de bote auxiliar Zodiac para desembarcos en caletas insulares, conexión satelital Starlink 24/7 y todos los seguros marítimos requeridos por DIRECTEMAR.'
      }
    },
    {
      '@type': 'Question',
      'name': '¿Qué certificaciones y medidas de seguridad marítima poseen las embarcaciones?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Todas las naves de Yates Chile están inspeccionadas y certificadas para navegación de alta mar por DIRECTEMAR (Armada de Chile). Disponen de radiobalizas satelitales EPIRB, balsas salvavidas oceánicas autoinflables, trajes de supervivencia, instrumental de navegación Raymarine con radar doppler, AIS de transmisión continua y comunicación satelital Starlink.'
      }
    },
    {
      '@type': 'Question',
      'name': '¿Se requiere experiencia previa en velerismo para unirse a las travesías?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'No se requiere experiencia náutica previa. La tripulación y el capitán se encargan de toda la maniobra, seguridad y gobierno del barco. Los pasajeros que lo deseen pueden participar voluntariamente en el trimado de velas, guardias de navegación y cartas náuticas bajo tutela del patrón.'
      }
    },
    {
      '@type': 'Question',
      'name': '¿Cuál es la política de reserva y abono para asegurar un cupo?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Para bloquear y garantizar un cupo en la expedición seleccionada, se requiere un abono inicial correspondiente al 50% del valor total mediante transferencia bancaria. El 50% restante se liquida hasta 30 días antes del zarpe.'
      }
    }
  ]
};

export const LODGE_SCHEMA = {
  '@type': 'LodgingBusiness',
  'name': 'Lodge Cabo de Hornos — Yates Chile',
  'url': 'https://yateschile.cl/lodge',
  'image': 'https://yateschile.cl/lodge-hero.jpg',
  'description': 'Refugio exclusivo de arquitectura austral y descanso de alta gama situado en los canales del Cabo de Hornos y Tierra del Fuego. Base de expediciones náuticas con gastronomía local de centolla y cordero patagónico.',
  'priceRange': '$$$$',
  'currenciesAccepted': 'CLP, USD',
  'address': {
    '@type': 'PostalAddress',
    'addressCountry': 'CL',
    'addressRegion': 'Magallanes y de la Antártica Chilena',
    'addressLocality': 'Cabo de Hornos'
  },
  'geo': {
    '@type': 'GeoCoordinates',
    'latitude': -55.9808,
    'longitude': -67.2725
  },
  'amenityFeature': [
    { '@type': 'LocationFeatureSpecification', 'name': 'Conexión Satelital Starlink', 'value': true },
    { '@type': 'LocationFeatureSpecification', 'name': 'Gastronomía Austral Gourmet', 'value': true },
    { '@type': 'LocationFeatureSpecification', 'name': 'Embarcadero y Fondeadero Privado', 'value': true },
    { '@type': 'LocationFeatureSpecification', 'name': 'Calefacción de Alto Rendimiento', 'value': true }
  ]
};

export const VEGVISIR_VESSEL_SCHEMA = {
  '@type': 'Vehicle',
  'name': 'Velero Vegvisir',
  'category': 'Velero de Expedición Oceánica',
  'vehicleModelDate': '2016',
  'description': 'Velero Dufour 52.5 ft francés de crucero oceánico de altura, dotado de 5 camarotes, 5 baños, desalinizador de agua de 140 l/h, generador, paneles solares y conexión satelital Starlink.',
  'seatingCapacity': 8,
  'numberOfDoors': 5,
  'image': 'https://yateschile.cl/velero-vegvisir.jpg',
  'offers': {
    '@type': 'Offer',
    'priceCurrency': 'CLP',
    'price': '3000000',
    'availability': 'https://schema.org/InStock',
    'url': 'https://yateschile.cl/flota/vegvisir'
  }
};

export const TERRANOVA_VESSEL_SCHEMA = {
  '@type': 'Vehicle',
  'name': 'Yate Terranova',
  'category': 'Yate de Expedición de Gran Autonomía (LRC)',
  'description': 'Yate Hatteras 65 ft LRC (Long Range Cruiser) diseñado para navegación en aguas australes con casco reforzado, estabilizadores hidráulicos de balance, cocina de chef y habitabilidad de lujo para 8 tripulantes.',
  'seatingCapacity': 8,
  'image': 'https://yateschile.cl/yate-terranova.jpg',
  'offers': {
    '@type': 'Offer',
    'priceCurrency': 'CLP',
    'price': '3500000',
    'availability': 'https://schema.org/InStock',
    'url': 'https://yateschile.cl/flota/terranova'
  }
};

export const CONTACT_SCHEMA = {
  '@type': 'ContactPage',
  'name': 'Contacto & Concierge Privado — Yates Chile',
  'description': 'Canal oficial de contacto y asesoría náutica para reservas de expediciones a Juan Fernández, Cabo de Hornos y Lodge exclusivo.',
  'mainEntity': {
    '@type': 'TravelAgency',
    'name': 'Yates Chile',
    'telephone': '+56991234567',
    'email': 'contacto@yateschile.cl',
    'areaServed': 'CL',
    'availableLanguage': ['Spanish', 'English']
  }
};

