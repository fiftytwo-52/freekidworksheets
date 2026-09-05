import { getCollection, type CollectionEntry } from 'astro:content';
import { AGE_GROUPS, PER_PAGE } from '../data/site';

export type Worksheet = CollectionEntry<'worksheets'>;

/** Newest-first with a stable slug tiebreak (§8.2). */
export function byNewest(a: Worksheet, b: Worksheet): number {
    const da = a.data.date.getTime();
    const db = b.data.date.getTime();
    if (da !== db) return db - da;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/** Every worksheet, sorted newest-first. */
export async function getAllWorksheets(): Promise<Worksheet[]> {
    const all = await getCollection('worksheets');
    return [...all].sort(byNewest);
}

/** English worksheets (default feed), sorted newest-first. */
export async function getEnglishWorksheets(): Promise<Worksheet[]> {
    const all = await getAllWorksheets();
    return all.filter((w) => w.data.language !== 'ne');
}

/** Nepali worksheets feed, sorted newest-first. */
export async function getNepaliWorksheets(): Promise<Worksheet[]> {
    const all = await getAllWorksheets();
    return all.filter((w) => w.data.language === 'ne');
}

/** All items in one category, newest-first. */
export async function getByCategory(category: string): Promise<Worksheet[]> {
    const all = await getAllWorksheets();
    return all.filter((w) => w.data.category === category);
}

/** Sorted distinct category set across all items (§8.2). */
export async function getCategories(): Promise<string[]> {
    const all = await getAllWorksheets();
    return [...new Set(all.map((w) => w.data.category))].sort((a, b) =>
        a.localeCompare(b),
    );
}

/**
 * Sorted distinct age-group set. Ordering follows the canonical AGE_GROUPS
 * list (§8.4) so "9+" sorts last instead of first lexically.
 */
export async function getAgeGroups(): Promise<string[]> {
    const all = await getAllWorksheets();
    const present = new Set(all.map((w) => w.data.ageGroup));
    return AGE_GROUPS.filter((g) => present.has(g));
}

/**
 * Up to `limit` related worksheets for the detail page, excluding self.
 *
 * Language rules (user requirement):
 * - English worksheet → only English suggestions, ever.
 * - Nepali worksheet → Nepali suggestions first; English may backfill the
 *   remaining slots when there aren't enough Nepali worksheets.
 *
 * Ranking within the allowed pool (highest first):
 *   +100 same-language  (hard requirement for English pages)
 *   +10  same-category
 *   +5   same-age-group
 * `others` is already newest-first and Array#sort is stable, so equal
 * scores stay newest-first.
 */
export async function getRelated(
    slug: string,
    limit = 4,
): Promise<Worksheet[]> {
    const all = await getAllWorksheets();
    const entry = all.find((w) => w.slug === slug);
    if (!entry) return [];

    const isNepali = entry.data.language === 'ne';
    const others = all.filter((w) => w.slug !== slug);

    const scored = others
        .map((w) => {
            const sameLang = isNepali
                ? w.data.language === 'ne'
                : w.data.language !== 'ne';
            let score = 0;
            if (sameLang) score += 100;
            if (w.data.category === entry.data.category) score += 10;
            if (w.data.ageGroup === entry.data.ageGroup) score += 5;
            return { w, score };
        })
        // English pages: drop every non-English suggestion entirely.
        .filter((s) => isNepali || s.score >= 100);

    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((s) => s.w);
}

export interface Paginated<T> {
    items: T[];
    page: number;
    totalPages: number;
}

/** 20-per-page pagination; clamps `page` to a valid range (§8.2/§9.2). */
export function paginate<T>(items: T[], page: number): Paginated<T> {
    const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
    const safe = Math.min(Math.max(1, page), totalPages);
    const start = (safe - 1) * PER_PAGE;
    return {
        items: items.slice(start, start + PER_PAGE),
        page: safe,
        totalPages,
    };
}
