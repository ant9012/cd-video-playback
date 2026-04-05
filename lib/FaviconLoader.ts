export class FaviconLoader {
    private static observer: MutationObserver | null = null;
    private static currentFavicon: string = '';
    private static basePath: string = '';

    // Mapping of game identifiers to favicon paths
    // Keys can be partial matches - will check if title includes the key
    private static faviconMap: Record<string, string> = {
        'Sonic Mania': 'icons/smania.ico',
        'Sonic CD': 'icons/scd.ico',
        'Sonic 1': 'icons/s1.ico',
        'Sonic 2': 'icons/s2.ico',
        'Sonic 3 & Knuckles': 'icons/s3k.ico',
        'Sonic 3': 'icons/s3k.ico', // Fallback if S3&K isn't detected
        'Sonic the Hedgehog': 'icons/s1.ico', // Full name fallback
        'Sonic the Hedgehog 2': 'icons/s2.ico',
        'Sonic the Hedgehog 3': 'icons/s3k.ico',
        // Add more mappings as needed
    };

    private static defaultFavicon: string = 'favicon.ico';

    static init() {
        console.log('[FaviconLoader] Initializing...');
        
        // Detect base path for GitHub Pages
        this.detectBasePath();
        
        // Initial check
        this.updateFavicon();

        // Watch for title changes
        this.observer = new MutationObserver(() => {
            this.updateFavicon();
        });

        // Observe the document title
        const titleElement = document.querySelector('title');
        if (titleElement) {
            this.observer.observe(titleElement, {
                childList: true,
                characterData: true,
                subtree: true
            });
        }

        // Also observe the entire head for title changes
        this.observer.observe(document.head, {
            childList: true,
            subtree: true
        });

        console.log('[FaviconLoader] Watching for title changes...');
        console.log('[FaviconLoader] Base path:', this.basePath);
    }

    private static detectBasePath() {
        // Get the base path from the current URL
        const pathArray = window.location.pathname.split('/').filter(p => p);
        
        // For GitHub Pages: username.github.io/repo-name/
        // The first segment is typically the repo name
        if (window.location.hostname.includes('github.io')) {
            // If there's a path segment, use it as base
            if (pathArray.length > 0) {
                this.basePath = '/' + pathArray[0] + '/';
                console.log('[FaviconLoader] GitHub Pages detected, base path:', this.basePath);
            } else {
                this.basePath = '/';
            }
        } else {
            // Local development or custom domain
            this.basePath = '/';
        }

        // Alternative: Use document.baseURI
        // const base = new URL(document.baseURI);
        // this.basePath = base.pathname;
    }

    private static resolveIconPath(relativePath: string): string {
        // Remove leading slash if present
        const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
        
        // Combine base path with icon path
        return this.basePath + cleanPath;
    }

    static updateFavicon() {
        const title = document.title;
        let faviconPath = this.defaultFavicon;
        let matchedKey = '';

        // Check if title matches/includes any of our mappings
        // Sort keys by length (longest first) to match most specific titles first
        const sortedKeys = Object.keys(this.faviconMap).sort((a, b) => b.length - a.length);
        
        for (const key of sortedKeys) {
            // Case-insensitive partial match
            if (title.toLowerCase().includes(key.toLowerCase())) {
                faviconPath = this.faviconMap[key];
                matchedKey = key;
                break;
            }
        }

        // Resolve the full path
        const resolvedPath = this.resolveIconPath(faviconPath);

        // Only update if favicon changed
        if (resolvedPath !== this.currentFavicon) {
            this.setFavicon(resolvedPath);
            this.currentFavicon = resolvedPath;
            if (matchedKey) {
                console.log(`[FaviconLoader] Changed favicon to: ${resolvedPath} (Matched: "${matchedKey}" in title: "${title}")`);
            } else {
                console.log(`[FaviconLoader] Reset to default favicon: ${resolvedPath} (Title: "${title}")`);
            }
        }
    }

    private static setFavicon(path: string) {
        // Remove existing favicon links
        const existingLinks = document.querySelectorAll("link[rel*='icon']");
        existingLinks.forEach(link => link.remove());

        // Create new favicon link
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = path;
        document.head.appendChild(link);

        // Also add apple-touch-icon for mobile devices
        const appleTouchIcon = document.createElement('link');
        appleTouchIcon.rel = 'apple-touch-icon';
        appleTouchIcon.href = path;
        document.head.appendChild(appleTouchIcon);

        // Add shortcut icon for older browsers
        const shortcutIcon = document.createElement('link');
        shortcutIcon.rel = 'shortcut icon';
        shortcutIcon.href = path;
        document.head.appendChild(shortcutIcon);
    }

    static destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        console.log('[FaviconLoader] Destroyed');
    }

    // Allow dynamic addition of favicon mappings
    static addMapping(title: string, faviconPath: string) {
        this.faviconMap[title] = faviconPath;
        console.log(`[FaviconLoader] Added mapping: "${title}" -> ${faviconPath}`);
        this.updateFavicon(); // Recheck immediately
    }

    // Remove a mapping
    static removeMapping(title: string) {
        delete this.faviconMap[title];
        console.log(`[FaviconLoader] Removed mapping: "${title}"`);
        this.updateFavicon();
    }

    // Get current mappings (for debugging)
    static getMappings(): Record<string, string> {
        return { ...this.faviconMap };
    }

    // Set default favicon path
    static setDefaultFavicon(path: string) {
        this.defaultFavicon = path;
        console.log(`[FaviconLoader] Default favicon set to: ${path}`);
        this.updateFavicon();
    }

    // Manually set base path (useful if auto-detection fails)
    static setBasePath(path: string) {
        this.basePath = path.endsWith('/') ? path : path + '/';
        console.log(`[FaviconLoader] Base path manually set to: ${this.basePath}`);
        this.updateFavicon();
    }

    // Get current base path
    static getBasePath(): string {
        return this.basePath;
    }
}

export default FaviconLoader;
