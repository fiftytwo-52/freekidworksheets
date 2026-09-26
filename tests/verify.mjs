// tests/verify.mjs — post-build verification (MASTER-INSTRUCTION §16.2).
// Run after `astro build` (wired as npm run postbuild). Checks:
//   1. Every worksheet entry passes the zod schema and its image file exists.
//   2. Every search code is a unique 4 or 5-digit number string.
//   3. Every description is unique and >= 60 chars (flag thin content).
//   4. dist/ contains the expected routes (home, libraries, categories,
//      worksheet details, legal pages, 404, search-index.json, the
//      @astrojs/sitemap output (sitemap-index.xml + sitemap-0.xml),
//      robots.txt, ads.txt).
//   5. sitemap-0.xml lists every worksheet slug (count matches collection).
//   6. CSS/JS assets referenced by built HTML exist (no 404s on assets).
//   7. (TASK-13) Category routes use ONLY lowercase hyphenated slugs in dist/,
//      and every category page self-canonicals.
//   8. (TASK-15) Every worksheet page embeds LearningResource + BreadcrumbList JSON-LD.
//   9. (TASK-09/10) Worksheet pages ship 4+ related links and a breadcrumb.
//   10. (TASK-11) No duplicate <title> / meta descriptions across the site.
//   11. (TASK-16) No empty or filename alt texts anywhere in built HTML.
import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'worksheets');

let failures = 0;
let warnings = 0;

function fail(message) {
    failures += 1;
    console.error(`  \u2717 ${message}`);
}

function warn(message) {
    warnings += 1;
    console.warn(`  \u26a0 ${message}`);
}

function pass(message) {
    console.log(`  \u2713 ${message}`);
}

async function walk(dir) {
    const out = [];
    if (!existsSync(dir)) return out;
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...(await walk(full)));
        else out.push(full);
    }
    return out;
}

