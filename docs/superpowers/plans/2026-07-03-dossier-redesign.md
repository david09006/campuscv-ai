# Dossier Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace CampusCV AI's entire visual identity with the approved "Dossier" editorial design (warm paper, ink, forest-green accent, Fraunces + IBM Plex Sans) across all app chrome, preserving every piece of existing functionality.

**Architecture:** Tokens land first in `src/index.css` (semantic CSS variables flipped by `.dark`, mapped into Tailwind 4 `@theme` so utilities like `bg-surface`/`text-ink` exist). Component files are then rewritten className-by-className against those tokens — Landing, ResumeBuilder chrome, and JobBoard are independent and may run as parallel subagents after Tasks 1–2. A consistency audit and full visual verification close it out.

**Tech Stack:** React 19, Vite 6, Tailwind CSS 4 (CSS-first `@theme`), Framer Motion (`motion/react`), lucide-react, Express dev server (`npm run dev`, serves Vite middleware).

**Spec:** `docs/superpowers/specs/2026-07-03-dossier-redesign-design.md` (read it before starting any task).

## Global Constraints

Every task implicitly includes all of these. Violating any is grounds for rejection.

**Hard rules**
- Visual/UX changes only: no changes to state logic, handlers, fetch/API calls, OAuth flow, PDF export, i18n keys/values, routing, or server code. JSX structure may change; behavior may not.
- The 10 CV export template components (`ResumeBuilder.tsx`, `ModernTemplate` through `RetroTemplate`, lines ~780–end) and the `.cv-page` A4 sizing are **untouched** (the `.cv-page` border/shadow chrome is restyled in CSS only).
- No new npm dependencies. `npm run lint` (tsc) and `npm run build` must pass at every commit.
- Banned in app chrome: gradients as decoration, glassmorphism/backdrop-blur, blurred blobs, emoji in headings/UI, `font-black`, colored/glow shadows, `rounded-2xl`+ radii, raw Tailwind default-palette colors (`gray-*`, `blue-*`, `primary-*`, `emerald-*`, `violet-*`, `amber-*`, `red-*`, `rose-*`, `slate-*`…). Exceptions: LinkedIn brand blue `#0a66c2` on LinkedIn login buttons; the untouched CV templates; the CV-document color swatches in the customize panel (they color the exported CV, not the app).
- Keep `isDarkMode` props/signatures as-is (templates consume them), but new chrome styling must come from semantic tokens (which auto-flip under `.dark`) — do not write new `isDarkMode ? ... : ...` style ternaries; delete the old ones as you restyle.
- Every interactive element: hover, `focus-visible` (2px accent outline, offset 2), active, disabled states; ≥44px touch target (`h-11` for buttons/inputs); `cursor-pointer`.
- Motion: 150–250ms, ease-out, transform/opacity only. Entrance animations subtle (opacity + ≤12px translate). No scale-on-hover gimmicks (whileTap scale 0.98 max is fine).

**Token recipe card** (available after Task 1 — use these exact utilities)

| Element | Classes |
|---|---|
| Page background | `bg-background text-ink` |
| Card | `bg-surface border border-border rounded-card shadow-card` |
| Large panel | `rounded-panel` |
| Hairline divider | `border-border` |
| Display heading (H1/H2) | `font-display font-medium tracking-tight text-ink` (weights 400–600 only) |
| Eyebrow/section label | `text-xs font-medium uppercase tracking-[0.08em] text-muted` |
| Body text | `text-ink` / secondary `text-muted`, `leading-relaxed` |
| Primary button | `inline-flex items-center justify-center gap-2 h-11 px-6 rounded-control bg-accent text-accent-contrast text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px disabled:opacity-50 disabled:pointer-events-none` |
| Secondary button | same layout classes + `border border-border bg-surface text-ink hover:border-accent hover:text-accent` |
| Ghost/text button | `text-muted hover:text-ink transition-colors` |
| Input | `w-full h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25` |
| Form label | `text-xs font-medium uppercase tracking-[0.08em] text-muted` (visible, above field) |
| Badge (neutral) | `inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted` |
| Badge (accent) | swap to `border-accent/30 bg-accent-tint text-accent` |
| Badge (clay) | swap to `border-clay/30 bg-clay-tint text-clay-text` |
| Icon chip | `flex h-10 w-10 items-center justify-center rounded-card bg-accent-tint text-accent` (clay variant: `bg-clay-tint text-clay-text`) |
| Error banner | `flex items-start gap-2 rounded-card border border-destructive/30 bg-destructive-tint p-3 text-sm text-destructive` |
| Hover-elevate card | add `transition-all duration-200 hover:border-accent/40 hover:shadow-hover` |

Token color values (already WCAG-AA verified — do not tweak):

