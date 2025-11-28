import React from 'react';

export default function TimeInputBlock({ label, value, onChange }) {
    return (
        <div className="w-full group">
            <h3 className="text-center text-xs uppercase tracking-wider pb-2 font-bold dark:text-white/70 text-zinc-600">{label}</h3>
            <input
                type="time"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full flex justify-center items-center bg-white/50 dark:bg-black/20 focus:bg-white dark:focus:bg-black/40 transition-colors py-2 px-1 text-center font-mono font-medium rounded-xl border border-white/20 dark:border-white/10 dark:text-white text-zinc-800 outline-none focus:ring-2 focus:ring-purple-500/50"
            />
        </div>
    );
}