(function() {
    function initThemeToggle() {
        const toolbar = document.querySelector('.tsd-toolbar-contents');
        if (!toolbar || document.getElementById('header-theme-toggle')) return;

        // Create the toggle button
        const btn = document.createElement('button');
        btn.id = 'header-theme-toggle';
        btn.className = 'tsd-widget';
        btn.setAttribute('aria-label', 'Toggle Theme');
        
        // Sun and Moon SVGs
        btn.innerHTML = `
            <svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        `;

        // Insert before search trigger
        const searchTrigger = document.getElementById('tsd-search-trigger');
        if (searchTrigger) {
            toolbar.insertBefore(btn, searchTrigger);
        } else {
            toolbar.appendChild(btn);
        }

        const toggleTheme = () => {
            const current = document.documentElement.dataset.theme;
            const next = current === 'dark' ? 'light' : 'dark';
            
            document.documentElement.dataset.theme = next;
            localStorage.setItem('tsd-theme', next);
            
            // Sync with sidebar select if it exists
            const select = document.getElementById('tsd-theme');
            if (select) select.value = next;
        };

        btn.addEventListener('click', toggleTheme);
    }

    // Initialize on load and also handle potential dynamic page changes
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThemeToggle);
    } else {
        initThemeToggle();
    }
})();