| Token | Light | Dark |
|---|---|---|
| background | `#FAF6EF` | `#171310` |
| surface | `#FFFFFF` | `#211C17` |
| ink | `#1C1917` | `#F3EDE2` |
| muted | `#6B6255` | `#B8ADA0` |
| border | `#E7DFD1` | `#33291F` |
| accent | `#1F4D3A` | `#5A9A7B` |
| accent-hover | `#163A2C` | `#6FAE8F` |
| accent-contrast | `#FFFFFF` | `#0E1B15` |
| accent-tint | `#EAF1ED` | `#22352B` |
| clay | `#B5563C` | `#D97B5F` |
| clay-text | `#9C4A33` | `#D97B5F` |
| clay-tint | `#F6E8E2` | `#3A281F` |
| destructive | `#B3261E` | `#E5786E` |
| destructive-tint | `#F9E7E5` | `#3B211E` |

Contrast facts (for reference): muted-on-paper 5.6:1, accent-on-paper 8.9:1, white-on-accent 9.6:1, dark accent-on-surface 5.1:1, clay-text-on-paper 5.7:1. `clay` (raw) is fills/icons only, never body text on paper — use `clay-text` for text.

---

### Task 1: Design tokens, fonts, and base CSS

**Files:**
- Modify: `src/index.css` (full rewrite, content below)

**Interfaces:**
- Produces: Tailwind utilities `bg-background/surface/accent/accent-hover/accent-tint/clay/clay-tint/destructive/destructive-tint`, `text-ink/muted/accent/accent-contrast/clay-text/destructive`, `border-border`, `rounded-control/card/panel`, `shadow-card/hover/overlay/page`, `font-display/sans/mono`; class-based `dark:` variant; `.gradient-text` (kept — i18n hero HTML references it), `.cv-page`, `.custom-scrollbar`. Utilities `.glass`, `.glass-card`, `.grid-bg` and all `--primary-*`/`.theme-*` blocks are **deleted** (`grid-bg` is still referenced by Landing/ResumeBuilder/JobBoard until Tasks 3–5 remove it; an unknown class is harmless in the interim).

- [ ] **Step 1: Replace `src/index.css` entirely with:**

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

/* Dark mode follows the .dark class App.tsx puts on <html>, not the OS setting */
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --font-sans: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Fraunces", Georgia, "Times New Roman", serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;

  /* Dossier semantic tokens — values flip under .dark via the vars below */
  --color-background: var(--dossier-background);
  --color-surface: var(--dossier-surface);
  --color-ink: var(--dossier-ink);
  --color-muted: var(--dossier-muted);
  --color-border: var(--dossier-border);
  --color-accent: var(--dossier-accent);
  --color-accent-hover: var(--dossier-accent-hover);
  --color-accent-contrast: var(--dossier-accent-contrast);
  --color-accent-tint: var(--dossier-accent-tint);
  --color-clay: var(--dossier-clay);
  --color-clay-text: var(--dossier-clay-text);
  --color-clay-tint: var(--dossier-clay-tint);
  --color-destructive: var(--dossier-destructive);
  --color-destructive-tint: var(--dossier-destructive-tint);

  --radius-control: 6px;
  --radius-card: 10px;
  --radius-panel: 14px;

  --shadow-card: 0 1px 2px rgba(28, 25, 23, 0.04);
  --shadow-hover: 0 4px 12px rgba(28, 25, 23, 0.08);
  --shadow-overlay: 0 8px 24px rgba(28, 25, 23, 0.12);
  --shadow-page: 0 2px 16px rgba(28, 25, 23, 0.07);

  /* Hex-forced Tailwind families kept ONLY for the untouched CV export
     templates + html2canvas capture (templates use gray/slate/emerald/rose/blue).
     App chrome must not use these. */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --color-gray-950: #030712;

  --color-slate-50: #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-200: #e2e8f0;
  --color-slate-300: #cbd5e1;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-600: #475569;
  --color-slate-700: #334155;
  --color-slate-800: #1e293b;
  --color-slate-900: #0f172a;

  --color-emerald-50: #ecfdf5;
  --color-emerald-100: #d1fae5;
  --color-emerald-200: #a7f3d0;
  --color-emerald-300: #6ee7b7;
  --color-emerald-400: #34d399;
  --color-emerald-500: #10b981;
  --color-emerald-600: #059669;
  --color-emerald-700: #047857;
  --color-emerald-800: #065f46;
  --color-emerald-900: #064e3b;

  --color-rose-50: #fff1f2;
  --color-rose-100: #ffe4e6;
  --color-rose-200: #fecdd3;
  --color-rose-300: #fda4af;
  --color-rose-400: #fb7185;
  --color-rose-500: #f43f5e;
  --color-rose-600: #e11d48;
  --color-rose-700: #be123c;
  --color-rose-800: #9f1239;
  --color-rose-900: #881337;

  --color-blue-50: #eff6ff;
  --color-blue-100: #dbeafe;
  --color-blue-200: #bfdbfe;
  --color-blue-300: #93c5fd;
  --color-blue-400: #60a5fa;
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;
  --color-blue-700: #1d4ed8;
  --color-blue-800: #1e40af;
  --color-blue-900: #1e3a8a;
}

