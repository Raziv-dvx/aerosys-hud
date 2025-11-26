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

// Global System Data Object
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
    health: 100
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
function startDataPolling(win) {
    const safeSend = (channel, data) => {
        if (win && !win.isDestroyed() && win.webContents) {
            win.webContents.send(channel, data);
        }
    };

    // Fast Loop (1000ms) - CPU, RAM, Network
    setInterval(async () => {
        if (!win || win.isDestroyed()) return;
        try {
            const [cpu, currentLoad, mem, networkStats] = await Promise.all([
                si.cpu(),
                si.currentLoad(),
                si.mem(),
                si.networkStats()
            ]);

            systemData.cpu = { ...systemData.cpu, ...cpu, ...currentLoad };
            updateLoadAverage(currentLoad.currentLoad);

            const isHot = systemData.cpu.main > 90;
            const isSlow = currentLoad.currentLoad > 80 && cpu.speed < (cpu.speedMax || 3.0) * 0.8;
            systemData.cpu.throttling = isHot || isSlow;

            const tdp = 65;
            systemData.cpu.power = Math.round(tdp * (currentLoad.currentLoad / 100));
            systemData.cpu.voltage = 1.2;

            systemData.mem = { ...systemData.mem, ...mem };
            systemData.network = networkStats;

            // Track network usage
            trackNetworkUsage(networkStats);

            const healthScore = 100 - (currentLoad.currentLoad / 4) - ((mem.active / mem.total) * 20);
            systemData.health = Math.round(healthScore);

            safeSend('update-stats', systemData);
            updateTrayTooltip();
        } catch (e) { console.error("Fast poll error", e); }
    }, 1500);

    // Medium Loop (2000ms) - GPU, Temps, I/O Stats
    setInterval(async () => {
        if (!win || win.isDestroyed()) return;
        try {
            const [graphics, temp, fsStats, disksIO] = await Promise.all([
                si.graphics(),
                si.cpuTemperature(),
                si.fsStats(),
                si.disksIO()
            ]);

            systemData.gpu = enhanceGPUData(graphics);
            systemData.cpu.main = temp.main;

            if (Array.isArray(systemData.storage.fs)) {
                systemData.storage.io = systemData.storage.fs.map((fs, i) => {
                    const ioData = disksIO[fs.fs] || {};
                    const fsStatsData = fsStats[fs.fs] || {};

                    return {
                        device: fs.fs,
                        rIO: ioData.rIO || 0,
                        wIO: ioData.wIO || 0,
                        rSec: Math.round((fsStatsData.rx_sec || 0) / (1024 * 1024)),
                        wSec: Math.round((fsStatsData.wx_sec || 0) / (1024 * 1024)),
                        queueLength: ioData.queueLength || 0,
                        temperature: 0,
                        smart: {
                            health: 100,
                            tbw: 0,
                            errors: 0,
                            fragmentation: 0
                        }
                    };
                });
            }

            safeSend('update-stats', systemData);
        } catch (e) { console.error("Medium poll error", e); }
    }, 3000);

    // Slow Loop (10000ms) - Disk, Battery, OS, SMART, Thermals
    setInterval(async () => {
        if (!win || win.isDestroyed()) return;
        try {
            const [diskLayout, fsSize, battery, osInfo, uuid, memLayout, chassis, cpuCache, baseboard] = await Promise.all([
                si.diskLayout(),
                si.fsSize(),
                si.battery(),
                si.osInfo(),
                si.uuid(),
                si.memLayout(),
                si.chassis(),
                si.cpuCache(),
                si.baseboard()
            ]);

            systemData.storage = {
                ...systemData.storage,
                layout: diskLayout,
                fs: fsSize
            };

            if (Array.isArray(diskLayout)) {
                diskLayout.forEach((disk, i) => {
                    if (systemData.storage.io[i]) {
                        systemData.storage.io[i].temperature = disk.temperature || 0;
                        systemData.storage.io[i].smart = {
                            health: disk.smartStatus === 'Ok' ? 100 : 50,
                            tbw: Math.round((disk.bytesWritten || 0) / (1024 ** 4)),
                            errors: disk.smartData?.error_count || 0,
                            fragmentation: 0
                        };
                    }
                });
            }

            // Enhanced Power Data
            systemData.power = {
                ...battery,
                wearLevel: battery.designedCapacity && battery.currentCapacity
                    ? Math.round(((battery.designedCapacity - battery.currentCapacity) / battery.designedCapacity) * 100)
                    : 0,
                chargeRate: battery.currentCapacity && battery.voltage
                    ? Math.round((battery.voltage * (battery.currentCapacity / 1000)) / 10) // Rough estimate
                    : 0,
                systemPower: systemData.cpu.power + (systemData.gpu.controllers?.[0]?.powerDraw || 0) + 20 // CPU + GPU + base
            };

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

            // Thermals & ACPI Zones
            systemData.thermals.motherboard = baseboard.temperature || 0;

            // Collect ACPI temperature zones
            try {
                const tempData = await si.cpuTemperature();
                systemData.thermals.acpiZones = [];
                if (tempData.cores && Array.isArray(tempData.cores)) {
                    tempData.cores.forEach((temp, i) => {
                        systemData.thermals.acpiZones.push({
                            zone: `Core ${i}`,
                            temp: temp || 0
                        });
                    });
                }
                if (tempData.main) {
                    systemData.thermals.acpiZones.push({
                        zone: 'CPU Package',
                        temp: tempData.main
                    });
                }
            } catch (e) {
                console.error('ACPI zones error:', e);
            }

            // Enhanced CPU PPT (Package Power Tracking)
            const tdp = 65; // Base TDP
            systemData.cpu.ppt = Math.round(tdp * (systemData.cpu.currentLoad / 100) * 1.2); // PPT is typically 1.2x load-based power

            if (chassis && chassis.fans && Array.isArray(chassis.fans)) {
                systemData.thermals.fans = chassis.fans.map(fan => ({
                    name: fan.name || 'System Fan',
                    rpm: fan.speed || 0,
                    curve: 'auto'
                }));
                if (chassis.fans.length > 0) {
                    systemData.cpu.fanSpeed = chassis.fans[0].speed || 0;
                }
            }

            safeSend('update-stats', systemData);
        } catch (e) { console.error("Slow poll error", e); }
    }, 10000);

    // Network Info Loop (30000ms) - IP, Ping, Wi-Fi
    setInterval(async () => {
        if (!win || win.isDestroyed()) return;
        try {
            const [networkInterfaces, wifiNetworks] = await Promise.all([
                si.networkInterfaces(),
                si.wifiNetworks()
            ]);

            // Get local IP
            const activeInterface = networkInterfaces.find(iface => iface.ip4 && !iface.internal);
            systemData.networkInfo.localIP = activeInterface?.ip4 || 'N/A';

            // Get Wi-Fi signal
            if (Array.isArray(wifiNetworks) && wifiNetworks.length > 0) {
                const connectedWifi = wifiNetworks.find(wifi => wifi.quality > 0);
                systemData.networkInfo.wifiSignal = connectedWifi?.quality || 0;
            }

            // Measure ping
            await measurePing();

            safeSend('update-stats', systemData);
        } catch (e) { console.error("Network info error", e); }
    }, 30000);

    // System Info Loop (5000ms) - Active Window, Audio, Brightness
    setInterval(async () => {
        if (!win || win.isDestroyed()) return;
        try {
            // Get active window
            const window = await activeWin();
            systemData.system.activeWindow = window ? window.title : 'N/A';

            // Get audio volume
            try {
                const volume = await loudness.getVolume();
                systemData.system.audioVolume = volume || 0;
            } catch (e) {
                systemData.system.audioVolume = 0;
            }

            // Get screen brightness (if available)
            try {
                const displays = await si.graphics();
                if (displays && displays.displays && displays.displays.length > 0) {
                    systemData.system.brightness = displays.displays[0].currentResX ? 100 : 0; // Placeholder
                }
            } catch (e) {
                systemData.system.brightness = 0;
            }

            safeSend('update-stats', systemData);
        } catch (e) { console.error("System info error", e); }
    }, 7500);

    // Initial Fetch
    (async () => {
        if (!win || win.isDestroyed()) return;
        try {
            // Load saved network usage
            const savedUsage = store.get('networkUsage');
            if (savedUsage) {
                systemData.networkUsage = savedUsage;
            }

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

            // Fetch public IP
            fetchPublicIP();

            safeSend('update-stats', systemData);
            updateTrayTooltip();
        } catch (e) { console.error("Initial fetch error", e); }
    })();
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
                // Clear the tooltip to remove stats from taskbar
                if (tray) {
                    tray.setToolTip('AeroSys HUD');
                }
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

app.whenReady().then(() => {
    ipcMain.handle('get-system-stats', () => systemData);

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

    createMainWindow();
    createTray();

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
