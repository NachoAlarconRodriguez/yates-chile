import React, { useState } from 'react';
import { EXPEDITIONS, type Expedition } from '../components/modules/ExpeditionCalendar';
import { Compass, Download, Clock, ArrowRight, Check, X, MapPin, Sparkles, Utensils, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

interface ExpedicionesPageProps {
  onNavigate: (path: string) => void;
}

interface ItineraryStep {
  day: string;
  title: string;
  description: string;
  image: string;
  duration?: string;
  difficulty?: string;
  gastronomy?: string;
  activities?: string[];
  schedule?: { time: string; activity: string }[];
}

const LODGE_ITINERARY: ItineraryStep[] = [
  { 
    day: 'Día 1', 
    title: 'Arribo a Bahía Cumberland & Recepción', 
    description: 'Recepción en el muelle de Robinson Crusoe y traslado en lancha rápida hacia nuestro santuario privado Lodge Rincón de Navegantes. Almuerzo de bienvenida con gastronomía local.',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=400&q=80',
    duration: 'Medio día',
    difficulty: 'Fácil',
    gastronomy: 'Ceviche de vidriola fresca y maridaje con vino blanco del Valle de Casablanca.',
    activities: ['Recepción en el muelle', 'Traslado náutico rápido', 'Caminata de reconocimiento'],
    schedule: [
      { time: '09:30', activity: 'Arribo en vuelo charter y traslado en lancha al Lodge.' },
      { time: '13:00', activity: 'Almuerzo de bienvenida gourmet en la terraza.' },
      { time: '16:00', activity: 'Briefing de seguridad y caminata ligera por Bahía Cumberland.' },
      { time: '20:00', activity: 'Cena de tres tiempos inspirada en recetas tradicionales de la isla.' }
    ]
  },
  { 
    day: 'Día 2', 
    title: 'Trekking Mirador Alexander Selkirk', 
    description: 'Caminata guiada a través del bosque templado lluvioso subiendo al mirador histórico donde Selkirk vigilaba el horizonte. Vistas panorámicas de ambas vertientes de la isla.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    duration: 'Día completo (6-7 horas)',
    difficulty: 'Alta',
    gastronomy: 'Box lunch gourmet con sándwich de pan de masa madre, frutos locales y barra energética.',
    activities: ['Ascenso de montaña guiado', 'Avistamiento de avifauna silvestre', 'Fotografía en el Mirador histórico'],
    schedule: [
      { time: '08:30', activity: 'Desayuno buffet energético en el comedor del Lodge.' },
      { time: '09:30', activity: 'Inicio de la caminata hacia el Mirador Alexander Selkirk.' },
      { time: '13:00', activity: 'Descanso en la cima, vistas panorámicas y almuerzo rústico.' },
      { time: '16:30', activity: 'Retorno al Lodge y tiempo de relajo en tinas calientes frente al mar.' }
    ]
  },
  { 
    day: 'Día 3', 
    title: 'Pesca Tradicional de Langosta', 
    description: 'Embarque en botes artesanales locales para aprender y participar del levantamiento de trampas de langosta. Degustación gourmet del producto estrella en la playa.',
    image: 'https://images.unsplash.com/photo-1534080391025-097b03b77385?auto=format&fit=crop&w=400&q=80',
    duration: '5 horas',
    difficulty: 'Fácil',
    gastronomy: 'Langosta fresca de Juan Fernández cocida en agua de mar a la orilla de la playa.',
    activities: ['Navegación en bote artesanal', 'Demostración de pesca sostenible', 'Tarde libre de kayak/paddle'],
    schedule: [
      { time: '09:00', activity: 'Embarque junto a experimentados pescadores locales.' },
      { time: '10:00', activity: 'Maniobra de levantamiento de trampas de madera tradicionales.' },
      { time: '12:30', activity: 'Desembarco en caleta protegida and preparación de langosta en vivo.' },
      { time: '16:00', activity: 'Regreso al Lodge para descanso o actividades libres.' }
    ]
  },
  { 
    day: 'Día 4', 
    title: 'Santuario de Lobos Marinos & Buceo', 
    description: 'Navegación bordeando los farellones marinos hacia la lobería. Sesión de snorkel o buceo autónomo junto a los amigables lobos finos de dos pelos de Juan Fernández.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80',
    duration: '4-5 horas',
    difficulty: 'Moderada',
    gastronomy: 'Empanadas tradicionales de vidriola y jugos naturales prensados en frío.',
    activities: ['Snorkel o buceo guiado', 'Nado interactivo con lobos marinos', 'Navegación panorámica de farellones'],
    schedule: [
      { time: '09:30', activity: 'Ajuste y prueba de equipos de agua en el centro náutico.' },
      { time: '10:15', activity: 'Navegación hacia la colonia protegida de lobos finos.' },
      { time: '11:00', activity: 'Inmersión y nado interactivo con los lobos de dos pelos.' },
      { time: '14:00', activity: 'Retorno al Lodge para un almuerzo tardío reparador.' }
    ]
  },
  { 
    day: 'Día 5', 
    title: 'Expedición Botánica de Endemismos', 
    description: 'Caminata de conservación guiada por biólogos locales identificando helechos gigantes y aves únicas como el Picaflor Rojo de Juan Fernández en peligro de extinción.',
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80',
    duration: '4 horas',
    difficulty: 'Fácil',
    gastronomy: 'Tabla de quesos maduros nacionales, frutos secos y cata de tintos en la biblioteca.',
    activities: ['Senderismo botánico guiado', 'Observación científica de aves', 'Charla sobre conservación y biodiversidad'],
    schedule: [
      { time: '09:00', activity: 'Breve charla introductoria sobre el ecosistema único de la isla.' },
      { time: '10:00', activity: 'Caminata por la Reserva Nacional, avistamiento de especies.' },
      { time: '13:30', activity: 'Almuerzo temático basado en ingredientes orgánicos locales.' },
      { time: '17:00', activity: 'Avistamiento fotográfico del Picaflor de Juan Fernández.' }
    ]
  },
  { 
    day: 'Día 6', 
    title: 'Cena de Despedida & Retorno', 
    description: 'Última jornada de relajo en el lodge, baños calientes de tina y cena de gala. Traslado final de regreso para abordar el vuelo de retorno al continente.',
    image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=400&q=80',
    duration: 'Medio día',
    difficulty: 'Fácil',
    gastronomy: 'Cena de gala de despedida con mariscos endémicos y espumante premium chileno.',
    activities: ['Relajo y spa de despedida', 'Traslado en lancha rápida', 'Vuelo charter de retorno'],
    schedule: [
      { time: '09:00', activity: 'Desayuno de despedida en la terraza frente al mar.' },
      { time: '10:30', activity: 'Tiempo libre para compras de souvenirs y artesanías en San Juan.' },
      { time: '12:30', activity: 'Check-out y traslado náutico hacia el aeródromo.' },
      { time: '14:00', activity: 'Vuelo de retorno hacia el continente (Santiago).' }
    ]
  }
];

const SAILING_ITINERARY: ItineraryStep[] = [
  { 
    day: 'Día 1', 
    title: 'Zarpe & Cruce del Océano Pacífico', 
    description: 'Embarque a bordo del Velero Vegvisir. Instrucción de seguridad náutica y zarpada con rumbo oeste, adentrándonos en el Pacífico profundo con vientos portantes.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
    duration: '24 horas (Navegación)',
    difficulty: 'Alta',
    gastronomy: 'Menú de navegación calórico a bordo y café caliente de guardia.',
    activities: ['Briefing de seguridad náutica', 'Asignación de literas y guardias', 'Maniobra de zarpe'],
    schedule: [
      { time: '08:30', activity: 'Recepción de la tripulación y estiba de equipaje/víveres.' },
      { time: '10:00', activity: 'Charla técnica de maniobras, uso de arneses y chalecos.' },
      { time: '12:00', activity: 'Zarpe oficial. Salida de bahía e izado de la vela mayor.' },
      { time: '20:00', activity: 'Inicio de la rotación de guardias nocturnas.' }
    ]
  },
  { 
    day: 'Día 2', 
    title: 'Navegación Oceánica & Trimado de Velas', 
    description: 'Establecimiento del ritmo diario de guardias de navegación. Aprendizaje práctico de trimado de velas principales y desconexión absoluta del continente.',
    image: 'https://images.unsplash.com/photo-1470104240373-bc1812eddc9f?auto=format&fit=crop&w=400&q=80',
    duration: '24 horas (Navegación)',
    difficulty: 'Alta',
    gastronomy: 'Estofado de carne marinero cocinado en la estufa basculante a bordo.',
    activities: ['Trimado de mayor y génova', 'Control de timón instrumental', 'Navegación de altura'],
    schedule: [
      { time: '08:00', activity: 'Cambio de guardia de mañana y desayuno en cubierta.' },
      { time: '10:30', activity: 'Taller práctico de nudos náuticos y maniobras rápidas.' },
      { time: '14:00', activity: 'Ajuste de velas según la velocidad y dirección del viento.' },
      { time: '21:00', activity: 'Guardia nocturna y visualización de fauna pelágica.' }
    ]
  },
  { 
    day: 'Día 3', 
    title: 'Navegación Astronómica & Sextante', 
    description: 'Navegación en mar abierto. Aprovechando el cielo despejado del Pacífico Sur, aprenderemos a utilizar el sextante para navegación tradicional.',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80',
    duration: '24 horas (Navegación)',
    difficulty: 'Alta',
    gastronomy: 'Pasta al pesto y raciones energéticas para guardias frías.',
    activities: ['Prácticas con el sextante', 'Cálculos de posicionamiento clásico', 'Monitoreo de bitácora'],
    schedule: [
      { time: '09:00', activity: 'Toma de altura del sol usando el sextante.' },
      { time: '12:00', activity: 'Cálculo astronómico del mediodía verdadero.' },
      { time: '15:30', activity: 'Inspección de jarcia y estado general del velero.' },
      { time: '22:00', activity: 'Observación y reconocimiento de constelaciones australes.' }
    ]
  },
  { 
    day: 'Día 4', 
    title: 'Pesca de Altura (Trolling) & Presencia de Aves', 
    description: 'Navegación con líneas de pesca profunda. Preparación para el avistamiento de tierra mientras monitoreamos las cartas náuticas.',
    image: 'https://images.unsplash.com/photo-1534080391025-097b03b77385?auto=format&fit=crop&w=400&q=80',
    duration: '24 horas (Navegación)',
    difficulty: 'Alta',
    gastronomy: 'Sashimi fresco de atún o vidriola pescado a bordo durante el día.',
    activities: ['Pesca deportiva de altura', 'Análisis de cartas de aproximación', 'Guardias de radar'],
    schedule: [
      { time: '07:00', activity: 'Lanzamiento de las líneas de arrastre en popa.' },
      { time: '11:00', activity: 'Captura y fileteo de pescado fresco para almuerzo.' },
      { time: '15:00', activity: 'Planificación de la recalada en Bahía Cumberland.' },
      { time: '20:00', activity: 'Guardia de aproximación visual y monitoreo AIS.' }
    ]
  },
  { 
    day: 'Día 5', 
    title: 'Arribo a Juan Fernández & Recalada', 
    description: 'Avistamiento de los imponentes acantilados de Robinson Crusoe. Maniobra de fondeo en Bahía Cumberland e inmersión cultural inicial en San Juan Bautista.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    duration: 'Medio día',
    difficulty: 'Moderada',
    gastronomy: 'Cena de bienvenida en restaurant de San Juan Bautista con centolla local.',
    activities: ['Fondeo controlado', 'Acreditación en capitanía de puerto', 'Caminata de estiramiento'],
    schedule: [
      { time: '08:00', activity: 'Primer avistamiento visual de la silueta de la isla.' },
      { time: '10:30', activity: 'Ingreso a Bahía Cumberland y fondeo de seguridad.' },
      { time: '12:00', activity: 'Trámites de puerto y desembarque en bote auxiliar.' },
      { time: '19:30', activity: 'Cena y celebración del cruce en restaurant local.' }
    ]
  },
  { 
    day: 'Día 6', 
    title: 'Caminata Botánica en Selva Templada', 
    description: 'Trekking guiado por los exuberantes senderos del archipiélago. Observación de helechos gigantes y aves endémicas de Juan Fernández.',
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80',
    duration: '6 horas',
    difficulty: 'Moderada',
    gastronomy: 'Asado campestre en el jardín del Lodge Rincón de Navegantes.',
    activities: ['Senderismo botánico', 'Fotografía de avifauna', 'Tarde de descanso'],
    schedule: [
      { time: '09:00', activity: 'Desayuno a bordo y desembarco.' },
      { time: '10:00', activity: 'Trekking guiado por el Sendero Plazoleta El Yunque.' },
      { time: '14:00', activity: 'Almuerzo buffet en las terrazas del Lodge.' },
      { time: '17:00', activity: 'Tiempo libre para kayak o relajo.' }
    ]
  },
  { 
    day: 'Día 7', 
    title: 'Navegación Táctica a Isla Selkirk', 
    description: 'Zarpe temprano para recorrer las 90 millas náuticas hacia el oeste con rumbo a la remota e indómita Isla Alejandro Selkirk.',
    image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=400&q=80',
    duration: '18 horas (Navegación)',
    difficulty: 'Alta',
    gastronomy: 'Sopa caliente de verduras y snacks energéticos de guardia.',
    activities: ['Navegación con vientos cruzados', 'Trimado táctico de velas', 'Guardias nocturnas'],
    schedule: [
      { time: '05:00', activity: 'Levar anclas y zarpe temprano de Cumberland.' },
      { time: '09:00', activity: 'Ajuste de velas para navegación del través (viento cruzado).' },
      { time: '14:00', activity: 'Monitoreo de la ruta en carta e instrumentos.' },
      { time: '23:00', activity: 'Arribo visual y fondeo provisorio en Bahía Selkirk.' }
    ]
  },
  { 
    day: 'Día 8', 
    title: 'Desembarco en Puerto Español & Exploración', 
    description: 'Complejo desembarco en balsa en el agreste Puerto Español. Trekking histórico por las ruinas de la colonia penal y cuevas de antiguos náufragos.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    duration: '8 horas',
    difficulty: 'Alta',
    gastronomy: 'Picnic a la orilla del mar con langostas provistas por pescadores locales.',
    activities: ['Desembarco técnico con rompiente', 'Trekking guiado por ruinas penales', 'Observación del picaflor de Selkirk'],
    schedule: [
      { time: '08:30', activity: 'Fondeo final en Bahía de Puerto Español.' },
      { time: '09:30', activity: 'Desembarco asistido por experimentados pescadores locales.' },
      { time: '11:00', activity: 'Caminata histórica por las cuevas de los prisioneros y náufragos.' },
      { time: '17:30', activity: 'Regreso seguro al velero y preparación para el viaje de retorno.' }
    ]
  },
  { 
    day: 'Día 9', 
    title: 'Zarpe de Retorno & Guardias de Ceñida', 
    description: 'Zarpe e inicio de la navegación de regreso hacia el continente. Enfrentamos vientos de ceñida que exigen máxima destreza táctica de la tripulación.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
    duration: '24 horas (Navegación)',
    difficulty: 'Alta',
    gastronomy: 'Guiso de legumbres caliente a bordo y chocolate amargo de guardia.',
    activities: ['Navegación de ceñida contra el viento', 'Trimado de velas de tormenta', 'Guardias de timón'],
    schedule: [
      { time: '06:00', activity: 'Zarpe definitivo del archipiélago con rumbo este.' },
      { time: '09:00', activity: 'Establecimiento de las guardias de ceñida (vida escora).' },
      { time: '15:00', activity: 'Taller de meteorología oceánica avanzada a bordo.' },
      { time: '20:00', activity: 'Monitoreo de instrumentos y guardias de noche.' }
    ]
  },
  { 
    day: 'Día 10', 
    title: 'Navegación Táctica de Retorno', 
    description: 'Navegación profunda optimizando la ruta según corrientes oceánicas. La tripulación consolida su entrenamiento de maniobras y timoneo.',
    image: 'https://images.unsplash.com/photo-1470104240373-bc1812eddc9f?auto=format&fit=crop&w=400&q=80',
    duration: '24 horas (Navegación)',
    difficulty: 'Alta',
    gastronomy: 'Paella de mariscos en conserva gourmet y café caliente de grano.',
    activities: ['Chequeo de sentinas and baterías', 'Simulacro de Hombre al Agua (MOB)', 'Reporte radial diario'],
    schedule: [
      { time: '08:00', activity: 'Inspección técnica general de sistemas del velero.' },
      { time: '11:00', activity: 'Simulacro de emergencia y maniobras de hombre al agua.' },
      { time: '14:30', activity: 'Navegación con spinnaker o génova abierta según vientos.' },
      { time: '20:00', activity: 'Reporte radial obligatorio de posición.' }
    ]
  },
  { 
    day: 'Día 11', 
    title: 'Aproximación al Continente', 
    description: 'Ingreso a la zona de tráfico marítimo continental. Aumento de la vigilancia visual y uso intensivo de radar y AIS por aproximación a rutas comerciales.',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80',
    duration: '24 horas (Navegación)',
    difficulty: 'Moderada',
    gastronomy: 'Cena a bordo con pastas ligeras y las últimas provisiones frescas.',
    activities: ['Vigía visual intensivo', 'Uso de radar y AIS', 'Planificación de la recalada final'],
    schedule: [
      { time: '09:00', activity: 'Análisis de cartas náuticas de aproximación al continente.' },
      { time: '12:00', activity: 'Primeros avistamientos de buques comerciales en radar.' },
      { time: '16:30', activity: 'Briefing final de balance y lecciones aprendidas.' },
      { time: '22:00', activity: 'Aproximación visual nocturna con luces de costa a la vista.' }
    ]
  },
  { 
    day: 'Día 12', 
    title: 'Recalada Final & Bautizo de Timoneles', 
    description: 'Entrada al puerto de origen. Maniobras de atraque, desembarque y la tradicional ceremonia de bautizo náutico para los nuevos timoneles oceánicos.',
    image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=400&q=80',
    duration: 'Medio día',
    difficulty: 'Fácil',
    gastronomy: 'Cóctel de celebración con ostras, mariscos locales y espumantes en el club náutico.',
    activities: ['Maniobras de atraque en puerto', 'Limpieza y desestiba del velero', 'Ceremonia de graduación de tripulantes'],
    schedule: [
      { time: '08:30', activity: 'Entrada guiada a la bahía de puerto y contacto radial.' },
      { time: '10:00', activity: 'Maniobra de atraque en muelle deportivo.' },
      { time: '11:30', activity: 'Desestiba de equipaje e inspección final del Velero Vegvisir.' },
      { time: '13:00', activity: 'Ceremonia de graduación de timoneles oceánicos y cóctel.' }
    ]
  }
];

const YACHT_ITINERARY: ItineraryStep[] = [
  { 
    day: 'Día 1', 
    title: 'Embarque & Navegación de Alta Velocidad', 
    description: 'Embarque a bordo del Yate Terranova. Cóctel de bienvenida en el flybridge mientras navegamos a velocidad crucero de 18 nudos esquivando acantilados marinos.',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=400&q=80',
    duration: 'Medio día',
    difficulty: 'Fácil',
    gastronomy: 'Tablas de ahumados premium, ostras frescas y espumante helado en el flybridge.',
    activities: ['Embarque y asignación de suites', 'Charla de sistemas del yate', 'Navegación panorámica inicial'],
    schedule: [
      { time: '14:00', activity: 'Recepción a bordo en el puerto deportivo y asignación de suites de lujo.' },
      { time: '15:00', activity: 'Cóctel de bienvenida y zarpe del yate.' },
      { time: '17:30', activity: 'Navegación de alta velocidad bordeando acantilados costeros.' },
      { time: '20:30', activity: 'Cena gourmet de bienvenida preparada por el chef ejecutivo.' }
    ]
  },
  { 
    day: 'Día 2', 
    title: 'Pesca Deportiva (Trolling) de Altura', 
    description: 'Jornada de pesca de atún y vidriola utilizando el equipamiento premium del Terranova. Preparación de sashimi fresco por nuestro chef a bordo.',
    image: 'https://images.unsplash.com/photo-1534080391025-097b03b77385?auto=format&fit=crop&w=400&q=80',
    duration: '7 horas',
    difficulty: 'Moderada',
    gastronomy: 'Almuerzo en cubierta con sashimi y tartar del atún pescado en la mañana.',
    activities: ['Pesca de arrastre con sillas de combate', 'Fileteo demostrativo en popa', 'Tarde de natación en bahía'],
    schedule: [
      { time: '08:00', activity: 'Desayuno gourmet a la carta en el comedor interior.' },
      { time: '09:30', activity: 'Salida a zona de pesca profunda con equipamiento Shimano Tiagra.' },
      { time: '13:00', activity: 'Almuerzo a bordo basado en la pesca del día.' },
      { time: '16:00', activity: 'Retorno a bahía protegida y tarde de natación o snorkel.' }
    ]
  },
  { 
    day: 'Día 3', 
    title: 'Exploración de Caletas Escondidas', 
    description: 'Desembarcos asistidos en Zodiac en playas desiertas de arena negra volcánica. Trekking corto por cuevas de antiguos corsarios y marineros mercantes.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    duration: '5 horas',
    difficulty: 'Fácil',
    gastronomy: 'Asado de pescados locales al horno de leña en la playa.',
    activities: ['Paseo en Zodiac', 'Exploración de cavernas históricas', 'Caminatas livianas guiadas'],
    schedule: [
      { time: '09:30', activity: 'Traslado en lancha auxiliar Zodiac hacia playa volcánica inaccesible.' },
      { time: '10:30', activity: 'Trekking guiado a la cueva de Robinson Crusoe y fuertes.' },
      { time: '13:30', activity: 'Almuerzo rústico gourmet en la playa preparado por el personal.' },
      { time: '16:30', activity: 'Regreso al yate y cócteles al atardecer en el flybridge.' }
    ]
  },
  { 
    day: 'Día 4', 
    title: 'Jacuzzi frente al Glaciar & Atardecer', 
    description: 'Navegación silenciosa al interior de los fiordos. Relajo en el jacuzzi climatizado en cubierta frente a paredes de hielo azulado con servicio de catering continuo.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80',
    duration: 'Día completo',
    difficulty: 'Fácil',
    gastronomy: 'Menú de degustación patagónica y calafate sour helado con hielo glaciar.',
    activities: ['Navegación en fiordos y glaciares', 'Jacuzzi en cubierta frente al hielo', 'Fotografía de desprendimientos'],
    schedule: [
      { time: '09:00', activity: 'Entrada al fiordo glaciar a baja velocidad para navegación segura.' },
      { time: '11:30', activity: 'Sesión de spa en el jacuzzi de cubierta frente a la pared del glaciar.' },
      { time: '14:00', activity: 'Almuerzo de autor en el comedor panorámico 360°.' },
      { time: '18:00', activity: 'Recolección segura de témpanos para la coctelería nocturna.' }
    ]
  },
  { 
    day: 'Día 5', 
    title: 'Avistamiento de Cetáceos & Despedida', 
    description: 'Búsqueda activa y aproximación silenciosa para observar ballenas jorobadas y grupos de orcas patagónicas. Cena de gala final maridada con vinos de autor.',
    image: 'https://images.unsplash.com/photo-1568430460464-02e0b9b3e648?auto=format&fit=crop&w=400&q=80',
    duration: '6 horas',
    difficulty: 'Fácil',
    gastronomy: 'Cena de gala final de cinco tiempos con maridaje de viñedos de nicho.',
    activities: ['Fotografía de fauna marina', 'Uso de sonar e hidrófonos', 'Cena de gala y brindis de despedida'],
    schedule: [
      { time: '08:30', activity: 'Desayuno y preparación de equipos fotográficos.' },
      { time: '09:30', activity: 'Navegación de avistamiento asistido por sonar e hidrófonos.' },
      { time: '13:30', activity: 'Almuerzo ligero de mariscos en el deck de popa.' },
      { time: '19:30', activity: 'Cena de gala final y brindis de despedida en el salón principal.' }
    ]
  }
];

const getItinerary = (vessel: string): ItineraryStep[] => {
  const v = vessel.toLowerCase();
  if (v.includes('lodge')) return LODGE_ITINERARY;
  if (v.includes('velero') || v.includes('sailing')) return SAILING_ITINERARY;
  return YACHT_ITINERARY;
};

export const ExpedicionesPage: React.FC<ExpedicionesPageProps> = ({ onNavigate: _onNavigate }) => {
  const [downloadEmail, setDownloadEmail] = useState('');
  const [downloadSent, setDownloadSent] = useState(false);
  const [selectedExpedition, setSelectedExpedition] = useState<Expedition | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState<number>(0);

  const currentItinerary = selectedExpedition ? getItinerary(selectedExpedition.vessel) : [];
  const activeStep = selectedExpedition && currentItinerary.length > 0 ? (currentItinerary[activeDayIdx] || currentItinerary[0]) : null;
  const leftBgImage = selectedExpedition ? (activeStep ? activeStep.image : selectedExpedition.image) : '';

  const handleBrochureDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadEmail) return;
    setDownloadSent(true);
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = '#';
      link.setAttribute('download', 'YatesChile_Brochure_2026.pdf');
      document.body.appendChild(link);
    }, 500);
  };

  const handleBookWhatsApp = (exp: Expedition) => {
    const text = encodeURIComponent(
      `Hola, estoy interesado en reservar la expedición:\n\n` +
      `• Travesía: ${exp.name}\n` +
      `• Fechas: ${exp.startDate} → ${exp.endDate}\n` +
      `• Base/Embarcación: ${exp.vessel}\n\n` +
      `Solicito información de disponibilidad y valores de reserva.`
    );
    window.open(`https://wa.me/56981312920?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-0 bg-white">
      
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-400/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-4 h-4 text-blue-400" />
            <span>Itinerarios de Navegación Austral</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Expediciones & Rutas Marítimas
          </h1>
          <p className="max-w-2xl mx-auto text-slate-350 text-base sm:text-lg">
            Descubra nuestras travesías disponibles para reserva inmediata. Explore las rutas del calendario y consulte por su cupo a bordo.
          </p>
        </div>
      </section>

      {/* Grid of Expeditions */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">
              Salidas Programadas 2026/2027
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-900">
              Seleccione su Travesía
            </h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">
              Haga clic en cualquier tarjeta para ver el itinerario completo detallado día a día y coordinar su reserva con nuestro concierge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EXPEDITIONS.map((exp) => (
              <div
                key={exp.id}
                onClick={() => {
                  setSelectedExpedition(exp);
                  setActiveDayIdx(0);
                }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                {/* Image & Vessel Tag */}
                <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={exp.image}
                    alt={exp.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-slate-900/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                    {exp.vessel}
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {exp.spotsLeft === 'completo' && (
                      <span className="bg-red-500/90 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-red-400/20 backdrop-blur-sm">
                        Completo
                      </span>
                    )}
                    {exp.spotsLeft === 'bloqueado' && (
                      <span className="bg-slate-700/90 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-500/20 backdrop-blur-sm">
                        Bloqueado
                      </span>
                    )}
                    {typeof exp.spotsLeft === 'number' && exp.spotsLeft === 1 && (
                      <span className="bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-400/20 animate-pulse shadow-sm">
                        ¡Último cupo!
                      </span>
                    )}
                    {typeof exp.spotsLeft === 'number' && exp.spotsLeft > 1 && (
                      <span className="bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {exp.spotsLeft} cupos
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-blue-900 font-mono text-[10px] font-bold tracking-wider uppercase">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{exp.startDate} al {exp.endDate}</span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-950 transition-colors">
                      {exp.name}
                    </h3>

                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed font-light">
                      {exp.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-blue-900" />
                      <span className="truncate max-w-[140px]">{exp.location}</span>
                    </div>
                    
                    <span className="text-blue-900 font-bold text-xs uppercase tracking-wider group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Ver Itinerario ➔
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Large Itinerary Popup Modal */}
      {selectedExpedition && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[90vh] md:h-[80vh] flex flex-col md:flex-row relative text-slate-800 animate-[scaleIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedExpedition(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-950 transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center z-40 bg-white/80 backdrop-blur-md rounded-full shadow-sm"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: Cover & Quick Stats */}
            <div className="relative w-full md:w-[38%] text-white p-6 sm:p-8 flex flex-col justify-between overflow-hidden min-h-[240px] md:min-h-auto shrink-0">
              <img
                src={leftBgImage}
                alt={selectedExpedition.name}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />

              <div className="relative z-10 space-y-4">
                <span className="text-[10px] uppercase tracking-widest text-slate-350 font-mono block font-bold">
                  Expedición Yates Chile
                </span>
                <div className="space-y-2">
                  <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white leading-tight">
                    {selectedExpedition.name}
                  </h2>
                  <div className="flex items-center gap-1.5 text-slate-350 text-xs">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span>{selectedExpedition.location}</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3.5 space-y-3 font-mono text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span>Zarpe / Estadía:</span>
                    <span className="font-bold text-white">{selectedExpedition.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retorno:</span>
                    <span className="font-bold text-white">{selectedExpedition.endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Embarcación:</span>
                    <span className="font-bold text-white">{selectedExpedition.vessel}</span>
                  </div>
                  {selectedExpedition.tempEstimate && (
                    <div className="flex justify-between">
                      <span>Temp. Estimada:</span>
                      <span className="font-bold text-white">{selectedExpedition.tempEstimate}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative z-10 pt-6 border-t border-white/10 space-y-4">
                {selectedExpedition.spotsLeft === 'completo' ? (
                  <button
                    disabled
                    className="w-full bg-slate-850 text-slate-500 font-bold py-3 rounded-xl text-xs cursor-not-allowed border border-white/5"
                  >
                    Reserva Completada
                  </button>
                ) : selectedExpedition.spotsLeft === 'bloqueado' ? (
                  <button
                    disabled
                    className="w-full bg-slate-850 text-slate-500 font-bold py-3 rounded-xl text-xs cursor-not-allowed border border-white/5"
                  >
                    Bloqueado por Misión
                  </button>
                ) : (
                  <button
                    onClick={() => handleBookWhatsApp(selectedExpedition)}
                    className="w-full bg-white hover:bg-slate-100 text-slate-950 font-bold py-3 rounded-xl transition text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Reservar Cupo Concierge</span>
                    <ArrowRight className="w-4 h-4 text-slate-900" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Detailed Itinerary Day-by-Day */}
            <div className="w-full md:w-[62%] p-6 sm:p-8 flex flex-col justify-between overflow-hidden h-full">
              <div className="space-y-4 flex-1 flex flex-col overflow-hidden h-full">
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-blue-800 animate-pulse" />
                    <span>Bitácora Oficial de Viaje</span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-slate-900 leading-snug">
                    Itinerario Sugerido Día a Día
                  </h3>
                </div>

                {/* Tabs Bar with Navigation Arrows */}
                <div className="flex items-center gap-3 py-1.5 border-b border-slate-100 shrink-0 select-none">
                  {/* Prev Day Button */}
                  <button
                    onClick={() => setActiveDayIdx(prev => Math.max(0, prev - 1))}
                    disabled={activeDayIdx === 0}
                    className={`p-2 rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm ${
                      activeDayIdx === 0
                        ? 'text-slate-300 border-slate-100 bg-slate-50/50 cursor-not-allowed opacity-50'
                        : 'text-blue-900 border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 hover:scale-105 active:scale-95'
                    }`}
                    title="Día anterior"
                    aria-label="Día anterior"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 font-bold" />
                  </button>

                  {/* Day Tabs */}
                  <div className="flex flex-wrap gap-1.5 flex-1 items-center justify-start">
                    {currentItinerary.map((step, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveDayIdx(idx)}
                        onMouseEnter={() => setActiveDayIdx(idx)}
                        className={`px-3 py-1.5 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                          activeDayIdx === idx
                            ? 'bg-blue-900 text-white border-blue-900 shadow-md scale-[1.02]'
                            : 'bg-slate-50 text-slate-500 border-slate-205 hover:bg-slate-100 hover:text-slate-800 hover:scale-[1.01]'
                        }`}
                      >
                        {step.day}
                      </button>
                    ))}
                  </div>

                  {/* Next Day Button */}
                  <button
                    onClick={() => setActiveDayIdx(prev => Math.min(currentItinerary.length - 1, prev + 1))}
                    disabled={activeDayIdx === currentItinerary.length - 1}
                    className={`p-2 rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm ${
                      activeDayIdx === currentItinerary.length - 1
                        ? 'text-slate-300 border-slate-100 bg-slate-50/50 cursor-not-allowed opacity-50'
                        : 'text-blue-900 border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 hover:scale-105 active:scale-95'
                    }`}
                    title="Día siguiente"
                    aria-label="Día siguiente"
                  >
                    <ChevronRight className="w-3.5 h-3.5 font-bold" />
                  </button>
                </div>

                {/* Active Day Detail */}
                {activeStep && (
                  <div key={activeDayIdx} className="flex-1 flex flex-col text-left py-4 px-2 space-y-5 animate-[fadeIn_0.3s_ease-out] min-h-0 overflow-y-auto pr-1">
                    <div className="space-y-1 shrink-0">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-blue-900 uppercase block">
                        {activeStep.day} — Programación Detallada
                      </span>
                      <h4 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 leading-tight">
                        {activeStep.title}
                      </h4>
                    </div>
                    
                    <p className="text-slate-600 text-sm leading-relaxed font-light shrink-0">
                      {activeStep.description}
                    </p>

                    {/* Metadata Grid with Icons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs shrink-0">
                      <div className="flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-blue-900 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-slate-450 font-mono text-[9px] uppercase tracking-wider block font-bold">Duración</span>
                          <span className="font-semibold text-slate-800">{activeStep.duration || 'Variable'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Activity className="w-4 h-4 text-blue-900 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-slate-450 font-mono text-[9px] uppercase tracking-wider block font-bold">Dificultad</span>
                          <span className="font-semibold text-slate-800">{activeStep.difficulty || 'Moderada'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 sm:col-span-2 border-t border-slate-200/60 pt-2.5">
                        <Utensils className="w-4 h-4 text-blue-900 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-slate-450 font-mono text-[9px] uppercase tracking-wider block font-bold">Experiencia Gastronómica</span>
                          <span className="font-semibold text-slate-800">{activeStep.gastronomy || 'Menú a bordo'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Table */}
                    {activeStep.schedule && activeStep.schedule.length > 0 && (
                      <div className="space-y-2 shrink-0">
                        <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase block">
                          Cronograma del Día
                        </span>
                        <div className="overflow-hidden border border-slate-100 rounded-xl shadow-sm">
                          <table className="w-full text-xs text-left border-collapse bg-white">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-150">
                                <th className="px-3 py-2 font-mono font-bold text-slate-500 uppercase text-[9px] w-20">Horario</th>
                                <th className="px-3 py-2 font-semibold text-slate-700">Actividad</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeStep.schedule.map((item, index) => (
                                <tr key={index} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50">
                                  <td className="px-3 py-2 font-mono font-bold text-blue-900">{item.time}</td>
                                  <td className="px-3 py-2 text-slate-655 font-light">{item.activity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Highlights Bullet List */}
                    {activeStep.activities && activeStep.activities.length > 0 && (
                      <div className="space-y-2 shrink-0">
                        <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase block">
                          Hitos & Equipamiento
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activeStep.activities.map((act, index) => (
                            <li key={index} className="flex items-center gap-2 text-xs text-slate-655 font-light">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Instant PDF Brochure Download Banner */}
      <section className="py-16 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-14 h-14 bg-blue-400/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-400/30">
            <Download className="w-7 h-7" />
          </div>

          <h3 className="font-serif text-3xl font-bold text-white">
            Descargue el Brochure Oficial de Expediciones 2026/2027
          </h3>
          <p className="text-slate-350 text-sm max-w-xl mx-auto leading-relaxed">
            Obtenga en formato PDF el detalle completo de itinerarios, mapas de profundidad, menú gastronómico y equipamiento de seguridad de la flota.
          </p>

          {!downloadSent ? (
            <form onSubmit={handleBrochureDownload} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Ingrese su correo electrónico"
                value={downloadEmail}
                onChange={(e) => setDownloadEmail(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-400 focus:outline-none min-h-[48px]"
              />
              <button
                type="submit"
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-xl transition text-sm min-h-[48px] shrink-0 cursor-pointer"
              >
                Descargar Brochure PDF
              </button>
            </form>
          ) : (
            <div className="bg-emerald-500/20 text-emerald-300 p-4 rounded-xl border border-emerald-400/40 inline-flex items-center gap-2 text-sm font-semibold">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Brochure despachado con éxito a su correo. ¡Descarga iniciada!</span>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};
