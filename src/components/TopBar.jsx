import React from 'react';

export default function TopBar({ setMostrarHistorico, setMostrarConfig, temaClaro, setTemaClaro }) {
    return (
        <div className="flex justify-between items-center px-4 pt-4 z-40">
            <div className="flex gap-2">
                <button onClick={() => setMostrarHistorico(true)} className="h-10 w-10 flex justify-center items-center rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md hover:scale-110 transition-transform text-zinc-800 dark:text-white" title="Histórico">
                    <span className="material-symbols-outlined">history</span>
                </button>
                <button onClick={() => setMostrarConfig(true)} className="h-10 w-10 flex justify-center items-center rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md hover:scale-110 transition-transform text-zinc-800 dark:text-white" title="Configurações">
                    <span className="material-symbols-outlined">settings</span>
                </button>
            </div>

            <button
                onClick={() => setTemaClaro(!temaClaro)}
                className="h-10 w-10 flex justify-center items-center rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md hover:scale-110 transition-transform text-black dark:text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
            >
                <span className="material-symbols-outlined">
                    {temaClaro ? "dark_mode" : "light_mode"}
                </span>
            </button>
        </div>
    );
}