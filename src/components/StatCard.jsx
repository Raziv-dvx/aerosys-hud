import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export const StatCard = React.memo(({ title, value, sub, color, icon, progress }) => {
    return (
        <div className={clsx(
            "glass-panel p-6 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]",
            `hover:border-${color}/50`
        )}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-gray-400 text-sm uppercase tracking-wider">{title}</h2>
                    <div className="text-4xl font-bold mt-1 tracking-tight">{value}</div>
                </div>
                <div className={clsx(`text-${color}`, "opacity-50 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]")}>
                    {icon}
                </div>
            </div>
            <div className="w-full bg-gray-800/50 h-1.5 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full bg-${color} shadow-[0_0_15px_rgba(0,243,255,0.4)]`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
            </div>
            <div className="mt-4 text-xs text-gray-500 font-medium">
                {sub}
            </div>
        </div>
    );
});
