import React from 'react';
import { motion } from 'framer-motion';
import { Server, HardDrive } from 'lucide-react';
import { DetailBox } from '../DetailBox';

const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

export function MemoryTab({ stats }) {
    return (
        <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div className="glass-panel p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <div className="p-2 bg-neon-purple/10 rounded-xl border border-neon-purple/20">
                        <Server className="text-neon-purple" size={20} />
                    </div>
                    RAM Usage
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-gray-400">Used</span>
                            <span className="text-neon-purple">{((stats.mem?.active || 0) / 1024 ** 3).toFixed(1)} GB</span>
                        </div>
                        <div className="w-full h-3 bg-gray-800/50 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-neon-purple to-purple-400 rounded-full shadow-[0_0_10px_rgba(188,19,254,0.4)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${((stats.mem?.active || 0) / (stats.mem?.total || 1)) * 100}%` }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 font-medium tracking-tight">
                            <span>Free: {((stats.mem?.free || 0) / 1024 ** 3).toFixed(1)} GB</span>
                            <span>Total: {((stats.mem?.total || 0) / 1024 ** 3).toFixed(0)} GB</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <DetailBox label="Max Capacity" value={`${stats.mem?.maxCapacity || 'N/A'} GB`} />
                        <DetailBox label="Channels" value={stats.mem?.channels || 'Unknown'} />
                        <DetailBox label="Swap Used" value={`${((stats.mem?.swapused || 0) / 1024 ** 3).toFixed(1)} GB`} />
                        <DetailBox label="L3 Cache" value={`${stats.cpu?.cache?.l3 || 0} KB`} color="text-green-400" />
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Array.isArray(stats.mem?.layout) && stats.mem.layout.map((stick, i) => (
                        <div key={i} className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/5">
                            <span className="text-xs text-gray-400 font-bold tracking-widest uppercase">Slot {i + 1}</span>
                            <span className="text-xs font-medium">{stick.size / 1024 ** 3}GB {stick.type} {stick.clockSpeed}MHz</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-panel p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <div className="p-2 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
                        <HardDrive className="text-yellow-400" size={20} />
                    </div>
                    Storage
                </h2>
                <div className="space-y-4">
                    {Array.isArray(stats.storage?.fs) && stats.storage.fs.map((disk, i) => {
                        const ioData = stats.storage?.io?.[i] || {};
                        return (
                            <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                                <div className="flex justify-between mb-2 items-center">
                                    <span className="font-bold flex items-center gap-2">
                                        {disk.fs}
                                        <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-gray-400 uppercase">{disk.type}</span>
                                    </span>
                                    <span className="text-sm font-bold text-yellow-400">{Math.round(disk.use)}% Used</span>
                                </div>
                                <div className="w-full h-2 bg-gray-800/50 rounded-full overflow-hidden mb-3 border border-white/5">
                                    <motion.div
                                        className="h-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${disk.use}%` }}
                                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <div className="bg-white/5 p-2 rounded-xl text-center border border-white/5">
                                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Read</div>
                                        <div className="text-sm font-bold text-blue-400">{ioData.rSec || 0} MB/s</div>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded-xl text-center border border-white/5">
                                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Write</div>
                                        <div className="text-sm font-bold text-purple-400">{ioData.wSec || 0} MB/s</div>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded-xl text-center border border-white/5">
                                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Health</div>
                                        <div className="text-sm font-bold text-green-400">{ioData.smart?.health || 100}%</div>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded-xl text-center border border-white/5">
                                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Temp</div>
                                        <div className="text-sm font-bold text-orange-400">{ioData.temperature || 'N/A'}°C</div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </motion.div>
    );
}
