# 🔧 Configurar Redirect URI no Google Cloud Console

## ❌ Erro Atual

```
Erro 400: redirect_uri_mismatch
redirect_uri=http://localhost:5000/auth/oauth/google/callback
```

## ✅ Solução - Passo a Passo

### 1. Acessar Google Cloud Console

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Faça login com: **hadukcomenta@gmail.com**

### 2. Localizar suas Credenciais OAuth

1. Na página de **Credenciais**, procure por:
   - **ID do cliente OAuth 2.0**
   - Nome: Provavelmente "Web client" ou similar
   - Client ID: `71179106255-pt7e7pr4ga5dc4qp9gnhuj8ftfha44ir.apps.googleusercontent.com`

### 3. Editar as Credenciais

1. **Clique** no nome ou ícone de editar (lápis) da credencial
2. Você verá duas seções importantes:
   - **Origens JavaScript autorizadas**
   - **URIs de redirecionamento autorizados**

### 4. Adicionar as URIs

#### Origens JavaScript autorizadas:

Adicione esta URI (se ainda não existir):

```
http://localhost:3000
```

#### URIs de redirecionamento autorizados:

Adicione EXATAMENTE esta URI:

```
http://localhost:5000/auth/oauth/google/callback
```

⚠️ **IMPORTANTE**:

- Copie e cole EXATAMENTE como está acima
- Não adicione `/` no final
- Use `http://` e não `https://`
- Use `localhost` e não `127.0.0.1`

### 5. Salvar

1. Clique em **"SALVAR"** no final da página
2. Aguarde alguns segundos para as mudanças serem aplicadas

### 6. Testar Novamente

1. Volte para: http://localhost:3000
2. Clique em "Sign in with Google"
3. Agora deve funcionar!

## 📋 Configuração Completa Esperada

Suas credenciais OAuth devem ficar assim:

### Origens JavaScript autorizadas:

```
http://localhost:3000
```

### URIs de redirecionamento autorizados:

```
http://localhost:5000/auth/oauth/google/callback
```

## 🔍 Verificar Configuração Atual

Se você quiser verificar o que está configurado atualmente:

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Clique na sua credencial OAuth 2.0
3. Verifique se as URIs acima estão listadas

## ⚠️ Problemas Comuns

### "Ainda recebo o mesmo erro"

- Aguarde 1-2 minutos após salvar
- Limpe o cache do navegador (Ctrl + Shift + Delete)
- Tente em uma janela anônima

### "Não encontro minhas credenciais"

- Verifique se está no projeto correto (topo da página)
- Procure por "ID do cliente OAuth 2.0" na lista

### "A URI já está configurada mas não funciona"

- Verifique se não há espaços extras
- Confirme se é `http://` e não `https://`
- Confirme se é `localhost:5000` e não outra porta

## 📸 Captura de Tela de Referência

A tela deve parecer com isto:

```
Nome: [Seu nome do app]

URIs de redirecionamento autorizados:
1 http://localhost:5000/auth/oauth/google/callback  [X]
   [+ ADICIONAR URI]

Origens JavaScript autorizadas:
1 http://localhost:3000  [X]
   [+ ADICIONAR URI]

[CANCELAR]  [SALVAR]
```

## 🎯 Depois de Configurar

Após adicionar a URI corretamente:

1. ✅ O erro "redirect_uri_mismatch" desaparecerá
2. ✅ Você será redirecionado para a tela de consentimento do Google
3. ✅ Após autorizar, voltará para http://localhost:3000 logado
4. ✅ Seu usuário será salvo no MongoDB

## 🔗 Links Úteis

- Google Cloud Console: https://console.cloud.google.com
- Credenciais: https://console.cloud.google.com/apis/credentials
- Documentação OAuth: https://developers.google.com/identity/protocols/oauth2
