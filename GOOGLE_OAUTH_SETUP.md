# 🔐 Configuração do Google OAuth 2.0

## Passo 1: Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Clique em **"Selecionar projeto"** > **"Novo projeto"**
3. Nome do projeto: `Task Management App`
4. Clique em **"Criar"**

## Passo 2: Configurar Tela de Consentimento OAuth

1. No menu lateral, vá em **"APIs e serviços"** > **"Tela de consentimento OAuth"**
2. Selecione **"Externo"** (para teste) > **"Criar"**
3. Preencha:
   - **Nome do app**: Task Management App
   - **E-mail de suporte do usuário**: seu-email@gmail.com
   - **E-mail do desenvolvedor**: seu-email@gmail.com
4. Clique em **"Salvar e continuar"**
5. Em **"Escopos"**, clique em **"Adicionar ou remover escopos"**
6. Selecione:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
7. Clique em **"Atualizar"** > **"Salvar e continuar"**
8. Em **"Usuários de teste"**, adicione seu e-mail
9. Clique em **"Salvar e continuar"**

## Passo 3: Criar Credenciais OAuth 2.0

1. No menu lateral, vá em **"Credenciais"**
2. Clique em **"+ Criar credenciais"** > **"ID do cliente OAuth"**
3. Tipo de aplicativo: **"Aplicativo da Web"**
4. Nome: `Task Management App Web Client`
5. **URIs de redirecionamento autorizados**, adicione:
   ```
   http://localhost:3000
   http://localhost:3000/auth/callback
   ```
6. Clique em **"Criar"**
7. **Copie o Client ID e Client Secret** que aparecem

## Passo 4: Configurar as Variáveis de Ambiente

Abra o arquivo `backend/.env` e atualize:

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
```

Abra o arquivo `frontend/.env` e atualize:

```env
REACT_APP_GOOGLE_CLIENT_ID=seu_client_id_aqui
```

## Passo 5: Testar

1. Reinicie o backend: `npm run dev:backend`
2. Acesse `http://localhost:3000/login`
3. Clique em "Sign in with Google"
4. Faça login com sua conta Google

---

## 🔍 Verificar se está funcionando:

**Verificar MongoDB:**

```powershell
docker exec -it taskapp-mongodb mongosh -u root -p password --authenticationDatabase admin
```

Dentro do mongosh:

```javascript
use taskapp
db.users.find().pretty()
```

Você deve ver o usuário criado após o login do Google.

---

## 📝 Notas:

- **Modo de desenvolvimento**: Sem HTTPS funciona apenas com localhost
- **Produção**: Configure domínio real e HTTPS
- **Limite de usuários**: Modo externo tem limite, publique o app para remover

---

## 🚨 Problemas Comuns:

**Erro "redirect_uri_mismatch":**

- Verifique se a URI no código corresponde exatamente à configurada no Google Cloud Console

**Erro "Access blocked":**

- Adicione seu e-mail nos "Usuários de teste"

**Token inválido:**

- Verifique se `JWT_SECRET` está configurado no `.env`