@layer base {
  :root {
    color-scheme: light;
    --dossier-background: #FAF6EF;
    --dossier-surface: #FFFFFF;
    --dossier-ink: #1C1917;
    --dossier-muted: #6B6255;
    --dossier-border: #E7DFD1;
    --dossier-accent: #1F4D3A;
    --dossier-accent-hover: #163A2C;
    --dossier-accent-contrast: #FFFFFF;
    --dossier-accent-tint: #EAF1ED;
    --dossier-clay: #B5563C;
    --dossier-clay-text: #9C4A33;
    --dossier-clay-tint: #F6E8E2;
    --dossier-destructive: #B3261E;
    --dossier-destructive-tint: #F9E7E5;
  }

  .dark {
    color-scheme: dark;
    --dossier-background: #171310;
    --dossier-surface: #211C17;
    --dossier-ink: #F3EDE2;
    --dossier-muted: #B8ADA0;
    --dossier-border: #33291F;
    --dossier-accent: #5A9A7B;
    --dossier-accent-hover: #6FAE8F;
    --dossier-accent-contrast: #0E1B15;
    --dossier-accent-tint: #22352B;
    --dossier-clay: #D97B5F;
    --dossier-clay-text: #D97B5F;
    --dossier-clay-tint: #3A281F;
    --dossier-destructive: #E5786E;
    --dossier-destructive-tint: #3B211E;
  }

  body {
    @apply font-sans bg-background text-ink antialiased;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

@layer utilities {
  /* Referenced from i18n heroTitle HTML in all 4 languages — keep the name.
     Renders the accent word as italic serif in forest green. */
  .gradient-text {
    @apply text-accent italic;
    font-family: var(--font-display);
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-border rounded-full;
  }
}

/* Global scrollbar styling — warm neutrals */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--dossier-border) transparent;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--dossier-border);
  border-radius: 20px;
  border: 2px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--dossier-muted);
  background-clip: content-box;
}

.cv-page {
  aspect-ratio: 1 / 1.414; /* A4 aspect ratio */
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid var(--dossier-border);
  box-shadow: var(--shadow-page);
  @apply bg-white dark:bg-gray-950 transition-colors duration-300;
}

@media print {
  .no-print { display: none !important; }
}
```

- [ ] **Step 2: Verify build and types**

Run: `cd "/Users/david/Desktop/CampusCV AI" && npm run lint && npm run build`
Expected: tsc clean, vite build succeeds. (The app will look broken/half-themed until Tasks 2–5 — expected; old `primary-*`/`theme-*` classes now resolve to nothing.)

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "Dossier tokens: fonts, semantic color system, radii/shadows, class-based dark variant"
```

---

### Task 2: App shell — header, nav, mobile menu, footer, profile stub (`App.tsx`)

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: Task 1 utilities (recipe card in Global Constraints).
- Produces: nothing other tasks import; but the shell's look (paper `bg-background` page, `bg-surface` header/footer with hairline borders) is the frame Tasks 3–5 render inside.

- [ ] **Step 1: Remove the palette-switcher feature**
  - Delete `appColorPalette` state, `changePalette`, the `localStorage.getItem('appPalette')` initializer, and the entire "Platform Theme Palette Selector" swatch `div` in the header.
  - Root `div` className becomes: `min-h-screen bg-background text-ink flex flex-col transition-colors duration-300` (drop `theme-${appColorPalette}` and the isDarkMode bg ternary — `.dark` on `<html>` plus tokens handle it).
  - Keep the `isDarkMode` state, effect, and toggle exactly as they work today.
  - Remove the `Palette` import from lucide if now unused (tsc will flag it).

- [ ] **Step 2: Restyle the header**
  - Header: `sticky top-0 z-50 h-16 flex items-center justify-between border-b border-border bg-surface px-4 md:px-8` — **no** backdrop-blur, no shadow.
  - Logo: delete the blue icon box. Wordmark: `<span className="font-display text-[21px] font-semibold tracking-tight text-ink">CampusCV<span className="text-accent">.</span></span>` (a period as the accent mark; drop the separate " AI" suffix styling — full wordmark reads "CampusCV." with green period). Keep the `onClick={() => setView('landing')}` and `cursor-pointer`.
  - Desktop nav buttons: `relative flex items-center gap-2 px-3 h-16 text-sm font-medium transition-colors cursor-pointer` + active `text-ink` / inactive `text-muted hover:text-ink`; active item additionally renders `<span className="absolute inset-x-3 bottom-0 h-0.5 bg-accent" />` (underline indicator). Keep icons at `size={16}`.
  - LinkedIn login button (logged-out): secondary-button recipe at `h-10 px-4 text-sm font-medium` keeping the `#0a66c2` LinkedIn icon color, label stays "Login". Drop `uppercase tracking-wide font-bold`.
  - Logged-in user chip: `flex items-center gap-2 rounded-control border border-border bg-surface px-2.5 py-1.5` with avatar `h-8 w-8 rounded-full bg-accent text-accent-contrast flex items-center justify-center text-sm font-semibold`; "Connected" label becomes eyebrow recipe; name `text-xs font-medium text-ink`.
  - Dark toggle: `flex h-10 w-10 items-center justify-center rounded-control text-muted transition-colors hover:bg-accent-tint hover:text-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent` — keep the motion.div rotate animation.
  - Language switcher: container `flex items-center gap-0.5 rounded-control border border-border bg-background p-0.5`; buttons `h-8 px-2.5 rounded-[4px] text-xs font-medium uppercase transition-colors cursor-pointer` + active `bg-surface text-ink shadow-card` / inactive `text-muted hover:text-ink`.
  - Notification bell: same shape as dark toggle; the red dot becomes `bg-clay` with `border-surface` ring.
  - "New CV" CTA: primary-button recipe, `h-10 px-5`, sentence-case label (i18n string as-is), keep `whileTap={{ scale: 0.98 }}` only (no whileHover scale, no -translate-y).
  - Mobile hamburger + mobile menu panel: panel `bg-surface border-b border-border shadow-overlay`, items `flex items-center gap-3 rounded-control p-3 text-base font-medium cursor-pointer` + active `bg-accent-tint text-accent` / inactive `text-muted hover:bg-background hover:text-ink`. Keep AnimatePresence enter/exit.

