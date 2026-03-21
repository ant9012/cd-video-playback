'use client'

import * as React from 'react'
import { useEffect, useRef } from 'react'

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

export default function V4() {
    const consoleRef = useRef<HTMLTextAreaElement>(null);

    // ---------------------------------------------------------
    // 1. Console Interception Hook
    // ---------------------------------------------------------
    useEffect(() => {
        // Save original methods so we don't break the browser dev tools
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;
        const originalInfo = console.info;

        const appendToVirtualConsole = (type: string, args: any[]) => {
            if (consoleRef.current) {
                // Convert arguments to a readable string
                const message = args.map(arg => {
                    if (typeof arg === 'object') {
                        try {
                            return JSON.stringify(arg);
                        } catch (e) {
                            return String(arg);
                        }
                    }
                    return String(arg);
                }).join(' ');

                const timestamp = new Date().toLocaleTimeString().split(' ')[0];
                const line = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;

                // Update DOM directly for performance (bypassing React render cycle)
                consoleRef.current.value += line;
                consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
            }
        };

        // Override global console methods
        console.log = (...args) => {
            originalLog.apply(console, args); // Log to real browser console
            appendToVirtualConsole('log', args); // Log to our UI
        };

        console.warn = (...args) => {
            originalWarn.apply(console, args);
            appendToVirtualConsole('warn', args);
        };

        console.error = (...args) => {
            originalError.apply(console, args);
            appendToVirtualConsole('err', args);
        };

        console.info = (...args) => {
            originalInfo.apply(console, args);
            appendToVirtualConsole('info', args);
        };

        // Cleanup on unmount
        return () => {
            console.log = originalLog;
            console.warn = originalWarn;
            console.error = originalError;
            console.info = originalInfo;
        };
    }, []); // Empty dependency array = runs immediately on mount

    // ---------------------------------------------------------
    // 2. FileSystem Initialization Hook
    // ---------------------------------------------------------
    useEffect(() => {
        // @ts-ignore
        window.TS_InitFS = async (p: string, f: any) => {
            console.log("Initializing FileSystem..."); // This will now show in your UI
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
            
            {/* 
               Flex container to separate Game and Console. 
               height: 100vh ensures it fills the screen without scrollbars on body.
            */}
            <div className='enginePage' style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
                    <Splash/>
                    
                    {/* Game Area (Takes remaining space) */}
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                        <canvas className='engineCanvas' id='canvas' style={{ width: '100%', height: '100%', display: 'block' }} />
                    </div>

                    {/* Console Area (Fixed height at bottom) */}
                    <div style={{ 
                        height: '200px', 
                        backgroundColor: '#0c0c0c', 
                        borderTop: '1px solid #333',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ 
                            padding: '4px 10px', 
                            backgroundColor: '#1f1f1f', 
                            color: '#888', 
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            borderBottom: '1px solid #333'
                        }}>
                            JAVASCRIPT CONSOLE
                        </div>
                        <textarea 
                            id="output" // Kept for Emscripten compatibility
                            ref={consoleRef}
                            readOnly
                            style={{
                                flex: 1,
                                width: '100%',
                                backgroundColor: 'transparent',
                                color: '#00ff00',
                                fontFamily: 'Consolas, "Courier New", monospace',
                                fontSize: '12px',
                                border: 'none',
                                resize: 'none',
                                outline: 'none',
                                padding: '10px',
                                boxSizing: 'border-box'
                            }}
                            defaultValue="> Console Ready..."
                        />
                    </div>

                </ThemeProvider>

                {/* 
                   Scripts are loaded AFTER the component mounts.
                   Because the useEffect runs on mount, the console override
                   happens BEFORE these scripts execute.
                */}
                <Script src='coi-serviceworker.js' />
                <Script src='./lib/RSDKv4.js' />
                <Script src='./modules/RSDKv4.js' />
            </div>
        </>
    )
}
