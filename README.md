🕒 Calculadora de Ponto Inteligente

Uma aplicação web moderna e intuitiva desenvolvida para auxiliar profissionais no controle de jornada de trabalho. Com um design Glassmorphism elegante, o app oferece cálculos automáticos, persistência de dados local e notificações inteligentes.

✨ Funcionalidades Principais

Cálculo em Tempo Real: Previsão automática do horário de saída assim que os dados são inseridos.

Persistência Automática: Seus horários são salvos no navegador (LocalStorage). Se você fechar a aba e voltar, tudo estará lá.

Histórico Inteligente: Ao abrir o app em um novo dia, os dados do dia anterior são arquivados automaticamente no histórico antes de limpar a tela.

Modo Jornada Direta: Configuração para quem trabalha em horário corrido (sem pausa de almoço).

Notificações de Navegador: Receba alertas quando faltarem 15 minutos para a saída e quando a jornada for concluída.

Countdown Dinâmico: Barra de progresso visual que muda de cor conforme a meta diária se aproxima.

Temas Dark/Light: Alternância de temas com backgrounds abstratos de alta qualidade.

🛠️ Tecnologias Utilizadas

React.js: Biblioteca principal para construção da interface e gerenciamento de estado.

Tailwind CSS: Framework de utilitários para estilização rápida, responsiva e moderna.

Hooks Personalizados: Uso avançado de useState, useEffect, useCallback e useRef para lógica de timer e persistência.

Notification API: Integração nativa com o navegador para alertas desktop.

🚀 Como Executar o Projeto

Para rodar este projeto localmente, siga os passos abaixo:

Pré-requisitos

Node.js instalado (v14 ou superior)

NPM ou Yarn

Instalação

Clone o repositório:

git clone [https://github.com/SEU-USUARIO/calculadora-ponto.git](https://github.com/SEU-USUARIO/calculadora-ponto.git)


Entre na pasta do projeto:

cd calculadora-ponto


Instale as dependências:

npm install
# ou
yarn install


Inicie o servidor de desenvolvimento:

npm start
# ou
yarn start


O aplicativo estará disponível em http://localhost:3000.

⚙️ Estrutura do Código

O projeto foi refatorado para seguir boas práticas de componentização:

App.jsx: Gerenciador de estado global e lógica principal.

components/:

TopBar: Controles de tema e acesso a modais.

TimeInputBlock: Inputs reutilizáveis para horários.

ProgressBar: Visualização gráfica do progresso diário.

ExitDisplay: Mostrador de hora de saída e countdown.

Modais: Histórico e Configurações.

utils/: Funções puras para cálculos de tempo e manipulação de strings.

🎨 Design System

O visual foi construído com foco na estética Glassmorphism:

Transparências e desfoque de fundo (backdrop-blur).

Bordas sutis e sombras profundas para hierarquia visual.

Paleta de cores em tons de Roxo, Ciano e Zinco para um visual futurista e limpo.

📄 Licença

Este projeto está sob a licença MIT. Sinta-se livre para usar e modificar.

<p align="center">
Feito com 💜 por <a href="https://www.linkedin.com/in/marianunciato/" target="_blank">Maria Nunciato</a>
</p>
