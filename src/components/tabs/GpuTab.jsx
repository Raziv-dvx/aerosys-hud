import React from 'react';
import { motion } from 'framer-motion';
import { Monitor } from 'lucide-react';
import { DetailBox } from '../DetailBox';

const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

export function GpuTab({ stats }) {
    if (!stats.gpu?.controllers) return null;

    return (
        <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            {stats.gpu.controllers.map((gpu, i) => (
                <div key={i} className="glass-panel p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-400/10 rounded-2xl border border-green-400/20">
                                <Monitor className="text-green-400" size={32} />
                            </div>
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
                        <DetailBox label="Hotspot" value={`${gpu.tempHotspot || 'N/A'}°C`} color={gpu.tempHotspot > 90 ? 'text-red-500' : 'text-yellow-400'} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <DetailBox label="Core Clock" value={`${gpu.clockCore || 0} MHz`} />
                        <DetailBox label="Memory Clock" value={`${gpu.clockMem || 0} MHz`} />
                        <DetailBox label="Power Draw" value={`${gpu.powerDraw || 0} W`} color="text-yellow-400" />
                        <DetailBox label="Fan Speed" value={`${gpu.fanSpeed || 0}%`} />
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between text-xs text-gray-400 mb-2 font-bold tracking-widest uppercase">
                            <span>VRAM Usage</span>
                            <span>{Math.round((gpu.memoryUsed / gpu.vram) * 100)}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-800/50 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.4)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${(gpu.memoryUsed / gpu.vram) * 100}%` }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </motion.div>
    );
}
