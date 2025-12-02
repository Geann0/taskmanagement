# Task Management App

Aplicativo colaborativo de gestão de tarefas estilo Kanban com funcionalidade de arrastar e soltar, construído com React 18, TypeScript, Node.js/Express, MongoDB e Socket.io.

## 🎯 Funcionalidades

- **Quadro Kanban Colaborativo**: Arraste e solte cartões entre colunas com sincronização em tempo real
- **Colaboração em Tempo Real**: Múltiplos usuários podem trabalhar no mesmo quadro simultaneamente usando Socket.io
- **Gerenciamento de Tarefas**: Crie, edite e exclua tarefas com prioridades, datas de vencimento e atribuições
- **Comentários e Atividades**: Adicione comentários aos cartões e acompanhe logs de atividades
- **Notificações**: Notificações no aplicativo e push para eventos de tarefas
- **Integração com Google Calendar**: Sincronize tarefas com o Google Calendar
- **Permissões**: Controle de acesso granular (Owner, Admin, Editor, Commenter, Viewer)
- **Relatórios em PDF**: Exporte relatórios de projetos em PDF
- **Design Responsivo**: Funciona perfeitamente em desktop e dispositivos móveis

## 🏗️ Arquitetura

### Frontend

- **Framework**: React 18 + TypeScript
- **Gerenciamento de Estado**: Zustand + TanStack Query (React Query)
- **Tempo Real**: Cliente Socket.io
- **Drag & Drop**: React DnD
- **Estilização**: Tailwind CSS
- **Roteamento**: React Router v6

### Backend

- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Banco de Dados**: MongoDB (Mongoose ORM)
- **Tempo Real**: Socket.io
- **Autenticação**: OAuth2 (Google) + JWT
- **Jobs**: Bull + Redis para tarefas em background
- **Documentação API**: Swagger (OpenAPI 3.0)

### Infraestrutura

- **Deploy Frontend**: Netlify
- **Deploy Backend**: Heroku
- **Cache & Pub/Sub**: Redis
- **Rastreamento de Erros**: Sentry
- **CI/CD**: GitHub Actions

## 🚀 Como Começar

### Pré-requisitos

- Node.js 18+ (LTS)
- npm ou yarn
- Docker & Docker Compose (para desenvolvimento local)

### Configuração do Ambiente de Desenvolvimento

#### 1. Clone e Navegue até o Projeto

```bash
cd "Task Management App"
```

#### 2. Inicie os Serviços de Banco de Dados e Cache

```bash
docker-compose up -d
```

Isso inicia o MongoDB e Redis localmente.

#### 3. Configuração do Backend

```bash
cd backend

# Copie as variáveis de ambiente
cp .env.example .env

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O backend executa em `http://localhost:5000`

#### 4. Configuração do Frontend (em um novo terminal)

```bash
cd frontend

# Copie as variáveis de ambiente
cp .env.example .env

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm start
```

O frontend executa em `http://localhost:3000`

### Variáveis de Ambiente

#### Backend (.env)

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/taskapp
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/oauth/google/callback
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=seu_google_client_id
```

Veja os arquivos `.env.example` para listas completas de variáveis.

## 📁 Estrutura do Projeto

```
Task Management App/
├── frontend/                    # Frontend React 18 + TypeScript
│   ├── src/
│   │   ├── components/         # Componentes React reutilizáveis
│   │   ├── contexts/           # Context API (Toast, etc)
│   │   ├── pages/              # Componentes de página
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # Cliente da API
│   │   ├── lib/                # Socket.io e gerenciamento de estado
│   │   ├── types/              # Definições de tipos TypeScript
│   │   ├── styles/             # Estilos globais
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .eslintrc.json
│   └── .env.example
│
├── backend/                     # Backend Express + MongoDB
│   ├── src/
│   │   ├── routes/             # Manipuladores de rotas da API
│   │   ├── controllers/        # Lógica de negócio
│   │   ├── services/           # Camada de serviço (Google Calendar, etc)
│   │   ├── models/             # Schemas do Mongoose
│   │   ├── middleware/         # Middleware do Express
│   │   ├── sockets/            # Manipuladores de eventos Socket.io
│   │   ├── jobs/               # Manipuladores de jobs em background
│   │   ├── utils/              # Funções utilitárias (JWT, etc)
│   │   └── index.ts            # Ponto de entrada do servidor
│   ├── tests/                  # Arquivos de teste
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── .eslintrc.json
│   └── .env.example
│
├── docs/                        # Documentação
├── docker-compose.yml          # Serviços de desenvolvimento local
├── .gitignore
└── README.md                   # Este arquivo
```

## 🧪 Testes

### Testes do Backend

```bash
cd backend

# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Gerar relatório de cobertura
npm test -- --coverage
```

### Testes do Frontend

```bash
cd frontend

# Executar todos os testes
npm test

# Executar testes em modo watch
npm test -- --watch
```

### Testes E2E

```bash
cd frontend

# Executar testes Cypress (requer backend em execução)
npm run cypress:open
```

## 📝 Qualidade de Código

### Linting

```bash
cd backend
npm run lint          # Verificar erros de linting
npm run lint:fix      # Corrigir erros de linting

cd ../frontend
npm run lint
npm run lint:fix
```

### Formatação de Código

```bash
cd backend
npm run format

cd ../frontend
npm run format
```

## 🔗 Documentação da API

A API está documentada usando Swagger. Uma vez que o backend estiver em execução, visite:

```
http://localhost:5000/api-docs
```

### Principais Endpoints

- `POST /auth/oauth/google` - Login OAuth2
- `GET/POST /projects` - Gerenciamento de projetos
- `GET/POST /projects/:projectId/boards` - Gerenciamento de quadros
- `GET/POST /columns/:columnId/cards` - Gerenciamento de cartões
- `GET/PUT /notifications` - Notificações
- `POST /projects/:projectId/calendar/sync` - Sincronização com Google Calendar

## 🔐 Segurança

- **Somente HTTPS**: Todo o tráfego de produção é criptografado
- **Proteção CSRF**: Tokens CSRF para operações que alteram estado
- **Prevenção XSS**: Validação de entrada e codificação de saída
- **Rate Limiting**: Limitação de taxa da API em endpoints sensíveis
- **Autenticação JWT**: Autenticação segura baseada em token (7 dias de validade)
- **Secrets de Ambiente**: Dados sensíveis armazenados em variáveis de ambiente

## 😢 Deploy

### Frontend (Netlify)

```bash
cd frontend
npm run build
# Deploy gerenciado pelo Netlify
```

### Backend (Heroku)

```bash
cd backend
npm run build
git push heroku main
```

Veja os guias de deploy em `/docs` para instruções detalhadas.

## 📊 Schema do Banco de Dados

### User (Usuário)

- email (unique)
- name
- avatarUrl
- providers (credenciais OAuth2)
- roles (permissões por projeto)

### Project (Projeto)

- name
- description
- visibility (private, team, public)
- members (com roles)
- settings (sincronização de calendário, atribuidor padrão)

### Board (Quadro)

- projectId
- name
- columnsOrder

### Column (Coluna)

- boardId
- title
- order
- limit (limite WIP, opcional)

### Card (Cartão)

- columnId, boardId, projectId
- title, description
- assignees, tags
- priority, dueDate
- comments, activityLog
- attachments
- calendarEventId (Google Calendar)

### Notification (Notificação)

- userId
- type (task_assigned, task_moved, etc.)
- payload
- status de leitura

## 🤝 Contribuindo

1. Crie um branch de feature: `git checkout -b feature/sua-feature`
2. Commit suas mudanças: `git commit -am 'Adiciona feature'`
3. Push para o branch: `git push origin feature/sua-feature`
4. Abra um pull request

## 📋 Checklist de Desenvolvimento

- [x] Configurar ambiente local com Docker Compose
- [x] Configurar credenciais OAuth2
- [x] Executar servidores backend e frontend
- [x] Criar dados de teste no MongoDB
- [x] Testar funcionalidade drag-and-drop
- [x] Verificar sincronização em tempo real
- [x] Implementar integração Google Calendar
- [x] Sistema de notificações toast
- [x] Correção de timezone para datas
- [x] Executar suíte de testes (meta 85% de cobertura)
- [x] Verificar linting e formatação
- [x] Revisar documentação da API

## 📅 Marcos do Projeto

1. **Semanas 1-2**: Configuração do projeto, autenticação, CRUD básico
2. **Semanas 3-4**: UI Kanban, drag-and-drop, sincronização em tempo real
3. **Semanas 5-6**: Notificações, integração com calendário
4. **Semanas 7-8**: Relatórios, exportação PDF, testes
5. **Semana 9**: Hardening de produção, deploy

## 📞 Suporte

Para problemas, questões ou sugestões, abra uma issue no GitHub ou entre em contato com a equipe de desenvolvimento.

## 📄 Licença

Licença MIT - Veja o arquivo LICENSE para detalhes.
