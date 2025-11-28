export const STORAGE_KEYS = {
    DATA_REGISTRO: 'ponto_data_registro',
    ENTRADA: 'ponto_entrada',
    SAIDA_ALMOCO: 'ponto_saida_almoco',
    RETORNO_ALMOCO: 'ponto_retorno_almoco',
    TEMA: 'temaClaro',
    HISTORICO: 'ponto_historico_data',
    CARGA_HORARIA: 'ponto_carga_horaria'
};

export function toMinutes(hora) {
    if (!hora || !hora.includes(':')) return 0;
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
}

export function fromMinutes(min) {
    const sinal = min < 0 ? '-' : '';
    min = Math.abs(min);
    const h = Math.floor(min / 60).toString().padStart(2, '0');
    const m = (min % 60).toString().padStart(2, '0');
    return `${sinal}${h}:${m}`;
}

export function getHoraAtualString() {
    const agora = new Date();
    return `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;
}

export function calcularTrabalhado(entrada, saidaAlmoco, retornoAlmoco) {
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