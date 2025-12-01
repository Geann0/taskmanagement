# 🔐 Teste do Google OAuth - Task Management App

## ✅ Status Atual

- Backend rodando em: http://localhost:5000
- Frontend rodando em: http://localhost:3000
- MongoDB conectado ✅
- Redis conectado ✅
- Google OAuth configurado ✅

## 🔑 Credenciais Google OAuth

- **Client ID**: 71179106255-pt7e7pr4ga5dc4qp9gnhuj8ftfha44ir.apps.googleusercontent.com
- **Client Secret**: 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
- **Redirect URI**: http://localhost:5000/auth/oauth/google/callback

## 🧪 Como Testar

### 1. Abrir a Aplicação

1. Acesse: http://localhost:3000
2. Você deve ver a tela de login com o botão "Sign in with Google"

### 2. Testar Google OAuth (Fluxo Real)

1. Clique no botão "Sign in with Google"
2. Você será redirecionado para a página de login do Google
3. Faça login com sua conta Google
4. Autorize o aplicativo
5. Você será redirecionado de volta para http://localhost:3000 com um token
6. O frontend irá automaticamente:
   - Salvar o token
   - Salvar os dados do usuário
   - Conectar o WebSocket
   - Redirecionar para /dashboard

### 3. Verificar Dados no MongoDB

Após fazer login, você pode verificar se o usuário foi salvo no MongoDB:

```bash
docker exec -it taskapp-mongodb mongosh -u root -p password --authenticationDatabase admin
```

Dentro do MongoDB shell:

```javascript
use taskapp
db.users.find().pretty()
```

Você deve ver algo como:

```javascript
{
  _id: ObjectId("..."),
  email: "seu-email@gmail.com",
  name: "Seu Nome",
  avatarUrl: "https://lh3.googleusercontent.com/...",
  providers: [
    {
      provider: "google",
      providerId: "123456789..."
    }
  ],
  roles: [],
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### 4. Testar Funcionalidades

Após o login:

1. Dashboard deve carregar
2. Você deve ver seus projetos (vazio inicialmente)
3. WebSocket deve estar conectado (verifique o console do navegador)
4. Tente criar um novo projeto

## 🔧 Troubleshooting

### Erro: "redirect_uri_mismatch"

Se você vir este erro do Google:

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Clique no seu OAuth 2.0 Client ID
3. Verifique se a URI está exatamente: `http://localhost:5000/auth/oauth/google/callback`
4. Salve e tente novamente

### Erro: "Authentication failed"

- Verifique se o MongoDB está rodando: `docker ps`
- Verifique os logs do backend no terminal
- Verifique se as variáveis de ambiente estão corretas em `.env`

### Frontend não redireciona após login

1. Abra o Console do navegador (F12)
2. Verifique se há erros no console
3. Verifique a aba Network para ver as requisições
4. Verifique se o token está na URL após o callback

## 📝 Observações

### Modo Mock (Fallback)

O endpoint `POST /auth/oauth/google` ainda existe para compatibilidade:

- Usado apenas se você chamar diretamente via API
- Não é mais usado pelo fluxo do frontend
- Cria um usuário mock se o banco não estiver disponível

### Fluxo Real do OAuth

1. Frontend: `GET /auth/oauth/google` → Redireciona para Google
2. Google: Usuário autoriza → Redireciona para `/auth/oauth/google/callback?code=...`
3. Backend: Troca code por tokens → Busca dados do usuário → Cria/atualiza no MongoDB
4. Backend: Redireciona para frontend com token e dados do usuário na URL
5. Frontend: Extrai token da URL → Salva no Zustand → Conecta WebSocket → Vai para dashboard

## 🎯 Próximos Passos

- [ ] Testar login com Google
- [ ] Verificar usuário no MongoDB
- [ ] Criar primeiro projeto
- [ ] Testar colaboração em tempo real
- [ ] Adicionar outros usuários ao projeto
