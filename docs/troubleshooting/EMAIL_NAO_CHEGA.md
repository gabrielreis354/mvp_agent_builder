# 🔧 Troubleshooting: Email Não Chega para Usuário Empresarial

## 📋 Cenário

- ✅ **Funciona:** Emails pessoais (Gmail, Outlook pessoal)
- ❌ **Não funciona:** Emails empresariais (domínios corporativos)
- ✅ **Código:** Está correto e funcionando

---

## 🔍 Diagnóstico Rápido

### **Passo 1: Testar Envio de Email**

Use o endpoint de teste criado:

```bash
# Testar com email empresarial
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@empresa.com"}'
```

**Verifique os logs no console:**

```
🧪 [TEST-EMAIL] ===== TESTE DE EMAIL INICIADO =====
📧 [EMAIL SERVICE] Servidor SMTP: smtp.gmail.com:587
✅ [EMAIL SERVICE] Email enviado com sucesso!
✅ [EMAIL SERVICE] Accepted: usuario@empresa.com
✅ [EMAIL SERVICE] Rejected: (vazio)
```

---

### **Passo 2: Verificar Logs Detalhados**

Após testar, verifique:

1. **Email foi aceito pelo servidor?**

   ```
   ✅ Accepted: usuario@empresa.com  → BOM
   ❌ Rejected: usuario@empresa.com  → PROBLEMA
   ```

2. **Servidor SMTP respondeu?**

   ```
   ✅ MessageId: <abc123@gmail.com>  → BOM
   ❌ Erro: Connection timeout         → PROBLEMA
   ```

---

## 🚨 Problemas Comuns e Soluções

### **Problema 1: Filtro de Spam Corporativo**

**Sintomas:**

- Email aceito pelo servidor SMTP
- Não chega na caixa de entrada
- Não aparece nem no spam

**Causa:**
Servidores corporativos têm **filtros de segurança rigorosos** que bloqueiam emails de remetentes não autorizados.

**Soluções:**

#### **A) Configurar SPF, DKIM e DMARC (Recomendado)**

Se você tem um **domínio próprio** (ex: `simplifiqueai.com`):

1. **Adicionar registro SPF no DNS:**

   ```
   TXT @ "v=spf1 include:_spf.google.com ~all"
   ```

2. **Configurar DKIM:**
   - No Google Workspace: Admin Console → Apps → Google Workspace → Gmail → Authenticate email
   - Copiar chave pública e adicionar no DNS

3. **Adicionar DMARC:**

   ```
   TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:admin@simplifiqueai.com"
   ```

#### **B) Usar Provedor SMTP Profissional**

Provedores como **SendGrid**, **Mailgun** ou **AWS SES** têm **melhor reputação** com servidores corporativos:

**SendGrid (Recomendado):**

```env
# .env.local
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.sua_api_key_aqui
SMTP_SECURE=false
EMAIL_FROM_NAME=SimplifiqueIA
```

**Mailgun:**

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@seu-dominio.mailgun.org
SMTP_PASS=sua_senha_aqui
```

**AWS SES:**

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=seu_access_key
SMTP_PASS=sua_secret_key
```

#### **C) Pedir ao Usuário para Adicionar à Lista Segura**

Instrua o usuário a:

1. **Adicionar remetente à lista de contatos confiáveis**
2. **Verificar quarentena do servidor de email**
3. **Contatar TI da empresa** para liberar o domínio

---

### **Problema 2: Gmail/Outlook Bloqueando**

**Sintomas:**

- Erro: "Less secure app access"
- Erro: "Username and Password not accepted"

**Solução:**

#### **Gmail:**

1. Usar **App Password** ao invés da senha normal:
   - Acessar: <https://myaccount.google.com/apppasswords>
   - Gerar senha de app
   - Usar no `SMTP_PASS`

2. Ou usar **OAuth2** (mais seguro):

   ```typescript
   // Configurar OAuth2 no nodemailer
   auth: {
     type: 'OAuth2',
     user: 'seu-email@gmail.com',
     clientId: 'SEU_CLIENT_ID',
     clientSecret: 'SEU_CLIENT_SECRET',
     refreshToken: 'SEU_REFRESH_TOKEN'
   }
   ```

#### **Outlook:**

1. Habilitar autenticação SMTP:
   - Acessar: <https://outlook.live.com/mail/options/mail/accounts>
   - Habilitar "Let devices and apps use POP"

---

### **Problema 3: Porta SMTP Bloqueada**

**Sintomas:**

- Erro: "Connection timeout"
- Erro: "ECONNREFUSED"

**Causa:**
Firewall ou provedor de hospedagem bloqueia porta 25, 465 ou 587.

