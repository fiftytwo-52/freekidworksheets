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

/**
 * Lowercase hyphenated URL slug per canonical category (TASK-13).
 * Keep in lock-step with CATEGORIES. Source of truth for every internal
 * /category/* link, canonical tag, sitemap entry, and redirect rule.
 */
export const CATEGORY_SLUGS: Record<(typeof CATEGORIES)[number], string> = {
    'Alphabet & Tracing': 'alphabet-tracing',
    Math: 'math',
    Coloring: 'coloring',
    Writing: 'writing',
};

/** Full /category/* path for a canonical category name. */
export function categoryPath(category: string): string {
    const slug = (CATEGORY_SLUGS as Record<string, string>)[category];
    return `/category/${slug || encodeURIComponent(category)}`;
}

/**
 * Unique 150-250 word category intro copy rendered above the grid on
 * /category/<slug> (SEO TASK-08). Keyed by canonical category name.
 */
export const CATEGORY_INTROS: Record<string, string> = {
    'Alphabet & Tracing':
        'This is where early writing begins. The Alphabet & Tracing library collects every printable sheet that asks a child to follow a dotted line, copy a letter, trace a number, or join a picture to its first sound. Start with simple vertical and horizontal strokes if your child is holding a pencil for the first time, then move on to curves, zigzags, and full letters once those strokes feel comfortable. Each page is a single A4 sheet, so you can print a handful and choose the ones that match what your child is learning at school this week. Most sheets suit ages 3 to 6, but older learners who need extra pencil practice can use them too. Print at 100% scale with no page shrink for the cleanest lines, and let your child work with a thick pencil or crayon first. Everything here is free to download and free to use at home, in class, or in a daycare setting.',
    Coloring:
        'Colouring does more than keep little hands busy — it builds grip strength, colour awareness, and the patience to finish a task. The Coloring library holds printable colouring sheets sorted by age, from simple outlines with big open shapes for nursery learners to busier scenes with small details that suit Grade 1 and Grade 2 children. Many sheets double as a small lesson: animals, weather, seasons, body parts, and everyday objects appear again and again so a child connects the picture with the word. Black-and-white sheets print cheaply on any home printer, while the colour versions look best on a full-colour printer or at a print shop. Print at 100% scale so the outlines stay crisp, and consider a spare sheet for blending practice. Colouring also works well as a wrap-up activity: hand out one sheet when a task finishes early, and children get quiet practice without another screen. Every sheet in this category is free to download and print as often as you like, at home or in the classroom.',
    Math:
        'The Maths collection covers the numbers children meet first: counting objects, writing digits, adding and subtracting small amounts, comparing which group is bigger, and spotting simple patterns. Sheets are grouped by age so a nursery learner can start with counting to five while a Grade 2 learner moves on to addition and subtraction within twenty. Each page keeps the working area generous — big boxes, clear rows, and enough space for a child to write without crossing into the next question. Most sheets use pictures alongside numerals, which helps learners who are still reading the question aloud. Print at 100% scale on plain A4 paper, and keep a few blank copies for repeat practice, since repetition is what makes these skills stick. A sheet a day, even for ten minutes, is enough to see steady progress. Everything in this category is free to download and print for home use, tutoring, or classroom work, with no signup or fee at any point.',
    Writing:
        'The Writing library is built for children who can already hold a pencil and are ready to form words, sentences, and short answers. It includes letter formation practice, tracing and copying words, missing-letter prompts, matching pictures to names, sequencing tasks, and simple comprehension sheets that ask a child to read a line and respond. Use it alongside the Alphabet & Tracing pages when a learner is between stages: tracing builds the shape of the letter, and these sheets ask for the letter on its own. Sheets are grouped by age, with the shorter word lists and larger writing lines aimed at ages 4 to 6 and the sentence and comprehension work suited to ages 6 to 8. Print at 100% scale on A4, and give your child a pencil grip or a short pencil if handwriting fatigue sets in. Every page here is free to download and print at home or at school.',
};

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
            'Yes — every worksheet on Free Kid Worksheets is completely free. There are no subscriptions, hidden fees, watermarks, or download limits. Simply choose any activity page you like and print it directly at home or in school.',
    },
    {
        question: 'What subjects and learning topics are available on freekidworksheets.com?',
        answer:
            'The library focuses on foundational early learning. You will find alphabet tracing and phonics, early counting and math, shapes, colors, body parts, weather, all-about-me prompts, and simple drawing activities.',
    },
    {
        question: 'Do you have nursery and kindergarten kids worksheets for early learning?',
        answer:
            'Yes, a large part of the collection is created specifically for toddlers and early learners aged 3 to 6. These pages help young children practice holding a pencil, tracing lines and letters, recognizing numbers, and developing fine motor control.',
    },
    {
        question: 'Can I print or save kids worksheets as PDF?',
        answer:
            'Yes. Every sheet is sized for standard A4 paper and designed with clear outlines for clean printing. You can print directly from your browser, save the page as a PDF using your print dialog, or download the image file to print later.',
    },
    {
        question: 'Are these worksheets suitable for teachers, daycare centers, and homeschooling?',
        answer:
            'Yes, educators and homeschooling parents are welcome to print and distribute these materials freely. You can use them for daily classroom practice, morning warm-ups, homework packets, or daycare learning corners.',
    },
    {
        question: 'How do I search for a specific worksheet topic or code?',
        answer:
            'Use the search bar at the top of any page to search by topic, skill, or keyword. Each worksheet also has a unique 4 or 5-digit search code printed on it (such as 1001), which you can type directly into the search bar to find that exact sheet again.',
    },
    {
        question: 'Do you offer free printable worksheets for kindergarten and preschool?',
        answer:
            'Yes, our preschool and kindergarten resources cover number sense, letter formation, coloring scenes, and simple cut-and-paste exercises. They are tailored to make early learning engaging, low-stress, and screen-free.',
    },
    {
        question: 'What kind of math worksheets are available?',
        answer:
            'Our math activities cover essential early math skills: counting objects, number tracing, basic addition and subtraction, comparing quantities, and recognizing simple patterns. They are designed for preschool through Grade 2 learners.',
    },
    {
        question: 'Are there worksheets organized by grade level?',
        answer:
            'Yes. Every resource is organized by age group and grade level, from nursery and preschool up to Grade 2 and Grade 3+. You can use the age filters on any category or library page to find activities at the right difficulty level.',
    },
    {
        question: 'Do you have free Nepali worksheets for kids?',
        answer:
            'Yes! We offer a dedicated collection of Nepali worksheets (निःशुल्क नेपाली कार्यपत्रहरू) covering Nepali vowel and consonant tracing (क ख ग घ ङ), numbers (१–१०), word-picture matching, and handwriting practice for nursery through Class 1.',
    },
    {
        question: 'Can teachers use these free worksheets and printables in the classroom?',
        answer:
            'Absolutely. Teachers, tutors, and daycare providers can print as many copies as needed for their students without requiring any attribution or paid account.',
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
        // <title> stays short (TASK-13): "नेपाली कार्यपत्र" + " - freekidworksheets.com"
        // = 38 chars on page 1 and 48 on "— page 5". The visible H1 keeps the
        // bilingual label below.
        title: 'नेपाली कार्यपत्र',
        h1: 'नेपाली कार्यपत्रहरू (Nepali Worksheets)',
        blurb:
            'क ख ग ट्रेसिङ, १ देखि १० सम्म गन्ती, शब्द मिलान र लेखन अभ्यास — यी सबै नेपाली कार्यपत्रहरू निःशुल्क डाउनलोड गरी A4 पानामा प्रिन्ट गर्न सकिन्छन्।',
        empty: 'कुनै कार्यपत्र भेटिएन (No worksheets match your filters).',
    },
    spanish: {
        path: '/worksheets/spanish',
        language: 'es',
        kicker: 'BIBLIOTECA DE FICHAS GRATIS',
        // Short for <title> (TASK-13); the H1 keeps the bilingual label.
        title: 'Fichas en Español',
        h1: 'Fichas en Español (Spanish Worksheets)',
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
    { href: '/category/alphabet-tracing', label: 'Alphabet & Tracing' },
    { href: '/category/coloring', label: 'Coloring' },
    { href: '/category/math', label: 'Math' },
    { href: '/category/writing', label: 'Writing' },
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

