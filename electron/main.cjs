const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const si = require('systeminformation');
const Store = require('electron-store');
const ping = require('ping');
const axios = require('axios');
const loudness = require('loudness');
const activeWin = require('active-win');

const store = new Store();
const isDev = !app.isPackaged;

let mainWindow = null;
let tray = null;

async function checkForUpdates(win) {
    try {
        const currentVersion = app.getVersion();
        // Custom version check from GitHub (example endpoint)
        const response = await axios.get('https://raw.githubusercontent.com/Raziv-dvx/aerosys-hud-pro/main/version.json', { timeout: 5000 });
        const remoteVersion = response.data.version;

        if (remoteVersion !== currentVersion) {
            console.log(`Update available: ${remoteVersion} (Current: ${currentVersion})`);
            if (win && !win.isDestroyed()) {
                win.webContents.send('update-available', {
                    current: currentVersion,
                    latest: remoteVersion,
                    changelog: response.data.changelog
                });
            }
        }
    } catch (e) {
        console.error('Update check failed:', e.message);
    }
}

const PRESETS = {
    'low': { fast: 5000, medium: 10000, slow: 20000, network: 60000, system: 15000 },
    'medium': { fast: 2000, medium: 4000, slow: 12000, network: 45000, system: 10000 },
    'high': { fast: 1000, medium: 2000, slow: 8000, network: 30000, system: 5000 },
    'realtime': { fast: 500, medium: 1000, slow: 5000, network: 15000, system: 2000 }
};

const DEFAULT_SETTINGS = {
    performancePreset: 'medium',
    refreshRates: PRESETS['medium'],
    visibleTabs: ['overview', 'memory', 'network', 'changelog', 'about'],
    showAllTabs: false,
    startupEnabled: true
};

let currentSettings = store.get('settings', DEFAULT_SETTINGS);

function updateHUDStats() {
    const metrics = app.getAppMetrics();
    const totalMemory = metrics.reduce((sum, m) => sum + (m.memory?.workingSetSize || 0), 0);
    const totalCPU = metrics.reduce((sum, m) => sum + (m.cpu?.percentCPUUsage || 0), 0);
    systemData.hudStats = {
        memory: Math.round(totalMemory / 1024), // MB
        cpu: Math.round(totalCPU)
    };
}

let systemData = {
    cpu: {
        currentLoad: 0, speed: 0, temp: 0, cores: 0, governor: '',
        loadAvg: { '1m': 0, '5m': 0, '15m': 0 },
        throttling: false,
        power: 0,
        ppt: 0,
        voltage: 0,
        fanSpeed: 0,
        cache: { l1: 0, l2: 0, l3: 0 }
    },
    mem: {
        active: 0, total: 1, swapused: 0, swaptotal: 0,
        maxCapacity: 0,
        channels: 'Unknown',
        temperature: 0
    },
    gpu: { controllers: [] },
    storage: { fs: [], layout: [], io: [] },
    network: [],
    networkInfo: {
        publicIP: 'Fetching...',
        localIP: '',
        ping: { gateway: 0, google: 0 },
        wifiSignal: 0
    },
    networkUsage: {
        daily: { rx: 0, tx: 0, date: new Date().toDateString() },
        monthly: { rx: 0, tx: 0, month: new Date().getMonth() }
    },
    power: {},
    thermals: {
        motherboard: 0,
        fans: [],
        acpiZones: []
    },
    system: {
        activeWindow: '',
        audioVolume: 0,
        brightness: 0
    },
    os: {},
    health: 100,
    hudStats: { memory: 0, cpu: 0 }
};

// Load Average History
let loadHistory = [];

// Network usage tracking
let lastNetworkBytes = { rx: 0, tx: 0 };

// Helper to update Tray Tooltip
function updateTrayTooltip() {
    if (!tray) return;

    const cpu = Math.round(systemData.cpu.currentLoad || 0);
    const ram = Math.round(((systemData.mem.active || 0) / (systemData.mem.total || 1)) * 100);
    const gpu = Math.round(systemData.gpu.controllers?.[0]?.utilizationGpu || 0);
    const disk = Math.round(systemData.storage.fs?.[0]?.use || 0);

    const tooltip = `CPU: ${cpu}% | RAM: ${ram}% | GPU: ${gpu}% | C: ${disk}%`;
    tray.setToolTip(tooltip);
}

