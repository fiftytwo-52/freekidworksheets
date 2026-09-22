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
    'kids fun worksheets',
    'free printable kid worksheets',
    'printable kid worksheets',
    'little kid worksheets',
    'free kid worksheets grade 2',
    'free kid worksheets pdf',
    'free printable worksheets pdf',
    'free kid worksheets 2nd grade',
    'free kid worksheets math',
    'free preschool worksheets age 4 5',
    'grafomotricidad',
    'grafomotricidad 3 años',
    'fichas grafomotricidad',
    'dibujos colorear',
    'dibujos para colorear',
    'fichas grafomotricidad para imprimir',
    'grafomotricidad para niños',
    'dibujos para colorear niños',
    'actividades para niños de 3 años',
    'spanish worksheets for kids',
    'spanish worksheets printable',
    'free worksheets for kids',
    'free printable worksheets for kids',
    'free worksheets and printables for kids',
    'free educational worksheets and printables for kids',
    'worksheets for kids',
    'kids worksheets',
    'kindergarten worksheets',
    'kindergarten math worksheets',
    'math worksheets',
    '1st grade math worksheets',
    '3rd grade math worksheets',
    '4th grade math worksheets',
    'nepali worksheets',
    'nepali worksheet',
    'browse nepali worksheets',
    'nepali alphabet consonant ka kha to nga',
    'free nepali worksheets',
    'free nepali worksheets printable',
    'free nepali worksheets and printables',
    'nepali worksheets for ukg',
    'nepali worksheets for grade 1',
    'practice nepali worksheets for grade 1',
    'nepali worksheets for nursery',
    'nepali worksheets for nursery and lkg',
    'lkg nepali worksheets',
    'nepali worksheets with answers pdf',
    'nepali worksheets pdf free download',
    'nepali worksheets pdf',
    'nepali worksheets with answers',
    'nepali worksheets pdf download',
    'nepali worksheet for nursery',
    'nepali worksheet for class 1',
    'nepali worksheet for ukg',
    'nepali worksheet for nursery pdf free download',
    'nepali handwriting practice pdf free download',
    'nepali worksheet for class 2',
    'lkg nepali worksheet',
    'nepali worksheet for lkg with answers',
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
    {
        question: 'Do you offer free printable worksheets for kindergarten and preschool?',
        answer:
            'Yes — my kindergarten worksheets and preschool collections are completely free. They include kindergarten math worksheets, alphabet tracing, phonics, counting, coloring, and fine-motor activities designed for early learners aged 3 to 6.',
    },
    {
        question: 'What kind of math worksheets are available?',
        answer:
            'My math worksheets library covers counting, number tracing, addition, subtraction, comparing numbers, patterns, and problem-solving practice. You will find 1st grade math worksheets, 3rd grade math worksheets, 4th grade math worksheets, and kindergarten math worksheets — all free printable worksheets for kids.',
    },
    {
        question: 'Are there worksheets organized by grade level?',
        answer:
            'Yes. Every worksheet is tagged with an age group from nursery and LKG through UKG, grade 1, grade 2, and grade 3+. You can filter the free worksheets for kids library by grade to quickly find printable activity pages at the right difficulty level.',
    },
    {
        question: 'Do you have free Nepali worksheets for kids?',
        answer:
            'Yes! I offer free Nepali worksheets (निःशुल्क नेपाली कार्यपत्रहरू) including Nepali alphabet consonant Ka Kha to Nga (क ख ग घ ङ) tracing, Nepali numbers (१–१०), word matching, and handwriting practice. There are Nepali worksheets for UKG, Nepali worksheets for grade 1, and Nepali worksheets for nursery and LKG — all free to download and print.',
    },
    {
        question: 'Can teachers use these free worksheets and printables in the classroom?',
        answer:
            'Absolutely. These free worksheets and printables for kids are made for teachers, daycare centers, tutors, and homeschool families. Download, print, and share them for unlimited personal and classroom use — no subscription or attribution needed.',
    },
] as const;

/**
 * Nepali-page FAQ — bilingual Q&As for the /nepali landing page.
 * Mirrored by FAQPage JSON-LD via faqJsonLd(NEPALI_FAQS).
 */
