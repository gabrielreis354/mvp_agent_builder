# 📧 GUIA COMPLETO: Email Corporativo para SimplifiqueIA RH

**Objetivo:** Garantir que emails enviados para usuários corporativos cheguem na caixa de entrada (não spam/bloqueados).

---

## 🎯 PROBLEMA IDENTIFICADO

**Situação atual:**
- ✅ Emails funcionam para Gmail/Outlook pessoal
- ❌ Emails corporativos são bloqueados ou vão para spam
- ❌ Sem autenticação adequada (SPF, DKIM, DMARC)

**Por que isso acontece?**
- Servidores corporativos têm filtros de segurança rigorosos
- Gmail/Outlook pessoal não são confiáveis para envio profissional
- Falta de registros DNS de autenticação

---

## ✅ SOLUÇÃO COMPLETA (3 ETAPAS)

### **ETAPA 1: Provedor SMTP Profissional**
### **ETAPA 2: Configuração DNS (SPF, DKIM, DMARC)**
### **ETAPA 3: Validação e Monitoramento**

---

## 📨 ETAPA 1: PROVEDOR SMTP PROFISSIONAL

### **Opção A: SendGrid (RECOMENDADO)**

**Por que SendGrid?**
- ✅ 100 emails/dia GRÁTIS (suficiente para MVP)
- ✅ Excelente reputação com servidores corporativos
- ✅ Configuração simples
- ✅ Dashboard de monitoramento incluso
- ✅ Suporte a SPF/DKIM automático

**Passo a passo:**

1. **Criar conta SendGrid:**
   - Acesse: https://signup.sendgrid.com/
   - Plano Free: 100 emails/dia
   - Verificar email e completar perfil

2. **Criar API Key:**
   ```bash
   # No dashboard SendGrid:
   Settings → API Keys → Create API Key
   
   # Permissões: Full Access (Mail Send)
   # Copiar a chave (aparece apenas uma vez!)
   ```

3. **Configurar variáveis de ambiente:**
   ```env
   # .env.production
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SMTP_SECURE=false
   EMAIL_FROM=noreply@simplifiqueia.com.br
   EMAIL_FROM_NAME=SimplifiqueIA RH
   ```

4. **Testar envio:**
   ```bash
   curl -X POST http://localhost:3001/api/test-email \
     -H "Content-Type: application/json" \
     -d '{"email":"seu-email-corporativo@empresa.com"}'
   ```

---

### **Opção B: Mailgun**

**Vantagens:**
- ✅ 5.000 emails/mês GRÁTIS (3 meses)
- ✅ Boa reputação
- ✅ API simples

