# 🚀 Primeiros Passos - Task Management App

## ✅ Status da Configuração

**Tudo está pronto para uso!**

- ✅ Backend configurado e testado (3 testes passando)
- ✅ Frontend configurado e testado (3 testes passando)
- ✅ Dependências instaladas (850 backend + 1618 frontend)
- ✅ Documentação completa em português

---

## 🎯 O Que Você Pode Fazer Agora

### 1️⃣ Executar os Testes

**Backend:**

```powershell
cd "C:\Users\haduk\OneDrive\Desktop\Task Management App\backend"
npm test
```

**Frontend:**

```powershell
cd "C:\Users\haduk\OneDrive\Desktop\Task Management App\frontend"
npm test -- --watchAll=false
```

---

### 2️⃣ Iniciar os Serviços (MongoDB + Redis)

**Certifique-se de ter o Docker instalado!**

```powershell
cd "C:\Users\haduk\OneDrive\Desktop\Task Management App"
docker-compose up -d
```

**Verificar se está rodando:**

```powershell
docker ps
```

Você deve ver:

- `mongo:latest` - MongoDB na porta 27017
- `redis:alpine` - Redis na porta 6379

---

### 3️⃣ Rodar o Backend

```powershell
cd "C:\Users\haduk\OneDrive\Desktop\Task Management App\backend"
npm run dev
```

O backend estará disponível em:

- **API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

---

### 4️⃣ Rodar o Frontend

**Em outro terminal:**

```powershell
cd "C:\Users\haduk\OneDrive\Desktop\Task Management App\frontend"
npm start
```

O frontend abrirá automaticamente em:

- **App:** http://localhost:3000

---

## 📚 Documentação Disponível

1. **GUIA_TESTES.md** - Guia completo de testes (português)
2. **RESUMO_CONFIGURACAO.md** - Resumo das correções aplicadas
3. **README.md** - Documentação principal do projeto
4. **docs/API.md** - Documentação da API REST e Socket.io
5. **docs/ARCHITECTURE.md** - Arquitetura do sistema
6. **docs/DEVELOPMENT.md** - Guia de desenvolvimento
7. **docs/DEPLOYMENT.md** - Guia de deploy em produção
8. **QUICK_REFERENCE.md** - Referência rápida de comandos

---

## ⚡ Comandos Úteis

### Desenvolvimento

```powershell
# Backend em modo de desenvolvimento (com hot-reload)
cd backend; npm run dev

# Frontend em modo de desenvolvimento
cd frontend; npm start

# Rodar linters
cd backend; npm run lint
cd frontend; npm run lint

# Formatar código
cd backend; npm run format
cd frontend; npm run format
```

### Testes

```powershell
# Backend - todos os testes
cd backend; npm test

# Backend - com cobertura
cd backend; npm test -- --coverage

# Backend - modo watch
cd backend; npm test -- --watch

# Frontend - executar uma vez
cd frontend; npm test -- --watchAll=false

# Frontend - com cobertura
cd frontend; npm test -- --coverage --watchAll=false
```

### Build de Produção

```powershell
# Backend
cd backend; npm run build

# Frontend
cd frontend; npm run build
```

### Docker

```powershell
# Iniciar serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Parar e limpar volumes
docker-compose down -v
```

---

## 🔧 Variáveis de Ambiente

### Backend (.env)

Crie um arquivo `.env` na pasta `backend/`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/task-management
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=seu-secret-super-seguro-aqui
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OAuth Google
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/oauth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

Crie um arquivo `.env` na pasta `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=seu-google-client-id
```

---

## 🎨 Estrutura do Projeto

