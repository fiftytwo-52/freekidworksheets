import type { CollectionEntry } from 'astro:content';

export type Worksheet = CollectionEntry<'worksheets'>;

/**
 * The data-* attributes each worksheet card exposes so the client-side
 * filter controller can read/search/sort them without a store (§11.2).
 */
export function cardData(entry: Worksheet): Record<string, string> {
    return {
        title: entry.data.title,
        category: entry.data.category,
        age: entry.data.ageGroup,
        kind: entry.data.kind,
        created: entry.data.date.toISOString(),
        slug: entry.id,
    };
}

/** Serialize the attributes to an HTML string for use in templates. */
export function cardDataAttrs(entry: Worksheet): string {
    return Object.entries(cardData(entry))
        .map(([k, v]) => `data-${k}="${v.replace(/"/g, '"')}"`)
        .join(' ');
}