**Configuração:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.simplifiqueia.com.br
SMTP_PASS=sua_senha_mailgun
SMTP_SECURE=false
```

---

### **Opção C: AWS SES (Para escala)**

**Quando usar:**
- Mais de 1.000 emails/dia
- Precisa de alta disponibilidade
- Já usa AWS

**Configuração:**
```env
SMTP_HOST=email-smtp.sa-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=AKIAIOSFODNN7EXAMPLE
SMTP_PASS=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
SMTP_SECURE=false
```

---

## 🔐 ETAPA 2: CONFIGURAÇÃO DNS (SPF, DKIM, DMARC)

**CRÍTICO:** Sem esses registros, emails corporativos serão bloqueados!

### **2.1 SPF (Sender Policy Framework)**

**O que é:** Autoriza quais servidores podem enviar email pelo seu domínio.

**Como configurar:**

1. **Acessar painel DNS do domínio** (ex: Registro.br, GoDaddy, Cloudflare)

2. **Adicionar registro TXT:**
   ```
   Tipo: TXT
   Nome: @ (ou simplifiqueia.com.br)
   Valor: v=spf1 include:sendgrid.net ~all
   ```

3. **Se usar múltiplos provedores:**
   ```
   v=spf1 include:sendgrid.net include:_spf.google.com ~all
   ```

4. **Validar:**
   ```bash
   nslookup -type=TXT simplifiqueia.com.br
   # Deve retornar: v=spf1 include:sendgrid.net ~all
   ```

---

### **2.2 DKIM (DomainKeys Identified Mail)**

**O que é:** Assinatura digital que prova que o email veio do seu domínio.

**Como configurar (SendGrid):**

1. **No dashboard SendGrid:**
   ```
   Settings → Sender Authentication → Authenticate Your Domain
   ```

2. **Escolher provedor DNS** (ex: Cloudflare, GoDaddy)

3. **SendGrid gera 3 registros DNS:**
   ```
   Tipo: CNAME
   Nome: s1._domainkey.simplifiqueia.com.br
   Valor: s1.domainkey.u12345.wl123.sendgrid.net
   
   Tipo: CNAME
   Nome: s2._domainkey.simplifiqueia.com.br
   Valor: s2.domainkey.u12345.wl123.sendgrid.net
   
   Tipo: CNAME
   Nome: em1234.simplifiqueia.com.br
   Valor: u12345.wl123.sendgrid.net
   ```

4. **Adicionar registros no painel DNS**

5. **Aguardar propagação** (até 48h, geralmente 1-2h)

6. **Verificar no SendGrid:**
   ```
   Settings → Sender Authentication → Verify
   ```

---

### **2.3 DMARC (Domain-based Message Authentication)**

**O que é:** Define o que fazer com emails que falham SPF/DKIM.

**Como configurar:**

1. **Adicionar registro TXT no DNS:**
   ```
   Tipo: TXT
   Nome: _dmarc.simplifiqueia.com.br
   Valor: v=DMARC1; p=quarantine; rua=mailto:dmarc@simplifiqueia.com.br; pct=100; adkim=s; aspf=s
   ```

2. **Explicação dos parâmetros:**
   - `p=quarantine` - Emails suspeitos vão para spam (não rejeitados)
   - `rua=mailto:...` - Receber relatórios de autenticação
   - `pct=100` - Aplicar política em 100% dos emails
   - `adkim=s` - DKIM strict
   - `aspf=s` - SPF strict

3. **Validar:**
   ```bash
   nslookup -type=TXT _dmarc.simplifiqueia.com.br
   ```

---

## 🧪 ETAPA 3: VALIDAÇÃO E MONITORAMENTO

### **3.1 Testar Deliverability**

**Ferramenta 1: Mail Tester**
```
1. Acessar: https://www.mail-tester.com/
2. Copiar email gerado (ex: test-abc123@mail-tester.com)
3. Enviar email de teste via /api/test-email
4. Verificar score (meta: 10/10)
```

**Ferramenta 2: MXToolbox**
```
1. Acessar: https://mxtoolbox.com/SuperTool.aspx
2. Verificar:
   - SPF Record: simplifiqueia.com.br
   - DKIM Record: s1._domainkey.simplifiqueia.com.br
   - DMARC Record: _dmarc.simplifiqueia.com.br
   - Blacklist: simplifiqueia.com.br
```

**Ferramenta 3: Google Postmaster Tools**
```
1. Acessar: https://postmaster.google.com/
2. Adicionar domínio: simplifiqueia.com.br
3. Monitorar:
   - Reputação do domínio
   - Taxa de spam
   - Autenticação
```

---

### **3.2 Monitoramento Contínuo**

**Dashboard SendGrid:**
```
Statistics → Email Activity
- Delivered: % de emails entregues
- Bounced: % de emails rejeitados
- Spam Reports: % marcados como spam
```

**Alertas automáticos:**
```typescript
// Adicionar em email-service.ts
if (result.rejected && result.rejected.length > 0) {
  console.error('🚨 [Email] Emails rejeitados:', result.rejected)
  // Enviar alerta para admin
}
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### **Configuração Inicial:**
- [ ] Conta SendGrid criada
- [ ] API Key gerada e salva em .env.production
- [ ] Variáveis SMTP configuradas
- [ ] Teste de envio bem-sucedido

