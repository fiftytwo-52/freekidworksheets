export type PageItem = number | 'ellipsis';

/**
 * Windowed page list: 1 … 4 5 [6] 7 8 … 57 (MASTER-INSTRUCTION §9.2).
 * Always includes page 1, the last page, and ±radius around `current`.
 */
export function pageWindow(current: number, total: number, radius = 2): PageItem[] {
    if (total <= 0) return [];
    const wanted = new Set<number>([1, total]);
    for (let p = current - radius; p <= current + radius; p++) {
        if (p >= 1 && p <= total) wanted.add(p);
    }
    const sorted = [...wanted].sort((a, b) => a - b);
    const out: PageItem[] = [];
    let prev = 0;
    for (const p of sorted) {
        if (p - prev > 1) out.push('ellipsis');
        out.push(p);
        prev = p;
    }
    return out;
}

/**
 * Build a path for a library page. Page 1 lives at the bare path to avoid
 * duplicate URLs (§9.2): /worksheets, /worksheets/page/2 …
 */
export function pagePath(basePath: string, page: number): string {
    if (page <= 1) return basePath;
    return `${basePath}/page/${page}`;
}
