# 🔧 SOLUÇÃO - SMTP no Vercel

## ✅ SITUAÇÃO ATUAL:

- Variáveis SMTP configuradas no Vercel ✅
- Migration aplicada no banco ✅
- Código implementado ✅
- **PROBLEMA:** Variáveis não estão sendo carregadas

---

## 🎯 CAUSA:

As variáveis de ambiente foram adicionadas **DEPOIS** do último deploy.

O Vercel só carrega variáveis de ambiente durante o **BUILD**, não em runtime.

---

## ✅ SOLUÇÃO: FORÇAR REDEPLOY

### **Opção 1: Redeploy pelo Dashboard (RÁPIDO)**

1. **Acesse:** https://vercel.com/dashboard
2. **Seu Projeto** > **Deployments**
3. **Último deploy** > **⋯ (três pontos)** > **Redeploy**
4. **Aguarde 2-3 minutos**

---

### **Opção 2: Commit Vazio (Automático)**

```bash
git commit --allow-empty -m "chore: force redeploy to load SMTP env vars"
git push origin main
```

---

### **Opção 3: Vercel CLI**

```bash
# Instalar Vercel CLI (se não tiver)
npm install -g vercel

# Fazer redeploy
vercel --prod
```

---

## 🧪 APÓS REDEPLOY:

### **1. Verificar se variáveis foram carregadas:**

Adicione log temporário em `forgot-password/route.ts`:

```typescript
console.log('[DEBUG] SMTP_HOST:', process.env.SMTP_HOST ? 'Configurado' : 'NÃO ENCONTRADO');
console.log('[DEBUG] SMTP_USER:', process.env.SMTP_USER ? 'Configurado' : 'NÃO ENCONTRADO');
```

### **2. Testar funcionalidade:**

1. Acesse: https://www.simplifiqueai.com.br/auth/forgot-password
2. Digite: gabrielrelescunha@gmail.com
3. Clique em "Enviar Link de Redefinição"
4. Verificar:
   - ✅ Sem erro 500
   - ✅ Mensagem de sucesso
   - ✅ Email recebido

---

## 📋 CHECKLIST:

- [x] Variáveis SMTP configuradas no Vercel
- [x] Migration aplicada
- [ ] **Redeploy forçado** ← VOCÊ ESTÁ AQUI
- [ ] Testar funcionalidade
- [ ] Verificar email recebido

---

## ⚠️ SE AINDA NÃO FUNCIONAR:

### **Verificar Logs do Vercel:**

1. **Dashboard** > **Deployments** > **Latest**
2. **Functions** > Clique na função que deu erro
3. **Ver logs detalhados**

### **Possíveis Problemas:**

1. **Senha de App do Google incorreta:**
   - Gerar nova em: https://myaccount.google.com/apppasswords
   - Atualizar `SMTP_PASS` no Vercel

2. **Gmail bloqueando acesso:**
   - Verificar em: https://myaccount.google.com/security
   - Ativar "Acesso a apps menos seguros" (se necessário)

3. **Porta bloqueada:**
   - Tentar `SMTP_PORT=465` e `SMTP_SECURE=true`

---

## 🎯 EXECUTE AGORA:

**Faça o redeploy usando uma das opções acima!**

Depois me avise quando terminar para testarmos juntos.