- [ ] **Step 3: Restyle main transition wrapper, profile stub, footer**
  - Keep the AnimatePresence page transition; simplify to `initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: 'easeOut' }}` (drop scale).
  - Profile stub empty state: centered column with `flex h-16 w-16 items-center justify-center rounded-full bg-accent-tint text-accent` icon circle (`<User size={28} />`), heading `font-display text-[26px] font-medium text-ink mt-5`, body `text-muted mt-2 max-w-sm` (keep existing i18n/EN strings).
  - Footer: `border-t border-border bg-surface py-10 px-4 md:px-8`, inner flex as today; wordmark same treatment as header at `text-base`; copy/links `text-sm text-muted`, links `hover:text-accent transition-colors`.

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: clean. Then `npm run dev` (background), open http://localhost:3000 — header/footer render in Dossier tokens, dark toggle flips the whole shell (verifies `@custom-variant dark` works), palette swatches gone, all 4 nav routes still switch views. Kill server.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "Dossier shell: editorial header/nav/footer, remove palette switcher"
```

---

### Task 3: Landing page (`Landing.tsx`) — parallel-safe with Tasks 4–5

**Files:**
- Modify: `src/components/Landing.tsx`

**Interfaces:**
- Consumes: Task 1 utilities; `onStart`, `lang`, `isDarkMode` props unchanged; `TRANSLATIONS[lang].landing` strings unchanged (hero/aiPower/ready titles arrive as HTML via `dangerouslySetInnerHTML` — keep those bindings; `.gradient-text` inside them is already restyled by Task 1).
- Produces: n/a.

- [ ] **Step 1: Hero section**
  - Section: `border-b border-border bg-surface px-4 md:px-8 py-16 md:py-28` — remove `grid-bg`, inset shadows, and all isDarkMode ternaries.
  - Keep the two-column grid (`max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center`).
  - Badge pill → eyebrow: `<p className="text-xs font-medium uppercase tracking-[0.08em] text-clay-text mb-6">` with the existing string, `<Zap size={14} />` removed (no icon needed; if kept, no `fill`).
  - H1: `font-display text-[42px] md:text-[56px] font-medium leading-[1.1] tracking-tight text-ink mb-6` — keep `dangerouslySetInnerHTML={{ __html: t.landing.heroTitle }}`.
  - Subhead: `text-lg md:text-[21px] text-muted leading-relaxed max-w-lg mb-10`.
  - Primary CTA: primary-button recipe at `h-12 px-7 text-base`, keep `<ArrowRight size={18} />` and `onClick={onStart}`.
  - LinkedIn button: secondary-button recipe at `h-12 px-7 text-base`, LinkedIn icon keeps `#0a66c2`. Keep its existing async onClick untouched.

- [ ] **Step 2: Rebuild the dashboard mockup panel flat**
  Keep the `hidden lg:block` motion.div (entrance `initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}`). Replace panel contents with a flat document-editor vignette built purely from tokens:
  - Outer: `rounded-panel border border-border bg-background shadow-card overflow-hidden aspect-[16/10] flex flex-col`.
  - Top bar: `h-11 border-b border-border bg-surface flex items-center justify-between px-5` — left: `<span className="font-display text-sm font-medium text-ink">Ana Popescu — CV</span>`; right: `<span className="text-xs font-medium uppercase tracking-[0.08em] text-accent">Draft saved</span>`. **No traffic-light dots.**
  - Body: `flex-1 grid grid-cols-12 bg-surface`. Left rail (`col-span-4 border-r border-border p-5 space-y-5 bg-background`): skeleton lines `h-2 rounded-full bg-border` at widths `w-24 (h-3 bg-accent)`, `w-full`, `w-2/3`; then a mini-card `rounded-card border border-border bg-surface p-3 space-y-2` with three `h-2 bg-border rounded-full` lines; then three skill chips using the neutral-badge recipe with text `React`, `UI Design`, `Node.js` at `text-[10px]`.
  - Right pane (`col-span-8 p-5 space-y-4`): an "AI suggestion" card `rounded-card border border-accent/30 bg-accent-tint p-4` containing `<Sparkles size={16} className="text-accent" />`, a `text-xs font-semibold text-accent` line reading `AI suggestion`, and two skeleton lines `h-2 bg-accent/20 rounded-full` (`w-full`, `w-3/4`); below it two side-by-side stat mini-cards `rounded-card border border-border bg-background p-3` each with an icon chip (`Star` clay variant, `Target` accent variant, both `size={16}`, chip at `h-8 w-8`) and one `h-2 w-1/2 bg-border rounded-full` line.

