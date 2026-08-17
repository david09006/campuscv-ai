# CampusCV AI

A CV builder and job-search tool for students, built around Google's Gemini API.
Fill in your details, let the model draft and critique the prose, preview the
result in one of ten templates, and export it to PDF — then search for matching
internships and junior roles from the same app.

Stack: **React 19 + TypeScript + Vite**, **Tailwind CSS v4**, **Motion** for
animation, and a small **Express** server that owns every AI call.

---

## Features

- **Guided CV builder** — personal info, summary, education, experience,
  projects, skills, languages, and certifications, with live preview.
- **AI drafting** — generates summary and section content from what you've
  entered, in the UI language.
- **AI review** — per-section improvement suggestions, rendered as markdown.
- **Ten templates** — modern, classic, minimal, brutalist, europass,
  corporate, creative, tech, academic, retro — plus accent colour, font family
  (sans/serif/mono), and spacing controls.
- **PDF export** — A4 export via `html2canvas` + `jsPDF`.
- **Job board** — natural-language search that asks Gemini for current
  internship/junior listings and renders them as filterable cards.
- **Trilingual UI** — English, French, German (`src/lib/i18n.ts`).
- **Dark mode** — respects `prefers-color-scheme`, persisted to `localStorage`.
- **LinkedIn OAuth** — sign-in flow with CSRF `state` validation and an
  origin-checked `postMessage` handoff from the popup.

## Architecture

```
server.ts            Express app: API routes, LinkedIn OAuth, Vite middleware (dev)
server/gemini.ts     The only module that reads GEMINI_API_KEY and calls @google/genai
src/App.tsx          Shell: view routing, language, theme, auth state
src/components/      Landing, ResumeBuilder, JobBoard
src/lib/i18n.ts      Translation tables (en/fr/de)
src/types.ts         CVData and Job models
```

The API key never reaches the browser. `src/lib/gemini.ts` is a thin client that
posts to the server, and `server/gemini.ts` is the sole holder of the key —
importing it from `src/` would leak it into the client bundle.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Liveness check |
| `POST /api/jobs/search` | `{ query, language }` → job listings |
| `POST /api/cv/generate` | `{ data, language }` → generated CV content |
| `POST /api/cv/suggestions` | `{ section, content, language }` → suggestions |
| `GET /api/auth/linkedin/url` | Builds the LinkedIn authorize URL with a one-time state |
| `GET /auth/linkedin/callback` | Exchanges the code, posts the result to the opener |

## Run locally

Requires Node ≥ 20.

```bash
npm install
cp .env.example .env   # fill in the values below
npm run dev            # http://localhost:3000
```

`npm run dev` runs `server.ts` with `tsx`, which mounts Vite in middleware mode —
one process serves both the API and the HMR front end.

### Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `GEMINI_API_KEY` | yes | [Google AI Studio](https://aistudio.google.com/apikey) |
| `APP_URL` | yes | Base URL of this app; used for OAuth callbacks (`http://localhost:3000` in dev) |
| `LINKEDIN_CLIENT_ID` | for LinkedIn sign-in | LinkedIn developer app |
| `LINKEDIN_CLIENT_SECRET` | for LinkedIn sign-in | Keep server-side |

`.env` is gitignored; only `.env.example` is committed.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Express + Vite dev server on port 3000 |
| `npm run build` | Production client build to `dist/` |
| `npm run start` | Serves `dist/server.cjs` — see the note below |
| `npm run lint` | `tsc --noEmit` typecheck |
| `npm run clean` | Remove `dist/` |

## Known limitations

- The LinkedIn callback forwards the token-exchange response to the client
  rather than fetching the profile, so the display name falls back to "User".
  There is no server-side session — sign-in state lives in the page.
- OAuth `state` tokens are held in an in-memory `Map`, so they don't survive a
  restart or scale past a single instance.
- Job listings come from the model rather than a jobs API; results should be
  verified against the source before applying.
- There is no automated test suite yet; `npm run lint` is the current gate.
- `npm run start` expects a bundled `dist/server.cjs`, but `npm run build` only
  builds the client. Production serving needs a server bundle step that isn't
  wired up yet; `npm run dev` is the supported path today.

## Design history

The visual work was done in two documented passes, kept under `docs/`:

- `docs/design/plans/2026-07-01-visual-redesign.md`
- `docs/design/plans/2026-07-03-dossier-redesign.md`

with the accompanying design specs in `docs/design/specs/`.
