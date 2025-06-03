# Lux - Anime Collection App

Um aplicativo mobile moderno para colecionadores de animes, desenvolvido com React Native e Expo.

<img src="img/Captura de tela 2025-05-20 095429.png" alt="Lux Anime App" width="200">

## Sobre

Lux é um aplicativo que permite aos usuários:
- Descobrir novos animes através da API MyAnimeList
- Adicionar animes à sua coleção pessoal
- Explorar informações detalhadas sobre animes

## Tecnologias

- React Native
- Expo Router
- React Native Paper
- TypeScript

## 📁 Estrutura Detalhada do Projeto

### 📂 app/
Pasta principal do aplicativo que contém todas as telas e rotas.

#### 📂 (tabs)/
Rotas principais organizadas em abas de navegação:
- `index.tsx` - Tela inicial com animes populares e em destaque
- `add.tsx` - Tela para adicionar novos animes à coleção
- `my-animes.tsx` - Tela para gerenciar a coleção pessoal

#### 📄 _layout.tsx
Define o layout base do aplicativo, incluindo:
- Configuração da navegação
- Tema global
- Estrutura de abas

### 📂 components/
Componentes React reutilizáveis:
- Cards de anime
- Modais
- Botões personalizados
- Elementos de UI compartilhados

### 📂 constants/
Arquivos de configuração e constantes:
- `theme.ts` - Define:
  - Cores do aplicativo
  - Espaçamentos
  - Tipografia
  - Estilos globais
  - Tamanhos de componentes

### 📂 services/
Serviços para integração com APIs e gerenciamento de dados:
- `animeService.ts` - Gerencia:
  - Busca de animes na API MyAnimeList
  - Operações CRUD na coleção
  - Gerenciamento de dados locais
  - Integração com backend

### 📂 types/
Definições de tipos TypeScript:
- `anime.ts` - Interfaces para:
  - Dados de anime
  - Resultados de busca
  - Respostas da API
  - Estruturas de dados

### 📂 assets/
Recursos estáticos:
- Imagens
- Ícones
- Fontes
- Recursos visuais

## 🚀 Instalação

```bash
# Instalar dependências
npm install

# Iniciar o app
npx expo start
```

## 💻 Desenvolvimento

Este projeto utiliza Expo Router para navegação baseada em arquivos. A estrutura principal está na pasta `app/(tabs)`.

### 🔄 Fluxo de Dados
1. Interface do usuário (`app/`)
2. Componentes reutilizáveis (`components/`)
3. Serviços de dados (`services/`)
4. Tipos e interfaces (`types/`)
5. Configurações globais (`constants/`)

### 🎨 Estilização
- Utiliza React Native Paper para componentes base
- Tema personalizado definido em `constants/theme.ts`
- Estilos específicos em cada componente
- Design responsivo e adaptativo
