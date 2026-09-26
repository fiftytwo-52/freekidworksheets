// scripts/import-new-worksheets.mjs
// Publishes every finalized worksheet image in NEW/ into src/content/worksheets/ and keeps the
// dual tracking files (worksheet-upload-tracking.md + worksheets-tracker.xlsx) in sync, following
// new-sheet-rule.md §6 (dual-format tracking) and §7 (publication steps).
//
// Filename convention (§4): [Topic] - [Activity] - [lang] - [colour] - [origin] - [Age].png
//   lang   : eng | nep                    colour : bw | color
//   origin : orig | alt | down            Age    : e.g. 3-5-preschool, 4-6-lkg, 6-8-class 1
//
// Images whose filename carries no recognisable metadata (e.g. cap-A-E.png) are SKIPPED and
// reported, because §2/§7 require the owner to supply that metadata before publication.
//
// Usage: node scripts/import-new-worksheets.mjs [--dry-run]

import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const sourceDir = path.join(root, 'NEW');
const contentDir = path.join(root, 'src', 'content', 'worksheets');
const trackerDir = path.resolve(root, '..', 'Newsheet-for-freekidworksheets');
const manifestPath = path.join(trackerDir, '.new-import-records.json');
const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('--list');
const LIST = process.argv.includes('--list');
const TODAY = new Date().toISOString().slice(0, 10);

/** Language tokens -> content language code, tracker label, and legacy code base. */
const LANGUAGES = {
    eng: { code: 'en', label: 'English', base: 3052 },
    nep: { code: 'ne', label: 'Nepali', base: 4023 },
    pt: { code: 'pt', label: 'Portuguese', base: 50000 },
};

/**
 * Manual metadata for staging files that do not follow §4, read off the filename itself
 * (owner instruction: "the data are in the filenames"). `cap-*` = capital-letter sheets,
 * `low-*` = lowercase-letter sheets, matching the published Capital letters A-E…X-Z series.
 */
const MANUAL_METADATA = {
    'low-u-w.png': {
        topic: 'lowercase letters u-w',
        activity: 'trace',
        lang: 'eng',
        age: '3-4-preschool',
        colorType: 'black-and-white',
        origin: 'Original',
        credit: '',
    },
    'low-x-z.png': {
        topic: 'lowercase letters x-z',
        activity: 'trace',
        lang: 'eng',
        age: '3-4-preschool',
        colorType: 'black-and-white',
        origin: 'Original',
        credit: '',
    },
};

/** Content hash of a file, used to detect images that are already published. */
function hashFile(file) {
    return createHash('md5').update(readFileSync(file)).digest('hex');
}

/** md5 -> published image filename, for every image already in the collection. */
function readPublishedImageHashes() {
    const hashes = new Map();
    for (const file of readdirSync(contentDir)) {
        if (!/\.(png|jpe?g)$/i.test(file)) continue;
        hashes.set(hashFile(path.join(contentDir, file)), file);
    }
    return hashes;
}

/**
 * Age-group mapping — mirrors the age groups already published on the website
 * (preschool/nursery -> 3-4, lkg/ukg/kg -> 5-6, class 1-3 -> 7-8).
 */
function ageGroupFor(ageToken) {
    const token = ageToken.toLowerCase();
    if (/lkg|ukg|kindergarten|\bkg\b/.test(token)) return '5-6';
    if (/preschool|nursery/.test(token)) return '3-4';
    if (/class|grade/.test(token)) {
        return /(class|grade)\s*(1|2|3)\b/.test(token) ? '7-8' : '9+';
    }
    const lower = Number.parseInt(token, 10);
    if (Number.isNaN(lower)) return '5-6';
    if (lower <= 4) return '3-4';
    if (lower <= 6) return '5-6';
    if (lower <= 8) return '7-8';
    return '9+';
}

/**
 * Category mapping into the canonical list in src/data/site.ts, preserving the precedence
 * already used across the published library: number/quantity work -> Math, colouring/drawing ->
 * Coloring, letter/word/tracing work -> Alphabet & Tracing, everything else -> Writing.
 * Only the topic + activity are inspected, so the colour token never forces a category.
 */
function categoryFor(topic, activity) {
    const text = `${topic} ${activity}`;
    if (/color by number|colour by number/i.test(text)) return 'Coloring';
    if (/\b(add|addition|subtract|subtraction|mix|mixed|count|counting|number|numbers|quantity|compare|comparison|order|ordering|bigger|smaller|biggest|smallest|big and small|tall|short|sum)\b/i.test(text)) {
        return 'Math';
    }
    if (/\b(color|colour|draw|drawing)\b/i.test(text)) return 'Coloring';
    if (/\b(trace|tracing|write|writing|label|labeling|alphabet|letter|letters|capital|uppercase|lowercase|vowel|vowels|consonant|consonants|word|words|read|reading|cvc|sight)\b/i.test(text)) {
        return 'Alphabet & Tracing';
    }
    return 'Writing';
}

