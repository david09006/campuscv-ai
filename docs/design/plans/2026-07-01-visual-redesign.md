# CampusCV AI Visual Redesign Implementation Plan

**Goal:** Restyle CampusCV AI's app chrome (nav/header, Landing, ResumeBuilder wizard chrome, JobBoard) from an inconsistent, startup-flashy visual language to a clean, professional "Trust Blue SaaS" look, without touching the 6-palette switcher's hue values, dark/light toggle logic, i18n structure, CV export templates, or any Phase-1 bug-fix behavior.

**Architecture:** Pure presentational change — Tailwind class edits in JSX plus one font-import edit in `src/index.css`. No new components, no new state, no new dependencies. Each task edits one file end-to-end so it can be reviewed and verified independently.

**Tech Stack:** React 19, Tailwind CSS v4 (via `@tailwindcss/vite`, CSS-variable-driven theme in `src/index.css`), Framer Motion (`motion/react`), no test framework in this repo.

## Global Constraints

- Spec: `docs/design/specs/2026-07-01-visual-redesign-design.md` — read it before starting if anything below is ambiguous.
- Do NOT change the 6 `.theme-*` palette hue values in `src/index.css` (classic/emerald/sunset/amethyst/crimson/cyber blocks) — only how components consume `primary-*` classes.
- Do NOT touch the 10 CV export template functions in `ResumeBuilder.tsx` (`ModernTemplate` through `RetroTemplate`, roughly lines 780–1900) — only the wizard chrome above them.
- Do NOT change i18n keys/structure, dark/light toggle logic, OAuth/API behavior, or any Phase-1 fix.
- Replace every arbitrary bracket radius (`rounded-[2rem]`, `rounded-[2.5rem]`, `rounded-[3rem]`, `rounded-[4rem]`, `rounded-[2.2rem]`) with a value from the fixed scale: `rounded-lg` (buttons/inputs), `rounded-xl` (cards/panels), `rounded-2xl` (large hero/section containers, upper bound — nothing bigger). Small pills/badges/swatches keep `rounded-full`.
- Remove every colored "glow" shadow (`shadow-primary-500/20`, `shadow-blue-100`, `shadow-blue-200`, `shadow-primary-950/40`, etc.) in favor of neutral `shadow-sm` (resting) / `shadow-md` (hover/elevated) / `shadow-lg` (modals — none in current scope).
- Replace any hardcoded `blue-600`/`blue-700` class used for what is conceptually the *primary* brand color with `primary-600`/`primary-700` so it responds to the active palette. (Hardcoded `blue`/`emerald`/`violet`/`amber` used for genuinely decorative/semantic multi-color accents — e.g. Landing's 4-step color-per-card, JobBoard's stat card icon colors — are NOT primary-brand usages and stay as-is; only fix cases where blue is standing in for "the app's primary color".)
- No test framework exists in this repo (`package.json` has no `test` script). "Verification" per task means: `npm run lint` (tsc) passes, `npm run build` passes, and a manual visual check in the browser (light + dark, at least 2 palettes, at least 2 languages) as described in each task's Verification step.
- Working directory for all commands: `/Users/david/Desktop/CampusCV AI`. No git repo exists here — skip any `git commit` steps; just leave changes on disk.

---

### Task 1: Global tokens — font swap and gradient-text utility

**Files:**
- Modify: `src/index.css:1`, `src/index.css:247-249`

