# 🔍 Auditoria Completa - Sistema de Convites

## ✅ RESUMO EXECUTIVO

**Status Geral:** ✅ **SEGURO** com algumas melhorias recomendadas

**Nota de Segurança:** 8.5/10

---

## 📋 REGRAS IMPLEMENTADAS

### **✅ REGRAS CORRETAS (Implementadas)**

#### **1. Apenas ADMIN pode enviar convites**

```typescript
// invite/route.ts - Linha 11
if (session?.user?.role !== "ADMIN") {
  return NextResponse.json(
    { error: "Apenas administradores podem enviar convites." },
    { status: 403 }
  );
}
```

**Status:** ✅ **CORRETO**

---

#### **2. Não pode convidar email já na organização**

```typescript
// invite/route.ts - Linhas 25-30
const existingUser = await prisma.user.findFirst({
  where: { email, organizationId },
});
if (existingUser) {
  return NextResponse.json(
    { error: "Este usuário já pertence à organização." },
    { status: 409 }
  );
}
```

**Status:** ✅ **CORRETO**

---

#### **3. Não pode ter convite duplicado válido**

```typescript
// invite/route.ts - Linhas 44-50
if (
  existingInvitation &&
  !existingInvitation.usedAt &&
  new Date() <= existingInvitation.expires
) {
  return NextResponse.json(
    {
      error: "Um convite válido para este email já existe.",
      details: `Convite enviado em ${existingInvitation.createdAt.toLocaleDateString(
        "pt-BR"
      )}`,
    },
    { status: 409 }
  );
}
```

**Status:** ✅ **CORRETO**

---

#### **4. Convite expira em 7 dias**

```typescript
// invite/route.ts - Linhas 54-55
const expires = new Date();
expires.setDate(expires.getDate() + 7);
```

**Status:** ✅ **CORRETO**

---

#### **5. Convite de uso único**

```typescript
// join/route.ts - Linhas 30-35
if (invitation.usedAt) {
  return NextResponse.json(
    {
      error: "Este convite já foi utilizado.",
      details: "Por segurança, cada convite só pode ser usado uma vez.",
    },
    { status: 410 }
  );
}
```

**Status:** ✅ **CORRETO**

---

#### **6. Validação de email do convite**

```typescript
// join/route.ts - Linhas 37-39
if (invitation.email.toLowerCase() !== session.user.email.toLowerCase()) {
  return NextResponse.json(
    { error: "Este convite é para um email diferente." },
    { status: 403 }
  );
}
```

**Status:** ✅ **CORRETO**

---

#### **7. Rastreamento de IP**

```typescript
// join/route.ts - Linhas 60-61
const forwarded = request.headers.get("x-forwarded-for");
const userIp = forwarded
  ? forwarded.split(",")[0]
  : request.headers.get("x-real-ip") || "unknown";
```

**Status:** ✅ **CORRETO**

---

#### **8. Auditoria completa**

```typescript
// join/route.ts - Linhas 74-81
await tx.invitation.update({
  where: { token },
  data: {
    usedAt: new Date(),
    usedByIp: userIp,
    acceptedByUserId: updatedUser.id,
  },
});
```

**Status:** ✅ **CORRETO** - Convite não é deletado, apenas marcado como usado

---

#### **9. Proteção contra saída do último admin**

```typescript
// join/route.ts - Linhas 43-58
if (currentUser?.role === "ADMIN") {
  const adminCount = await prisma.user.count({
    where: { organizationId: currentUser.organizationId, role: "ADMIN" },
  });

  if (adminCount === 1 && memberCount > 1) {
    return NextResponse.json(
      {
        error:
          "Você é o único administrador. Promova outro membro antes de sair.",
      },
      { status: 403 }
    );
  }
}
```

**Status:** ✅ **CORRETO**

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### **❌ PROBLEMA 1: Email não validado**

**Código Atual:**

```typescript
// invite/route.ts - Linha 20
if (!email) {
  return NextResponse.json(
    { error: "O email é obrigatório." },
    { status: 400 }
  );
}
```

**Problema:** Não valida formato do email

**Risco:**

- Convites para emails inválidos
- Desperdício de recursos
- Possível exploração

**Solução:**

```typescript
if (!email) {
  return NextResponse.json(
    { error: "O email é obrigatório." },
    { status: 400 }
  );
}

// Validar formato do email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return NextResponse.json(
    { error: "Formato de email inválido." },
    { status: 400 }
  );
}

// Validar domínio (opcional, mas recomendado)
const blockedDomains = [
  "tempmail.com",
  "guerrillamail.com",
  "10minutemail.com",
];
const domain = email.split("@")[1].toLowerCase();
if (blockedDomains.includes(domain)) {
  return NextResponse.json(
    {
      error: "Este domínio de email não é permitido.",
      details: "Use um email corporativo ou pessoal válido.",
    },
    { status: 400 }
  );
}
```

