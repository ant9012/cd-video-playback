export {}

declare global {
    interface Window {
        __engineConsoleBuffer: string[]
        __engineConsoleAppend?: (text: string) => void
        TS_InitFS: (path: string, callback: () => void) => Promise<void>
        EngineFS: {
            Init: (path: string) => Promise<void>
        }
    }
}
