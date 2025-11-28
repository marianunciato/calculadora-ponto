import React from 'react';

export default function HistoricoModal({ historico, onClose, onClear }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold dark:text-white text-zinc-800">Histórico Recente</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="material-symbols-outlined dark:text-white">close</span>
                    </button>
                </div>
                
                {historico.length === 0 ? (
                    <p className="text-center text-zinc-500 py-8">Nenhum registro encontrado ainda.</p>
                ) : (
                    <div className="max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {historico.map(reg => (
                            <div key={reg.id} className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
                                <div className="flex flex-col">
                                    <span className="font-bold dark:text-zinc-200 text-zinc-700">{reg.data}</span>
                                    <span className="text-xs text-zinc-500">Entrada: {reg.entrada}</span>
                                </div>
                                <div>
                                    {reg.concluido ? (
                                        <span className="px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">Completo</span>
                                    ) : (
                                        <span className="px-2 py-1 rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold">Parcial</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-white/10 text-center">
                    <button onClick={onClear} className="text-xs text-red-500 hover:underline">Limpar Histórico</button>
                </div>
            </div>
        </div>
    );
}