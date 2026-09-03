# POST-DEVELOPMENT LAUNCH & GROWTH CHECKLIST — freekidworksheet.com

> **Perform these tasks ONLY after the website is fully developed** per
> `MASTER-INSTRUCTION.md` and every item in its §18 Definition of Done passes locally.
> Everything here is deliberate, ordered, and safe to hand to the same AI coding agent —
> instruct it to "run postdev.md" and it will execute these steps one by one.
>
> This file covers: final content/branding, **contact details**, domain purchase,
> **deployment**, search-engine submission, **SEO campaign**, **Analytics**, and
> **AdSense** — i.e. everything intentionally deferred out of the master build file.

---

## 0. When is the site "fully developed"?

Only start this checklist when all of these are true:

- [ ] `npm run build` and `astro check` pass with zero errors
- [ ] `npm run verify` passes (content schema, images, generated pages, sitemap counts)
- [ ] Local dev server works: home, `/worksheets` (+ pagination), `/worksheet/{slug}`,
      `/search`, legal pages, 404 — in light + dark mode
- [ ] Download image + Print buttons work on every worksheet page
- [ ] An internal link crawl of `dist/` finds no broken links

If any checkbox is unchecked, go back to `MASTER-INSTRUCTION.md` first.

---

## Phase A — Prepare the site for launch (still fully local)

- [ ] **A1. Contact details** — set your real `CONTACT_EMAIL` in `.env` and make sure the
      `/contact` page shows it (mailto link + visible text). Decide on the public identity
      shown on About/Contact (personal name, brand name, etc.).
- [ ] **A2. Legal pages** — finalize Privacy Policy and Terms: replace any boilerplate with
      your real details (operator name, address if required, email), state what cookies are
      used (Analytics), and keep the content-disclaimer + friendly-note paragraphs.
- [ ] **A3. Finalize the brand** — confirm the brand lockup matches the domain:
      wordmark text (`FreeKidWorksheets`), the letter-tile colors (yellow → coral → blue →
      green → pink → purple → teal → orange), and the brand SVG mark. Update the site
      title suffix if you change the brand wording.
- [ ] **A4. Favicon set** — generate the full favicon pack from the brand icon
      (`assets/icon-yellow.svg`) with the Real Favicon Generator → drop all output files
      into `public/`. Remove the placeholder favicon.ico.
- [ ] **A5. Quality gate** — run `npm run verify`, a `linkinator dist/` crawl, and
      Lighthouse (mobile, Incognito). Fix anything below ~90 on Performance /
      Accessibility / SEO / Best Practices.
- [ ] **A6. Content depth** — confirm every worksheet description is unique; author
      150–300 words for any thin ones. Keep category/age-group values tidy (a short list
      in the README).

---

## Phase B — Buy the domain (`freekidworksheet.com`)

- [ ] **B1. Compare registrars** — BigRock / GoDaddy / Namecheap / Cloudflare Registrar
      (any is fine, `.com` only; BigRock supports UPI). Expect roughly ₹1k per year, less
      on offers. **Do not** buy 3-year plans.
- [ ] **B2. Check spelling twice** before paying — a domain cannot be changed after the
      purchase. Confirm `freekidworksheet.com` exactly (free-kid-worksheet, no dashes, .com).
- [ ] **B3. Settings** — 1-year term, **auto-renew OFF** for the first year (renew only if
      the site is working and growing in 12 months).
- [ ] **B4. Leave DNS untouched for now** — Cloudflare takes it over in Phase D.

---
## Phase C — Deploy to Cloudflare Pages (free)

- [ ] **C1. Account** — create/login at cloudflare.com.
- [ ] **C2. Create the Pages project** — **Workers & Pages → Create → Pages → Connect to
      Git** → select your repo → framework preset **Astro** → build command
      `npm run build` → output directory `dist` → deploy.
- [ ] **C3. Set production environment variables** in the Pages project settings:
      - `SITE_URL=https://freekidworksheet.com`
      - `CONTACT_EMAIL=<your email from A1>`
      - `ADSENSE_PUBLISHER_ID=` (leave empty for now — Phase H)
      - `GA_ID=` (leave empty for now — Phase F)
- [ ] **C4. First deploy** gives a temporary `<project>.pages.dev` URL. Test it thoroughly
      on desktop + phone (this is the free staging the video uses).
- [ ] **C5. Alternative CLI deploy** (if you skip git integration):
      `npm run deploy` → `astro build && npx wrangler pages deploy dist --project-name=free-kid-worksheet`
      (requires `npx wrangler login` once).
- [ ] **C6. Commit discipline** — every deploy is a git commit; every worksheet = a commit.
      From here on, git push = website update.

