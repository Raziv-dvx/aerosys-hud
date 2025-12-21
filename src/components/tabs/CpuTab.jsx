import React from 'react';
import { motion } from 'framer-motion';
import { DetailBox } from '../DetailBox';

const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

export function CpuTab({ stats }) {
    if (!stats.cpu) return null;

    return (
        <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div className="glass-panel p-6">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">{stats.cpu.brand}</h2>
                        <div className="text-sm text-gray-400">{stats.cpu.manufacturer} - {stats.cpu.socket} Socket</div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-neon-blue">{stats.cpu.speed} GHz</div>
                        <div className="text-xs text-gray-500">Current Speed</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <DetailBox label="Cores / Threads" value={`${stats.cpu.physicalCores} / ${stats.cpu.cores}`} />
                    <DetailBox label="Voltage" value={`${stats.cpu.voltage || 1.2} V`} />
                    <DetailBox label="Package Temp" value={`${stats.cpu.main || 'N/A'}°C`} color={stats.cpu.main > 80 ? 'text-red-500' : 'text-green-400'} />
                    <DetailBox label="Fan Speed" value={`${stats.cpu.fanSpeed || 0} RPM`} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <DetailBox label="Power (Est.)" value={`~${stats.cpu.power || 0} W`} color="text-yellow-400" />
                    <DetailBox label="Throttling" value={stats.cpu.throttling ? "YES" : "NO"} color={stats.cpu.throttling ? "text-red-500" : "text-green-400"} />
                    <DetailBox label="Governor" value={stats.cpu.governor || 'Performance'} />
                    <DetailBox label="Socket" value={stats.cpu.socket || 'N/A'} />
                </div>

                <div className="mt-6 glass-panel p-4 bg-white/5 border-none">
                    <h3 className="text-xs text-gray-400 uppercase mb-2">Load Averages</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-neon-blue">{stats.cpu.loadAvg?.['1m'] || 0}%</div>
                            <div className="text-[10px] text-gray-500">1 Min</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-neon-purple">{stats.cpu.loadAvg?.['5m'] || 0}%</div>
                            <div className="text-[10px] text-gray-500">5 Min</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-400">{stats.cpu.loadAvg?.['15m'] || 0}%</div>
                            <div className="text-[10px] text-gray-500">15 Min</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel p-6">
                <h3 className="text-sm text-gray-400 uppercase mb-4 tracking-widest">Per-Core Usage</h3>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {Array.isArray(stats.cpu.cpus) && stats.cpu.cpus.map((load, i) => (
                        <div key={i} className="text-center group">
                            <div className="h-24 bg-gray-800/50 rounded-2xl overflow-hidden relative mx-auto w-8 border border-white/5">
                                <motion.div
                                    className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-neon-blue to-neon-purple"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${load.load}%` }}
                                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                />
                            </div>
                            <div className="mt-2 text-[10px] text-gray-500 font-bold group-hover:text-neon-blue transition-colors">#{i}</div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