**Interfaces:**
- Consumes: nothing (pure CSS)
- Produces: `--font-sans` now resolves to Plus Jakarta Sans; `.gradient-text` utility now renders solid primary color instead of a rainbow gradient (used by `Landing.tsx`'s `heroTitle` in all 4 languages via `dangerouslySetInnerHTML`, e.g. `<span class="gradient-text">Future</span>`)

- [ ] **Step 1: Swap the font import and `--font-sans` token**

In `src/index.css`, replace line 1 and the `--font-sans` line (currently line 5):

```css
/* before */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
...
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;

/* after */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
...
  --font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
```

`--font-mono` stays `"JetBrains Mono", ui-monospace, SFMono-Regular, monospace` unchanged — it's still used by the CV "monospace" template option in `ResumeBuilder.tsx` (`font-mono` class on `TechTemplate`), which is out of scope for this redesign.

- [ ] **Step 2: Redefine `.gradient-text` as a solid color, not a gradient**

Replace the current definition:

```css
/* before */
  .gradient-text {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600;
  }

/* after */
  .gradient-text {
    @apply text-primary-600 dark:text-primary-400;
  }
```

This keeps `Landing.tsx` and `src/lib/i18n.ts` completely untouched (the `<span class="gradient-text">` markup baked into `heroTitle` for en/ro/fr/de stays as-is) while changing what the class visually does — solid, palette-aware primary color instead of a fixed rainbow gradient.

- [ ] **Step 3: Verify**

Run:
```bash
npm run lint
npm run build
```
Expected: both pass with no errors (pure CSS change, no type impact).

---

### Task 2: Nav/Header restyle (`App.tsx`)

**Files:**
- Modify: `src/App.tsx:97, 100, 124, 129, 140, 230-234, 656` (line numbers as of this plan's writing — re-locate by the quoted snippets if they've shifted)

**Interfaces:**
- Consumes: nothing new — same `isDarkMode`, `appColorPalette`, `user`, `lang` state already in `App.tsx`
- Produces: nothing consumed by other tasks — nav/header is visually self-contained

- [ ] **Step 1: Logo mark — drop the gradient + glow shadow**

```tsx
/* before (line 97) */
<div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 dark:shadow-none group-hover:scale-105 transition-transform duration-200">

/* after */
<div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
```

- [ ] **Step 2: Connected-user pill and login button — flatten shadows/radius**

```tsx
/* before (line 124) */
<div className="flex items-center gap-2 bg-primary-50 dark:bg-primary-950/30 px-3 py-1.5 rounded-2xl border border-primary-100 dark:border-primary-800 group cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all">

/* after */
<div className="flex items-center gap-2 bg-primary-50 dark:bg-primary-950/30 px-3 py-1.5 rounded-lg border border-primary-100 dark:border-primary-800 group cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all">
```

```tsx
/* before (line 129), inside the same block */
<div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">

/* after */
<div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
```

```tsx
/* before (line 140) */
className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-primary-500/20 dark:shadow-none active:scale-95"

/* after */
className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-sm active:scale-95"
```

(`font-black`/`tracking-wider` → `font-bold`/`tracking-wide` here and in Steps 3–4 below: the new type scale drops the heaviest weight + widest tracking used for small uppercase labels throughout the header, per the spec's "tone down the heavy labeling" note.)

- [ ] **Step 3: "New CV" primary CTA button — drop glow shadow**

```tsx
/* before (lines 230-234) */
className={`hidden sm:flex px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 ${
  isDarkMode 
    ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-none' 
    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-500/20'
}`}

/* after */
className={`hidden sm:flex px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-all items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 ${
  isDarkMode 
    ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-none' 
    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md'
}`}
```

- [ ] **Step 4: Apply the same "drop glow shadow, `font-black`→`font-bold`, `tracking-widest`→`tracking-wide`" pattern to the remaining small uppercase labels in the header**

Same transformation (glow-shadow removal + weight/tracking softening only — do not change colors, layout, or behavior) at:
- The "Connected" label (`text-[10px] font-black ... uppercase tracking-widest` around line 129's block) → `font-bold ... tracking-wide`
- The palette swatch button title/ring styling (around line 148-172) — leave the `ring-2 ring-offset-1` selection indicator as-is (it's a functional selection state, not decorative glow), only remove `shadow-sm` is already neutral so no change needed there
- The language switcher pills (around line 196-208) — already neutral (`shadow-sm` on active pill, no glow) — no change needed

- [ ] **Step 5: Verify**

Run:
```bash
npm run lint
npm run build
```
Then start the dev server and check in browser:
```bash
npm run dev
```
Open `http://localhost:3000`, confirm: header logo/buttons no longer show colored glow shadows, toggle dark mode and all 6 palettes (swatches in the header) — nav still reflects the active palette color correctly, language switcher still works.

---

### Task 3: Landing page restyle (`Landing.tsx`)

**Files:**
- Modify: `src/components/Landing.tsx` (hero section lines 41-71, dashboard mockup lines 74-141, steps section lines 155-182, features showcase lines 190-225, final CTA lines 231-247)

**Interfaces:**
- Consumes: nothing new
- Produces: nothing consumed by other tasks

- [ ] **Step 1: Hero heading — smaller scale, solid accent instead of gradient**

```tsx
/* before (line 42) */
className={`text-6xl md:text-8xl font-black leading-[0.85] tracking-tighter mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}

/* after */
className={`text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
```

(The `.gradient-text` span inside `heroTitle` already renders as solid `primary-600`/`primary-400` after Task 1 — no further change needed here.)

- [ ] **Step 2: Hero CTA buttons — flatten radius/shadow**

```tsx
/* before (line 51) */
className="bg-primary-600 dark:bg-primary-600 hover:bg-primary-700 dark:hover:bg-primary-500 text-white px-10 py-5 rounded-[2rem] font-black text-lg transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 shadow-2xl shadow-primary-500/20 dark:shadow-primary-950/40"

/* after */
className="bg-primary-600 dark:bg-primary-600 hover:bg-primary-700 dark:hover:bg-primary-500 text-white px-10 py-5 rounded-lg font-bold text-lg transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
```

```tsx
/* before (lines 61-65) */
className={`px-10 py-5 rounded-[2rem] font-bold text-lg transition-all flex items-center justify-center gap-3 active:scale-95 group ${
  isDarkMode 
    ? 'bg-gray-900 border-2 border-gray-800 text-gray-300 hover:border-primary-700 hover:bg-gray-800/50 shadow-none' 
    : 'bg-white border-2 border-gray-100 text-gray-700 hover:border-primary-200 hover:bg-primary-50 shadow-lg shadow-gray-100'
}`}

/* after */
className={`px-10 py-5 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 active:scale-95 group border ${
  isDarkMode 
    ? 'bg-gray-900 border-gray-800 text-gray-300 hover:border-primary-700 hover:bg-gray-800/50' 
    : 'bg-white border-gray-200 text-gray-700 hover:border-primary-200 hover:bg-primary-50 shadow-sm'
}`}
```

- [ ] **Step 3: Dashboard mockup panel — remove glass wrapper, blur, and rotation**

```tsx
/* before (lines 74-83) */
<motion.div
  initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
  animate={{ opacity: 1, scale: 1, rotate: 0 }}
  transition={{ duration: 0.8, delay: 0.2 }}
  className="relative hidden lg:block"
>
  <div className="relative z-10 glass p-3 rounded-[3rem] shadow-2xl rotate-1">
    <div className={`rounded-[2.2rem] overflow-hidden border aspect-[16/10] flex flex-col shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] transition-colors ${
      isDarkMode ? 'bg-gray-950 border-gray-800 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]' : 'bg-white border-gray-100'
    }`}>

/* after */
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.6, delay: 0.2 }}
  className="relative hidden lg:block"
>
  <div className="relative z-10 rounded-xl overflow-hidden border aspect-[16/10] flex flex-col shadow-md transition-colors dark:border-gray-800 border-gray-200">
```

Note the structural simplification: the outer `glass` wrapper `<div>` is removed entirely (its rounded/shadow/rotate styling was the decorative wrapper being replaced), so the inner panel `<div>` becomes the single top-level element directly inside the `motion.div`. Its **content** (the browser-chrome dots, the two-column dashboard preview content from lines 84-137) stays completely unchanged — only this outer container's classes change. Remove the now-unused `isDarkMode ? ... : ...` ternary on that inner div since the new single className string already handles both modes via `dark:` variants.

- [ ] **Step 4: Steps section cards — flatten radius, drop hover glow/lift**

```tsx
/* before (line 165-167) */
className={`p-10 rounded-[3rem] border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative group overflow-hidden ${
  isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-blue-50/50'
}`}

/* after */
className={`p-10 rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative group overflow-hidden ${
  isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
}`}
```

Leave the per-card accent-color left-border (`bg-${color}-600` stripe, line 169) and the numeral styling (lines 170-176) as-is — these are intentional multi-color step accents (blue/violet/emerald/amber), not the "primary brand color" rule from Global Constraints, and are a reasonable, restrained decorative touch consistent with a clean SaaS step-list.

- [ ] **Step 5: Features showcase — replace stock photo panel with a flat token-based panel**

```tsx
/* before (lines 191-195) */
<div className="relative order-2 md:order-1">
    <div className="aspect-square bg-primary-600 rounded-[4rem] overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center mix-blend-overlay opacity-40" />
    </div>
</div>

/* after */
<div className="relative order-2 md:order-1">
    <div className="aspect-square bg-primary-600 rounded-2xl overflow-hidden shadow-md relative flex items-center justify-center">
        <Sparkles className="text-white/20" size={180} strokeWidth={1} />
    </div>
</div>
```

This drops the external Unsplash dependency and the `mix-blend-overlay` treatment entirely, replacing it with a flat primary-color panel using an icon already imported in this file (`Sparkles`, imported at line 3) — no new imports needed, no external network image, on-brand with the flat SaaS style.

- [ ] **Step 6: Final CTA section — flatten radius/shadow, remove decorative blurred blobs**

```tsx
/* before (lines 231-234) */
<div className="max-w-7xl mx-auto bg-primary-600 dark:bg-primary-600 rounded-[4rem] p-16 md:p-24 text-center text-white relative overflow-hidden transition-all duration-500 shadow-2xl shadow-primary-500/20 dark:shadow-primary-950/40">
  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
  <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
  
  <h2 

/* after */
<div className="max-w-7xl mx-auto bg-primary-600 dark:bg-primary-600 rounded-2xl p-16 md:p-24 text-center text-white relative overflow-hidden transition-all duration-500 shadow-md">
  <h2 
```

(Both decorative blurred-blob `<div>`s are deleted outright.)

```tsx
/* before (line 236) */
className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-none relative z-10"

/* after */
className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight relative z-10"
```

```tsx
/* before (line 244) */
className="bg-white text-primary-600 hover:bg-gray-50 px-12 py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-primary-950/20 transition-all hover:scale-105 active:scale-95 relative z-10"

/* after */
className="bg-white text-primary-600 hover:bg-gray-50 px-12 py-6 rounded-lg font-bold text-xl shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-95 relative z-10"
```

- [ ] **Step 7: Verify**

Run:
```bash
npm run lint
npm run build
```
Then in the running dev server, open the Landing page and confirm: no console 404 for the removed Unsplash URL, no decorative blurred blobs, hero type is smaller and the "Future"/"Viitorul"/"Futur"/"Zukunft" span renders in solid primary color (check by switching language switcher through all 4 languages), dashboard mockup panel is flat/no rotation, steps/CTA cards use consistent rounded-xl/2xl. Check both light and dark mode, and at least 2 palettes.

---

### Task 4: ResumeBuilder wizard chrome restyle (`ResumeBuilder.tsx`)

**Files:**
- Modify: `src/components/ResumeBuilder.tsx` (sidebar header/step-indicator lines 129-169, footer nav lines 637-661) — do NOT modify anything from the `// Sub-components` comment onward (InputField/SectionHeader/Section and the 10 template functions), including the form-field cards inside steps 0-3 (those already use consistent `rounded-2xl`/`rounded-xl` and neutral `shadow-sm` — no arbitrary radii or glow shadows there today, so nothing to change per Global Constraints).

**Interfaces:**
- Consumes: nothing new
- Produces: nothing consumed by other tasks

- [ ] **Step 1: Step indicator — make it palette-aware and drop the glow shadow**

```tsx
/* before (lines 152-166) */
<div 
  key={idx}
  className={`h-1.5 flex-1 rounded-full transition-all duration-300 relative group ${
    idx <= currentStep 
      ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]' 
      : (isDarkMode ? 'bg-gray-800' : 'bg-gray-200')
  }`}
>
  <div className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black transition-colors ${
    idx <= currentStep 
      ? 'text-blue-600' 
      : (isDarkMode ? 'text-gray-600' : 'text-gray-400')
  }`}>
    0{idx + 1}
  </div>
</div>

/* after */
<div 
  key={idx}
  className={`h-1.5 flex-1 rounded-full transition-all duration-300 relative group ${
    idx <= currentStep 
      ? 'bg-primary-600' 
      : (isDarkMode ? 'bg-gray-800' : 'bg-gray-200')
  }`}
>
  <div className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold transition-colors ${
    idx <= currentStep 
      ? 'text-primary-600' 
      : (isDarkMode ? 'text-gray-600' : 'text-gray-400')
  }`}>
    0{idx + 1}
  </div>
</div>
```

This fixes a real palette bug (the step progress bar was hardcoded blue regardless of the active theme palette) as part of the "modernize what the palettes actually look like" goal — not just a style change.

- [ ] **Step 2: Footer "Continue/Done" button — palette-aware, drop glow shadow**

```tsx
/* before (lines 653-657) */
className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
  isDarkMode 
    ? 'bg-white text-gray-900 hover:bg-gray-100 shadow-none' 
    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
}`}