```
Task Management App/
├── backend/                    # API Node.js + Express
│   ├── src/
│   │   ├── models/            # Modelos MongoDB
│   │   ├── routes/            # Rotas da API
│   │   ├── middleware/        # Middlewares
│   │   ├── sockets/           # Socket.io
│   │   ├── utils/             # Utilitários
│   │   └── __tests__/         # Testes
│   ├── package.json
│   └── jest.config.js
│
├── frontend/                   # App React + TypeScript
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── pages/             # Páginas
│   │   ├── services/          # Serviços (API, etc)
│   │   ├── lib/               # Bibliotecas (Socket, Store)
│   │   ├── types/             # TypeScript types
│   │   └── __tests__/         # Testes
│   ├── package.json
│   └── jest.config.js
│
├── docs/                       # Documentação
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   └── DEPLOYMENT.md
│
├── docker-compose.yml          # Docker services
├── GUIA_TESTES.md             # Guia de testes (PT)
├── RESUMO_CONFIGURACAO.md     # Resumo das correções
└── README.md                   # Documentação principal
```

---

## 🐛 Troubleshooting

### MongoDB não conecta

```powershell
# Verificar se o Docker está rodando
docker ps

# Se não estiver, iniciar:
docker-compose up -d

# Ver logs do MongoDB:
docker-compose logs mongo
```

### Redis não conecta

```powershell
# Ver logs do Redis:
docker-compose logs redis

# Reiniciar serviços:
docker-compose restart
```

### Porta já em uso

```powershell
# Verificar o que está usando a porta 5000:
netstat -ano | findstr :5000

# Ou porta 3000:
netstat -ano | findstr :3000

# Matar o processo (substitua <PID> pelo número do processo):
taskkill /PID <PID> /F
```

### Testes falhando

```powershell
# Reinstalar dependências:
cd backend; Remove-Item node_modules -Recurse -Force; npm install
cd frontend; Remove-Item node_modules -Recurse -Force; npm install
```

---

## 🌟 Próximos Passos Sugeridos

### Desenvolvimento

1. **Implementar Autenticação:**

   - Configure OAuth Google no Google Cloud Console
   - Adicione suas credenciais no `.env`
   - Teste o fluxo de login

2. **Adicionar Testes de Integração:**

   - Testes de API com Supertest
   - Testes de componentes React
   - Aumentar cobertura de código

3. **Implementar Features Principais:**

   - Sistema de Boards Kanban
   - Drag and Drop de Cards
   - Notificações em tempo real
   - Colaboração multi-usuário

4. **Melhorias de UI:**
   - Adicionar mais componentes Tailwind
   - Implementar dark mode
   - Criar animações e transições

### Deploy

1. **Backend:**

   - Deploy no Heroku, Railway ou Render
   - Configure MongoDB Atlas (cloud)
   - Configure Redis Cloud

2. **Frontend:**

   - Deploy no Netlify ou Vercel
   - Configure variáveis de ambiente
   - Configure domínio customizado

3. **CI/CD:**
   - Os workflows do GitHub Actions já estão configurados
   - Faça push para `main` ou `develop`
   - Testes rodarão automaticamente

---

## 📞 Precisa de Ajuda?

- **Guia de Testes:** Leia `GUIA_TESTES.md`
- **Problemas Comuns:** Veja `RESUMO_CONFIGURACAO.md`
- **API Documentation:** Consulte `docs/API.md`
- **Arquitetura:** Entenda o sistema em `docs/ARCHITECTURE.md`

---

## ✅ Checklist de Verificação

Antes de começar o desenvolvimento:

- [ ] Docker está instalado e rodando
- [ ] MongoDB e Redis estão rodando (`docker ps`)
- [ ] Arquivos `.env` estão configurados (backend e frontend)
- [ ] Dependências instaladas (`npm install` em ambos)
- [ ] Testes passando (`npm test` em ambos)
- [ ] Backend rodando em http://localhost:5000
- [ ] Frontend rodando em http://localhost:3000

---

**Tudo pronto! 🎉 Comece a desenvolver!**

Para testar a estrutura básica, execute:

```powershell
# Terminal 1: Backend
cd backend; npm run dev

# Terminal 2: Frontend
cd frontend; npm start

# Terminal 3: Testes (opcional)
cd backend; npm test -- --watch
```

**Última atualização:** 30 de Novembro de 2025  
**Status:** ✅ Pronto para Desenvolvimento
