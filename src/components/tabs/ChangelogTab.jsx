import React from 'react';
import { motion } from 'framer-motion';
import { CHANGELOG } from '../../constants/content';

const tabVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, scale: 1.05, transition: { duration: 0.2 } }
};

export function ChangelogTab() {
    return (
        <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div className="glass-panel p-8 text-center bg-gradient-to-br from-neon-purple/10 via-neon-blue/10 to-transparent border-none">
                <h1 className="text-5xl font-black neon-text mb-2 tracking-tighter italic">CHANGELOG</h1>
                <p className="text-lg text-gray-400 font-medium font-mono uppercase tracking-[0.3em]">System Update History</p>
            </div>

            {CHANGELOG.map((version, idx) => (
                <div key={idx} className="glass-panel p-6 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-black text-neon-blue italic group-hover:neon-text transition-all duration-300">v{version.version}</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{version.date}</p>
                        </div>
                        {version.status && (
                            <div className="px-4 py-1.5 bg-neon-blue/20 text-neon-blue border border-neon-blue/50 rounded-full text-[10px] font-black tracking-widest animate-pulse">
                                {version.status}
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            System Modifications
                            <div className="h-[1px] flex-1 bg-white/10"></div>
                        </p>
                        <ul className="space-y-3">
                            {version.items.map((item, i) => (
                                <li key={i} className="flex gap-4 items-start group/item">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-neon-blue/50 group-hover/item:bg-neon-blue transition-colors shadow-[0_0_8px_rgba(0,243,255,0.4)]" />
                                    <span className="text-sm text-gray-300 font-medium group-hover/item:text-white transition-colors">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </motion.div>
    );
}