---

## Phase D — Connect the domain & kill duplicate content

- [ ] **D1. Add the site to Cloudflare** — **Domains → Add site** → `freekidworksheet.com`
      → **Free plan** → Continue. Cloudflare shows 2 nameservers (e.g.
      `xxx.ns.cloudflare.com` / `yyy.ns.cloudflare.com`).
- [ ] **D2. Point the domain at Cloudflare** — at the registrar (BigRock/GoDaddy/
      Namecheap): select the domain → Edit/Manage **Nameservers** → replace the current
      two with Cloudflare's two → Save. Verify your registrar email if asked.
- [ ] **D3. Wait for propagation** — back in Cloudflare: **Re-check now / I've updated my
      nameservers**. Usually "Active" within ~10 minutes to 24 hours.
- [ ] **D4. Attach the domain to Pages** — Pages project → **Custom domains → Set up a
      custom domain** → add **both**:
      - `freekidworksheet.com` (apex)
      - `www.freekidworksheet.com` (www — many crawlers treat these separately; the video
        sets up both)
      Cloudflare auto-creates the DNS records; click **Activate** for each.
- [ ] **D5. SSL** — Cloudflare issues certificates automatically for both domains; wait for
      "Active" before relying on https.
- [ ] **D6. Verify no-index is scoped correctly**:
      - `curl -I https://freekidworksheet.com/` → the real domain must NOT be noindexed.
      - `curl -I https://<project>.pages.dev/` → must show `X-Robots-Tag: noindex`
        (the `public/_headers` file already noindexes the temporary domain, so Google only
        ever indexes the real one — this avoids the duplicate-content penalty that killed
        sites in the video's experience).
- [ ] **D7. Redirects (optional but tidy)** — in `public/_redirects`:
      ```
      /request-download/*  /worksheets  301
      /bundle/*            /worksheets  301
      /bundles             /worksheets  301
      ```

---
## Phase E — Google Search Console + Bing Webmaster Tools

- [ ] **E1.** Go to `search.google.com/search-console` → **Start now** → sign in with your
      Google account.
- [ ] **E2. Add property → Domain** → enter `freekidworksheet.com` → Continue.
- [ ] **E3. Verify via DNS** — copy the TXT record Cloudflare displays; in Cloudflare DNS →
      Add record → `TXT`, name `@`, paste the value → Save → back in Search Console →
      **Verify**. Then **Go to Properties**.
- [ ] **E4. Submit the sitemap** — **Sitemaps** → paste `https://freekidworksheet.com/sitemap.xml`
      → Submit. A "couldn't fetch" message is normal for the first minutes — refresh later.
- [ ] **E5. Request indexing** — **URL Inspection** → paste `https://freekidworksheet.com/`
      → **Request Indexing**.
- [ ] **E6. Patience** — data appears within ~2 days; the property icon within ~1 week.
- [ ] **E7. Bing** — go to `bing.com/webmasters` → sign in **with Google** → **Import from
      Search Console** → select the property → Continue. Then **URL Submission** → paste
      `https://freekidworksheet.com/` → Submit.

---

## Phase F — Google Analytics

- [ ] **F1.** `analytics.google.com` → **Start measuring** → account name (e.g.
      "FreekidWorksheet") → create a property named `freekidworksheet.com` → timezone →
      industry **Education** → business size **Small**.
- [ ] **F2.** Accept the data terms → choose **Web** → paste `freekidworksheet.com` → create →
      copy the **Measurement ID** (`G-XXXXXXXXXX`).
- [ ] **F3.** Cloudflare Pages project → **Settings → Environment variables** → add
      `GA_ID=G-XXXXXXXXXX` → **Save** → trigger a new deployment (or push a trivial commit).
- [ ] **F4.** Google Analytics → **Admin → Test installation** (or use Tag Assistant) —
      confirm the tag is detected on the live site.
- [ ] **F5.** Open the **Realtime** report — you should see your own visit appear. Bots
      count too; ignore them for now.

---

## Phase G — SEO campaign (start when the site is live; iterate weekly)

- [ ] **G1. Keyword research (free)** — Ahrefs Free Keyword Generator → search:
      - "free printable worksheets for kids"
      - "alphabet tracing worksheets" / "letter tracing worksheets"
      - "kindergarten math worksheets"
      - "class 1 question paper" / "maths worksheet class 1"
      - "coloring pages for kids"
      Record volumes and note invalid/irrelevant keywords to skip (like the video warns —
      don't chase keywords that don't match your content).
- [ ] **G2. Map keywords to pages** — tune each page's `<title>`, meta description, and H1
      to the keyword it targets. Keep them natural; never stuff.
- [ ] **G3. Content depth** — every worksheet = unique 150–300 word description; home and
      library pages get a ~600-word explanatory block (who it's for, how to print, how to
      use at home/classroom).
- [ ] **G4. FAQ growth** — mine **"People Also Ask"** + the Ahrefs **Questions** tab; add
      the best new Q&As to the homepage FAQ and extend the `FAQPage` JSON-LD.
- [ ] **G5. Internal linking** — worksheet detail pages already show 4 related items; on the
      homepage link category tiles + a few featured items.
- [ ] **G6. Images** — alt text = worksheet title; keep files compressed and A4-aspect;
      lazy loading is already in the build.
- [ ] **G7. Re-submit sitemap** after large content changes (the sitemap regenerates on
      every build automatically).
- [ ] **G8. Watch Search Console weekly** — indexing coverage, impressions, queries; fix
      errors as they appear.

---
## Phase H — AdSense (only after real traffic — typically 1–4 months)

- [ ] **H1. Timing** — wait until the site sustains roughly **10+ visitors/day** (check
      Google Analytics). Applying before this is wasted effort; almost every site is
      rejected on the first application anyway.
- [ ] **H2. Sign up** — `adsense.google.com` → sign in with your Google account.
- [ ] **H3. Add the site** — **Websites → Add site** → `freekidworksheet.com` (no https) →
      Save.
- [ ] **H4. Verify ownership** — usually automatic via Search Console. If asked for a code
      snippet, paste the AdSense script into the head injection point in
      `src/layouts/Base.astro`, commit, redeploy, then click **Verify**.
- [ ] **H5. Request Review** — when the site is live with all legal pages, privacy policy,
      real content, and a working `ads.txt` → **Request Review**. The review takes weeks.
- [ ] **H6. On approval** — copy your **Publisher ID** (`pub-XXXXXXXX`) → set
      `ADSENSE_PUBLISHER_ID` in the Cloudflare Pages env vars → redeploy. The build now
      serves the real `ads.txt` line automatically.
- [ ] **H7. Auto ads** — paste the publisher auto-ads `<script>` into the head injection
      point (alongside GA), commit, redeploy. Then in AdSense: **Ads → Auto ads → Edit →
      Apply to site → Save**.
- [ ] **H8. Manual slots** — the ad-slot placeholders from `MASTER-INSTRUCTION.md` §14 are
      ready for manual placements if you prefer controlling exact spots (worksheet detail
      is the highest-value page).
- [ ] **H9. If rejected** — read the stated reason (usually content depth or navigation),
      fix it via Phase G, and re-apply **after ~30 days**. Never spam re-applications.

---

## Phase I — Ongoing operations (weekly habit)

- [ ] **I1. Publish new worksheets** — the only workflow: drop the image into
      `src/content/worksheets/<slug>/`, write `index.md` (see master §15.1), commit, push
      → auto-deploy. Aim for 1–3 new sheets per week — every new page is a new indexable
      URL and more ad inventory.
- [ ] **I2. Analytics** — check top pages and countries weekly (US visitors = the highest
      CPM, per the video).
- [ ] **I3. Search Console** — request indexing for new pages, fix reported errors.
- [ ] **I4. Performance** — keep Lighthouse ≥ 90; compress new images before committing;
      mind page weight as the library grows.
- [ ] **I5. Backups** — git is your backup. Push regularly. Consider a monthly git tag.
- [ ] **I6. Domain renewal** — decide at month 11 whether to renew
      `freekidworksheet.com` (working + growing → renew; not working → let it lapse).

---

## Appendix — quick reference

**Commands**
```bash
npm run dev      # local preview
npm run build    # static build to dist/
npm run verify   # content + output checks (must pass before every deploy)
npm run deploy   # optional CLI deploy: astro build && npx wrangler pages deploy dist
```

**Files most likely touched during post-dev**
- `src/data/site.ts` — site constants (site name, tagline, popup config)
- `src/layouts/Base.astro` — head injection points (GA_ID, AdSense snippet)
- `public/_headers` — security headers + temp-domain noindex
- `public/_redirects` — custom redirect rules (e.g. renamed worksheet slugs)
- `public/` — favicon set, app icons
- `.env` / Cloudflare Pages env vars — `SITE_URL`, `CONTACT_EMAIL`, `GA_ID`,
  `ADSENSE_PUBLISHER_ID`
- `/contact`, `/about`, `/privacy-policy`, `/terms` — real details + final copy

**Checklist order recap:** A (content/brand) → B (domain) → C (deploy) → D (domain+DNS)
→ E (Search Console/Bing) → F (Analytics) → G (SEO) → H (AdSense) → I (ongoing).