// Helper to calculate Load Average
function updateLoadAverage(currentLoad) {
    loadHistory.push(currentLoad);
    if (loadHistory.length > 600) loadHistory.shift();

    const calcAvg = (seconds) => {
        if (loadHistory.length === 0) return 0;
        const samples = loadHistory.slice(-seconds);
        const sum = samples.reduce((a, b) => a + b, 0);
        return (sum / samples.length).toFixed(1);
    };

    systemData.cpu.loadAvg = {
        '1m': calcAvg(60),
        '5m': calcAvg(300),
        '15m': calcAvg(600)
    };
}

// Helper to calculate RAM max capacity and channels
function calculateMemoryInfo(memLayout) {
    if (!Array.isArray(memLayout) || memLayout.length === 0) return;

    const totalSlots = memLayout[0].formFactor?.includes('DIMM') ? 4 : 2;
    const maxPerSlot = Math.max(...memLayout.map(m => m.size || 0));
    systemData.mem.maxCapacity = Math.round((maxPerSlot * totalSlots) / (1024 ** 3));

    const populatedSlots = memLayout.filter(m => m.size > 0).length;
    if (populatedSlots === 2) systemData.mem.channels = 'Dual Channel';
    else if (populatedSlots === 4) systemData.mem.channels = 'Quad Channel';
    else if (populatedSlots === 1) systemData.mem.channels = 'Single Channel';
    else systemData.mem.channels = `${populatedSlots} Channels`;
}

// Helper to enhance GPU data
function enhanceGPUData(graphics) {
    if (!graphics || !graphics.controllers) return graphics;

    graphics.controllers = graphics.controllers.map(gpu => {
        return {
            ...gpu,
            clockCore: gpu.clockCore || 0,
            clockMem: gpu.clockMem || 0,
            powerDraw: gpu.powerDraw || 0,
            powerLimit: gpu.powerLimit || 0,
            tempHotspot: gpu.temperatureGpu ? gpu.temperatureGpu + 10 : 0,
            fanRPM: gpu.fanSpeed ? Math.round(gpu.fanSpeed * 30) : 0,
            throttling: (gpu.temperatureGpu || 0) > 83,
            load3D: gpu.utilizationGpu || 0,
            loadVideo: 0,
            loadCompute: 0
        };
    });

    return graphics;
}

// Helper to track network usage (daily/monthly)
function trackNetworkUsage(networkStats) {
    if (!Array.isArray(networkStats) || networkStats.length === 0) return;

    const totalRx = networkStats.reduce((sum, net) => sum + (net.rx_bytes || 0), 0);
    const totalTx = networkStats.reduce((sum, net) => sum + (net.tx_bytes || 0), 0);

    // Initialize on first run
    if (lastNetworkBytes.rx === 0) {
        lastNetworkBytes = { rx: totalRx, tx: totalTx };
        return;
    }

    const deltaRx = totalRx - lastNetworkBytes.rx;
    const deltaTx = totalTx - lastNetworkBytes.tx;

    // Update daily
    const today = new Date().toDateString();
    if (systemData.networkUsage.daily.date !== today) {
        systemData.networkUsage.daily = { rx: 0, tx: 0, date: today };
    }
    systemData.networkUsage.daily.rx += deltaRx;
    systemData.networkUsage.daily.tx += deltaTx;

    // Update monthly
    const currentMonth = new Date().getMonth();
    if (systemData.networkUsage.monthly.month !== currentMonth) {
        systemData.networkUsage.monthly = { rx: 0, tx: 0, month: currentMonth };
    }
    systemData.networkUsage.monthly.rx += deltaRx;
    systemData.networkUsage.monthly.tx += deltaTx;

    lastNetworkBytes = { rx: totalRx, tx: totalTx };

    // Persist to store
    store.set('networkUsage', systemData.networkUsage);
}

// Helper to fetch public IP
async function fetchPublicIP() {
    try {
        const response = await axios.get('https://api.ipify.org?format=json', { timeout: 5000 });
        systemData.networkInfo.publicIP = response.data.ip;
    } catch (e) {
        systemData.networkInfo.publicIP = 'Unavailable';
    }
}

