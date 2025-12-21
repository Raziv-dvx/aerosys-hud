import React from 'react';
import { motion } from 'framer-motion';
import { Battery, Zap } from 'lucide-react';
import { DetailBox } from '../DetailBox';
import clsx from 'clsx';

const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

export function PowerTab({ stats }) {
    const isCharging = stats.power?.isCharging;

    return (
        <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div className="glass-panel p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-4 right-4 animate-pulse-slow">
                    <Zap className={clsx(isCharging ? "text-yellow-400" : "text-gray-600")} size={24} />
                </div>

                <div className="relative mb-6">
                    <Battery size={80} className={clsx(isCharging ? "text-green-400" : "text-neon-blue")} />
                    {isCharging && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Zap className="text-white" size={32} />
                        </motion.div>
                    )}
                </div>

                <h2 className="text-5xl font-bold mb-2 tracking-tighter">{stats.power?.percent || 0}%</h2>
                <p className={clsx("text-lg font-bold uppercase tracking-widest", isCharging ? "text-green-400" : "text-gray-400")}>
                    {isCharging ? "Power Source Connected" : "Running on Battery"}
                </p>
                {stats.power?.timeRemaining && !isCharging && (
                    <p className="text-sm text-gray-500 mt-2 font-medium">Estimated {Math.floor(stats.power.timeRemaining / 60)}h {stats.power.timeRemaining % 60}m remaining</p>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DetailBox label="Cycle Count" value={stats.power?.cycleCount || 'N/A'} />
                <DetailBox label="Voltage" value={`${stats.power?.voltage || 0}V`} />
                <DetailBox label="Charge Rate" value={`${stats.power?.chargeRate || 0} W`} color="text-yellow-400" />
                <DetailBox label="Health / Wear" value={`${100 - (stats.power?.wearLevel || 0)}%`} color="text-green-400" />
                <DetailBox label="System Power" value={`~${stats.power?.systemPower || 0} W`} color="text-red-400" />
                <DetailBox label="Current Cap" value={`${stats.power?.currentCapacity || 0} mWh`} />
            </div>
        </motion.div>
    );
}
