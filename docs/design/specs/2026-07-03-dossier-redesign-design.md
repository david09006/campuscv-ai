# CampusCV AI — "Dossier" Visual Identity Redesign

Date: 2026-07-03
Status: Approved by user (direction + full design walkthrough)

## Context

This pass supersedes the 2026-07-01 "Trust Blue SaaS" redesign. That pass flattened
the original startup-flashy UI but kept a generic SaaS-blue identity, a 6-palette
theme switcher, and Plus Jakarta Sans — safe, but indistinguishable from a template.

Goal now: a from-scratch visual identity at the bar of Linear/Stripe/Notion marketing
pages — restrained, intentional, confident — that a recruiter or university would
take seriously and a student would find approachable. Explicitly banned: purple-blue
gradients, glassmorphism cards, gradient-mesh/blob backgrounds, emoji in headings,
centered-everything hero clichés, default Tailwind palette used raw.

This is a **visual and UX overhaul only**. All functionality, routes, API calls,
OAuth, i18n (en/ro/fr/de), dark-mode toggle, PDF export, and the CV
generation/improvement logic stay working exactly as today.

## Direction: "Dossier" — editorial credibility

A CV is a document; the product looks like one. Warm paper background, ink-black
text, one deep forest-green accent, serif display headings. Feels like Stripe Press
or a well-typeset portfolio, not a SaaS template.

## Decisions locked with user

1. **Palette switcher removed entirely.** One deliberate palette (light + dark).
   The 6-theme swatch UI and its `appPalette` localStorage key are deleted.
2. **Dark mode stays** as a toggle; the dark palette is designed (warm dark tones),
   not inverted grays. **i18n stays** (en/ro/fr/de) — restyled, behavior unchanged.
3. **CV export templates untouched.** The 10 user-selectable resume templates
   (Modern/Classic/Brutalist/Minimal/Europass/Corporate/Creative/Tech/Academic/Retro,
   `ResumeBuilder.tsx` ~line 780 onward) are the downloaded documents, not app
   chrome. Their contents are out of scope. The *frame* around the live preview
   (`.cv-page` container, border/shadow, preview panel chrome) is in scope.

## Design tokens

### Colors (CSS variables, semantic names; light default, `.dark` overrides)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-background` | `#FAF6EF` | `#171310` | page background (warm paper / warm near-black) |
| `--color-surface` | `#FFFFFF` | `#211C17` | cards, panels, header |
| `--color-ink` | `#1C1917` | `#F3EDE2` | primary text |
| `--color-muted` | `#6B6255` | `#B8ADA0` | secondary text, labels |
| `--color-border` | `#E7DFD1` | `#33291F` | hairline borders |
| `--color-accent` | `#1F4D3A` | `#4C8B6D` | CTAs, links, active states, focus rings |
| `--color-accent-contrast` | `#FFFFFF` | `#0E1B15` | text on accent fill |
| `--color-clay` | `#B5563C` | `#D97B5F` | second accent — badges/highlights only, never CTAs |
| `--color-destructive` | `#B3261E` | `#E5786E` | errors, delete actions |

Every text/background pair must be verified ≥4.5:1 (WCAG AA) with real contrast
math during build; adjust shades if any pair fails. Exposed to Tailwind via
`@theme` so utilities like `bg-surface`, `text-ink`, `border-border`,
`bg-accent` exist. No raw Tailwind default-palette colors in components
(exceptions: LinkedIn brand `#0a66c2` on its login buttons; untouched CV templates).

### Typography

- **Fraunces** (Google Fonts, weights 400/500/600, `opsz` soft) — H1/H2 display,
  wordmark, marketing pull-quotes only.
- **IBM Plex Sans** (400/500/600/700) — everything else: nav, body, buttons,
  form labels, builder chrome, job board.
- Scale: `12 / 14 / 16 / 18 / 21 / 26 / 33 / 42 / 56` px. Body line-height 1.6,
  headings 1.1–1.2. No `font-black`, no `uppercase tracking-widest` micro-labels
  except sparing small-caps-style section labels (Plex Sans 12px, 500,
  letter-spacing 0.08em, muted color).
- JetBrains Mono import stays only if the CV template "mono" font option needs it
  (it does — keep, scoped to templates).

### Spacing, radius, shadow

- 4px base spacing scale, generous section padding (landing sections 96–128px
  vertical on desktop, 64px mobile).
- Radius: `6px` inputs/buttons/controls, `10px` cards, `14px` large panels.
  Nothing bigger. Pills (`rounded-full`) only for true badges and avatars.
- Shadows: resting `0 1px 2px rgba(28,25,23,.04)` or none; hover
  `0 4px 12px rgba(28,25,23,.08)`; overlays/menus `0 8px 24px rgba(28,25,23,.12)`.
  No colored/glow shadows anywhere.

### Motion (Framer Motion, already installed)

- Page/step transitions 150–250ms, ease-out, transform/opacity only.
- Hover: border-color shift or 1px lift; no scale gimmicks, no decorative loops.
- `prefers-reduced-motion` respected (disable non-essential transitions).

### Interaction states

Every interactive element defines hover, focus-visible (2px accent ring with
offset), active, and disabled (reduced opacity + no pointer) states. Touch
targets ≥44px. `cursor-pointer` on clickables.

## Per-screen scope

### Nav/header + footer (`App.tsx`)
- Flat surface bar, hairline bottom border. **No backdrop blur.**
- Wordmark "CampusCV" in Fraunces (drop the icon-in-blue-box logo; simple ink
  wordmark, optional small accent mark).
