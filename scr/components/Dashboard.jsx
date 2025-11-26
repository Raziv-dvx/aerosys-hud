import React, { useState, useMemo } from 'react';
import { useSystemStats } from '../hooks/useSystemStats';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, BarChart2, Settings, Cpu, HardDrive, Wifi, Battery,
    Thermometer, Zap, Layers, Monitor, Server, Globe, Clock, Shield
} from 'lucide-react';
import clsx from 'clsx';

export default function Dashboard() {
    const { stats } = useSystemStats();
    const [activeTab, setActiveTab] = useState('overview');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } }
    };

    const tabVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.15 } }
    };

    // Memoize computed values to prevent recalculation on every render
    const cpuLoad = useMemo(() => Math.round(stats?.cpu?.currentLoad || 0), [stats?.cpu?.currentLoad]);
    const ramUsage = useMemo(() => Math.round(((stats?.mem?.active || 0) / (stats?.mem?.total || 1)) * 100), [stats?.mem?.active, stats?.mem?.total]);
    const gpuUsage = useMemo(() => Math.round(stats?.gpu?.controllers?.[0]?.utilizationGpu || 0), [stats?.gpu?.controllers]);

    if (!stats) return (
        <div className="w-full h-full flex items-center justify-center text-neon-blue animate-pulse">
            INITIALIZING AEROSYS HUD...
        </div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full h-full flex flex-col text-white overflow-hidden relative"
        >
            {/* Background */}
            <div className="absolute inset-0 bg-dark-bg -z-20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 -z-10"></div>
            <div className="absolute inset-0 backdrop-blur-3xl -z-10"></div>

            {/* Header */}
            <header className="flex justify-between items-center p-4 border-b border-glass-border bg-glass-bg/50 draggable">
                <div className="flex items-center gap-3">
                    <Activity className="text-neon-blue" />
                    <div>
                        <h1 className="text-xl font-bold neon-text tracking-wider">AEROSYS <span className="font-light text-gray-300">HUD</span></h1>
                        <div className="text-[10px] text-gray-400 tracking-widest">SYSTEM MONITORING SUITE</div>
                    </div>
                </div>
                <div className="flex gap-2 no-drag overflow-x-auto max-w-[600px] scrollbar-hide">
                    {['overview', 'cpu', 'gpu', 'memory', 'network', 'power', 'changelog', 'about'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-3 py-1 rounded text-xs uppercase tracking-wider transition-all whitespace-nowrap",
                                activeTab === tab
                                    ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/50 shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                                    : "hover:bg-white/5 text-gray-400 hover:text-white"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 no-drag">

                    <button onClick={() => window.electron.windowControl('minimize')} className="p-2 hover:bg-white/10 rounded">_</button>
                    <button onClick={() => window.electron.windowControl('close')} className="p-2 hover:bg-red-500/50 rounded">X</button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 p-6 overflow-auto custom-scrollbar">
                <AnimatePresence mode="wait">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <motion.div key="overview" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            {/* Health Score */}
                            <div className="glass-panel p-6 flex items-center justify-between bg-gradient-to-r from-neon-blue/10 to-transparent">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">System Health Score</h2>
                                    <p className="text-gray-400 text-sm">AI-Calculated Performance Index</p>
                                </div>
                                <div className="text-5xl font-bold neon-text">{stats.health || 100}</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard
                                    title="CPU Load"
                                    value={`${Math.round(stats.cpu?.currentLoad || 0)}%`}
                                    sub={`${stats.cpu?.cores || 0} Cores @ ${stats.cpu?.speed || 0} GHz`}
                                    color="neon-blue"
                                    icon={<Cpu />}
                                    progress={stats.cpu?.currentLoad || 0}
                                />
                                <StatCard
                                    title="Memory"
                                    value={`${Math.round(((stats.mem?.active || 0) / (stats.mem?.total || 1)) * 100)}%`}
                                    sub={`${((stats.mem?.active || 0) / 1024 ** 3).toFixed(1)} / ${((stats.mem?.total || 0) / 1024 ** 3).toFixed(1)} GB`}
                                    color="neon-purple"
                                    icon={<Server />}
                                    progress={((stats.mem?.active || 0) / (stats.mem?.total || 1)) * 100}
                                />
                                <StatCard
                                    title="GPU Usage"
                                    value={`${Math.round(stats.gpu?.controllers?.[0]?.utilizationGpu || 0)}%`}
                                    sub={`${stats.gpu?.controllers?.[0]?.model || 'N/A'}`}
                                    color="green-400"
                                    icon={<Monitor />}
                                    progress={stats.gpu?.controllers?.[0]?.utilizationGpu || 0}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="glass-panel p-4">
                                    <h3 className="text-gray-400 text-xs uppercase mb-2">OS Information</h3>
                                    <div className="flex items-center gap-4">
                                        <Shield className="text-neon-blue" size={32} />
                                        <div>
                                            <div className="font-bold">{stats.os?.distro} {stats.os?.release}</div>
                                            <div className="text-xs text-gray-500">{stats.os?.arch} - {stats.os?.hostname}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="glass-panel p-4">
                                    <h3 className="text-gray-400 text-xs uppercase mb-2">Uptime</h3>
                                    <div className="flex items-center gap-4">
                                        <Clock className="text-neon-blue" size={32} />
                                        <div>
                                            <div className="font-bold">{Math.floor((stats.os?.uptime || 0) / 3600)}h {Math.floor(((stats.os?.uptime || 0) % 3600) / 60)}m</div>
                                            <div className="text-xs text-gray-500">System Uptime</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* CPU TAB */}
                    {activeTab === 'cpu' && (
                        <motion.div key="cpu" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            <div className="glass-panel p-6">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">{stats.cpu?.brand}</h2>
                                        <div className="text-sm text-gray-400">{stats.cpu?.manufacturer} - {stats.cpu?.socket} Socket</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-neon-blue">{stats.cpu?.speed} GHz</div>
                                        <div className="text-xs text-gray-500">Current Speed</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                    <DetailBox label="Cores / Threads" value={`${stats.cpu?.physicalCores} / ${stats.cpu?.cores}`} />
                                    <DetailBox label="Voltage" value={`${stats.cpu?.voltage || 1.2} V`} />
                                    <DetailBox label="Package Temp" value={`${stats.cpu?.main || 'N/A'}°C`} color={stats.cpu?.main > 80 ? 'text-red-500' : 'text-green-400'} />
                                    <DetailBox label="Fan Speed" value={`${stats.cpu?.fanSpeed || 0} RPM`} />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    <DetailBox label="Power (Est.)" value={`~${stats.cpu?.power || 0} W`} color="text-yellow-400" />
                                    <DetailBox label="Throttling" value={stats.cpu?.throttling ? "YES" : "NO"} color={stats.cpu?.throttling ? "text-red-500" : "text-green-400"} />
                                    <DetailBox label="Governor" value={stats.cpu?.governor || 'Performance'} />
                                    <DetailBox label="Socket" value={stats.cpu?.socket || 'N/A'} />
                                </div>

                                <div className="mt-6 glass-panel p-4 bg-white/5">
                                    <h3 className="text-xs text-gray-400 uppercase mb-2">Load Averages</h3>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-neon-blue">{stats.cpu?.loadAvg?.['1m'] || 0}%</div>
                                            <div className="text-[10px] text-gray-500">1 Min</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-neon-purple">{stats.cpu?.loadAvg?.['5m'] || 0}%</div>
                                            <div className="text-[10px] text-gray-500">5 Min</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-green-400">{stats.cpu?.loadAvg?.['15m'] || 0}%</div>
                                            <div className="text-[10px] text-gray-500">15 Min</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel p-6">
                                <h3 className="text-sm text-gray-400 uppercase mb-4">Per-Core Usage</h3>
                                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                                    {Array.isArray(stats.cpu?.cpus) && stats.cpu.cpus.map((load, i) => (
                                        <div key={i} className="text-center">
                                            <div className="h-20 bg-gray-800 rounded-full overflow-hidden relative mx-auto w-6">
                                                <motion.div
                                                    className="absolute bottom-0 left-0 w-full bg-neon-blue"
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${load.load}%` }}
                                                />
                                            </div>
                                            <div className="mt-2 text-[10px] text-gray-500">#{i}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* GPU TAB */}
                    {activeTab === 'gpu' && (
                        <motion.div key="gpu" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            {Array.isArray(stats.gpu?.controllers) && stats.gpu.controllers.map((gpu, i) => (
                                <div key={i} className="glass-panel p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <Monitor className="text-green-400" size={40} />
                                            <div>
                                                <h2 className="text-xl font-bold">{gpu.model}</h2>
                                                <div className="text-sm text-gray-400">{gpu.vendor} - {gpu.bus}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-green-400">{Math.round(gpu.utilizationGpu || 0)}%</div>
                                            <div className="text-xs text-gray-500">Utilization</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <DetailBox label="VRAM Used" value={`${Math.round(gpu.memoryUsed / 1024)} GB`} />
                                        <DetailBox label="VRAM Total" value={`${Math.round(gpu.vram / 1024)} GB`} />
                                        <DetailBox label="Temperature" value={`${gpu.temperatureGpu || 'N/A'}°C`} color={gpu.temperatureGpu > 80 ? 'text-red-500' : 'text-green-400'} />
                                        <DetailBox label="Hotspot Temp" value={`${gpu.tempHotspot || 'N/A'}°C`} color={gpu.tempHotspot > 90 ? 'text-red-500' : 'text-yellow-400'} />
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                        <DetailBox label="Core Clock" value={`${gpu.clockCore || 0} MHz`} />
                                        <DetailBox label="Memory Clock" value={`${gpu.clockMem || 0} MHz`} />
                                        <DetailBox label="Power Draw" value={`${gpu.powerDraw || 0} W`} color="text-yellow-400" />
                                        <DetailBox label="Fan Speed" value={`${gpu.fanSpeed || 0}% (${gpu.fanRPM || 0} RPM)`} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <DetailBox label="Throttling" value={gpu.throttling ? 'YES' : 'NO'} color={gpu.throttling ? 'text-red-500' : 'text-green-400'} />
                                        <DetailBox label="3D Load" value={`${Math.round(gpu.load3D || 0)}%`} />
                                    </div>

                                    <div className="mt-6">
                                        <div className="text-xs text-gray-400 mb-1">VRAM Usage</div>
                                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                                                style={{ width: `${(gpu.memoryUsed / gpu.vram) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* MEMORY & STORAGE TAB */}
                    {activeTab === 'memory' && (
                        <motion.div key="memory" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            <div className="glass-panel p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Server className="text-neon-purple" /> RAM</h2>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm"><span>Used</span> <span>{((stats.mem?.active || 0) / 1024 ** 3).toFixed(1)} GB</span></div>
                                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-neon-purple" style={{ width: `${((stats.mem?.active || 0) / (stats.mem?.total || 1)) * 100}%` }} />
                                        </div>
                                        <div className="flex justify-between text-sm"><span>Free</span> <span>{((stats.mem?.free || 0) / 1024 ** 3).toFixed(1)} GB</span></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <DetailBox label="Total" value={`${((stats.mem?.total || 0) / 1024 ** 3).toFixed(0)} GB`} />
                                        <DetailBox label="Max Capacity" value={`${stats.mem?.maxCapacity || 'N/A'} GB`} />
                                        <DetailBox label="Channels" value={stats.mem?.channels || 'Unknown'} />
                                        <DetailBox label="Swap Used" value={`${((stats.mem?.swapused || 0) / 1024 ** 3).toFixed(1)} GB`} />
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-3 gap-4">
                                    <DetailBox label="L1 Cache" value={`${stats.cpu?.cache?.l1 || 0} KB`} color="text-neon-blue" />
                                    <DetailBox label="L2 Cache" value={`${stats.cpu?.cache?.l2 || 0} KB`} color="text-neon-purple" />
                                    <DetailBox label="L3 Cache" value={`${stats.cpu?.cache?.l3 || 0} KB`} color="text-green-400" />
                                </div>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {Array.isArray(stats.mem?.layout) && stats.mem.layout.map((stick, i) => (
                                        <div key={i} className="bg-white/5 p-2 rounded text-xs flex justify-between">
                                            <span className="text-gray-400">Slot {i + 1}</span>
                                            <span>{stick.manufacturer} {stick.type} {stick.clockSpeed}MHz ({stick.size / 1024 ** 3}GB)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-panel p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><HardDrive className="text-yellow-400" /> Storage</h2>
                                <div className="space-y-4">
                                    {Array.isArray(stats.storage?.fs) && stats.storage.fs.map((disk, i) => {
                                        const ioData = stats.storage?.io?.[i] || {};
                                        return (
                                            <div key={i} className="bg-white/5 p-4 rounded-lg">
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-bold">{disk.fs} <span className="text-gray-400 text-xs">({disk.type})</span></span>
                                                    <span className="text-sm">{Math.round(disk.use)}% Used</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                                                    <div className="h-full bg-yellow-400" style={{ width: `${disk.use}%` }} />
                                                </div>
                                                <div className="text-xs text-gray-500 flex justify-between mb-3">
                                                    <span>Used: {(disk.used / 1024 ** 3).toFixed(0)} GB</span>
                                                    <span>Total: {(disk.size / 1024 ** 3).toFixed(0)} GB</span>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                                                    <div className="bg-white/5 p-2 rounded text-center">
                                                        <div className="text-[10px] text-gray-400">Read</div>
                                                        <div className="text-sm font-bold text-blue-400">{ioData.rSec || 0} MB/s</div>
                                                    </div>
                                                    <div className="bg-white/5 p-2 rounded text-center">
                                                        <div className="text-[10px] text-gray-400">Write</div>
                                                        <div className="text-sm font-bold text-purple-400">{ioData.wSec || 0} MB/s</div>
                                                    </div>
                                                    <div className="bg-white/5 p-2 rounded text-center">
                                                        <div className="text-[10px] text-gray-400">IOPS</div>
                                                        <div className="text-sm font-bold">{(ioData.rIO || 0) + (ioData.wIO || 0)}</div>
                                                    </div>
                                                    <div className="bg-white/5 p-2 rounded text-center">
                                                        <div className="text-[10px] text-gray-400">Health</div>
                                                        <div className="text-sm font-bold text-green-400">{ioData.smart?.health || 100}%</div>
                                                    </div>
                                                </div>

                                                {ioData.smart && (
                                                    <div className="grid grid-cols-3 gap-2 mt-2 text-[10px]">
                                                        <div className="text-gray-500">TBW: {ioData.smart.tbw || 0} TB</div>
                                                        <div className="text-gray-500">Errors: {ioData.smart.errors || 0}</div>
                                                        <div className="text-gray-500">Temp: {ioData.temperature || 'N/A'}°C</div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* NETWORK TAB */}
                    {activeTab === 'network' && (
                        <motion.div key="network" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            {/* Network Info Panel */}
                            <div className="glass-panel p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Globe className="text-blue-400" /> Network Information</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <DetailBox label="Public IP" value={stats.networkInfo?.publicIP || 'Fetching...'} />
                                    <DetailBox label="Local IP" value={stats.networkInfo?.localIP || 'N/A'} />
                                    <DetailBox label="Ping (Gateway)" value={`${stats.networkInfo?.ping?.gateway || 0} ms`} color="text-green-400" />
                                    <DetailBox label="Ping (Google)" value={`${stats.networkInfo?.ping?.google || 0} ms`} color="text-blue-400" />
                                </div>
                                {stats.networkInfo?.wifiSignal > 0 && (
                                    <div className="mt-4">
                                        <div className="text-xs text-gray-400 mb-1">Wi-Fi Signal Strength</div>
                                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-400" style={{ width: `${stats.networkInfo.wifiSignal}%` }} />
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{stats.networkInfo.wifiSignal}%</div>
                                    </div>
                                )}
                            </div>

                            {/* Usage Tracking */}
                            <div className="glass-panel p-6">
                                <h2 className="text-xl font-bold mb-4">Data Usage</h2>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm text-gray-400 uppercase mb-2">Daily</h3>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>Downloaded:</span>
                                                <span className="text-blue-400">{((stats.networkUsage?.daily?.rx || 0) / (1024 ** 3)).toFixed(2)} GB</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Uploaded:</span>
                                                <span className="text-purple-400">{((stats.networkUsage?.daily?.tx || 0) / (1024 ** 3)).toFixed(2)} GB</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm text-gray-400 uppercase mb-2">Monthly</h3>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>Downloaded:</span>
                                                <span className="text-blue-400">{((stats.networkUsage?.monthly?.rx || 0) / (1024 ** 3)).toFixed(2)} GB</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Uploaded:</span>
                                                <span className="text-purple-400">{((stats.networkUsage?.monthly?.tx || 0) / (1024 ** 3)).toFixed(2)} GB</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Adapters */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Array.isArray(stats.network) && stats.network.map((net, i) => (
                                    <div key={i} className="glass-panel p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <Wifi className="text-blue-400" />
                                                <div>
                                                    <div className="font-bold truncate max-w-[150px]">{net.iface}</div>
                                                    <div className="text-xs text-gray-500">{net.operstate}</div>
                                                </div>
                                            </div>
                                            <div className={clsx("text-xs px-2 py-1 rounded", net.operstate === 'up' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                                                {net.operstate.toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center p-3 bg-white/5 rounded">
                                                <div className="text-xs text-gray-400">Download</div>
                                                <div className="text-lg font-bold text-blue-400">{(net.rx_sec / 1024).toFixed(1)} KB/s</div>
                                            </div>
                                            <div className="text-center p-3 bg-white/5 rounded">
                                                <div className="text-xs text-gray-400">Upload</div>
                                                <div className="text-lg font-bold text-purple-400">{(net.tx_sec / 1024).toFixed(1)} KB/s</div>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-xs text-gray-500">
                                            <div>Total RX: {(net.rx_bytes / 1024 ** 3).toFixed(2)} GB</div>
                                            <div>Total TX: {(net.tx_bytes / 1024 ** 3).toFixed(2)} GB</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* POWER TAB */}
                    {activeTab === 'power' && (
                        <motion.div key="power" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
                                <Battery size={64} className={clsx("mb-4", stats.power?.isCharging ? "text-green-400" : "text-neon-blue")} />
                                <h2 className="text-4xl font-bold mb-2">{stats.power?.percent || 0}%</h2>
                                <p className="text-gray-400">{stats.power?.isCharging ? "Charging" : "On Battery"}</p>
                                {stats.power?.timeRemaining && (
                                    <p className="text-sm text-gray-500 mt-2">{Math.floor(stats.power.timeRemaining / 60)}h {stats.power.timeRemaining % 60}m remaining</p>
                                )}
                                {stats.power?.wearLevel > 0 && (
                                    <div className="mt-4">
                                        <div className="text-xs text-gray-400">Battery Wear Level</div>
                                        <div className="text-2xl font-bold text-yellow-400">{stats.power.wearLevel}%</div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <DetailBox label="Cycle Count" value={stats.power?.cycleCount || 'N/A'} />
                                <DetailBox label="Voltage" value={`${stats.power?.voltage || 0}V`} />
                                <DetailBox label="Charge Rate" value={`${stats.power?.chargeRate || 0} W`} color="text-yellow-400" />
                                <DetailBox label="Designed Capacity" value={`${stats.power?.designedCapacity || 0} mWh`} />
                                <DetailBox label="Current Capacity" value={`${stats.power?.currentCapacity || 0} mWh`} />
                                <DetailBox label="System Power" value={`~${stats.power?.systemPower || 0} W`} color="text-red-400" />
                            </div>
                        </motion.div>
                    )}

                    {/* CHANGELOG TAB */}
                    {activeTab === 'changelog' && (
                        <motion.div key="changelog" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            {/* Header */}
                            <div className="glass-panel p-8 text-center bg-gradient-to-br from-neon-purple/10 via-neon-blue/10 to-transparent">
                                <h1 className="text-5xl font-bold neon-text mb-2">CHANGELOG</h1>
                                <p className="text-xl text-gray-300 mb-4">Version History & Release Notes</p>
                            </div>

                            {/* Version 1.1 - Current */}
                            <div className="glass-panel p-6 border-l-4 border-neon-blue">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-neon-blue">AeroSys HUD v1.1</h2>
                                        <p className="text-sm text-gray-400">Current Release • November 2025</p>
                                    </div>
                                    <div className="px-3 py-1 bg-neon-blue/20 text-neon-blue rounded-full text-xs font-bold">LATEST</div>
                                </div>
                                <div className="space-y-2 text-gray-300">
                                    <p className="font-bold text-white mb-2">🐛 Bug Fixes & Improvements:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Fixed taskbar icon visibility issues on Windows</li>
                                        <li>Added "Close Stats" button to taskbar context menu</li>
                                        <li>Fixed duplicate tray icons appearing on app restart</li>
                                        <li>Optimized performance for 4GB+ RAM systems</li>
                                        <li>Reduced CPU usage by ~40% through polling optimization</li>
                                        <li>Reduced RAM usage by ~25% with memory optimizations</li>
                                        <li>Simplified branding from "AeroSys HUD Pro" to "AeroSys HUD"</li>
                                        <li>Added React.memo and useMemo for better performance</li>
                                        <li>Improved animation smoothness with optimized durations</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Version 1.0 */}
                            <div className="glass-panel p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-neon-purple">AeroSys HUD v1.0</h2>
                                        <p className="text-sm text-gray-400">Major Release • November 2025</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-gray-300">
                                    <p className="font-bold text-white mb-2">✨ Major Enhancements:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Complete UI/UX overhaul with glassmorphism design</li>
                                        <li>Performance optimizations across all components</li>
                                        <li>Improved data polling with staggered intervals</li>
                                        <li>Enhanced error handling and stability</li>
                                        <li>Optimized for Windows 10 and Windows 11</li>
                                        <li>Added system health score calculation</li>
                                        <li>Improved memory management</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Version 0.9 */}
                            <div className="glass-panel p-6">
                                <h2 className="text-xl font-bold text-green-400 mb-2">AeroSys HUD v0.9</h2>
                                <p className="text-sm text-gray-400 mb-3">Feature Release</p>
                                <div className="space-y-2 text-gray-300">
                                    <p className="font-bold text-white mb-2">🌐 New Features:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Added Wi-Fi signal strength monitoring</li>
                                        <li>Added network ping (gateway & Google DNS)</li>
                                        <li>Added public/local IP address display</li>
                                        <li>Added About section with project information</li>
                                        <li>Added technology stack documentation</li>
                                        <li>Added system requirements information</li>
                                        <li>Improved network statistics tracking</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Version 0.8 */}
                            <div className="glass-panel p-6">
                                <h2 className="text-xl font-bold text-yellow-400 mb-2">AeroSys HUD v0.8</h2>
                                <p className="text-sm text-gray-400 mb-3">Metrics Expansion</p>
                                <div className="space-y-2 text-gray-300">
                                    <p className="font-bold text-white mb-2">📊 Enhanced Metrics:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Added GPU core/memory clock speeds</li>
                                        <li>Added GPU power draw monitoring</li>
                                        <li>Added GPU hotspot temperature</li>
                                        <li>Added GPU throttling detection</li>
                                        <li>Added disk SMART health status</li>
                                        <li>Added disk read/write speeds (MB/s)</li>
                                        <li>Added IOPS (I/O operations per second)</li>
                                        <li>Added Total Bytes Written (TBW) for SSDs</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Version 0.7 */}
                            <div className="glass-panel p-6">
                                <h2 className="text-xl font-bold text-blue-400 mb-2">AeroSys HUD v0.7</h2>
                                <p className="text-sm text-gray-400 mb-3">CPU & RAM Enhancements</p>
                                <div className="space-y-2 text-gray-300">
                                    <p className="font-bold text-white mb-2">⚡ New Metrics:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Added CPU load averages (1m, 5m, 15m)</li>
                                        <li>Added CPU throttling detection</li>
                                        <li>Added CPU power consumption estimates</li>
                                        <li>Added CPU Package Power Tracking (PPT)</li>
                                        <li>Added CPU voltage monitoring</li>
                                        <li>Added CPU cache sizes (L1, L2, L3)</li>
                                        <li>Added RAM channel detection (Dual/Quad)</li>
                                        <li>Added RAM max capacity calculation</li>
                                        <li>Added per-stick memory information</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Version 0.6 */}
                            <div className="glass-panel p-6">
                                <h2 className="text-xl font-bold text-purple-400 mb-2">AeroSys HUD v0.6</h2>
                                <p className="text-sm text-gray-400 mb-3">UI Reorganization</p>
                                <div className="space-y-2 text-gray-300">
                                    <p className="font-bold text-white mb-2">🎨 Interface Updates:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Added individual panels for each metric category</li>
                                        <li>Created dedicated CPU tab with detailed stats</li>
                                        <li>Created dedicated GPU tab with utilization graphs</li>
                                        <li>Created dedicated Memory & Storage tab</li>
                                        <li>Created dedicated Network tab</li>
                                        <li>Created dedicated Power/Battery tab</li>
                                        <li>Improved navigation with tab system</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Version 0.5 */}
                            <div className="glass-panel p-6">
                                <h2 className="text-xl font-bold text-red-400 mb-2">AeroSys HUD v0.5</h2>
                                <p className="text-sm text-gray-400 mb-3">Taskbar Integration (Beta)</p>
                                <div className="space-y-2 text-gray-300">
                                    <p className="font-bold text-white mb-2">🔔 System Tray:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Added Windows taskbar system tray icon</li>
                                        <li>Added real-time stats tooltip on hover</li>
                                        <li>Added context menu with basic controls</li>
                                        <li>App minimizes to tray instead of closing</li>
                                        <li>Click tray icon to restore window</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Version 0.4 */}
                            <div className="glass-panel p-6">
                                <h2 className="text-xl font-bold text-pink-400 mb-2">AeroSys HUD v0.4</h2>
                                <p className="text-sm text-gray-400 mb-3">Visual Improvements</p>
                                <div className="space-y-2 text-gray-300">
                                    <p className="font-bold text-white mb-2">💎 UI Enhancements:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Implemented glassmorphism design language</li>
                                        <li>Added neon blue/purple color scheme</li>
                                        <li>Added smooth animations with Framer Motion</li>
                                        <li>Improved typography with Inter font</li>
                                        <li>Added gradient backgrounds</li>
                                        <li>Improved card layouts and spacing</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Version 0.3 */}
                            <div className="glass-panel p-6">
                                <h2 className="text-xl font-bold text-orange-400 mb-2">AeroSys HUD v0.3</h2>
                                <p className="text-sm text-gray-400 mb-3">Storage Expansion</p>
                                <div className="space-y-2 text-gray-300">
                                    <p className="font-bold text-white mb-2">💾 Storage Updates:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Added support for all storage drives (not just C:)</li>
                                        <li>Display all mounted partitions</li>
                                        <li>Show individual disk usage percentages</li>
                                        <li>Added disk type detection (HDD/SSD/NVMe)</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Version 0.2 */}
                            <div className="glass-panel p-6">
                                <h2 className="text-xl font-bold text-cyan-400 mb-2">AeroSys HUD v0.2</h2>
                                <p className="text-sm text-gray-400 mb-3">Enhanced Data Fetching</p>
                                <div className="space-y-2 text-gray-300">
                                    <p className="font-bold text-white mb-2">📈 Improvements:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Improved CPU usage accuracy</li>
                                        <li>Enhanced GPU utilization tracking</li>
                                        <li>Better RAM usage calculations</li>
                                        <li>More accurate storage space reporting</li>
                                        <li>Added per-core CPU usage display</li>
                                        <li>Added VRAM usage for GPU</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Version 0.1 */}
                            <div className="glass-panel p-6">
                                <h2 className="text-xl font-bold text-teal-400 mb-2">AeroSys HUD v0.1</h2>
                                <p className="text-sm text-gray-400 mb-3">Initial Electron Release</p>
                                <div className="space-y-2 text-gray-300">
                                    <p className="font-bold text-white mb-2">🚀 First Release:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Migrated from Python to Electron + React</li>
                                        <li>Basic dashboard with system overview</li>
                                        <li>CPU usage monitoring</li>
                                        <li>GPU basic stats</li>
                                        <li>RAM usage display</li>
                                        <li>C: drive storage monitoring</li>
                                        <li>Basic changelog tracking</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Alpha V2 */}
                            <div className="glass-panel p-6 bg-gray-800/30">
                                <h2 className="text-xl font-bold text-gray-300 mb-2">AeroSys Alpha V2</h2>
                                <p className="text-sm text-gray-400 mb-3">Python Prototype Enhanced</p>
                                <div className="space-y-2 text-gray-300">
                                    <p className="font-bold text-white mb-2">🔧 Prototype Improvements:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Enhanced Python prototype with PyQt5</li>
                                        <li>Improved UI responsiveness</li>
                                        <li>Added more system metrics</li>
                                        <li>Better error handling</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Alpha V1 */}
                            <div className="glass-panel p-6 bg-gray-800/30">
                                <h2 className="text-xl font-bold text-gray-300 mb-2">AeroSys Alpha V1</h2>
                                <p className="text-sm text-gray-400 mb-3">Python Prototype</p>
                                <div className="space-y-2 text-gray-300">
                                    <p className="font-bold text-white mb-2">🌱 Initial Concept:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>First prototype built with Python</li>
                                        <li>Basic system monitoring capabilities</li>
                                        <li>Simple PyQt5 interface</li>
                                        <li>Proof of concept for system stats display</li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ABOUT TAB */}
                    {activeTab === 'about' && (
                        <motion.div key="about" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            {/* Header */}
                            <div className="glass-panel p-8 text-center bg-gradient-to-br from-neon-blue/10 via-neon-purple/10 to-transparent">
                                <h1 className="text-5xl font-bold neon-text mb-2">AEROSYS HUD</h1>
                                <p className="text-xl text-gray-300 mb-4">Advanced System Monitoring Suite</p>
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                                    <Globe size={16} className="text-neon-blue" />
                                    <a href="https://github.com/Raziv-dvx" target="_blank" rel="noopener noreferrer" className="hover:text-neon-blue transition-colors">github.com/Raziv-dvx</a>
                                </div>
                            </div>

                            {/* About the Project */}
                            <div className="glass-panel p-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Activity className="text-neon-blue" /> About This Project</h2>
                                <div className="space-y-3 text-gray-300">
                                    <p className="mt-4">This software monitors and displays comprehensive system information in a beautiful, detailed way. I created this application because I wanted a visually stunning system monitor and was bored of constantly checking the Windows Task Manager. AeroSys HUD provides real-time insights into your computer's performance with a premium, modern interface.</p>
                                </div>
                            </div>

                            {/* Technology Stack */}
                            <div className="glass-panel p-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Layers className="text-neon-purple" /> Technology Stack</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <h3 className="font-bold text-neon-blue mb-2">Frontend</h3>
                                        <ul className="text-sm text-gray-300 space-y-1">
                                            <li>• <strong>React 19</strong> - UI framework for building interactive interfaces</li>
                                            <li>• <strong>Vite</strong> - Fast build tool and dev server</li>
                                            <li>• <strong>Framer Motion</strong> - Smooth animations and transitions</li>
                                            <li>• <strong>Tailwind CSS</strong> - Utility-first CSS framework for styling</li>
                                            <li>• <strong>Lucide React</strong> - Beautiful icon library</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <h3 className="font-bold text-green-400 mb-2">Backend & Desktop</h3>
                                        <ul className="text-sm text-gray-300 space-y-1">
                                            <li>• <strong>Electron</strong> - Cross-platform desktop app framework</li>
                                            <li>• <strong>Node.js</strong> - JavaScript runtime for system operations</li>
                                            <li>• <strong>systeminformation</strong> - Hardware & OS data collection</li>
                                            <li>• <strong>active-win</strong> - Active window tracking</li>
                                            <li>• <strong>loudness</strong> - Audio volume monitoring</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-neon-blue/10 border border-neon-blue/30 rounded-lg">
                                    <p className="text-sm text-gray-300"><strong className="text-white">Why these technologies?</strong> React provides a component-based architecture for maintainable code. Electron allows the app to run as a native desktop application with access to system-level APIs. The systeminformation library provides cross-platform hardware monitoring capabilities, while Framer Motion ensures smooth, premium animations that make the interface feel alive and responsive.</p>
                                </div>
                            </div>

                            {/* Monitored Metrics */}
                            <div className="glass-panel p-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><BarChart2 className="text-green-400" /> Monitored Metrics</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <h3 className="font-bold text-neon-blue mb-2 flex items-center gap-2"><Cpu size={18} /> CPU</h3>
                                        <ul className="text-xs text-gray-300 space-y-1">
                                            <li>• Current load percentage</li>
                                            <li>• Per-core usage</li>
                                            <li>• Clock speed (GHz)</li>
                                            <li>• Temperature monitoring</li>
                                            <li>• Load averages (1m, 5m, 15m)</li>
                                            <li>• Throttling detection</li>
                                            <li>• Power consumption (estimated)</li>
                                            <li>• Package Power Tracking (PPT)</li>
                                            <li>• Voltage levels</li>
                                            <li>• Fan speed (RPM)</li>
                                            <li>• Cache sizes (L1, L2, L3)</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <h3 className="font-bold text-neon-purple mb-2 flex items-center gap-2"><Server size={18} /> Memory & Storage</h3>
                                        <ul className="text-xs text-gray-300 space-y-1">
                                            <li>• RAM usage (active/free/total)</li>
                                            <li>• Memory channels (Dual/Quad)</li>
                                            <li>• Max capacity</li>
                                            <li>• Swap usage</li>
                                            <li>• Per-stick information</li>
                                            <li>• Disk usage per partition</li>
                                            <li>• Read/Write speeds (MB/s)</li>
                                            <li>• IOPS (I/O operations)</li>
                                            <li>• SMART health status</li>
                                            <li>• Total Bytes Written (TBW)</li>
                                            <li>• Disk temperature</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <h3 className="font-bold text-green-400 mb-2 flex items-center gap-2"><Monitor size={18} /> GPU</h3>
                                        <ul className="text-xs text-gray-300 space-y-1">
                                            <li>• GPU utilization percentage</li>
                                            <li>• VRAM usage (used/total)</li>
                                            <li>• Core temperature</li>
                                            <li>• Hotspot temperature</li>
                                            <li>• Core clock speed (MHz)</li>
                                            <li>• Memory clock speed (MHz)</li>
                                            <li>• Power draw (Watts)</li>
                                            <li>• Fan speed (% and RPM)</li>
                                            <li>• Throttling status</li>
                                            <li>• 3D load percentage</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <h3 className="font-bold text-blue-400 mb-2 flex items-center gap-2"><Wifi size={18} /> Network</h3>
                                        <ul className="text-xs text-gray-300 space-y-1">
                                            <li>• Public IP address</li>
                                            <li>• Local IP address</li>
                                            <li>• Gateway ping (ms)</li>
                                            <li>• Internet ping (Google DNS)</li>
                                            <li>• Wi-Fi signal strength</li>
                                            <li>• Download/Upload speeds</li>
                                            <li>• Daily data usage</li>
                                            <li>• Monthly data usage</li>
                                            <li>• Per-adapter statistics</li>
                                            <li>• Total RX/TX bytes</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <h3 className="font-bold text-yellow-400 mb-2 flex items-center gap-2"><Battery size={18} /> Power</h3>
                                        <ul className="text-xs text-gray-300 space-y-1">
                                            <li>• Battery percentage</li>
                                            <li>• Charging status</li>
                                            <li>• Time remaining</li>
                                            <li>• Wear level</li>
                                            <li>• Cycle count</li>
                                            <li>• Voltage</li>
                                            <li>• Charge rate (Watts)</li>
                                            <li>• Designed capacity (mWh)</li>
                                            <li>• Current capacity (mWh)</li>
                                            <li>• Total system power draw</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <h3 className="font-bold text-red-400 mb-2 flex items-center gap-2"><Thermometer size={18} /> Additional</h3>
                                        <ul className="text-xs text-gray-300 space-y-1">
                                            <li>• ACPI temperature zones</li>
                                            <li>• Motherboard temperature</li>
                                            <li>• System fan speeds</li>
                                            <li>• Active window name</li>
                                            <li>• Audio output volume</li>
                                            <li>• Screen brightness</li>
                                            <li>• OS information</li>
                                            <li>• System uptime</li>
                                            <li>• System health score</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* How Data is Fetched */}
                            <div className="glass-panel p-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Zap className="text-yellow-400" /> How Data is Fetched</h2>
                                <div className="space-y-4">
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <h3 className="font-bold text-neon-blue mb-2">Multi-Tiered Polling System</h3>
                                        <p className="text-sm text-gray-300 mb-3">AeroSys uses a sophisticated staggered polling architecture to efficiently gather system data without overwhelming your CPU:</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="bg-neon-blue/10 p-3 rounded border border-neon-blue/30">
                                                <div className="font-bold text-neon-blue text-sm">Fast Loop (1000ms)</div>
                                                <div className="text-xs text-gray-400 mt-1">CPU load, RAM usage, Network stats</div>
                                            </div>
                                            <div className="bg-neon-purple/10 p-3 rounded border border-neon-purple/30">
                                                <div className="font-bold text-neon-purple text-sm">Medium Loop (2000ms)</div>
                                                <div className="text-xs text-gray-400 mt-1">GPU metrics, Temperatures, Disk I/O</div>
                                            </div>
                                            <div className="bg-green-400/10 p-3 rounded border border-green-400/30">
                                                <div className="font-bold text-green-400 text-sm">System Loop (5000ms)</div>
                                                <div className="text-xs text-gray-400 mt-1">Active window, Audio volume, Brightness</div>
                                            </div>
                                            <div className="bg-yellow-400/10 p-3 rounded border border-yellow-400/30">
                                                <div className="font-bold text-yellow-400 text-sm">Slow Loop (10000ms)</div>
                                                <div className="text-xs text-gray-400 mt-1">Storage, Battery, SMART data, Thermals</div>
                                            </div>
                                            <div className="bg-blue-400/10 p-3 rounded border border-blue-400/30">
                                                <div className="font-bold text-blue-400 text-sm">Network Loop (30000ms)</div>
                                                <div className="text-xs text-gray-400 mt-1">Public IP, Ping tests, Wi-Fi signal</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <h3 className="font-bold text-neon-purple mb-2">Data Sources</h3>
                                        <ul className="text-sm text-gray-300 space-y-1">
                                            <li>• <strong>systeminformation</strong> library - Cross-platform hardware queries via OS APIs</li>
                                            <li>• <strong>Windows Management Instrumentation (WMI)</strong> - Windows-specific metrics</li>
                                            <li>• <strong>active-win</strong> - Native OS calls for active window tracking</li>
                                            <li>• <strong>loudness</strong> - System audio API integration</li>
                                            <li>• <strong>External APIs</strong> - ipify.org for public IP detection</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* System Requirements */}
                            <div className="glass-panel p-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Shield className="text-red-400" /> System Requirements</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <h3 className="font-bold text-green-400 mb-2">Minimum Requirements</h3>
                                        <ul className="text-sm text-gray-300 space-y-1">
                                            <li>• <strong>OS:</strong> Windows 10 or Windows 11</li>
                                            <li>• <strong>CPU:</strong> Dual-core processor (2 GHz+)</li>
                                            <li>• <strong>RAM:</strong> 2 GB available memory</li>
                                            <li>• <strong>Storage:</strong> 200 MB free disk space</li>
                                            <li>• <strong>Display:</strong> 1280x720 resolution</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <h3 className="font-bold text-neon-blue mb-2">Recommended</h3>
                                        <ul className="text-sm text-gray-300 space-y-1">
                                            <li>• <strong>OS:</strong> Windows 11 (latest updates)</li>
                                            <li>• <strong>CPU:</strong> Quad-core processor (3 GHz+)</li>
                                            <li>• <strong>RAM:</strong> 4 GB available memory</li>
                                            <li>• <strong>Storage:</strong> 500 MB free disk space</li>
                                            <li>• <strong>Display:</strong> 1920x1080 resolution or higher</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                                    <p className="text-sm text-gray-300"><strong className="text-yellow-400">Note:</strong> This application is optimized for Windows 10 and Windows 11 only. Some features may not work correctly on older Windows versions or other operating systems.</p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="glass-panel p-4 text-center">
                                <p className="text-sm text-gray-400">Made with ❤️ by <a href="https://github.com/Raziv-dvx" target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:underline">Raziv-dvx</a></p>
                                <p className="text-xs text-gray-500 mt-1">Version 1.1.0 • © 2025</p>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </motion.div >
    );
}

// Helper Component for Details (Memoized to prevent unnecessary re-renders)
const DetailBox = React.memo(({ label, value, color = "text-white" }) => {
    return (
        <div className="bg-white/5 p-3 rounded-lg">
            <div className="text-xs text-gray-400 uppercase">{label}</div>
            <div className={clsx("font-bold text-lg truncate", color)}>{value}</div>
        </div>
    );
});

// Helper Component for Stat Cards (Memoized to prevent unnecessary re-renders)
const StatCard = React.memo(({ title, value, sub, color, icon, progress }) => {
    return (
        <div className={clsx("glass-panel p-6 relative overflow-hidden group transition-colors", `hover:border-${color}/50`)}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-gray-400 text-sm uppercase tracking-wider">{title}</h2>
                    <div className="text-4xl font-bold mt-1">{value}</div>
                </div>
                <div className={`text-${color} opacity-50 group-hover:opacity-100 transition-opacity`}>
                    {icon}
                </div>
            </div>
            <div className="w-full bg-gray-700/50 h-2 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full bg-${color} shadow-[0_0_10px_rgba(var(--color-${color}),0.5)]`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                />
            </div>
            <div className="mt-4 text-xs text-gray-500">
                {sub}
            </div>
        </div>
    );
});
