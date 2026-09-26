# freekidworksheets.com — Complete Fix & Task List

**For the agent:** Work through every task below in order (P0 → P1 → P2 → P3). Do not skip tasks.
For each task: read the "Do" steps, make the change in the site's codebase, then verify with the
"Done when" criteria. If a task cannot be completed (missing access, missing info), mark it BLOCKED
with the reason and continue with the next task. When finished, send the completion report described
at the bottom of this file.

**Site facts (verified 2026-09-26):** Astro static site. URLs: `/` (home),
`/category/<Name>` (e.g. `/category/Coloring`), `/category/<Name>/page/<n>`,
`/worksheet/<slug>-<code>` (e.g. `/worksheet/akshar-herera-joda-milaunuhos-nepali-4001`),
plus `/nepali`, `/spanish`, `/about`, `/contact`, `/privacy-policy`, `/terms`.
Images served as `.webp` from `/_astro/`. `robots.txt` allows `/`, disallows `/search`,
declares `Sitemap: https://freekidworksheets.com/sitemap-index.xml` (valid, keep it).

---

## P0 — INDEXING (do these first; nothing else matters if pages aren't indexed)

### TASK-01: Verify Google Search Console and submit sitemap
**Why:** A `site:freekidworksheets.com` Google search currently returns ONLY the homepage —
category and worksheet pages appear unindexed.
**Do:**
1. Confirm the site property is verified in Google Search Console (GSC).
2. GSC → Sitemaps → submit `https://freekidworksheets.com/sitemap-index.xml` if not already submitted.
3. GSC → URL Inspection → inspect `https://freekidworksheets.com/` and 5 worksheet URLs
   (pick from different categories) → "Request indexing" for each.
**Done when:** Sitemap status is "Success" in GSC; 6 URLs requested for indexing; screenshot or
written confirmation of sitemap status saved.

### TASK-02: Triage index coverage
**Why:** Find out exactly why worksheet/category pages aren't indexed.
**Do:**
1. GSC → Pages → list all URLs under "Why pages aren't indexed".
2. For each exclusion reason, record: reason, example URLs, count.
3. Common cases and actions:
   - "Discovered – currently not indexed" → pages need more unique content (see TASK-06);
     after fixing, request indexing for the top 20.
   - "Crawled – currently not indexed" → same as above.
   - "Duplicate without user-selected canonical" → check canonical tags (TASK-14).
   - "Not found (404)" → remove dead URLs from the sitemap (TASK-03).
**Done when:** A written coverage summary exists (reason → count → action taken), and indexing has
been requested for all fixable pages.

### TASK-03: Clean the sitemap
**Why:** Sitemap must contain only live, public, 200-OK pages.
**Do:**
1. Fetch every URL in `sitemap-index.xml` → `sitemap-0.xml` and record HTTP status.
2. Remove any URL returning 404/500, and any `/search` or admin URLs.
3. Confirm every remaining public page (all categories, all worksheets, about/contact/privacy/terms,
   nepali/spanish hubs) IS in the sitemap — add any missing.
**Done when:** 100% of sitemap URLs return 200; zero public pages missing from sitemap.

---

## P1 — CONTENT (the main ranking work)

### TASK-04: Rewrite the homepage FAQ in natural language
**Why:** Current FAQ answers are keyword-stuffed and read as written for crawlers, not humans.
Real examples to fix: *"english for kids worksheet, maths kids worksheet, shapes for kids worksheet,
body parts for kids worksheet, weather for kids worksheet, drawing for kids worksheet…"* and
*"kids worksheets free download and printable activity pages"*. This risks Google spam penalties.
**Do:**
1. Rewrite every FAQ answer in plain, helpful language — as if answering a parent.
2. Rules: each target keyword appears at most ONCE per answer, only where natural;
   no comma-separated keyword lists; keep answers to 2–4 sentences.
3. Keep the Nepali-worksheets question — it's a genuine differentiator.
4. After rewriting, add `FAQPage` JSON-LD structured data to the homepage whose questions/answers
   match the visible text exactly.
