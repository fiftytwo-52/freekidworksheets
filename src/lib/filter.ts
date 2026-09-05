import type { CollectionEntry } from 'astro:content';

export type Worksheet = CollectionEntry<'worksheets'>;

/**
 * The data-* attributes each worksheet card exposes so the client-side
 * filter controller can read/search/sort them without a store (§11.2).
 */
export function cardData(entry: Worksheet): Record<string, string> {
    return {
        title: entry.data.title,
        code: entry.data.code,
        category: entry.data.category,
        age: entry.data.ageGroup,
        language: entry.data.language,
        colorType: entry.data.colorType,
        created: entry.data.date.toISOString(),
        slug: entry.slug,
    };
}

/**
 * data-* attribute map ready to spread onto a card element ({...attrs}),
 * matching what scripts/browse-filters.ts reads from the DOM (§11.2).
 */
export function cardDataProps(entry: Worksheet): Record<string, string> {
    return {
        'data-title': entry.data.title,
        'data-code': entry.data.code,
        'data-category': entry.data.category,
        'data-age': entry.data.ageGroup,
        'data-language': entry.data.language,
        'data-color-type': entry.data.colorType,
        'data-created': entry.data.date.toISOString(),
        'data-slug': entry.slug,
    };
}
