// sitemap.xml.ts — build-time sitemap (§9.4). Lists home; the /worksheets
// library (+ paginated pages); all category landing pages (+ paginated
// pages); every worksheet detail page; and the static legal pages.
import type { APIRoute } from 'astro';
import { BROWSE_PAGES, PER_PAGE, SITE_URL } from '../data/site';
import {
    getAllWorksheets,
    getByCategory,
    getCategories,
    getNepaliWorksheets,
    getSpanishWorksheets,
    paginate,
    type Worksheet,
} from '../lib/content';

export const prerender = true;

interface SitemapEntry {
    path: string;
    lastmod?: string;
    changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
    priority: string;
    /** Absolute image URLs associated with this page (image sitemap §). */
    images?: string[];
}

function isoDate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

function lastmodFor(items: Array<{ data: { date: Date } }>, page: number): string | undefined {
    if (items.length === 0) return undefined;
    const index = Math.min((page - 1) * PER_PAGE, items.length - 1);
    return isoDate(items[index].data.date);
}

/** Absolute URL for a worksheet's optimized image (works in prerendered routes). */
function imageAbsUrl(entry: Worksheet): string {
    return `${SITE_URL}${entry.data.image.src}`;
}

/** Image URLs for one page slice of a paginated listing. */
function pageImages(items: Worksheet[], page: number): string[] {
    const slice = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    return slice.map(imageAbsUrl);
}

async function buildEntries(): Promise<SitemapEntry[]> {
    const entries: SitemapEntry[] = [];

    // Home
    const all = await getAllWorksheets();
    const newest = all[0];
    entries.push({
        path: '/',
        lastmod: newest ? isoDate(newest.data.date) : undefined,
        changefreq: 'daily',
        priority: '1.0',
        images: pageImages(all, 1),
    });

    // Nepali feed
    entries.push({
        path: '/nepali',
        lastmod: newest ? isoDate(newest.data.date) : undefined,
        changefreq: 'daily',
        priority: '0.9',
    });

    // Spanish feed
    entries.push({
        path: '/spanish',
        lastmod: newest ? isoDate(newest.data.date) : undefined,
        changefreq: 'daily',
        priority: '0.9',
    });

    // Worksheets libraries — one per language (English, Nepali, Spanish) —
    // each with its own pagination.
    const libraries = [
        { config: BROWSE_PAGES.worksheets, items: all },
        { config: BROWSE_PAGES.nepali, items: await getNepaliWorksheets() },
        { config: BROWSE_PAGES.spanish, items: await getSpanishWorksheets() },
    ];
    for (const { config, items } of libraries) {
        if (items.length === 0) continue;
        const totalPages = Math.ceil(items.length / PER_PAGE);
        for (let page = 1; page <= totalPages; page++) {
            entries.push({
                path: page === 1 ? config.path : `${config.path}/page/${page}`,
                lastmod: lastmodFor(items, page),
                changefreq: 'daily',
                priority: page === 1 ? '0.9' : '0.6',
                images: pageImages(items, page),
            });
        }
    }

    // Category pages + pagination
    const categories = await getCategories();
    for (const category of categories) {
        const items = await getByCategory(category);
        if (items.length === 0) continue;
        const { totalPages } = paginate(items, 1);
        const basePath = `/category/${category}`;
        for (let page = 1; page <= totalPages; page++) {
            entries.push({
                path: page === 1 ? basePath : `${basePath}/page/${page}`,
                lastmod: lastmodFor(items, page),
                changefreq: 'weekly',
                priority: page === 1 ? '0.8' : '0.5',
                images: pageImages(items, page),
            });
        }
    }

    // Worksheet detail pages
    for (const entry of all) {
        entries.push({
            path: `/worksheet/${entry.slug}`,
            lastmod: isoDate(entry.data.date),
            changefreq: 'monthly',
            priority: '0.7',
            images: [imageAbsUrl(entry)],
        });
    }

    // Legal/static pages (/search is noindex,follow — excluded from sitemap)
    for (const path of ['/about', '/contact', '/privacy-policy', '/terms']) {
        entries.push({
            path,
            changefreq: 'yearly',
            priority: '0.3',
        });
    }

    return entries;
}

function xmlEscape(s: string): string {
    return s
        .replace(/&/g, '\u0026amp;')
        .replace(/</g, '\u0026lt;')
        .replace(/>/g, '\u0026gt;')
        .replace(/"/g, '\u0026quot;')
        .replace(/'/g, '\u0026apos;');
}

export const GET: APIRoute = async () => {
    const entries = await buildEntries();
    const urls = entries
        .map(
            (e) =>
                `  <url>\u003cloc\u003e${SITE_URL}${xmlEscape(e.path)}\u003c/loc\u003e${e.lastmod ? `\u003clastmod\u003e${e.lastmod}\u003c/lastmod\u003e` : ''
                }\u003cchangefreq\u003e${e.changefreq}\u003c/changefreq\u003e\u003cpriority\u003e${e.priority
                }\u003c/priority\u003e${(e.images ?? [])
                    .map(
                        (img) =>
                            `\u003cimage:image\u003e\u003cimage:loc\u003e${xmlEscape(img)}\u003c/image:loc\u003e\u003c/image:image\u003e`,
                    )
                    .join('')}\n  </url>`,
        )
        .join('\n');

    const xml = `\u003c?xml version="1.0" encoding="UTF-8"?\u003e\n\u003curlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\u003e\n${urls}\n\u003c/urlset\u003e\n`;

    return new Response(xml, {
        headers: { 'Content-Type': 'application/xml' },
    });
};