/* after */
className={`px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
  isDarkMode 
    ? 'bg-white text-gray-900 hover:bg-gray-100 shadow-none' 
    : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md'
}`}
```

- [ ] **Step 3: Verify**

Run:
```bash
npm run lint
npm run build
```
Then in the running dev server, open the Builder tab, step through all 4 wizard steps with each of the 6 palettes selected (via the header swatches) — confirm the step-progress bar and the "Continue"/"Done" button now change color with the palette (previously always blue). Confirm the 10 CV template previews on the right (Modern/Classic/etc.) render unchanged. Check dark mode too.

---

### Task 5: JobBoard restyle (`JobBoard.tsx`)

**Files:**
- Modify: `src/components/JobBoard.tsx` (search/filter header card line 200, job result cards line 450, empty-state line 540)

**Interfaces:**
- Consumes: nothing new
- Produces: nothing consumed by other tasks

- [ ] **Step 1: Search/filter header card — flatten radius/shadow**

```tsx
/* before (lines 200-204) */
<div className={`flex flex-col gap-8 p-8 rounded-[2.5rem] shadow-xl border transition-all ${
  isDarkMode 
    ? 'bg-gray-900 shadow-none border-gray-800' 
    : 'bg-white shadow-blue-50 border-gray-200'
}`}>