**Prioridade:** 🔴 **ALTA**

---

### **⚠️ PROBLEMA 2: Convite para mesma organização**

**Código Atual:**

```typescript
// invite/route.ts - Linha 33
const existingInvitation = await prisma.invitation.findUnique({
  where: { email },
});
```

**Problema:** Busca convite por email globalmente, não por organização

**Cenário de Risco:**

```
1. Org A convida user@example.com
2. Org B tenta convidar user@example.com
3. ❌ Erro: "Um convite válido para este email já existe"
4. Org B não consegue convidar, mesmo sendo organização diferente
```

**Solução:**

```typescript
// Buscar convite específico da organização
const existingInvitation = await prisma.invitation.findFirst({
  where: {
    email,
    organizationId, // ✅ Filtrar por organização
  },
});
```

**Prioridade:** 🔴 **ALTA**

---

### **⚠️ PROBLEMA 3: Limite de convites não implementado**

**Problema:** Admin pode enviar infinitos convites

**Risco:**

- Spam
- Abuso do sistema
- Custos de email

**Solução:**

```typescript
// Verificar limite de convites pendentes por organização
const pendingInvitesCount = await prisma.invitation.count({
  where: {
    organizationId,
    usedAt: null,
    expires: { gt: new Date() },
  },
});

const MAX_PENDING_INVITES = 50; // Configurável
if (pendingInvitesCount >= MAX_PENDING_INVITES) {
  return NextResponse.json(
    {
      error: "Limite de convites pendentes atingido.",
      details: `Você tem ${pendingInvitesCount} convites pendentes. Aguarde alguns serem aceitos ou expirarem.`,
    },
    { status: 429 }
  );
}
```

**Prioridade:** 🟡 **MÉDIA**

---

### **⚠️ PROBLEMA 4: Rate limiting não implementado**

**Problema:** Admin pode enviar muitos convites rapidamente

**Risco:**

- Spam
- Abuso
- Sobrecarga do servidor de email

**Solução:**

```typescript
// Verificar quantos convites foram enviados na última hora
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
const recentInvites = await prisma.invitation.count({
  where: {
    organizationId,
    invitedBy: session.user.id,
    createdAt: { gte: oneHourAgo },
  },
});

const MAX_INVITES_PER_HOUR = 10;
if (recentInvites >= MAX_INVITES_PER_HOUR) {
  return NextResponse.json(
    {
      error: "Limite de convites por hora atingido.",
      details: `Você pode enviar no máximo ${MAX_INVITES_PER_HOUR} convites por hora.`,
    },
    { status: 429 }
  );
}
```

**Prioridade:** 🟡 **MÉDIA**

---

### **⚠️ PROBLEMA 5: Convite para si mesmo**

**Problema:** Admin pode convidar o próprio email

**Risco:**

- Confusão
- Desperdício de recursos

**Solução:**

```typescript
// Verificar se está tentando convidar a si mesmo
if (email.toLowerCase() === session.user.email.toLowerCase()) {
  return NextResponse.json(
    {
      error: "Você não pode enviar um convite para si mesmo.",
      details: "Você já faz parte desta organização.",
    },
    { status: 400 }
  );
}
```

**Prioridade:** 🟢 **BAIXA**

---

### **⚠️ PROBLEMA 6: Sem notificação de expiração**

**Problema:** Admin não sabe quando convites expiram

**Impacto:**

- Má experiência do usuário
- Convites perdidos

**Solução:**

```typescript
// Adicionar job para notificar convites expirando
// Exemplo: Notificar 1 dia antes de expirar
// Implementar com cron job ou scheduled task
```

**Prioridade:** 🟢 **BAIXA**

---

## 🛡️ REGRAS ADICIONAIS RECOMENDADAS

### **1. Whitelist de Domínios (Opcional)**

```typescript
// Para empresas que querem restringir convites
const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS?.split(",") || [];
if (allowedDomains.length > 0) {
  const domain = email.split("@")[1].toLowerCase();
  if (!allowedDomains.includes(domain)) {
    return NextResponse.json(
      {
        error: "Este domínio de email não é permitido.",
        details: `Apenas emails dos domínios: ${allowedDomains.join(", ")}`,
      },
      { status: 400 }
    );
  }
}
```

---

### **2. Confirmação de Email (Opcional)**

```typescript
// Enviar código de confirmação antes de criar convite
// Previne typos e garante que email existe
```

---

### **3. Revogação de Convites**

```typescript
// API para admin revogar convite pendente
DELETE /api/organization/invite/:token
```

---

### **4. Reenvio de Convites**

