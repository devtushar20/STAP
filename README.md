# STAP – AI-Powered Recruitment Platform (Next.js Frontend)

> **Hire smarter. Build better teams.**  
> Production-ready Next.js (App Router) frontend for STAP, pixel-identical to the original design system with an accessible, high-performance architecture.

---

## 🏗️ Architecture Overview

The frontend is built with **Next.js (App Router)**, **React 19**, **TypeScript (strict)**, and **Tailwind CSS**. It communicates with a separate **Python FastAPI backend** (LangChain, LangGraph, CrewAI, ChromaDB) via dedicated HTTP route handlers.

**Important:** No AI, agent, or database logic exists inside this frontend. The frontend communicates strictly via HTTP API calls through Next.js proxy route handlers, shielding backend endpoints and handling graceful fallbacks when the backend service is offline.

```
stap2/
├── app/
│   ├── layout.tsx                     # Fonts, metadata, theme provider, inline anti-FOUC script
│   ├── page.tsx                       # Landing page composed from modular components
│   ├── sitemap.ts                     # Dynamic XML sitemap
│   ├── robots.ts                      # Robots.txt directives
│   ├── icon.svg                       # STAP brand favicon
│   ├── dashboard/
│   │   └── page.tsx                   # Command Center real route with live fetch & fallbacks
│   └── api/                           # Route handlers proxying to Python FastAPI backend
│       ├── demo/route.ts              # POST /api/demo -> POST {BACKEND_URL}/demo-requests
│       ├── auth/login/route.ts        # POST /api/auth/login -> POST {BACKEND_URL}/auth/login
│       └── dashboard/
│           ├── summary/route.ts       # GET /api/dashboard/summary -> {BACKEND_URL}/dashboard/summary
│           ├── pipeline/route.ts      # GET /api/dashboard/pipeline -> {BACKEND_URL}/dashboard/pipeline
│           ├── agents/route.ts        # GET /api/dashboard/agents -> {BACKEND_URL}/dashboard/agents
│           └── candidates/route.ts    # GET /api/dashboard/candidates -> {BACKEND_URL}/dashboard/candidates
├── components/
│   ├── landing/                       # One component per landing section
│   │   ├── Nav.tsx                    # Sticky nav, smooth scroll, intersection observer, hamburger
│   │   ├── Hero.tsx                   # Tag, hero title, priority WebP hero image, trust badges
│   │   ├── Problem.tsx                # Problem cards grid
│   │   ├── Pipeline.tsx               # 7-step candidate pipeline with arrows
│   │   ├── Solution.tsx               # 6-step solution workflow overview
│   │   ├── Agents.tsx                 # 6 specialized agents diagram with dashed connectors
│   │   ├── CommandCenter.tsx          # Interactive command center preview
│   │   ├── Pricing.tsx                # 3-tier pricing cards
│   │   ├── CtaBand.tsx                # Pink CTA banner with robot high-five illustration
│   │   ├── Footer.tsx                 # Footer notice
│   │   ├── DemoModal.tsx              # Accessible "Book a Demo" / "Talk to Sales" modal
│   │   └── LoginModal.tsx             # Accessible "Log in" modal
│   └── ui/                            # Reusable primitives
│       ├── Button.tsx                 # Button with hard offset-shadow variants
│       ├── Modal.tsx                  # Accessible modal with focus trap and Esc restore
│       ├── ThemeToggle.tsx            # Theme toggle (Light/Dark)
│       ├── FormField.tsx              # Accessible form fields with aria-live error messaging
│       └── ScrollProgressAndBackToTop.tsx # Scroll progress bar and back-to-top button
├── lib/
│   ├── api.ts                         # Typed fetch wrapper with AbortController timeout & error handling
│   ├── constants.ts                   # All copy, agent data, pipeline data, mock stats
│   ├── types.ts                       # Complete TypeScript definitions for all data & API contracts
│   └── validators.ts                  # Zod schemas for form validation
├── public/assets/                     # Optimized images and icons
├── styles/
│   └── globals.css                    # CSS variables, 28px grid, and dark theme invert filters
├── .env.example                       # Environment variable template
├── tailwind.config.ts                 # Tailwind configuration with design tokens
├── tsconfig.json                      # Strict TypeScript compiler options
└── package.json                       # Dependencies and scripts
```