- [ ] **Step 3: Steps section**
  - Section: `bg-background px-4 md:px-8 py-24 md:py-32` (no grid-bg, no ternaries).
  - Header block: eyebrow `How it works` — reuse the existing `t.landing.howItWorksTitle` as H2 in `font-display text-[33px] md:text-[42px] font-medium tracking-tight text-ink`; desc `text-lg text-muted max-w-xl mt-4`. (No new i18n keys: skip a literal eyebrow if none exists — do NOT hardcode English. Use only existing strings.)
  - Delete `stepsData` colors: cards map over `t.landing.steps` with index. Card: `rounded-card border border-border bg-surface p-8 transition-all duration-200 hover:border-accent/40 hover:shadow-hover`. Numeral: `<span className="font-display text-[33px] font-medium text-clay-text">0{idx+1}</span>` followed by `<span className="mt-3 block h-px w-8 bg-border" />`; title `text-[18px] font-semibold text-ink mt-6 mb-2`; desc `text-sm text-muted leading-relaxed`. Keep whileInView stagger (`delay: idx * 0.06`, `y: 12`).

- [ ] **Step 4: Features section**
  - Section: `border-y border-border bg-surface px-4 md:px-8 py-24 md:py-32`.
  - Replace the giant Sparkles-on-green square with a flat "annotated CV document" illustration built from tokens: container `rounded-panel border border-border bg-background p-8 md:p-10` containing a nested faux-document `rounded-card border border-border bg-surface p-6 space-y-4 shadow-card` — inside: `h-3 w-32 bg-ink rounded-full` (name line), `h-2 w-24 bg-border rounded-full`, divider `h-px bg-border`, then 2 groups of three `h-2 bg-border rounded-full` lines (`w-full`, `w-full`, `w-2/3`) where one line in the second group is `bg-accent/30` with an adjacent floating note `absolute -right-3 rounded-control border border-accent/30 bg-accent-tint px-2.5 py-1 text-[10px] font-semibold text-accent` reading `Stronger verb →` (wrap document in `relative`). This shows the product (AI improving a CV line) rather than decoration.
  - H2 keeps `dangerouslySetInnerHTML` with `font-display text-[33px] md:text-[42px] font-medium tracking-tight text-ink leading-tight`.
  - `FeatureItem`: signature unchanged, but drop the `color` prop usage — all three call-sites pass no color; icon chip recipe `flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-accent-tint text-accent` (`<Icon size={20} />`); title `text-[18px] font-semibold text-ink mb-1.5`; desc `text-muted leading-relaxed text-[15px]`. Remove hover:scale.

- [ ] **Step 5: Final CTA**
  - Section wrapper: `bg-background px-4 md:px-8 py-20 md:py-24`.
  - Panel: `max-w-7xl mx-auto rounded-panel bg-accent px-8 py-16 md:px-20 md:py-20 text-center` (dark mode auto-handles via token). H2 keeps `dangerouslySetInnerHTML`, `font-display text-[33px] md:text-[42px] font-medium tracking-tight text-accent-contrast leading-tight mb-5`; desc `text-accent-contrast/80 text-lg max-w-2xl mx-auto mb-10`; button `inline-flex h-12 items-center justify-center rounded-control bg-surface px-8 text-base font-semibold text-ink transition-colors hover:bg-background cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-contrast active:translate-y-px`.

- [ ] **Step 6: Verify + commit**

Run: `npm run lint && npm run build` — clean. Grep guard: `grep -nE "(bg|text|border)-(gray|blue|violet|emerald|amber|primary|red|rose)-" src/components/Landing.tsx` returns nothing. Also `grep -n "grid-bg\|isDarkMode ?" src/components/Landing.tsx` returns nothing (prop may stay in the signature).

```bash
git add src/components/Landing.tsx
git commit -m "Dossier landing: editorial hero, flat mockup, steps, features, CTA"
```

---

### Task 4: ResumeBuilder chrome (`ResumeBuilder.tsx` lines ~1–780 only) — parallel-safe with Tasks 3, 5

