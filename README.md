# Lux - Anime Collection App

Um aplicativo mobile moderno para colecionadores de animes, desenvolvido com React Native e Expo.

<img src="img/Captura de tela 2025-05-20 095429.png" alt="Lux Anime App" width="200">

## Sobre

Lux é um aplicativo que permite aos usuários:
- Descobrir novos animes através da API MyAnimeList
- Adicionar animes à sua coleção pessoal
- Gerenciar favoritos
- Explorar informações detalhadas sobre animes

## Tecnologias

- React Native
- Expo Router
- React Native Paper
- TypeScript

## Estrutura do Projeto

```
lux-anime-app/
├── app/                    # Pasta principal do aplicativo
│   ├── (tabs)/            # Rotas principais do app
│   │   ├── index.tsx      # Tela inicial com animes populares
│   │   ├── add.tsx        # Tela de adicionar novos animes
│   │   └── my-animes.tsx  # Tela de gerenciar coleção
│   └── _layout.tsx        # Layout principal do app
├── components/            # Componentes reutilizáveis
├── constants/            # Constantes e temas
│   └── theme.ts         # Configurações de tema
├── services/            # Serviços e integrações
│   └── animeService.ts  # Serviço de gerenciamento de animes
├── types/               # Definições de tipos TypeScript
│   └── anime.ts        # Interfaces relacionadas a animes
└── assets/             # Recursos estáticos (imagens, fontes)
```

### Descrição das Pastas

- **app/**: Contém todas as telas e rotas do aplicativo usando Expo Router
  - **(tabs)/**: Rotas principais organizadas em abas
  - **_layout.tsx**: Define o layout base do aplicativo

- **components/**: Componentes React reutilizáveis em todo o app

- **constants/**: Arquivos de configuração e constantes
  - **theme.ts**: Define cores, espaçamentos e estilos globais

- **services/**: Serviços para integração com APIs e gerenciamento de dados
  - **animeService.ts**: Gerencia todas as operações relacionadas a animes

- **types/**: Definições de tipos TypeScript
  - **anime.ts**: Interfaces para dados de animes

- **assets/**: Recursos estáticos como imagens e fontes

## Instalação

```bash
# Instalar dependências
npm install

# Iniciar o app
npx expo start
```

## Desenvolvimento

Este projeto utiliza Expo Router para navegação baseada em arquivos. A estrutura principal está na pasta `app/(tabs)`.
