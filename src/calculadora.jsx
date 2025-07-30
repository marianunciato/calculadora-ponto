import { useState, useEffect } from 'react';

export default function CalculadoraDePonto() {
	const [entrada, setEntrada] = useState('');
	const [saidaAlmoco, setSaidaAlmoco] = useState('');
	const [retornoAlmoco, setRetornoAlmoco] = useState('');
	const [saidaFinal, setSaidaFinal] = useState('');
	const [progresso, setProgresso] = useState(0);
	const [ultimaAtualizacao, setUltimaAtualizacao] = useState('');
	const [horasTrabalhadas, setHorasTrabalhadas] = useState('00:00');
	const [temaClaro, setTemaClaro] = useState(false);

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

	useEffect(() => {
		const temaSalvo = localStorage.getItem("temaClaro");
		if (temaSalvo === "true") setTemaClaro(true);
	  }, []);
	  
	  useEffect(() => {
		localStorage.setItem("temaClaro", temaClaro);
		document.documentElement.classList.toggle("dark", !temaClaro);
	}, [temaClaro]);
	  

	useEffect(() => {
		if (temaClaro) {
			document.documentElement.classList.remove("dark");
		} else {
			document.documentElement.classList.add("dark");
		}
	}, [temaClaro]);

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
		<div className="flex flex-col justify-between h-screen">
			<div className="text-white/0 flex justify-center">
				<span
					onClick={() => setTemaClaro(!temaClaro)}
					className="fixed top-4 right-4 cursor-pointer text-3xl text-yellow-400 dark:text-white hover:scale-110 transition-transform"
					style={{ fontVariationSettings: "'FILL' 1" }}
					>
						<span className="material-symbols-outlined">
							{temaClaro ? "dark_mode" : "light_mode"}
						</span>
				</span>
			</div>
			<div className="flex flex-col max-w-md mx-auto justify-center items-center">
				<div className="px-8 py-8 bg-white/30 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg space-y-4">
					<h2 className="text-xl font-bold text-center dark:text-white text-zinc-900">Calculadora de Ponto</h2>
					<div className="flex flex-row gap-3">
						<div className="w-full">
							<h3 className="text-center pb-1 font-bold dark:text-white text-zinc-900/80">Entrada</h3>
							<input
								type="time"
								value={entrada}
								onChange={(e) => setEntrada(e.target.value)}
								className="w-full bg-white/10 py-2 pl-4 pr-3 font-medium rounded-full border border-white/20 dark:text-white text-zinc-900"
							/>
						</div>
						<div className="w-full">
							<h3 className="text-center pb-1 font-bold dark:text-white text-zinc-900/80">Saída Almoço</h3>
							<input
								type="time"
								value={saidaAlmoco}
								onChange={(e) => setSaidaAlmoco(e.target.value)}
								className="w-full bg-white/10 py-2 pl-4 pr-3 font-medium rounded-full border border-white/20 dark:text-white text-zinc-900"
							/>
						</div>
						<div className="w-full">
							<h3 className="text-center pb-1 font-bold dark:text-white text-zinc-900/80">Retorno</h3>
							<input
								type="time"
								value={retornoAlmoco}
								onChange={(e) => setRetornoAlmoco(e.target.value)}
								className="w-full bg-white/10 py-2 pl-4 pr-3 font-medium rounded-full border border-white/20 dark:text-white text-zinc-900"
							/>
						</div>
					</div>

					<div className="w-full">
						<label className="flex justify-center text-sm font-medium dark:text-white/80 mb-1 text-zinc-900/70">Progresso do dia</label>
						<div className="relative h-6 bg-white/10 rounded-full overflow-hidden border border-white/20">
							<div
								className="h-full bg-teal-400 transition-all duration-500 ease-out"
								style={{ width: `${progresso}%` }}
							></div>
							<div className="absolute inset-0 flex items-center justify-center dark:text-white font-bold text-sm text-zinc-900">
								{progresso}%
							</div>
						</div>
					</div>

					{ultimaAtualizacao && (
						<p className="text-center text-sm dark:text-white/60 text-zinc-900">
							Última atualização: {ultimaAtualizacao}
						</p>
					)}

					{horasTrabalhadas && (
						<p className="text-center text-lg font-semibold dark:text-slate-100 text-zinc-900">
							Horas trabalhadas: {horasTrabalhadas}
						</p>
					)}

					<div className="flex flex-row gap-3 justify-center w-full">
						<button
							onClick={calcularSaidaFinal}
							className="w-auto bg-purple-500/80 text-white font-bold py-2 px-4 rounded-full hover:bg-purple-600/70"
						>
							Calcular saída final
						</button>
						<button
							onClick={limparCampos}
							className="w-auto dark:text-white font-bold py-2 px-4 rounded-full hover:bg-white/10 text-zinc-900"
						>
							Limpar dados
						</button>
					</div>

					{saidaFinal && (
						<p className="text-center font-semibold dark:text-white border bg-white/10 border-white/20 rounded-2xl p-4 text-zinc-900">
							<p className="dark:text-white/90 text-zinc-900/80"> Saída final: </p> <p className="text-3xl font-bold">{saidaFinal}</p>
						</p>
					)}
				</div>
				<div className="botao__ponto flex justify-center py-4 w-full" style={{fontVariationSettings: "'FILL' 1"}}>
					<a className="bg-white backdrop-blur-sm w-full py-3 rounded-2xl font-semibold hover:bg-white/90 flex justify-center items-center gap-2"
					href="https://awstou.ifractal.com.br/fulltime/phonto.php" target="_blank">
						Bater o ponto
						<span class="material-symbols-outlined"> exit_to_app </span>
					</a>
				</div>
			</div>
			<div className='bg-slate-100 dark:bg-slate-950 w-screen py-2 flex justify-center' style={{fontVariationSettings: "'FILL' 1"}}>
				<a href="https://www.linkedin.com/in/marianunciato/" target="_blank">
					<span className="material-symbols-outlined dark:text-white hover:text-yellow-300 cursor-pointer text-zinc-900">
						star
					</span>
				</a>	
			</div>
		</div>
	);
}
