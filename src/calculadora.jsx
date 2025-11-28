import { useState, useEffect, useCallback, useRef } from 'react';

// --- CONSTANTES ---
const STORAGE_KEYS = {
    DATA_REGISTRO: 'ponto_data_registro',
    ENTRADA: 'ponto_entrada',
    SAIDA_ALMOCO: 'ponto_saida_almoco',
    RETORNO_ALMOCO: 'ponto_retorno_almoco',
    TEMA: 'temaClaro',
    HISTORICO: 'ponto_historico_data',
    CARGA_HORARIA: 'ponto_carga_horaria'
};

// --- FUNÇÕES UTILITÁRIAS ---
function toMinutes(hora) {
    if (!hora || !hora.includes(':')) return 0;
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
}

function fromMinutes(min) {
    // Trata negativos
    const sinal = min < 0 ? '-' : '';
    min = Math.abs(min);
    const h = Math.floor(min / 60).toString().padStart(2, '0');
    const m = (min % 60).toString().padStart(2, '0');
    return `${sinal}${h}:${m}`;
}

function getHoraAtualString() {
    const agora = new Date();
    return `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;
}

// Calcula o trabalhado baseado nos inputs (lógica pura sem estado)
function calcularTrabalhado(entrada, saidaAlmoco, retornoAlmoco) {
    if (!entrada) return 0;
    
    const agora = new Date();
    const [h, m] = entrada.split(':').map(Number);
    const entradaData = new Date();
    entradaData.setHours(h, m, 0, 0);

    if (entradaData > agora) return 0;

    const minutosDesdeEntrada = Math.floor((agora - entradaData) / 60000);
    let trabalhado = minutosDesdeEntrada;

    if (saidaAlmoco) {
        const saidaAlmocoMin = toMinutes(saidaAlmoco);
        const entradaMin = toMinutes(entrada);
        const tempoAntesAlmoco = saidaAlmocoMin - entradaMin;

        if (!retornoAlmoco) {
            const agoraMin = toMinutes(`${agora.getHours()}:${agora.getMinutes()}`);
            if (agoraMin > saidaAlmocoMin) {
                    trabalhado = tempoAntesAlmoco;
            }
        } else {
            const retornoAlmocoMin = toMinutes(retornoAlmoco);
            const agoraMin = toMinutes(`${agora.getHours()}:${agora.getMinutes()}`);
            const depoisAlmoco = Math.max(0, agoraMin - retornoAlmocoMin);
            trabalhado = tempoAntesAlmoco + depoisAlmoco;
        }
    }
    return trabalhado;
}

export default function CalculadoraDePonto() {
    // --- ESTADOS ---
    const [entrada, setEntrada] = useState('');
    const [saidaAlmoco, setSaidaAlmoco] = useState('');
    const [retornoAlmoco, setRetornoAlmoco] = useState('');
    const [saidaFinal, setSaidaFinal] = useState('');
    
    const [progresso, setProgresso] = useState(0);
    const [horasTrabalhadas, setHorasTrabalhadas] = useState('00:00');
    const [temaClaro, setTemaClaro] = useState(false);
    
    const [countdown, setCountdown] = useState('');
    const notificacaoEnviada = useRef({ aviso15: false, final: false });

    // FASE 3: NOVOS ESTADOS
    const [cargaHoraria, setCargaHoraria] = useState('08:00'); // Padrão 8h
    const [historico, setHistorico] = useState([]);
    const [mostrarHistorico, setMostrarHistorico] = useState(false);
    const [mostrarConfig, setMostrarConfig] = useState(false);

    // --- FUNÇÕES MEMOIZADAS (useCallback) ---

    const enviarNotificacao = useCallback((titulo, corpo) => {
        if (!("Notification" in window)) return;
        if (Notification.permission === "granted") {
            new Notification(titulo, { 
                body: corpo,
                icon: 'https://cdn-icons-png.flaticon.com/512/2055/2055364.png'
            });
        }
    }, []);

    const salvarDiaNoHistorico = useCallback((dataDoRegistro, entradaSaved, saidaAlmocoSaved, retornoAlmocoSaved) => {
        const ent = toMinutes(entradaSaved);
        
        if (!ent) return; // Não salva dia vazio

        // Removemos o cálculo complexo de minutos (totalMinutos/retA) para simplificar
        // e evitar variáveis não utilizadas, já que o resultado 'trabalhado' aqui é apenas informativo '---'
        
        const novoRegistro = {
            id: Date.now(),
            data: dataDoRegistro,
            entrada: entradaSaved,
            trabalhado: '---', 
            concluido: !!(entradaSaved && saidaAlmocoSaved && retornoAlmocoSaved)
        };

        setHistorico(prev => {
            const novoHistorico = [novoRegistro, ...prev].slice(0, 30); // Mantém últimos 30 dias
            localStorage.setItem(STORAGE_KEYS.HISTORICO, JSON.stringify(novoHistorico));
            return novoHistorico;
        });

    }, []);

    const limparCampos = useCallback((limparStorageTotal = true) => {
        setEntrada('');
        setSaidaAlmoco('');
        setRetornoAlmoco('');
        setSaidaFinal('');
        setProgresso(0);
        setHorasTrabalhadas('00:00');
        setCountdown('');
        
        notificacaoEnviada.current = { aviso15: false, final: false };

        if (limparStorageTotal) {
            localStorage.removeItem(STORAGE_KEYS.ENTRADA);
            localStorage.removeItem(STORAGE_KEYS.SAIDA_ALMOCO);
            localStorage.removeItem(STORAGE_KEYS.RETORNO_ALMOCO);
            // Não removemos carga horária nem histórico
        }
    }, []);

    const calcularProgresso = useCallback(() => {
        if (!entrada) {
            setProgresso(0);
            setHorasTrabalhadas('00:00');
            return;
        }

        const cargaMinutos = toMinutes(cargaHoraria) || 480;
        const trabalhado = calcularTrabalhado(entrada, saidaAlmoco, retornoAlmoco);

        const porcentagem = Math.round((trabalhado / cargaMinutos) * 100);
        setProgresso(porcentagem > 100 ? 100 : porcentagem);
        setHorasTrabalhadas(fromMinutes(trabalhado));
        
    }, [entrada, saidaAlmoco, retornoAlmoco, cargaHoraria]);

    const calcularSaidaFinal = useCallback(() => {
        if (!entrada || !saidaAlmoco || !retornoAlmoco) {
            setSaidaFinal('');
            setCountdown('');
            return;
        }

        const entradaMin = toMinutes(entrada);
        const saidaAlmocoMin = toMinutes(saidaAlmoco);
        const retornoAlmocoMin = toMinutes(retornoAlmoco);
        const cargaMinutos = toMinutes(cargaHoraria) || 480;

        const tempoAntesDoAlmoco = saidaAlmocoMin - entradaMin;
        const restante = cargaMinutos - tempoAntesDoAlmoco;
        
        const horarioSaidaFinalMin = retornoAlmocoMin + restante;
        const horaFormatada = fromMinutes(horarioSaidaFinalMin);
        setSaidaFinal(horaFormatada);

        // Countdown
        const agora = new Date();
        const agoraMin = agora.getHours() * 60 + agora.getMinutes();
        const diferencaMin = horarioSaidaFinalMin - agoraMin;

        if (diferencaMin > 0) {
            const hFalta = Math.floor(diferencaMin / 60);
            const mFalta = diferencaMin % 60;
            setCountdown(`Faltam ${hFalta}h ${mFalta}m`);
            
            if (diferencaMin === 15 && !notificacaoEnviada.current.aviso15) {
                enviarNotificacao("Quase lá!", "Faltam apenas 15 minutos para sua saída.");
                notificacaoEnviada.current.aviso15 = true;
            }
        } else if (diferencaMin === 0) {
            setCountdown("Hora de sair! 🎉");
            if (!notificacaoEnviada.current.final) {
                enviarNotificacao("Hora de sair!", "Sua jornada de trabalho acabou. Bom descanso!");
                notificacaoEnviada.current.final = true;
            }
        } else {
            setCountdown(`Hora extra: ${fromMinutes(Math.abs(diferencaMin))}`);
        }

    }, [entrada, saidaAlmoco, retornoAlmoco, cargaHoraria, enviarNotificacao]);

    const getBarColorClass = (percent) => {
        if (percent >= 100) return 'from-purple-500 to-fuchsia-500 shadow-[0_0_15px_rgba(168,85,247,0.6)]';
        if (percent >= 85) return 'from-yellow-400 to-orange-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]';
        return 'from-teal-400 to-emerald-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]';
    };

    // --- EFEITOS (USEEFFECT) ---

    // 1. Inicialização (Carregar tudo e Resetar se necessário)
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted') Notification.requestPermission();

        const hoje = new Date().toLocaleDateString();
        const dataSalva = localStorage.getItem(STORAGE_KEYS.DATA_REGISTRO);
        const temaSalvo = localStorage.getItem(STORAGE_KEYS.TEMA);
        const historicoSalvo = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORICO) || '[]');
        const cargaSalva = localStorage.getItem(STORAGE_KEYS.CARGA_HORARIA) || '08:00';

        if (temaSalvo === "true") setTemaClaro(true);
        setHistorico(historicoSalvo);
        setCargaHoraria(cargaSalva);

        if (dataSalva && dataSalva !== hoje) {
            // Lógica de "Novo Dia": Tenta salvar o dia anterior antes de limpar
            const entOld = localStorage.getItem(STORAGE_KEYS.ENTRADA);
            const saiAOld = localStorage.getItem(STORAGE_KEYS.SAIDA_ALMOCO);
            const retAOld = localStorage.getItem(STORAGE_KEYS.RETORNO_ALMOCO);
            
            if (entOld) {
                // AGORA USAMOS A FUNÇÃO CORRETAMENTE, evitando código duplicado
                salvarDiaNoHistorico(dataSalva, entOld, saiAOld, retAOld);
            }

            limparCampos(false); 
            localStorage.setItem(STORAGE_KEYS.DATA_REGISTRO, hoje);
        } else {
            setEntrada(localStorage.getItem(STORAGE_KEYS.ENTRADA) || '');
            setSaidaAlmoco(localStorage.getItem(STORAGE_KEYS.SAIDA_ALMOCO) || '');
            setRetornoAlmoco(localStorage.getItem(STORAGE_KEYS.RETORNO_ALMOCO) || '');
        }
    }, [limparCampos, salvarDiaNoHistorico]); 

    // 2. Persistência de Dados de Input
    useEffect(() => {
        if (entrada) localStorage.setItem(STORAGE_KEYS.ENTRADA, entrada);
        if (saidaAlmoco) localStorage.setItem(STORAGE_KEYS.SAIDA_ALMOCO, saidaAlmoco);
        if (retornoAlmoco) localStorage.setItem(STORAGE_KEYS.RETORNO_ALMOCO, retornoAlmoco);
        
        if (entrada || saidaAlmoco || retornoAlmoco) {
            localStorage.setItem(STORAGE_KEYS.DATA_REGISTRO, new Date().toLocaleDateString());
        }
    }, [entrada, saidaAlmoco, retornoAlmoco]);

    // 3. Persistência de Tema e Carga Horária
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.TEMA, temaClaro);
        document.documentElement.classList.toggle("dark", !temaClaro);
    }, [temaClaro]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.CARGA_HORARIA, cargaHoraria);
    }, [cargaHoraria]);

    // 4. Loop de Tempo
    useEffect(() => {
        calcularProgresso();
        calcularSaidaFinal(); 
        const intervalo = setInterval(() => {
            calcularProgresso();
            calcularSaidaFinal(); 
        }, 30000);
        return () => clearInterval(intervalo);
    }, [calcularProgresso, calcularSaidaFinal]);

    // --- HANDLERS ---
    function baterPontoInteligente() {
        const horaAtual = getHoraAtualString();
        if (!entrada) setEntrada(horaAtual);
        else if (!saidaAlmoco) setSaidaAlmoco(horaAtual);
        else if (!retornoAlmoco) setRetornoAlmoco(horaAtual);
    }

    // --- COMPONENTES VISUAIS (MODAIS) ---

    // Modal de Histórico
    const HistoricoModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setMostrarHistorico(false)}>
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold dark:text-white text-zinc-800">Histórico Recente</h3>
                    <button onClick={() => setMostrarHistorico(false)} className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
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
                    <button onClick={() => { localStorage.removeItem(STORAGE_KEYS.HISTORICO); setHistorico([]); }} className="text-xs text-red-500 hover:underline">Limpar Histórico</button>
                </div>
            </div>
        </div>
    );

    // Modal de Configurações
    const ConfigModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setMostrarConfig(false)}>
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
                    onClick={() => setMostrarConfig(false)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors"
                >
                    Salvar
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col justify-between h-screen transition-colors duration-300 relative overflow-hidden">
            
            {/* Top Bar: Config e Histórico e Tema */}
            <div className="flex justify-between items-center px-4 pt-4 z-40">
                <div className="flex gap-2">
                    <button onClick={() => setMostrarHistorico(true)} className="p-2 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md hover:scale-110 transition-transform text-zinc-800 dark:text-white" title="Histórico">
                        <span className="material-symbols-outlined">history</span>
                    </button>
                    <button onClick={() => setMostrarConfig(true)} className="p-2 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md hover:scale-110 transition-transform text-zinc-800 dark:text-white" title="Configurações">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>

                <button
                    onClick={() => setTemaClaro(!temaClaro)}
                    className="p-2 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md hover:scale-110 transition-transform text-yellow-500 dark:text-yellow-300"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    <span className="material-symbols-outlined">
                        {temaClaro ? "dark_mode" : "light_mode"}
                    </span>
                </button>
            </div>

            {/* Modais */}
            {mostrarHistorico && <HistoricoModal />}
            {mostrarConfig && <ConfigModal />}

            {/* Conteúdo Principal */}
            <div className="flex flex-col max-w-md mx-auto justify-center items-center w-full px-4 flex-grow z-10">
                <div className="w-full px-6 py-8 bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl space-y-6">
                    
                    <h2 className="text-2xl font-bold text-center text-zinc-800 dark:text-white tracking-wide">
                        Calculadora de Ponto
                    </h2>

                    {/* Inputs */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="w-full group">
                            <h3 className="text-center text-xs uppercase tracking-wider pb-2 font-bold dark:text-white/70 text-zinc-600">Entrada</h3>
                            <input
                                type="time"
                                value={entrada}
                                onChange={(e) => setEntrada(e.target.value)}
                                className="w-full bg-white/50 dark:bg-black/20 focus:bg-white dark:focus:bg-black/40 transition-colors py-2 px-1 text-center font-mono font-medium rounded-xl border border-white/20 dark:border-white/10 dark:text-white text-zinc-800 outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>
                        <div className="w-full group">
                            <h3 className="text-center text-xs uppercase tracking-wider pb-2 font-bold dark:text-white/70 text-zinc-600">Almoço</h3>
                            <input
                                type="time"
                                value={saidaAlmoco}
                                onChange={(e) => setSaidaAlmoco(e.target.value)}
                                className="w-full bg-white/50 dark:bg-black/20 focus:bg-white dark:focus:bg-black/40 transition-colors py-2 px-1 text-center font-mono font-medium rounded-xl border border-white/20 dark:border-white/10 dark:text-white text-zinc-800 outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>
                        <div className="w-full group">
                            <h3 className="text-center text-xs uppercase tracking-wider pb-2 font-bold dark:text-white/70 text-zinc-600">Retorno</h3>
                            <input
                                type="time"
                                value={retornoAlmoco}
                                onChange={(e) => setRetornoAlmoco(e.target.value)}
                                className="w-full bg-white/50 dark:bg-black/20 focus:bg-white dark:focus:bg-black/40 transition-colors py-2 px-1 text-center font-mono font-medium rounded-xl border border-white/20 dark:border-white/10 dark:text-white text-zinc-800 outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>
                    </div>

                    {/* Progresso Dinâmico */}
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
                        <p className={`text-right text-xs font-bold transition-colors ${progresso >= 100 ? 'text-purple-600 dark:text-purple-400' : progresso > 85 ? 'text-orange-500 dark:text-orange-400' : 'text-teal-600 dark:text-teal-400'}`}>
                            {progresso}%
                        </p>
                    </div>

                    {/* Saída Final & Countdown */}
                    <div className={`transition-all duration-500 ease-in-out transform ${saidaFinal ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 h-0 overflow-hidden'}`}>
                         <div className="text-center bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 rounded-2xl p-4 relative overflow-hidden group">
                            {countdown && countdown.includes('Faltam') && countdown.includes('0h') && (
                                <div className="absolute inset-0 bg-yellow-400/5 animate-pulse"></div>
                            )}

                            <p className="text-xs uppercase tracking-widest text-purple-700 dark:text-purple-300 mb-1 opacity-70">Saída prevista</p>
                            <p className="text-4xl font-bold text-purple-800 dark:text-purple-100 drop-shadow-sm mb-1">{saidaFinal}</p>
                            
                            {countdown && (
                                <p className={`text-sm font-medium rounded-full py-1 px-3 inline-block mt-2 ${
                                    countdown.includes('Hora extra') ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' : 
                                    countdown.includes('Hora de sair') ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300 animate-bounce' : 
                                    'bg-purple-100 text-purple-600 dark:bg-white/10 dark:text-purple-200'
                                }`}>
                                    {countdown}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Botão Limpar */}
                    <div className="flex justify-center">
                        <button
                            onClick={() => limparCampos(true)}
                            className="text-xs text-zinc-500 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 transition-colors underline decoration-dotted underline-offset-4"
                        >
                            Resetar dia manualmente
                        </button>
                    </div>
                </div>

                {/* Botão Inteligente */}
                <div className="w-full mt-6" style={{fontVariationSettings: "'FILL' 1"}}>
                    <a 
                        onClick={baterPontoInteligente}
                        className="cursor-pointer group relative w-full bg-white dark:bg-white/90 text-zinc-900 py-4 rounded-2xl font-bold shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-3"
                        href="https://awstou.ifractal.com.br/fulltime/phonto.php" 
                        target="_blank"
                        rel="noreferrer"
                    >
                        <span>
                            {!entrada ? 'Registrar Entrada' : 
                             !saidaAlmoco ? 'Registrar Almoço' : 
                             !retornoAlmoco ? 'Registrar Retorno' : 'Abrir Sistema de Ponto'}
                        </span>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform"> exit_to_app </span>
                        
                        <span className="absolute right-4 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                        </span>
                    </a>
                </div>
            </div>

            {/* Footer */}
            <div className='bg-white/30 backdrop-blur-lg dark:bg-slate-950/50 w-screen py-3 flex justify-center border-t border-white/20 mt-4' style={{fontVariationSettings: "'FILL' 1"}}>
                <a href="https://www.linkedin.com/in/marianunciato/" target="_blank" rel="noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined dark:text-white hover:text-yellow-300 cursor-pointer text-zinc-900 ">
                        star
                    </span>
                </a>    
            </div>
        </div>
    );
}