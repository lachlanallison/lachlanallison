// Include system for loading header and footer
(function() {
    'use strict';
    
    // Function to calculate relative path to includes directory
    function getIncludesPath() {
        const path = window.location.pathname;
        const depth = (path.match(/\//g) || []).length - 1;
        return depth === 0 ? 'includes/' : '../'.repeat(depth) + 'includes/';
    }
    
    // Function to calculate base path for navigation links
    function getBasePath() {
        const path = window.location.pathname;
        const depth = (path.match(/\//g) || []).length - 1;
        return depth === 0 ? './' : '../'.repeat(depth);
    }
    
    // Function to set up navigation links
    function setupNavLinks(basePath) {
        const navLinks = {
            'home': basePath + 'index.html',
            'blogs': basePath + 'blogs/index.html',
            'photos': basePath + 'photos/index.html',
            'projects': basePath + 'projects/index.html',
            'now': basePath + 'now/index.html',
            'contact': basePath + 'contact/index.html'
        };
        
        document.querySelectorAll('[data-nav-link]').forEach(link => {
            const type = link.getAttribute('data-nav-link');
            if (navLinks[type]) {
                link.href = navLinks[type];
            }
        });
    }
    
    // Function to load includes
    async function loadIncludes() {
        const includesPath = getIncludesPath();
        const basePath = getBasePath();
        
        try {
            // Load header
            const headerElement = document.querySelector('[data-include="header"]');
            if (headerElement) {
                const headerResponse = await fetch(includesPath + 'header.html');
                if (headerResponse.ok) {
                    const headerHtml = await headerResponse.text();
                    headerElement.innerHTML = headerHtml;
                    setupNavLinks(basePath);
                }
            }
            
            // Load footer
            const footerElement = document.querySelector('[data-include="footer"]');
            if (footerElement) {
                const footerResponse = await fetch(includesPath + 'footer.html');
                if (footerResponse.ok) {
                    const footerHtml = await footerResponse.text();
                    footerElement.innerHTML = footerHtml;
                }
            }
        } catch (error) {
            console.warn('Could not load includes:', error);
            // Fallback content should already be in place
        }
    }
    
    // Load includes when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadIncludes);
    } else {
        loadIncludes();
    }
})(); 