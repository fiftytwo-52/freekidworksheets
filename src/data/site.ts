// Central site constants (MASTER-INSTRUCTION §11 / Appendix A).
// Values here are shared by every page, component, and build-time file.

export const SITE_NAME = 'freekidworksheet.com';
export const BRAND_NAME = 'FreeKidWorksheets';
export const TAGLINE = 'Free printable worksheets and question papers for kids';
export const TITLE_SUFFIX = '- freekidworksheet.com';

/** Canonical category list — keep tidy & reuse exactly in frontmatter. */
export const CATEGORIES = [
    'Alphabet & Tracing',
    'Math',
    'Coloring',
    'Writing',
    'Practice Questions',
] as const;

/** Canonical age-group list (values also used as route/data labels). */
export const AGE_GROUPS = ['3-4', '5-6', '7-8', '9+'] as const;

export const PER_PAGE = 20;

/** Brand tile colors, cycled across wordmark letters (§2.1). */
export const TILE_COLORS = [
    '#fbbf24', // yellow
    '#fb7185', // coral
    '#60a5fa', // blue
    '#34d399', // green
    '#f9a8d4', // pink
    '#a78bfa', // purple
    '#2dd4bf', // teal
    '#fb923c', // orange
] as const;

export const SITE_URL =
    (import.meta.env.SITE_URL as string | undefined) ?? 'http://localhost:4321';

export const ADSENSE_PUBLISHER_ID =
    (import.meta.env.ADSENSE_PUBLISHER_ID as string | undefined) ?? '';
export const GA_ID = (import.meta.env.GA_ID as string | undefined) ?? '';
export const CONTACT_EMAIL =
    (import.meta.env.CONTACT_EMAIL as string | undefined) ?? '';

/** Home page FAQ — real Q&As, mirrored by FAQPage JSON-LD (§13.2). */
export const FAQS = [
    {
        question: 'Are these worksheets really free? What\u2019s the catch?',
        answer:
            'Yes — every worksheet on Free Kid Worksheets is 100% free, forever. There is no catch: no signup, no payment, no download limits, and no hidden premium version. We believe every child should have access to good learning materials, so we keep the whole library free and cover our costs with non-intrusive advertising.',
    },
    {
        question: 'What age groups do your worksheets cover?',
        answer:
            'Our library is organised for early learners and primary students, roughly ages 3 to 9+. You will find preschool tracing and coloring sheets for ages 3\u20134, early reading and number work for 5\u20136, and more challenging writing, math, and practice questions for 7\u20138 and up. Every worksheet card shows its recommended age group so you can pick the right level quickly.',
    },
    {
        question: 'Are the worksheets A4 print-ready?',
        answer:
            'Yes. Each worksheet is a single high-quality image sized to an A4 ratio. Just press the Download button to save the image, or the Print button to print it straight from your browser. The print view is cleaned up so only the worksheet prints, saving you paper and ink.',
    },
    {
        question: 'Can I use these worksheets in my classroom?',
        answer:
            'Absolutely. Parents, teachers, and homeschoolers are welcome to download, print, and use our worksheets for personal and classroom use at no cost. You do not need to register or ask for permission, and you may print as many copies as you need for the children you teach.',
    },
    {
        question: 'Do you offer practice question papers too?',
        answer:
            'We do. Alongside playful activity worksheets, the library includes practice question papers designed for exam preparation — covering math, English, and other subjects for primary classes. Find them under Practice Questions on the top navigation, or filter any category page to show question papers only.',
    },
    {
        question: 'Can I request a specific worksheet topic?',
        answer:
            'We love suggestions. If there is a topic, letter, or skill you would like a worksheet for, use the Contact page to tell us about it. While we cannot guarantee every request, feedback from parents and teachers directly shapes what we add to the library next.',
    },
] as const;

/** BrowseLayout configs for the library pages (§11.2). */
export const BROWSE_PAGES = {
    worksheets: {
        path: '/worksheets',
        kicker: 'FREE PRINTABLE LIBRARY',
        title: 'Worksheets',
        blurb:
            'Browse every free printable activity worksheet in the library — tracing, alphabet, math, coloring, and writing practice for young learners.',
        empty: 'No worksheets match your filters.',
    },
    questions: {
        path: '/practice-questions',
        kicker: 'EXAM PREPARATION',
        title: 'Practice questions',
        blurb:
            'Free printable practice question papers for exam preparation — perfect for primary students who want to rehearse before a test.',
        empty: 'No question papers match your filters.',
    },
} as const;

/** Footer / nav link lists (§10.3 / §10.4). */
export const NAV_LINKS = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/worksheets', label: 'Worksheets', icon: 'grid' },
    { href: '/practice-questions', label: 'Practice questions', icon: 'book' },
    { href: '/about', label: 'About', icon: 'info' },
    { href: '/contact', label: 'Contact', icon: 'mail' },
] as const;

export const FOOTER_EXPLORE = [
    { href: '/', label: 'Home' },
    { href: '/worksheets', label: 'Worksheets' },
    { href: '/practice-questions', label: 'Practice Questions' },
    { href: '/search', label: 'Search the library' },
] as const;

export const FOOTER_LEGAL = [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
] as const;

/** Popup ad config (home only, once per session). Empty-safe (§14). */
export const POPUP_AD = {
    active: false,
    image: '/ads/popup.png',
    aspectRatio: '1:1' as const,
    redirectUrl: '',
};
