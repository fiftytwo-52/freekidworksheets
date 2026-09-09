// ui-strings.ts — per-language UI strings for shared components (library
// layout hero card, filter panel, popular-topic chips). English, Nepali, and
// Spanish so every language version of the site renders its own chrome.
import { POPULAR_TOPICS } from './site';

export type Lang = 'en' | 'ne' | 'es';

export const UI_STRINGS = {
    en: {
        searchHeading: 'Search worksheets',
        searchHint: 'Find activities by title, topic, or 4-digit code.',
        searchPlaceholder: 'Search by title, topic, or code (e.g., 1001)...',
        searchButton: 'Search',
        srSearchWorksheets: 'Search worksheets',
        popularTopics: 'Popular Topics',
        noResultsInGrid: 'No worksheets in this section yet — check back soon.',
        filtersSort: 'Filters & sort',
        category: 'Category',
        allCategories: 'All categories',
        ageGroup: 'Age group',
        allAges: 'All ages',
        colorType: 'Color Type',
        allTypes: 'All types',
        blackAndWhite: 'Black & White',
        colorful: 'Colorful',
        sortBy: 'Sort by',
        latest: 'Latest',
        az: 'A to Z',
        gradeAsc: 'Grade (Ascending)',
        resetFilters: 'Reset filters',
        result: 'result',
        results: 'results',
    },
    es: {
        searchHeading: 'Buscar fichas',
        searchHint: 'Encuentra actividades por título, tema o código de 4 dígitos.',
        searchPlaceholder: 'Buscar por título, tema o código (ej. 1001)...',
        searchButton: 'Buscar',
        srSearchWorksheets: 'Buscar fichas',
        popularTopics: 'Temas populares',
        noResultsInGrid: 'Aún no hay fichas en esta sección — vuelve pronto.',
        filtersSort: 'Filtrar y ordenar',
        category: 'Categoría',
        allCategories: 'Todas las categorías',
        ageGroup: 'Grupo de edad',
        allAges: 'Todas las edades',
        colorType: 'Tipo de color',
        allTypes: 'Todos los tipos',
        blackAndWhite: 'Blanco y negro',
        colorful: 'A color',
        sortBy: 'Ordenar por',
        latest: 'Más recientes',
        az: 'De A a Z',
        gradeAsc: 'Grado (ascendente)',
        resetFilters: 'Restablecer filtros',
        result: 'resultado',
        results: 'resultados',
    },
    ne: {
        searchHeading: 'कार्यपत्र खोज्नुहोस्',
        searchHint: 'शीर्षक, विषय, वा ४-अंक कोडद्वारा खोज्नुहोस्।',
        searchPlaceholder: 'शीर्षक, विषय वा कोडले खोज्नुहोस् (जस्तै, १००१)...',
        searchButton: 'खोज्नुहोस्',
        srSearchWorksheets: 'नेपाली कार्यपत्र खोज्नुहोस्',
        popularTopics: 'लोकप्रिय विषयहरू',
        noResultsInGrid: 'यस खण्डमा अझै कुनै कार्यपत्र छैन — चाँडै फेरि आउनुहोस्।',
        filtersSort: 'फिल्टर र क्रम',
        category: 'श्रेणी',
        allCategories: 'सबै श्रेणीहरू',
        ageGroup: 'उमेर समूह',
        allAges: 'सबै उमेर',
        colorType: 'रङ प्रकार',
        allTypes: 'सबै प्रकार',
        blackAndWhite: 'कालो र सेतो',
        colorful: 'रङ्गीन',
        sortBy: 'क्रम मिलाउनुहोस्',
        latest: 'पछिल्ला',
        az: 'A देखि Z',
        gradeAsc: 'कक्षा (बढ्दो क्रम)',
        resetFilters: 'फिल्टर रिसेट गर्नुहोस्',
        result: 'नतिजा',
        results: 'नतिजाहरू',
    },
} as const;

export type UiStrings = (typeof UI_STRINGS)[Lang];

/**
 * Popular-topic chips per language version — labels and search queries match
 * the tags each language's worksheets are indexed with (English reuses the
 * canonical POPULAR_TOPICS; the library pages show the first 7).
 */
export const TOPICS_BY_LANG: Record<Lang, ReadonlyArray<{ label: string; query: string }>> = {
    en: POPULAR_TOPICS,
    ne: ['Nepali', 'Tracing', 'Alphabet', 'Numbers', 'Matching', 'Colouring'].map(
        (t) => ({ label: t, query: t }),
    ),
    es: [
        'Grafomotricidad',
        'Grafomotricidad 3 años',
        'Fichas grafomotricidad',
        'Dibujos colorear',
        'Trazos',
        'Colorear',
    ].map((t) => ({ label: t, query: t })),
};
