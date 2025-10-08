# 🔒 Segurança de Convites e Compartilhamento de Agentes

**Data:** 08/10/2025  
**Status:** ⚠️ Requer migração do banco de dados

---

## 🎯 Melhorias Implementadas

### **1. Segurança de Convites**

#### **Campos Adicionados ao Schema:**
```prisma
model Invitation {
  // Campos existentes
  id             String   @id @default(cuid())
  email          String   @unique
  organizationId String
  token          String   @unique @default(cuid())
  expires        DateTime
  createdAt      DateTime @default(now())
  
  // ✅ NOVOS CAMPOS DE SEGURANÇA
  usedAt           DateTime? // Quando foi usado (uso único)
  usedByIp         String?   // IP que usou o convite
  invitedBy        String?   // ID do admin que convidou
  acceptedByUserId String?   // ID do usuário que aceitou
}
```

---

### **2. Medidas de Segurança Implementadas**

#### **✅ Uso Único**
- Convite só pode ser usado uma vez
- Após uso, é marcado com `usedAt` (não deletado)
- Tentativa de reusar retorna erro 410

#### **✅ Rastreamento de IP**
- IP do usuário é registrado em `usedByIp`
- Permite auditoria de segurança
- Detecta uso suspeito

#### **✅ Rastreamento de Quem Convidou**
- Campo `invitedBy` armazena ID do admin
- Responsabilização de convites
- Auditoria completa

#### **✅ Rastreamento de Quem Aceitou**
- Campo `acceptedByUserId` liga convite ao usuário
- Histórico completo
- Não deleta convite (mantém para auditoria)

---

## 🚨 IMPORTANTE: Migração Necessária

### **Passo 1: Gerar Migração**

```bash
cd mvp-agent-builder
npx prisma migrate dev --name add_invitation_security_fields
```

### **Passo 2: Aplicar em Produção**

```bash
# Usar DATABASE_URL de produção
DATABASE_URL="sua-url-producao" npx prisma migrate deploy
```

### **Passo 3: Regenerar Prisma Client**

```bash
npx prisma generate
```

---

## 📋 Fluxo de Segurança

### **Criar Convite:**
```typescript
POST /api/organization/invite
Body: { "email": "usuario@exemplo.com" }

// Cria convite com:
- token único
- expires (7 dias)
- invitedBy (ID do admin)
- usedAt = null (não usado)
```

### **Validar Convite:**
```typescript
GET /api/invitations/validate/{token}

// Verifica:
✅ Token existe
✅ Não expirou
✅ usedAt === null (não foi usado)
```

### **Aceitar Convite:**
```typescript
POST /api/organization/join
Body: { "token": "..." }

// Validações:
1. ✅ Token válido
2. ✅ Não expirado
3. ✅ Não usado (usedAt === null)
4. ✅ Email do usuário === email do convite

// Se válido:
- Transfere usuário para organização
- Marca convite: usedAt = now()
- Registra: usedByIp, acceptedByUserId
- Mantém convite no banco (auditoria)
```

---

## 🔐 Proteções Contra Repasse

### **1. Email Específico**
```typescript
// Convite é para email específico
if (invitation.email !== session.user.email) {
  return error('Este convite é para outro email')
}
```

### **2. Uso Único**
```typescript
// Não pode ser reusado
if (invitation.usedAt) {
  return error('Convite já foi utilizado')
}
```

### **3. Expiração**
```typescript
// Expira em 7 dias
if (new Date() > invitation.expires) {
  return error('Convite expirado')
}
```

### **4. Rastreamento de IP**
```typescript
// Registra IP para auditoria
usedByIp: request.headers.get('x-forwarded-for')
```

---

## 👤 Fluxo para Usuários Não Cadastrados

### **Cenário: Email não tem conta**

1. **Usuário recebe email com link**
   ```
   https://app.com/accept-invite?token=abc123
   ```

2. **Ao clicar, é redirecionado para login/registro**
   ```typescript
   // accept-invite/page.tsx
   - Valida token
   - Se válido, mostra:
     "Você foi convidado para [Organização]"
     "Entre com Google" ou "Crie sua conta"
   ```

3. **Após login/registro:**
   ```typescript
   // Redireciona para: /join-organization?token=abc123
   // Aceita convite automaticamente
   // Valida que email da conta === email do convite
   ```

4. **Se emails não batem:**
   ```typescript
   return error('Este convite é para outro email')
   // Usuário precisa criar conta com email correto
   ```

---

## 🎨 Compartilhamento de Agentes

### **Regra: Agentes Privados por Padrão**

