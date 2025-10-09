# 🚀 GUIA DE DEPLOY PARA PRODUÇÃO

## ✅ RESUMO EXECUTIVO

**Data:** 09/10/2025  
**Versão:** 2.0.0  
**Status:** ⚠️ Pronto após migração de dados  
**Tempo Estimado:** 30-45 minutos  

---

## 📋 PRÉ-REQUISITOS

### **1. Backups**
- [ ] Backup completo do banco de dados
- [ ] Backup do código atual em produção
- [ ] Backup das variáveis de ambiente

### **2. Variáveis de Ambiente**
```env
# IA Providers (pelo menos 2 configurados)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app

# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=...
```

### **3. Ferramentas**
- [ ] Node.js 18+
- [ ] PostgreSQL client
- [ ] Git
- [ ] Access to production server

---

## 🔧 PASSO 1: BACKUP (CRÍTICO)

### **1.1. Backup do Banco de Dados**

```bash
# Local/Staging
pg_dump $DATABASE_URL > backup_pre_deploy_$(date +%Y%m%d_%H%M%S).sql

# Ou via Prisma
npx prisma db pull
```

### **1.2. Verificar Backup**

```bash
# Verificar tamanho do arquivo
ls -lh backup_*.sql

# Deve ter alguns MB de tamanho
```

### **1.3. Backup do Código**

```bash
# Criar tag no Git
git tag -a v2.0.0-pre-deploy -m "Backup antes do deploy"
git push origin v2.0.0-pre-deploy
```

---

## 🔄 PASSO 2: MIGRAÇÃO DE DADOS (CRÍTICO)

### **2.1. Executar Script de Migração**

```bash
# Executar localmente primeiro (teste)
npx ts-node scripts/fix-agent-organizations.ts
```

**Saída Esperada:**
```
╔════════════════════════════════════════════════════════════╗
║  SCRIPT DE MIGRAÇÃO - ORGANIZATIONID DOS AGENTES         ║
╚════════════════════════════════════════════════════════════╝

🔄 Iniciando migração de organizationId dos agentes...

📊 Total de agentes encontrados: 15

🔄 Atualizando agente "Analisador de Contratos" (cmg...)
   Dono: user@example.com
   De: NULL → Para: org-123

✅ Migração concluída!
============================================================

📊 Estatísticas:
   ✅ Atualizados: 10
   ⏭️  Já corretos: 5
   ❌ Erros: 0

🔍 Verificação Final
============================================================

📊 Agentes sem organizationId: 0
📊 Usuários sem organizationId: 0

✅ Todos os agentes têm organizationId correto!
```

### **2.2. Verificação Manual**

```sql
-- Verificar se todos os agentes têm organizationId
SELECT COUNT(*) as total_agentes,
       COUNT(organizationId) as com_org,
       COUNT(*) - COUNT(organizationId) as sem_org
FROM agents;

-- Deve retornar: sem_org = 0
```

### **2.3. Se Houver Erros**

```bash
# Restaurar backup
psql $DATABASE_URL < backup_pre_deploy_YYYYMMDD_HHMMSS.sql

# Investigar problema
# Corrigir
# Tentar novamente
```

---

## 📦 PASSO 3: SINCRONIZAR SCHEMA

### **3.1. Gerar Cliente Prisma**

```bash
npx prisma generate
```

### **3.2. Push Schema (se necessário)**

```bash
# Verificar diferenças
npx prisma db pull
npx prisma db push --preview-feature

# Ou criar migração
npx prisma migrate dev --name add_security_fields
```

---

## 🧪 PASSO 4: TESTES EM STAGING

### **4.1. Deploy para Staging**

```bash
# Build
npm run build

# Deploy (exemplo Vercel)
vercel --prod --scope=staging
```

### **4.2. Smoke Tests**

```bash
# Teste 1: Login
curl -X POST https://staging.seu-dominio.com/api/auth/signin

# Teste 2: Criar Agente
# (via interface)

# Teste 3: Tornar Público
# (via interface)

# Teste 4: Enviar Convite
# (via interface)
```

