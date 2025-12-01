# Sistema de Permissões Granulares

## Visão Geral

O sistema de gerenciamento de tarefas implementa um modelo de permissões baseado em **roles (papéis)** com 5 níveis hierárquicos de acesso:

1. **Owner (Proprietário)** - Controle total do projeto
2. **Admin (Administrador)** - Gerenciamento completo exceto transferência de propriedade
3. **Editor** - Pode criar e editar, mas não deletar
4. **Commenter (Comentador)** - Pode comentar e visualizar
5. **Viewer (Visualizador)** - Apenas leitura

---

## Matriz de Permissões

| Permissão          | Owner | Admin | Editor | Commenter | Viewer |
| ------------------ | ----- | ----- | ------ | --------- | ------ |
| `canView`          | ✅    | ✅    | ✅     | ✅        | ✅     |
| `canComment`       | ✅    | ✅    | ✅     | ✅        | ❌     |
| `canEdit`          | ✅    | ✅    | ✅     | ❌        | ❌     |
| `canDelete`        | ✅    | ✅    | ❌     | ❌        | ❌     |
| `canManageMembers` | ✅    | ✅    | ❌     | ❌        | ❌     |
| `canManageProject` | ✅    | ❌    | ❌     | ❌        | ❌     |

---

## Middleware de Autorização

### `checkProjectPermission(requiredPermission)`

Middleware que verifica se o usuário tem a permissão específica no projeto.

**Uso:**

```typescript
router.post(
  "/",
  authenticateJWT,
  checkProjectPermission("canEdit"),
  async (req, res) => {
    // Criar board - apenas usuários com permissão canEdit
  }
);
```

**Fluxo:**

1. Extrai `projectId` dos parâmetros da rota
2. Busca o projeto no banco de dados
3. Verifica se o usuário é membro do projeto
4. Valida se o role do usuário tem a permissão requerida
5. Injeta `req.projectRole` e `req.projectPermissions` para uso posterior
6. Retorna 403 se a permissão for negada

### `requireProjectOwner`

Middleware que garante que apenas o **owner** do projeto pode executar a ação.

**Uso:**

```typescript
router.post(
  "/transfer",
  authenticateJWT,
  requireProjectOwner,
  async (req, res) => {
    // Transferir propriedade - somente owner
  }
);
```

---

## Rotas Protegidas por Permissões

### **Boards** (`/projects/:projectId/boards`)

| Método | Rota | Permissão | Roles Permitidos     |
| ------ | ---- | --------- | -------------------- |
| POST   | `/`  | `canEdit` | owner, admin, editor |
| GET    | `/`  | `canView` | Todos os membros     |

### **Columns** (`/projects/:projectId/boards/:boardId/columns`)

| Método | Rota         | Permissão   | Roles Permitidos     |
| ------ | ------------ | ----------- | -------------------- |
| POST   | `/`          | `canEdit`   | owner, admin, editor |
| DELETE | `/:columnId` | `canDelete` | owner, admin         |

### **Cards** (`/projects/:projectId/boards/:boardId/columns/:columnId/cards`)

| Método | Rota       | Permissão   | Roles Permitidos     |
| ------ | ---------- | ----------- | -------------------- |
| POST   | `/`        | `canEdit`   | owner, admin, editor |
| PUT    | `/:cardId` | `canEdit`   | owner, admin, editor |
| DELETE | `/:cardId` | `canDelete` | owner, admin         |

### **Members** (`/projects/:projectId/members`)

| Método | Rota         | Permissão             | Roles Permitidos |
| ------ | ------------ | --------------------- | ---------------- |
| GET    | `/`          | `canView`             | Todos os membros |
| POST   | `/`          | `canManageMembers`    | owner, admin     |
| PATCH  | `/:memberId` | `canManageMembers`    | owner, admin     |
| DELETE | `/:memberId` | `canManageMembers`    | owner, admin     |
| POST   | `/transfer`  | `requireProjectOwner` | owner            |

### **Projects** (`/projects`)

| Método | Rota          | Permissão | Roles Permitidos                               |
| ------ | ------------- | --------- | ---------------------------------------------- |
| GET    | `/:projectId` | `canView` | Todos os membros                               |
| POST   | `/`           | -         | Qualquer usuário autenticado (cria como owner) |

---

## Gerenciamento de Membros

