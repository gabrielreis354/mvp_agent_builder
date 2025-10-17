# 🧪 Guia Completo: Testar SendGrid

## 📋 Pré-requisitos

Antes de testar, certifique-se de que completou:

### ✅ Checklist de Configuração

- [ ] Conta criada no SendGrid (https://app.sendgrid.com)
- [ ] API Key gerada com permissões de envio
- [ ] Email verificado (Sender Authentication)
- [ ] Variáveis configuradas no `.env.local`

---

## 🔍 PARTE 1: Verificar Interface do SendGrid

### Passo 1: Verificar Sender Authentication

1. Acesse: https://app.sendgrid.com/settings/sender_auth
2. Você deve ver uma das opções:

#### Opção A: Domain Authentication (Recomendado para Produção)
```
Status: ✅ Verified
Type: Domain Authentication
Domain: seudominio.com.br
```

**Como configurar:**
- Clique em "Authenticate Your Domain"
- Adicione os registros DNS fornecidos no seu provedor de domínio
- Aguarde verificação (pode levar até 48h)

#### Opção B: Single Sender Verification (Rápido para Testes)
```
Status: ✅ Verified
Type: Single Sender Verification
Email: seu-email@gmail.com
```

**Como configurar:**
- Clique em "Verify a Single Sender"
- Preencha o formulário:
  - **From Name**: AutomateAI
  - **From Email**: seu-email@gmail.com
  - **Reply To**: mesmo email ou outro
  - **Company Address**: seu endereço (obrigatório por lei)
- Clique no link de verificação enviado para seu email

### Passo 2: Verificar API Key

1. Acesse: https://app.sendgrid.com/settings/api_keys
2. Verifique se sua API Key está listada:
   - **Nome**: (ex: "AutomateAI Key")
   - **Status**: Ativa
   - **Permissions**: "Full Access" ou "Mail Send"

3. **⚠️ IMPORTANTE**: 
   - A API Key completa só aparece UMA VEZ na criação
   - Se não salvou, delete a antiga e crie uma nova
   - Guarde em local seguro (gerenciador de senhas)

---

## ⚙️ PARTE 2: Configurar Variáveis de Ambiente

### Edite o arquivo `.env.local`:

```env
# ============================================
# SENDGRID CONFIGURATION
# ============================================

# API Key do SendGrid (começa com SG.)
SENDGRID_API_KEY=SG.sua_chave_completa_aqui

# Email verificado no SendGrid (Sender Authentication)
SENDGRID_FROM_EMAIL=seu-email-verificado@gmail.com

# Nome que aparece como remetente
SENDGRID_FROM_NAME=AutomateAI - Agentes RH
```

### Exemplo Real:
```env
SENDGRID_API_KEY=SG.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
SENDGRID_FROM_EMAIL=contato@automate-ai.com.br
SENDGRID_FROM_NAME=AutomateAI
```

**⚠️ Atenção:**
- Use o email EXATO que foi verificado no SendGrid
- Não use aspas nas variáveis
- Salve o arquivo e reinicie o servidor

---

## 🧪 PARTE 3: Executar Testes

### Método 1: Teste via Navegador (Mais Fácil)

1. **Certifique-se de que o servidor está rodando:**
   ```bash
   npm run dev
   ```

2. **Acesse no navegador:**
   ```
   http://localhost:3001/api/test-sendgrid
   ```

3. **Resultados Esperados:**

   #### ✅ Sucesso:
   ```json
   {
     "success": true,
     "message": "✅ SendGrid configurado e funcionando corretamente!",
     "details": {
       "statusCode": 202,
       "messageId": "abc123...",
       "to": "seu-email@gmail.com",
       "from": "seu-email@gmail.com"
     },
     "instructions": [
       "1. Verifique sua caixa de entrada",
       "2. Se não aparecer, verifique a pasta de spam",
       "3. O email deve ter o assunto: '✅ Teste SendGrid - AutomateAI'"
     ]
   }
   ```

   #### ❌ Erro:
   ```json
   {
     "success": false,
     "message": "❌ Erro ao enviar email de teste",
     "error": "Descrição do erro",
     "troubleshooting": [
       "Verifique se SENDGRID_API_KEY está no .env.local",
       "Confirme que o email está verificado no SendGrid",
       ...
     ]
   }
   ```

### Método 2: Teste via Terminal

```bash
# Executar script de teste
npx ts-node src/lib/email/test-sendgrid.ts
```

---

## 📧 PARTE 4: Verificar Email Recebido

### O que esperar:

1. **Assunto**: "✅ Teste SendGrid - AutomateAI"

2. **Conteúdo**: Email HTML profissional com:
   - Header colorido com título "🎉 Configuração Bem-Sucedida!"
   - Badge verde "✅ SendGrid Configurado Corretamente"
   - Lista de verificações concluídas
   - Informações do teste (remetente, data, sistema)
   - Próximos passos

3. **Remetente**: Seu email verificado

4. **Tempo**: Deve chegar em segundos (máximo 1-2 minutos)

### Se não recebeu:

1. **Verifique a pasta de SPAM**
2. **Aguarde 2-3 minutos** (pode haver atraso)
3. **Verifique os logs do console** para erros
4. **Acesse o SendGrid Activity**: https://app.sendgrid.com/email_activity

---

## 🔧 PARTE 5: Solução de Problemas

### Erro 401: Unauthorized

**Causa**: API Key inválida ou incorreta

**Solução**:
1. Verifique se copiou a API Key completa
2. Confirme que não há espaços extras
3. Gere uma nova API Key no SendGrid
4. Reinicie o servidor após alterar `.env.local`

### Erro 403: Forbidden

**Causa**: Email remetente não verificado

**Solução**:
1. Acesse: https://app.sendgrid.com/settings/sender_auth
2. Verifique se o status é "Verified" (verde)
3. Se "Pending", clique no email de verificação
4. Confirme que o email no `.env.local` é EXATO ao verificado

### Erro 404: Not Found

**Causa**: Endpoint da API incorreto

**Solução**:
1. Verifique a URL: `http://localhost:3001/api/test-sendgrid`
2. Confirme que o servidor está rodando na porta 3001
3. Verifique se o arquivo `route.ts` foi criado corretamente

### Email não chega

**Possíveis causas**:
1. **Pasta de spam**: Verifique sempre primeiro
2. **Atraso**: Aguarde até 5 minutos
3. **Email bloqueado**: Alguns provedores bloqueiam emails de teste
4. **Quota excedida**: Verifique limites no SendGrid

**Como verificar**:
1. Acesse: https://app.sendgrid.com/email_activity
2. Procure pelo email de teste
3. Veja o status: Delivered, Bounced, Dropped, etc.

---

## 📊 PARTE 6: Verificar Logs Detalhados

### No Console do Navegador (F12):

```
🔍 Iniciando diagnóstico do SendGrid...

📋 PASSO 1: Verificando variáveis de ambiente
✅ API Key encontrada: SG.abc123...
✅ From Email: seu-email@gmail.com
✅ From Name: AutomateAI

📋 PASSO 2: Configurando SendGrid
✅ SendGrid configurado com sucesso

📋 PASSO 3: Testando envio de email
⏳ Enviando email de teste...

✅ EMAIL ENVIADO COM SUCESSO!
📧 Destinatário: seu-email@gmail.com
📨 Status: 202
🆔 Message ID: abc123def456...

🎉 TESTE CONCLUÍDO COM SUCESSO!
📬 Verifique sua caixa de entrada: seu-email@gmail.com
```

### No Terminal (se usar npx ts-node):

Mesmos logs acima, mas no terminal

---

## ✅ PARTE 7: Confirmar Sucesso

### Checklist Final:

- [ ] API retornou `"success": true`
- [ ] Status code foi `202` (Accepted)
- [ ] Message ID foi gerado
- [ ] Email chegou na caixa de entrada (ou spam)
- [ ] Email está formatado corretamente (HTML)
- [ ] Remetente aparece como configurado

### Se TODOS os itens acima estão ✅:

**🎉 PARABÉNS! SendGrid está configurado e funcionando!**

Agora você pode:
1. Usar o sistema de envio de emails nos agentes
2. Configurar templates personalizados
3. Enviar relatórios por email automaticamente

---

## 🚀 Próximos Passos

### 1. Testar com Agente Real

Execute um agente que envia email (ex: "Analisador de Contratos RH"):
- Selecione opção de entrega: "Email"
- Informe um email destinatário
- Execute o agente
- Verifique se o relatório chegou por email

### 2. Configurar Templates Personalizados

Edite os templates de email em:
```
src/lib/email/email-service.ts
```

### 3. Monitorar Envios

Acesse regularmente:
- **Activity**: https://app.sendgrid.com/email_activity
- **Statistics**: https://app.sendgrid.com/statistics

### 4. Configurar Domain Authentication (Produção)

Para produção, configure Domain Authentication:
1. Melhora deliverability (taxa de entrega)
2. Evita emails caírem em spam
3. Permite usar qualquer email do seu domínio

---

## 📞 Suporte

### Recursos SendGrid:
- **Documentação**: https://docs.sendgrid.com
- **Status**: https://status.sendgrid.com
- **Suporte**: https://support.sendgrid.com

### Logs do Sistema:
- Console do navegador (F12)
- Terminal do servidor
- SendGrid Activity Feed

---

## 🔒 Segurança

### ⚠️ NUNCA:
- Commite `.env.local` no Git
- Compartilhe sua API Key publicamente
- Use a mesma API Key em múltiplos ambientes

### ✅ SEMPRE:
- Use `.env.local` para desenvolvimento
- Use variáveis de ambiente no servidor de produção
- Gere API Keys separadas por ambiente
- Revogue API Keys antigas ou comprometidas

---

**Última atualização**: 17/10/2025
**Versão**: 1.0
**Sistema**: AutomateAI MVP Agent Builder
