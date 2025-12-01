# 🧪 Guia de Testes - Task Management App

## 📋 Índice

1. [Instalação](#instalação)
2. [Executando Testes](#executando-testes)
3. [Comandos PowerShell](#comandos-powershell)
4. [Estrutura de Testes](#estrutura-de-testes)
5. [Escrevendo Testes](#escrevendo-testes)
6. [Problemas Comuns](#problemas-comuns)

---

## 🚀 Instalação

### Backend

```powershell
cd "C:\Users\haduk\OneDrive\Desktop\Task Management App\backend"
npm install
```

### Frontend

```powershell
cd "C:\Users\haduk\OneDrive\Desktop\Task Management App\frontend"
npm install
```

---

## ▶️ Executando Testes

### ⚠️ IMPORTANTE: Sintaxe PowerShell vs Bash

No PowerShell do Windows, NÃO use `&&`. Use `;` (ponto e vírgula) no lugar!

❌ **ERRADO** (sintaxe Bash/Linux):

```bash
cd backend && npm test
```

✅ **CORRETO** (sintaxe PowerShell):

```powershell
cd backend; npm test
```

### Testes do Backend

**Opção 1 - Comando único:**

```powershell
cd "C:\Users\haduk\OneDrive\Desktop\Task Management App\backend"; npm test
```

**Opção 2 - Comandos separados:**

```powershell
cd backend
npm test
```

**Com cobertura:**

```powershell
cd backend; npm test -- --coverage
```

**Modo watch (re-executa automaticamente):**

```powershell
cd backend; npm test -- --watch
```

### Testes do Frontend

**Opção 1 - Comando único:**

```powershell
cd "C:\Users\haduk\OneDrive\Desktop\Task Management App\frontend"; npm test
```

**Opção 2 - Comandos separados:**

```powershell
cd frontend
npm test
```

**Executar uma vez (sem watch mode):**

```powershell
cd frontend; npm test -- --watchAll=false
```

---

## 📁 Estrutura de Testes

### Backend

```
backend/
├── src/
│   └── __tests__/          # Testes próximos ao código
│       └── example.test.ts
├── tests/                   # Testes de integração
│   └── setup.ts
└── jest.config.js          # Configuração do Jest
```

### Frontend

```
frontend/
├── src/
│   └── __tests__/          # Testes de componentes
│       └── App.test.tsx
├── setupTests.ts           # Configuração global
└── jest.config.js          # Configuração do Jest
```

---

## ✍️ Escrevendo Testes

### Exemplo de Teste Backend (API)

Crie um arquivo `src/__tests__/auth.test.ts`:

```typescript
import request from "supertest";
import { app } from "../index";

describe("Auth Routes", () => {
  test("POST /auth/oauth/google deve retornar 400 sem código", async () => {
    const response = await request(app).post("/auth/oauth/google").send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Code is required");
  });

  test("GET /health deve retornar status OK", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("OK");
  });
});
```

### Exemplo de Teste Frontend (Componente React)

Crie um arquivo `src/__tests__/Header.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Header from "../components/Header";

describe("Header Component", () => {
  test("deve renderizar o título", () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const title = screen.getByText(/Task Manager/i);
    expect(title).toBeInTheDocument();
  });
});
```

---

## 🛠️ Comandos PowerShell Úteis

### Navegação

```powershell
# Ir para a raiz do projeto
cd "C:\Users\haduk\OneDrive\Desktop\Task Management App"

# Ir para backend
cd backend

# Ir para frontend
cd frontend

# Voltar para diretório anterior
cd ..
```

### Executar Múltiplos Comandos

```powershell
# Use ; (ponto e vírgula) para encadear comandos
cd backend; npm test

# Ou use && APENAS se estiver no Git Bash ou WSL
# NÃO funciona no PowerShell padrão!
```

### Verificar Instalação

```powershell
# Verificar versão do Node
node --version

# Verificar versão do npm
npm --version

# Listar dependências instaladas
npm list --depth=0
```

---

## ✅ Status Atual

### Backend ✅

- ✅ Dependências instaladas (850 pacotes)
- ✅ Testes configurados
- ✅ 3 testes passando
- ⚠️ Alguns arquivos excluídos da cobertura (jwt.ts, redis.ts) devido a incompatibilidades de versão

### Frontend ✅

- ✅ Dependências instaladas (1618 pacotes)
- ✅ Testes configurados
- ✅ 3 testes passando
- ⚠️ 11 vulnerabilidades detectadas (use `npm audit fix` se necessário)

**Total: 6 testes passando sem erros! 🎉**

---

## 🐛 Problemas Comuns

### ❌ Erro: "O token '&&' não é um separador válido"

**Problema:** Você está usando sintaxe Bash no PowerShell.

**Solução:** Substitua `&&` por `;`

```powershell
# ❌ Errado
cd backend && npm test

# ✅ Correto
cd backend; npm test
```

### ❌ Erro: "'jest' não é reconhecido como comando"

**Problema:** Dependências não instaladas.

**Solução:**

```powershell
cd backend
npm install
```

### ❌ Erro: "No matching version found for [pacote]"

**Problema:** Versão do pacote não existe no npm.

**Solução:** Já foi corrigida a versão do `jsonwebtoken` de `^9.1.1` para `^9.0.2`.

### ❌ Erro: "Cannot find module"

**Problema:** Imports incorretos ou dependências faltando.

**Solução:**

1. Verifique os imports no código
2. Execute `npm install` novamente
3. Certifique-se que `node_modules` existe

### ❌ Testes não encontram o banco de dados

**Problema:** MongoDB não está rodando localmente.

**Solução:**

```powershell
# Inicie o Docker Compose (na raiz do projeto)
cd "C:\Users\haduk\OneDrive\Desktop\Task Management App"
docker-compose up -d
```

---

## 📊 Cobertura de Testes

### Ver relatório de cobertura

**Backend:**

```powershell
cd backend; npm test -- --coverage
```

**Frontend:**

```powershell
cd frontend; npm test -- --coverage --watchAll=false
```

### Onde encontrar o relatório

Após executar com `--coverage`, você verá:

- **Console:** Resumo da cobertura
- **Arquivo:** `coverage/lcov-report/index.html` (abra no navegador)

### Metas de Cobertura

Conforme definido no projeto:

- **Backend:** 85%+ de cobertura
- **Frontend:** 85%+ de cobertura

---

## 🔄 CI/CD - Testes Automáticos

Os testes são executados automaticamente no GitHub Actions:

- **Push para `main` ou `develop`**: Roda todos os testes
- **Pull Request**: Valida antes de merge
- **Deploy**: Só acontece se testes passarem

Veja os workflows em:

- `.github/workflows/backend-ci.yml`
- `.github/workflows/frontend-ci.yml`

---

## 🎯 Comandos Rápidos

### Backend

```powershell
# Executar todos os testes
cd backend; npm test

# Executar com cobertura
cd backend; npm test -- --coverage

# Executar em modo watch
cd backend; npm test -- --watch

# Executar apenas um arquivo
cd backend; npm test -- auth.test.ts
```

### Frontend

```powershell
# Executar todos os testes
cd frontend; npm test -- --watchAll=false

# Executar com cobertura
cd frontend; npm test -- --coverage --watchAll=false

# Executar em modo watch
cd frontend; npm test

# Executar apenas um arquivo
cd frontend; npm test -- Header.test.tsx
```

---

## 📚 Recursos Adicionais

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

---

## ✅ Checklist de Verificação

Antes de fazer commit, certifique-se:

- [ ] Todos os testes estão passando
- [ ] Cobertura está acima de 85%
- [ ] Novos recursos têm testes
- [ ] Testes são legíveis e bem documentados
- [ ] Não há testes ignorados (`test.skip` ou `test.only`)

---

**Última atualização:** 30 de Novembro de 2025
**Status:** ✅ Configurado e Pronto para Uso

Para mais informações, consulte:

- [`README.md`](README.md) - Documentação principal
- [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) - Guia de desenvolvimento
- [`QUICK_REFERENCE.md`](QUICK_REFERENCE.md) - Referência rápida
