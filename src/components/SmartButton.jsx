import React from 'react';

export default function SmartButton({ entrada, saidaAlmoco, retornoAlmoco, onClick }) {
    return (
        <div className="w-full mt-6" style={{fontVariationSettings: "'FILL' 1"}}>
            <a 
                onClick={onClick}
                className="cursor-pointer group relative w-full bg-white dark:bg-white/90 text-zinc-900 py-4 rounded-2xl font-bold shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-3"
                href="[https://awstou.ifractal.com.br/fulltime/phonto.php](https://awstou.ifractal.com.br/fulltime/phonto.php)" 
                target="_blank"
                rel="noreferrer"
            >
                <span>
                    {!entrada ? 'Registrar Entrada' : 
                        !saidaAlmoco ? 'Registrar Almoço' : 
                        !retornoAlmoco ? 'Registrar Retorno' : 'Abrir Sistema de Ponto'}
                </span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform"> exit_to_app </span>
                {/* <span className="absolute right-4 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span> */}
            </a>
        </div>
    );
}