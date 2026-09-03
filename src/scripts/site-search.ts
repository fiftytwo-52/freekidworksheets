// site-search.ts — /search client-side behavior over the build-time
// search-index.json (§11.4 / §12.3). Reads ?q= from the URL, filters entries
// by title / description / category / ageGroup (case-insensitive substring),
// and renders worksheet-card-style results. All user text is HTML-escaped.
//
// Note: entity strings in esc() are written with \u0026 escapes so they survive
// any HTML-entity decoding of the source file; at runtime they become the real
// HTML entities.

interface IndexEntry {
    slug: string;
    title: string;
    category: string;
    ageGroup: string;
    kind: 'worksheet' | 'question';
    date: string;
    description: string;
    image?: string;
}

function esc(s: string): string {
    return s
        .replace(/&/g, '\u0026amp;')
        .replace(/</g, '\u0026lt;')
        .replace(/>/g, '\u0026gt;')
        .replace(/"/g, '\u0026quot;')
        .replace(/'/g, '\u0026#39;');
}

function cardHtml(e: IndexEntry, q: string): string {
    const href = `/worksheet/${encodeURIComponent(e.slug)}`;
    const img = e.image
        ? `<img src="${esc(e.image)}" alt="" loading="lazy" decoding="async" class="h-full w-full object-contain" />`
        : '';
    return `
<article class="card-lift flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-neutral-800 dark:bg-neutral-900">
  <a href="${esc(href)}" class="relative block bg-neutral-100 dark:bg-neutral-800" tabindex="-1" aria-hidden="true">
    <div class="aspect-[4/3] w-full">${img}</div>
    <span class="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-white">Free</span>
  </a>
  <div class="flex flex-1 flex-col p-4">
    <p class="font-mono text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">${esc(e.category)} \u00b7 ${esc(e.ageGroup)} yrs</p>
    <h3 class="mt-1 text-base font-semibold leading-snug tracking-tight text-neutral-900 dark:text-neutral-100">
      <a href="${esc(href)}" class="hover:text-accent">${esc(e.title)}</a>
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
                        e.title.toLowerCase().includes(term) ||
                        e.category.toLowerCase().includes(term) ||
                        e.ageGroup.toLowerCase().includes(term) ||
                        e.description.toLowerCase().includes(term),
                )
                : entries;

            const holder = document.createElement('div');
            holder.className =
                'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4';
            results.forEach((e) => {
                holder.insertAdjacentHTML('beforeend', cardHtml(e, q));
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
