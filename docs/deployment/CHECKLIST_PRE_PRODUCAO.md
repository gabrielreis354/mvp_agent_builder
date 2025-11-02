# ✅ CHECKLIST PRÉ-PRODUÇÃO - 09/10/2025

## 🚨 PROBLEMA IDENTIFICADO

**Agentes antigos não aparecem mesmo após tornar públicos**

### **Causa Provável:**
- Agentes criados antes da implementação de multi-tenancy
- Campo `organizationId` pode estar NULL ou incorreto
- Banco de dados precisa de migração

---

## 🔍 DIAGNÓSTICO

### **1. Verificar Agentes no Banco**

Execute no banco de dados:

```sql
-- Ver agentes sem organizationId
SELECT id, name, userId, organizationId, isPublic, createdAt 
FROM agents 
WHERE organizationId IS NULL;

-- Ver agentes com organizationId
SELECT id, name, userId, organizationId, isPublic, createdAt 
FROM agents 
WHERE organizationId IS NOT NULL;

-- Ver relação usuário -> organização
SELECT u.id, u.email, u.organizationId, a.id as agentId, a.name, a.organizationId as agentOrgId
FROM users u
LEFT JOIN agents a ON a.userId = u.id
ORDER BY u.email;
```

---

## 🔧 SCRIPT DE MIGRAÇÃO

### **Opção 1: Migração Automática (RECOMENDADO)**

Crie o arquivo: `prisma/migrations/fix-agent-organization.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateAgentOrganizations() {
  console.log('🔄 Iniciando migração de organizationId dos agentes...');

  try {
    // 1. Buscar todos os agentes
    const agents = await prisma.agent.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            organizationId: true
          }
        }
      }
    });

    console.log(`📊 Total de agentes encontrados: ${agents.length}`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // 2. Para cada agente, garantir que organizationId está correto
    for (const agent of agents) {
      try {
        // Se agente não tem organizationId OU está diferente do dono
        if (!agent.organizationId || agent.organizationId !== agent.user.organizationId) {
          
          if (!agent.user.organizationId) {
            console.log(`⚠️ Agente "${agent.name}" (${agent.id}) - Usuário ${agent.user.email} não tem organizationId`);
            errors++;
            continue;
          }

          console.log(`🔄 Atualizando agente "${agent.name}" (${agent.id})`);
          console.log(`   De: ${agent.organizationId || 'NULL'} → Para: ${agent.user.organizationId}`);

          await prisma.agent.update({
            where: { id: agent.id },
            data: { organizationId: agent.user.organizationId }
          });

          updated++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`❌ Erro ao atualizar agente ${agent.id}:`, error);
        errors++;
      }
    }

    console.log('\n✅ Migração concluída!');
    console.log(`📊 Estatísticas:`);
    console.log(`   - Atualizados: ${updated}`);
    console.log(`   - Já corretos: ${skipped}`);
    console.log(`   - Erros: ${errors}`);

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
migrateAgentOrganizations()
  .then(() => {
    console.log('✅ Script finalizado com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script falhou:', error);
    process.exit(1);
  });
```

**Como executar:**
```bash
npx ts-node prisma/migrations/fix-agent-organization.ts
```

---

### **Opção 2: SQL Direto (RÁPIDO)**

```sql
-- Atualizar organizationId de todos os agentes baseado no dono
UPDATE agents a
SET organizationId = (
  SELECT u.organizationId 
  FROM users u 
  WHERE u.id = a.userId
)
WHERE a.organizationId IS NULL 
   OR a.organizationId != (
     SELECT u.organizationId 
     FROM users u 
     WHERE u.id = a.userId
   );
```

---

## 🧪 TESTES PRÉ-PRODUÇÃO

### **1. Teste de Multi-Tenancy**

```bash
# Criar 2 organizações de teste
# Criar usuários em cada uma
# Criar agentes em cada uma
# Verificar isolamento
```

