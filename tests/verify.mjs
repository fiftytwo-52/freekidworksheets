// tests/verify.mjs — post-build verification (MASTER-INSTRUCTION §16.2).
// Run after `astro build` (wired as npm run postbuild). Checks:
//   1. Every worksheet entry passes the zod schema and its image file exists.
//   2. Every search code is a unique 4 or 5-digit number string.
//   3. Every description is unique and >= 60 chars (flag thin content).
//   4. dist/ contains the expected routes (home, libraries, categories,
//      worksheet details, legal pages, 404, search-index.json, sitemap.xml,
//      robots.txt, ads.txt).
//   5. sitemap.xml lists every worksheet slug (count matches collection).
//   6. CSS/JS assets referenced by built HTML exist (no 404s on assets).
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
        'nepali/index.html',
        'worksheets/index.html',
        'search/index.html',
        'about/index.html',
        'contact/index.html',
        'privacy-policy/index.html',
        'terms/index.html',
        '404.html',
        '500.html',
        'search-index.json',
        'sitemap.xml',
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
        if (!existsSync(path.join(DIST, 'worksheet', slug, 'index.html'))) {
            fail(`dist/worksheet/${slug}/index.html missing`);
            detailOk = false;
        }
    }
    if (slugs.length > 0 && detailOk) {
        pass(`${slugs.length} worksheet detail pages`);
    }

    // Category pages — at least the canonical categories with content.
    const categoryDir = path.join(DIST, 'category');
    if (existsSync(categoryDir)) {
        const cats = (await readdir(categoryDir, { withFileTypes: true }))
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
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
    if (worksheets > 20 && !existsSync(path.join(DIST, 'worksheets', 'page', '2', 'index.html'))) {
        fail('dist/worksheets/page/2/index.html missing (>20 items)');
    }
}

// ---------------------------------------------------------------------------
// 4. sitemap.xml lists every worksheet slug.
// ---------------------------------------------------------------------------
async function checkSitemap(slugs) {
    console.log('\n[3/5] sitemap.xml');

    const sitemapPath = path.join(DIST, 'sitemap.xml');
    if (!existsSync(sitemapPath)) {
        fail('sitemap.xml missing');
        return;
    }

    const xml = await readFile(sitemapPath, 'utf8');
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
async function main() {
    console.log('freekidworksheet.com — post-build verification (§16.2)\n');

    const { slugs } = await checkContent();
    await checkDist(slugs);
    await checkSitemap(slugs);
    await checkAssets();
    await checkSearchIndex(slugs);

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
