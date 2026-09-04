// site-search.ts — /search client-side behavior over the build-time
// search-index.json. Reads ?q= from the URL, filters entries
// by code / title / description / category / ageGroup / tags / language (case-insensitive substring),
// and renders worksheet-card-style results. All user text is HTML-escaped.

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
        ? `<img src="${esc(e.image)}" alt="" loading="lazy" decoding="async" class="h-full w-full object-contain" />`
        : '';
    const isNepali = e.language === 'ne';
    return `
<article class="card-lift flex flex-col overflow-hidden rounded-2xl border-2 border-yellow-200 bg-white shadow-sm transition-all hover:border-yellow-400 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
  <a href="${esc(href)}" class="relative block bg-neutral-50 dark:bg-neutral-800" tabindex="-1" aria-hidden="true">
    <div class="aspect-[4/3] w-full p-2">${img}</div>
    <span class="absolute left-2.5 top-2.5 rounded-full bg-pink-500 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">Free</span>
    ${isNepali ? `<span class="absolute left-14 top-2.5 rounded-full bg-emerald-500 px-2 py-0.5 font-mono text-[10px] font-bold text-white shadow-xs">नेपाली</span>` : ''}
    ${e.code ? `<span class="absolute right-2.5 top-2.5 rounded-full bg-neutral-900/80 backdrop-blur-xs px-2.5 py-0.5 font-mono text-[10px] font-bold text-white shadow-xs">#${esc(e.code)}</span>` : ''}
  </a>
  <div class="flex flex-1 flex-col p-4">
    <p class="font-mono text-[11px] font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">${esc(e.category)} \u00b7 ${esc(e.ageGroup)} yrs</p>
    <h3 class="mt-1 text-base font-bold leading-snug tracking-tight text-neutral-900 dark:text-neutral-100">
      <a href="${esc(href)}" class="hover:text-pink-500">${esc(e.title)}</a>
    </h3>
    <p class="mt-2 line-clamp-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">${esc(e.description)}</p>
  </div>
</article>`;
}

function init() {
    const root = document.getElementById('search-app');
    if (!root) return;

    const grid = root.querySelector<HTMLElement>('[data-search-grid]');
    const countEl = root.querySelector<HTMLElement>('[data-search-count]');
    const emptyEl = root.querySelector<HTMLElement>('[data-search-empty]');
    if (!grid || !countEl || !emptyEl) return;

    const q =
        new URLSearchParams(window.location.search).get('q')?.trim() ?? '';

    fetch('/search-index.json')
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then((entries: IndexEntry[]) => {
            const term = q.toLowerCase();
            const results = term
                ? entries.filter(
                    (e) =>
                        (e.code && e.code.toLowerCase().includes(term)) ||
                        e.title.toLowerCase().includes(term) ||
                        e.category.toLowerCase().includes(term) ||
                        e.ageGroup.toLowerCase().includes(term) ||
                        e.description.toLowerCase().includes(term) ||
                        (e.tags && e.tags.some(t => t.toLowerCase().includes(term))) ||
                        (e.language && e.language.toLowerCase().includes(term)),
                )
                : entries;

            const holder = document.createElement('div');
            holder.className =
                'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4';
            results.forEach((e) => {
                holder.insertAdjacentHTML('beforeend', cardHtml(e));
            });

            const frag = document.createDocumentFragment();
            while (holder.firstChild) frag.appendChild(holder.firstChild);
            grid.appendChild(frag);

            const n = results.length;
            countEl.textContent =
                `${n === 0 ? 'No' : n} ${n === 1 ? 'result' : 'results'}`;
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
