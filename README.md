# freekidworksheets.com

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

Every published worksheet consists of one Markdown file and one image inside
`src/content/worksheets/`:

```
src/content/worksheets/
├── letter-a-alphabet-tracing-4050.md
└── 4050.png
```

Worksheet planning, prompts, and source images may be kept in an external
staging folder outside this repository. That folder is not used by the site.
For publication, copy the finalized image into `src/content/worksheets/` and
create its Markdown file there. Moving, renaming, or deleting the external
staging folder cannot affect worksheets already published in this directory.

Worksheet frontmatter is validated at build time by the Zod schema in
`src/content/config.ts`:

```yaml
---
title: Letter A Alphabet Tracing          # 3+ chars — becomes the h1 and <title>
code: "4050"                              # unique 4- or 5-digit search code
category: Alphabet & Tracing              # reuse an existing category
ageGroup: "3-4"                           # normally: 3-4, 5-6, 7-8, or 9+
date: 2026-09-05                          # publish date (drives newest-first ordering)
description: >-                           # unique real copy, 60–4,000 characters
  Practice writing the letter A with this free printable tracing worksheet
  designed for nursery and preschool learners.
image: ./4050.png                          # repository-relative JPG/PNG/WEBP path
tags: [alphabet, tracing, letters]        # optional; feeds search and structured data
language: en                              # en | ne
colorType: black-and-white                # black-and-white | colorful
---
```

The body of the Markdown file is unused — the description field is the page
copy. The image is optimized by Astro's `<Image>` pipeline automatically.

**Rules of thumb:**

- The Markdown filename is the URL slug: `/worksheet/letter-a-alphabet-tracing-4050`.
- Each worksheet has one `.md` record and one referenced repository image.
- Never reference an external staging path from frontmatter.
- Descriptions must be unique — `npm run verify` fails the build on duplicates.
- Images should be A4-ratio scans/exports (JPG, PNG, or WEBP). No PDFs.

### Worksheet topics and categories

Supported worksheet topics and activities include body parts, shapes, nursery,
English, maths, emotions and feelings, all-about-me, drawing, weather, alphabet
and tracing, coloring, writing, reading comprehension, matching, counting,
sorting, and puzzles. These are topic/activity ideas rather than automatic
category names. Reuse the closest category already defined in `src/data/site.ts`
unless the project owner explicitly approves a new category.

### What happens automatically when you add an entry

- A detail page at `/worksheet/{slug}` with download/print actions, related
  worksheets, and LearningResource JSON-LD.
- Inclusion in `/worksheets`, the matching `/category/{category}` page, the
  home-page featured strip, the client-side search index (`search-index.json`),
  and `sitemap.xml`.
- Pagination splits automatically at 20 items per page.

## Editing / removing

- **Edit:** change the frontmatter or swap the repository image, then rebuild.
- **Remove:** delete the Markdown record and its unused image. The detail page,
  index entries, and sitemap entry disappear on the next build.

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
│   ├── config.ts   # worksheets collection schema (Zod)
│   └── worksheets/ # published worksheet Markdown records and images
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

The production canonical domain is `https://freekidworksheets.com`. Temporary
worksheet staging documentation may be stored outside this repository and is
not required for building or deploying the site.

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