/* after */
<div className={`flex flex-col gap-8 p-8 rounded-xl shadow-sm border transition-all ${
  isDarkMode 
    ? 'bg-gray-900 shadow-none border-gray-800' 
    : 'bg-white border-gray-200'
}`}>
```

- [ ] **Step 2: Job result cards — flatten radius, drop lift/glow on hover**

```tsx
/* before (lines 450-454, note the surrounding `motion.div` at line 442 is unaffected) */
className={`p-6 rounded-[2rem] border transition-all duration-300 group flex flex-col justify-between relative overflow-hidden ${
  appliedJobs.includes(job.id)
    ? (isDarkMode ? 'border-emerald-800 bg-emerald-950/40 shadow-none' : 'border-emerald-200 bg-emerald-50 shadow-lg shadow-emerald-50')
    : (isDarkMode ? 'bg-gray-900 border-gray-800 shadow-none' : 'bg-white border-gray-200 hover:shadow-xl hover:shadow-blue-50 hover:-translate-y-1')
}`}

/* after */
className={`p-6 rounded-xl border transition-all duration-300 group flex flex-col justify-between relative overflow-hidden ${
  appliedJobs.includes(job.id)
    ? (isDarkMode ? 'border-emerald-800 bg-emerald-950/40 shadow-none' : 'border-emerald-200 bg-emerald-50 shadow-sm')
    : (isDarkMode ? 'bg-gray-900 border-gray-800 shadow-none' : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5')
}`}
```

- [ ] **Step 3: Empty-state panel — flatten radius**

```tsx
/* before (lines 540-542) */
<div className={`text-center py-20 rounded-[3rem] border border-dashed transition-all ${
  isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
}`}>

