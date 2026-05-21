# Pré-IFMA APP📱

Este é um projeto [Expo](https://expo.dev) e [React Native](https://reactnative.dev/) para o aplicativo **Pré-IFMA**. 

O Pré-IFMA é um aplicativo móvel projetado para otimizar a preparação de estudantes para o seletivo do IFMA. Alimentado por uma API que extrai questões de provas oficiais via inteligência artificial, o app oferece simulados, resoluções comentadas por IA e mecânicas de engajamento baseadas em missões diárias, níveis e experiência (XP).  

<p align="center">
  <img src="assets/screenshots/login.png" width="250" alt="Tela de Login" style="max-width: 100%;" />
  <img src="assets/screenshots/dashboard.png" width="250" alt="Tela de Início e Missões" style="max-width: 100%;" />
  <img src="assets/screenshots/question.png" width="250" alt="Tela de Simulado" style="max-width: 100%;" /> 
</p>

 
## 🚀 Como Executar o App

Siga os passos abaixo para baixar, configurar e rodar o aplicativo na sua máquina:

### Pré-requisitos

1. **Node.js**: É necessário ter o [Node.js](https://nodejs.org/) instalado.
2. **Dispositivo Teste**: Você pode testar de algumas formas:
   - **Dispositivo físico (Celular)**: Instale o aplicativo **Expo Go** no seu celular (disponível para [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) e [iOS](https://apps.apple.com/us/app/expo-go/id982107779)).
   - **Emulador**: Tenha um emulador configurado na sua máquina (ex: Android Studio ou Xcode).

### 1. Clonar o Repositório

Primeiro, você precisa clonar o projeto na sua máquina. Abra um terminal e execute o seguinte comando:

```bash
git clone git@github.com:lauanderson-rael/app-preifma.git
```

Em seguida, navegue até a pasta do projeto que foi criada:

```bash
cd app-preifma
```

### 2. Instalar as dependências

No terminal já dentro da pasta (`app-preifma`), instale as dependências usando o `npm`:

```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto copiando o modelo do `.env.example`:

```bash
cp .env.example .env
```

Abra o arquivo `.env` recém-criado e insira a URL da API do backend. Se for testar em um dispositivo físico conectado à mesma rede Wi-Fi, use o endereço IP local do seu computador:

```env
EXPO_PUBLIC_API_BASE_URL=http://[SEU_IP_LOCAL]:8000/api
```

### 4. Iniciar o servidor local (Expo)

Com as dependências e o ambiente configurados, rode o comando abaixo para iniciar o projeto:

```bash
npx expo start
```

Após executar este comando, o Expo irá iniciar um servidor de desenvolvimento e mostrará um **QR Code** no terminal (e abrirá uma página web se você apertar a respectiva tecla).

### 5. Visualizando o aplicativo

- **No Celular Físico:** 
  - *Android*: Abra o app Expo Go do seu celular e escaneie o QR Code.
  - *iOS*: Abra a câmera do seu iPhone, escaneie o QR Code e clique no pop-up para abrir o Expo Go.
- **No Emulador Android (Android Studio):** Aperte a tecla `a` no terminal.
- **No Simulador iOS (Xcode):** Aperte a tecla `i` no terminal.
- **Na Web:** Aperte a tecla `w` no terminal para rodar o app direto no seu navegador.

---

## 🌟 Funcionalidades

O aplicativo oferece uma gama completa de recursos para a preparação dos estudantes:

- **🔐 Autenticação e Segurança**
  - Login e Cadastro de Usuários.
  - Fluxo completo de Recuperação de Senha (Forgot Password).
- **📝 Simulados Completos**
  - Listagem e histórico de simulados.
  - Realização de provas cronometradas.
  - Resultados detalhados com estatísticas de desempenho.
  - Acesso ao gabarito após a conclusão.
- **📚 Modo de Estudo Personalizado**  
  - Resolução de questões aleatórias.  
  - Filtros avançados para escolher questões específicas (por disciplina, modalidade, etc.). 
  - Feedback imediato e resultados da sessão de estudos. 
- **🤖 Explicação com IA**
  - Explicações detalhadas geradas por Inteligência Artificial para as questões, ajudando o aluno a entender profundamente os assuntos. 
- **🎯 Gamificação e Missões**
  - Missões diárias: tarefas que incentivam o estudo regular e premiam com pontos de experiência.
  - Níveis e XP: progressão baseada no desempenho do aluno em simulados e questões.
- **👤 Perfil e Progresso**
  - Acompanhamento do perfil do estudante e seu progresso geral. 

## 🛠️ Tecnologias e Estrutura

- **React Native** & **Expo**: Base do projeto.
- **Expo Router**: Utilizado para gerenciar a navegação e roteamento do aplicativo (com base na estrutura de pastas no diretório `app` / `src/app`).
- **TypeScript**: Utilizado para tipagem do código, dando mais segurança ao desenvolvimento.

## 📚 Links Úteis 

- [Documentação Oficial do Expo](https://docs.expo.dev/)
- [Guia de Navegação (Expo Router)](https://docs.expo.dev/router/introduction/)
- [Documentação do React Native](https://reactnative.dev/docs/getting-started)
