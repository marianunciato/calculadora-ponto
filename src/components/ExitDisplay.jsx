import React from 'react';

export default function ExitDisplay({ saidaFinal, countdown }) {
    return (
        <div className={`transition-all duration-500 ease-in-out transform ${saidaFinal ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 h-0 overflow-hidden'}`}>
            <div className="text-center bg-purple-500/10 dark:bg-purple-500/20 border border-purple-400/20 dark:border-purple-500/20 rounded-2xl p-4 relative overflow-hidden group">
                {countdown && countdown.includes('Faltam') && countdown.includes('0h') && (
                    <div className="absolute inset-0 bg-yellow-400/5 animate-pulse"></div>
                )}

                <p className="text-xs uppercase tracking-widest text-purple-600 dark:text-purple-300 mb-1 opacity-70">Saída prevista</p>
                <p className="text-4xl font-bold text-purple-500 dark:text-purple-100 drop-shadow-sm mb-1">{saidaFinal}</p>
                
                {countdown && (
                    <p className={`text-sm font-medium rounded-full py-1 px-3 inline-block mt-2 ${
                        countdown.includes('Hora extra') ? 'bg-white text-red-600 dark:bg-red-900/30 dark:text-red-300' : 
                        countdown.includes('Hora de sair') ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300 animate-bounce' : 
                        'bg-white text-purple-600 dark:bg-white/10 dark:text-purple-200'
                    }`}>
                        {countdown}
                    </p>
                )}
            </div>
        </div>
    );
}