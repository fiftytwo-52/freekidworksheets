// search-index.json.ts — build-time search index consumed by /search
import type { APIRoute } from 'astro';
import { getAllWorksheets } from '../lib/content';

export const prerender = true;

export const GET: APIRoute = async () => {
    const entries = await getAllWorksheets();
    const index = entries.map((entry) => ({
        slug: entry.slug,
        code: entry.data.code,
        title: entry.data.title,
        category: entry.data.category,
        ageGroup: entry.data.ageGroup,
        date: entry.data.date.toISOString().slice(0, 10),
        description: entry.data.description,
        image: entry.data.image.src,
        tags: entry.data.tags ?? [],
        language: entry.data.language ?? 'en',
    }));

    return new Response(JSON.stringify(index), {
        headers: { 'Content-Type': 'application/json' },
    });
};
