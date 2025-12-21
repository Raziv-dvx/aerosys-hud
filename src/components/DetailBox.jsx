import React from 'react';
import clsx from 'clsx';

export const DetailBox = React.memo(({ label, value, color = "text-white" }) => {
    return (
        <div className="bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{label}</div>
            <div className={clsx("font-bold text-lg truncate", color)}>{value}</div>
        </div>
    );
});
