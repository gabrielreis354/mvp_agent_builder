# 🚀 COMECE AQUI - Rebranding SimplifiqueIA RH

**Tempo Total:** 30 minutos  
**Segurança:** Branch isolada, código principal intocado

---

## ⚡ Início Rápido (3 comandos)

```bash
# 1. Criar branch de rebranding (seguro!)
scripts\setup-rebranding-branch.bat

# 2. Executar rebranding automático
node scripts/rebranding.js

# 3. Testar
npm run dev
```

**Pronto!** Abra <http://localhost:3001> e veja as mudanças.

---

## 📋 Passo a Passo Completo

### **1. Criar Branch (5 min)**

```bash
cd c:\G-STUFF\projects\automate_ai\AutomateAI\mvp-agent-builder
scripts\setup-rebranding-branch.bat
```

Ou manualmente:

```bash
git checkout -b rebranding
```

---

### **2. Executar Rebranding (10 min)**

```bash
node scripts/rebranding.js
```

Isso vai atualizar automaticamente:

- ✅ Nome: AutomateAI → SimplifiqueIA RH
- ✅ Domínio: automationia.com.br → simplifiqueia.com.br
- ✅ Tagline: "O Canva da Automação para RH"
- ✅ Todos os textos de interface

---

### **3. Revisar Mudanças (5 min)**

```bash
git diff
```

---

### **4. Ajustes Manuais (10 min)**

Personalizar textos específicos:

- Landing page (`src/app/page.tsx`)
- Emails (`src/emails/`)
- Mensagens de erro

---

### **5. Testar (5 min)**

```bash
rm -rf .next
npm run dev
```

Abrir: <http://localhost:3001>

Verificar:

- [ ] Landing page
- [ ] Login/Cadastro
- [ ] Builder
- [ ] Perfil

---

### **6. Commit (2 min)**

```bash
git add .
git commit -m "Rebranding para SimplifiqueIA RH"
```

---

## 🔄 Alternar Entre Versões

```bash
# Ver versão antiga (AutomateAI)
git checkout main

# Ver versão nova (SimplifiqueIA RH)
git checkout rebranding
```

---

## ✅ Quando Estiver Pronto para Produção

```bash
# Fazer merge para main
git checkout main
git merge rebranding

# Build de produção
npm run build

# Push (se houver repositório remoto)
git push origin main
```

---

## 📚 Documentação Completa

- **Passo a passo detalhado:** `docs/REBRANDING_PASSO_A_PASSO.md`
- **Guia técnico:** `docs/REBRANDING_FRONTEND.md`
- **Resumo executivo:** `docs/REBRANDING_RESUMO.md`

---

## 🆘 Problemas?

### **Erro: Port 3001 in use**

```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### **Erro: Build failed**

```bash
rm -rf .next
npm install
npm run build
```

### **Voltar atrás**

```bash
git checkout main
git branch -D rebranding
```

---

**Pronto para começar!** Execute: `scripts\setup-rebranding-branch.bat`
