/**
 * components.js – shared header/footer enhancer for ConvertPDF
 * Adds: mobile hamburger nav, active nav link detection
 * Include ONCE at the end of <body> on every page.
 */
(function () {
    'use strict';

    /* ─── Determine root-relative path depth ─── */
    // pages/ and blog/ are one level deep; root files are at depth 0
    const depth = (window.location.pathname.match(/\//g) || []).length - 1;
    const root = depth >= 2 ? '../' : '';

    /* ─── Inject hamburger button into existing header ─── */
    function setupHamburger() {
        const nav = document.querySelector('.main-nav');
        const headerContainer = document.querySelector('.header-container');
        if (!nav || !headerContainer) return;

        const toggle = document.createElement('button');
        toggle.className = 'nav-toggle';
        toggle.setAttribute('aria-label', 'Toggle navigation menu');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'main-nav-list');
        toggle.innerHTML =
            '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';

        // Insert before nav
        headerContainer.insertBefore(toggle, nav);

        const ul = nav.querySelector('ul');
        if (ul) ul.id = 'main-nav-list';

        toggle.addEventListener('click', function () {
            const open = nav.classList.toggle('open');
            toggle.classList.toggle('active', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        // Close when clicking outside
        document.addEventListener('click', function (e) {
            if (!headerContainer.contains(e.target) && nav.classList.contains('open')) {
                nav.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                nav.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });
    }

    /* ─── Mark active nav link ─── */
    function setActiveNavLink() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';

        document.querySelectorAll('.main-nav a').forEach(function (link) {
            link.classList.remove('active');
            const href = (link.getAttribute('href') || '').split('/').pop();
            if (
                href === filename ||
                (filename === '' && href === 'index.html') ||
                (filename === 'index.html' && href === 'index.html')
            ) {
                link.classList.add('active');
            }
        });
    }

    /* ─── Ensure toast container exists ─── */
    function ensureToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }
    }

    /* ─── Init ─── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        setupHamburger();
        setActiveNavLink();
        ensureToastContainer();
    }
})();
