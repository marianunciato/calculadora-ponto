import React from 'react';

export default function ConfigModal({ cargaHoraria, setCargaHoraria, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold dark:text-white text-zinc-800 mb-6 text-center">Configurações</h3>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 dark:text-zinc-300 text-zinc-600">Jornada de Trabalho Diária</label>
                    <input 
                        type="time" 
                        value={cargaHoraria} 
                        onChange={(e) => setCargaHoraria(e.target.value)}
                        className="w-full text-center text-2xl font-bold bg-zinc-100 dark:bg-black/30 p-4 rounded-2xl dark:text-white text-zinc-800 outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-center mt-2 text-zinc-400">Padrão: 08:00 horas</p>
                </div>

                <button 
                    onClick={onClose}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors"
                >
                    Salvar
                </button>
            </div>
        </div>
    );
}