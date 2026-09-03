import { getCollection, type CollectionEntry } from 'astro:content';
import { AGE_GROUPS, PER_PAGE } from '../data/site';

export type Worksheet = CollectionEntry<'worksheets'>;
export type WorksheetKind = 'worksheet' | 'question';

/** Newest-first with a stable slug tiebreak (§8.2). */
export function byNewest(a: Worksheet, b: Worksheet): number {
    const da = a.data.date.getTime();
    const db = b.data.date.getTime();
    if (da !== db) return db - da;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/** Every worksheet/question paper, sorted newest-first. */
export async function getAllWorksheets(): Promise<Worksheet[]> {
    const all = await getCollection('worksheets');
    return [...all].sort(byNewest);
}

/** Only `worksheet` items or only `question` items, newest-first. */
export async function getWorksheets(kind: WorksheetKind): Promise<Worksheet[]> {
    const all = await getAllWorksheets();
    return all.filter((w) => w.data.kind === kind);
}

export async function getQuestionPapers(): Promise<Worksheet[]> {
    return getWorksheets('question');
}

/** All items in one category (any kind), newest-first. */
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

/** Up to `limit` same-category siblings, newest-first, excluding self. */
export async function getRelated(
    slug: string,
    limit = 4,
): Promise<Worksheet[]> {
    const all = await getAllWorksheets();
    const entry = all.find((w) => w.id === slug);
    if (!entry) return [];
    return all
        .filter((w) => w.id !== slug && w.data.category === entry.data.category)
        .slice(0, limit);
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
