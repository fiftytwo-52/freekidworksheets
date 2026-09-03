// theme.ts — theme toggle, mobile nav drawer, and the mobile filter-panel
// accordion. Event-delegated on `document` so it works with Astro's static
// HTML (MASTER-INSTRUCTION §10.5 / §12.1). No frameworks, no dependencies.
//
// The pre-paint theme application lives in Base.astro (inline <head> script).

type Theme = 'light' | 'dark' | 'system';
const STORAGE_KEY = 'fkwTheme';
const media = window.matchMedia('(prefers-color-scheme: dark)');

function storedTheme(): Theme {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
}

function resolve(theme: Theme): 'light' | 'dark' {
    return theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
}

function apply(theme: Theme) {
    document.documentElement.setAttribute('data-theme', resolve(theme));
}

/** Toggle between the two real themes and persist the choice. */
function toggleTheme() {
    const next: Theme =
        document.documentElement.getAttribute('data-theme') === 'dark'
            ? 'light'
            : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    apply(next);
}

/** Sync the theme when the OS preference changes while in 'system' mode. */
media.addEventListener('change', () => {
    if (storedTheme() === 'system') apply('system');
});

document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    if (!target) return;
    const trigger = target.closest<HTMLElement>(
        '[data-theme-toggle], [data-nav-toggle], [data-nav-link], [data-filter-toggle]',
    );
    if (!trigger) return;

    // 1. Theme toggle (header + inside the mobile drawer).
    if (trigger.hasAttribute('data-theme-toggle')) {
        event.preventDefault();
        toggleTheme();
        return;
    }

    // 2. Mobile nav hamburger — toggles the drawer + syncs aria-expanded.
    if (trigger.hasAttribute('data-nav-toggle')) {
        event.preventDefault();
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        const next = !expanded;
        trigger.setAttribute('aria-expanded', String(next));
        document.documentElement.classList.toggle('nav-open', next);
        return;
    }

    // 3. Clicking a nav link closes the mobile drawer.
    if (trigger.hasAttribute('data-nav-link')) {
        const btn = document.querySelector('[data-nav-toggle]');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('nav-open');
        return;
    }

    // 4. Mobile filter-panel accordion (library/home pages).
    if (trigger.hasAttribute('data-filter-toggle')) {
        event.preventDefault();
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        const next = !expanded;
        trigger.setAttribute('aria-expanded', String(next));
        const panel = document.querySelector('[data-filter-panel]');
        if (panel) panel.classList.toggle('filter-open', next);
    }
});

// Ensure the DOM reflects the stored theme if the head script didn't run
// (e.g. hard-refresh edge cases) — no FOUC because it runs before layout paint
// only via the head script; this is a harmless safety net.
apply(storedTheme());