### **4.3. Checklist de Testes**

- [ ] Login funciona
- [ ] Criar agente funciona
- [ ] Agente aparece em "Meus Agentes"
- [ ] Botão de compartilhamento aparece
- [ ] Tornar público funciona
- [ ] Agente aparece em "Agentes da Organização"
- [ ] Outros usuários veem o agente
- [ ] Enviar convite funciona
- [ ] Email de convite chega
- [ ] Aceitar convite funciona
- [ ] Linguagem Natural funciona
- [ ] Fallback de IA funciona (desligar Anthropic para testar)
- [ ] Email de relatório funciona
- [ ] Multi-tenancy está isolado

---

## 🚀 PASSO 5: DEPLOY PARA PRODUÇÃO

### **5.1. Modo Manutenção (Opcional)**

Se deploy demorar > 5 minutos:

```bash
# Ativar página de manutenção
# (depende da plataforma)
```

### **5.2. Deploy**

```bash
# Build de produção
npm run build

# Deploy (exemplo)
vercel --prod

# Ou
git push production main
```

### **5.3. Executar Migração em Produção**

```bash
# Conectar ao servidor de produção
ssh user@production-server

# Executar migração
cd /path/to/app
npx ts-node scripts/fix-agent-organizations.ts

# Verificar
psql $DATABASE_URL -c "SELECT COUNT(*) FROM agents WHERE organizationId IS NULL;"
# Deve retornar 0
```

---

## 📊 PASSO 6: MONITORAMENTO

### **6.1. Verificar Logs**

```bash
# Logs em tempo real
tail -f /var/log/app.log

# Ou via plataforma
vercel logs --follow
```

### **6.2. Métricas para Monitorar**

**Primeiros 15 minutos:**
- [ ] Taxa de erro < 1%
- [ ] Tempo de resposta < 500ms
- [ ] Sem erros 500
- [ ] Usuários conseguem logar
- [ ] Agentes aparecem corretamente

**Primeiras 24 horas:**
- [ ] Taxa de erro < 0.5%
- [ ] Tempo de resposta < 300ms
- [ ] Emails sendo enviados
- [ ] Convites funcionando
- [ ] Fallback de IA funcionando

### **6.3. Alertas**

Configure alertas para:
- Taxa de erro > 5%
- Tempo de resposta > 1s
- Agentes sem organizationId > 0
- Falha no envio de emails > 10%

---

## 🐛 PASSO 7: ROLLBACK (SE NECESSÁRIO)

### **7.1. Quando Fazer Rollback**

- Taxa de erro > 10%
- Funcionalidade crítica quebrada
- Perda de dados
- Performance inaceitável

### **7.2. Como Fazer Rollback**

```bash
# 1. Reverter deploy
git revert HEAD
git push production main

# Ou via plataforma
vercel rollback

# 2. Restaurar banco de dados
psql $DATABASE_URL < backup_pre_deploy_YYYYMMDD_HHMMSS.sql

# 3. Limpar cache
# (se aplicável)

# 4. Verificar funcionamento
curl https://seu-dominio.com/api/health
```

---

## ✅ PASSO 8: VALIDAÇÃO PÓS-DEPLOY

### **8.1. Testes de Produção**

```bash
# Teste 1: Health Check
curl https://seu-dominio.com/api/health

# Teste 2: Login
# (via interface)

# Teste 3: Criar Agente
# (via interface)

# Teste 4: Tornar Público
# (via interface)
```

### **8.2. Verificar Banco de Dados**

```sql
-- Verificar agentes
SELECT COUNT(*) FROM agents WHERE organizationId IS NULL;
-- Deve retornar 0

-- Verificar organizações
SELECT o.name, COUNT(a.id) as total_agentes
FROM organizations o
LEFT JOIN agents a ON a.organizationId = o.id
GROUP BY o.id, o.name;

-- Verificar convites
SELECT COUNT(*) FROM invitations WHERE usedAt IS NULL AND expires > NOW();
```

### **8.3. Checklist Final**

