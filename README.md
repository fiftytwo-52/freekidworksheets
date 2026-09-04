# freekidworksheet.com

A free printable worksheet library for kids — a fully static multi-page site built with **Astro 5** and **Tailwind CSS v4**, styled with a Geist-inspired design system (ink on canvas, hairline borders, mono eyebrows, mesh-gradient hero).

- **No backend.** Every page is pre-rendered HTML.
- **No accounts, no paywalls.** Worksheets are free for personal and classroom use.
- **Content as code.** Worksheets live in the repo; publishing is a commit + build.

---

## Quick start

```bash
npm install
npm run dev       # local dev server
npm run check     # astro check (TypeScript + content schema)
npm run build     # static build to dist/ (runs verify automatically)
npm run verify    # post-build verification (tests/verify.mjs)
```

Requires Node >= 18.17.1.

---

## Adding a worksheet (the content workflow)

Every worksheet is a folder under `src/content/worksheets/` containing one
Markdown file and one image:

```
src/content/worksheets/
└── letter-a-alphabet-tracing/
    ├── index.md
    └── letter-a-alphabet-tracing.png
```

`index.md` frontmatter (validated at build time by the zod schema in
`src/content/config.ts`):

```yaml
---
title: Letter A Alphabet Tracing          # 3+ chars — becomes the h1 and <title>
category: Alphabet                        # must match a canonical category (below)
ageGroup: "3-4"                           # one of: 3-4, 5-6, 7-8, 9+
kind: worksheet                           # worksheet | question
date: 2025-01-15                          # publish date (drives newest-first ordering)
description: >-                           # UNIQUE 150-300 words of real copy (min 60 chars)
  Practice writing the letter A with this free printable tracing
  worksheet… (150-300 words, no duplication with other entries)
image: ./letter-a-alphabet-tracing.png    # A4 JPG/PNG/WEBP, relative to the .md file
tags: [alphabet, tracing, letters]        # optional; feeds the LearningResource JSON-LD
---
```

The body of the Markdown file is unused — the description field is the page
copy. The image is optimized by Astro's `<Image>` pipeline automatically.

**Rules of thumb:**

- The folder name is the URL slug: `/worksheet/letter-a-alphabet-tracing`.
- One worksheet per folder; image and `.md` live side by side.
- Descriptions must be unique — `npm run verify` fails the build on duplicates.
- Images should be A4-ratio scans/exports (JPG, PNG, or WEBP). No PDFs.

### Canonical categories

Keep categories tidy — they drive navigation, category pages, and filters:

`Alphabet`, `Numbers & Counting`, `Coloring`, `Math`, `General Knowledge`

(Defined in `src/data/site.ts` as `CATEGORIES`; age groups as `AGE_GROUPS`.)

### What happens automatically when you add an entry

- A detail page at `/worksheet/{slug}` with download/print actions, related
  worksheets, and LearningResource JSON-LD.
- Inclusion in `/worksheets` or `/practice-questions` (by `kind`), the
  matching `/category/{category}` page, the home-page featured strip, the
  client-side search index (`search-index.json`), and `sitemap.xml`.
- Pagination splits automatically at 20 items per page.

## Editing / removing

- **Edit:** change the frontmatter or swap the image, then rebuild.
- **Remove:** delete the folder. The detail page, index entries, and sitemap
  entry disappear on the next build — nothing else to clean up.

## Keeping SEO tidy as content grows

- Every entry needs a unique 150-300 word description (thin or duplicated
  content fails `npm run verify`).
- Titles should read naturally: "Letter A Alphabet Tracing" not "Worksheet 7".
- Set an accurate `date` — newest items appear first and get featured.
- After big content changes, run `npx linkinator dist` to crawl for broken
  internal links.

---

## Project structure

```
src/
├── components/     # UI: Base shell pieces, cards, filters, pagination, ads
├── content/
│   ├── config.ts   # worksheets collection schema (zod)
│   └── worksheets/ # one folder per worksheet (.md + image)
├── data/site.ts    # site constants: categories, age groups, nav, FAQs, ads
├── layouts/        # Base.astro — HTML shell, meta, theme, nav/footer
├── lib/            # content queries, SEO helpers, pagination, filter attrs
├── pages/          # routes (home, libraries, category, worksheet, search, legal, 404)
├── scripts/        # client-side JS: theme, browse filters, search, popup
└── styles/         # global.css — Tailwind v4 theme tokens + custom styles
tests/verify.mjs    # post-build verification
public/_headers     # Cloudflare Pages security headers (ships ready)
```

## Configuration (build-time only, `.env`)

All optional and empty-safe — the site builds and verifies without them:

| Variable                | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `SITE_URL`              | Canonical origin (sitemap, robots, JSON-LD) |
| `ADSENSE_PUBLISHER_ID`  | Generates the real `ads.txt` line       |
| `GA_ID`                 | Google Analytics tag in `<head>`        |
| `CONTACT_EMAIL`         | Mailto links on contact/privacy/terms   |

Deployment (domain, Cloudflare Pages, Search Console, AdSense) is
deliberately deferred — see `postdev.md` for the full launch procedure.

## Design system

Geist-inspired tokens live in `src/styles/global.css` (`@theme`): canvas
`#fafafa`, ink `#171717`, hairline `#ebebeb`, accent `#0070f3`, Geist Sans +
Geist Mono. Dark mode via `data-theme="dark"` on `<html>` (no FOUC — applied
pre-paint by an inline script). Full reference in `DESIGN.md`.

## Validation

Per MASTER-INSTRUCTION §16:

1. `npm run check` — TypeScript + content schema, zero errors.
2. `npm run build` — clean static `dist/` (runs verify via postbuild).
3. `npm run verify` — content quality, route inventory, sitemap completeness,
   asset integrity, search-index sanity.
4. Manual visual pass at 390px + desktop, dark mode, popup behavior.
5. `npx linkinator dist` — no internal broken links.