**Files:**
- Modify: `src/components/ResumeBuilder.tsx` (ONLY the wizard/preview chrome: main layout, steps 0–3 forms, footer nav, preview well, and helper components `InputField`, `SectionHeader`, any TextArea/select helpers. Everything from `// Templates` (~line 783) down is **forbidden to touch**.)

**Interfaces:**
- Consumes: Task 1 utilities. All state/handlers (`handleGenerateAI`, `exportToPDF`, `addItem`/`removeItem`/`updateItem`, step state) unchanged.
- Produces: n/a.

- [ ] **Step 1: Layout shell + step indicator**
  - Root: `flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-background text-ink` (drop ternaries).
  - Sidebar: `w-full lg:w-[450px] border-r border-border bg-surface flex flex-col h-full z-10` — no shadow.
  - Sidebar header: title `font-display text-[21px] font-medium text-ink`; step counter `text-sm text-muted`; reset button `flex h-10 w-10 items-center justify-center rounded-control text-muted transition-colors hover:bg-destructive-tint hover:text-destructive cursor-pointer` (keep title/behavior).
  - Step indicator: keep the 4 segments; done/current `bg-accent`, upcoming `bg-border`; the floating numbers `text-[10px] font-semibold`, current/done `text-accent`, upcoming `text-muted`. Additionally show current step *name*: under the bars add `<p className="px-6 pt-3 text-xs font-medium uppercase tracking-[0.08em] text-muted">{steps[currentStep].title}</p>` (uses existing i18n titles — satisfies "clear labels, not icon-only").

- [ ] **Step 2: Shared form helpers**
  - `InputField`: label = form-label recipe (icon `size={12}` in `text-accent`); input = input recipe (replace the whole ternary block). Keep name/value/onChange/placeholder wiring identical.
  - `SectionHeader`: icon chip `flex h-8 w-8 items-center justify-center rounded-control bg-accent-tint text-accent` (remove the rotate-on-hover); title `text-sm font-semibold text-ink` (drop `font-black uppercase`); if an add button exists in it: secondary-button recipe at `h-9 px-3 text-xs gap-1.5`.
  - Any `<textarea>`/`<select>` in the wizard: same input recipe with `h-auto py-2.5` for textareas.
  - "Add item" buttons (`Plus` rows) throughout steps 1–2: `flex w-full items-center justify-center gap-2 rounded-card border border-dashed border-border py-3.5 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent cursor-pointer`.
  - Delete-item buttons: `text-muted hover:text-destructive transition-colors cursor-pointer` with `h-9 w-9 flex items-center justify-center rounded-control hover:bg-destructive-tint`.
  - Item cards (each education/experience/project entry): `rounded-card border border-border bg-background p-4 space-y-3`.
  - **Empty states** for education/experience/projects/languages when the list is empty (add if a bare gap exists today): `rounded-card border border-dashed border-border px-4 py-8 text-center` containing the section's lucide icon at `size={20}` in `text-muted/60 mx-auto`, and a `text-sm text-muted mt-2` line reusing the section's existing add-button label string (do not invent new i18n keys).

- [ ] **Step 3: Step 3 (Finalize) panel**
  - AI panel: `rounded-panel bg-accent p-6` — **delete the `<Sparkles size={100}>` watermark**. Title `font-display text-[18px] font-medium text-accent-contrast mb-1.5`; desc `text-sm text-accent-contrast/80 leading-relaxed mb-5`.
  - Generate button: `flex w-full h-11 items-center justify-center gap-2 rounded-control bg-surface text-sm font-semibold text-ink transition-colors hover:bg-background disabled:opacity-60 disabled:pointer-events-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-contrast`. Loading state: replace `'...'` with `<><Loader2 size={16} className="animate-spin" /> {t.builder.generateBtn}</>` (import `Loader2` from lucide-react); button stays disabled while generating.
  - Error banner: error-banner recipe (on the accent panel use `bg-surface` border `border-destructive/40` so it reads on green): `flex items-start gap-2 rounded-card border border-destructive/40 bg-surface p-3 text-sm text-destructive mt-4` keeping `AlertCircle` + message.
  - Template picker: heading `text-sm font-semibold text-ink flex items-center gap-2`; buttons `p-3.5 rounded-card border text-left transition-all cursor-pointer` + selected `border-accent bg-accent-tint` (name `text-sm font-semibold text-accent`) / unselected `border-border bg-surface hover:border-accent/40` (name `text-sm font-medium text-ink`); sub-label `text-[11px] text-muted mt-0.5`. No scale transform.
  - Customize panel: `rounded-card border border-border bg-surface p-5 space-y-5`; labels = form-label recipe. CV color swatches: keep the hex values and behavior; selected ring `ring-2 ring-ink ring-offset-2 ring-offset-surface`; unselected `hover:ring-1 hover:ring-border`. Font/spacing segmented buttons: `h-9 rounded-control border text-xs font-medium transition-colors cursor-pointer` + selected `border-accent bg-accent-tint text-accent` / unselected `border-border text-muted hover:border-accent/40 hover:text-ink`.
  - Download PDF button: primary-button recipe `w-full h-12`, keep `whileTap={{ scale: 0.98 }}` and `Download` icon.

