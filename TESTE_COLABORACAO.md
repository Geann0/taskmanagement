# 🧪 Guia de Teste - Colaboração em Tempo Real

## ✅ Pré-requisitos

- Backend rodando em http://localhost:5000
- Frontend rodando em http://localhost:3000
- MongoDB e Redis containers ativos
- Usuário logado com Google OAuth

## 🎯 Teste Completo do Fluxo

### 1. Criar Projeto

1. Acesse http://localhost:3000/dashboard
2. Clique em **"+ Novo Projeto"**
3. Preencha:
   - Nome: "Teste Colaboração"
   - Descrição: "Testando WebSocket real-time"
   - Visibilidade: Privado
4. Clique em **"Criar Projeto"**
5. ✅ Projeto deve aparecer na lista

### 2. Criar Board

1. Clique no projeto criado
2. Clique em **"+ New Board"**
3. Digite o nome: "Sprint 1"
4. Pressione Enter ou clique fora
5. ✅ Board deve aparecer como tab

### 3. Criar Colunas

1. Clique em **"+ Add Column"**
2. Digite: "To Do" → OK
3. Repita para: "In Progress", "Review", "Done"
4. ✅ Deve ver 4 colunas lado a lado

### 4. Criar Cards

1. Em "To Do", clique em **"+ Add Card"**
2. Digite: "Implementar login"
3. Clique em **"Add Card"**
4. Adicione mais cards:
   - "Criar dashboard"
   - "Integrar API"
5. ✅ Cards devem aparecer na coluna

### 5. Editar Card

1. Clique em qualquer card
2. Altere o título
3. Adicione descrição: "Detalhes da tarefa..."
4. Clique fora ou pressione Esc
5. ✅ Mudanças devem ser salvas

### 6. Deletar Card

1. Clique no botão × no card
2. Confirme a exclusão
3. ✅ Card deve desaparecer

## 🔄 Teste de Colaboração em Tempo Real

### Opção A: Duas Abas (Simulação Simples)

1. **Aba 1**: Abra http://localhost:3000 e faça login
2. **Aba 2**: Abra http://localhost:3000 em aba anônima e faça login
3. **Aba 1**: Entre no mesmo projeto
4. **Aba 2**: Entre no mesmo projeto
5. **Aba 1**: Crie um card
6. ✅ **Aba 2**: Card deve aparecer instantaneamente SEM refresh!

### Opção B: Dois Navegadores (Teste Real)

1. **Chrome**: Faça login e abra o projeto
2. **Firefox/Edge**: Faça login e abra o mesmo projeto
3. **Chrome**: Adicione um card "Teste WebSocket"
4. ✅ **Firefox/Edge**: Card aparece automaticamente!

### Opção C: Dois Computadores (Teste Completo)

1. **PC 1**: Acesse http://localhost:3000
2. **PC 2**: Troque localhost pelo IP da máquina (ex: http://192.168.1.10:3000)
3. Ambos devem estar na mesma rede local
4. Teste criação/edição/deleção
5. ✅ Mudanças devem sincronizar em tempo real!

## 🎬 Ações que Disparam WebSocket

### ✅ Eventos Implementados:

- ➕ **board:created** - Novo board aparece nas tabs
- ➕ **column:created** - Nova coluna aparece no board
- 🗑️ **column:deleted** - Coluna desaparece
- ➕ **card:created** - Novo card aparece na coluna
- ✏️ **card:updated** - Card é atualizado em tempo real
- 🗑️ **card:deleted** - Card desaparece

## 🐛 Debug - Como Verificar WebSocket

### 1. Console do Navegador (F12)

```javascript
// Abra DevTools → Console
// Deve ver:
✅ Socket listeners configured for project: 67890abc...
```

### 2. Network Tab

1. Abra DevTools → Network
2. Filtre por "WS" (WebSocket)
3. Deve ver conexão ativa com `ws://localhost:5000`
4. Clique na conexão → Messages
5. ✅ Deve ver mensagens sendo trocadas

### 3. Backend Logs

```bash
# No terminal do backend, deve ver:
✅ User connected: AbCdEf123
User AbCdEf123 joined project 67890abc
```

## 📊 Resultado Esperado

### Cenário: Usuário A cria card

```
Usuário A                          Backend                          Usuário B
    |                                 |                                 |
    | 1. Clica "Add Card"            |                                 |
    |-------------------------------->|                                 |
    |                                 | 2. Salva no MongoDB             |
    |                                 | 3. Emite evento WebSocket       |
    | 4. Retorna card via HTTP       |-------------------------------->| 5. Recebe evento
    |<--------------------------------|                                 | 6. Atualiza UI
    | 7. Atualiza UI                 |                                 | (SEM refresh!)
```

## ✅ Checklist de Sucesso

- [ ] Projeto criado com sucesso
- [ ] Board criado e visível nas tabs
- [ ] Múltiplas colunas criadas
- [ ] Cards criados e visíveis
- [ ] Edição de card funciona
- [ ] Deleção de card funciona
- [ ] **Teste em 2 abas: mudanças aparecem instantaneamente**
- [ ] Console não mostra erros
- [ ] Network mostra conexão WebSocket ativa

## 🎉 Próximos Passos

Se todos os testes passaram:

1. ✅ Sistema de colaboração real-time funcional!
2. 🔜 Implementar drag & drop de cards entre colunas
3. 🔜 Adicionar notificações push
4. 🔜 Mostrar "quem está online" no projeto
5. 🔜 Histórico de atividades em tempo real

## 🆘 Problemas Comuns

### Cards não aparecem em tempo real

- Verifique se WebSocket está conectado (Network tab)
- Confirme que ambos usuários estão no MESMO projeto
- Verifique logs do backend para eventos emitidos

### Erro "Socket not connected"

- Reinicie o backend: `npm run dev`
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Verifique se porta 5000 está livre

### Mudanças não salvam

- Verifique conexão com MongoDB: `docker ps`
- Confirme que container taskapp-mongodb está rodando
- Teste endpoint: http://localhost:5000/health

---

**🚀 Boa sorte com os testes! O sistema está pronto para uso!**
