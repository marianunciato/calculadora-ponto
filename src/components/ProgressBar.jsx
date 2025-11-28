export default function ProgressBar({ horasTrabalhadas, cargaHoraria, progresso }) {
    const getBarColorClass = (percent) => {
        if (percent >= 100) return 'from-purple-500 to-fuchsia-500 shadow-[0_0_15px_rgba(168,85,247,0.6)]';
        if (percent >= 85) return 'from-yellow-400 to-orange-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]';
        return 'from-teal-400 to-emerald-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]';
    };

    const getColorTextClass = (percent) => {
        if (percent >= 100) return 'text-purple-600 dark:text-purple-400';
        if (percent > 85) return 'text-orange-500 dark:text-orange-400';
        return 'text-teal-600 dark:text-teal-400';
    };

    return (
        <div className="w-full space-y-2">
            <div className="flex justify-between items-end">
                <label className="text-sm font-medium dark:text-white/80 text-zinc-600">Progresso do dia</label>
                <span className="text-xs font-mono dark:text-white/50 text-zinc-500">{horasTrabalhadas} / {cargaHoraria}</span>
            </div>
            <div className="relative h-4 bg-zinc-200/50 dark:bg-black/20 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r transition-all duration-700 ease-out ${getBarColorClass(progresso)}`}
                    style={{ width: `${progresso}%` }}
                ></div>
            </div>
            <p className={`text-right text-xs font-bold transition-colors ${getColorTextClass(progresso)}`}>
                {progresso}%
            </p>
        </div>
    );
}