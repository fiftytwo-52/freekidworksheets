// Central site constants (MASTER-INSTRUCTION §11 / Appendix A).
// Values here are shared by every page, component, and build-time file.

export const SITE_NAME = 'freekidworksheets.com';
export const BRAND_NAME = 'FreeKidWorksheets';
export const TAGLINE = 'Free printable worksheets for kids';
export const TITLE_SUFFIX = '- freekidworksheets.com';

/** High-value SEO keywords & search terms. */
export const SEO_KEYWORDS = [
    'body parts for kids worksheet',
    'shapes for kids worksheet',
    'nursery kids worksheet',
    'english for kids worksheet',
    'maths kids worksheet',
    'emotions for kids worksheet',
    'all about me kids worksheet',
    'drawing for kids worksheet',
    'weather for kids worksheet',
    'feelings for kids worksheet',
    'kids worksheet',
    'kids worksheet pdf',
    'kids worksheets free',
    'kids worksheets printable',
    'kids worksheet english',
    'kids worksheets kindergarten',
    'kids worksheet for nursery',
    'kids worksheets free download',
    'kids worksheets nursery pdf free download',
    'kids worksheet maths',
    'kid worksheets',
    'free kid worksheets',
    'diary of a wimpy kid worksheets pdf',
    'diary of a wimpy kid worksheets',
    'kids fun worksheets',
    'free printable kid worksheets',
    'printable kid worksheets',
    'little kid worksheets',
    'wimpy kid worksheets',
    'therapist aid kid worksheets',
    'free kid worksheets grade 2',
    'free kid worksheets pdf',
    'free printable worksheets pdf',
    'free kid worksheets 2nd grade',
    'free kid worksheets math',
    'free preschool worksheets age 4 5',
    'setembro amarelo atividades para imprimir',
    'atividades para imprimir',
] as const;

export const DEFAULT_KEYWORDS_STRING = SEO_KEYWORDS.join(', ');

/** Popular curated worksheet topics for quick navigation, search pills, and SEO linking. */
export const POPULAR_TOPICS = [
    { label: 'Nursery', query: 'nursery' },
    { label: 'Preschool', query: 'preschool' },
    { label: 'Kindergarten', query: 'kindergarten' },
    { label: 'Grade 1', query: 'grade 1' },
    { label: 'Grade 2', query: 'grade 2' },
    { label: 'Grade 3+', query: 'grade 3' },
    { label: 'English', query: 'english' },
    { label: 'Maths', query: 'math' },
    { label: 'Shapes', query: 'shapes' },
    { label: 'Body Parts', query: 'body parts' },
    { label: 'Emotions', query: 'emotions' },
    { label: 'Coloring', query: 'coloring' },
] as const;

/** Canonical category list — keep tidy & reuse exactly in frontmatter. */
export const CATEGORIES = [
    'Alphabet & Tracing',
    'Math',
    'Coloring',
    'Writing',
] as const;

/** Canonical age-group list (values also used as route/data labels). */
export const AGE_GROUPS = ['3-4', '5-6', '7-8', '9+'] as const;

export const PER_PAGE = 20;

export const SITE_URL =
    (import.meta.env.SITE_URL as string | undefined) || 'http://localhost:4321';

export const ADSENSE_PUBLISHER_ID =
    (import.meta.env.ADSENSE_PUBLISHER_ID as string | undefined) || '';
export const GA_ID = (import.meta.env.GA_ID as string | undefined) || '';
export const CONTACT_EMAIL =
    (import.meta.env.CONTACT_EMAIL as string | undefined) || 'gun-yes@proton.me';

/** Home page FAQ — real Q&As, mirrored by FAQPage JSON-LD (§13.2). */
export const FAQS = [
    {
        question: 'Are these kids worksheets really free to download and print?',
        answer:
            'Yes — every kids worksheet on Free Kid Worksheets is 100% free forever. There is no catch, no registration, and no download limits. You can find kids worksheets free download and printable activity pages ready to download directly as high-resolution printable images for home or classroom learning.',
    },
    {
        question: 'What subjects and learning topics are available on freekidworksheets.com?',
        answer:
            'My library covers a wide selection of early education themes: english for kids worksheet, maths kids worksheet, shapes for kids worksheet, body parts for kids worksheet, weather for kids worksheet, drawing for kids worksheet, all about me kids worksheet, and emotions for kids worksheet or feelings for kids worksheet.',
    },
    {
        question: 'Do you have nursery and kindergarten kids worksheets for early learning?',
        answer:
            'Yes! I offer dedicated nursery kids worksheet collections, kids worksheet for nursery, and kids worksheets kindergarten. These include alphabet tracing, number counting, shape recognition, phonics, color by numbers, and motor skill exercises crafted specifically for toddlers and early learners aged 3 to 6.',
    },
    {
        question: 'Can I print or save kids worksheets as PDF?',
        answer:
            'All worksheets are available as high-resolution, print-ready image files sized for standard A4 paper. You can download the image file directly, print it immediately using the Print button, or select "Save as PDF" in your browser print window. Whether you need a kids worksheet pdf, kids worksheets printable sheets, or kids worksheets nursery pdf free download resources, my image worksheets print with sharp, crisp lines.',
    },
    {
        question: 'Are these worksheets suitable for teachers, daycare centers, and homeschooling?',
        answer:
            'Absolutely. Parents, teachers, and homeschool educators are welcome to download, print, and share my kids worksheet english, kids worksheet maths, and activity pages for unlimited personal and classroom teaching at no cost.',
    },
    {
        question: 'How do I search for a specific worksheet topic or code?',
        answer:
            'Every worksheet features a unique 4 or 5-digit search code. You can search directly by code (e.g., 1001), subject, or keyword such as "kids worksheet maths", "shapes for kids worksheet", "emotions for kids worksheet", or "weather for kids worksheet" in the search bar.',
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
} as const;

/** Footer / nav link lists (§10.3 / §10.4). */
export const NAV_LINKS = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/worksheets', label: 'Worksheets', icon: 'grid' },
    { href: '/nepali', label: 'Nepali', icon: 'grid' },
    { href: '/portuguese', label: 'Portuguese', icon: 'grid' },
    { href: '/about', label: 'About', icon: 'info' },
    { href: '/contact', label: 'Contact', icon: 'mail' },
] as const;

export const FOOTER_EXPLORE = [
    { href: '/', label: 'Home (English)' },
    { href: '/nepali', label: 'Nepali Worksheets' },
    { href: '/portuguese', label: 'Portuguese Worksheets' },
    { href: '/worksheets', label: 'Worksheets Library' },
    { href: '/search', label: 'Search the library' },
] as const;

export const FOOTER_LEGAL = [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
] as const;

/** Popup ad config (disabled/empty-safe). */
export const POPUP_AD = {
    active: false,
    image: '',
    aspectRatio: '1:1' as const,
    redirectUrl: '',
};
