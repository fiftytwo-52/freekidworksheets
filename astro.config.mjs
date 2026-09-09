import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    // Static MPA only — no SSR, no adapter, no server runtime (MASTER-INSTRUCTION §4).
    output: 'static',
    // Emit /path.html files instead of /path/index.html directories.
    // The site's canonical URLs, sitemap entries, and internal links are all
    // slash-less (trailingSlash: 'never'), so the build output must match:
    // directory format makes Cloudflare Pages 308-redirect every sitemap URL
    // to its trailing-slash twin, which Search Console reports as
    // "Page with redirect" for the whole site.
    build: {
        format: 'file',
    },
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