**Done when:** Reading the FAQ aloud sounds like a human wrote it; Rich Results Test shows valid
`FAQPage` schema on `/`.

### TASK-05: Fix false content claims on the homepage
**Why:** The FAQ currently promises *"1st grade math worksheets, 3rd grade math worksheets,
4th grade math worksheets"* — but the library is early-learner focused (Nursery–Grade 2, plus a
Grade 3+ filter). Don't promise what doesn't exist.
**Do:** Edit the math FAQ answer (and any other copy) so claimed grades/subjects match the actual
library. Either remove the 3rd/4th-grade claims or add that content — default to removing claims.
**Done when:** No page on the site promises a grade level or subject with zero worksheets behind it.

### TASK-06: Write unique "About this worksheet" text for every worksheet page
**Why:** Every worksheet page currently uses the same fill-in-the-blank template
(e.g. *"<title> सम्बन्धी नेपाली अभ्यास पत्रले बालबालिकालाई पढ्ने, मिलाउने, लेख्ने वा रङ भर्ने
सीप अभ्यास गराउँछ।"*). 200+ near-identical pages = thin content = the likely cause of TASK-01's
indexing problem.
**Do:**
1. For EACH worksheet page, write 2–3 UNIQUE sentences covering: (a) what the child actually does
   on this sheet, (b) which skill and age group it's for, (c) the theme.
2. NEVER publish the same sentence on two pages. Use a tracking sheet (URL → text written → date).
3. Work in batches of 20 pages/day. Prioritize order: (1) pages with GSC impressions/clicks,
   (2) Coloring + Alphabet & Tracing categories, (3) everything else.
4. For Nepali worksheets, write the about text in natural Nepali (chandrabindu ँ, never bindu ं).
**Done when:** Zero worksheet pages share identical "About" paragraphs (spot-check 20 random
pairs); tracking sheet complete.

### TASK-07: Clean worksheet titles (fix the data pipeline)
**Why:** Category grids show broken titles: *"Weather word matching 2 - kg.png"* (file extension
in title) and *"About me writing about self Worksheet About me writing about self Worksheet"*
(doubled title — alt text + title concatenated).
**Do:**
1. Find where card titles are generated (template or data file). Fix at the SOURCE so new uploads
   are clean:
   - Strip file extensions (`.png`, `.jpg`, `.jpeg`, `.webp`) from titles.
   - Dedupe: if the title string already ends with "Worksheet", don't append "Worksheet" again;
     collapse any doubled phrases.
   - Apply title case consistently.
2. Re-render/rebuild the site and visually check all category grids.
**Done when:** Zero titles site-wide contain `.png`/`.jpg`/`.webp`; zero doubled titles
(automated scan of built HTML to confirm).

### TASK-08: Add real intro copy to every category page
**Why:** Category pages (e.g. `/category/Coloring`) have a single intro sentence:
*"Every free printable coloring resource in the library — filter by age group, then download
and print."* That's thin content on pages that should rank for "coloring worksheets for kids".
**Do:** Write 150–250 words of UNIQUE copy per category (Alphabet & Tracing, Coloring, Math,
Writing, and any others). Cover: what parents/teachers find here, skills covered, age range,
how to use the sheets (print tips). Natural keyword use, no stuffing.
**Done when:** Every `/category/*` page has ≥150 words of unique intro copy above the grid.

---

## P2 — STRUCTURE & TECHNICAL SEO

### TASK-09: Fix Related Worksheets (verify + server-render)
**Why:** Worksheet pages show a "Related Worksheets" heading with NO links in the HTML.
Either it's empty or JS-rendered — both are bad for SEO and users.
**Do:**
1. Check the worksheet page template: is the related section populated? Is it server-rendered?
2. Implement: 4–8 related worksheet links per page — same category first, then same age group.
3. Links must be plain `<a href>` in the server-rendered HTML (visible with JS disabled / in curl).
**Done when:** "Related Worksheets" on 5 sampled pages each shows 4–8 working links present in
raw HTML (verify with JS disabled).

### TASK-10: Add breadcrumbs (visible + schema)
**Why:** No breadcrumbs exist; they aid navigation, internal linking, and rich results.
**Do:** On every worksheet page add a visible breadcrumb: Home › [Category] › [Worksheet title],
each crumb a link (last item plain text). Add matching `BreadcrumbList` JSON-LD.
**Done when:** Breadcrumb visible on 5 sampled worksheet pages; Rich Results Test validates
`BreadcrumbList`.

### TASK-11: Unique titles, meta descriptions, and social tags on every page
**Why:** Could not be verified in the audit — assume missing/duplicated until checked.
**Do:**
1. Crawl the built site; list every page's `<title>` and `<meta name="description">`.
2. Fix: `<title>` 50–60 chars, primary keyword near the front, ends ` - freekidworksheets.com`,
   unique per page. Meta description 140–160 chars, natural sentence incl. "free printable",
   unique per page.
3. Add Open Graph + Twitter Card tags on every page: `og:title`, `og:description`,
   `og:image` (1200×630 worksheet preview), `og:url`, `twitter:card=summary_large_image`.
**Done when:** Automated scan shows zero duplicate titles, zero duplicate/empty meta descriptions,
and OG tags present on all page types.

### TASK-12: Clean H1 usage
**Why:** The H1 appears to include the site-name suffix (`... - freekidworksheets.com`),
which belongs only in `<title>`.
**Do:** On every page template: exactly ONE `<h1>` = the page's topic title only
(e.g. `Akshar herera joda milaunuhos — नेपाली अभ्यास पत्र`). Logical `<h2>`/`<h3>` below;
no skipped levels.
**Done when:** Scan of built HTML: exactly one H1 per page, none containing the site domain.

### TASK-13: Migrate category URLs to lowercase slugs
**Why:** Current URLs use capitals and encoded characters: `/category/Coloring`,
`/category/Alphabet%20&%20Tracing`. Lowercase hyphenated URLs are cleaner and safer.
**Do:**
1. New slugs: `/category/coloring`, `/category/alphabet-tracing`, `/category/math`,
   `/category/writing` (same pattern for any others).
2. Add 301 redirects old → new. Update ALL internal links, the sitemap, and canonical tags.
3. Keep pagination working: `/category/coloring/page/2` etc.
**Done when:** Old URLs 301 to new; new URLs return 200; sitemap uses only new URLs;
zero internal links point to old URLs.

### TASK-14: Verify canonical tags
**Do:** Every public page must have exactly one absolute `<link rel="canonical">`
self-referencing its own (new, lowercase) URL — including paginated pages
(`/category/coloring/page/2` canonicals to itself, NOT to page 1).
**Done when:** Scan confirms one correct canonical per page, zero canonicals pointing at
redirected/old URLs.

### TASK-15: Add structured data to worksheet pages + homepage
**Do:**
1. Every worksheet page: `LearningResource` JSON-LD with `name`, `description` (the unique
   about text from TASK-06), `inLanguage` (`"ne"` for Nepali sheets, `"en"` otherwise),
   `audience` (age range), `isAccessibleForFree: true`, `learningResourceType`.
2. Homepage: `Organization` JSON-LD with `name`, `url`, `logo`.
3. (TASK-04 already covers `FAQPage` on the homepage; TASK-10 covers `BreadcrumbList`.)
**Done when:** Rich Results Test validates all schema types on sampled pages with zero errors.

### TASK-16: Image SEO + performance pass
**Do:**
1. Alt text on every worksheet image: describe the sheet —
   pattern: `Free printable <topic> worksheet for <age>` (e.g.
   `Free printable Nepali vowel tracing worksheet (अ आ इ) for UKG`). Never empty, never the filename.
2. Re-scan for broken images (zero 404s).
3. Run PageSpeed Insights on `/`, one `/category/*`, one `/worksheet/*`. Fix: LCP < 2.5s
   (preload/LCP image `fetchpriority="high"`), CLS < 0.1, below-fold images `loading="lazy"`
   WITH width/height attributes.
**Done when:** Zero empty/ filename alt texts (scan); zero broken images; all three page types
pass Core Web Vitals.

### TASK-17: Language markup for Nepali (and Spanish) pages
**Do:**
1. Nepali worksheet pages and `/nepali` hub: `<html lang="ne">`; natural Nepali (or bilingual)
   meta descriptions — not English-only.
2. Spanish pages and `/spanish` hub: `<html lang="es">` when that content goes live.
3. Only add `hreflang` where genuine translated equivalents of the same worksheet exist — never fake it.
**Done when:** Lang attributes correct on sampled Nepali pages; meta descriptions read naturally
in the page's language.

### TASK-18: Footer, trust pages, and technical basics
**Do:**
1. Footer on every page links to: all categories, `/nepali`, `/spanish`, `/about`, `/contact`,
   `/privacy-policy`, `/terms`. Confirm each target page exists and has real content (no lorem ipsum).
2. `http://freekidworksheets.com/*` 301-redirects to `https://`; no mixed-content warnings.
3. GSC → Mobile Usability: zero errors. Manually check one category page on a real phone:
   no horizontal scroll, tap targets ≥ 48px.
4. Confirm `/search` is still disallowed in robots.txt and not in the sitemap.
**Done when:** All footer links return 200 with real content; http→https redirect works;
zero mobile-usability errors in GSC.

---

## P3 — GROWTH (after P0–P2 are done)

### TASK-19: Strengthen internal linking from the homepage
**Do:** Add homepage body sections (not just nav) linking to top categories and newest/popular
worksheets, so every page is reachable within ≤ 3 clicks from `/`.
**Done when:** Crawl depth check: every sitemap URL reachable in ≤ 3 clicks from homepage.

### TASK-20: Nepali SEO content moat
**Why:** Nepali worksheets are the site's differentiator — few competitors.
**Do:** Publish one genuinely useful guide (e.g. "How to teach Nepali vowels (अ–अः) at home:
a parent's guide") linking to the Nepali worksheet collection. Natural language, chandrabindu ँ.
**Done when:** Guide published, linked from `/nepali` hub, requested for indexing in GSC.

---

## ONGOING — for every NEW worksheet published (non-negotiable checklist)

- [ ] URL lowercase, hyphenated, ends `-<code>` (e.g. `/worksheet/ka-kha-nepali-letter-tracing-4035`)
- [ ] `<title>` ≤ 60 chars, keyword first, ends ` - freekidworksheets.com`, unique
- [ ] Meta description 140–160 chars, natural, includes "free printable", unique
- [ ] One H1 = worksheet title only
- [ ] About text: 2–3 UNIQUE sentences (never copied from another sheet)
- [ ] Card title clean: no file extension, no doubled words, title case
- [ ] Alt text descriptive (`Free printable <topic> worksheet for <age>`)
- [ ] Assigned to a category + age group; visible in category grid
- [ ] Breadcrumb present; 4–8 related worksheet links present
- [ ] URL in sitemap; page returns 200; no console errors
- [ ] After deploy: request indexing in GSC

## MONTHLY (recurring)
1. GSC → Performance: top 10 queries/pages — expand content around winners.
2. GSC → Pages: confirm zero new unexpected "not indexed" URLs.
3. Automated scan: broken links/images, duplicate titles/descriptions, `.png` in titles,
   template-duplicate About texts.
4. PageSpeed Insights on 3 page types; fix regressions.

---

## COMPLETION REPORT (send this back when done)

For each TASK-01…TASK-20 reply with one of: **DONE** (with 1-line evidence, e.g. "GSC sitemap:
Success, 214 URLs discovered"), **PARTIAL** (what's done, what remains), or **BLOCKED**
(reason + what you need). Then include:
1. Pages now indexed in Google (count from GSC) — before vs after.
2. Anything you found that is NOT in this list and needs a decision.
3. Suggested next priorities beyond this file.

*Task list compiled 2026-09-26 from a live-site audit. Re-verify each "Done when" with real
tool output — never mark DONE from memory.*
