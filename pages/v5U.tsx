'use client'

import * as React from 'react'

import '@/app/globals.css'
import '@/app/engine.css'

// --------------------
// UI Component Imports
// --------------------

import Head from 'next/head'
import Script from 'next/script'

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
    const consoleRef = React.useRef<HTMLDivElement>(null);
    
    // 1. Direct reference to the canvas
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    // 2. Guard to prevent React Strict Mode from double-booting the engine
    const engineStarted = React.useRef(false);

    // --- Console Setup & Interception ---
    React.useEffect(() => {
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        const appendLog = (msg: string, color: string) => {
            if (consoleRef.current) {
                const line = document.createElement('div');
                line.style.color = color;
                line.style.wordBreak = 'break-all';
                line.textContent = msg;
                consoleRef.current.appendChild(line);
                consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
            }
        };

        console.log = (...args) => {
            originalLog(...args);
            const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
            appendLog(message, '#00ff00');
        };

        console.warn = (...args) => {
            originalWarn(...args);
            const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
            appendLog(message, '#ffff00');
        };

        console.error = (...args) => {
            originalError(...args);
            const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
            appendLog(message, '#ff0000');
        };

        return () => {
            console.log = originalLog;
            console.warn = originalWarn;
            console.error = originalError;
        };
    }, []);

    // --- Engine FS ---
    React.useEffect(() => {
        if (engineStarted.current) return;
        engineStarted.current = true;

        // Force Emscripten to lock onto our React canvas
        // @ts-ignore
        window.Module = window.Module || {};
        if (canvasRef.current) {
            // @ts-ignore
            window.Module.canvas = canvasRef.current;
        }

        // @ts-ignore
        window.TS_InitFS = async (p: string, f: any) => {
            try {
                await EngineFS.Init(p);
                setTimeout(f, 0); 
            } catch (error) {
                console.error("FS Init Error:", error);
            }
        };
    }, []);

    return (
        <>
            <Head>
                <meta name='viewport' content='initial-scale=1, viewport-fit=cover' />
            </Head>
            
            <div className='enginePage' style={{ position: 'relative' }}>
                <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
                    <Splash/>
                    
                    {/* 3. Attach the ref to your canvas here */}
                    <canvas ref={canvasRef} className='engineCanvas' id='canvas' />

                    {/* --- Passive Console Overlay --- */}
                    <div 
                        ref={consoleRef}
                        className="engine-console"
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '40vh',
                            backgroundColor: 'rgba(0, 0, 0, 0.75)',
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            zIndex: 2147483647,
                            overflowY: 'auto',
                            padding: '1rem',
                            boxSizing: 'border-box',
                            pointerEvents: 'none'
                        }}
                    />
                </ThemeProvider>

                <Script src='coi-serviceworker.js' />
                <Script src='./lib/RSDKv5U.js' />
                <Script src='./modules/RSDKv5U.js' />
            </div>
        </>
    )
}