/** Activity label used in the worksheet title (sentence-case, mirrors the published titles). */
const ACTIVITY_LABELS = {
    trace: 'tracing',
    'trace and write': 'tracing and writing',
    connect: 'connecting',
    'connect the dots': 'connect the dots',
    'dot to dot': 'dot to dot',
    match: 'matching',
    color: 'coloring',
    draw: 'drawing',
    'sentence draw': 'sentence drawing',
    write: 'writing',
    count: 'counting',
    pattern: 'pattern',
    label: 'labeling',
    complete: 'complete the picture',
    add: 'addition',
    subtract: 'subtraction',
    mix: 'mixed practice',
    circle: 'circle the answer',
    'missing letter': 'missing letter',
    maze: 'maze',
    join: 'word joining',
    'odd one': 'odd one out',
    sort: 'sorting',
    compare: 'comparing',
    order: 'ordering',
    find: 'find and circle',
    bingo: 'bingo',
    read: 'reading',
};

/** SEO title/meta/about kit (TASK-06/11). All worksheet pages share the same
 *  free-printable template shape; only the per-sheet slot values differ. Titles
 *  are unique site-wide; keep every title <= 40 chars so the <title> tag
 *  (title + code + suffix) stays near 60 chars. */
const TITLE_MAX = 40;

/**
 * Unique title helper shared by the batch importer and the one-off
 * scripts/apply-seo-about.mjs sweep. Accepts any base title; numbered clones
 * ("Apple tracing", "Apple tracing 2") keep every page's <title> unique.
 */
export function uniqueTitle(base, used) {
    if (!used.has(base)) {
        used.add(base);
        return base;
    }
    let attempt = 2;
    let candidate = base;
    while (used.has(candidate)) {
        const suffix = ` ${attempt}`;
        candidate =
            base.length + suffix.length <= TITLE_MAX
                ? `${base}${suffix}`
                : `${base.slice(0, TITLE_MAX - suffix.length).trimEnd()}${suffix}`;
        attempt += 1;
    }
    used.add(candidate);
    return candidate;
}

function sentenceTitle(record) {
    const base = `${record.topic.charAt(0).toUpperCase() + record.topic.slice(1)} ${record.activity}`;
    if (base.length <= TITLE_MAX) return base;
    return base.slice(0, TITLE_MAX).trimEnd();
}

function shortTitle(title, code) {
    const suffix = ` #${code}`;
    return title.length + suffix.length <= 60 ? `${title}${suffix}` : title;
}

function metaDescription(record) {
    const lead = `${record.title} — free printable ${record.languageLabel.toLowerCase()} ${record.category.toLowerCase()} worksheet for kids ages ${record.ageGroup}.`;
    const tail = record.colorType === 'colorful' ? ' Full-colour A4 sheet. Download and print free.' : ' Black-and-white A4 sheet. Download and print free.';
    return `${lead}${tail}`;
}

function metaAbout(record) {
    const act = record.activity.toLowerCase();
    return `${record.title} is a hands-on ${act} activity for young learners. Children complete every row or scene, building steady skills through guided practice. Print the clean A4 sheet for home or classroom use.`;
}

/** Tracker "Activity / Type" values, kept to the vocabulary already used in the tracker. */
function trackerType(category, activity) {
    if (/^trace/.test(activity)) return 'tracing';
    if (/^(write|label|missing letter)/.test(activity)) return 'writing / language';
    if (/^(read|bingo)/.test(activity)) return 'reading';
    if (/^(color|draw|sentence draw)/.test(activity)) return 'coloring / drawing';
    if (category === 'Math') return 'math / practice';
    if (category === 'Alphabet & Tracing') return 'tracing / writing';
    return 'matching / puzzle';
}

/** Splits "[Topic] - [Activity] - [lang] - [colour] - [origin] - [Age]" into its parts. */
function parseFilename(name) {
    const stem = name.replace(/\.[^.]+$/, '');
    const parts = stem.split(' - ').map((part) => part.trim());
    if (parts.length < 6) return null;
    const [activity, lang, colour, origin, age] = parts.slice(-5);
    const topic = parts.slice(0, parts.length - 5).join(' - ');
    if (!topic || !activity || !LANGUAGES[lang]) return null;
    if (!/^(bw|black and white|color|colour)$/i.test(colour)) return null;
    if (!/^(orig|original|alt|altered|down|downloaded)/i.test(origin)) return null;
    return {
        topic,
        activity,
        lang,
        age,
        colorType: /^bw$|^black and white$/i.test(colour) ? 'black-and-white' : 'colorful',
        origin: /^orig/i.test(origin)
            ? 'Original'
            : /^alt/i.test(origin)
              ? 'Altered'
              : 'Downloaded (credit to owner)',
        credit: /^(alt|altered|down|downloaded)\s*-\s*(.+)$/i.test(origin)
            ? origin.replace(/^(alt|altered|down|downloaded)\s*-\s*/i, '')
            : '',
    };
}