**Solução:**

1. **Testar diferentes portas:**

   ```env
   # Tentar porta 587 (TLS)
   SMTP_PORT=587
   SMTP_SECURE=false
   
   # Ou porta 465 (SSL)
   SMTP_PORT=465
   SMTP_SECURE=true
   ```

2. **Verificar firewall:**

   ```bash
   # Testar conectividade
   telnet smtp.gmail.com 587
   ```

---

### **Problema 4: Rate Limiting**

**Sintomas:**

- Primeiros emails chegam
- Depois param de chegar
- Erro: "Daily sending quota exceeded"

**Solução:**

1. **Gmail:** Limite de 500 emails/dia
   - Usar Google Workspace (2000/dia)
   - Ou migrar para SendGrid/Mailgun

2. **Implementar fila de emails:**

   ```typescript
   // Usar Redis + Bull para enfileirar
   import Queue from 'bull';
   
   const emailQueue = new Queue('emails', {
     redis: { host: 'localhost', port: 6379 }
   });
   
   emailQueue.process(async (job) => {
     await emailService.sendEmail(job.data);
   });
   ```

---

## ✅ Checklist de Verificação

### **Configuração Básica:**

- [ ] Variáveis SMTP configuradas no `.env.local`
- [ ] Servidor SMTP acessível (testar com telnet)
- [ ] Credenciais corretas (testar login manual)

### **Autenticação:**

- [ ] SPF configurado no DNS
- [ ] DKIM configurado e verificado
- [ ] DMARC configurado
- [ ] Usando App Password (Gmail) ou OAuth2

### **Deliverability:**

- [ ] Domínio não está em blacklist (verificar em mxtoolbox.com)
- [ ] IP do servidor não está em blacklist
- [ ] Email tem conteúdo válido (não só links)
- [ ] Remetente tem nome legível

### **Testes:**

- [ ] Email de teste chega em Gmail pessoal
- [ ] Email de teste chega em Outlook pessoal
- [ ] Email de teste chega em email empresarial
- [ ] Email não vai para spam

---

## 🧪 Como Usar o Endpoint de Teste

### **1. Via cURL:**

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@empresa.com"}'
```

### **2. Via Postman:**

```
POST http://localhost:3000/api/test-email
Content-Type: application/json

{
  "email": "usuario@empresa.com"
}
```

### **3. Via Frontend (criar página de teste):**

```typescript
const testEmail = async (email: string) => {
  const response = await fetch('/api/test-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const result = await response.json();
  console.log(result);
};
```

---

## 📊 Interpretando os Logs

### **Logs de Sucesso:**

```
📧 [EMAIL SERVICE] ===== INICIANDO ENVIO DE EMAIL =====
📧 [EMAIL SERVICE] Para: usuario@empresa.com
📧 [EMAIL SERVICE] Servidor SMTP: smtp.sendgrid.net:587
✅ [EMAIL SERVICE] Email enviado com sucesso!
✅ [EMAIL SERVICE] MessageId: <abc123@sendgrid.net>
✅ [EMAIL SERVICE] Accepted: usuario@empresa.com
✅ [EMAIL SERVICE] Rejected: (vazio)
```

### **Logs de Falha - Autenticação:**

```
❌ [EMAIL SERVICE] Erro: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solução:** Verificar credenciais SMTP

### **Logs de Falha - Conexão:**

```
❌ [EMAIL SERVICE] Erro: ECONNREFUSED
```

**Solução:** Verificar firewall e porta

### **Logs de Falha - Rejeitado:**

```
✅ [EMAIL SERVICE] Accepted: (vazio)
❌ [EMAIL SERVICE] Rejected: usuario@empresa.com
```

**Solução:** Email bloqueado pelo servidor de destino

---

## 🎯 Recomendação Final

### **Para Produção:**

1. **Use SendGrid ou Mailgun** (não Gmail/Outlook)
2. **Configure SPF/DKIM/DMARC** no seu domínio
3. **Monitore deliverability** com ferramentas como:
   - <https://www.mail-tester.com/>
   - <https://mxtoolbox.com/blacklists.aspx>
   - <https://postmarkapp.com/spam-check>

4. **Implemente retry logic** para emails que falham
5. **Adicione webhook** para rastrear bounces e reclamações

---

## 📞 Suporte

Se o problema persistir:

1. **Compartilhe os logs** do endpoint `/api/test-email`
2. **Informe o provedor SMTP** que está usando
3. **Verifique se o domínio empresarial** tem políticas específicas
4. **Contate o TI da empresa** para verificar filtros de spam

---

**Última atualização:** 13/10/2025