- [ ] **Step 4: Footer nav + preview well**
  - Footer: `p-5 border-t border-border flex items-center justify-between bg-surface`; Back = ghost recipe with ChevronLeft, `disabled:opacity-40`; Continue/Done = primary-button recipe `h-11 px-6`.
  - Preview well: `flex-1 p-6 md:p-10 flex flex-col items-center overflow-y-auto custom-scrollbar bg-background` — remove `grid-bg`. Any preview-area toolbar buttons get secondary-button treatment. `.cv-page` styling comes from CSS (Task 1) — don't add classes to it.
  - Keep step-content AnimatePresence; transition `{ duration: 0.2, ease: 'easeOut' }}` with `x: 12/-12`.

- [ ] **Step 5: Verify + commit**

Run: `npm run lint && npm run build` — clean. Grep guards (scoped to chrome): `sed -n '1,782p' src/components/ResumeBuilder.tsx | grep -nE "(bg|text|border|ring)-(gray|blue|violet|emerald|amber|primary|red|rose)-"` → nothing; `sed -n '783,$p' src/components/ResumeBuilder.tsx | git diff --stat` → confirm zero diff lines below line 782 via `git diff src/components/ResumeBuilder.tsx | grep "^@@"` hunks all in chrome range.

```bash
git add src/components/ResumeBuilder.tsx
git commit -m "Dossier builder chrome: wizard, forms, finalize panel, preview well"
```

---

### Task 5: JobBoard (`JobBoard.tsx`) — parallel-safe with Tasks 3–4

**Files:**
- Modify: `src/components/JobBoard.tsx`

**Interfaces:**
- Consumes: Task 1 utilities. All filtering/search/applied-state/web-search logic unchanged.
- Produces: n/a.

- [ ] **Step 1: Page frame + search/filter header**
  - Root: `max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8 min-h-full bg-background text-ink` (drop grid-bg + ternaries).
  - Header card: `flex flex-col gap-6 rounded-panel border border-border bg-surface p-6 md:p-8`.
  - Search error banner: error-banner recipe, keep AlertCircle + message.
  - Title `font-display text-[26px] md:text-[33px] font-medium tracking-tight text-ink`; desc `text-sm text-muted`.
  - Search input: input recipe with `pl-11 h-12` and the Search icon `text-muted` at `left-4`.
  - "Search external" button: primary-button recipe `h-11 px-5`; keep the Loader2/Globe swap and disabled logic. "Live Web Search Active" line: dot `h-1.5 w-1.5 rounded-full bg-accent animate-pulse` + label eyebrow recipe in `text-accent`.
  - Type filter buttons (Internship/Full-time/Part-time): `h-11 px-5 rounded-control border text-sm font-medium transition-colors cursor-pointer` + selected `border-accent bg-accent text-accent-contrast` / unselected `border-border bg-surface text-muted hover:border-accent/40 hover:text-ink`.
  - Status segmented control: container `flex rounded-control border border-border bg-background p-0.5`; segment `h-9 px-3 rounded-[4px] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer` + active `bg-surface text-ink shadow-card` / inactive `text-muted hover:text-ink`; count pill active `bg-accent text-accent-contrast` / inactive `bg-border text-muted`. Filter-row labels: form-label recipe.
  - Company `<select>`: input recipe at `h-10 w-auto px-3 text-xs cursor-pointer`.
  - Any quick-filter company chips: neutral-badge recipe with `cursor-pointer hover:border-accent/40 hover:text-ink transition-colors`, selected state = accent-badge recipe.

- [ ] **Step 2: Stat cards**
  `StatCard` gets ONE treatment; call-sites drop their `color`/`bg` props (keep the prop names in the signature if simpler, ignore values): card `rounded-card border border-border bg-surface p-5 flex items-center gap-4`; icon chip `flex h-10 w-10 items-center justify-center rounded-card bg-accent-tint text-accent shrink-0` (`<Icon size={18} />`); value `font-display text-[26px] font-medium text-ink leading-none`; label eyebrow recipe `mt-1.5`. No rainbow variants.

- [ ] **Step 3: Job cards + badges**
  - Job card: `rounded-card border border-border bg-surface p-6 transition-all duration-200 hover:border-accent/40 hover:shadow-hover`; company/title `text-[18px] font-semibold text-ink`; meta `text-sm text-muted`; salary or highlight figures may use `text-clay-text font-semibold`. Keep all existing content/fields and the apply/applied logic.
  - `Badge`: default = neutral-badge recipe; call-sites currently passing blue/emerald/violet color strings map semantically instead: `Remote Friendly` → accent variant; domain badge → neutral; external-source badge → clay variant. Simplest: change `Badge` to accept `variant?: 'neutral' | 'accent' | 'clay'` and update call-sites (`color` prop deleted).
  - Applied/apply buttons: applied state `border border-accent/30 bg-accent-tint text-accent` with CheckCircle2; apply = primary-button recipe `h-10 px-4 text-sm`. External-link buttons: secondary recipe `h-10`.
  - Loading state (web search in flight, if any list-level spinner exists): centered `Loader2 animate-spin text-accent` + `text-sm text-muted` line from existing strings.
  - Empty state (no jobs match filters): `rounded-card border border-dashed border-border py-16 text-center` with `Briefcase size={24}` in `text-muted/60 mx-auto`, existing "no results" string in `text-sm text-muted mt-3`; if a clear-filters affordance exists keep it as secondary button.

