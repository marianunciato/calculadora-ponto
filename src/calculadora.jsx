import { useState, useEffect } from 'react';

export default function CalculadoraDePonto() {
	const [entrada, setEntrada] = useState('');
	const [saidaAlmoco, setSaidaAlmoco] = useState('');
	const [retornoAlmoco, setRetornoAlmoco] = useState('');
	const [saidaFinal, setSaidaFinal] = useState('');
	const [progresso, setProgresso] = useState(0);
	const [ultimaAtualizacao, setUltimaAtualizacao] = useState('');
	const [horasTrabalhadas, setHorasTrabalhadas] = useState('00:00');

	const storageKeys = {
		entrada: 'ponto_entrada',
		saidaAlmoco: 'ponto_saida_almoco',
		retornoAlmoco: 'ponto_retorno_almoco',
		saidaFinal: 'ponto_saida_final',
	};

	useEffect(() => {
		setEntrada(localStorage.getItem(storageKeys.entrada) || '');
		setSaidaAlmoco(localStorage.getItem(storageKeys.saidaAlmoco) || '');
		setRetornoAlmoco(localStorage.getItem(storageKeys.retornoAlmoco) || '');
		setSaidaFinal(localStorage.getItem(storageKeys.saidaFinal) || '');
	}, []);

	useEffect(() => {
		localStorage.setItem(storageKeys.entrada, entrada);
	}, [entrada]);

	useEffect(() => {
		localStorage.setItem(storageKeys.saidaAlmoco, saidaAlmoco);
	}, [saidaAlmoco]);

	useEffect(() => {
		localStorage.setItem(storageKeys.retornoAlmoco, retornoAlmoco);
	}, [retornoAlmoco]);

	useEffect(() => {
		localStorage.setItem(storageKeys.saidaFinal, saidaFinal);
	}, [saidaFinal]);

	useEffect(() => {
		calcularProgresso();
		const intervalo = setInterval(calcularProgresso, 60000);
		return () => clearInterval(intervalo);
	}, [entrada, saidaAlmoco, retornoAlmoco]);

	function toMinutes(hora) {
		if (!hora || !hora.includes(':')) return 0;
		const [h, m] = hora.split(':').map(Number);
		return h * 60 + m;
	}

	function fromMinutes(min) {
		const h = Math.floor(min / 60).toString().padStart(2, '0');
		const m = (min % 60).toString().padStart(2, '0');
		return `${h}:${m}`;
	}

	function calcularProgresso() {
		if (!entrada) return;

		const agora = new Date();
		const [h, m] = entrada.split(':').map(Number);
		const entradaData = new Date();
		entradaData.setHours(h, m, 0, 0);

		const minutosDesdeEntrada = Math.floor((agora - entradaData) / 60000);

		let trabalhado = minutosDesdeEntrada;
		if (saidaAlmoco) {
			const saidaAlmocoMin = toMinutes(saidaAlmoco);
			const entradaMin = toMinutes(entrada);
			const tempoAntesAlmoco = saidaAlmocoMin - entradaMin;
			if (!retornoAlmoco) {
				trabalhado = tempoAntesAlmoco;
			} else {
				const retornoAlmocoMin = toMinutes(retornoAlmoco);
				const agoraMin = toMinutes(`${agora.getHours()}:${agora.getMinutes()}`);
				const depoisAlmoco = Math.max(0, agoraMin - retornoAlmocoMin);
				trabalhado = tempoAntesAlmoco + depoisAlmoco;
			}
		}

		const porcentagem = Math.min(100, Math.round((trabalhado / 480) * 100));
		setProgresso(porcentagem);
		setHorasTrabalhadas(fromMinutes(trabalhado));

		const horas = agora.getHours().toString().padStart(2, '0');
		const minutos = agora.getMinutes().toString().padStart(2, '0');
		setUltimaAtualizacao(`${horas}:${minutos}`);
	}

	function calcularSaidaFinal() {
		if (!entrada || !saidaAlmoco || !retornoAlmoco) {
			setSaidaFinal('Preencha os campos');
			return;
		}

		const entradaMin = toMinutes(entrada);
		const saidaAlmocoMin = toMinutes(saidaAlmoco);
		const retornoAlmocoMin = toMinutes(retornoAlmoco);

		const tempoAntesDoAlmoco = saidaAlmocoMin - entradaMin;
		const restante = 480 - tempoAntesDoAlmoco;
		const horarioSaidaFinal = retornoAlmocoMin + restante;

		setSaidaFinal(fromMinutes(horarioSaidaFinal));
	}

	function limparCampos() {
		setEntrada('');
		setSaidaAlmoco('');
		setRetornoAlmoco('');
		setSaidaFinal('');
		setProgresso(0);
		setUltimaAtualizacao('');
		setHorasTrabalhadas('00:00');

		Object.values(storageKeys).forEach((key) => localStorage.removeItem(key));
	}

	return (
		<div className="flex flex-col">
			<div className="botao__ponto flex justify-center py-4">
				<a className="bg-white w-full py-3 rounded-2xl font-semibold hover:bg-slate-100 flex justify-center items-center"
				href="https://awstou.ifractal.com.br/fulltime/phonto.php" target="_blank">Bater o ponto</a>
			</div>
			<div className="max-w-md mx-auto px-8 pt-10 pb-8 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/40 shadow-md space-y-4">
				<h2 className="text-xl font-bold text-center text-white">Calculadora de Ponto</h2>

				<div className="flex flex-row gap-3">
					<div className="w-full">
						<h3 className="text-center pb-1 font-bold text-white">Entrada</h3>
						<input
							type="time"
							value={entrada}
							onChange={(e) => setEntrada(e.target.value)}
							className="w-full bg-slate-100/70 py-2 pl-4 pr-3 font-semibold rounded-full"
						/>
					</div>
					<div className="w-full">
						<h3 className="text-center pb-1 font-bold text-white">Saída Almoço</h3>
						<input
							type="time"
							value={saidaAlmoco}
							onChange={(e) => setSaidaAlmoco(e.target.value)}
							className="w-full bg-slate-100/70 py-2 pl-4 pr-3 font-semibold rounded-full"
						/>
					</div>
					<div className="w-full">
						<h3 className="text-center pb-1 font-bold text-white">Retorno</h3>
						<input
							type="time"
							value={retornoAlmoco}
							onChange={(e) => setRetornoAlmoco(e.target.value)}
							className="w-full bg-slate-100/70 py-2 pl-4 pr-3 font-semibold rounded-full"
						/>
					</div>
				</div>

				<div className="w-full">
					<label className="flex justify-center block text-sm font-medium text-white/80 mb-1">Progresso do dia</label>
					<div className="relative h-6 bg-white/60 rounded-full overflow-hidden">
						<div
							className="h-full bg-teal-300 transition-all duration-500 ease-out"
							style={{ width: `${progresso}%` }}
						></div>
						<div className="absolute inset-0 flex items-center justify-center text-black font-bold text-sm">
							{progresso}%
						</div>
					</div>
				</div>

				{ultimaAtualizacao && (
					<p className="text-center text-sm text-white/60">
						Última atualização: {ultimaAtualizacao}
					</p>
				)}

				{horasTrabalhadas && (
					<p className="text-center text-lg font-semibold text-slate-100">
						Horas trabalhadas: {horasTrabalhadas}
					</p>
				)}

				<div className="flex flex-row gap-3">
					<button
						onClick={calcularSaidaFinal}
						className="w-48 bg-purple-500 text-white font-bold py-2 px-4 rounded-full hover:bg-purple-600"
					>
						Calcular saída final
					</button>
					<button
						onClick={limparCampos}
						className="w-auto bg-orange-500 text-white font-bold py-2 px-4 rounded-full hover:bg-orange-600"
					>
						Limpar dados
					</button>
				</div>

				{saidaFinal && (
					<p className="text-center font-semibold text-white border bg-white/20 border-white/50 rounded-2xl p-4">
						<p className="text-white/90"> Saída final: </p> <p className="text-3xl font-bold">{saidaFinal}</p>
					</p>
				)}
			</div>
		</div>
	);
}