---

## 🎨 Design System

- **Colors:**
  - Background: `#f7f5f0` (Light) / `#121411` (Dark)
  - Card: `#ffffff` (Light) / `#1b1d19` (Dark)
  - Ink: `#111111` (Light) / `#f2f1ec` (Dark)
  - Green Accent: `#16C24A`
  - Pink Accent: `#F0559A`
  - CTA Band: `#F8439A`
- **Typography:**
  - `Pixelify Sans`: Headings (`h1`, `h2`, `.px`), logo, price numbers
  - `Inter`: Body typography, UI labels, buttons
  - `JetBrains Mono`: Section tags (`.tag`) and numerical counters
  - `Caveat`: Handwritten sticky notes (`.note`)
- **Theme Mechanism:**
  - `data-theme="light"` or `data-theme="dark"` attribute on `<html>`.
  - Stored in `localStorage` key `"stap-theme"`.
  - Default: System preference (`prefers-color-scheme: dark`).
  - Flash-of-unstyled-theme (FOUC) prevented via an inline script in `app/layout.tsx`.
  - `.inv` icons automatically inverted via `filter: invert(1) hue-rotate(180deg)` in dark mode.

---

## 🔌 API Layer Contract Table

All frontend requests route through Next.js Route Handlers (`app/api/`) which proxy to the backend (`BACKEND_URL`). When the backend is offline, the handlers provide instant mock fallbacks so the application remains fully functional during frontend development.

| Frontend Endpoint | Method | Backend Target | Description & Payload |
|---|---|---|---|
| `/api/demo` | `POST` | `{BACKEND_URL}/demo-requests` | Book a Demo / Talk to Sales (`name`, `email`, `company`, `team_size`, `message`) |
| `/api/auth/login` | `POST` | `{BACKEND_URL}/auth/login` | Recruiter login (`email`, `password`) |
| `/api/dashboard/summary` | `GET` | `{BACKEND_URL}/dashboard/summary` | Top summary KPIs (`jobs`, `candidates`, `shortlisted`, `interviews`) |
| `/api/dashboard/pipeline` | `GET` | `{BACKEND_URL}/dashboard/pipeline` | Pipeline distribution (`applied`, `screening`, `interview`, `evaluation`, `offer`) |
| `/api/dashboard/agents` | `GET` | `{BACKEND_URL}/dashboard/agents` | Activity states for the 6 specialized AI agents |
| `/api/dashboard/candidates` | `GET` | `{BACKEND_URL}/dashboard/candidates?limit=4` | Top candidate rankings (`name`, `role`, `matchPercentage`) |

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Canonical origin for Open Graph and metadata |
| `BACKEND_URL` | `http://localhost:8000` | Address of the Python FastAPI AI backend service (server-side only) |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.  
Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the live Command Center route.

### 3. Build for Production
```bash
npm run build
npm run start
```

### 4. Code Quality & Linting
```bash
npm run lint           # Check ESLint rules
npm run format         # Format with Prettier
npm run format:check   # Verify formatting
```

---

## ♿ Accessibility & Quality Standards

- **Accessible Modals:** Full focus trapping (Tab / Shift+Tab cycling), Escape key dismissal, `aria-modal="true"`, and automatic focus restoration upon closing.
- **Form Validation:** Client-side and server-side validation using `zod`, with inline errors announced via `aria-live="polite"`.
- **Smooth Navigation:** Hash-based anchor navigation with `IntersectionObserver` active section indicators and `aria-current="true"`.
- **Motion Accessibility:** Complete `prefers-reduced-motion` support across all CSS transitions, animations, smooth scrolling, and the progress bar.
- **Image Optimization:** All illustrations and icons use `next/image` with explicit dimensions, lazy-loading below the fold, and priority preloading on the hero image.