- Nav items: Plex Sans 14px/500, active state = ink text + accent underline or
  left-accent treatment, not filled pills.
- Palette-switcher UI deleted (and `appPalette` state/localStorage in App.tsx).
- Dark toggle, language switcher, notification bell, LinkedIn login, "New CV"
  CTA: keep behavior, restyle to tokens (CTA = accent fill).
- Mobile menu: same restyle.
- Footer: paper background, hairline top border, Plex Sans, existing links/copy.

### Landing (`Landing.tsx`)
- Hero: left-aligned editorial layout. Fraunces headline (42/56px), Plex Sans
  subhead, accent-fill primary CTA + bordered secondary (LinkedIn login).
  Kill the badge-pill's font-black/tracking treatment. The `dangerouslySetInnerHTML`
  hero title from i18n stays functional — its embedded markup renders under new styles.
- Dashboard mockup panel: rebuilt flat — surface card, hairline border, subtle
  shadow, no traffic-light dots row, no rotation/blur/glow. Content skeleton
  recolored to tokens.
- Steps: 4-up grid, numbered in Fraunces (modest size, clay or muted), hairline
  card borders, no per-card hover-color gimmick.
- Features: replace the giant Sparkles-on-green block with a flat on-brand
  content panel (e.g., a stylized CV-document illustration built from tokens).
  FeatureItem icons: 40px, accent/clay on subtle tinted background, radius 10px.
- Final CTA: flat forest-green (`accent`) panel, radius 14px, Fraunces heading,
  accent-contrast text, single white/paper button.

### ResumeBuilder chrome (`ResumeBuilder.tsx`, lines ~1–780)
- Wizard step indicator: tokens, accent for current/completed, muted for
  upcoming; clear labels (no icon-only).
- All form inputs/labels/textareas/add-remove rows: surface fields, hairline
  borders, 6px radius, accent focus ring, visible labels, error text in
  destructive color near field.
- "Generate with AI" panel (step 3): accent-fill panel restyled to tokens; the
  giant background Sparkles watermark removed; loading state = real progress
  affordance (spinner + label), not "...".
- Generation error banner: destructive tokens, icon + message + retry affordance.
- Template picker grid + customize controls (color/font/spacing pickers):
  restyled to tokens; the *functionality* (including the CV's own primaryColor
  swatches — those color the exported document, not the app) unchanged.
- Preview panel: paper-colored well, `.cv-page` gets hairline border + soft
  document shadow. Footer prev/next nav restyled.
- Empty states (no education/experience/projects yet): designed empty rows with
  muted illustration/icon + one-line prompt + add button — not bare gray.

### JobBoard (`JobBoard.tsx`)
- Search/filter header: surface card, hairline border, token-styled inputs/selects.
- StatCard: single consistent treatment (ink value in Plex Sans semibold, muted
  label, one accent-tinted icon chip) — no four-color rainbow.
- Job cards: surface, hairline border, hover = border-accent + soft shadow.
- Badge: one neutral treatment + accent/clay variants used semantically
  (remote = accent, source = muted). No blue/violet/emerald mix.
- Loading/error/empty states for the jobs fetch: on-brand treatments.

### Profile stub (`App.tsx`)
- Designed empty state: muted icon in tinted circle, Fraunces small heading,
  muted body, consistent with the empty-state pattern elsewhere.

## Out of scope (unchanged)

- All logic: state, handlers, fetch/API routes, OAuth popup flow, PDF export,
  i18n keys/structure, filtering, gemini calls, server code.
- The 10 CV export template components and the customization values they consume.
- No new dependencies. No route changes.

## Technical approach

1. **Tokens first** (`src/index.css`): replace the entire current `@theme` +
   6-theme block with the Dossier token set (light `:root`, `.dark` overrides),
   swap font imports to Fraunces + IBM Plex Sans (+ JetBrains Mono for templates),
   map tokens into Tailwind `@theme` as semantic color names, delete
   `.glass`/`.glass-card`/`.grid-bg`/`.gradient-text` (or redefine if still
   referenced), keep `.cv-page` (restyled) and scrollbar/print rules.
   Note: the long list of hex-forced Tailwind colors exists for html2canvas
   compatibility — keep the color families the untouched CV templates actually
   use; verify with a grep before deleting any.
2. **App.tsx**: remove palette-switcher state/UI, restyle header/mobile
   menu/footer/profile stub.
3. **Parallel agents** for the three independent surfaces — Landing.tsx,
   ResumeBuilder chrome, JobBoard.tsx — each briefed with the full token
   reference and hard constraints (no logic changes; className/JSX only;
   templates untouched).
4. **Consistency pass** by the lead across all surfaces + App.tsx.
5. **Verification**: dev server; screenshots of landing, builder (all 4 steps),
   job board, profile stub at 375/768/1440px in light and dark; design-critique
   and accessibility-review against screenshots; fix findings; `npm run lint`
   (tsc) and `npm run build` pass; manual click-through of all nav/toggle/
   language controls and the full build-a-CV flow.

## Success criteria

- No purple-blue gradients, glassmorphism, blobs, emoji-in-headings, or default
  Tailwind palette anywhere in app chrome.
- All 4 languages render without layout breakage; dark and light both designed.
- WCAG AA contrast verified for every token pair in both modes.
- tsc + build clean; all existing behavior works end-to-end.
