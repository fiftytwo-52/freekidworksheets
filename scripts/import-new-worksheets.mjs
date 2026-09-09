import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const sourceDir = path.join(root, 'NEW');
const contentDir = path.join(root, 'src', 'content', 'worksheets');
const trackerDir = path.resolve(root, '..', 'Newsheet-for-freekidworksheets');
const date = '2026-09-06';

const sourceFiles = readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

function languageFor(name) {
    if (/\bpt\b/i.test(name)) return { code: 'pt', label: 'Portuguese' };
    if (/\b(nep|nepali)\b/i.test(name)) return { code: 'ne', label: 'Nepali' };
    return { code: 'en', label: 'English' };
}

function ageFor(name) {
    if (/3-4|preschool|nursery/i.test(name)) return '3-4';
    return '5-6';
}

function colorFor(name) {
    return /colour|color(?!ing)|colorful/i.test(name) ? 'colorful' : 'black-and-white';
}

function titleFor(name) {
    let title = name.replace(/\.[^.]+$/, '');
    title = title
        .replace(/^English\s*-\s*/i, '')
        .replace(/^Nepali\s*-\s*/i, '')
        .replace(/^general knowledge\s*-\s*/i, '')
        .replace(/^math\s*-\s*/i, '')
        .replace(/^science\s*-\s*/i, '')
        .replace(/\s*-\s*(english|nepali|pt)\s*-\s*/gi, ' - ')
        .replace(/\s*-\s*(black and white|colour|color)\s*-\s*/gi, ' - ')
        .replace(/\s*-\s*(original|orig)\s*-\s*/gi, ' - ')
        .replace(/\s*-\s*(preschool|nursery|lkg|ukg|kg|3-4)\s*$/i, '')
        .replace(/\s*-\s*$/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (/^cores e formas/i.test(title)) return 'Cores e Formas Colors and Shapes Matching';
    if (/^ruit\b/i.test(title)) title = title.replace(/^ruit\b/i, 'Fruit');
    if (/^A aa/i.test(title)) title = 'A Aa I Nepali Vowel Tracing';
    if (/^Ee u oo/i.test(title)) title = 'Ee U Oo Nepali Vowel Tracing';
    if (/^Gha Nga/i.test(title)) title = 'Gha Nga Nepali Letter Tracing';
    if (/^ka kha/i.test(title)) title = 'Ka Kha Nepali Letter Tracing';
    if (/^\- Filename:/i.test(title)) title = 'Standing Sleeping Slanting U-Curve and Zigzag Line Tracing';
    return title.charAt(0).toUpperCase() + title.slice(1);
}

function categoryFor(name, title) {
    if (/math\s*-|number|count|addition|subtraction|comparison|ordering|quantity|pyramid/i.test(name)) return 'Math';
    if (/color|colour|drawing|draw/i.test(name)) return 'Coloring';
    if (/tracing|trace|letter|vowel|consonant|alphabet|stroke|line|word/i.test(`${name} ${title}`)) return 'Alphabet & Tracing';
    return 'Writing';
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

const records = [];
let english = 3053;
let nepali = 4024;
let portuguese = 50001;
for (const originalName of sourceFiles) {
    const language = languageFor(originalName);
    const code = language.code === 'en' ? String(english++) : language.code === 'ne' ? String(nepali++) : String(portuguese++);
    const title = titleFor(originalName);
    const ageGroup = ageFor(originalName);
    const colorType = colorFor(originalName);
    const category = categoryFor(originalName, title);
    const ext = path.extname(originalName).toLowerCase();
    const imageName = `${code}${ext}`;
    const slug = slugFor(title, code);
    const description = `${title} is a free printable ${language.label.toLowerCase()} worksheet for children aged ${ageGroup}. This ${category.toLowerCase()} activity supports guided practice at home, in class, or during independent learning. It is an original worksheet prepared for FreeKidWorksheets and is marked Original.`;
    const tags = [...new Set([
        ...title.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 1),
        category.toLowerCase(),
        ageGroup,
        language.code === 'ne' ? 'nepali' : language.code === 'pt' ? 'portuguese' : 'english',
        'kids worksheet',
    ])];
    const frontmatter = [
        '---',
        `title: ${JSON.stringify(title)}`,
        `code: "${code}"`,
        `category: ${JSON.stringify(category)}`,
        `ageGroup: "${ageGroup}"`,
        `date: ${date}`,
        `description: ${JSON.stringify(description)}`,
        `image: "./${imageName}"`,
        `tags: [${tags.map((tag) => JSON.stringify(tag)).join(', ')}]`,
        `language: "${language.code}"`,
        `colorType: "${colorType}"`,
        '---',
        '',
    ].join('\n');
    copyFileSync(path.join(sourceDir, originalName), path.join(contentDir, imageName));
    writeFileSync(path.join(contentDir, `${slug}.md`), frontmatter);
    records.push({ code, title, language: language.label, type: activityFor(category, title), colour: colorType, origin: 'Original', ageGroup, date, originalName, status: 'Uploaded' });
}

function activityFor(category, title) {
    if (category === 'Math') return 'math / practice';
    if (category === 'Coloring') return 'coloring / drawing';
    if (/matching|maze|puzzle|sorting/i.test(title)) return 'matching / puzzle';
    if (/writing|word|sentence|sound/i.test(title)) return 'writing / language';
    return 'tracing';
}

const manifestPath = path.join(trackerDir, '.new-import-records.json');
writeFileSync(manifestPath, JSON.stringify(records, null, 2) + '\n');
console.log(`Imported ${records.length} worksheets: ${english - 3053} English, ${nepali - 4024} Nepali, ${portuguese - 50001} Portuguese.`);
console.log(`Manifest: ${manifestPath}`);

execFileSync('python3', [path.join(root, 'scripts', 'update-trackers.py'), manifestPath], { stdio: 'inherit' });
