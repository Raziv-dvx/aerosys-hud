import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Activity, Layers, BarChart2, Cpu, Server, Monitor, Wifi, Battery, Thermometer, Shield } from 'lucide-react';
import { TECH_STACK, SYSTEM_REQUIREMENTS } from '../../constants/content';

const tabVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.2 } }
};

export function AboutTab() {
    return (
        <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div className="glass-panel p-8 text-center bg-gradient-to-br from-neon-blue/10 via-neon-purple/10 to-transparent border-none">
                <h1 className="text-5xl font-black neon-text mb-2 tracking-tighter italic">AEROSYS HUD</h1>
                <p className="text-lg text-gray-400 font-mono tracking-widest uppercase">Premium System Intelligence</p>
                <div className="flex items-center justify-center gap-4 mt-6">
                    <a href="https://github.com/Raziv-dvx" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group">
                        <Globe size={16} className="text-neon-blue group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold tracking-widest uppercase">GitHub Portfolio</span>
                    </a>
                </div>
            </div>

            <div className="glass-panel p-6">
                <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                    <Activity className="text-neon-blue" size={28} />
                    The Mission
                </h2>
                <p className="text-gray-300 leading-relaxed font-medium">
                    AeroSys HUD was born from a desire for professional-grade system aesthetics. It bridges the gap between raw hardware metrics and high-end visual design, providing real-time data monitoring through a beautiful, responsive interface that feels as premium as the hardware it monitors.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6">
                    <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-neon-blue uppercase tracking-tighter italic">
                        <Layers size={20} /> Frontend Architecture
                    </h3>
                    <ul className="space-y-3">
                        {TECH_STACK.frontend.map((tech, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-neon-blue" />
                                {tech}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="glass-panel p-6">
                    <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-green-400 uppercase tracking-tighter italic">
                        <Server size={20} /> Core Infrastructure
                    </h3>
                    <ul className="space-y-3">
                        {TECH_STACK.backend.map((tech, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                {tech}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="glass-panel p-6">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-2 uppercase tracking-tighter italic">
                    <Shield className="text-red-400" size={24} /> Specifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                        <h3 className="text-sm font-black text-green-400 uppercase tracking-widest mb-4">Minimum</h3>
                        <ul className="space-y-2 text-xs text-gray-400 font-bold uppercase tracking-tight">
                            <li>OS: {SYSTEM_REQUIREMENTS.minimum.os}</li>
                            <li>CPU: {SYSTEM_REQUIREMENTS.minimum.cpu}</li>
                            <li>RAM: {SYSTEM_REQUIREMENTS.minimum.ram}</li>
                            <li>Space: {SYSTEM_REQUIREMENTS.minimum.storage}</li>
                        </ul>
                    </div>
                    <div className="bg-neon-blue/5 p-5 rounded-2xl border border-neon-blue/20">
                        <h3 className="text-sm font-black text-neon-blue uppercase tracking-widest mb-4">Recommended</h3>
                        <ul className="space-y-2 text-xs text-gray-300 font-bold uppercase tracking-tight">
                            <li>OS: {SYSTEM_REQUIREMENTS.recommended.os}</li>
                            <li>CPU: {SYSTEM_REQUIREMENTS.recommended.cpu}</li>
                            <li>RAM: {SYSTEM_REQUIREMENTS.recommended.ram}</li>
                            <li>Space: {SYSTEM_REQUIREMENTS.recommended.storage}</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="glass-panel p-6 text-center border-none bg-gradient-to-t from-black/50 to-transparent">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.4em]">Designed & Developed by Raziv-dvx</p>
                <p className="text-[10px] text-gray-600 font-black mt-2">v1.2.0 • AEROSYS HUD SYSTEM • 2025</p>
            </div>
        </motion.div>
    );
}
