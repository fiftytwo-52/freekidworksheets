# MASTER INSTRUCTION FILE — Build "freekidworksheet.com" from Scratch (Static Multipage Astro Site)

> **Hand this file to any capable AI coding agent (Claude Code, Cline, Cursor, Gemini CLI, etc.)
> and it must build a complete, working, **static multi-page website** for
> **freekidworksheet.com** — a free printable worksheet library for kids — entirely from
> scratch on the Astro JS stack, following the playbook in "The AI Business That Changed My
> Life" (Astro + Tailwind + SEO + AdSense + Cloudflare Pages).**
>
> **This is a FROM-SCRATCH build.** There is no legacy codebase, no database, and nothing to
> migrate or import. Every file is authored new, in a fresh empty project folder.
>
> **Scope note:** this master file covers BUILDING THE SITE ONLY. Contact details,
> deployment, the domain, the SEO campaign, Analytics, and AdSense are deliberately
> deferred and are planned in **`postdev.md`** (perform AFTER development is complete).
> Every deferred integration ships as an "empty-safe" placeholder that does not block the
> build.

---

## 1. Mission

Create `freekidworksheet.com`: a fast, SEO-friendly, purely static library of free
printable kids' worksheets. The site is authored in the repo as markdown + image files and
rendered to plain HTML at build time. Agreed scope (do not re-open):

- **All worksheets are FREE.** No pricing, no paywall, no payment/WhatsApp flow.
- **Image-only worksheets.** Each worksheet is a single printable image + a unique text
  description. No PDF/DOCX downloads.
- **No bundles, no accounts, no admin system.** No login, no dashboard, no uploads, no
  captcha, no ratings, no database at runtime.
- **Content-as-code:** each worksheet = one folder with an `index.md` + an image. Adding a
  worksheet = adding files + a commit (deploying happens post-development).
- **Post-development work is deferred:** contact details, deployment, the domain, the SEO
  campaign, Analytics, and AdSense are NOT part of this build. They are planned in
  `postdev.md`; this build ships empty-safe placeholders for all of them.

The result is a 100% static multi-page application (MPA) — the exact profile the video
targets for rankings and AdSense.

## 2. Design reference (build this look & feel)

Define the design system FIRST in `src/styles/global.css` + the shared components, then
apply it consistently on every page.

### 2.1 Brand

- **Brand name:** "Free Kid Worksheets" (written `FreeKidWorksheets` in the wordmark).
- **Wordmark:** the brand name in the site header and footer, with each letter inside its
  own small rounded colored tile, arranged in a gentle fixed up/down wave (no animation).
  Tile colors cycle: **yellow → coral → blue → green → pink → purple → teal → orange**
  (repeat across letters; hyphens get a neutral/dark tile).
- **Brand mark:** a simple inline SVG icon representing the brand (e.g. a smiling pencil,
  star, or worksheet-sheet glyph) shown beside the wordmark and used as the favicon base.

### 2.2 Colors

- Neutrals: slate scale (background `slate-50` light / near-black dark mode).
- Primary accent: **indigo** (buttons, links hover, hero background, footer top border).
- Secondary accents: **amber/yellow** (search button, "Free" badges, print button),
  **emerald** (download buttons, "Free" states), coral/teal/green for the brand tiles.

### 2.3 Typography

- **Baloo 2** (weights 600/700/800) from Google Fonts for the brand wordmark and page
  headings.
- System + Tailwind sans stack for body text, labels, and buttons.

### 2.4 Overall page rhythm

- Sticky top navigation bar (light/dark aware), then a full-width hero on the home page,
  then content in a centered max-width container (e.g. `max-w-7xl`, padded), then a dark
  footer with legal links.
- Cards (worksheet thumbnails) on a light background with generous white space, rounded
  corners, subtle shadows, and hover lift.
- Dark mode toggle with no flash-of-wrong-theme on load (inline head script sets
  `data-theme` from `localStorage` before first paint, falling back to system preference).

---
## 3. The new stack (decided — do not negotiate)

| Concern | Choice |
|---|---|
| Framework | **Astro 5.x** (TypeScript, `.astro` files), **`output: "static"`** |
| Styling | **Tailwind CSS v4** compiled at build time into a bundled stylesheet |
| Pages | Static `.astro` pages + `getStaticPaths` for worksheet/category/pagination routes |
| Content | **Astro Content Collections** (markdown + image per worksheet) |
| Runtime DB | **None.** Everything is baked into static HTML at build time |
| Search | Static client-side search over a build-time `search-index.json` |
| Hosting (later) | **Cloudflare Pages** (free static hosting + global CDN) — deployment is post-dev |
| Auth/Security | **None needed** — no server, no user input, no sessions; headers via `_headers` |
| Validation | `astro check` + `npm run build` + `npm run verify` content script (§16) |

**Deployment target:** `output: "static"` only. The build produces `dist/`, deployed to
Cloudflare Pages post-development (see `postdev.md`). No adapter, no server runtime.

