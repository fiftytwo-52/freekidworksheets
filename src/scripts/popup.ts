// popup.ts — once-per-session popup ad behavior (§12.4).
// Shows #popup-ad when POPUP_AD.active is true (rendered only on the home
// page by PopupAd.astro) and the user hasn't dismissed it this session.
// Dismissal: close button, backdrop click, or Escape. The sticky footer ad
// is never rendered on the same view as the popup (§14).

const POPUP_SESSION_KEY = 'fkwPopupDismissed';

function openPopup(root: HTMLElement) {
    root.removeAttribute('hidden');
    root.setAttribute('aria-hidden', 'false');
    // Move focus into the dialog for keyboard users.
    const focusTarget = root.querySelector<HTMLElement>(
        '[data-popup-close], a[href], button',
    );
    focusTarget?.focus();
}

function closePopup(root: HTMLElement) {
    root.setAttribute('hidden', '');
    root.setAttribute('aria-hidden', 'true');
    try {
        sessionStorage.setItem(POPUP_SESSION_KEY, '1');
    } catch {
        /* sessionStorage unavailable — ignore */
    }
}

function init() {
    const popup = document.getElementById('popup-ad');
    if (!popup) return;

    let dismissed = false;
    try {
        dismissed = sessionStorage.getItem(POPUP_SESSION_KEY) === '1';
    } catch {
        dismissed = false;
    }
    if (dismissed) return;

    // Open shortly after load so it doesn't block the first impression.
    const delay = window.setTimeout(() => openPopup(popup), 1200);

    const handleClose = () => {
        window.clearTimeout(delay);
        closePopup(popup);
    };

    popup
        .querySelector<HTMLElement>('[data-popup-close]')
        ?.addEventListener('click', handleClose);
    popup.addEventListener('click', (event) => {
        if (event.target === popup) handleClose(); // backdrop click
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !popup.hasAttribute('hidden')) {
            handleClose();
        }
    });
}

document.addEventListener('DOMContentLoaded', init);

// Module scope so top-level declarations do not collide with other global
// scripts bundled into the same program scope by Astro's type-checker.
export { };