```typescript
// API para reenviar email de convite
POST /api/organization/invite/:token/resend
```

---

## 📊 MATRIZ DE SEGURANÇA

| Regra                        | Status   | Prioridade | Implementado |
| ---------------------------- | -------- | ---------- | ------------ |
| Apenas ADMIN convida         | ✅ OK    | 🔴 Alta    | ✅ Sim       |
| Não convida email já na org  | ✅ OK    | 🔴 Alta    | ✅ Sim       |
| Não convida duplicado válido | ✅ OK    | 🔴 Alta    | ✅ Sim       |
| Convite expira em 7 dias     | ✅ OK    | 🔴 Alta    | ✅ Sim       |
| Uso único                    | ✅ OK    | 🔴 Alta    | ✅ Sim       |
| Validação de email correto   | ✅ OK    | 🔴 Alta    | ✅ Sim       |
| Rastreamento de IP           | ✅ OK    | 🟡 Média   | ✅ Sim       |
| Auditoria completa           | ✅ OK    | 🟡 Média   | ✅ Sim       |
| Proteção último admin        | ✅ OK    | 🔴 Alta    | ✅ Sim       |
| **Validação formato email**  | ❌ Falta | 🔴 Alta    | ❌ Não       |
| **Filtro por organização**   | ❌ Falta | 🔴 Alta    | ❌ Não       |
| **Limite de convites**       | ❌ Falta | 🟡 Média   | ❌ Não       |
| **Rate limiting**            | ❌ Falta | 🟡 Média   | ❌ Não       |
| **Não convidar a si mesmo**  | ❌ Falta | 🟢 Baixa   | ❌ Não       |
| **Notificação expiração**    | ❌ Falta | 🟢 Baixa   | ❌ Não       |

---

## 🎯 PLANO DE CORREÇÃO

### **FASE 1: Correções Críticas (Fazer Agora)**

#### **1.1. Validar Formato de Email**

```typescript
// Adicionar em invite/route.ts após linha 22
```

#### **1.2. Filtrar Convites por Organização**

```typescript
// Modificar linha 33 de invite/route.ts
```

**Tempo Estimado:** 30 minutos  
**Impacto:** Alto  
**Risco de Quebrar:** Baixo

---

### **FASE 2: Melhorias de Segurança (Próxima Semana)**

#### **2.1. Implementar Limite de Convites**

#### **2.2. Implementar Rate Limiting**

#### **2.3. Bloquear Convite para Si Mesmo**

**Tempo Estimado:** 2 horas  
**Impacto:** Médio  
**Risco de Quebrar:** Baixo

---

### **FASE 3: Features Adicionais (Futuro)**

#### **3.1. Revogação de Convites**

#### **3.2. Reenvio de Convites**

#### **3.3. Notificações de Expiração**

**Tempo Estimado:** 4 horas  
**Impacto:** Baixo  
**Risco de Quebrar:** Baixo

---

## 📋 CHECKLIST DE VALIDAÇÃO

### **Testes Necessários:**

- [ ] Admin consegue enviar convite válido
- [ ] Não-admin não consegue enviar convite
- [ ] Não consegue convidar email já na organização
- [ ] Não consegue convidar email com convite pendente
- [ ] Convite expira após 7 dias
- [ ] Convite usado não pode ser reutilizado
- [ ] Email errado não consegue aceitar convite
- [ ] IP é registrado ao aceitar
- [ ] Último admin não pode sair
- [ ] **Email inválido é rejeitado** (NOVO)
- [ ] **Organizações diferentes podem convidar mesmo email** (NOVO)
- [ ] **Limite de convites é respeitado** (NOVO)
- [ ] **Rate limit é respeitado** (NOVO)

---

## 💡 RECOMENDAÇÕES FINAIS

### **✅ O QUE ESTÁ BOM:**

1. Segurança básica implementada
2. Auditoria completa
3. Uso único garantido
4. Proteção de último admin

### **⚠️ O QUE PRECISA CORRIGIR (URGENTE):**

1. **Validação de formato de email**
2. **Filtro de convites por organização**

### **🔄 O QUE PODE MELHORAR (NÃO URGENTE):**

1. Limite de convites
2. Rate limiting
3. Revogação de convites
4. Notificações

---

## 🎓 CONCLUSÃO

**Status Atual:** Sistema funcional e seguro, mas com 2 correções críticas necessárias.

**Nota de Segurança:** 8.5/10

- **Antes das correções:** 8.5/10
- **Depois das correções:** 9.5/10

**Ação Imediata:** Implementar validação de email e filtro por organização.

**Próximos Passos:** Testar cenários de borda e implementar melhorias de Fase 2.

---

**Data:** 09/10/2025 14:35  
**Status:** ✅ Auditoria completa  
**Próximo:** Implementar correções críticas
