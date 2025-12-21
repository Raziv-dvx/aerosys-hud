import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Wifi } from 'lucide-react';
import { DetailBox } from '../DetailBox';
import clsx from 'clsx';

const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

export function NetworkTab({ stats }) {
    return (
        <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div className="glass-panel p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <div className="p-2 bg-blue-400/10 rounded-xl border border-blue-400/20">
                        <Globe className="text-blue-400" size={20} />
                    </div>
                    Network Information
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <DetailBox label="Public IP" value={stats.networkInfo?.publicIP || 'Fetching...'} />
                    <DetailBox label="Local IP" value={stats.networkInfo?.localIP || 'N/A'} />
                    <DetailBox label="Ping (Gateway)" value={`${stats.networkInfo?.ping?.gateway || 0} ms`} color="text-green-400" />
                    <DetailBox label="Ping (Google)" value={`${stats.networkInfo?.ping?.google || 0} ms`} color="text-blue-400" />
                </div>
                {stats.networkInfo?.wifiSignal > 0 && (
                    <div className="mt-6">
                        <div className="flex justify-between text-xs text-gray-400 mb-2 font-bold uppercase tracking-widest">
                            <span>Wi-Fi Signal Strength</span>
                            <span>{stats.networkInfo.wifiSignal}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-800/50 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.networkInfo.wifiSignal}%` }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.isArray(stats.network) && stats.network.map((net, i) => (
                    <div key={i} className="glass-panel p-6 hover:bg-white/5 transition-colors border border-white/5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={clsx("p-2 rounded-xl border", net.operstate === 'up' ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20")}>
                                    <Wifi className={net.operstate === 'up' ? "text-green-400" : "text-red-400"} size={20} />
                                </div>
                                <div>
                                    <div className="font-bold truncate max-w-[150px]">{net.iface}</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{net.operstate}</div>
                                </div>
                            </div>
                            <div className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest", net.operstate === 'up' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                                {net.operstate}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Download</div>
                                <div className="text-lg font-bold text-blue-400">{(net.rx_sec / 1024).toFixed(1)} KB/s</div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Upload</div>
                                <div className="text-lg font-bold text-purple-400">{(net.tx_sec / 1024).toFixed(1)} KB/s</div>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">
                            <span>RX: {(net.rx_bytes / 1024 ** 3).toFixed(2)} GB</span>
                            <span>TX: {(net.tx_bytes / 1024 ** 3).toFixed(2)} GB</span>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
