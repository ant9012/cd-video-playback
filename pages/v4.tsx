'use client'

import * as React from 'react'
import { useState, useEffect, useRef } from 'react'

import '@/app/globals.css'
import '@/app/engine.css'

import Head from 'next/head'
import Script from 'next/script'
import { ThemeProvider } from '@/app/controls/theme-provider'
import { Splash } from '@/app/controls/splash'
import EngineFS from '@/lib/EngineFS'

export default function V4() {
    const [isReady, setIsReady] = useState(false);
    const consoleRef = useRef<HTMLTextAreaElement>(null);

    // 1. Console Hook (For debugging on mobile/deployment)
    useEffect(() => {
        const originalLog = console.log;
        const originalError = console.error;
        const logToScreen = (type: string, msg: string) => {
            if (consoleRef.current) {
                consoleRef.current.value += `[${type}] ${msg}\n`;
                consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
            }
        };
        console.log = (...args) => { originalLog.apply(console, args); logToScreen("LOG", args.join(' ')); };
        console.error = (...args) => { originalError.apply(console, args); logToScreen("ERR", args.join(' ')); };
    }, []);

    // 2. THE GATEKEEPER
    useEffect(() => {
        // If we are already secure (Pthreads allowed), let the game load.
        if (window.crossOriginIsolated) {
            console.log("Environment Secure. Starting Engine...");
            setIsReady(true);
        } else {
            console.log("Environment Insecure. Waiting for Service Worker Reload...");
        }
    }, []);

    // 3. FileSystem Hook (Only runs if Secure)
    useEffect(() => {
        if (!isReady) return;
        
        // @ts-ignore
        window.TS_InitFS = async (p: string, f: any) => {
            console.log("Initializing FileSystem...");
            try {
                await EngineFS.Init(p);
                console.log("FileSystem Ready.");
                f();
            } catch (error) {
                console.error("FS Error:", error);
            }
        };
    }, [isReady]);

    return (
        <>
            <Head>
                <meta name='viewport' content='initial-scale=1, viewport-fit=cover' />
            </Head>
            <div className='enginePage' style={{position: 'relative', width: '100vw', height: '100vh', backgroundColor: 'black'}}>
                <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
                    
                    {/* ALWAYS Load Service Worker First */}
                    <Script src='coi-serviceworker.js' strategy="beforeInteractive" />

                    {/* ONLY Load Game if Secure */}
                    {isReady ? (
                        <>
                            <canvas id='canvas' className='engineCanvas' style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block'}} onContextMenu={(e)=>e.preventDefault()} />
                            <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none'}}><Splash/></div>
                            
                            {/* Load Wrapper, then Engine */}
                            <Script src='./lib/RSDKv4.js' strategy="lazyOnload" />
                            <Script src='./modules/RSDKv4.js' strategy="lazyOnload" />
                        </>
                    ) : (
                        <div style={{color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                            <h2>Enabling High Performance Mode...</h2>
                            <p>Reloading page to enable Pthreads</p>
                        </div>
                    )}

                    {/* Debug Console */}
                    <textarea ref={consoleRef} style={{position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100px', background: 'rgba(0,0,0,0.8)', color: 'lime', border: 'none', zIndex: 9999}} readOnly />

                </ThemeProvider>
            </div>
        </>
    )
}
