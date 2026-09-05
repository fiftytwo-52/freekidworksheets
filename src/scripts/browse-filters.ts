// browse-filters.ts — client-side filter + sort controller for the library,
// category, and home featured grids (§11.2 / §12.2). Zero dependencies.
//
// Expected DOM (one [data-filter-region] per page):
//   [data-card-grid]      → the grid of [data-*] WorksheetCards
//   [data-filter-input]   → search text field
//   [data-filter-select]  → selects named category|age|sort
//   [data-result-count]   → "N results" live count
//   [data-empty-state]    → hidden empty-state message
//
// Options (category/age) are derived from the visible cards' data-* attributes,
// so they stay in sync with the content baked in at build time.

interface CardData {
    title: string;
    code: string;
    category: string;
    age: string;
    colorType: string;
    created: string;
    slug: string;
    el: HTMLElement;
}

// Canonical age ordering so "9+" sorts last instead of first lexically.
const AGE_ORDER = ['3-4', '5-6', '7-8', '9+', '10+', '11+', '12+'];

function ageCompare(a: string, b: string): number {
    const ia = AGE_ORDER.indexOf(a);
    const ib = AGE_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) {
        return a.localeCompare(b, undefined, { numeric: true });
    }
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
}

function readCards(grid: HTMLElement): CardData[] {
    return Array.from(grid.querySelectorAll<HTMLElement>('[data-title]')).map(
        (el) => ({
            title: el.getAttribute('data-title') ?? '',
            code: el.getAttribute('data-code') ?? '',
            category: el.getAttribute('data-category') ?? '',
            age: el.getAttribute('data-age') ?? '',
            colorType: el.getAttribute('data-color-type') ?? '',
            created: el.getAttribute('data-created') ?? '',
            slug: el.getAttribute('data-slug') ?? '',
            el,
        }),
    );
}

function fillSelect(
    select: HTMLSelectElement | null | undefined,
    values: string[],
    label: string,
) {
    if (!select) return;
    const previous = select.value;
    select.innerHTML = '';
    const all = document.createElement('option');
    all.value = '';
    all.textContent = label;
    select.appendChild(all);
    for (const v of values) {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        select.appendChild(opt);
    }
    // Restore previous selection if it is still valid.
    if (Array.from(select.options).some((o) => o.value === previous)) {
        select.value = previous;
    }
}

function initRegion(region: HTMLElement) {
    const grid = region.querySelector<HTMLElement>('[data-card-grid]');
    if (!grid) return;
    const cards = readCards(grid);
    if (cards.length === 0) return; // nothing to filter yet

    const searchInput =
        region.querySelector<HTMLInputElement>('[data-filter-input]');
    const selects = Array.from(
        region.querySelectorAll<HTMLSelectElement>('[data-filter-select]'),
    );
    const resetButton =
        region.querySelector<HTMLButtonElement>('[data-filter-reset]');
    const sel = (name: string) =>
        selects.find((s) => s.getAttribute('data-filter-select') === name);
    const countEl = region.querySelector<HTMLElement>('[data-result-count]');
    const emptyEl = region.querySelector<HTMLElement>('[data-empty-state]');

    // Derive option lists from the visible cards (kept in sync with content).
    fillSelect(
        sel('category'),
        [...new Set(cards.map((c) => c.category))].sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: 'base' }),
        ),
        'All categories',
    );
    fillSelect(sel('age'), [...new Set(cards.map((c) => c.age))].sort(ageCompare), 'All ages');

    function apply() {
        const q = (searchInput?.value ?? '').trim().toLowerCase();
        const cat = sel('category')?.value ?? '';
        const age = sel('age')?.value ?? '';
        const colorType = sel('color-type')?.value ?? '';
        const sortBy = sel('sort')?.value ?? 'latest';

        const shown: CardData[] = [];
        const hidden: CardData[] = [];
        for (const c of cards) {
            const inCode = c.code.toLowerCase().includes(q);
            const inTitle = c.title.toLowerCase().includes(q);
            const inCategory = c.category.toLowerCase().includes(q);
            const matchesText = !q || inCode || inTitle || inCategory;
            const matches =
                matchesText &&
                (!cat || c.category === cat) &&
                (!age || c.age === age) &&
                (!colorType || c.colorType === colorType);
            (matches ? shown : hidden).push(c);
        }

        if (sortBy === 'az') {
            shown.sort((a, b) =>
                a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
            );
        } else if (sortBy === 'grade') {
            shown.sort((a, b) => {
                const cmp = ageCompare(a.age, b.age);
                if (cmp !== 0) return cmp;
                return b.created.localeCompare(a.created);
            });
        } else {
            shown.sort((a, b) => b.created.localeCompare(a.created));
        }

        for (const c of shown) c.el.hidden = false;
        for (const c of hidden) c.el.hidden = true;

        // Reorder DOM nodes: sorted visible first, hidden trailing.
        const frag = document.createDocumentFragment();
        for (const c of [...shown, ...hidden]) frag.appendChild(c.el);
        grid!.appendChild(frag);

        const n = shown.length;
        if (countEl) {
            countEl.textContent = `${n} ${n === 1 ? 'result' : 'results'}`;
        }
        if (emptyEl) emptyEl.hidden = n !== 0;
    }

    // Wire up events.
    searchInput?.addEventListener('input', apply);
    selects.forEach((s) => s.addEventListener('change', apply));
    resetButton?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        selects.forEach((select) => {
            select.value = select.getAttribute('data-filter-select') === 'sort' ? 'latest' : '';
        });
        apply();
    });

    apply(); // initial state (counts + sort applied on load)
}

document.addEventListener('DOMContentLoaded', () => {
    document
        .querySelectorAll<HTMLElement>('[data-filter-region]')
        .forEach(initRegion);
});

export { };