/** Reads the published collection for the next free codes and the existing description set. */
function readExistingContent() {
    const descriptions = new Set();
    const highestCode = {};
    for (const file of readdirSync(contentDir).filter((name) => name.endsWith('.md'))) {
        const raw = readFileSync(path.join(contentDir, file), 'utf8');
        const block = raw.match(/^---\n([\s\S]*?)\n---/);
        if (!block) continue;
        const field = (key) => {
            const match = block[1].match(new RegExp(`^${key}:\\s*"?([^"\\n]+?)"?\\s*$`, 'm'));
            return match ? match[1].trim() : null;
        };
        const description = field('description');
        if (description) descriptions.add(description);
        const code = Number.parseInt(field('code') ?? '', 10);
        const language = field('language') ?? 'en';
        if (!Number.isNaN(code)) {
            highestCode[language] = Math.max(highestCode[language] ?? 0, code);
        }
    }
    return { descriptions, highestCode };
}

/** Sentence-case title: "<Topic> <activity label>", collapsing a topic that repeats the activity. */
function titleFor(record) {
    let topic = record.topic;
    if (topic.toLowerCase().endsWith(` ${record.activity.toLowerCase()}`)) {
        topic = topic.slice(0, -(record.activity.length + 1));
    }
    topic = topic.charAt(0).toUpperCase() + topic.slice(1);
    let label = ACTIVITY_LABELS[record.activity];
    if (!label) {
        const numbered = record.activity.match(/^trace and color\s*(\d*)$/i);
        label = numbered
            ? `tracing and coloring${numbered[1] ? ` ${numbered[1]}` : ''}`
            : record.activity;
    }
    return `${topic} ${label}`;
}

function slugFor(title, code) {
    const slug = title
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
    return `${slug || 'worksheet'}-${code}`;
}

function tagsFor(record) {
    const words = record.title.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 1);
    return [
        ...new Set([
            ...words,
            record.category.toLowerCase(),
            record.ageGroup,
            record.languageLabel.toLowerCase(),
            'kids worksheet',
        ]),
    ];
}

/** §1.2 — description must be unique and at least 60 characters of real copy. */
function descriptionFor(record) {
    const colourNote =
        record.colorType === 'colorful' ? ' The sheet is supplied in full colour.' : '';
    const originNote =
        record.status === 'Original'
            ? 'It is an original worksheet prepared for FreeKidWorksheets and is marked Original.'
            : record.credit
              ? `It was sourced externally and is marked ${record.status} — credit to ${record.credit}.`
              : `It is marked ${record.status}.`;
    return (
        `${record.title} is a free printable ${record.languageLabel.toLowerCase()} worksheet ` +
        `for children aged ${record.ageGroup}. This ${record.category.toLowerCase()} activity ` +
        `supports guided practice at home, in class, or during independent learning.${colourNote} ${originNote}`
    );
}

