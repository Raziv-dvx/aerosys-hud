import { useState, useEffect, useRef } from 'react';

export function useSystemStats() {
    const [stats, setStats] = useState(null);
    const [staticData, setStaticData] = useState(null);
    const lastUpdateRef = useRef(0);
    const updateTimeoutRef = useRef(null);

    useEffect(() => {
        // Initial fetch to populate data immediately
        window.electron.getSystemStats().then(setStats);

        // Listen for updates from main process with debouncing
        const removeListener = window.electron.on('update-stats', (data) => {
            const now = Date.now();

            // Debounce updates to max 1 per second (1000ms) for RAM efficiency
            if (now - lastUpdateRef.current < 1000) {
                if (updateTimeoutRef.current) {
                    clearTimeout(updateTimeoutRef.current);
                }
                updateTimeoutRef.current = setTimeout(() => {
                    setStats(data);
                    lastUpdateRef.current = Date.now();
                }, 1000);
            } else {
                setStats(data);
                lastUpdateRef.current = now;
            }
        });

        // Cleanup on unmount
        return () => {
            if (removeListener) removeListener();
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, []);

    return { stats, staticData };
}