```typescript
// Quando usuário aceita convite:
- Usuário → transferido para organização
- Agentes → permanecem PRIVADOS (isPublic = false)
- Usuário decide quais compartilhar
```

### **API de Compartilhamento:**

```typescript
PATCH /api/agents/{id}/share
Body: { "isPublic": true/false }

// Validações:
✅ Usuário é dono do agente
✅ Agente existe
✅ Usuário autenticado

// Resultado:
isPublic = true  → Visível para toda organização
isPublic = false → Apenas dono vê
```

---

## 🖥️ Interface: Botão de Compartilhar

### **Onde Adicionar:**

```typescript
// No card do agente, adicionar:

{agent.userId === currentUserId && (
  <Button 
    onClick={() => toggleShare(agent.id, !agent.isPublic)}
    variant="ghost"
    size="sm"
  >
    {agent.isPublic ? (
      <>
        <Globe className="h-4 w-4 mr-2" />
        Público na Organização
      </>
    ) : (
      <>
        <Lock className="h-4 w-4 mr-2" />
        Privado
      </>
    )}
  </Button>
)}
```

### **Condição: Apenas se Usuário Está em Organização**

```typescript
// Mostrar botão apenas se:
const showShareButton = 
  agent.userId === currentUserId && // É dono
  currentUser.organizationId !== currentUser.id // Não é org própria
```

---

## 📊 Listagem de Agentes Atualizada

### **Query Atual (Incorreta):**
```typescript
// Mostra apenas agentes da organização
const agents = await prisma.agent.findMany({
  where: { organizationId: userOrgId }
});
```

### **Query Correta:**
```typescript
// Mostra: meus agentes + públicos da org
const agents = await prisma.agent.findMany({
  where: {
    organizationId: userOrgId,
    OR: [
      { userId: currentUserId },  // Meus agentes (públicos ou privados)
      { isPublic: true }          // Públicos de outros membros
    ]
  },
  include: {
    user: {
      select: { id: true, name: true, image: true }
    }
  }
});
```

---

## 🔍 Auditoria de Convites

### **Visualizar Convites Usados:**

```typescript
GET /api/organization/invitations/audit

// Retorna:
{
  "invitations": [
    {
      "email": "user@example.com",
      "createdAt": "2025-10-01",
      "usedAt": "2025-10-02",
      "usedByIp": "192.168.1.1",
      "invitedBy": "admin-id",
      "acceptedByUserId": "user-id",
      "status": "used"
    }
  ]
}
```

---

## ✅ Checklist de Implementação

### **Backend:**
- [x] Schema atualizado com campos de segurança
- [x] API de convite rastreia quem convidou
- [x] API de join valida uso único
- [x] API de join rastreia IP e usuário
- [x] API de compartilhamento criada
- [ ] Migração aplicada no banco
- [ ] Prisma Client regenerado

### **Frontend:**
- [ ] Botão de compartilhar no card do agente
- [ ] Mostrar status (público/privado)
- [ ] Atualizar listagem de agentes (OR query)
- [ ] Mensagem de erro para convite já usado
- [ ] Fluxo para usuários não cadastrados

### **Segurança:**
- [x] Uso único de convites
- [x] Rastreamento de IP
- [x] Rastreamento de quem convidou
- [x] Rastreamento de quem aceitou
- [x] Validação de email específico
- [x] Expiração de 7 dias
- [x] Convites não são deletados (auditoria)

---

## 🚀 Próximos Passos

### **1. Aplicar Migração:**
```bash
npx prisma migrate dev --name add_invitation_security_fields
npx prisma generate
npm run dev
```

### **2. Testar Fluxo:**
1. Admin convida usuário
2. Usuário tenta usar convite 2x (deve falhar)
3. Verificar IP registrado
4. Verificar convite marcado como usado

### **3. Implementar Interface:**
1. Adicionar botão de compartilhar
2. Atualizar listagem de agentes
3. Testar compartilhamento

---

## 📝 Arquivos Modificados

```
✅ prisma/schema.prisma
   - Campos de segurança em Invitation

✅ src/app/api/organization/invite/route.ts
   - Rastreia invitedBy

✅ src/app/api/organization/join/route.ts
   - Valida uso único
   - Rastreia IP e usuário
   - Não deleta convite

✅ src/app/api/agents/[id]/share/route.ts (NOVO)
   - API de compartilhamento

⏳ PENDENTE: Interface de compartilhamento
⏳ PENDENTE: Atualizar listagem de agentes
```

---

**Status:** ⚠️ Requer `npx prisma migrate dev` e `npx prisma generate`  
**Segurança:** ✅ Máxima proteção contra repasse de convites  
**Auditoria:** ✅ Rastreamento completo de todos os convites