export const NEPALI_FAQS = [
    {
        question: 'के यी नेपाली कार्यपत्रहरू साँच्चै निःशुल्क छन्? (Are these Nepali worksheets really free?)',
        answer:
            'हो, freekidworksheets.com मा भएका सबै नेपाली कार्यपत्रहरू (Nepali worksheets) १००% निःशुल्क छन्। दर्ता गर्नुपर्दैन, डाउनलोड सीमा पनि छैन। Free Nepali worksheets printable रूपमा उच्च गुणस्तरका तस्बिरहरू डाउनलोड गरेर सिधै प्रिन्ट गर्न सक्नुहुन्छ।',
    },
    {
        question: 'कुन कक्षाका लागि नेपाली कार्यपत्रहरू उपलब्ध छन्? (Which grade levels are the Nepali worksheets for?)',
        answer:
            'मैले नर्सरी र LKG का लागि Nepali worksheets for nursery and LKG, UKG का लागि Nepali worksheets for UKG, र कक्षा १ का लागि Nepali worksheets for grade 1 तयार गरेको छु। यसमा क ख ग अक्षर ट्रेसिङ, नेपाली अंक (१ देखि १०), शब्द मिलान, र हस्तलेखन अभ्यास समावेश छन्।',
    },
    {
        question: 'के LKG र UKG का बच्चाहरूका लागि छुट्टै कार्यपत्र छन्? (Are there separate worksheets for LKG and UKG kids?)',
        answer:
            'छन्! LKG Nepali worksheets मा सजिलो लाइन ट्रेसिङ, अक्षर चिन्ने र गन्तीका अभ्यास हुन्छन्, भने UKG का लागि मात्रा (matra), शब्द जोड्ने र वाक्य लेखनजस्ता अभ्यासहरू छन्। हरेक कार्यपत्र उमेर समूह अनुसार ट्याग गरिएको छ।',
    },
    {
        question: 'नेपाली वर्णमाला क ख ग देखि ङ सम्म अभ्यास गर्न पाइन्छ? (Can kids practice the Nepali alphabet Ka Kha to Nga?)',
        answer:
            'पाइन्छ। Nepali alphabet consonant Ka Kha to Nga (क ख ग घ ङ) ट्रेसिङ कार्यपत्रहरू उपलब्ध छन् — क ख ग समूहदेखि घ ङ सम्म, साथै च छ ज झ जस्ता curled consonant समूहहरूका लागि पनि छुट्टै ट्रेसिङ पृष्ठहरू छन्।',
    },
    {
        question: 'कक्षा १ (Grade 1) का बच्चाहरूले कस्तो अभ्यास गर्न सक्छन्? (What practice is available for Grade 1 kids?)',
        answer:
            'Practice Nepali worksheets for grade 1 मा वाचन र उत्तर लेखन, शब्द जोडी (sabda jodi), गणितका समस्या समाधान, र पढेर रङ भर्ने जस्ता अभ्यासहरू समावेश छन्। यी सबै निःशुल्क Nepali worksheets PDF जस्तै प्रिन्ट गर्न मिल्ने रूपमा उपलब्ध छन्।',
    },
    {
        question: 'कार्यपत्रहरू कसरी डाउनलोड वा प्रिन्ट गर्ने? (How do I download or print the worksheets?)',
        answer:
            'कुनै पनि कार्यपत्र खोल्नुहोस् र "Download" बटन थिचेर तस्बिर डाउनलोड गर्नुहोस्, वा "Print" बटनबाट सिधै प्रिन्ट गर्नुहोस्। सबै पृष्ठहरू A4 कागजका लागि तयार गरिएका छन् — ब्राउजरको प्रिन्ट सेटिङमा "Save as PDF" छानेर PDF पनि सुरक्षित गर्न सक्नुहुन्छ।',
    },
    {
        question: 'विदेशमा रहेका नेपाली परिवारका लागि उपयुक्त छ? (Are these suitable for Nepali families living abroad?)',
        answer:
            'अत्यन्त उपयुक्त! विदेशमा बस्ने नेपाली परिवारका बच्चाहरूले घरमै नेपाली भाषा र लिपि सिक्न यी निःशुल्क कार्यपत्रहरू प्रयोग गर्न सक्छन्। अभिभावक वा शिक्षकलाई कुनै खर्च लाग्दैन — सबै worksheets free download गर्न मिल्छ।',
    },
] as const;

