import { useState, useEffect, useCallback, useRef } from 'react';
import TopBar from './components/TopBar';
import TimeInputBlock from './components/TimeInputBlock';
import ProgressBar from './components/ProgressBar';
import ExitDisplay from './components/ExitDisplay';
import SmartButton from './components/SmartButton';
import HistoricoModal from './components/HistoricoModal';
import ConfigModal from './components/ConfigModal';
import Footer from './components/Footer';

import { 
    STORAGE_KEYS, 
    toMinutes, 
    fromMinutes, 
    getHoraAtualString, 
    calcularTrabalhado 
} from './Utils';

export default function CalculadoraDePonto() {
    const [entrada, setEntrada] = useState('');
    const [saidaAlmoco, setSaidaAlmoco] = useState('');
    const [retornoAlmoco, setRetornoAlmoco] = useState('');
    const [saidaFinal, setSaidaFinal] = useState('');
    
    const [progresso, setProgresso] = useState(0);
    const [horasTrabalhadas, setHorasTrabalhadas] = useState('00:00');
    const [temaClaro, setTemaClaro] = useState(false);
    
    const [countdown, setCountdown] = useState('');
    const notificacaoEnviada = useRef({ aviso15: false, final: false });

    const [cargaHoraria, setCargaHoraria] = useState('08:00');
    const [historico, setHistorico] = useState([]);
    const [mostrarHistorico, setMostrarHistorico] = useState(false);
    const [mostrarConfig, setMostrarConfig] = useState(false);

    const enviarNotificacao = useCallback((titulo, corpo) => {
        if (!("Notification" in window)) return;
        if (Notification.permission === "granted") {
            new Notification(titulo, { 
                body: corpo,
                icon: '[https://cdn-icons-png.flaticon.com/512/2055/2055364.png](https://cdn-icons-png.flaticon.com/512/2055/2055364.png)'
            });
        }
    }, []);

    const salvarDiaNoHistorico = useCallback((dataDoRegistro, entradaSaved, saidaAlmocoSaved, retornoAlmocoSaved) => {
        const ent = toMinutes(entradaSaved);
        if (!ent) return; 

        const novoRegistro = {
            id: Date.now(),
            data: dataDoRegistro,
            entrada: entradaSaved,
            trabalhado: '---', 
            concluido: !!(entradaSaved && saidaAlmocoSaved && retornoAlmocoSaved)
        };

        setHistorico(prev => {
            const novoHistorico = [novoRegistro, ...prev].slice(0, 30);
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
            const entOld = localStorage.getItem(STORAGE_KEYS.ENTRADA);
            const saiAOld = localStorage.getItem(STORAGE_KEYS.SAIDA_ALMOCO);
            const retAOld = localStorage.getItem(STORAGE_KEYS.RETORNO_ALMOCO);
            
            if (entOld) {
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

    useEffect(() => {
        if (entrada) localStorage.setItem(STORAGE_KEYS.ENTRADA, entrada);
        if (saidaAlmoco) localStorage.setItem(STORAGE_KEYS.SAIDA_ALMOCO, saidaAlmoco);
        if (retornoAlmoco) localStorage.setItem(STORAGE_KEYS.RETORNO_ALMOCO, retornoAlmoco);
        
        if (entrada || saidaAlmoco || retornoAlmoco) {
            localStorage.setItem(STORAGE_KEYS.DATA_REGISTRO, new Date().toLocaleDateString());
        }
    }, [entrada, saidaAlmoco, retornoAlmoco]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.TEMA, temaClaro);
        document.documentElement.classList.toggle("dark", !temaClaro);
    }, [temaClaro]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.CARGA_HORARIA, cargaHoraria);
    }, [cargaHoraria]);

    useEffect(() => {
        calcularProgresso();
        calcularSaidaFinal(); 
        const intervalo = setInterval(() => {
            calcularProgresso();
            calcularSaidaFinal(); 
        }, 30000);
        return () => clearInterval(intervalo);
    }, [calcularProgresso, calcularSaidaFinal]);

    function baterPontoInteligente() {
        const horaAtual = getHoraAtualString();
        if (!entrada) setEntrada(horaAtual);
        else if (!saidaAlmoco) setSaidaAlmoco(horaAtual);
        else if (!retornoAlmoco) setRetornoAlmoco(horaAtual);
    }

    return (
        <div className="flex flex-col justify-between h-screen w-screen transition-colors duration-300 relative overflow-hidden">
            <TopBar 
                setMostrarHistorico={setMostrarHistorico} 
                setMostrarConfig={setMostrarConfig} 
                temaClaro={temaClaro} 
                setTemaClaro={setTemaClaro} 
            />
            {mostrarHistorico && (
                <HistoricoModal 
                    historico={historico} 
                    onClose={() => setMostrarHistorico(false)} 
                    onClear={() => { localStorage.removeItem(STORAGE_KEYS.HISTORICO); setHistorico([]); }} 
                />
            )}
            {mostrarConfig && (
                <ConfigModal 
                    cargaHoraria={cargaHoraria} 
                    setCargaHoraria={setCargaHoraria} 
                    onClose={() => setMostrarConfig(false)} 
                />
            )}
            <div className="flex flex-col max-w-md mx-auto justify-center items-center w-full px-4 flex-grow z-10">
                <div className="w-full px-6 py-8 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl space-y-6">
                    <h2 className="text-2xl font-bold text-center text-zinc-800 dark:text-white tracking-wide">
                        Calculadora de Ponto
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                        <TimeInputBlock label="Entrada" value={entrada} onChange={setEntrada} />
                        <TimeInputBlock label="Almoço" value={saidaAlmoco} onChange={setSaidaAlmoco} />
                        <TimeInputBlock label="Retorno" value={retornoAlmoco} onChange={setRetornoAlmoco} />
                    </div>
                    <ProgressBar 
                        horasTrabalhadas={horasTrabalhadas} 
                        cargaHoraria={cargaHoraria} 
                        progresso={progresso} 
                    />
                    <ExitDisplay saidaFinal={saidaFinal} countdown={countdown} />
                    <div className="flex justify-center">
                        <button
                            onClick={() => limparCampos(true)}
                            className="text-xs text-zinc-500 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 transition-colors underline decoration-dotted underline-offset-4"
                        >
                            Resetar dia manualmente
                        </button>
                    </div>
                </div>
                <SmartButton 
                    entrada={entrada}
                    saidaAlmoco={saidaAlmoco}
                    retornoAlmoco={retornoAlmoco}
                    onClick={baterPontoInteligente}
                />
            </div>
            <Footer />
        </div>
    );
}