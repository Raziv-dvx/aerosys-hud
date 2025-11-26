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
        window.electron.on('update-stats', (data) => {
            const now = Date.now();

            // Debounce updates to max 2 per second (500ms)
            if (now - lastUpdateRef.current < 500) {
                // Clear existing timeout and schedule new update
                if (updateTimeoutRef.current) {
                    clearTimeout(updateTimeoutRef.current);
                }
                updateTimeoutRef.current = setTimeout(() => {
                    setStats(data);
                    lastUpdateRef.current = Date.now();
                }, 500);
            } else {
                // Update immediately if enough time has passed
                setStats(data);
                lastUpdateRef.current = now;
            }
        });

        // Cleanup timeout on unmount
        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, []);

    return { stats, staticData };
}
