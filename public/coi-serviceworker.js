/*! coi-serviceworker v0.1.7 - Patched for Next.js/GitHub Pages */
let coepCredentialless = false;

if (typeof window === 'undefined') {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

    self.addEventListener("message", (ev) => {
        if (!ev.data) return;
        if (ev.data.type === "deregister") {
            self.registration.unregister().then(() => self.clients.matchAll()).then(clients => {
                clients.forEach((client) => client.navigate(client.url));
            });
        }
    });

    self.addEventListener("fetch", function (event) {
        const r = event.request;
        if (r.cache === "only-if-cached" && r.mode !== "same-origin") return;
        
        const request = (coepCredentialless && r.mode === "no-cors") ? new Request(r, { credentials: "omit" }) : r;
        
        event.respondWith(
            fetch(request).then((response) => {
                if (response.status === 0) return response;
                const newHeaders = new Headers(response.headers);
                newHeaders.set("Cross-Origin-Embedder-Policy", coepCredentialless ? "credentialless" : "require-corp");
                newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
                return new Response(response.body, { status: response.status, statusText: response.statusText, headers: newHeaders });
            })
        );
    });

} else {
    (() => {
        const reloadedBySelf = window.sessionStorage.getItem("coiReloadedBySelf");
        window.sessionStorage.removeItem("coiReloadedBySelf");
        
        if (window.crossOriginIsolated) return; // Already Secure!

        const n = navigator;
        if (n.serviceWorker) {
            // DETECT BASE PATH AUTOMATICALLY
            // If your site is username.github.io/repo/, this ensures we register relative to that.
            const scriptPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/coi-serviceworker.js';
            
            n.serviceWorker.register(scriptPath).then(
                (registration) => {
                    console.log("[COI] Service Worker Registered at: ", scriptPath);
                    registration.addEventListener("updatefound", () => {
                        window.location.reload();
                    });
                    if (registration.active && !window.crossOriginIsolated) {
                        console.log("[COI] Reloading page to activate Pthreads...");
                        window.sessionStorage.setItem("coiReloadedBySelf", "true");
                        window.location.reload();
                    }
                },
                (err) => {
                    console.error("[COI] Registration Failed. Trying root path...", err);
                    // Fallback to root if relative failed
                    n.serviceWorker.register("/coi-serviceworker.js").then(() => window.location.reload());
                }
            );
        }
    })();
}