**Checklist:**
- [ ] Org A não vê agentes de Org B
- [ ] Org B não vê agentes de Org A
- [ ] Tornar público em Org A não afeta Org B
- [ ] Copiar agente mantém organizationId

---

### **2. Teste de Convites**

**Checklist:**
- [ ] Admin consegue enviar convite
- [ ] Email é validado (formato correto)
- [ ] Não pode convidar email já na org
- [ ] Não pode convidar a si mesmo
- [ ] Convite expira em 7 dias
- [ ] Convite só pode ser usado 1 vez
- [ ] Auditoria registra IP e usuário

---

### **3. Teste de Compartilhamento**

**Checklist:**
- [ ] Botão aparece em "Meus Agentes"
- [ ] Clicar muda de 🔒 para 🌍
- [ ] Agente aparece em "Agentes da Organização"
- [ ] Outros usuários da org conseguem ver
- [ ] Outros usuários conseguem copiar
- [ ] Tornar privado remove de "Agentes da Organização"

---

### **4. Teste de Email**

**Checklist:**
- [ ] Email de convite é enviado
- [ ] Email de relatório é enviado
- [ ] Cards aparecem corretamente
- [ ] Estruturas diferentes são renderizadas
- [ ] Fallback funciona se JSON inválido

---

### **5. Teste de Linguagem Natural**

**Checklist:**
- [ ] Gera agente com Anthropic
- [ ] Se Anthropic falhar, tenta OpenAI
- [ ] Se OpenAI falhar, tenta Google
- [ ] Metadados de provider são retornados
- [ ] Erros são descritivos

---

### **6. Teste de Performance**

```sql
-- Verificar índices
EXPLAIN SELECT * FROM agents WHERE organizationId = 'xxx' AND isPublic = true;

-- Deve usar índice, não full table scan
```

**Checklist:**
- [ ] Query usa índice
- [ ] Tempo de resposta < 100ms
- [ ] Sem N+1 queries

---

## 🔒 CHECKLIST DE SEGURANÇA

### **Autenticação & Autorização**
- [ ] Todas as rotas verificam sessão
- [ ] organizationId vem da sessão, não do request
- [ ] Apenas dono pode modificar agente
- [ ] Apenas ADMIN pode enviar convites

### **Validação de Dados**
- [ ] Email é validado (formato)
- [ ] IDs são validados (formato cuid)
- [ ] JSON é validado antes de processar
- [ ] Inputs são sanitizados

### **Multi-Tenancy**
- [ ] Queries filtram por organizationId
- [ ] Impossível ver dados de outra org
- [ ] Impossível modificar dados de outra org
- [ ] Agentes órfãos são tratados

---

## 📊 MÉTRICAS PARA MONITORAR

### **Em Produção:**

1. **Taxa de erro de convites**
   - Meta: < 1%
   - Alerta se > 5%

2. **Taxa de sucesso de emails**
   - Meta: > 95%
   - Alerta se < 90%

3. **Tempo de resposta de APIs**
   - Meta: < 200ms (p95)
   - Alerta se > 500ms

4. **Taxa de fallback de IA**
   - Meta: < 10%
   - Alerta se > 30%

5. **Agentes órfãos**
   - Meta: 0
   - Alerta se > 0

---

## 🚀 DEPLOY CHECKLIST

### **Antes do Deploy:**

1. **Backup do Banco**
```bash
# Fazer backup completo
pg_dump $DATABASE_URL > backup_pre_deploy_$(date +%Y%m%d).sql
```

2. **Executar Migração**
```bash
# Migrar organizationId dos agentes
npx ts-node prisma/migrations/fix-agent-organization.ts
```

3. **Verificar Migração**
```sql
-- Verificar se todos os agentes têm organizationId
SELECT COUNT(*) FROM agents WHERE organizationId IS NULL;
-- Deve retornar 0
```

4. **Sincronizar Schema**
```bash
npx prisma generate
npx prisma db push
```

5. **Testar em Staging**
- [ ] Todos os testes passam
- [ ] Sem erros no console
- [ ] Performance OK

---

### **Durante o Deploy:**

