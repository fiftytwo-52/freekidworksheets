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

/** Home: WebSite + SearchAction + Organization (§11.1.8 / TASK-15). */
export function websiteJsonLd() {
    return [
        {
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
        },
        {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Free Kid Worksheets',
            url: SITE_URL,
            logo: `${SITE_URL}/assets/worksheets-icon.png`,
        },
    ];
}

/** FAQPage JSON-LD mirroring FAQ sets from src/data/site.ts (§13.2).
 *  Defaults to the home FAQS; pages can pass their own set (e.g. NEPALI_FAQS). */
export function faqJsonLd(
    faqs: ReadonlyArray<{ question: string; answer: string }> = FAQS,
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
    };
}

/** Worksheet detail: LearningResource (§11.3.9). `about` overrides the visible
 *  about copy used as the schema description (SEO TASK-15). */
export function learningResourceJsonLd(
    entry: CollectionEntry<'worksheets'>,
    url: string,
    about?: string,
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
        description: (about || data.description).slice(0, 500),
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
        inLanguage: data.language,
    };
}

/** Worksheet detail: visible trail Home › Worksheets › Category › Worksheet (TASK-10). */
export function breadcrumbJsonLd(
    homeUrl: string,
    libraryUrl: string,
    categoryName: string,
    categoryUrl: string,
    worksheetName: string,
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: homeUrl,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Worksheets',
                item: libraryUrl,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: categoryName,
                item: categoryUrl,
            },
            {
                '@type': 'ListItem',
                position: 4,
                name: worksheetName,
            },
        ],
    };
}

/** Guide/article pages: Article schema (SEO TASK-20). */
export function articleJsonLd(opts: {
    name: string;
    description: string;
    url: string;
    inLanguage: string;
    datePublished: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: opts.name,
        description: opts.description.slice(0, 300),
        inLanguage: opts.inLanguage,
        datePublished: opts.datePublished,
        author: providerOrganization,
        publisher: providerOrganization,
        mainEntityOfPage: opts.url,
    };
}

/** Flexible breadcrumb trail for any page: [{ name, url? }] (last item = current page). */
export function breadcrumbListJsonLd(
    trail: ReadonlyArray<{ name: string; url?: string }>,
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((step, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: step.name,
            ...(step.url ? { item: absoluteUrl(step.url) } : {}),
        })),
    };
}
