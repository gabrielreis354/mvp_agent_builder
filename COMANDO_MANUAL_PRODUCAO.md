# 🚀 COMANDO MANUAL PARA PRODUÇÃO

## ✅ O QUE JÁ FOI FEITO

- Prisma Client gerado com sucesso ✅

## ⚠️ O QUE FALTA

- Aplicar a migration no banco de produção

---

## 📋 EXECUTE ESTE COMANDO AGORA

```bash
npx dotenv -e .env.production -- prisma migrate deploy
```

**O que esse comando faz:**

1. Carrega variáveis do `.env.production`
2. Conecta no banco de produção
3. Aplica a migration `add_password_reset`
4. Cria a tabela `password_resets`

---

## 🔍 VERIFICAR SE DEU CERTO

Após executar, você deve ver:

```
✔ Generated Prisma Client
✔ Applied migration: 20250109_add_password_reset
```

---

## ⚠️ SE DER ERRO

### **Erro: "Can't reach database server"**

- Verifique se `DATABASE_URL` está correto no `.env.production`
- Verifique se tem acesso ao banco de produção

### **Erro: "Migration already applied"**

- Significa que já foi aplicada (sucesso!)
- Pode prosseguir

### **Erro: "No pending migrations"**

- Significa que não há migrations para aplicar
- Verifique se o schema foi commitado

---

## 🎯 ALTERNATIVA: USAR NPM SCRIPT

```bash
npm run prisma:migrate:prod
```

Este comando faz a mesma coisa.

---

## ✅ APÓS APLICAR

1. **Reiniciar aplicação em produção**
2. **Testar funcionalidade:**
   - Acesse `/auth/signin`
   - Clique em "Esqueci minha senha"
   - Teste o fluxo completo

---

**Execute o comando acima e me avise o resultado!**
