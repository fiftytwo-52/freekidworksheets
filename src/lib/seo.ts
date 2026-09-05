import type { CollectionEntry } from 'astro:content';
import { FAQS, SITE_URL, TITLE_SUFFIX } from '../data/site';

/** Absolute URL for canonical/OG/sitemap use. */
export function absoluteUrl(path: string): string {
    const clean = path.startsWith('/') ? path : `/${path}`;
    return new URL(clean, SITE_URL).toString();
}

/** `<title>` = page title + site suffix (Appendix A). */
export function makeTitle(pageTitle: string): string {
    return `${pageTitle} ${TITLE_SUFFIX}`.trim();
}

/** First ~200 characters of the description, sentence-clipped. */
export function excerpt(text: string, max = 200): string {
    const trimmed = text.replace(/\s+/g, ' ').trim();
    if (trimmed.length <= max) return trimmed;
    const cut = trimmed.slice(0, max);
    const lastSpace = cut.lastIndexOf(' ');
    return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

/** Never let user-authored text break out of a JSON-LD <script>. */
export function escapeJsonLd(s: string): string {
    return s.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

/** `provider` Organization shared by structured data on every public page. */
export const providerOrganization = {
    '@type': 'Organization',
    name: 'Free Kid Worksheets',
    url: SITE_URL,
};

/** Home: WebSite + SearchAction (§11.1.8). */
export function websiteJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Free Kid Worksheets',
        alternateName: 'freekidworksheets.com',
        url: SITE_URL,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

/** Home: FAQPage mirroring src/data/site.ts FAQS (§13.2). */
export function faqJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
    };
}

/** Worksheet detail: LearningResource (§11.3.9). */
export function learningResourceJsonLd(
    entry: CollectionEntry<'worksheets'>,
    url: string,
) {
    const data = entry.data;
    const worksheetKeywords = [
        ...data.tags,
        data.category,
        'kids worksheet',
        'kids worksheets free',
        'kids worksheets printable',
        'kids worksheet pdf',
    ];

    return {
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        name: data.title,
        description: data.description,
        url,
        image: absoluteUrl(data.image.src),
        isAccessibleForFree: true,
        educationalLevel: `ages ${data.ageGroup}`,
        learningResourceType: 'worksheet',
        keywords: worksheetKeywords.join(', '),
        teaches:
            data.tags.length > 0 ? data.tags : ['early learning', data.category],
        datePublished: data.date.toISOString().slice(0, 10),
        provider: providerOrganization,
        inLanguage: data.language === 'ne' ? 'ne' : 'en',
    };
}
