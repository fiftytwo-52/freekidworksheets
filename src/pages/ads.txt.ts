// ads.txt.ts — build-time ads.txt (§9.4). Emits the Google AdSense line
// when ADSENSE_PUBLISHER_ID is set (auto-prefixing pub-), else a
// placeholder comment.
import type { APIRoute } from 'astro';
import { ADSENSE_PUBLISHER_ID } from '../data/site';

export const prerender = true;

export const GET: APIRoute = async () => {
    const body = ADSENSE_PUBLISHER_ID
        ? `google.com, pub-${ADSENSE_PUBLISHER_ID}, DIRECT, f08c47fec0942fa0\n`
        : '# ads.txt — AdSense publisher ID not configured yet.\n# Add ADSENSE_PUBLISHER_ID to .env to generate the real line post-dev.\n';

    return new Response(body, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
};
