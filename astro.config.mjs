import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    // Static MPA only — no SSR, no adapter, no server runtime (MASTER-INSTRUCTION §4).
    output: 'static',
    // The canonical base for generated sitemap/robots/canonical links is driven by
    // the exported SITE_URL constant in src/data/site.ts (reads .env SITE_URL),
    // which is set to the production domain in .env while retaining a local
    // development fallback in src/data/site.ts.
    site: 'https://freekidworksheets.com',
    trailingSlash: 'never',
    vite: {
        plugins: [tailwindcss()],
    },
});
