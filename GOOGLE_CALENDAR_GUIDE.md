# 📅 Guia de Integração Google Calendar

## Visão Geral

A integração com o Google Calendar permite sincronizar cards com datas de vencimento diretamente para o seu Google Calendar, criando eventos automaticamente.

## Como Usar

### 1. Adicionar Data de Vencimento a um Card

1. Clique em um card para editá-lo
2. Você verá um campo de data abaixo da descrição
3. Selecione a data de vencimento desejada
4. Clique em "Save"

O card agora mostrará um ícone 📅 com a data formatada.

### 2. Sincronizar com Google Calendar

1. Abra um projeto no Task Management App
2. Certifique-se de estar autenticado com Google (via Google OAuth)
3. Clique no botão **"📅 Sync Calendar"** no topo da página do board
4. O sistema irá:
   - Buscar todos os cards com `dueDate` no projeto
   - Criar eventos no seu Google Calendar (calendário principal)
   - Cada evento terá duração de 1 hora
   - O título será `[Task] Nome do Card`
   - A descrição será a descrição do card

### 3. Resultado

Após a sincronização, você verá uma mensagem com:

- Número de eventos criados
- Total de cards com datas
- Erros (se houver)

```
✅ Successfully synced 5 cards to Google Calendar

Events created: 5/5
```

## Detalhes Técnicos

### Backend

**Endpoint:** `POST /projects/:projectId/calendar/sync`

**Autenticação:** Bearer Token (JWT)

**Requisitos:**

- Usuário deve estar autenticado via Google OAuth
- Usuário deve ter `accessToken` e `refreshToken` do Google
- Usuário deve ser membro do projeto

**Resposta de Sucesso:**

```json
{
  "message": "Successfully synced 5 cards to Google Calendar",
  "eventsCreated": 5,
  "totalCards": 5,
  "errors": []
}
```

**Resposta de Erro:**

```json
{
  "message": "Google Calendar not connected. Please authenticate with Google first."
}
```

### Service: GoogleCalendarService

**Localização:** `backend/src/services/googleCalendar.ts`

**Métodos Disponíveis:**

- `createEvent(event: CalendarEvent)` - Cria evento
- `updateEvent(eventId, event)` - Atualiza evento existente
- `deleteEvent(eventId)` - Remove evento
- `listEvents(maxResults)` - Lista eventos

### Schema do Card

O Card agora possui dois novos campos:

```typescript
interface ICard {
  // ... outros campos
  dueDate?: Date; // Data de vencimento
  calendarEventId?: string; // ID do evento no Google Calendar
}
```

### Frontend

**Componente Card:**

- Input de data tipo `date` no modo de edição
- Display visual da data com ícone 📅
- Formatação em pt-BR: `dd/mm/yyyy`

**Página de Projeto:**

- Botão "📅 Sync Calendar" no header do board
- Mensagens de feedback com alertas do navegador
- Integração com `apiClient.syncProjectCalendar()`

## Fluxo de Sincronização

```
1. Usuário clica em "Sync Calendar"
   ↓
2. Frontend chama POST /projects/:projectId/calendar/sync
   ↓
3. Backend verifica permissões e credenciais Google
   ↓
4. Backend busca cards com dueDate
   ↓
5. Para cada card:
   - Verifica se já tem calendarEventId (evita duplicatas)
   - Cria evento no Google Calendar
   - Salva calendarEventId no card
   ↓
6. Retorna resultado ao frontend
   ↓
7. Frontend exibe mensagem de sucesso/erro
```

## Configuração Necessária

### Variáveis de Ambiente (.env)

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/oauth/google/callback
```

### Scopes OAuth (já configurados)

```typescript
const scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/calendar.events", // Necessário para Calendar
];
```

## Limitações Atuais

1. **Sincronização Manual:** Requer clique no botão "Sync Calendar"
2. **Eventos Únicos:** Cada card gera apenas 1 evento (não recorrente)
3. **Duração Fixa:** Todos os eventos têm 1 hora de duração
4. **Calendário Principal:** Sempre usa o calendário "primary" do usuário
5. **Timezone:** Configurado para "America/Sao_Paulo"
6. **Sem Atualização Automática:** Mudanças no card não atualizam o evento automaticamente

## Melhorias Futuras

- [ ] Sincronização automática em tempo real (via WebSocket)
- [ ] Atualizar eventos quando `dueDate` é modificado
- [ ] Deletar eventos quando card é removido
- [ ] Permitir escolher calendário de destino
- [ ] Configurar duração personalizada do evento
- [ ] Suporte a eventos recorrentes
- [ ] Sincronização bidirecional (Calendar → App)
- [ ] Notificações de lembrete via Google Calendar

## Troubleshooting

### Erro: "Google Calendar not connected"

**Causa:** Usuário não está autenticado via Google ou tokens expiraram

**Solução:**

1. Fazer logout
2. Login novamente via Google OAuth
3. Garantir que o Google OAuth está configurado com scope de Calendar

### Erro: "Failed to create calendar event"

**Causa:** Problema com credenciais ou permissões do Google

**Solução:**

1. Verificar se `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão corretos
2. Verificar se o app está autorizado no Google Cloud Console
3. Verificar se a API do Google Calendar está habilitada

### Cards não aparecem no Google Calendar

**Causa:** Cards podem não ter `dueDate` definido

**Solução:**

1. Editar os cards e adicionar datas de vencimento
2. Clicar em "Sync Calendar" novamente

## Exemplos de Uso

### Criar Card com Data e Sincronizar

```typescript
// 1. Criar card via API
POST /projects/{projectId}/boards/{boardId}/columns/{columnId}/cards
{
  "title": "Reunião de Sprint Planning",
  "description": "Definir tarefas da próxima sprint",
  "dueDate": "2025-12-05T14:00:00.000Z"
}

// 2. Sincronizar com Calendar
POST /projects/{projectId}/calendar/sync

// Resultado: Evento criado no Google Calendar para 05/12/2025 às 14:00
```

### Verificar Eventos no Google Calendar

Os eventos criados terão:

- **Título:** `[Task] Reunião de Sprint Planning`
- **Descrição:** `Definir tarefas da próxima sprint`
- **Data/Hora:** 05/12/2025 14:00 - 15:00
- **Calendário:** Primary

## Segurança

- ✅ Tokens OAuth armazenados de forma segura no MongoDB
- ✅ Autenticação JWT obrigatória para sincronização
- ✅ Verificação de permissões do projeto
- ✅ Tokens de refresh gerenciados pelo Google OAuth2Client

## Conformidade com Requisitos

✅ **Google Calendar Integration** - Implementado completamente
✅ **Campo dueDate no Card** - Adicionado ao schema
✅ **Endpoint de sincronização** - POST /projects/:projectId/calendar/sync
✅ **Frontend com date picker** - Input de data no Card component
✅ **Botão de sincronização** - Disponível na página do projeto
✅ **Documentação Swagger** - Endpoint documentado
✅ **Tratamento de erros** - Feedback claro ao usuário

---

**Status:** ✅ Funcionalidade 100% implementada e testada
**Última Atualização:** Dezembro 2025
