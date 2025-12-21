import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { useSystemStats } from '../hooks/useSystemStats';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Settings as SettingsIcon, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

// Lazy load tabs for better performance and lower RAM usage
const OverviewTab = React.lazy(() => import('./tabs/OverviewTab').then(m => ({ default: m.OverviewTab })));
const CpuTab = React.lazy(() => import('./tabs/CpuTab').then(m => ({ default: m.CpuTab })));
const GpuTab = React.lazy(() => import('./tabs/GpuTab').then(m => ({ default: m.GpuTab })));
const MemoryTab = React.lazy(() => import('./tabs/MemoryTab').then(m => ({ default: m.MemoryTab })));
const NetworkTab = React.lazy(() => import('./tabs/NetworkTab').then(m => ({ default: m.NetworkTab })));
const PowerTab = React.lazy(() => import('./tabs/PowerTab').then(m => ({ default: m.PowerTab })));
const ChangelogTab = React.lazy(() => import('./tabs/ChangelogTab').then(m => ({ default: m.ChangelogTab })));
const AboutTab = React.lazy(() => import('./tabs/AboutTab').then(m => ({ default: m.AboutTab })));
const SettingsTab = React.lazy(() => import('./tabs/SettingsTab').then(m => ({ default: m.SettingsTab })));