- [ ] **Step 4: Verify + commit**

Run: `npm run lint && npm run build` — clean. Grep guard: `grep -nE "(bg|text|border|ring)-(gray|blue|violet|emerald|amber|primary|red|rose)-" src/components/JobBoard.tsx` → nothing.

```bash
git add src/components/JobBoard.tsx
git commit -m "Dossier job board: header, filters, stat cards, job cards, states"
```

---

### Task 6: Cross-surface consistency audit

**Files:**
- Modify: any of `src/App.tsx`, `src/components/Landing.tsx`, `src/components/ResumeBuilder.tsx` (chrome range), `src/components/JobBoard.tsx`, `src/index.css` as findings require.

**Interfaces:** consumes everything; produces the final coherent system.

- [ ] **Step 1: Automated sweeps** (fix every hit that's in app chrome; template-range and LinkedIn-blue hits are exempt)

```bash
cd "/Users/david/Desktop/CampusCV AI"
grep -rnE "(bg|text|border|ring|from|to|via)-(gray|blue|violet|indigo|purple|emerald|amber|yellow|red|rose|slate|teal|orange|pink)-" src/App.tsx src/components/Landing.tsx src/components/JobBoard.tsx
sed -n '1,782p' src/components/ResumeBuilder.tsx | grep -nE "(bg|text|border|ring)-(gray|blue|violet|emerald|amber|primary|red|rose)-"
grep -rn "primary-\|theme-\|grid-bg\|glass\|backdrop-blur\|font-black\|rounded-2xl\|rounded-3xl\|rounded-\[" src/App.tsx src/components/Landing.tsx src/components/JobBoard.tsx
grep -rn "appPalette\|appColorPalette" src/
```
Expected after fixes: zero chrome hits (LinkedIn `#0a66c2` and template-range lines exempt; `rounded-[4px]` inside segmented controls is allowed as it's smaller than radius-control).

- [ ] **Step 2: Manual consistency read-through** — open all four files and check: identical button/input/badge/eyebrow recipes everywhere (no drifted variants), Fraunces used only for display headings/wordmark/numerals, spacing rhythm consistent (section paddings, card paddings), every interactive element has focus-visible + cursor-pointer, all AnimatePresence transitions 150–250ms ease-out.

- [ ] **Step 3: Full-flow smoke test** — `npm run dev`, click through: Landing → New CV → all 4 wizard steps (add an education + experience entry, pick a template, run customize controls) → Jobs (search, filters, status control) → Profile → dark toggle on every screen → all 4 languages on Landing + Builder. Everything must behave exactly as before the redesign.

- [ ] **Step 4: Verify + commit**

Run: `npm run lint && npm run build` — clean.

```bash
git add -A src/
git commit -m "Dossier consistency pass: unify recipes, purge legacy palette classes"
```

---

### Task 7: Visual verification, critique, and fixes

**Files:**
- Create: screenshots under the session scratchpad (not the repo)
- Modify: any chrome file, per findings

- [ ] **Step 1: Screenshot matrix.** Start `npm run dev` in background. Screenshot with Playwright via npx (no repo dependency — use `npx playwright@latest screenshot` or a scratchpad script with `npx -y playwright install chromium` first if needed): pages = landing, builder step 1, builder step 3 (finalize), jobs, profile; widths = 375, 768, 1440; modes = light + dark (toggle via `document.documentElement.classList.add('dark')` + `localStorage.setItem('theme','dark')` in an init script, or click the toggle). Full-page captures for landing.

- [ ] **Step 2: Critique against the bar.** Run the design-critique and accessibility-review skills (if available in the session) on the screenshots; additionally self-check every shot against: Does any element read as "AI-generated template" (gradient, glass, blob, centered-hero cliché, rainbow accents)? Is type hierarchy clean at each width? Do hover/focus states exist? Any horizontal scroll at 375px? Any AA contrast doubt (spot-check computed colors with the contrast formula)? Log every finding.

- [ ] **Step 3: Fix all findings**, re-screenshot the affected screens, confirm resolved.

- [ ] **Step 4: Final gates.** `npm run lint && npm run build` clean; re-run Task 6 Step 1 greps → still clean; full-flow smoke test once more (both modes).

- [ ] **Step 5: Commit**

```bash
git add -A src/
git commit -m "Dossier polish: fixes from design critique and accessibility review"
```
