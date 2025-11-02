# 🚀 DEPLOY "Esqueci Minha Senha" para PRODUÇÃO

**Data:** 09/10/2025 17:26  
**Funcionalidade:** Reset de Senha  
**Status:** ⚠️ **AGUARDANDO DEPLOY**

---

## ⚠️ PRÉ-REQUISITOS CRÍTICOS

### **1. Backup do Banco de Dados** 🔴

**OBRIGATÓRIO antes de qualquer migration em produção!**

```bash
# Fazer backup do banco de produção
# (Ajuste conforme seu provedor)

# PostgreSQL (AWS RDS/Neon/Supabase)
pg_dump -h seu-host.aws.com -U usuario -d banco > backup_pre_password_reset.sql

# Ou use o painel do seu provedor (Neon, Supabase, etc)
```

---

### **2. Testar em Ambiente Local** ✅

**Checklist:**
- [x] Migration aplicada no banco local
- [x] Funcionalidade testada localmente
- [x] Email de reset funcionando
- [x] Reset de senha funcionando
- [ ] Código commitado no Git
- [ ] Build de produção testado

---

### **3. Configurar SMTP em Produção** 📧

**Variáveis de ambiente necessárias:**

```env
# .env.production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app-google
EMAIL_FROM_NAME=SimplifiqueIA
NEXTAUTH_URL=https://seu-dominio.com
```

**⚠️ IMPORTANTE:**
- Use senha de app do Gmail (não a senha normal)
- Configure em: https://myaccount.google.com/apppasswords

---

## 🚀 PROCESSO DE DEPLOY

### **Passo 1: Commit e Push do Código**

```bash
# 1. Adicionar arquivos
git add .

# 2. Commit
git commit -m "feat: adiciona funcionalidade 'Esqueci minha senha' com reset por email"

# 3. Push para repositório
git push origin main
```

---

### **Passo 2: Aplicar Migration em Produção**

**Opção A: Script Automático (Windows)**

```bash
# Execute o script de produção
.\migrate-production.bat
```

**Opção B: Comando Manual**

```bash
# Aplicar migrations em produção
npx dotenv -e .env.production -- prisma migrate deploy

# Gerar Prisma Client
npx dotenv -e .env.production -- prisma generate
```

**Opção C: Via Vercel/Plataforma**

Se estiver usando Vercel, Netlify, etc:

1. A migration será aplicada automaticamente no build
2. Ou configure um script de deploy:

```json
// package.json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

---

### **Passo 3: Verificar Variáveis de Ambiente**

**No painel da sua plataforma (Vercel/Netlify/etc):**

```env
DATABASE_URL=postgresql://...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=seu-secret-seguro
```

---

### **Passo 4: Deploy da Aplicação**

**Vercel:**
```bash
# Deploy automático ao fazer push
git push origin main

# Ou manual
vercel --prod
```

**Outras plataformas:**
```bash
# Build de produção
npm run build

# Iniciar servidor
npm start
```

---

## 🧪 TESTES PÓS-DEPLOY

### **Checklist de Verificação:**

1. **✅ Acessar página de login**
   - URL: `https://seu-dominio.com/auth/signin`
   - Verificar se link "Esqueci minha senha" aparece

2. **✅ Testar solicitação de reset**
   - Clicar em "Esqueci minha senha"
   - Digitar email válido
   - Verificar se mensagem de sucesso aparece

3. **✅ Verificar email recebido**
   - Checar caixa de entrada
   - Verificar caixa de spam
   - Email deve ter design profissional
   - Link deve estar funcionando

4. **✅ Testar reset de senha**
   - Clicar no link do email
   - Criar nova senha
   - Verificar indicador de força
   - Confirmar senha
   - Submeter formulário

5. **✅ Testar login com nova senha**
   - Ir para página de login
   - Usar nova senha
   - Verificar se login funciona

6. **✅ Testar casos de erro**
   - Token expirado (após 1 hora)
   - Token já usado
   - Senhas não coincidem
   - Senha muito curta

---

## 📊 MONITORAMENTO

### **Logs para Monitorar:**

```bash
# Verificar logs de erro
tail -f /var/log/app.log

# Ou no painel da plataforma
# Vercel: Dashboard > Logs
# Railway: Dashboard > Deployments > Logs
```

### **Métricas Importantes:**

- Taxa de sucesso de envio de email
- Taxa de conclusão de reset
- Erros de SMTP
- Tokens expirados
- Tentativas de reset

---

## 🐛 TROUBLESHOOTING

### **Problema 1: Email não chega**

**Causas:**
- SMTP não configurado
- Credenciais inválidas
- Email na caixa de spam

**Solução:**
```bash
# Testar configuração SMTP
node test-email-config.js

# Verificar variáveis de ambiente
echo $SMTP_HOST
echo $SMTP_USER
```

---

### **Problema 2: Erro "passwordReset not found"**

**Causa:** Migration não foi aplicada

**Solução:**
```bash
# Aplicar migration manualmente
npx dotenv -e .env.production -- prisma migrate deploy
```

---

### **Problema 3: Token sempre inválido**

**Causas:**
- NEXTAUTH_URL incorreto
- Diferença de timezone

**Solução:**
```env
# Verificar NEXTAUTH_URL
NEXTAUTH_URL=https://seu-dominio.com  # SEM barra no final
```

---

## 🔄 ROLLBACK (Se necessário)

### **Se algo der errado:**

1. **Reverter código:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Restaurar banco:**
   ```bash
   # Restaurar backup
   psql -h host -U user -d banco < backup_pre_password_reset.sql
   ```

3. **Remover tabela (última opção):**
   ```sql
   DROP TABLE IF EXISTS password_resets;
   ```

---

## 📝 CHECKLIST FINAL

### **Antes do Deploy:**
- [ ] Backup do banco feito
- [ ] Testado em local
- [ ] SMTP configurado
- [ ] Variáveis de ambiente verificadas
- [ ] Código commitado

### **Durante o Deploy:**
- [ ] Migration aplicada com sucesso
- [ ] Build sem erros
- [ ] Deploy concluído

### **Após o Deploy:**
- [ ] Página de login acessível
- [ ] Link "Esqueci minha senha" visível
- [ ] Email de reset recebido
- [ ] Reset de senha funciona
- [ ] Login com nova senha funciona
- [ ] Logs sem erros críticos

---

## 🎯 COMANDOS RÁPIDOS

### **Deploy Completo (Sequencial):**

```bash
# 1. Commit
git add .
git commit -m "feat: esqueci minha senha"
git push origin main

# 2. Migration em produção
.\migrate-production.bat

# 3. Verificar deploy
# (Automático no Vercel/Netlify)
```

---

## 📞 SUPORTE

### **Se precisar de ajuda:**

1. **Verificar documentação:**
   - `FUNCIONALIDADE_ESQUECI_SENHA.md`
   - `CORRECAO_ERRO_ESQUECI_SENHA.md`

2. **Logs de erro:**
   - Console do navegador
   - Logs do servidor
   - Logs do banco de dados

3. **Testar localmente primeiro:**
   ```bash
   npm run dev
   ```

---

## ✅ CONCLUSÃO

**Após seguir todos os passos:**

1. ✅ Backup realizado
2. ✅ Migration aplicada
3. ✅ Deploy concluído
4. ✅ Testes realizados
5. ✅ Funcionalidade em produção

**🎉 Funcionalidade "Esqueci Minha Senha" está LIVE!**

---

**📖 Documentação criada em:** 09/10/2025  
**🚀 Pronto para deploy em produção!**