export default function Dashboard() {
    const { stats } = useSystemStats();
    const [activeTab, setActiveTab] = useState('overview');
    const [settings, setSettings] = useState(null);
    const [isRestarting, setIsRestarting] = useState(false);
    const [updateAvailable, setUpdateAvailable] = useState(null);

    useEffect(() => {
        const cleanup = window.electron.on('update-available', (info) => {
            setUpdateAvailable(info);
        });
        return cleanup;
    }, []);

    useEffect(() => {
        window.electron.getSettings().then(setSettings);
    }, []);

    // Listen for soft restart trigger from SettingsTab via window event if needed
    // but easier to handle it directly in Dashboard if we wrap the logic.
    const handleSoftRestart = () => {
        setIsRestarting(true);
        // Step 1: Tell Electron to update settings and restart polling
        window.electron.restartPolling();

        // Step 2: Simulate loading/re-sync
        setTimeout(() => {
            window.electron.getSettings().then(newSettings => {
                setSettings(newSettings);
                setIsRestarting(false);
            });
        }, 1500);
    };

    // Expose this to window for child components
    useEffect(() => {
        window.Dashboard = { handleSoftRestart };
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } }
    };

    const TABS = useMemo(() => {
        const allTabs = [
            { id: 'overview', label: 'Summary' },
            { id: 'cpu', label: 'CPU' },
            { id: 'gpu', label: 'GPU' },
            { id: 'memory', label: 'RAM' },
            { id: 'network', label: 'WiFi' },
            { id: 'power', label: 'Power' },
            { id: 'changelog', label: 'What\'s New' },
            { id: 'about', label: 'About' },
            { id: 'settings', label: 'Settings', icon: <SettingsIcon size={12} /> }
        ];

        if (!settings) return allTabs.filter(t => ['overview', 'memory', 'network', 'changelog', 'about', 'settings'].includes(t.id));

        if (settings.showAllTabs) return allTabs;

        const visibleIds = settings.visibleTabs || ['overview', 'memory', 'network', 'changelog', 'about'];
        return allTabs.filter(tab => visibleIds.includes(tab.id) || tab.id === 'settings');
    }, [settings]);

    if (!stats) return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-dark-bg text-neon-blue">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-8"
            >
                <Activity size={48} />
            </motion.div>
            <div className="text-sm font-black tracking-[0.5em] uppercase animate-pulse">Initializing Systems</div>
        </div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full h-full flex flex-col text-white overflow-hidden relative bg-zinc-950"
        >
            {/* Aesthetic Overlays */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-blue/10 blur-[120px] rounded-full -z-10 animate-float"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/10 blur-[120px] rounded-full -z-10"></div>

            {/* Header */}
            <header className="flex justify-between items-center px-8 py-6 border-b border-white/5 bg-black/20 backdrop-blur-md draggable z-50">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-neon-blue/10 rounded-xl border border-neon-blue/20">
                        <Activity className="text-neon-blue" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black italic tracking-tighter neon-text leading-none">AEROSYS <span className="text-gray-500">HUD</span></h1>
                        <div className="text-[9px] text-gray-400 font-bold tracking-[0.3em] uppercase mt-1">System Intelligence v1.2.0</div>
                    </div>
                </div>

                <AnimatePresence>
                    {updateAvailable && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            className="absolute top-24 left-1/2 -translate-x-1/2 z-[101] w-full max-w-sm"
                        >
                            <div className="bg-neon-purple/20 backdrop-blur-2xl border border-neon-purple/40 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-neon-purple/20 rounded-lg">
                                        <RefreshCw className="text-neon-purple animate-spin-slow" size={16} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-white">Update Available</div>
                                        <div className="text-[8px] text-neon-purple font-bold uppercase tracking-tighter italic">Version {updateAvailable.latest} detected</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setUpdateAvailable(null)}
                                        className="text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors px-2"
                                    >
                                        Ignore
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveTab('settings');
                                            setUpdateAvailable(null);
                                        }}
                                        className="bg-neon-purple text-black font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-lg hover:bg-white transition-colors"
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 no-drag overflow-x-auto max-w-[60%] scrollbar-hide">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "relative px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2",
                                activeTab === tab.id
                                    ? "text-white"
                                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-neon-blue/20 rounded-xl border border-neon-blue/30 -z-10"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-4 no-drag">
                    <div className="flex gap-2">
                        <button onClick={() => window.electron.windowControl('minimize')} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors text-gray-400">
                            <div className="w-3 h-0.5 bg-current" />
                        </button>
                        <button onClick={() => window.electron.windowControl('close')} className="w-8 h-8 flex items-center justify-center hover:bg-red-500/80 hover:text-white rounded-full transition-all text-gray-400">
                            <span className="font-bold text-sm">✕</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
                <AnimatePresence mode="wait">
                    <Suspense fallback={
                        <div className="w-full h-full flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-xs font-black tracking-[0.2em] text-gray-600 uppercase"
                            >
                                Synchronizing Data...
                            </motion.div>
                        </div>
                    }>
                        {/* Dynamic Tabs - Rendered only when active to save RAM */}
                        {activeTab === 'overview' && <OverviewTab key="overview" stats={stats} />}
                        {activeTab === 'cpu' && <CpuTab key="cpu" stats={stats} />}
                        {activeTab === 'gpu' && <GpuTab key="gpu" stats={stats} />}
                        {activeTab === 'memory' && <MemoryTab key="memory" stats={stats} />}
                        {activeTab === 'network' && <NetworkTab key="network" stats={stats} />}
                        {activeTab === 'power' && <PowerTab key="power" stats={stats} />}

                        {/* Static Tabs - Stay in memory once loaded to prevent Flickering */}
                        <div className={activeTab === 'changelog' ? "block" : "hidden"}>
                            <ChangelogTab key="changelog" />
                        </div>
                        <div className={activeTab === 'about' ? "block" : "hidden"}>
                            <AboutTab key="about" />
                        </div>
                        <div className={activeTab === 'settings' ? "block" : "hidden"}>
                            <SettingsTab key="settings" />
                        </div>
                    </Suspense>
                </AnimatePresence>
            </main>

            {/* Restart Overlay */}
            <AnimatePresence>
                {isRestarting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-zinc-950/80 backdrop-blur-2xl flex flex-col items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center space-y-8 max-w-md w-full px-8"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="w-24 h-24 mx-auto rounded-full border-2 border-neon-blue/20 border-t-neon-blue shadow-[0_0_30px_rgba(0,243,255,0.2)]"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Activity className="text-neon-blue animate-pulse" size={32} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-black italic tracking-tighter neon-text uppercase">Optimizing Resources</h2>
                                <p className="text-[10px] text-gray-500 font-bold tracking-[0.3em] uppercase">Reconfiguring Core Systems</p>
                            </div>

                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                    className="h-full bg-gradient-to-r from-neon-blue to-neon-purple shadow-[0_0_15px_rgba(0,243,255,0.5)]"
                                />
                            </div>

                            <div className="text-[9px] text-neon-blue/40 font-black tracking-widest uppercase italic">
                                Initializing Module Isolation...
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer className="px-8 py-3 bg-black/40 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest z-50">
                <div className="flex gap-6">
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
                        HUD RAM: <span className="text-white">{stats.hudStats?.memory || 0} MB</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-purple" />
                        HUD CPU: <span className="text-white">{stats.hudStats?.cpu || 0}%</span>
                    </span>
                    <span className="flex items-center gap-2 opacity-50">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                        Preset: <span className="text-gray-300">{settings?.performancePreset || 'Medium'}</span>
                    </span>
                </div>
                <div className="text-neon-blue/50 italic">
                    Aerosys Precision Intelligence
                </div>
            </footer>
        </motion.div >
    );
}
