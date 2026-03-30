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

export default function V5() {
    // Console State
    const [logs, setLogs] = React.useState<string[]>([]);
    const consoleEndRef = React.useRef<HTMLDivElement>(null);

    // Engine Init
    React.useEffect(() => {
        window.TS_InitFS = async (p: string, f: any) => {
            try {
                await EngineFS.Init(p);
                f();
            } catch (error) {
                console.error("FS Init Error:", error);
            }
        };
    }, []);

    // Console Hijack Effect
    React.useEffect(() => {
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        const formatArgs = (args: any[]) => 
            args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ');

        console.log = (...args) => {
            setLogs(prev => [...prev, `[LOG] ${formatArgs(args)}`]);
            originalLog(...args);
        };

        console.warn = (...args) => {
            setLogs(prev => [...prev, `[WARN] ${formatArgs(args)}`]);
            originalWarn(...args);
        };

        console.error = (...args) => {
            setLogs(prev => [...prev, `[ERR] ${formatArgs(args)}`]);
            originalError(...args);
        };

        // Cleanup on unmount
        return () => {
            console.log = originalLog;
            console.warn = originalWarn;
            console.error = originalError;
        };
    }, []);

    // Auto-scroll console to the bottom when new logs arrive
    React.useEffect(() => {
        consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <>
            <Head>
                <meta name='viewport' content='initial-scale=1, viewport-fit=cover' />
            </Head>
            <div className='enginePage' style={{ position: 'relative', width: '100vw', height: '100vh' }}>
                <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
                    <Splash/>
                    <canvas className='engineCanvas' id='canvas' />
                    
                    {/* --- ON-SCREEN CONSOLE --- */}
                    <div 
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '250px',
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            color: '#00ff00',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            padding: '10px',
                            overflowY: 'auto',
                            zIndex: 9999,
                            pointerEvents: 'auto'
                        }}
                    >
                        {logs.map((log, index) => (
                            <div 
                                key={index} 
                                style={{ 
                                    color: log.includes('[ERR]') ? '#ff4444' : log.includes('[WARN]') ? '#ffcc00' : '#00ff00',
                                    marginBottom: '4px',
                                    wordWrap: 'break-word'
                                }}
                            >
                                {log}
                            </div>
                        ))}
                        <div ref={consoleEndRef} />
                    </div>
                </ThemeProvider>

                <Script src='coi-serviceworker.js' />
                <Script src='./lib/RSDKv5.js' />
                <Script src='./modules/RSDKv5.js' />
            </div>
        </>
    )
}
