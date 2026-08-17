# CampusCV AI — Visual Redesign Design Spec

Date: 2026-07-01

## Context

CampusCV AI's current UI (Landing, ResumeBuilder chrome, JobBoard, nav/header) uses
inconsistent, startup-flashy visual language: arbitrary huge radii (`rounded-[2rem]`,
`rounded-[3rem]`, `rounded-[4rem]`) mixed with `rounded-2xl`/`rounded-full` on similar
elements, glowing colored shadows (`shadow-primary-500/20`, `shadow-2xl`), oversized
`text-8xl font-black` hero type, floating blurred decorative blobs, and a generic
Unsplash stock photo in the features section. This reads as a consumer/startup landing
page rather than a professional tool students use to get hired.

The goal is a real visual refresh — professional, trustworthy, official, easy to use —
across Landing, ResumeBuilder (chrome only, not the CV export templates), JobBoard, and
the nav/header, while preserving the existing dark/light toggle, the 6-palette theme
switcher, and i18n (en/ro/fr/de).

Chosen direction (approved by user, from `/ui-ux-pro-max` design-system search against
"student career/productivity SaaS", keywords professional/trustworthy/official/clean/
easy-to-use): **Trust Blue SaaS** — clean flat SaaS style, closest match to the tool's
own top design-system recommendation, and the lowest-migration-risk option since the
current "classic" palette primary (`#2563EB`) already matches it almost exactly.

## Design Tokens

**Colors** — the 6 existing palettes (`classic/emerald/sunset/amethyst/crimson/cyber`)
keep their current hues; only how components *use* color changes (see Effects below).
Reference values for the default `classic` palette:

- Primary: `#2563EB` (unchanged from today)
- Accent / success / CTA-secondary: `#059669` (emerald-600, already used for "applied" states)
- Background: `#F8FAFC`, Card: `#FFFFFF`, Muted: `#E9EFF8`, Muted text: `#64748B`, Border: `#E2E8F0`
- Destructive: unchanged (`red-600`/`rose` family already used consistently)

**Typography** — replace `Inter` (app chrome) with **Plus Jakarta Sans** (single family,
headings + body) via the existing `@import` in `src/index.css` and `--font-sans` token.
`JetBrains Mono` stays, but scoped to the CV template "monospace" font option only (a
resume-content choice inside `ResumeBuilder`'s template system) — it is not part of the
app chrome anymore once Inter is gone.

**Radius scale** (replaces today's arbitrary `rounded-[Nrem]` mixing):
- Small pills/badges/chips (skill tags, status badges, palette swatches): `rounded-full`
- Buttons, inputs, small controls: `rounded-lg`
- Cards, panels, modals: `rounded-xl`
- Large hero/section containers: `rounded-2xl` max (nothing bigger)

**Shadows**: resting state `shadow-sm` or none; hover/elevated `shadow-md`; modals/
dropdowns `shadow-lg`. No colored/glow shadows (`shadow-primary-500/20` etc.) anywhere.

**Motion**: keep Framer Motion page-transitions, but 150–250ms ease, no decorative-only
animation (drop floating blurred blobs, excessive `hover:-translate-y-2`/rotate on cards
→ subtle `hover:-translate-y-0.5` max).

## Scope Per Surface

**Nav/Header (`App.tsx`)** — keep the sticky `backdrop-blur` glass header (this is the
one place glassmorphism stays, per the style's own guidance to reserve blur for
chrome/overlays). Tone down the heavy `font-black uppercase tracking-widest` labeling on
nav buttons/login pill/notification bell to the new type scale. Palette swatches, dark
toggle, and language switcher keep their current behavior and position — only radius/
shadow/type restyled to match tokens above.

**Landing (`Landing.tsx`)** — the biggest visual change:
- Hero heading drops from `text-6xl md:text-8xl` to `text-4xl md:text-6xl`, solid
  `text-primary-700`/`text-gray-900` instead of the `gradient-text` rainbow gradient.
- Remove the floating blurred gradient blobs and the rotated/glass-wrapped dashboard
  mockup panel; replace with a flat, bordered `rounded-xl shadow-md` panel (same mockup
  content, no rotation/blur/glow).
- Replace the Unsplash stock photo panel in "Features Showcase" with a flat icon/content
  panel built from existing design tokens (no external image dependency, no
  `mix-blend-overlay` treatment) — keeps the section on-brand and avoids an unrelated
  stock photo undermining "official" credibility.
- Final CTA section: drop the `rounded-[4rem]` card, glow shadow, and decorative blurred
  circles → `rounded-2xl`, `shadow-md`, solid background.
- Steps section: cards go from `rounded-[3rem]` to `rounded-xl`, drop the oversized `04`
  ghost numerals' hover-color-per-card gimmick in favor of one consistent accent treatment.

**ResumeBuilder chrome (`ResumeBuilder.tsx`)** — restyle the wizard sidebar (step
indicator, form card radius/shadow, buttons) to the new tokens. **The 10 CV export
templates (Modern/Classic/Brutalist/Minimal/Europass/Corporate/Creative/Tech/Academic/
Retro) are out of scope** — those are deliberate, user-selected resume designs, not app
chrome, and redesigning them isn't part of "the app's visual language."

**JobBoard (`JobBoard.tsx`)** — restyle the search/filter header card, stat cards, and
job cards to the new radius/shadow scale; drop the `rounded-[2.5rem]` search card and
`rounded-[2rem]` job cards → `rounded-xl`. Keep all filtering/search/error-banner
behavior from Phase 1 untouched.

## Out of Scope (unchanged)

- 6-palette hue values, dark/light toggle logic, i18n keys/structure (only add new
  strings if a copy change requires it — none currently planned)
- CV export template designs (10 templates) and their font/spacing/color customization UI
- All Phase 1 bug fixes and behavior (API routes, OAuth, error states, stable keys, types)
- Profile page stub (flagged, not touched, per original Phase 1 scope note)

## Verification

- Visual check of all 4 surfaces in both light and dark mode
- Visual check across all 6 palettes (swatch switcher) to confirm the new component
  styling still adapts correctly to each palette's primary color
- Check all 4 languages (en/ro/fr/de) still render correctly (no layout breakage from
  longer strings in fr/de)
- `npm run lint` (tsc) and `npm run build` must still pass
- Dev server boots and the app is manually clicked through: Landing → Builder → Jobs →
  nav/theme/palette/language controls
