import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Shield, Zap, Clock, Eye, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

export function SettingsTab() {
    const [settings, setSettings] = useState(null);
    const [savedSettings, setSavedSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updateInfo, setUpdateInfo] = useState(null);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        const cleanup = window.electron.on('update-available', (info) => {
            setUpdateInfo(info);
            setChecking(false);
        });
        return cleanup;
    }, []);

    useEffect(() => {
        window.electron.getSettings().then(data => {
            setSettings(data);
            setSavedSettings(JSON.parse(JSON.stringify(data))); // Deep clone
            setLoading(false);
        });
    }, []);

    const hasRestartChanges = useMemo(() => {
        if (!settings || !savedSettings) return false;

        // Visibility tabs check
        const visibleEqual = JSON.stringify(settings.visibleTabs?.sort()) === JSON.stringify(savedSettings.visibleTabs?.sort());
        const showAllEqual = settings.showAllTabs === savedSettings.showAllTabs;

        return !visibleEqual || !showAllEqual;
    }, [settings, savedSettings]);

    const updateSetting = (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);

        // If it's a non-restart setting, save immediately
        if (!newSettings.visibleTabs && newSettings.showAllTabs === undefined) {
            window.electron.updateSettings(newSettings);
            // Also update savedSettings for non-restart items to avoid false positives in hasRestartChanges
            setSavedSettings(prev => ({ ...prev, ...newSettings }));
        }
    };

    const handleApplyRestart = () => {
        window.electron.updateSettings(settings);
        if (window.Dashboard?.handleSoftRestart) {
            window.Dashboard.handleSoftRestart();
            setSavedSettings(JSON.parse(JSON.stringify(settings)));
        } else {
            // Fallback to relaunch if something is wrong with the bridge
            window.electron.relaunchApp();
        }
    };

    if (loading || !settings) return null;

    const PRESETS = [
        { id: 'low', label: 'Power Saver', desc: 'Minimal updates, lowest resource footprint', color: 'text-green-400' },
        { id: 'medium', label: 'Balanced', desc: 'Default performance and core accuracy', color: 'text-neon-blue' },
        { id: 'high', label: 'Extreme', desc: 'High frequency monitoring (High RAM usage)', color: 'text-neon-purple' },
        { id: 'realtime', label: 'Real-Time', desc: 'Highest precision detail (Maximum RAM usage)', color: 'text-red-500' }
    ];

    const ALL_TABS = [
        { id: 'overview', label: 'Overview' },
        { id: 'cpu', label: 'CPU' },
        { id: 'gpu', label: 'GPU' },
        { id: 'memory', label: 'Memory' },
        { id: 'network', label: 'Network' },
        { id: 'power', label: 'Power' },
        { id: 'changelog', label: 'History' },
        { id: 'about', label: 'About' }
    ];

    return (
        <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6 pb-24">
            {/* Restart Warning Banner */}
            <AnimatePresence>
                {hasRestartChanges && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg"
                    >
                        <div className="bg-neon-blue/20 backdrop-blur-xl border border-neon-blue/40 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-neon-blue">
                                <RefreshCw className="animate-spin-slow" size={20} />
                                <div>
                                    <div className="text-xs font-black uppercase tracking-widest leading-none mb-1">Restart Required</div>
                                    <div className="text-[10px] text-white/60 font-medium uppercase tracking-tighter italic">Apply visibility & memory optimizations</div>
                                </div>
                            </div>
                            <button
                                onClick={handleApplyRestart}
                                className="px-6 py-2 bg-neon-blue text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white transition-colors"
                            >
                                Apply & Restart
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="glass-panel p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                    <RefreshCw className={clsx("text-neon-purple", checking && "animate-spin")} size={24} />
                    Software Updates
                </h2>
                <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden">
                    {updateInfo ? (
                        <>
                            <div className="absolute top-0 right-0 p-4">
                                <span className="bg-neon-purple/20 text-neon-purple text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-neon-purple/30 animate-pulse">
                                    New Version Available
                                </span>
                            </div>
                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <div>
                                    <div className="text-2xl font-black italic tracking-tighter text-white uppercase">
                                        v{updateInfo.latest} <span className="text-neon-purple opacity-50 ml-2">Release</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                        Current version: v{updateInfo.current}
                                    </p>
                                </div>
                                <div className="bg-black/20 p-4 rounded-xl border border-white/5 max-h-32 overflow-y-auto custom-scrollbar">
                                    <div className="text-[8px] text-neon-purple font-bold uppercase tracking-widest mb-2 italic">Release Highlights:</div>
                                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed whitespace-pre-wrap">
                                        {updateInfo.changelog || "Performance optimizations and system stability improvements."}
                                    </p>
                                </div>
                                <button
                                    onClick={() => window.open('https://github.com/Raziv-dvx/aerosys-hud-pro/releases')}
                                    className="w-full md:w-auto px-10 py-3 bg-neon-purple text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-white transition-all shadow-[0_0_30px_rgba(191,0,255,0.2)]"
                                >
                                    Download Update
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center md:items-start gap-4 flex-1">
                            <div className="text-center md:text-left">
                                <div className="text-lg font-black italic tracking-tighter text-white/50 uppercase leading-tight">
                                    System is up to date
                                </div>
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">
                                    Running v1.2.0 • Last checked: {new Date().toLocaleTimeString()}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setChecking(true);
                                    window.electron.checkUpdates();
                                }}
                                disabled={checking}
                                className="px-8 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-2xl transition-all text-xs font-bold uppercase tracking-widest"
                            >
                                {checking ? "Scanning System..." : "Check for Patches"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-panel p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                    <Zap className="text-yellow-400" size={24} />
                    Performance Profiles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            onClick={() => updateSetting({ performancePreset: preset.id })}
                            className={clsx(
                                "p-4 rounded-2xl border transition-all text-left group",
                                settings.performancePreset === preset.id
                                    ? "bg-white/10 border-white/20 shadow-lg"
                                    : "bg-white/5 border-white/5 hover:bg-white/10"
                            )}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className={clsx("font-bold uppercase tracking-widest text-xs", preset.color)}>
                                    {preset.label}
                                </span>
                                {settings.performancePreset === preset.id && (
                                    <Shield size={16} className="text-white" />
                                )}
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{preset.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-panel p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                    <Eye className="text-neon-blue" size={24} />
                    Interface Customization
                </h2>
                <div className="space-y-4">
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-4 mb-4">
                        <AlertTriangle className="text-orange-400 shrink-0" size={20} />
                        <div className="text-[9px] text-orange-200/70 font-bold uppercase tracking-widest italic leading-tight">
                            Note: Hiding modules completely disables their data polling to save system resources.
                            A restart is required to safely unload these assets.
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mb-3">Visible Modules</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {ALL_TABS.map(tab => {
                                const isVisible = settings.visibleTabs?.includes(tab.id);
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            const visible = settings.visibleTabs || [];
                                            const next = visible.includes(tab.id)
                                                ? visible.filter(id => id !== tab.id)
                                                : [...visible, tab.id];
                                            updateSetting({ visibleTabs: next });
                                        }}
                                        className={clsx(
                                            "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                            isVisible
                                                ? "bg-neon-blue/20 border-neon-blue/40 text-white shadow-[0_0_15px_rgba(0,243,255,0.1)]"
                                                : "bg-white/5 border-white/5 text-gray-500 opacity-60"
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div>
                            <div className="font-bold text-white">Show All Modules</div>
                            <div className="text-[10px] text-gray-500 uppercase font-black tracking-tight">Override visibility filters</div>
                        </div>
                        <button
                            onClick={() => updateSetting({ showAllTabs: !settings.showAllTabs })}
                            className={clsx(
                                "w-12 h-6 rounded-full transition-all relative border border-white/10",
                                settings.showAllTabs ? "bg-neon-blue" : "bg-gray-800"
                            )}
                        >
                            <div className={clsx(
                                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md",
                                settings.showAllTabs ? "right-1" : "left-1"
                            )} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div>
                            <div className="font-bold text-white">Start on Startup</div>
                            <div className="text-[10px] text-gray-500 uppercase font-black tracking-tight">Launch app automatically</div>
                        </div>
                        <button
                            onClick={() => updateSetting({ startupEnabled: !settings.startupEnabled })}
                            className={clsx(
                                "w-12 h-6 rounded-full transition-all relative border border-white/10",
                                settings.startupEnabled ? "bg-neon-blue" : "bg-gray-800"
                            )}
                        >
                            <div className={clsx(
                                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md",
                                settings.startupEnabled ? "right-1" : "left-1"
                            )} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="glass-panel p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                    <Clock className="text-neon-purple" size={24} />
                    Refresh Frequencies (ms)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(settings.refreshRates || {}).map(([key, value]) => {
                        const labels = {
                            fast: 'Fast Refresh (High RAM usage)',
                            medium: 'Medium Refresh (Balanced)',
                            slow: 'Slow Refresh (Lower RAM)',
                            network: 'Network Data Sync',
                            system: 'System Core Monitoring'
                        };
                        return (
                            <div key={key} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">
                                    {labels[key] || key}
                                </label>
                                <div className="text-[8px] text-gray-600 font-bold uppercase mb-2">Interval in MS</div>
                                <input
                                    type="number"
                                    value={value}
                                    onChange={(e) => {
                                        const nextRates = { ...settings.refreshRates, [key]: parseInt(e.target.value) || 0 };
                                        updateSetting({ refreshRates: nextRates, performancePreset: 'custom' });
                                    }}
                                    className="bg-black/20 w-full px-2 py-1 rounded text-neon-blue font-bold text-center outline-none border border-white/5 focus:border-neon-blue transition-colors"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="p-6 text-center">
                <button
                    onClick={() => {
                        if (window.confirm("Restore factory settings?")) {
                            window.electron.resetSettings().then(newData => {
                                setSettings(newData);
                                window.location.reload();
                            });
                        }
                    }}
                    className="flex items-center gap-2 mx-auto px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-full transition-all group"
                >
                    <Trash2 size={16} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Reset Factory Defaults</span>
                </button>
            </div>
        </motion.div>
    );
}