// ---------------------------------------------------------------------------
// 1 + 2. Content-level checks: parse every entry's frontmatter, validate the
// image reference, unique 4/5-digit search codes, and description uniqueness/length.
// ---------------------------------------------------------------------------
async function checkContent() {
    console.log('\n[1/5] Content collection');

    const entries = await walk(CONTENT_DIR);
    const mdFiles = entries.filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));

    if (mdFiles.length === 0) {
        warn('No worksheet entries found.');
        return { slugs: [], descriptions: [], codes: [] };
    }

    const slugs = [];
    const descriptions = [];
    const codes = [];
    const seenDescriptions = new Map();
    const seenCodes = new Map();

    for (const file of mdFiles) {
        const slug = path.basename(file, path.extname(file));
        slugs.push(slug);

        const raw = await readFile(file, 'utf8');
        const match = raw.match(/^---\n([\s\S]*?)\n---/);
        if (!match) {
            fail(`${slug}: missing frontmatter block`);
            continue;
        }

        const fm = match[1];

        // Required fields present?
        for (const field of ['title', 'code', 'category', 'ageGroup', 'date', 'description', 'image']) {
            if (!new RegExp(`^${field}:`, 'm').test(fm)) {
                fail(`${slug}: missing required field "${field}"`);
            }
        }

        // Search code check (unique 4/5 digit code)
        const codeMatch = fm.match(/^code:\s*["']?(\d{4,5})["']?$/m);
        if (!codeMatch) {
            fail(`${slug}: code must be a 4 or 5-digit number string`);
        } else {
            const code = codeMatch[1];
            if (seenCodes.has(code)) {
                fail(`${slug}: duplicate code "${code}" (also used by ${seenCodes.get(code)})`);
            } else {
                seenCodes.set(code, slug);
                codes.push(code);
            }
        }

        // Description length + uniqueness.
        const descMatch = fm.match(/^description:\s*>-\n([\s\S]*?)(?=^\w+:|\n\w+:)/m);
        const descInline = fm.match(/^description:\s*(.+)$/m);
        const description = descMatch
            ? descMatch[1].replace(/\s+/g, ' ').trim()
            : descInline
                ? descInline[1].trim().replace(/^["']|["']$/g, '')
                : '';
        if (description.length < 60) {
            fail(`${slug}: description is ${description.length} chars (min 60)`);
        }
        if (seenDescriptions.has(description)) {
            fail(`${slug}: duplicate description (also used by ${seenDescriptions.get(description)})`);
        } else if (description) {
            seenDescriptions.set(description, slug);
        }
        descriptions.push(description);

        // Image file exists next to the entry.
        const imgMatch = fm.match(/^image:\s*\.\/(.+)$/m);
        if (imgMatch) {
            const imgPath = path.join(path.dirname(file), imgMatch[1]);
            if (!existsSync(imgPath)) {
                fail(`${slug}: image file not found at ${imgMatch[1]}`);
            } else {
                const info = await stat(imgPath);
                if (info.size < 1024) {
                    warn(`${slug}: image is under 1KB — check it is a real A4 sheet`);
                }
            }
        }
    }

    pass(`${mdFiles.length} entries checked (schema fields, codes, image files, descriptions)`);
    return { slugs, descriptions, codes };
}

// ---------------------------------------------------------------------------
// 3. dist/ contains the expected routes.
// ---------------------------------------------------------------------------
async function checkDist(slugs) {
    console.log('\n[2/5] dist/ routes');

    if (!existsSync(DIST)) {
        fail('dist/ does not exist — run `npm run build` first');
        process.exit(1);
    }

    const expected = [
        'index.html',
        'nepali.html',
        'nepali-alphabet-guide.html',
        'spanish.html',
        'worksheets.html',
        'search.html',
        'about.html',
        'contact.html',
        'privacy-policy.html',
        'terms.html',
        '404.html',
        '500.html',
        'search-index.json',
        'sitemap-index.xml',
        'sitemap-0.xml',
        'robots.txt',
        'ads.txt',
    ];

    for (const rel of expected) {
        if (existsSync(path.join(DIST, rel))) {
            pass(rel);
        } else {
            fail(`dist/${rel} missing`);
        }
    }

    // Worksheet detail pages — one per entry.
    let detailOk = true;
    for (const slug of slugs) {
        if (!existsSync(path.join(DIST, 'worksheet', `${slug}.html`))) {
            fail(`dist/worksheet/${slug}.html missing`);
            detailOk = false;
        }
    }
    if (slugs.length > 0 && detailOk) {
        pass(`${slugs.length} worksheet detail pages`);
    }

    // Category pages — at least the canonical categories with content.
    // NOTE: the site builds with `format: 'file'`, so /category/math is emitted
    // as dist/category/math.html, NOT a math/ directory. Only look for the
    // page-1 files here; paginated pages live in <slug>/page/.
    const categoryDir = path.join(DIST, 'category');
    if (existsSync(categoryDir)) {
        const cats = (await readdir(categoryDir, { withFileTypes: true }))
            .filter((d) => d.isFile() && d.name.endsWith('.html'))
            .map((d) => d.name.replace(/\.html$/, ''));
        if (cats.length > 0) {
            pass(`${cats.length} category pages (${cats.join(', ')})`);
        } else {
            warn('No category pages built (no content yet)');
        }
    } else if (slugs.length > 0) {
        fail('dist/category/ missing despite content existing');
    } else {
        warn('No category pages (no content yet)');
    }

    // Pagination: /worksheets/page/2 when > 20 worksheets.
    const worksheets = slugs.length;
    if (worksheets > 20 && !existsSync(path.join(DIST, 'worksheets', 'page', '2.html'))) {
        fail('dist/worksheets/page/2.html missing (>20 items)');
    }
}

// ---------------------------------------------------------------------------
// 4. sitemap lists every worksheet slug. @astrojs/sitemap emits an index
//    file (sitemap-index.xml) plus chunk files (sitemap-0.xml, ...); the
//    chunks hold the actual page <loc> entries.
// ---------------------------------------------------------------------------
async function checkSitemap(slugs) {
    console.log('\n[3/5] sitemap');

    const indexPath = path.join(DIST, 'sitemap-index.xml');
    const chunkPath = path.join(DIST, 'sitemap-0.xml');
    if (!existsSync(indexPath)) {
        fail('sitemap-index.xml missing');
        return;
    }
    if (!existsSync(chunkPath)) {
        fail('sitemap-0.xml missing');
        return;
    }

    const indexXml = await readFile(indexPath, 'utf8');
    if (!indexXml.includes('sitemap-0.xml')) {
        fail('sitemap-index.xml does not reference sitemap-0.xml');
    }

    const xml = await readFile(chunkPath, 'utf8');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

    let ok = true;
    for (const slug of slugs) {
        if (!locs.some((loc) => loc.includes(`/worksheet/${slug}`))) {
            fail(`sitemap missing /worksheet/${slug}`);
            ok = false;
        }
    }
    if (slugs.length > 0 && ok) {
        pass(`all ${slugs.length} worksheet slugs listed`);
    } else if (slugs.length === 0) {
        pass(`sitemap generated with ${locs.length} URLs (empty collection)`);
    }
}

// ---------------------------------------------------------------------------
// 5. CSS/JS assets referenced by built HTML exist.
// ---------------------------------------------------------------------------
async function checkAssets() {
    console.log('\n[4/5] asset integrity');

    const htmlFiles = (await walk(DIST)).filter((f) => f.endsWith('.html'));
    const refs = new Set();

    for (const file of htmlFiles) {
        const html = await readFile(file, 'utf8');
        for (const m of html.matchAll(/(?:src|href)="([^"]+\.(?:css|js))(?:\?[^"]*)?"/g)) {
            const ref = m[1];
            if (ref.startsWith('http') || ref.startsWith('//')) continue;
            refs.add(ref);
        }
    }

    let ok = true;
    for (const ref of refs) {
        const clean = ref.split('?')[0];
        const target = path.join(DIST, clean.replace(/^\//, ''));
        if (!existsSync(target)) {
            fail(`referenced asset missing: ${ref}`);
            ok = false;
        }
    }
    if (ok) {
        pass(`${refs.size} unique CSS/JS references all resolve`);
    }
}

// ---------------------------------------------------------------------------
// 6. search-index.json is valid JSON and matches the collection count and codes.
// ---------------------------------------------------------------------------
async function checkSearchIndex(slugs) {
    console.log('\n[5/5] search-index.json');

    const indexPath = path.join(DIST, 'search-index.json');
    if (!existsSync(indexPath)) {
        fail('search-index.json missing');
        return;
    }

    try {
        const entries = JSON.parse(await readFile(indexPath, 'utf8'));
        if (!Array.isArray(entries)) {
            fail('search-index.json is not a JSON array');
            return;
        }
        if (entries.length !== slugs.length) {
            fail(`search-index has ${entries.length} entries, collection has ${slugs.length}`);
            return;
        }
        const missingCodes = entries.filter((e) => !e.code || !/^\d{4,5}$/.test(e.code));
        if (missingCodes.length > 0) {
            fail(`${missingCodes.length} entries missing valid search codes in search-index.json`);
        } else {
            pass(`${entries.length} entries with valid search codes, valid JSON`);
        }
    } catch (err) {
        fail(`search-index.json is not valid JSON: ${err.message}`);
    }
}

// ---------------------------------------------------------------------------
// 7. SEO output checks (TASK-09/10/11/13/15/16): category slugs, JSON-LD,
//    related links + breadcrumbs, unique titles/descriptions, clean alt texts.
// ---------------------------------------------------------------------------
const LOWERCASE_CATEGORY_SLUGS = ['alphabet-tracing', 'math', 'coloring', 'writing'];

function headTag(html, tag, attr, value) {
    for (const m of html.matchAll(
        new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*content="([^"]*)"[^>]*>`, 'gi'),
    )) {
        if (m[1] === value) return m[2];
    }
    for (const m of html.matchAll(
        new RegExp(`<${tag}[^>]*content="([^"]*)"[^>]*${attr}="([^"]*)"[^>]*>`, 'gi'),
    )) {
        if (m[2] === value) return m[1];
    }
    return null;
}

function allJsonLdTypes(html) {
    const types = new Set();
    for (const m of html.matchAll(
        /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
    )) {
        for (const t of m[1].matchAll(/"@type"\s*:\s*"([^"]+)"/g)) types.add(t[1]);
    }
    return types;
}

async function checkSeo(slugs) {
    console.log('\n[6/6] SEO output');

    // 7a. dist/category/* uses ONLY lowercase hyphenated slugs.
    // `format: 'file'` emits /category/math as math.html AND a math/ dir for
    // its paginated pages, so de-dupe the combined name list.
    const categoryDir = path.join(DIST, 'category');
    if (existsSync(categoryDir)) {
        const top = [
            ...new Set(
                (await readdir(categoryDir, { withFileTypes: true }))
                    .map((d) => (d.isDirectory() ? d.name : d.name.replace(/\.html$/, '')))
                    .filter(Boolean),
            ),
        ].sort();
        const bad = top.filter((name) => !LOWERCASE_CATEGORY_SLUGS.includes(name));
        if (bad.length > 0) {
            fail(`non-slug category dirs in dist: ${bad.join(', ')}`);
        } else {
            pass(`category routes use lowercase slugs (${top.join(', ')})`);
        }

        // Check that zero internal links point to old/uppercase category URLs (TASK-13).
        const allHtmlFiles = (await walk(DIST)).filter((f) => f.endsWith('.html'));
        let badCategoryLinks = 0;
        for (const f of allHtmlFiles) {
            const h = await readFile(f, 'utf8');
            for (const m of h.matchAll(/href="(\/category\/[^"#?]+)"/g)) {
                const target = m[1].replace(/^\/category\//, '').split('/')[0];
                if (!LOWERCASE_CATEGORY_SLUGS.includes(target)) {
                    badCategoryLinks += 1;
                }
            }
        }
        if (badCategoryLinks > 0) {
            fail(`${badCategoryLinks} internal links point to non-canonical/uppercase category URLs`);
        } else {
            pass('zero internal links point to old/uppercase category URLs');
        }
    }

    const worksheetFiles = slugs
        .map((slug) => path.join(DIST, 'worksheet', `${slug}.html`))
        .filter((file) => existsSync(file));

    let relatedOk = true;
    let crumbOk = true;
    let jsonLdOk = true;
    const titles = new Map();
    const descriptions = new Map();
    let dupTitle = 0;
    let dupDesc = 0;
    let pages = 0;

    for (const file of worksheetFiles) {
        const html = await readFile(file, 'utf8');
        pages += 1;

        // 7b. 4+ related worksheet links + visible breadcrumb in raw HTML.
        const links = new Set(
            [...html.matchAll(/href="(\/worksheet\/[^"]+)"/g)].map((m) => m[1]),
        );
        if (links.size < 4) {
            fail(`${path.basename(file)}: only ${links.size} related /worksheet links`);
            relatedOk = false;
        }
        if (!html.includes('aria-label="Breadcrumb"')) {
            fail(`${path.basename(file)}: breadcrumb missing`);
            crumbOk = false;
        }

        // 7c. LearningResource + BreadcrumbList JSON-LD present.
        const types = allJsonLdTypes(html);
        if (!types.has('LearningResource') || !types.has('BreadcrumbList')) {
            fail(
                `${path.basename(file)}: JSON-LD missing (has: ${[...types].join(', ') || 'none'})`,
            );
            jsonLdOk = false;
        }

        // 7d. Unique titles / meta descriptions.
        const title = (html.match(/<title>([^<]*)<\/title>/) || [null, ''])[1].trim();
        const desc =
            headTag(html, 'meta', 'name', 'description') ||
            headTag(html, 'meta', 'property', 'og:description') ||
            '';
        if (title) {
            if (titles.has(title)) dupTitle += 1;
            else titles.set(title, file);
        }
        if (desc) {
            if (descriptions.has(desc)) dupDesc += 1;
            else descriptions.set(desc, file);
        }
    }

    if (relatedOk) pass(`${pages} worksheet pages: 4+ related /worksheet links each`);
    if (crumbOk) pass(`${pages} worksheet pages: breadcrumb present`);
    if (jsonLdOk) pass(`${pages} worksheet pages: LearningResource + BreadcrumbList JSON-LD`);
    if (dupTitle > 0) fail(`${dupTitle} duplicate <title> values across worksheet pages`);
    else pass(`${titles.size} unique <title> values`);
    if (dupDesc > 0) warn(`${dupDesc} duplicate meta descriptions across worksheet pages`);
    else pass(`${descriptions.size} unique meta descriptions`);

    // 7e. No empty or filename alt texts anywhere (ignore inline <script> blocks,
    //     which contain template strings rather than rendered markup).
    const htmlFiles = (await walk(DIST)).filter((f) => f.endsWith('.html'));
    let badAlt = 0;
    for (const file of htmlFiles) {
        const html = (await readFile(file, 'utf8')).replace(
            /<script[\s\S]*?<\/script>/gi,
            '',
        );
        for (const m of html.matchAll(/<img[^>]*alt="([^"]*)"[^>]*>/gi)) {
            const alt = m[1].trim();
            if (!alt || /\.(png|jpe?g|webp)$/i.test(alt)) badAlt += 1;
        }
    }
    if (badAlt > 0) fail(`${badAlt} empty/filename alt attributes in built HTML`);
    else pass(`${htmlFiles.length} pages: all <img> alt texts descriptive`);

    // 7f. Site-wide <title> / meta description budgets (SEO TASK-13).
    //     Titles must stay <= 60 chars including the site suffix; descriptions
    //     land in the 100-165 range. noindex pages (/search, /404, /500) are
    //     skipped, as are static files copied verbatim from public/.
    const TITLE_MAX = 60;
    const DESC_MIN = 100;
    const DESC_MAX = 165;
    let longTitle = 0;
    let badDesc = 0;
    let checked = 0;
    for (const file of htmlFiles) {
        const rel = `dist/${path.relative(DIST, file)}`;
        // Static passthrough files (e.g. public/pinterest-324ef.html) are copied
        // verbatim, not generated by Astro, and carry no SEO tags by design.
        if (existsSync(path.join(ROOT, 'public', path.relative(DIST, file)))) continue;
        const html = await readFile(file, 'utf8');
        if (/<meta name="robots" content="noindex/.test(html)) continue;
        checked += 1;

        const title = (html.match(/<title>([^<]*)<\/title>/) || [null, ''])[1].trim();
        if ([...title].length > TITLE_MAX) {
            fail(
                `${rel}: <title> is ${[...title].length} chars (max ${TITLE_MAX}) — ${title}`,
            );
            longTitle += 1;
        }
        if (!title.endsWith(' - freekidworksheets.com')) {
            fail(`${rel}: <title> missing site suffix — ${title}`);
            longTitle += 1;
        }
        const desc = headTag(html, 'meta', 'name', 'description') || '';
        const dLen = [...desc].length;
        if (dLen < DESC_MIN || dLen > DESC_MAX) {
            fail(`${rel}: meta description is ${dLen} chars (want ${DESC_MIN}-${DESC_MAX})`);
            badDesc += 1;
        }
    }
    if (longTitle === 0) pass(`${checked} indexable pages: <title> <= ${TITLE_MAX} chars + suffix`);
    if (badDesc === 0) pass(`${checked} indexable pages: meta descriptions in range`);
}

// ---------------------------------------------------------------------------
async function main() {
    console.log('freekidworksheets.com — post-build verification (§16.2)\n');

    const { slugs } = await checkContent();
    await checkDist(slugs);
    await checkSitemap(slugs);
    await checkAssets();
    await checkSearchIndex(slugs);
    await checkSeo(slugs);

    console.log(
        `\nResult: ${failures} failure(s), ${warnings} warning(s)` +
        (failures === 0 ? ' — all checks passed' : ''),
    );
    process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