// Helper to measure ping
async function measurePing() {
    try {
        // Ping gateway (assume 192.168.1.1 or get from default gateway)
        const gatewayResult = await ping.promise.probe('192.168.1.1', { timeout: 2 });
        systemData.networkInfo.ping.gateway = gatewayResult.alive ? Math.round(gatewayResult.time) : 0;

        // Ping Google DNS
        const googleResult = await ping.promise.probe('8.8.8.8', { timeout: 2 });
        systemData.networkInfo.ping.google = googleResult.alive ? Math.round(googleResult.time) : 0;
    } catch (e) {
        console.error('Ping error:', e);
    }
}

// Staggered Polling Logic
let pollingIntervals = [];

function startDataPolling(win) {
    const safeSend = (channel, data) => {
        if (win && !win.isDestroyed() && win.webContents && win.isVisible()) {
            win.webContents.send(channel, data);
        }
    };

    const stopPolling = () => {
        pollingIntervals.forEach(clearInterval);
        pollingIntervals = [];
    };

    const runPolling = () => {
        stopPolling();
        const rates = currentSettings.refreshRates || PRESETS[currentSettings.performancePreset] || PRESETS.medium;
        const visible = currentSettings.showAllTabs ? ['overview', 'cpu', 'gpu', 'memory', 'network', 'power'] : (currentSettings.visibleTabs || []);

        // Fast Loop - CPU, RAM, Network, HUD Stats
        pollingIntervals.push(setInterval(async () => {
            if (!win || win.isDestroyed() || !win.isVisible()) return;
            try {
                updateHUDStats();
                const promises = [];
                // Check what data we actually need for the current session
                const needCPU = visible.includes('cpu') || visible.includes('overview');
                const needMem = visible.includes('memory') || visible.includes('overview');
                const needNet = visible.includes('network') || visible.includes('overview');

                if (needCPU) promises.push(si.cpu(), si.currentLoad());
                else promises.push(Promise.resolve(null), Promise.resolve(null));

                if (needMem) promises.push(si.mem());
                else promises.push(Promise.resolve(null));

                if (needNet) promises.push(si.networkStats());
                else promises.push(Promise.resolve(null));

                const [cpu, currentLoad, mem, networkStats] = await Promise.all(promises);

                if (cpu && currentLoad) {
                    systemData.cpu = { ...systemData.cpu, ...cpu, ...currentLoad };
                    updateLoadAverage(currentLoad.currentLoad);
                    const isHot = (systemData.cpu.main || 0) > 90;
                    const isSlow = currentLoad.currentLoad > 80 && cpu.speed < (cpu.speedMax || 3.0) * 0.8;
                    systemData.cpu.throttling = isHot || isSlow;
                    systemData.cpu.power = Math.round(65 * (currentLoad.currentLoad / 100));
                    systemData.cpu.voltage = 1.2;
                }

                if (mem) systemData.mem = { ...systemData.mem, ...mem };
                if (networkStats) {
                    systemData.network = networkStats;
                    trackNetworkUsage(networkStats);
                }

                if (currentLoad && mem) {
                    const healthScore = 100 - (currentLoad.currentLoad / 4) - ((mem.active / mem.total) * 20);
                    systemData.health = Math.round(healthScore);
                }

                safeSend('update-stats', systemData);
                updateTrayTooltip();
            } catch (e) { console.error("Fast poll error", e); }
        }, rates.fast));

        // Medium Loop - GPU, Temps, I/O
        pollingIntervals.push(setInterval(async () => {
            if (!win || win.isDestroyed() || !win.isVisible()) return;
            try {
                const promises = [];
                const needGPU = visible.includes('gpu') || visible.includes('overview');
                const needTemps = visible.includes('cpu') || visible.includes('gpu') || visible.includes('overview');
                const needIO = visible.includes('overview');

                if (needGPU) promises.push(si.graphics()); else promises.push(Promise.resolve(null));
                if (needTemps) promises.push(si.cpuTemperature()); else promises.push(Promise.resolve(null));
                if (needIO) promises.push(si.fsStats(), si.disksIO()); else promises.push(Promise.resolve(null), Promise.resolve(null));

                const [graphics, temp, fsStats, disksIO] = await Promise.all(promises);

                if (graphics) systemData.gpu = enhanceGPUData(graphics);
                if (temp) systemData.cpu.main = temp.main;

                if (needIO && Array.isArray(systemData.storage.fs)) {
                    systemData.storage.io = systemData.storage.fs.map((fs, i) => {
                        const ioData = (disksIO && disksIO[fs.fs]) ? disksIO[fs.fs] : {};
                        const fsStatsData = (fsStats && fsStats[fs.fs]) ? fsStats[fs.fs] : {};
                        return {
                            device: fs.fs,
                            rSec: Math.round((fsStatsData.rx_sec || 0) / (1024 * 1024)),
                            wSec: Math.round((fsStatsData.wx_sec || 0) / (1024 * 1024)),
                            smart: { health: 100 }
                        };
                    });
                }
                safeSend('update-stats', systemData);
            } catch (e) { console.error("Medium poll error", e); }
        }, rates.medium));

        // Slow Loop - Disk, Battery, OS, SMART
        pollingIntervals.push(setInterval(async () => {
            if (!win || win.isDestroyed() || !win.isVisible()) return;
            try {
                const promises = [];
                const needBattery = visible.includes('power') || visible.includes('overview');
                const needMemLayout = visible.includes('memory');

                promises.push(si.diskLayout(), si.fsSize(), si.osInfo());
                if (needBattery) promises.push(si.battery()); else promises.push(Promise.resolve(null));
                if (needMemLayout) promises.push(si.memLayout(), si.cpuCache()); else promises.push(Promise.resolve(null), Promise.resolve(null));

                const [diskLayout, fsSize, osInfo, battery, memLayout, cpuCache] = await Promise.all(promises);

                systemData.storage = { ...systemData.storage, layout: diskLayout, fs: fsSize };
                systemData.os = osInfo;

                if (battery) {
                    systemData.power = {
                        ...battery,
                        systemPower: (systemData.cpu.power || 0) + (systemData.gpu.controllers?.[0]?.powerDraw || 0) + 20
                    };
                }

                if (memLayout) {
                    systemData.mem.layout = memLayout;
                    calculateMemoryInfo(memLayout);
                }

                if (cpuCache) {
                    systemData.cpu.cache = {
                        l1: Math.round((cpuCache.l1d || 0) / 1024),
                        l2: Math.round((cpuCache.l2 || 0) / 1024),
                        l3: Math.round((cpuCache.l3 || 0) / 1024)
                    };
                }
                safeSend('update-stats', systemData);
            } catch (e) { console.error("Slow poll error", e); }
        }, rates.slow));

        // Network Loop
        if (visible.includes('network') || visible.includes('overview')) {
            pollingIntervals.push(setInterval(async () => {
                if (!win || win.isDestroyed() || !win.isVisible()) return;
                try {
                    const [networkInterfaces, wifiNetworks] = await Promise.all([
                        si.networkInterfaces(),
                        si.wifiNetworks()
                    ]);
                    const activeInterface = (networkInterfaces || []).find(iface => iface.ip4 && !iface.internal);
                    systemData.networkInfo.localIP = activeInterface?.ip4 || 'N/A';
                    if (Array.isArray(wifiNetworks) && wifiNetworks.length > 0) {
                        systemData.networkInfo.wifiSignal = wifiNetworks.find(wifi => wifi.quality > 0)?.quality || 0;
                    }
                    await measurePing();
                    safeSend('update-stats', systemData);
                } catch (e) { console.error("Network loop error", e); }
            }, rates.network));
        }

        // System Loop
        pollingIntervals.push(setInterval(async () => {
            if (!win || win.isDestroyed() || !win.isVisible()) return;
            try {
                const window = await activeWin();
                systemData.system.activeWindow = window ? window.title : 'N/A';
                try {
                    systemData.system.audioVolume = await loudness.getVolume();
                } catch (e) { }
                safeSend('update-stats', systemData);
            } catch (e) { console.error("System loop error", e); }
        }, rates.system));
    };

    const initialFetch = async () => {
        if (!win || win.isDestroyed()) return;
        try {
            const savedUsage = store.get('networkUsage');
            if (savedUsage) systemData.networkUsage = savedUsage;

            const [diskLayout, fsSize, battery, osInfo, uuid, memLayout, cpuCache, networkInterfaces] = await Promise.all([
                si.diskLayout(),
                si.fsSize(),
                si.battery(),
                si.osInfo(),
                si.uuid(),
                si.memLayout(),
                si.cpuCache(),
                si.networkInterfaces()
            ]);

            systemData.storage = { layout: diskLayout, fs: fsSize, io: [] };
            systemData.power = battery;
            systemData.os = { ...osInfo, uuid };
            systemData.mem.layout = memLayout;
            calculateMemoryInfo(memLayout);

            if (cpuCache) {
                systemData.cpu.cache = {
                    l1: Math.round((cpuCache.l1d || 0) / 1024),
                    l2: Math.round((cpuCache.l2 || 0) / 1024),
                    l3: Math.round((cpuCache.l3 || 0) / 1024)
                };
            }

            const activeInterface = networkInterfaces.find(iface => iface.ip4 && !iface.internal);
            systemData.networkInfo.localIP = activeInterface?.ip4 || 'N/A';
            fetchPublicIP();
            safeSend('update-stats', systemData);
            updateTrayTooltip();
        } catch (e) { console.error("Initial fetch error", e); }
    };

    initialFetch();
    runPolling();

    win.on('show', () => runPolling());
    win.on('hide', () => stopPolling());
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
        },
        frame: false,
        transparent: true,
        resizable: true,
        icon: path.join(__dirname, '../public/icon.png'),
        show: false,
    });

    const startUrl = isDev
        ? 'http://localhost:5173'
        : `file://${path.join(__dirname, '../dist/index.html')}`;

    mainWindow.loadURL(startUrl);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        startDataPolling(mainWindow);
    });

    mainWindow.on('closed', () => (mainWindow = null));

    // Recreate tray when window is shown (if it was hidden)
    mainWindow.on('show', () => {
        if (!tray) {
            createTray();
        }
    });
}