/* after */
<div className={`text-center py-20 rounded-xl border border-dashed transition-all ${
  isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
}`}>
```

Leave `StatCard` and `Badge` sub-components, and the multi-color stat-card icon backgrounds (blue/amber/violet/emerald — genuinely semantic per-stat colors, not "primary brand" usages), unchanged per Global Constraints.

- [ ] **Step 4: Verify**

Run:
```bash
npm run lint
npm run build
```
Then in the running dev server, open the Jobs tab: confirm search header card, job cards, and empty state (clear all filters to trigger it, or search a nonsense term) use the flattened radius/shadow scale. Confirm the Phase-1 error banner (shown when a search fails) and hardcoded-date fix still work — this task must not touch that logic, only the surrounding container classes it doesn't share.

---

### Task 6: Full cross-cutting visual verification

**Files:** none (verification only)

**Interfaces:** N/A

- [ ] **Step 1: Full build/typecheck pass**

```bash
npm run lint
npm run build
```
Expected: both exit 0, no errors.

- [ ] **Step 2: Boot the dev server and walk every surface**

```bash
npm run dev
```
Open `http://localhost:3000` in a browser and check, for **both** light and dark mode, and cycling through **all 6 palettes** (classic/emerald/sunset/amethyst/crimson/cyber via the header swatches):
- Landing page: hero, dashboard mockup, steps, features panel, final CTA
- Builder: step indicator + Continue/Done button reflect the active palette; all 4 wizard steps; at least 2 of the 10 CV template previews still render correctly (unchanged)
- Jobs: search header, job cards, empty state
- Header/nav: logo, nav items, login button, palette swatches, dark toggle, language switcher

Also switch language to each of `en/ro/fr/de` on the Landing page specifically, to confirm the hero's `gradient-text` span (now solid primary color) still renders correctly in all four translated strings and no layout breaks from longer German/French text.

- [ ] **Step 3: Confirm no regressions in Phase 1 behavior**

With the dev server running:
```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000/api/health
```
Expected: `HTTP 200`. This confirms the server/API layer (untouched by this visual-only plan) still boots correctly alongside the restyled client.

---

## Self-Review Notes

- **Spec coverage:** Design tokens (Task 1), Nav/Header (Task 2), Landing (Task 3), ResumeBuilder chrome (Task 4), JobBoard (Task 5) each map to their spec section. CV templates and Profile stub correctly excluded per spec's "Out of Scope" section.
- **Placeholder scan:** every step shows exact before/after code; no "add appropriate styling" placeholders.
- **Type consistency:** no new functions/props introduced, so no signature drift risk — this plan is Tailwind-class-only plus one CSS-file edit and one JSX-structure simplification (Task 3 Step 3, dashboard mockup wrapper removal), called out explicitly.
