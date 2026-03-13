# Pré-IFMA APP📱

Este é um projeto [Expo](https://expo.dev) e [React Native](https://reactnative.dev/) para o aplicativo **Pré-IFMA**. 

O aplicativo tem o objetivo de ajudar os alunos em sua preparação, simulados e testes.

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

### 3. Iniciar o servidor local (Expo)

Com as dependências instaladas, rode o comando abaixo para iniciar o projeto:

```bash
npx expo start
```

Após executar este comando, o Expo irá iniciar um servidor de desenvolvimento e mostrará um **QR Code** no terminal (e abrirá uma página web se você apertar a respectiva tecla).

### 3. Visualizando o aplicativo

- **No Celular Físico:** 
  - *Android*: Abra o app Expo Go do seu celular e escaneie o QR Code.
  - *iOS*: Abra a câmera do seu iPhone, escaneie o QR Code e clique no pop-up para abrir o Expo Go.
- **No Emulador Android (Android Studio):** Aperte a tecla `a` no terminal.
- **No Simulador iOS (Xcode):** Aperte a tecla `i` no terminal.
- **Na Web:** Aperte a tecla `w` no terminal para rodar o app direto no seu navegador.

---

## 🛠️ Tecnologias e Estrutura

- **React Native** & **Expo**: Base do projeto.
- **Expo Router**: Utilizado para gerenciar a navegação e roteamento do aplicativo (com base na estrutura de pastas no diretório `app` / `src/app`).
- **TypeScript**: Utilizado para tipagem do código, dando mais segurança ao desenvolvimento.

Para fazer alterações no projeto, você pode explorar e editar os arquivos contidos principalmente na pasta `src/`. As mudanças serão refletidas quase instantaneamente no aplicativo graças ao recurso de *Fast Refresh*.

## 📚 Links Úteis

- [Documentação Oficial do Expo](https://docs.expo.dev/)
- [Guia de Navegação (Expo Router)](https://docs.expo.dev/router/introduction/)
- [Documentação do React Native](https://reactnative.dev/docs/getting-started)
