export const CHANGELOG = [
    {
        version: "1.2",
        date: "December 2025",
        status: "LATEST",
        items: [
            "Simplified refresh frequency settings",
            "Improved tray icon menu and closing logic",
            "Optimized static tab loading (About/Changelog)",
            "Fixed various bugs and performance issues"
        ]
    },
    {
        version: "1.1",
        date: "November 2025",
        status: "STABLE",
        items: [
            "Fixed taskbar icon visibility issues on Windows",
            "Added \"Close Stats\" button to taskbar context menu",
            "Fixed duplicate tray icons appearing on app restart",
            "Optimized performance for 4GB+ RAM systems",
            "Reduced CPU usage by ~40% through polling optimization",
            "Reduced RAM usage by ~25% with memory optimizations",
            "Simplified branding from \"AeroSys HUD Pro\" to \"AeroSys HUD\"",
            "Added React.memo and useMemo for better performance",
            "Improved animation smoothness with optimized durations"
        ]
    },
    {
        version: "1.0",
        date: "November 2025",
        items: [
            "Complete UI/UX overhaul with glassmorphism design",
            "Performance optimizations across all components",
            "Improved data polling with staggered intervals",
            "Enhanced error handling and stability",
            "Optimized for Windows 10 and Windows 11",
            "Added system health score calculation",
            "Improved memory management"
        ]
    }
    // ... items truncated for brevity, can be expanded if needed
];

export const SYSTEM_REQUIREMENTS = {
    minimum: {
        os: "Windows 10 or Windows 11",
        cpu: "Dual-core processor (2 GHz+)",
        ram: "2 GB available memory",
        storage: "200 MB free disk space",
        display: "1280x720 resolution"
    },
    recommended: {
        os: "Windows 11 (latest updates)",
        cpu: "Quad-core processor (3 GHz+)",
        ram: "4 GB available memory",
        storage: "500 MB free disk space",
        display: "1920x1080 resolution or higher"
    }
};

export const TECH_STACK = {
    frontend: [
        "React 19 - UI framework",
        "Vite - Fast build tool",
        "Framer Motion - Smooth animations",
        "Tailwind CSS - Styling",
        "Lucide React - Icons"
    ],
    backend: [
        "Electron - Desktop app framework",
        "Node.js - Runtime",
        "systeminformation - Hardware monitoring",
        "active-win - Window tracking",
        "loudness - Audio monitoring"
    ]
};