### **DNS:**
- [ ] Registro SPF adicionado
- [ ] Registros DKIM adicionados (3 CNAMEs)
- [ ] Registro DMARC adicionado
- [ ] Propagação DNS verificada (24-48h)
- [ ] SendGrid confirmou autenticação

### **Validação:**
- [ ] Mail Tester: Score 10/10
- [ ] MXToolbox: Sem erros
- [ ] Email de teste chegou em Gmail corporativo
- [ ] Email de teste chegou em Outlook corporativo
- [ ] Email não foi para spam

### **Monitoramento:**
- [ ] Google Postmaster Tools configurado
- [ ] Alertas de bounce configurados
- [ ] Dashboard SendGrid monitorado semanalmente

---

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### **Problema 1: Email ainda vai para spam**

**Causas possíveis:**
1. DNS não propagou (aguardar 48h)
2. Domínio novo (sem reputação)
3. Conteúdo do email suspeito

**Soluções:**
```bash
# 1. Verificar propagação DNS
dig TXT simplifiqueia.com.br
dig TXT _dmarc.simplifiqueia.com.br

# 2. Warm-up do domínio (enviar poucos emails inicialmente)
# Dia 1: 10 emails
# Dia 2: 20 emails
# Dia 3: 50 emails
# Dia 7: 100 emails

# 3. Melhorar conteúdo
- Evitar palavras spam: "grátis", "clique aqui", "urgente"
- Incluir link de unsubscribe
- Manter ratio texto/imagem balanceado
```

---

### **Problema 2: Emails corporativos específicos bloqueiam**

**Solução:**
```
1. Pedir ao usuário para adicionar noreply@simplifiqueia.com.br aos contatos
2. Pedir ao TI da empresa para whitelist do domínio
3. Fornecer instruções específicas por provedor:
   - Gmail Workspace: Admin Console → Apps → Gmail → Spam
   - Microsoft 365: Exchange Admin → Mail Flow → Rules
```

---

### **Problema 3: Taxa de bounce alta**

**Causas:**
- Emails inválidos no banco
- Caixas de entrada cheias
- Servidores temporariamente indisponíveis

**Solução:**
```typescript
// Implementar verificação de email antes de enviar
import { validateCorporateEmail } from '@/lib/validators/email-validator'

const validation = await validateCorporateEmail(email)
if (!validation.isValid) {
  console.warn('Email inválido, não enviando:', email)
  return
}
```

---

## 💰 CUSTOS ESTIMADOS

### **Plano Free (0-100 emails/dia):**
- SendGrid: GRÁTIS
- Domínio: R$ 40/ano
- **Total: R$ 40/ano**

### **Plano Essentials (100-1.000 emails/dia):**
- SendGrid: $19.95/mês (~R$ 100/mês)
- Domínio: R$ 40/ano
- **Total: R$ 1.240/ano**

### **Plano Pro (1.000-10.000 emails/dia):**
- SendGrid: $89.95/mês (~R$ 450/mês)
- Domínio: R$ 40/ano
- **Total: R$ 5.440/ano**

---

## 🎯 PRÓXIMOS PASSOS

1. **Imediato (hoje):**
   - Criar conta SendGrid
   - Configurar variáveis SMTP
   - Testar envio

2. **Curto prazo (1-3 dias):**
   - Adicionar registros DNS
   - Aguardar propagação
   - Validar com Mail Tester

3. **Médio prazo (1 semana):**
   - Monitorar deliverability
   - Ajustar conteúdo dos emails
   - Warm-up do domínio

4. **Longo prazo (1 mês):**
   - Analisar métricas
   - Otimizar templates
   - Implementar webhooks de bounce

---

**Última atualização:** 14/10/2025  
**Responsável:** Equipe SimplifiqueIA RH