## 4. Non-negotiable constraints (the AI agent MUST obey all of these)

1. **MPA only.** Never build a single-page app or client-side router. Full page loads on
   navigation (Astro's default). This is an explicit SEO requirement.
2. **Static only.** `output: "static"`. No SSR, no serverless runtime, no database access
   at build or request time. All data is baked in at build time.
3. **All free.** No premium markers, no price display, no paywall, no WhatsApp/gmail
   handoff, no download-request forms. Every worksheet is instantly downloadable.
4. **Images only.** Only image files (jpg/png/webp) plus text descriptions. No PDF, no
   DOCX, no document download endpoints.
5. **No admin system of any kind.** No login page, no dashboard, no uploads, no captcha,
   no pending approvals, no session cookies, no visitor ratings.
6. **Content-as-code.** Worksheets are added by committing files (see §15). Nothing is
   ever written to a database at runtime.
7. **From-scratch code.** No scaffolding copied from tutorials or other repositories
   beyond the packages listed in §5. Write every file new.
8. **Design consistency.** Apply the §2 design system (brand tiles, colors, typography,
   nav, footer, dark mode) consistently across every page.
9. **SEO & AdSense foundations** (§13) are hard requirements: robots.txt, sitemap.xml,
   ads.txt, canonical/OG/JSON-LD/FAQPage, 4 legal pages linked in the footer and home.
10. `SITE_NAME` = `freekidworksheet.com`; tagline = `Free printable worksheets and question
    papers for kids`. Target US/international English; no i18n.
11. **No placeholders or stubs.** Every page, slot, and component listed below is fully
    implemented and wired.

## 5. Scaffold & dependencies

Set up the project in a NEW, empty folder (the working folder for this build). Use latest
stable versions (verify against current Astro docs at build time — add the official **Astro
Docs MCP server** to the agent plus the **Web Design Guidelines** and **Tailwind v4 docs**
skills, per the video workflow).

```bash
git init
npm create astro@latest . -- --template minimal --typescript strict --git false
npx astro add tailwind
npm i -D wrangler                # optional: CLI-based deploy later (see postdev.md)
```

TypeScript: `strict: true`. The app must pass `astro check` and `npm run build` with zero
errors. No framework UI (React/Vue/Svelte) — vanilla JS only, like the small scripts in §12.

---
## 6. Project structure (Astro)

```
free-kid-worksheets/
├── astro.config.mjs          # output: 'static', no adapter
├── package.json              # scripts: dev, build, preview, verify
├── .env                     # build-time env (SITE_URL, ADSENSE_PUBLISHER_ID, GA_ID, CONTACT_EMAIL)
├── public/                   # favicon set, _headers (security headers + temp-domain noindex),
│                             # _redirects (optional), worksheets-icon.png
├── src/
│   ├── content/
│   │   ├── config.ts         # Content Collection schema for 'worksheets'
│   │   └── worksheets/       # ONE FOLDER PER WORKSHEET:
│   │       └── <slug>/       #   index.md (frontmatter + description body)
│   │                         #   image.jpg|png|webp  (the printable worksheet image)
│   ├── layouts/Base.astro    # HTML shell: SEO meta, fonts, head-theme, nav, footer
│   ├── components/           # Brand.astro, SiteNav.astro, SiteFooter.astro, AdSlot.astro,
│   │                         # WorksheetCard.astro, FilterPanel.astro, Pagination.astro,
│   │                         # PopupAd.astro, RelatedGrid.astro, Faq.astro
│   ├── data/
│   │   └── site.ts           # site constants + popup-ad config + nav/footer links + FAQ list
│   ├── lib/
│   │   ├── content.ts        # collection queries: getAll, byKind, byCategory, getRelated,
│   │   │                     #   categories/ageGroups, paginate helper
│   │   ├── seo.ts            # meta/OG/JSON-LD builders
│   │   ├── pagination.ts     # page_window helper (ellipsis windows) + path builders
│   │   └── filter.ts         # shared card data-attribute helpers
│   ├── styles/global.css     # Tailwind v4 entry + brand/tile/hero/card/footer/popup CSS
│   ├── scripts/
│   │   ├── theme.ts          # theme toggle / hamburger / filter accordion
│   │   ├── browse-filters.ts # client-side filter+sort on library pages
│   │   ├── site-search.ts    # /search page client-side search over search-index.json
│   │   └── popup.ts          # once-per-session popup behavior
│   └── pages/
│       ├── index.astro                  # /
│       ├── worksheets.astro             # /worksheets (page 1)
│       ├── worksheets/page/[page].astro # /worksheets/page/2 …
│       ├── practice-questions.astro     # /practice-questions (page 1)
│       ├── practice-questions/page/[page].astro
│       ├── category/[category].astro     # /category/{cat}
│       ├── category/[category]/page/[page].astro
│       ├── worksheet/[slug].astro        # /worksheet/{slug}
│       ├── search.astro                  # /search (client-side, ?q= + search-index.json)
│       ├── about.astro | contact.astro | privacy-policy.astro | terms.astro
│       ├── 404.astro                     # branded custom error page
│       ├── search-index.json.ts          # prerendered JSON index of all worksheets
│       ├── sitemap.xml.ts                # prerendered from the content collection
│       ├── robots.txt.ts                 # prerendered (SITE_URL from env)
│       └── ads.txt.ts                    # prerendered (ADSENSE_PUBLISHER_ID from env)
└── tests/                   # verify.mjs content checks (§16)
```

Notes:
- Only `worksheet/[slug]`, `category/*`, and `*/page/[page]` need `getStaticPaths()`.
- `search-index.json`, `sitemap.xml`, `robots.txt`, and `ads.txt` are generated at build
  time from the content collection, so they always stay in sync with the source.

## 7. Configuration (.env — build-time only)

`.env` (read by the site during build; no runtime secrets exist):
- `SITE_URL` — canonical base (default `http://localhost:4321` during dev; real domain set
  post-dev).
- `SITE_NAME` — `freekidworksheet.com` (constant; hardcode in `src/data/site.ts`).
- `ADSENSE_PUBLISHER_ID` — empty by default (post-dev; drives `ads.txt`/ads snippet when set).
- `GA_ID` — empty by default (post-dev; injected in the head when present).
- `CONTACT_EMAIL` — empty by default (post-dev; drives the contact page when set).

All AdSense/GA/contact values are **empty-safe**: with env vars unset the site builds and
runs fine with placeholder comments and no scripts.

---
## 8. Content model & authoring (from scratch — content collections)

### 8.1 The `worksheets` collection

Define in `src/content/config.ts` (zod schema). One folder per worksheet
(`src/content/worksheets/<slug>/index.md` + `image.jpg|png|webp`). Frontmatter fields:

| Field | Type | Rule |
|---|---|---|
| `title` | string | Human title, e.g. "Letter A Tracing Practice" |
| `category` | string | One of the canonical categories (§8.4) |
| `ageGroup` | string | One of `3-4`, `5-6`, `7-8`, `9+` (or per-site label set) |
| `kind` | `'worksheet' \| 'question'` | `worksheet` = activity sheet; `question` = practice paper |
| `date` | date | Publish date (drives "newest first" ordering) |
| `description` | string | Unique 150–300 word educational description (see §13.2) |
| `image` | image reference | `./image.<ext>` next to `index.md` |
| optional | `tags: string[]` | e.g. ["tracing", "letters", "preschool"] |

Example:

```md
---
title: "Letter A Tracing Practice"
category: "Alphabet"
ageGroup: "3-4"
kind: "worksheet"
date: 2026-01-04
description: >-
  A fun lowercase and uppercase letter-A tracing sheet. Kids follow the dotted
  lines to build fine-motor skills while learning the shape and sound of A…
image: ./letter-a-alphabet-tracing.png
---
```

- `slug` comes from the folder name; keep slugs stable — renaming a folder changes the URL.
- Dates are ISO dates (`YYYY-MM-DD`).

### 8.2 Ordering & filtering rules

- Worksheets = `kind === 'worksheet'`; Question papers = `kind === 'question'`.
- Both lists order newest-first: `date` DESC, then a stable tiebreak (slug).
- Pagination = **20 per page** (`PER_PAGE = 20`) on every library page.
- Categories = sorted distinct set of `category` across all items.
- Age groups = sorted distinct set of `ageGroup`.

### 8.3 Sample content (provided by the site owner)

The site owner will supply sample printable worksheets. The build agent must **not**
generate worksheet images or ship placeholder artwork.

- The owner drops each printable into `src/content/worksheets/<slug>/` as `image.<ext>`
  (A4-ratio jpg/png/webp) and writes the matching `index.md` per §8.1 (with a unique
  150–300 word description each).
- During development, build from whatever the owner has placed in
  `src/content/worksheets/`. If the folder is empty when the site would otherwise be
  complete, **stop and ask the owner to add their sample printables** — the site must not
  ship with an empty library.
- Validate every sample with the §16 checks (schema, image file exists, unique
  description, generated pages). Categories/age-groups must fit the canonical lists
  (see §8.4) or extend them deliberately.

### 8.4 Canonical category list (keep these tidy)

Start with: **Alphabet & Tracing**, **Math**, **Coloring**, **Writing**, **Practice
Questions**. Keep the list in `src/data/site.ts` and reuse values exactly so category
pages and filters stay tight. (Add new categories later by editing the same list + frontmatter.)

### 8.5 Build-time collection queries (`src/lib/content.ts`)

Helper functions used by every page/component:
- `getAllWorksheets({ sort })` → sorted by date desc + slug tiebreak.
- `getWorksheets(kind)` / `getQuestionPapers()`.
- `getByCategory(cat)`.
- `getCategories()` / `getAgeGroups()` (sorted distinct).
- `getRelated(slug, limit = 4)` → same-category siblings excluding self.
- `paginate(items, page)` → `{ items, page, totalPages }` (clamps `page` to a valid range).

---
## 9. Static page generation (routes, `getStaticPaths`, pagination)

### 9.1 Route map

| Route | Kind | Generates |
|---|---|---|
| `/` | static | home, from `getAllWorksheets` (latest 8), questions (4), stats |
| `/worksheets` + `/worksheets/page/{n}` | `getStaticPaths` | full library, 20/page |
| `/practice-questions` + `/practice-questions/page/{n}` | `getStaticPaths` | question papers, 20/page |
| `/category/{category}` + `/category/{category}/page/{n}` | `getStaticPaths` | category-filtered, 20/page |
| `/worksheet/{slug}` | `getStaticPaths` | one per worksheet |
| `/search` | static | client-side search page |
| `/about /contact /privacy-policy /terms` | static | legal/info pages |
| `/404` | static | custom error page |
| `/search-index.json` | prerendered | JSON of all items for client search |
| `/sitemap.xml`, `/robots.txt`, `/ads.txt` | prerendered | SEO files |

### 9.2 Static pagination

- `PER_PAGE = 20`. For each list compute `totalPages = max(1, ceil(n/20))` and use
  `getStaticPaths` to emit `/worksheets` (page 1), `/worksheets/page/2`, …,
  `/page/{totalPages}`.
- Pagination bar shows a windowed set: `1 … 4 5 [6] 7 8 … 57` with ellipsis gaps; always
  present: page 1, last page, and ±2 around the current page. Current page marked
  `aria-current="page"`. Prev/Next arrows at each end.
- Links are **path-based** (`/worksheets/page/3`, `/category/Math/page/2`) — not `?page=N`.
- Page 1 lives at the bare path (`/worksheets`, not `/worksheets/page/1`) to avoid
  duplicate URLs.

### 9.3 `getStaticPaths` params

- `worksheet/[slug]`: `{ params: { slug } }` per item.
- `category/[category]` (+ nested `page/[page]`): one entry per (category, page). The route
  param must match the category exactly (lowercase-safe URL encoding; use the canonical
  folder name so the `category === param` match works).
- Inside each generated page, re-query the collection and render the shared `BrowseLayout`.

### 9.4 Build-time SEO files

- `search-index.json.ts` — `prerender = true`; returns `application/json` with an array of
  `{ slug, title, category, ageGroup, kind, description }` for every item, newest-first.
  Used by `/search` client-side.
- `sitemap.xml.ts` — lists home; `/worksheets` group (+ pages); `/practice-questions`
  group; every `/category/{cat}` (+ pages); every `/worksheet/{slug}`; the legal/static
  pages. Each entry gets `<lastmod>` from the item `date`, plus `<changefreq>`/`<priority>`.
- `robots.txt.ts`:
  ```
  User-agent: *
  Allow: /
  Sitemap: {SITE_URL}/sitemap.xml
  ```
- `ads.txt.ts` — `google.com, {ADSENSE_PUBLISHER_ID}, DIRECT, f08c47fec0942fa0` when set
  (auto-prefix `pub-`), else a placeholder comment.

---
## 10. Shared UI shell

### 10.1 Base layout (`layouts/Base.astro`)

HTML shell used by every page:
- `<meta charset>`, viewport, page `<title>` = `{pageTitle} - freekidworksheet.com`.
- SEO meta: description, canonical `<link>`, Open Graph (`og:title`, `og:description`,
  `og:image`, `og:type`), optional `meta robots` (`/search` → `noindex,follow`).
- Favicon link set (SVG favicon during build; full favicon pack is post-dev §postdev A4).
- Google Fonts preconnect + **Baloo 2** (600/700/800) for the brand and headings.
- Inline **head-theme script**: read `localStorage["fkwTheme"]`, fall back to
  `prefers-color-scheme`, set `data-theme` on `<html>` before first paint (no FOUC).
- Compiled `<link rel="stylesheet">` from Tailwind v4 + the brand CSS (no CDN at runtime).
- Head injection points (empty when unset): GA tag (`GA_ID`) and AdSense snippet.
- `body class="bg-slate-50 text-slate-800 flex flex-col min-h-screen dark…"`, `lang="en"`.
- Includes `<SiteNav />`, page content slot, `<SiteFooter />`, body-level ad/popup slots.

### 10.2 Brand (`Brand.astro`)

- `<a href="/" class="site-brand">` with:
  - a small brand SVG mark (pencil/sheet glyph) in a colored rounded square, and
  - the **`FreeKidWorksheets` wordmark** as individual letters, each inside its own
    rounded tile colored from the §2.1 cycle, arranged in a gentle fixed up/down wave.
- Used (scaled) in the header and the footer.

### 10.3 Site nav (`SiteNav.astro`)

- Sticky top bar: brand left; actions right.
- Right actions: dark/light **theme toggle** (sun/moon inline SVGs, `aria-label`/`title`=
  "Toggle dark or light mode") + a hamburger (3 bars) on small screens.
- Nav links (inline SVG icon + label): **home `/`, worksheets `/worksheets`, practice
  questions `/practice-questions`, about `/about`, contact `/contact`**.
- Hamburger toggles `.nav-open` + syncs `aria-expanded`; clicking a nav link closes the
  drawer. On phone/tablet the theme toggle also moves inside the drawer.

### 10.4 Footer (`SiteFooter.astro`)

- Dark slate footer with an indigo top border:
  - Column 1: brand + tagline blurb.
  - Column 2 — **Explore**: Home, Worksheets, Practice Questions, Search the library.
  - Column 3 — **Help & Legal**: About, Contact, Privacy Policy, Terms of Service
    (these four MUST be plainly visible on every page for AdSense).
- A content-disclaimer line ("worksheets are handmade or AI-generated; if any content
  matches your work, contact us and we'll remove it promptly") + a friendly note.
- `© {year} freekidworksheet.com — Made with care for curious little minds.`

### 10.5 Dark / light theme

- The `data-theme` attribute on `<html>` drives dark mode via CSS variables/overrides.
- Small global script toggles the theme on `.theme-toggle` clicks and persists to
  `localStorage["fkwTheme"]`; the head script applies the saved/system theme on load.
- Define the dark palette per §2: slate-900 page background, lighter text, adjusted card
  borders, and dimmed ad-slot fills — applied via `[data-theme="dark"]` CSS overrides.

### 10.6 Responsive behavior

- Desktop: full nav row, 4-column card grids (`lg:grid-cols-4`), edge ad slots visible
  (`xl:` and up).
- Tablet: 2-column grids, nav links condensed.
- Mobile (≥390px): hamburger nav, 1-column grids, filter panel collapsed behind its
  toggle, edge ad slots hidden, sticky footer ad visible. Test at 390px and desktop.

---
## 11. Public pages — full feature spec

### 11.1 Home (`/index.astro`)

1. **Hero** — indigo-dark rounded/edge-to-edge banner with white text:
   - Floating decor: a few soft CSS shapes + child-friendly emojis
     (`✏️ 📚 ⭐ 🎨 🧩 🖍️ ✂️ 🔤`) drifting behind the copy (decorative, `aria-hidden`).
   - Headline: "Fun Learning for Kids" with each word in a brand accent color.
   - Subtitle: "Download high-quality, printable A4 activity worksheets to help your little
     ones learn and grow."
   - **Search form** (`GET /search`, `name=q`, placeholder "Search worksheets, subjects,
     classes, topics…", amber Search button).
   - **Stats row**: circles/cards showing live counts — `{n} Worksheets` →
     `/worksheets`, `{n} Question papers` → `/practice-questions`, `{n} Categories` →
     `/worksheets` — computed at build time from the collection.
2. **Featured Worksheets** — the 8 latest worksheets as cards inside the reusable
   **client-side filter panel** (§11.2); category/age dropdowns are populated from the
   visible cards' `data-*` attributes.
3. **Practice Questions strip** — up to 4 latest `kind === 'question'` items.
4. **All-free banner** — a short section: "100% free, no signup, print anytime."
5. **FAQ section** — real Q&As (§13.2) with matching `FAQPage` JSON-LD.
6. **Footer** with the four legal links visible.
7. **Popup ad** (optional, from `src/data/site.ts`) — once per session, dismissible by
   close button / backdrop / Escape. Never combined with the sticky footer ad.
8. SEO: description "Free printable worksheets and practice question papers for kids —
   download and print quality worksheet images for nursery through class 6.", title
   `freekidworksheet.com | Free Printable Worksheets & Question Papers for Kids`, canonical
   `/`, WebSite + SearchAction JSON-LD (`/search?q={search_term_string}`).

### 11.2 Library pages (`/worksheets`, `/practice-questions`, `/category/[category]`)

Shared `BrowseLayout` driven by a small config (kicker/title/blurb/empty-message):

- **Data** (build time, via §8.5):
  - `/worksheets` → `kind === 'worksheet'`, date desc, 20/page.
  - `/practice-questions` → `kind === 'question'`, date desc, 20/page; kicker
    **"EXAM PREPARATION"**, title "Practice questions".
  - `/category/{cat}` → matching category, all kinds, 20/page.
- **Static pagination** (§9.2).
- **Client-side filter panel**: controls = Search text, Category, Age group, Kind
  (All / Worksheets / Question papers — skipped when the page is already filtered), Sort by
  (**Latest | A to Z**). Cards carry `data-title`, `data-category`, `data-age`, `data-kind`,
  `data-created`; sort = date desc or `localeCompare` on title. Live result count + empty
  state. The panel collapses to a toggle on mobile.
- **Worksheet card** (`WorksheetCard.astro`): thumbnail image (lazy, `aspect-[4/3]
  object-contain`), title link, meta line `Category • Age group`, a small emerald **"Free"**
  badge.
- Ad slots: leaderboard at top, banner at bottom (see §14).

### 11.3 Worksheet detail (`/worksheet/[slug].astro`)

1. Fixed **left + right edge ad slots** (`hidden xl:block fixed`, above page content).
2. Leaderboard ad below the nav.
3. `<h1>{title}</h1>`; meta line `Category • Age group` + a green **"Free"** tag.
4. **Worksheet image** — rendered large (A4 aspect, centered), `alt={title}`, via Astro
   images with responsive sizes for fast loading.
5. Description paragraph (the collection's unique 150–300 word text).
6. In-article 300×250 ad slot after the description.
7. **Download area**:
   - Primary indigo **"Download image"** — `<a href="{image path}" download>` (instant,
     free).
   - Secondary amber **"Print worksheet"** — `window.print()` with print-only CSS that
     hides nav/ad slots/footer/buttons and shows just the image full-size.
   - Note: "100% free — no signup needed. For personal/classroom use."
   - **Related grid** (up to 4 same-category siblings with age-group sub-line).
8. **Sticky footer ad** (mobile, with close `×`) at the bottom.
9. SEO: description = first ~200 chars (fallback `{title} — free printable {worksheet |
   question paper}[ for {ageGroup}.]`), title `{title} - freekidworksheet.com`, og:image =
   worksheet image, **LearningResource JSON-LD** (`learningResourceType`,
   `educationalLevel`, `teaches`, URL, provider Organization).

---
### 11.4 Search (`/search`)

- Static page. On load, `site-search.ts` reads `?q=` from the URL, fetches the build-time
  `search-index.json`, and filters client-side by title / description / category / ageGroup
  (case-insensitive substring).
- Results render as `WorksheetCard`s with a live count and an empty state ("No worksheets
  match your search."). Terms are HTML-escaped when injected.
- `noindex,follow` meta (search result pages shouldn't be indexed).

### 11.5 Static & legal pages

- **About** — what the site is, who it's for, how worksheets are made (keep an honest,
  friendly tone).
- **Contact** — renders a clean placeholder with a mailto link driven by `CONTACT_EMAIL`;
  real details are filled in post-dev.
- **Privacy Policy** — no accounts, no personal data collected, cookies used only for
  analytics when GA is enabled; how to contact. Keep it accurate to the final build.
- **Terms / Disclaimer** — free personal/classroom use, content disclaimer, IP removal
  request path.
- All four legal/info pages are linked in the footer AND the home page (AdSense requires
  clearly visible links).

### 11.6 404

- Branded custom error page using the same nav/footer shell, a friendly "Page not found"
  message, a search box, and a link back home. Never Astro's default.

## 12. Client-side scripts (small, dependency-free)

1. `theme.ts` — theme toggle, hamburger drawer, filter accordion (event-delegated on
   `document`, like §10.5).
2. `browse-filters.ts` — library/home filter+sort controller (§11.2).
3. `site-search.ts` — `/search` behavior over `search-index.json` (§11.4).
4. `popup.ts` — once-per-session popup: `sessionStorage` key, close button / backdrop /
   Escape dismiss, ARIA `hidden` toggling.
5. Inline head-theme snippet — first-paint theming, no FOUC.
6. Ad-close buttons are inline (`this.closest('.ad-slot').remove()`), like the AdSlot
   component spec in §14.

Use inline SVG icons throughout (nav links, home search, download, printer, theme sun/moon,
hamburger, ad-close ×) and match the icon style (stroke-based, `currentColor`). Set
`aria-label` / `aria-expanded` correctly everywhere. No frameworks.

---
## 13. SEO foundations (built now, empty-safe — campaign is in postdev.md)

Build the SEO *structure* now so the site is launch-ready; the actual SEO *work* (keyword
research, competition analysis, AdSense application, submitting to search engines) happens
post-development per **postdev.md**.

### 13.1 Core meta (every public page)

- Unique `<title>` = `{pageTitle} - freekidworksheet.com`.
- Unique meta description; canonical `<link rel=canonical href={SITE_URL + path}>`.
- Open Graph: `og:title`, `og:description`, `og:image` (absolute URL; default
  `{SITE_URL}/assets/worksheets-icon.png`), `og:type` (`website`).
- `meta robots` = `noindex,follow` on `/search`.
- JSON-LD: home `WebSite` + `SearchAction`; worksheet detail `LearningResource`;
  homepage `FAQPage`. Escape `</` inside JSON-LD (`<\/`) so user text can never break out
  of the `<script>` tag.
- Write natural, specific, human-first copy (titles, H1s, descriptions). Do not stuff
  keywords; the real keyword mapping happens post-dev.

### 13.2 Content requirements (AdSense-grade quality, from day one)

- Each worksheet **description** is the single source of on-page uniqueness: 150–300
  unique words (learning objective, how to use, age/classroom fit). Never template them.
- Home + library pages carry a substantive intro/SEO block (600+ words across the key
  pages) explaining what the library is, how it's organized, who it's for, and how to
  print/download.
- **FAQ section** (home): real questions with real answers, e.g.:
  - "Are these worksheets really free? What's the catch?"
  - "What age groups do your worksheets cover?"
  - "Are the worksheets A4 print-ready?"
  - "Can I use these worksheets in my classroom?"
  - "Do you offer practice question papers too?"
  - "Can I request a specific worksheet topic?"
  Each with a 2–4 sentence honest answer + matching `FAQPage` JSON-LD.
- All four legal pages linked in the footer and home (AdSense requirement).

### 13.3 Platform files & branding

- `sitemap.xml`, `robots.txt`, `ads.txt` — see §9.4; all render from `SITE_URL` /
  `ADSENSE_PUBLISHER_ID`, always correct and empty-safe.
- Favicon: ship the SVG brand mark as the favicon during the build; generating the full
  favicon/app-icon pack is a **post-dev branding task** (postdev.md A4).
- Google Analytics: head already has an injection point; `GA_ID` is dropped in post-dev.
- AdSense: head injection point + `ads.txt` generator are ready; enabling AdSense is a
  **post-dev task** (postdev.md H).

## 14. Ad slots & monetization

`AdSlot.astro` renders a clearly-labeled placeholder that will later host AdSense units.
**No real ad network code is wired during development** — activating ads (publisher ID,
review, auto ads) is a post-dev task in `postdev.md`:

| Slot class | Placement | Dimensions | Close? |
|---|---|---|---|
| `ad-sidebar` | Fixed left/right edges (worksheet detail only) | 160×600 | no |
| `ad-leaderboard` | Below the nav (home, libraries, worksheet detail) | 728×90 / 320×50 | no |
| `ad-rectangle` | In-article, after the description (worksheet detail) | 300×250 | no |
| `ad-banner` | End of library/category pages; below detail download area | 728×90 / 320×50 | no |
| `ad-sticky` | Sticky mobile footer bar | 320×50 mobile | **yes** (`×`, removes the slot) |

- The sticky footer ad and the home popup ad must **never render together** on one view.
- `ad-sidebar` hidden below the `xl` breakpoint.
- Every slot shows an unobtrusive "Advertisement"/"Sponsored" label and keeps clear spacing
  from the download button (no accidental clicks).
- **Popup ad** is configured in `src/data/site.ts` (not a database):
  `{ active: boolean, image: '<path in public/ads>', aspectRatio: '1:1'|'9:16'|'16:9'|'4:3'|'3:4', redirectUrl?: string }`.
  Rendered on home only when `active`; redirect URLs must be plain `http(s)`.

---
## 15. Content workflow — "push new worksheets from the codebase"

This is the ONLY way worksheets change. There is no CMS, no upload form, no database.

### 15.1 Adding a worksheet (document this in the README)

1. Create the folder `src/content/worksheets/<slug>/`.
2. Add the printable worksheet image as `image.<ext>` (jpg/png/webp; A4 aspect; optimize
   for the web).
3. Write `index.md` with the §8.1 frontmatter and a unique 150–300 word description. Use
   canonical `category`/`ageGroup` values (§8.4).
4. Run `npm run build` locally to catch schema errors; commit + push.
5. Deployment happens **post-development** (postdev.md): with Cloudflare Pages git
   integration, every push to `main` will auto-build and auto-deploy.

### 15.2 Editing / removing

- Edit = change `index.md` (title/description/category/age) or replace the image; commit;
  deploy. `slug` lives in the folder name — renaming changes the URL; add `_redirects`
  rules if you must move content.
- Remove = delete the folder; commit; deploy. Old URLs 404; optionally add redirects in
  `public/_redirects`.

### 15.3 Keeping SEO tidy as content grows

- Reuse the canonical category/age-group lists (§8.4) so `/category/{slug}` pages stay
  tight; the sitemap regenerates at every build.
- Run `npm run verify` (§16) before every deploy so you never ship a broken page.

## 16. Validation & testing

There is no backend, so validation is build-time and content-level:

1. **Build-time correctness** — `astro check` (TypeScript + content schema) and
   `npm run build` must both pass with zero errors.
2. **`npm run verify`** (`tests/verify.mjs`) — a Node script run after `astro build`:
   - Every worksheet entry passes the zod schema and its `image` file exists.
   - Every description is unique and ≥ 60 chars (flag thin content for review).
   - Generated `dist/` contains: `/`, `/worksheets`, `/worksheets/page/2` (when >20 items),
     `/practice-questions`, one `/worksheet/{slug}` per entry, every `/category/{cat}`,
     each legal page, `/404`, `search-index.json`, `sitemap.xml`, `robots.txt`, `ads.txt`.
   - `sitemap.xml` lists every worksheet slug (count matches the collection).
   - CSS/JS assets referenced by built HTML exist (no 404s on asset nodes).
3. **Manual visual check** — home, library, a worksheet detail, search, 404 at 390px and
   desktop; toggling dark mode; popup once-per-session behavior.
4. **Link check** — crawl `dist/` (`npx linkinator dist`) to confirm no internal broken
   links.

## 17. Deployment — DELIBERATELY DEFERRED (see postdev.md)

Do NOT deploy, buy the domain, connect Cloudflare, submit to search engines, or enable
ads during development. During development the site must only be built and verified
locally:

- `npm run dev` — local preview works: home, filters, search, pagination, download, print,
  dark mode, popup.
- `npm run build` — emits a clean static `dist/` (static output only, no server/adapter).
- `npm run verify` — the §16 checks all pass.

One small build-side preparation is done NOW: `public/_headers` exists (security headers +
noindex of the temporary Cloudflare domain), and `SITE_URL` / `ADSENSE_PUBLISHER_ID` /
`GA_ID` / `CONTACT_EMAIL` are empty-safe config placeholders.

The complete launch procedure — buy `freekidworksheet.com`, connect it to Cloudflare,
deploy to Cloudflare Pages, add apex + www custom domains, kill duplicate content, Google
Search Console, Bing Webmaster Tools, Google Analytics, the AdSense application, and
enabling real ads — is documented step-by-step in **`postdev.md`**.

---
## 18. Definition of done (acceptance checklist)

- [ ] `output: "static"`, `astro check` clean, `npm run build` green, no adapter/server.
- [ ] No backend: no admin, no login, no database at runtime, no uploads, no bundles, no
      rating system, no WhatsApp/premium/request-download code anywhere.
- [ ] Sample printables provided by the owner are imported and the library is not empty;
      every sample passes the §16 checks (schema, image file exists, unique description,
      generated pages).
- [ ] All §11 pages exist and render: home (hero + stats + featured + FAQ), libraries with
      static pagination, category pages, worksheet detail with **Download image** +
      **Print**, client-side search, legal pages, branded 404.
- [ ] Design consistency: brand tiles, color system, nav, footer, dark mode (§2/§10)
      applied everywhere; responsive at 390px (iPhone 14 Pro Max) and desktop.
- [ ] Filters + sort work client-side on library/home; search works over
      `search-index.json`; pagination links go to real static pages with `aria-current`.
- [ ] SEO foundations present (empty-safe): robots.txt + sitemap.xml (all slugs) + ads.txt
      + canonical/OG/JSON-LD on every public page; `/search` noindexed; FAQ + FAQPage
      schema; head injection points for `GA_ID` / AdSense ready.
- [ ] Ad slots placed per §14 with popup once-per-session; sticky + popup never co-render.
- [ ] `npm run verify` passes (schema, image files, dist contents, sitemap counts,
      asset existence) and an internal link crawl finds no broken links.
- [ ] Privacy/Terms/Contact/About linked in footer and home; Contact shows a clean
      placeholder until real details are added post-dev; good content depth (unique 150–300
      word descriptions; 600+ word library info block).
- [ ] **Not part of this build (deferred to `postdev.md`):** domain purchase, Cloudflare
      Pages deployment, custom domains, Search Console / Bing submission, Google Analytics,
      AdSense, real contact details, favicon/brand polish.
- [ ] README documents the "add a worksheet" recipe (§15.1), the canonical category list
      (§8.4), and links to `postdev.md` for the launch plan.

**Build order (recommended):** scaffold + content schema → add the owner's sample
printables (§8.3) → layouts/brand/nav/footer/theme → home → library + pagination + filters →
worksheet detail (download + print + related) → search → legal + 404 → SEO foundations
(robots/sitemap/JSON-LD, empty-safe) → ad slots + popup → verify script + link crawl →
**development complete. Then follow `postdev.md` for the launch.**

---

### Appendix A — site constants

| Constant | Value |
|---|---|
| Site name / domain | **`freekidworksheet.com`** |
| Brand name (wordmark) | `FreeKidWorksheets` |
| Tagline | `Free printable worksheets and question papers for kids` |
| Page title suffix | `- freekidworksheet.com` |
| Footer copyright | `© <year> freekidworksheet.com` |
| Brand tile color cycle | yellow → coral → blue → green → pink → purple → teal → orange |
| Primary accent | indigo; Secondary accents | amber/yellow, emerald |
| Headings font | Baloo 2 (600/700/800) |
| Categories (start) | Alphabet & Tracing, Math, Coloring, Writing, Practice Questions |
| Age groups (start) | `3-4`, `5-6`, `7-8`, `9+` |
| `PER_PAGE` | 20; sort newest first (`date` desc, slug tiebreak) |
| Contact email | deferred (`CONTACT_EMAIL` env; postdev.md A1) |
| Theme storage key | `localStorage["fkwTheme"]` |

- All worksheet downloads are FREE and instant; pricing/WhatsApp/payment text is gone.
- This project is built entirely from scratch — there is no legacy code, database, or
  migration step anywhere in the repository.