/** Original filenames already recorded in the Markdown tracker (idempotency guard). */
function readTrackedFilenames() {
    const ledger = path.join(trackerDir, 'worksheet-upload-tracking.md');
    if (!existsSync(ledger)) return new Set();
    const tracked = new Set();
    for (const line of readFileSync(ledger, 'utf8').split('\n')) {
        if (!line.startsWith('|')) continue;
        const cells = line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
        if (cells.length >= 10 && cells[0] !== 'Code') tracked.add(cells[8]);
    }
    return tracked;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const { descriptions: publishedDescriptions, highestCode } = readExistingContent();
const alreadyTracked = readTrackedFilenames();
const nextCode = {};
for (const [token, meta] of Object.entries(LANGUAGES)) {
    nextCode[token] = Math.max(highestCode[meta.code] ?? 0, meta.base) + 1;
}

const sourceFiles = readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

const records = [];
const skipped = [];
const duplicates = [];
const publishedHashes = readPublishedImageHashes();
for (const originalName of sourceFiles) {
    if (alreadyTracked.has(originalName)) continue;
    const twin = publishedHashes.get(hashFile(path.join(sourceDir, originalName)));
    if (twin) {
        duplicates.push(`${originalName} == ${twin}`);
        continue;
    }
    const parsed = parseFilename(originalName) ?? MANUAL_METADATA[originalName];
    if (!parsed) {
        skipped.push(originalName);
        continue;
    }
    const language = LANGUAGES[parsed.lang];
    const record = {
        ...parsed,
        status: parsed.origin,
        code: String(nextCode[parsed.lang]++),
        category: categoryFor(parsed.topic, parsed.activity),
        ageGroup: ageGroupFor(parsed.age),
        language: language.code,
        languageLabel: language.label,
        date: TODAY,
        originalName,
        extension: path.extname(originalName).toLowerCase() || '.png',
    };
    record.title = titleFor(record);
    record.description = descriptionFor(record);
    records.push(record);
}

// Descriptions must be unique site-wide (tests/verify.mjs fails on duplicates), so colour twins
// and any other clash get an explicit suffix.
const usedDescriptions = new Set(publishedDescriptions);
for (const record of records) {
    let attempt = 0;
    while (usedDescriptions.has(record.description) || record.description.length < 60) {
        attempt += 1;
        const suffix =
            attempt === 1
                ? ` - ${record.colorType === 'colorful' ? 'color' : 'black and white'}`
                : ` - ${record.code}`;
        record.title = `${titleFor(record)}${suffix}`;
        record.description = descriptionFor(record);
        if (attempt >= 3) break;
    }
    usedDescriptions.add(record.description);
    record.slug = slugFor(record.title, record.code);
    record.imageName = `${record.code}${record.extension}`;
}

for (const record of records) {
    if (DRY_RUN) continue;
    copyFileSync(path.join(sourceDir, record.originalName), path.join(contentDir, record.imageName));
    const frontmatter = [
        '---',
        `title: ${JSON.stringify(record.title)}`,
        `code: "${record.code}"`,
        `category: ${JSON.stringify(record.category)}`,
        `ageGroup: "${record.ageGroup}"`,
        `date: ${record.date}`,
        `description: ${JSON.stringify(record.description)}`,
        `image: "./${record.imageName}"`,
        `tags: [${tagsFor(record).map((tag) => JSON.stringify(tag)).join(', ')}]`,
        `language: "${record.language}"`,
        `colorType: "${record.colorType}"`,
        '---',
        '',
    ].join('\n');
    writeFileSync(path.join(contentDir, `${record.slug}.md`), frontmatter);
}

const manifest = records.map((record) => ({
    code: record.code,
    title: record.title,
    language: record.languageLabel,
    type: trackerType(record.category, record.activity),
    colour: record.colorType,
    origin: record.status,
    ageGroup: record.ageGroup,
    date: record.date,
    originalName: record.originalName,
    status: 'Uploaded',
}));

if (!DRY_RUN && manifest.length > 0) {
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    execFileSync('python3', [path.join(root, 'scripts', 'update-trackers.py'), manifestPath], {
        stdio: 'inherit',
    });
    if (existsSync(manifestPath)) {
        console.warn('warning: update-trackers.py did not remove the manifest file');
    }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const tally = (items, key) =>
    Object.entries(
        items.reduce((acc, item) => {
            const value = item[key];
            acc[value] = (acc[value] ?? 0) + 1;
            return acc;
        }, {}),
    )
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => `${value} ${count}`)
        .join(' | ');

console.log(`${DRY_RUN ? '[dry run] ' : ''}Prepared ${records.length} worksheets for publication.`);
if (records.length > 0) {
    for (const [token, label] of [
        ['eng', 'English'],
        ['nep', 'Nepali'],
        ['pt', 'Portuguese'],
    ]) {
        const group = records.filter((record) => record.lang === token);
        if (group.length === 0) continue;
        const codes = group.map((record) => Number(record.code)).sort((a, b) => a - b);
        console.log(
            `  ${label}: ${group.length} (codes ${codes[0]}-${codes[codes.length - 1]})`,
        );
    }
    console.log(`  category: ${tally(records, 'category')}`);
    console.log(`  age group: ${tally(records, 'ageGroup')}`);
    console.log(`  colour: ${tally(records, 'colorType')}`);
    console.log(`  origin: ${tally(records, 'status')}`);
}
if (duplicates.length > 0) {
    console.log(`\nSkipped ${duplicates.length} file(s) — already published, byte-identical image:`);
    for (const item of duplicates) console.log(`  = ${item}`);
}
if (skipped.length > 0) {
    console.log(`\nSkipped ${skipped.length} file(s) — filename carries no usable metadata (§2/§7):`);
    for (const name of skipped) console.log(`  - ${name}`);
}
if (DRY_RUN) {
    console.log('\nNothing was written (dry run). Re-run without --dry-run to publish.');
} else if (records.length > 0) {
    console.log('\nNext: npm run check && npm run build (postbuild runs the verification suite).');
}

if (LIST) {
    console.log('\ncode | title | category | age | colour | language');
    for (const record of records) {
        console.log(
            `${record.code} | ${record.title} | ${record.category} | ${record.ageGroup} | ` +
                `${record.colorType} | ${record.language}`,
        );
    }
}




