# 📧 Configuração de Email - suporte@simplifiqueia.com.br

**Data:** 07/10/2025  
**Email:** suporte@simplifiqueia.com.br  
**Status:** Pronto para configurar

---

## 🎯 Objetivo

Configurar email real para envio de relatórios e remover todas as simulações do sistema.

---

## 📋 Pré-requisitos

### **Informações Necessárias:**

1. **Provedor de Email:** (Ex: Gmail, Outlook, Hostinger, etc)
2. **Servidor SMTP:**
   - Host: `smtp.????.com.br`
   - Porta: `587` (TLS) ou `465` (SSL)
   - Segurança: TLS ou SSL
3. **Credenciais:**
   - Email: `suporte@simplifiqueia.com.br`
   - Senha/App Password: `[SENHA]`

---

## 🔧 Configurações por Provedor

### **1. Gmail / Google Workspace**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=suporte@simplifiqueia.com.br
SMTP_PASS=[APP_PASSWORD]
```

**Passos:**
1. Ativar autenticação de 2 fatores
2. Gerar "Senha de App" em: https://myaccount.google.com/apppasswords
3. Usar senha de app no `SMTP_PASS`

---

### **2. Outlook / Office 365**
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=suporte@simplifiqueia.com.br
SMTP_PASS=[SENHA]
```

---

### **3. Hostinger**
```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=suporte@simplifiqueia.com.br
SMTP_PASS=[SENHA]
```

---

### **4. Locaweb**
```env
SMTP_HOST=smtp.locaweb.com.br
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=suporte@simplifiqueia.com.br
SMTP_PASS=[SENHA]
```

---

### **5. UOL Host**
```env
SMTP_HOST=smtp.uol.com.br
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=suporte@simplifiqueia.com.br
SMTP_PASS=[SENHA]
```

---

## 📝 Passos de Configuração

### **1. Criar arquivo `.env.local`**

```bash
# Na raiz do projeto mvp-agent-builder
cd mvp-agent-builder
```

Criar arquivo `.env.local`:

```env
# ============================================
# CONFIGURAÇÕES DE EMAIL
# ============================================

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=suporte@simplifiqueia.com.br
SMTP_PASS=sua_senha_aqui

# Email Settings
EMAIL_FROM=suporte@simplifiqueia.com.br
EMAIL_FROM_NAME=SimplifiqueIA Suporte
```

### **2. Testar Configuração**

Criar arquivo de teste `test-email.js`:

```javascript
// test-email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Ajustar conforme provedor
  port: 587,
  secure: false,
  auth: {
    user: 'suporte@simplifiqueia.com.br',
    pass: 'sua_senha_aqui'
  }
});

async function testEmail() {
  try {
    // Verificar conexão
    await transporter.verify();
    console.log('✅ Conexão SMTP OK!');
    
    // Enviar email de teste
    const info = await transporter.sendMail({
      from: 'suporte@simplifiqueia.com.br',
      to: 'seu_email_pessoal@gmail.com', // Seu email para teste
      subject: 'Teste de Configuração SMTP',
      html: '<h1>Email configurado com sucesso!</h1><p>O sistema de email está funcionando.</p>'
    });
    
    console.log('✅ Email enviado:', info.messageId);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testEmail();
```

Executar teste:
```bash
node test-email.js
```

---

## 🔒 Segurança

### **Boas Práticas:**

1. **Nunca commitar `.env.local`**
   - Já está no `.gitignore`
   - Contém credenciais sensíveis

2. **Usar Senha de App (Gmail)**
   - Mais seguro que senha principal
   - Pode ser revogada sem afetar conta

3. **Limitar Permissões**
   - Email só para envio (não recebimento)
   - Monitorar logs de envio

4. **Produção:**
   - Usar variáveis de ambiente do servidor
   - Não usar senhas em texto plano
   - Considerar serviços como SendGrid, Mailgun

---

## 🧪 Validação

### **Checklist de Teste:**

- [ ] Conexão SMTP estabelecida
- [ ] Email de teste enviado
- [ ] Email recebido na caixa de entrada
- [ ] Anexos funcionando
- [ ] Formatação HTML correta
- [ ] Remetente correto (suporte@simplifiqueia.com.br)
- [ ] Sem mensagens de simulação

---

## 🚀 Ativação no Sistema

Após configurar `.env.local`, o sistema automaticamente:

1. ✅ Detecta configuração SMTP
2. ✅ Desabilita modo simulação
3. ✅ Envia emails reais
4. ✅ Retorna messageId real

### **Logs Esperados:**

```
✅ Email Service: Configuração SMTP detectada
✅ Email Service: Conexão verificada
✅ Email enviado: <messageId@smtp.gmail.com>
```

---

## 📊 Monitoramento

### **Logs de Email:**

O sistema registra:
- ✅ Emails enviados com sucesso
- ❌ Falhas de envio
- 📧 Destinatários
- 📎 Anexos
- ⏱️ Tempo de envio

### **Dashboard (Futuro):**

- Total de emails enviados
- Taxa de sucesso
- Emails por agente
- Relatórios mais enviados

---

## 🔧 Troubleshooting

### **Erro: "Invalid login"**
- Verificar usuário e senha
- Gmail: Usar senha de app
- Verificar 2FA ativado

### **Erro: "Connection timeout"**
- Verificar host e porta
- Firewall bloqueando porta 587/465
- Testar com telnet: `telnet smtp.gmail.com 587`

### **Erro: "Self-signed certificate"**
- Adicionar `tls: { rejectUnauthorized: false }`
- Apenas para desenvolvimento

### **Email não chega:**
- Verificar spam/lixo eletrônico
- Verificar SPF/DKIM do domínio
- Testar com email pessoal primeiro

---

## 📋 Próximos Passos

1. **Configurar `.env.local`** com credenciais
2. **Executar `test-email.js`** para validar
3. **Testar no sistema** enviando relatório
4. **Monitorar logs** para confirmar envio
5. **Configurar produção** com variáveis de ambiente

---

## 🎯 Resultado Esperado

### **Antes (Simulação):**
```
[EMAIL SIMULADO] Para: usuario@email.com
[EMAIL SIMULADO] Assunto: Relatório de Análise
[EMAIL SIMULADO] Anexos: 1
messageId: simulated-1234567890
```

### **Depois (Real):**
```
✅ Email enviado com sucesso
Para: usuario@email.com
Assunto: Relatório de Análise
Anexos: 1 (relatorio.pdf)
messageId: <abc123@smtp.gmail.com>
```

---

**Status:** 📋 Aguardando configuração  
**Próximo:** Configurar `.env.local` e testar  
**Suporte:** suporte@simplifiqueia.com.br
