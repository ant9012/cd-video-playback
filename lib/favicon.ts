// lib/favicon.ts

const FAVICON_CANDIDATES = [
    'favicon.png',
    'favicon.ico',
    'favicon.jpg',
    'favicon.webp',
    'icon.png',
    'icon.ico',
]

const MIME_TYPES: Record<string, string> = {
    '.png':  'image/png',
    '.ico':  'image/x-icon',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
}

/**
 * Searches the Emscripten virtual FS inside the given engine directory
 * for a user-uploaded favicon. If found, sets it as the page's <link rel="icon">.
 *
 * Call this AFTER EngineFS.Init() has finished and user files are mounted.
 *
 * @param engineDir - The virtual FS path, e.g. '/RSDKv5U'
 */
export function loadFaviconFromFS(engineDir: string): void {
    try {
        const FS = (window as any).FS
        if (!FS) {
            console.warn('[Favicon] Emscripten FS not available yet.')
            return
        }

        for (const candidate of FAVICON_CANDIDATES) {
            const filePath = `${engineDir}/${candidate}`

            try {
                FS.stat(filePath)
            } catch {
                continue
            }

            // Found one — read it
            const data: Uint8Array = FS.readFile(filePath)
            const ext = candidate.substring(candidate.lastIndexOf('.'))
            const mime = MIME_TYPES[ext] || 'image/png'

            const blob = new Blob([data], { type: mime })
            const url  = URL.createObjectURL(blob)

            // Find or create <link rel="icon">
            let link: HTMLLinkElement | null =
                document.querySelector("link[rel~='icon']")

            if (!link) {
                link     = document.createElement('link')
                link.rel = 'icon'
                document.head.appendChild(link)
            }

            link.type = mime
            link.href = url

            console.log(`[Favicon] Loaded: ${filePath}`)
            return
        }

        console.log(`[Favicon] No favicon found in ${engineDir}`)
    } catch (err) {
        console.warn('[Favicon] Error:', err)
    }
}