- [ ] Todos os testes passam
- [ ] Sem erros no console
- [ ] Logs estão normais
- [ ] Métricas estão OK
- [ ] Usuários reportam funcionamento normal
- [ ] Multi-tenancy isolado
- [ ] Emails sendo enviados
- [ ] Fallback de IA funcionando

---

## 📝 PASSO 9: COMUNICAÇÃO

### **9.1. Notificar Time**

```
✅ Deploy v2.0.0 concluído com sucesso!

Novas funcionalidades:
- Email dinâmico universal
- Sistema de convites seguro
- Compartilhamento de agentes
- Linguagem Natural com fallback
- Multi-tenancy auditado

Testes: ✅ Todos passando
Performance: ✅ Normal
Erros: ✅ < 0.1%

Documentação: /docs/v2.0.0
```

### **9.2. Atualizar Documentação**

- [ ] Atualizar CHANGELOG.md
- [ ] Atualizar README.md
- [ ] Atualizar docs de API
- [ ] Criar release notes

---

## 🎯 RESUMO DOS ARQUIVOS CRIADOS

### **Documentação:**
1. `MELHORIAS_IMPLEMENTADAS.md`
2. `MELHORIAS_09_10_FINAL.md`
3. `RENDERIZADOR_DINAMICO_EMAIL.md`
4. `ANALISE_COMPATIBILIDADE_JSON.md`
5. `ANALISE_IMPACTO_E_SOLID.md`
6. `AUDITORIA_SISTEMA_CONVITES.md`
7. `AUDITORIA_BUILDER_E_NL.md`
8. `AUDITORIA_MULTI_TENANCY.md`
9. `RESUMO_FINAL_IMPLEMENTACOES_09_10.md`
10. `CHECKLIST_PRE_PRODUCAO.md`
11. `DEPLOY_PARA_PRODUCAO.md` (este arquivo)

### **Scripts:**
1. `scripts/fix-agent-organizations.ts` - Migração de dados

### **Código Modificado:**
1. `src/app/api/send-report-email/route.ts`
2. `src/app/api/organization/invite/route.ts`
3. `src/app/api/organization/join/route.ts`
4. `src/app/api/agents/generate-from-nl/route.ts`
5. `src/app/api/agents/[id]/share/route.ts`
6. `src/app/api/organization/details/route.ts`
7. `src/components/profile/agents-section.tsx`
8. `prisma/schema.prisma`

---

## 🎓 LIÇÕES APRENDIDAS

### **O Que Deu Certo:**
- ✅ Implementação incremental
- ✅ Testes em cada etapa
- ✅ Documentação detalhada
- ✅ Logs de debug
- ✅ Fallbacks implementados

### **O Que Melhorar:**
- 🔄 Migração de dados deveria ter sido feita antes
- 🔄 Testes automatizados ajudariam
- 🔄 Staging environment é essencial

### **Para Próximos Deploys:**
1. Sempre fazer migração de dados primeiro
2. Testar em staging antes
3. Ter plano de rollback pronto
4. Monitorar métricas em tempo real
5. Comunicar mudanças ao time

---

## 📞 CONTATOS DE EMERGÊNCIA

**Se algo der errado:**

1. **Rollback imediato** (ver Passo 7)
2. **Notificar time técnico**
3. **Investigar logs**
4. **Documentar problema**
5. **Criar post-mortem**

---

## ✅ CHECKLIST FINAL

Antes de considerar deploy concluído:

- [ ] Backup feito
- [ ] Migração executada
- [ ] Schema sincronizado
- [ ] Testes em staging passaram
- [ ] Deploy em produção concluído
- [ ] Migração em produção executada
- [ ] Verificação pós-deploy OK
- [ ] Monitoramento ativo
- [ ] Time notificado
- [ ] Documentação atualizada
- [ ] Sem erros críticos
- [ ] Performance OK
- [ ] Usuários satisfeitos

---

**🎉 PARABÉNS! DEPLOY CONCLUÍDO COM SUCESSO!**

**Data:** 09/10/2025  
**Versão:** 2.0.0  
**Status:** ✅ Em Produção  
**Próxima Revisão:** 16/10/2025
