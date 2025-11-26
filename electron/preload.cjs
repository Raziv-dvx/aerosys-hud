const { contextBridge, ipcRenderer } = require('electron');
console.log('Preload script loaded');

contextBridge.exposeInMainWorld('electron', {
    getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
    windowControl: (action, payload) => ipcRenderer.send('window-control', action, payload),
    setIgnoreMouseEvents: (ignore, options) => ipcRenderer.send('set-ignore-mouse-events', ignore, options),
    on: (channel, func) => {
        const validChannels = ['update-stats'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
});
