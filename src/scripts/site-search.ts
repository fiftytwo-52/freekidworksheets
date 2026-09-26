// site-search.ts — /search client-side behavior over the build-time
// search-index.json. Reads ?q= from the URL, filters entries
// by code / title / description / category / ageGroup / tags / language (case-insensitive substring),
// and renders worksheet-card-style results. An optional ?lang= param
// (en / ne / es) first restricts the pool to worksheets of that language,
// so popular-topic chips and hero search forms stay language-aware.
// All user text is HTML-escaped.

interface IndexEntry {
    slug: string;
    code: string;
    title: string;
    category: string;
    ageGroup: string;
    date: string;
    description: string;
    image?: string;
    tags?: string[];
    language?: string;
}

const LANG_NAMES: Record<string, string> = {
    en: 'English',
    ne: 'Nepali',
    es: 'Spanish',
    pt: 'Portuguese',
};

function esc(s: string): string {
    return s
        .replace(/&/g, '\u0026amp;')
        .replace(/</g, '\u0026lt;')
        .replace(/>/g, '\u0026gt;')
        .replace(/"/g, '\u0026quot;')
        .replace(/'/g, '\u0026#39;');
}

function cardHtml(e: IndexEntry): string {
    const href = `/worksheet/${encodeURIComponent(e.slug)}`;
    const img = e.image
        ? `<img src="${esc(e.image)}" alt="${esc('Free printable ' + e.title.toLowerCase() + ' worksheet for ages ' + e.ageGroup)}" loading="lazy" decoding="async" class="h-full w-full object-contain" />`
        : '';
    // Minimal card, matching WorksheetCard.astro: pure thumbnail + code badge,
    // with a hover overlay revealing title + category/age on pointer devices.
    return `
<article class="card-lift group relative overflow-hidden rounded-xl border border-hairline bg-white shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
  <a href="${esc(href)}" class="block" aria-label="${esc(e.title)}">
    <div class="relative aspect-[3/4] w-full bg-neutral-50 p-1.5 dark:bg-neutral-800/50">${img}
      <div class="pointer-events-none absolute inset-1.5 hidden flex-col justify-end rounded-lg bg-gradient-to-t from-neutral-900/90 via-neutral-900/40 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 [@media(hover:hover)]:flex">
        <h3 class="line-clamp-3 text-sm font-bold leading-snug text-white">${esc(e.title)}</h3>
        <p class="mt-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-pink-300">${esc(e.category)} \u00b7 ${esc(e.ageGroup)} yrs</p>
      </div>
    </div>
    ${e.code ? `<span class="absolute right-2 top-2 rounded-md bg-neutral-900/85 px-2 py-0.5 font-mono text-[10px] font-bold text-white shadow-xs backdrop-blur-xs dark:bg-neutral-800/90">#${esc(e.code)}</span>` : ''}
  </a>
</article>`;
}

function init() {
    const root = document.getElementById('search-app');
    if (!root) return;

    const grid = root.querySelector<HTMLElement>('[data-search-grid]');
    const countEl = root.querySelector<HTMLElement>('[data-search-count]');
    const emptyEl = root.querySelector<HTMLElement>('[data-search-empty]');
    if (!grid || !countEl || !emptyEl) return;

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q')?.trim() ?? '';
    // Optional language scope (?lang=en|ne|es) — when present, only
    // worksheets of that language are searched (language-aware chips/forms).
    const lang = params.get('lang')?.trim().toLowerCase() ?? '';

    fetch('/search-index.json')
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then((entries: IndexEntry[]) => {
            const pool = lang
                ? entries.filter((e) => (e.language ?? 'en') === lang)
                : entries;
            const term = q.toLowerCase();
            const results = term
                ? pool.filter(
                    (e) =>
                        (e.code && e.code.toLowerCase().includes(term)) ||
                        e.title.toLowerCase().includes(term) ||
                        e.category.toLowerCase().includes(term) ||
                        e.ageGroup.toLowerCase().includes(term) ||
                        e.description.toLowerCase().includes(term) ||
                        (e.tags && e.tags.some(t => t.toLowerCase().includes(term))) ||
                        (e.language && e.language.toLowerCase().includes(term)),
                )
                : pool;

            const holder = document.createElement('div');
            holder.className =
                'grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4';
            results.forEach((e) => {
                holder.insertAdjacentHTML('beforeend', cardHtml(e));
            });

            const frag = document.createDocumentFragment();
            while (holder.firstChild) frag.appendChild(holder.firstChild);
            grid.appendChild(frag);

            const n = results.length;
            const scope = lang ? ` in ${LANG_NAMES[lang] ?? lang} worksheets` : '';
            countEl.textContent =
                `${n === 0 ? 'No' : n} ${n === 1 ? 'result' : 'results'}${scope}`;
            emptyEl.hidden = n !== 0;
        })
        .catch(() => {
            countEl.textContent = 'Search unavailable';
            emptyEl.hidden = false;
            emptyEl.textContent =
                'We could not load the search index. Please try again later.';
        });
}

document.addEventListener('DOMContentLoaded', init);

export { };
