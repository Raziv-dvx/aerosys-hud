const { contextBridge, ipcRenderer } = require('electron');
console.log('Preload script loaded');

contextBridge.exposeInMainWorld('electron', {
    getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    resetSettings: () => ipcRenderer.invoke('reset-settings'),
    updateSettings: (settings) => ipcRenderer.send('update-settings', settings),
    restartPolling: () => ipcRenderer.send('restart-polling'),
    checkUpdates: () => ipcRenderer.send('check-updates'),
    relaunchApp: () => ipcRenderer.send('relaunch-app'),
    windowControl: (action, payload) => ipcRenderer.send('window-control', action, payload),
    setIgnoreMouseEvents: (ignore, options) => ipcRenderer.send('set-ignore-mouse-events', ignore, options),
    on: (channel, func) => {
        const validChannels = ['update-stats', 'update-available'];
        if (validChannels.includes(channel)) {
            const subscription = (event, ...args) => func(...args);
            ipcRenderer.on(channel, subscription);
            return () => ipcRenderer.removeListener(channel, subscription);
        }
    },
});
