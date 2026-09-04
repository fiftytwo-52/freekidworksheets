// robots.txt.ts — build-time robots.txt (§9.4).
import type { APIRoute } from 'astro';
import { SITE_URL } from '../data/site';

export const prerender = true;

export const GET: APIRoute = async () => {
    const body = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

    return new Response(body, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
};
