import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Server, Monitor, Shield, Clock } from 'lucide-react';
import { StatCard } from '../StatCard';

const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

export function OverviewTab({ stats }) {
    return (
        <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    );
}