/**
 * BrowseLayout configs for the language-specific worksheet libraries (§11.2).
 * Each language version of the site links to its own library:
 *   - English home  → /worksheets         (English worksheets only)
 *   - Nepali home   → /worksheets/nepali  (Nepali worksheets only)
 *   - Spanish home  → /worksheets/spanish (Spanish worksheets only)
 */
export const BROWSE_PAGES = {
    worksheets: {
        path: '/worksheets',
        language: 'en',
        kicker: 'FREE PRINTABLE LIBRARY',
        title: 'Worksheets',
        blurb:
            'Browse every free printable activity worksheet in the library — tracing, alphabet, math, coloring, and writing practice for young learners.',
        empty: 'No worksheets match your filters.',
    },
    nepali: {
        path: '/worksheets/nepali',
        language: 'ne',
        kicker: 'नेपाली कार्यपत्र पुस्तकालय',
        title: 'नेपाली कार्यपत्रहरू (Nepali Worksheets)',
        blurb:
            'क ख ग ट्रेसिङ, गन्ती, शब्द मिलान र लेखन अभ्यास — सबै नेपाली कार्यपत्रहरू निःशुल्क डाउनलोड गर्नुहोस् र प्रिन्ट गर्नुहोस्।',
        empty: 'कुनै कार्यपत्र भेटिएन (No worksheets match your filters).',
    },
    spanish: {
        path: '/worksheets/spanish',
        language: 'es',
        kicker: 'BIBLIOTECA DE FICHAS GRATIS',
        title: 'Fichas en Español (Spanish Worksheets)',
        blurb:
            'Explora todas las fichas gratis en español — grafomotricidad, trazos, primeras letras y dibujos para colorear, listas para descargar e imprimir.',
        empty: 'No se encontraron fichas (No worksheets match your filters).',
    },
} as const;

/** Footer / nav link lists (§10.3 / §10.4). */
export const NAV_LINKS = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/worksheets', label: 'Worksheets', icon: 'grid' },
    { href: '/about', label: 'About', icon: 'info' },
    { href: '/contact', label: 'Contact', icon: 'mail' },
] as const;

/** Language switcher entries (nav dropdown + mobile drawer). */
export const LANGUAGE_LINKS = [
    { href: '/', label: 'English' },
    { href: '/nepali', label: 'नेपाली' },
    { href: '/spanish', label: 'Español' },
] as const;

export const FOOTER_EXPLORE = [
    { href: '/', label: 'Home (English)' },
    { href: '/nepali', label: 'Nepali Worksheets' },
    { href: '/spanish', label: 'Spanish Worksheets' },
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

/** Social media profiles for follow icons & links. */
export interface SocialLink {
    name: string;
    label: string;
    href: string;
    icon: 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'pinterest';
    brandColor: string;
}

export const SOCIAL_LINKS: readonly SocialLink[] = [
    {
        name: 'Facebook',
        label: 'Follow on Facebook',
        href: 'https://www.facebook.com/profile.php?id=61594239620068',
        icon: 'facebook',
        brandColor: '#1877F2',
    },
    {
        name: 'Instagram',
        label: 'Follow on Instagram',
        href: 'https://www.instagram.com/freekidworksheets/',
        icon: 'instagram',
        brandColor: '#E4405F',
    },
    {
        name: 'TikTok',
        label: 'Follow on TikTok',
        href: 'https://www.tiktok.com/@kidscore01?is_from_webapp=1&sender_device=pc',
        icon: 'tiktok',
        brandColor: '#000000',
    },
    {
        name: 'YouTube',
        label: 'Follow on YouTube',
        href: 'https://www.youtube.com/@gkfiftytwo',
        icon: 'youtube',
        brandColor: '#FF0000',
    },
    {
        name: 'Pinterest',
        label: 'Follow on Pinterest',
        href: 'https://pin.it/591riFuva',
        icon: 'pinterest',
        brandColor: '#BD081C',
    },
] as const;