1. **Modo Manutenção (Opcional)**
```bash
# Se deploy demorar > 5 minutos
# Ativar página de manutenção
```

2. **Deploy Gradual**
```bash
# Se possível, fazer deploy gradual
# 10% → 50% → 100%
```

3. **Monitorar Logs**
```bash
# Acompanhar logs em tempo real
# Verificar erros
```

---

### **Após o Deploy:**

1. **Smoke Tests**
- [ ] Login funciona
- [ ] Criar agente funciona
- [ ] Enviar convite funciona
- [ ] Tornar público funciona
- [ ] Email funciona

2. **Verificar Métricas**
- [ ] Taxa de erro < 1%
- [ ] Tempo de resposta OK
- [ ] Sem agentes órfãos

3. **Rollback Plan**
```bash
# Se algo der errado:
# 1. Reverter deploy
# 2. Restaurar backup do banco
# 3. Investigar problema
```

---

## 🐛 PROBLEMAS CONHECIDOS E SOLUÇÕES

### **Problema 1: Agentes antigos não aparecem**

**Causa:** `organizationId` NULL ou incorreto

**Solução:** Executar script de migração

**Verificação:**
```sql
SELECT COUNT(*) FROM agents WHERE organizationId IS NULL;
```

---

### **Problema 2: Email não envia**

**Causa:** SMTP não configurado

**Solução:** Configurar variáveis de ambiente:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
```

---

### **Problema 3: Linguagem Natural falha**

**Causa:** API keys não configuradas

**Solução:** Configurar pelo menos 2 providers:
```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
```

---

### **Problema 4: Performance lenta**

**Causa:** Falta de índices

**Solução:** Adicionar índices:
```sql
CREATE INDEX idx_agents_org_public ON agents(organizationId, isPublic);
CREATE INDEX idx_agents_user ON agents(userId);
CREATE INDEX idx_invitations_org ON invitations(organizationId);
```

---

## 📝 DOCUMENTAÇÃO PARA O TIME

### **Arquivos Criados Hoje:**

1. `MELHORIAS_IMPLEMENTADAS.md` - Primeira rodada
2. `MELHORIAS_09_10_FINAL.md` - Detalhes técnicos
3. `RENDERIZADOR_DINAMICO_EMAIL.md` - Email universal
4. `ANALISE_COMPATIBILIDADE_JSON.md` - Validação
5. `ANALISE_IMPACTO_E_SOLID.md` - Análise SOLID
6. `AUDITORIA_SISTEMA_CONVITES.md` - Segurança convites
7. `AUDITORIA_BUILDER_E_NL.md` - Builder e NL
8. `AUDITORIA_MULTI_TENANCY.md` - Segurança multi-tenancy
9. `RESUMO_FINAL_IMPLEMENTACOES_09_10.md` - Resumo
10. `CHECKLIST_PRE_PRODUCAO.md` - Este arquivo

### **Arquivos Modificados:**

1. `src/app/api/send-report-email/route.ts` - Email dinâmico
2. `src/app/api/organization/invite/route.ts` - Validações
3. `src/app/api/organization/join/route.ts` - Segurança
4. `src/app/api/agents/generate-from-nl/route.ts` - Fallback
5. `src/app/api/agents/[id]/share/route.ts` - Logs
6. `src/app/api/organization/details/route.ts` - Filtro público
7. `src/components/profile/agents-section.tsx` - Botão + logs
8. `prisma/schema.prisma` - Campos de segurança
9. `CHANGELOG.md` - Registro

---

## 🎯 PRÓXIMOS PASSOS

1. **Executar script de migração** ✅
2. **Testar todos os cenários** ✅
3. **Fazer backup do banco** ✅
4. **Deploy em staging** ✅
5. **Validar em staging** ✅
6. **Deploy em produção** ✅
7. **Monitorar métricas** ✅

---

**Data:** 09/10/2025 15:25  
**Status:** ⚠️ Pronto para produção após migração  
**Ação Necessária:** Executar script de migração de organizationId