### Adicionar Membro

```http
POST /projects/:projectId/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "usuario@example.com",
  "role": "editor"
}
```

**Roles válidos:** `admin`, `editor`, `commenter`, `viewer`

**Restrições:**

- Não é possível adicionar com role `owner` (apenas por transferência)
- Email deve corresponder a um usuário registrado
- Usuário não pode já ser membro do projeto

### Alterar Role de Membro

```http
PATCH /projects/:projectId/members/:memberId
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "admin"
}
```

**Restrições:**

- Não é possível alterar o role do owner
- Apenas owner e admin podem alterar roles

### Remover Membro

```http
DELETE /projects/:projectId/members/:memberId
Authorization: Bearer <token>
```

**Restrições:**

- Não é possível remover o owner
- Apenas owner e admin podem remover membros

### Transferir Propriedade

```http
POST /projects/:projectId/members/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "newOwnerId": "507f1f77bcf86cd799439011"
}
```

**Comportamento:**

- Owner atual é rebaixado para `admin`
- Novo owner recebe role `owner`
- Apenas o owner atual pode transferir a propriedade
- Novo owner deve ser membro do projeto

---

## Respostas de Erro

### 403 Insufficient Permissions

```json
{
  "error": "Insufficient permissions. Required: canEdit",
  "yourRole": "viewer"
}
```

### 403 Not a Project Member

```json
{
  "error": "Not a project member"
}
```

### 403 Only Project Owner

```json
{
  "error": "Only project owner can perform this action"
}
```

---

## Exemplo de Fluxo Completo

### 1. Usuário A cria um projeto

```http
POST /projects
```

**Resultado:** Usuário A é automaticamente `owner`

### 2. Usuário A adiciona Usuário B como editor

```http
POST /projects/123/members
{
  "email": "usuariob@example.com",
  "role": "editor"
}
```

**Resultado:** Usuário B pode criar/editar cards, mas não deletar

### 3. Usuário B tenta deletar uma coluna

```http
DELETE /projects/123/boards/456/columns/789
```

**Resultado:** `403 Insufficient permissions` (precisa de `canDelete`)

### 4. Usuário A promove Usuário B para admin

```http
PATCH /projects/123/members/<userId_B>
{
  "role": "admin"
}
```

**Resultado:** Usuário B agora pode deletar colunas e cards

### 5. Usuário B tenta transferir propriedade

```http
POST /projects/123/members/transfer
```

**Resultado:** `403 Only project owner can perform this action`

---

## Implementação no Frontend

Para exibir/ocultar botões baseado em permissões:

```typescript
// Em ProjectPage.tsx
const userMember = project?.members.find((m) => m.userId === currentUserId);
const canEdit = ["owner", "admin", "editor"].includes(userMember?.role);
const canDelete = ["owner", "admin"].includes(userMember?.role);
const canManageMembers = ["owner", "admin"].includes(userMember?.role);

return (
  <>
    {canEdit && <button onClick={createCard}>Criar Card</button>}
    {canDelete && <button onClick={deleteColumn}>Deletar Coluna</button>}
    {canManageMembers && <button onClick={addMember}>Adicionar Membro</button>}
  </>
);
```

---

## Boas Práticas

1. **Sempre use o middleware de permissões** nas rotas que modificam dados
2. **Valide no backend** - nunca confie apenas no frontend
3. **Documente claramente** quais permissões cada rota requer
4. **Teste cenários de negação** - garanta que os erros 403 sejam claros
5. **Logs de auditoria** - considere registrar ações sensíveis (transferência de propriedade, remoção de membros)

---

## Segurança

✅ **Validação de Membro:** Todo middleware verifica se o usuário é membro do projeto  
✅ **Validação de Role:** Verifica se o role tem a permissão específica  
✅ **Proteção de Owner:** Impossível remover ou alterar role do owner sem transferência  
✅ **JWT Obrigatório:** Todas as rotas exigem `authenticateJWT`  
✅ **Injeção de Contexto:** `req.projectRole` e `req.projectPermissions` disponíveis após middleware

---

## Swagger Documentation

Todas as rotas de members estão documentadas com:

- Tags `[Members]`
- Esquemas de request/response
- Códigos de status HTTP
- Requisitos de autenticação (bearerAuth)

Acesse: `http://localhost:5000/api-docs`
