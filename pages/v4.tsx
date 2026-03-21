'use client'

import * as React from 'react'
import { useEffect, useRef, useState } from 'react'

import '@/app/globals.css'
import '@/app/engine.css'

import Head from 'next/head'
import Script from 'next/script'
import { ThemeProvider } from '@/app/controls/theme-provider'
import { Splash } from '@/app/controls/splash'
import EngineFS from '@/lib/EngineFS'

export default function V4() {
    const consoleRef = useRef<HTMLTextAreaElement>(null);
    const [isVisible, setIsVisible] = useState(true); // Toggle visibility with a key if needed

    // ---------------------------------------------------------
    // 1. Console Interception Hook
    // ---------------------------------------------------------
    useEffect(() => {
        // Save original methods
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;
        const originalInfo = console.info;

        const appendToVirtualConsole = (type: string, args: any[]) => {
            if (consoleRef.current) {
                const message = args.map(arg => {
                    try {
                        return (typeof arg === 'object') ? JSON.stringify(arg) : String(arg);
                    } catch (e) {
                        return String(arg);
                    }
                }).join(' ');

                const timestamp = new Date().toLocaleTimeString().split(' ')[0];
                const line = `[${timestamp}] [${type}] ${message}\n`;

                consoleRef.current.value += line;
                consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
            }
        };

        // Override
        console.log = (...args) => { originalLog.apply(console, args); appendToVirtualConsole('LOG', args); };
        console.warn = (...args) => { originalWarn.apply(console, args); appendToVirtualConsole('WRN', args); };
        console.error = (...args) => { originalError.apply(console, args); appendToVirtualConsole('ERR', args); };
        console.info = (...args) => { originalInfo.apply(console, args); appendToVirtualConsole('INF', args); };

        // Test log to prove it works
        console.log("Console Hook Initialized successfully.");

        return () => {
            console.log = originalLog;
            console.warn = originalWarn;
            console.error = originalError;
            console.info = originalInfo;
        };
    }, []);

    // ---------------------------------------------------------
    // 2. FileSystem Initialization Hook
    // ---------------------------------------------------------
    useEffect(() => {
        // @ts-ignore
        window.TS_InitFS = async (p: string, f: any) => {
            console.log("Initializing FileSystem...");
            try {
                await EngineFS.Init(p);
                console.log("FileSystem Initialized.");
                f();
            } catch (error) {
                console.error("FS Init Failed:", error);
            }
        };
    }, []);

    return (
        <>
            <Head>
                <meta name='viewport' content='initial-scale=1, viewport-fit=cover' />
            </Head>
            
            <div className='enginePage' style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: 'black' }}>
                <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
                    
                    {/* 1. The Game Canvas (Background) */}
                    <canvas 
                        id='canvas' 
                        className='engineCanvas' 
                        style={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%', 
                            zIndex: 1, // Base layer
                            display: 'block' 
                        }} 
                    />

                    {/* 2. The Splash Screen (Overlay) */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}>
                        <Splash/>
                    </div>

                    {/* 3. The Debug Console (Floating Overlay) */}
                    <div style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '25vh', // Takes up bottom 25% of screen
                        backgroundColor: 'rgba(0, 0, 0, 0.85)', // Semi-transparent black
                        backdropFilter: 'blur(4px)',
                        borderTop: '2px solid #333',
                        zIndex: 9999, // FORCE ON TOP OF EVERYTHING
                        display: isVisible ? 'flex' : 'none',
                        flexDirection: 'column'
                    }}>
                        {/* Console Header */}
                        <div style={{ 
                            padding: '5px 10px', 
                            backgroundColor: '#222', 
                            color: '#fff', 
                            fontSize: '11px', 
                            fontFamily: 'monospace',
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #444'
                        }}>
                            <span>DEBUG CONSOLE</span>
                            <button onClick={() => setIsVisible(false)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#ff5555' }}>[X]</button>
                        </div>

                        {/* Console Output */}
                        <textarea 
                            id="output" // Emscripten writes here too!
                            ref={consoleRef}
                            readOnly
                            spellCheck={false}
                            style={{
                                flex: 1,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'transparent',
                                color: '#00ff00',
                                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                                fontSize: '13px',
                                lineHeight: '1.4',
                                border: 'none',
                                resize: 'none',
                                outline: 'none',
                                padding: '10px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Toggle Button (Visible when console is closed) */}
                    {!isVisible && (
                        <button 
                            onClick={() => setIsVisible(true)}
                            style={{
                                position: 'absolute',
                                bottom: '10px',
                                right: '10px',
                                zIndex: 9999,
                                padding: '5px 10px',
                                backgroundColor: '#222',
                                color: '#00ff00',
                                border: '1px solid #00ff00',
                                fontFamily: 'monospace',
                                cursor: 'pointer'
                            }}
                        >
                            SHOW CONSOLE
                        </button>
                    )}

                </ThemeProvider>

                <Script src='coi-serviceworker.js' strategy="beforeInteractive" />
                <Script src='./lib/RSDKv4.js' strategy="lazyOnload" />
                <Script src='./modules/RSDKv4.js' strategy="lazyOnload" />
            </div>
        </>
    )
}
