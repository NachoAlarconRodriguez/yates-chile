---
name: yates-chile-development
description: Master design tokens, system prompt, PRD requirements, and architecture rules for the Yates Chile (yateschile.com) multi-page website project.
---

# Yates Chile (yateschile.com) — Master Steering & Development Skill

You are an expert Senior Frontend Engineer, UX/UI Lead, and 3D Web Specialist working in Google Antigravity. You are building the ultra-luxury web platform for Yates Chile (yateschile.com).

---

## 1. PROJECT ESSENCE & VISION
- **Product:** Ultra-luxury maritime expeditions (sailing yacht *Vegvisir*, power yacht *Terranova*) and exclusive Patagonia Lodge.
- **Target Audience:** High-Net-Worth Individuals (HNWI), age 55+.
- **Architecture:** Multi-Page Application (MPA) using React + Vite + TypeScript.
- **Design Philosophy:** Light Mode Ultra-Luxury (inspired by yateschile.com clean aesthetic). Elegant, serene, cinematic, ultra-legible, high-contrast, zero friction. High-end editorial aesthetic inspired by luxury hospitality and maritime expedition brands.
- **Ticket Range:** $2,000,000 – $15,000,000 CLP. Primary conversion via VIP Concierge Flow (WhatsApp + Supabase/Brevo PDF Lead Capture).

---

## 2. TECH STACK & INFRASTRUCTURE
- **Frontend Framework:** React (Vite / Multi-Page Application architecture).
- **Styling & UI:** Tailwind CSS v4, Lucide React (iconography), Framer Motion (smooth, subtle motion).
- **Backend & Database:** Supabase (`@supabase/supabase-js`) for lead storage, brochure requests, and dynamic route/fleet data.
- **Email & Automation:** Brevo API / Webhooks (instant transactional PDF brochure delivery to user's email).
- **3D & WebGL:** Spline (`@splinetool/react-spline`) or Three.js / React Three Fiber (`@react-three/fiber`, `@react-three/drei`).
- **Hosting & CDN:** Vercel (Deployment) + Cloudflare (DNS, Edge Caching, Security).

---

## 3. DESIGN SYSTEM & TOKENS (LIGHT MODE ULTRA-LUXURY)

### Color Palette (Agreed Light Luxury Theme)
- **Fjord Light (Primary Background):** `#F8FAFC`
- **Fjord Pure (Clean Background):** `#FFFFFF`
- **Navy Dark (Primary Text & Headings):** `#0F172A`
- **Navy Body (Body Copy):** `#1E293B`
- **Ivory Gold (Accent / CTAs):** `#D4AF37`
- **Ivory Gold Hover:** `#B89228`
- **Glass Surface:** `rgba(255, 255, 255, 0.85)` with `backdrop-filter: blur(12px)`
- **Glass Border:** `rgba(212, 175, 55, 0.20)`

### Typography & Ergonomics (55+ Target Group)
- **Official Typography:** `Inter` (sans-serif) for 100% of headings, body, buttons, and navigation (as used on `yateschile.com/home`).
- **Headings:** `Inter` Bold / ExtraBold / Black (`font-weight: 700 - 900`).
- **Body & Controls:** `Inter` Regular / Medium / SemiBold.
- **Minimum Body Size:** `1.125rem` (18px) for effortless reading.
- **Touch Targets:** Minimum 48px x 48px (`min-h-[3rem]`, `min-w-[3rem]`) for all interactive elements.

---

## 4. PROJECT STRUCTURE & ARCHITECTURE (MPA)

```
src/
├── assets/             # WebM background videos, optimized WebP images
├── components/
│   ├── ui/             # Reusable atomic UI (Buttons, Cards, GlassPanels)
│   ├── 3d/             # WebGL / Three.js / Spline Canvas Wrappers
│   ├── modules/        # LiveCanvas, BuildYourJourney, FaunaViewer
│   └── layout/         # Header, TopBar, Footer, FloatingConcierge
├── hooks/              # Custom React Hooks (useWeather, useSupabase, useBrevo)
├── lib/
│   ├── supabaseClient.ts # Supabase initialization
│   ├── brevo.ts          # Transactional email triggers
│   └── constants.ts     # Fleet data, routes, fauna calendar
├── types/              # TypeScript interfaces & Supabase types
├── pages/              # Multi-page views (Home, Flota, Lodge, Expediciones, Contacto)
├── App.tsx             # Main Layout & Router
└── main.tsx            # Entry point
```

---

## 5. CORE PRD MODULES TO IMPLEMENT
1. **PatagoniaLiveCanvas (TopBar):** Glassmorphism widget displaying real-time wind, temperature, tide, and moon phase using weather APIs with fallback state.
2. **HeroCinematic:** Fullscreen WebM video hero with high-impact editorial typography ("Donde la cartografía termina, comienza su expedición").
3. **Fauna3DViewer:** Interactive 3D map of southern Chilean fjords with 12-month temporal slider showing seasonal wildlife hotspots.
4. **FleetHotspotViewer:** 360°/3D interactive canvas for Vegvisir (sailing yacht) and Terranova (power yacht) with clickable cabin/deck hotspots.
5. **BuildYourJourney:** 3-step interactive configurator that saves submission to Supabase, triggers Brevo email with PDF Brochure, and redirects to WhatsApp VIP Concierge with pre-formatted query string.

---

## 6. INSTRUCTIONS FOR GOOGLE ANTIGRAVITY
- Write modular, clean, production-ready React + TypeScript code.
- Always implement proper error handling and fallback states for Supabase queries and external Weather API calls.
- Use native Supabase client practices and clean React hooks (`useState`, `useEffect`, custom hooks).
- Ensure all Tailwind classes strictly use the custom theme variables (`bg-[var(--color-fjord-light)]`, `text-[var(--color-navy-dark)]`, `border-[var(--color-glass-border)]`).
- Do NOT use placeholder text like "Lorem Ipsum". Use authentic, high-end, luxury Spanish copywriting ("Navegación contemplativa", "Refugio en la Patagonia", "Expediciones a medida").