function createTray() {
    // Destroy existing tray to prevent duplicates
    if (tray) {
        tray.destroy();
        tray = null;
    }

    const iconPath = path.join(__dirname, '../public/icon.png');
    // Resize icon to 16x16 for Windows taskbar
    const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
    tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show Dashboard', click: () => {
                if (mainWindow) {
                    mainWindow.show();
                } else {
                    createMainWindow();
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Close Stats', click: () => {
                app.quit();
            }
        },
        {
            label: 'Hide Dashboard', click: () => {
                if (mainWindow) mainWindow.hide();
            }
        },
        {
            label: 'Hide Tray Icon', click: () => {
                if (tray) {
                    tray.destroy();
                    tray = null;
                }
            }
        },
        { type: 'separator' },
        { label: 'Exit', click: () => app.quit() },
    ]);

    tray.setToolTip('AeroSys HUD');
    tray.setContextMenu(contextMenu);

    // Show window on tray icon click
    tray.on('click', () => {
        if (mainWindow) {
            mainWindow.show();
        } else {
            createMainWindow();
        }
    });
}

function setupStartup() {
    const isStartupEnabled = store.get('startupEnabled', true);
    app.setLoginItemSettings({
        openAtLogin: isStartupEnabled,
        path: app.getPath('exe')
    });
}

