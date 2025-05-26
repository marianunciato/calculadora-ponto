import { useState, useEffect } from 'react';

export default function CalculadoraDePonto() {
	const [entrada, setEntrada] = useState('');
	const [saidaAlmoco, setSaidaAlmoco] = useState('');
	const [voltaAlmoco, setVoltaAlmoco] = useState('');
	const [saidaFinal, setSaidaFinal] = useState('');
	const [progresso, setProgresso] = useState(0);
	const [ultimaAtualizacao, setUltimaAtualizacao] = useState('');
	const [horasTrabalhadas, setHorasTrabalhadas] = useState('00:00');

	useEffect(() => {
		const savedEntrada = localStorage.getItem('entrada');
		const savedSaidaAlmoco = localStorage.getItem('saidaAlmoco');
		const savedVoltaAlmoco = localStorage.getItem('voltaAlmoco');

		if (savedEntrada) setEntrada(savedEntrada);
		if (savedSaidaAlmoco) setSaidaAlmoco(savedSaidaAlmoco);
		if (savedVoltaAlmoco) setVoltaAlmoco(savedVoltaAlmoco);
	}, []);

	useEffect(() => {
		localStorage.setItem('entrada', entrada);
	}, [entrada]);

	useEffect(() => {
		localStorage.setItem('saidaAlmoco', saidaAlmoco);
	}, [saidaAlmoco]);

	useEffect(() => {
		localStorage.setItem('voltaAlmoco', voltaAlmoco);
	}, [voltaAlmoco]);

	useEffect(() => {
		calcularProgresso();
	}, [entrada, saidaAlmoco, voltaAlmoco]);

	useEffect(() => {
		const intervalo = setInterval(calcularProgresso, 60000);
		return () => clearInterval(intervalo);
	}, []);

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
			if (!voltaAlmoco) {
				trabalhado = tempoAntesAlmoco;
			} else {
				const voltaAlmocoMin = toMinutes(voltaAlmoco);
				const agoraMin = toMinutes(`${agora.getHours()}:${agora.getMinutes()}`);
				const depoisAlmoco = Math.max(0, agoraMin - voltaAlmocoMin);
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
		if (!entrada || !saidaAlmoco || !voltaAlmoco) {
			setSaidaFinal('Preencha todos os campos');
			return;
		}

		const entradaMin = toMinutes(entrada);
		const saidaAlmocoMin = toMinutes(saidaAlmoco);
		const voltaAlmocoMin = toMinutes(voltaAlmoco);

		const tempoAntesDoAlmoco = saidaAlmocoMin - entradaMin;
		const restante = 480 - tempoAntesDoAlmoco;
		const horarioSaidaFinal = voltaAlmocoMin + restante;

		setSaidaFinal(fromMinutes(horarioSaidaFinal));
	}

	function limparCampos() {
		setEntrada('');
		setSaidaAlmoco('');
		setVoltaAlmoco('');
		setSaidaFinal('');
		localStorage.removeItem('entrada');
		localStorage.removeItem('saidaAlmoco');
		localStorage.removeItem('voltaAlmoco');
		setProgresso(0);
		setUltimaAtualizacao('');
		setHorasTrabalhadas('00:00');
	}

	return (
		<div className="max-w-md mx-auto p-4 bg-white rounded-2xl shadow-md space-y-4">
			<h2 className="text-xl font-bold text-center">Calculadora de Ponto</h2>
			<div className="flex flex-row gap-3">
				<div className="primeiraEntrada">
					<h3 className="flex justify-center item-center pb-1 font-bold">Entrada</h3>
					<input
						type="time"
						value={entrada}
						onChange={(e) => setEntrada(e.target.value)}
						placeholder="Entrada"
						className="w-full bg-slate-100 py-2 pl-4 pr-3 rounded-full"
					/>
				</div>
				<div className="saidaAlmoco">
					<h3 className="flex justify-center item-center pb-1 font-bold">Almoço</h3>
					<input
						type="time"
						value={saidaAlmoco}
						onChange={(e) => setSaidaAlmoco(e.target.value)}
						placeholder="Saída para almoço"
						className="w-full bg-slate-100 py-2 pl-4 pr-3 rounded-full"
					/>
				</div>
				<div className="segundaEntrada">
					<h3 className="flex justify-center item-center pb-1 font-bold">2° Entrada</h3>
					<input
						type="time"
						value={voltaAlmoco}
						onChange={(e) => setVoltaAlmoco(e.target.value)}
						placeholder="Volta do almoço"
						className="w-full bg-slate-100 py-2 pl-4 pr-3 rounded-full"
					/>
				</div>				
			</div>			
			<div className="w-full">
				<label className="block text-sm font-medium text-gray-700 mb-1">Progresso do dia</label>
				<div className="relative h-6 bg-slate-200 rounded-full overflow-hidden">
					<div
						className="h-full bg-blue-500 transition-all duration-500 ease-out"
						style={{ width: `${progresso}%` }}
					></div>
					<div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
						{progresso}%
					</div>
				</div>
			</div>
			{ultimaAtualizacao && (
				<div className="text-center text-sm text-gray-500">
					Última atualização: {ultimaAtualizacao}
				</div>
			)}
			{horasTrabalhadas && (
				<div className="text-center text-lg font-semibold text-green-600">
					⏱️ Horas trabalhadas: {horasTrabalhadas}
				</div>
			)}
			<div className="flex flex-row gap-3">
				<button onClick={calcularSaidaFinal} className="w-48 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
					Calcular saída final
				</button>
				<button onClick={limparCampos} className="w-auto bg-slate-300 text-black py-2 px-4 rounded hover:bg-gray-400">
					Limpar dados
				</button>
			</div>			
			{saidaFinal && (
				<div className="text-center text-lg font-semibold">
					🕔 Saída final: {saidaFinal}
				</div>
			)}
		</div>
	);
}