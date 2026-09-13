import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
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
    // Production domain — required by @astrojs/sitemap (it builds the absolute
    // <loc> URLs from this) and by Astro for generated metadata. The canonical
    // / OG / JSON-LD links on the pages themselves are driven by SITE_URL in
    // src/data/site.ts (reads .env), which is set to this same domain.
    site: 'https://freekidworksheets.com',
    trailingSlash: 'never',
    integrations: [
        // Build-time sitemap — replaces the old hand-rolled
        // src/pages/sitemap.xml.ts route. Emits sitemap-index.xml plus
        // sitemap-0.xml (one chunk per 45k URLs) into dist/ on every build.
        sitemap({
            // Keep the sitemap to real, indexable HTML pages only:
            //  - drop non-page build artifacts (ads.txt, search-index.json)
            //  - drop /search (noindex,follow — same exclusion the old route used)
            // 404/500 status pages are excluded by the integration itself.
            filter: (page) =>
                !page.endsWith('/ads.txt') &&
                !page.endsWith('/search-index.json') &&
                !page.endsWith('/search'),
        }),
    ],
    vite: {
        plugins: [tailwindcss()],
    },
});
