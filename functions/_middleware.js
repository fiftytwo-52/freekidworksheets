// functions/_middleware.js — Pages Functions middleware (runs on every request).
//
// Why this exists: Cloudflare's _headers file can only match request PATHS,
// never hostnames, so it cannot apply a header to only the *.pages.dev domain.
// This middleware adds `X-Robots-Tag: noindex` whenever the site is served
// from a *.pages.dev host (the production pages.dev URL and per-deployment
// preview URLs), so search engines never index the temporary domain as
// duplicate content. The production custom domain (freekidworksheets.com)
// stays fully indexable.

export const onRequest = async ({ request, next }) => {
    const response = await next();

    const host = new URL(request.url).hostname;
    if (host.endsWith('.pages.dev')) {
        response.headers.set('X-Robots-Tag', 'noindex');
    }

    return response;
};
