function enforceIntegerScaling() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const baseWidth = 424;
    const baseHeight = 240;

    const scaleX = Math.floor(window.innerWidth / baseWidth);
    const scaleY = Math.floor(window.innerHeight / baseHeight);
    const scale = Math.max(1, Math.min(scaleX, scaleY));

    canvas.style.width = (baseWidth * scale) + 'px';
    canvas.style.height = (baseHeight * scale) + 'px';
    canvas.style.imageRendering = 'pixelated';

    canvas.style.position = 'absolute';
    canvas.style.top = '50%';
    canvas.style.left = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
}

document.body.style.backgroundColor = 'black';
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

window.addEventListener('resize', enforceIntegerScaling);

var Module = {
    onRuntimeInitialized: function () {
        TS_InitFS('RSDKv5U',
            function () {
                console.log('EngineFS initialized');
                if (window.__engineConsoleAppend) window.__engineConsoleAppend('EngineFS initialized');

                const splash = document.getElementById("splash");
                splash.style.opacity = 0;
                setTimeout(() => { splash.remove(); }, 1000);
                RSDK_Init();
            });
    },
    print: (function () {
        var element = document.getElementById('output');
        if (element) element.value = '';
        return function (text) {
            if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');

            console.log(text);

            // Pipe to in-page console
            if (window.__engineConsoleAppend) {
                window.__engineConsoleAppend(text);
            }

            if (element) {
                element.value += text + "\n";
                element.scrollTop = element.scrollHeight;
            }
        };
    })(),
    printErr: (function () {
        return function (text) {
            if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');

            console.error(text);

            // Pipe errors to in-page console too
            if (window.__engineConsoleAppend) {
                window.__engineConsoleAppend('[ERROR] ' + text);
            }
        };
    })(),
    canvas: (() => {
        var canvas = document.getElementById('canvas');
        canvas.addEventListener("webglcontextlost", (e) => {
            alert('WebGL context lost. You will need to reload the page.');
            e.preventDefault();
        }, false);
        enforceIntegerScaling();
        return canvas;
    })(),
    setStatus: (text) => {
        if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
        if (text === Module.setStatus.last.text) return;
        var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
        var now = Date.now();
        if (m && now - Module.setStatus.last.time < 30) return;
        Module.setStatus.last.time = now;
        Module.setStatus.last.text = text;

        if (m) {
            text = m[1];
        }

        console.log(text);
        if (window.__engineConsoleAppend) window.__engineConsoleAppend('[STATUS] ' + text);
    },
    totalDependencies: 0,
    monitorRunDependencies: (left) => {
        this.totalDependencies = Math.max(this.totalDependencies, left);
        Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies - left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
    }
};

Module.setStatus('Downloading...');

window.onerror = (msg, url, line) => {
    var errorText = 'Exception thrown, see JavaScript console';
    Module.setStatus(errorText);
    if (window.__engineConsoleAppend) {
        window.__engineConsoleAppend('[FATAL] ' + msg + ' at ' + url + ':' + line);
    }

    Module.setStatus = (text) => {
        if (text) {
            console.error('[post-exception status] ' + text);
            if (window.__engineConsoleAppend) window.__engineConsoleAppend('[post-exception] ' + text);
        }
    };
};

function RSDK_Init() {
    FS.chdir('/RSDKv5U');

    const storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        _RSDK_Configure(settings.enablePlus, 0);
    }

    if (window.__engineConsoleAppend) window.__engineConsoleAppend('RSDK_Initialize starting...');
    _RSDK_Initialize();
}
