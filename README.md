# Calculadora de Ponto (React)

Uma calculadora de ponto simples feita em React para ajudar a controlar as horas trabalhadas ao longo do dia, considerando entrada, saída para almoço, volta do almoço e cálculo da saída final com base em 8 horas de trabalho.

---

## O que faz?

- Permite registrar horários de entrada, saída para almoço e retorno do almoço.
- Salva esses horários no `localStorage` para manter os dados mesmo após atualizar a página.
- Calcula em tempo real o progresso das 8 horas trabalhadas, mostrando uma barra de progresso.
- Mostra as horas trabalhadas até o momento.
- Calcula o horário da saída final considerando o intervalo de almoço.
- Permite limpar os dados salvos para começar do zero.

---

## Como usar

1. Preencha os campos:

   - **Entrada:** horário que você começou a trabalhar.
   - **Almoço:** horário que você saiu para almoçar.
   - **2ª Entrada:** horário que você voltou do almoço.

2. A barra de progresso atualiza automaticamente mostrando o quanto do seu expediente já foi cumprido (considerando 8 horas).

3. Clique em **"Calcular saída final"** para ver a hora em que você poderá sair do trabalho.

4. Use **"Limpar dados"** para apagar tudo e começar novamente.

---

## Tecnologias

- React (Hooks: useState, useEffect)
- Tailwind CSS para estilização simples e responsiva

---

## Como funciona por trás dos panos?

- Os horários são armazenados no `localStorage` para manter persistência.
- Cada vez que um horário muda, o progresso é recalculado.
- A lógica de cálculo considera:
  - Tempo trabalhado antes do almoço
  - Tempo trabalhado após o almoço (se já voltou)
  - Total de 8 horas (480 minutos) para completar o expediente
- Atualização do progresso acontece a cada minuto automaticamente.

---

## Estrutura do código

- `entrada`, `saidaAlmoco`, `voltaAlmoco` — estados para os horários.
- `progresso` — porcentagem do dia trabalhado.
- `horasTrabalhadas` — tempo total trabalhado formatado.
- `saidaFinal` — horário calculado para saída do trabalho.
- `ultimaAtualizacao` — horário da última atualização do progresso.
- Funções auxiliares para conversão entre `HH:mm` e minutos.
- Função para limpar campos e localStorage.

---

## Rodando localmente

1. Clone o repositório.

2. Instale as dependências:

```bash
npm install
# ou
yarn