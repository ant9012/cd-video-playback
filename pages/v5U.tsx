'use client'

import * as React from 'react'

import '@/app/globals.css'
import '@/app/engine.css'

// --------------------
// UI Component Imports
// --------------------

import Head from 'next/head'

import { ThemeProvider } from '@/app/controls/theme-provider'
import { Splash } from '@/app/controls/splash'

// ---------------
// Library Imports
// ---------------

import EngineFS from '@/lib/EngineFS'

// ---------------------
// Component Definitions
// ---------------------

export default function V5U() {
    React.useEffect(() => {
        // Expose the init function to the global window
        (window as any).TS_InitFS = async (p: string, f: any) => {
            try {
                await EngineFS.Init(p);
                f();
            } catch (error) {
                console.error("FS Init Error:", error);
            }
        };

        // Helper function to load scripts in strict sequential order
        const loadScript = (src: string) => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = false; 
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        };

        // Boot sequence
        // Boot sequence
        const bootEngine = async () => {
            // Explicitly set your GitHub Pages base path
            const basePath = '/rsdk-library-fork'; 

            try {
                // 1. Load service worker first
                await loadScript(`${basePath}/coi-serviceworker.js`);
                
                // 2. Load the main Emscripten engine/WASM glue code
                await loadScript(`${basePath}/modules/RSDKv5U.js`);
                
                // 3. Load the wrapper/helper script last
                await loadScript(`${basePath}/lib/RSDKv5U.js`);
            } catch (err) {
                console.error("Failed to load engine scripts:", err);
            }
        };

        bootEngine();
    }, []);

    return (
        <>
            <Head>
                <meta name='viewport' content='initial-scale=1, viewport-fit=cover' />
            </Head>
            <div className='enginePage'>
                <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
                    <Splash/>
                    <canvas className='engineCanvas' id='canvas' />
                </ThemeProvider>
                

            </div>
        </>
    )
}