app.whenReady().then(() => {
    ipcMain.handle('get-system-stats', () => systemData);
    ipcMain.handle('get-settings', () => currentSettings);
    ipcMain.handle('reset-settings', () => {
        currentSettings = { ...DEFAULT_SETTINGS };
        store.set('settings', currentSettings);
        setupStartup();
        if (mainWindow) startDataPolling(mainWindow);
        return currentSettings;
    });

    ipcMain.on('update-settings', (event, newSettings) => {
        currentSettings = { ...currentSettings, ...newSettings };
        store.set('settings', currentSettings);
        setupStartup();

        // Apply performance preset if changed
        if (newSettings.performancePreset) {
            currentSettings.refreshRates = PRESETS[newSettings.performancePreset];
        }

        if (mainWindow) {
            startDataPolling(mainWindow);
        }
    });

    ipcMain.on('window-control', (event, action, payload) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (!win) return;
        switch (action) {
            case 'minimize': win.minimize(); break;
            case 'maximize': win.isMaximized() ? win.unmaximize() : win.maximize(); break;
            case 'close': win.hide(); break;
            case 'log-error':
                console.error("RENDERER ERROR:", payload);
                break;
        }
    });

    ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) {
            win.setIgnoreMouseEvents(ignore, options);
        }
    });

    ipcMain.on('restart-polling', () => {
        if (mainWindow) {
            startDataPolling(mainWindow);
        }
    });

    ipcMain.on('check-updates', () => {
        if (mainWindow) checkForUpdates(mainWindow);
    });

    ipcMain.on('relaunch-app', () => {
        app.relaunch();
        app.exit(0);
    });

    createMainWindow();
    createTray();
    setupStartup();

    // Check for updates on startup after a short delay
    setTimeout(() => {
        if (mainWindow) checkForUpdates(mainWindow);
    }, 10000);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
