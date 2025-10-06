# 🚀 Rebranding SimplifiqueIA RH - Passo a Passo Seguro

**Data:** 06/10/2025  
**Estratégia:** Opção 3 (Híbrida) - 30 minutos  
**Segurança:** Branch isolada para não afetar código atual

---

## 📋 PASSO 1: Criar Branch de Rebranding (5 min)

### **1.1 Verificar Status Atual**

```bash
# Navegar para o diretório do projeto
cd c:\G-STUFF\projects\automate_ai\AutomateAI\mvp-agent-builder

# Verificar branch atual e status
git status
git branch
```

**Resultado esperado:**

```
On branch main (ou master)
nothing to commit, working tree clean
```

---

### **1.2 Fazer Commit de Mudanças Pendentes (se houver)**

```bash
# Se houver mudanças não commitadas
git add .
git commit -m "Checkpoint antes do rebranding"
```

---

### **1.3 Criar e Mudar para Branch Rebranding**

```bash
# Criar nova branch a partir da atual
git checkout -b rebranding

# Verificar que está na branch correta
git branch
```

**Resultado esperado:**

```
  main
* rebranding  ← Asterisco indica branch ativa
```

---

## 📋 PASSO 2: Executar Rebranding Automático (10 min)

### **2.1 Executar Script de Rebranding**

```bash
# Ainda no diretório mvp-agent-builder
node scripts/rebranding.js
```

**Saída esperada:**

```
🎨 Iniciando Rebranding: AutomateAI → SimplifiqueIA RH

📁 Processando: src/app
   X arquivo(s) atualizado(s)

📁 Processando: src/components
   Y arquivo(s) atualizado(s)

📁 Processando: src/lib
   Z arquivo(s) atualizado(s)

📄 Processando arquivos raiz:
✅ Atualizado: package.json
✅ Atualizado: README.md
✅ Atualizado: .env.example

✨ Rebranding concluído!
📊 Total: N arquivo(s) atualizado(s)

⚠️  IMPORTANTE: Revise as mudanças antes de fazer commit!

📝 Próximos passos:
   1. Revisar mudanças: git diff
   2. Testar aplicação: npm run dev
   3. Verificar build: npm run build
   4. Commit: git add . && git commit -m "Rebranding para SimplifiqueIA RH"
```

---

### **2.2 Revisar Mudanças**

```bash
# Ver resumo das mudanças
git status

# Ver detalhes das mudanças
git diff

# Ver mudanças em arquivo específico
git diff src/app/layout.tsx
git diff package.json
```

---

## 📋 PASSO 3: Ajustes Manuais (10 min)

### **3.1 Ajustar Textos Específicos da Landing Page**

**Arquivo:** `src/app/page.tsx`

Revisar e personalizar:

- [ ] Título principal (tom de voz)
- [ ] Descrição de benefícios (específico para RH)
- [ ] Depoimentos (se houver)
- [ ] CTAs (calls to action)

### **3.2 Ajustar Emails Transacionais**

**Arquivos em:** `src/emails/` ou templates de email

Revisar e personalizar:

- [ ] Tom de voz nos emails
- [ ] Assinatura
- [ ] Links de suporte

### **3.3 Ajustar Mensagens de Erro**

**Arquivo:** `src/lib/messages.ts` (se existir)

Revisar e personalizar:

- [ ] Mensagens contextualizadas para RH
- [ ] Sugestões de ação específicas

---

## 📋 PASSO 4: Testar Aplicação (5 min)

### **4.1 Limpar Cache e Iniciar**

```bash
# Limpar cache do Next.js
rm -rf .next

# Instalar dependências (se necessário)
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

**Abrir:** <http://localhost:3001>

---

### **4.2 Checklist de Teste Visual**

Verificar cada página:

**Landing Page (/):**

- [ ] Título: "SimplifiqueIA RH"
- [ ] Tagline: "O Canva da Automação para RH"
- [ ] Botões com textos corretos
- [ ] Footer atualizado

**Login (/auth/signin):**

- [ ] Título da página
- [ ] Textos de ajuda
- [ ] Links

**Cadastro (/auth/signup):**

- [ ] Título da página
- [ ] Formulário
- [ ] Mensagens

**Builder (/builder):**

- [ ] Título da página
- [ ] Tooltips
- [ ] Mensagens de validação

**Perfil (/profile):**

- [ ] Mensagem de boas-vindas
- [ ] Cards
- [ ] Botões

---

### **4.3 Testar Funcionalidades**

- [ ] Criar conta nova
- [ ] Fazer login
- [ ] Criar agente
- [ ] Executar agente
- [ ] Gerar relatório

---

## 📋 PASSO 5: Verificar Build de Produção (5 min)

### **5.1 Testar Build**

```bash
# Parar servidor de dev (Ctrl+C)

# Fazer build de produção
npm run build
```

**Resultado esperado:**

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size
┌ ○ /                                    X kB
├ ○ /auth/signin                         Y kB
└ ○ /builder                             Z kB
```

---

### **5.2 Testar Build Localmente**

```bash
# Iniciar servidor de produção
npm run start
```

**Abrir:** <http://localhost:3001>

**Verificar:**

- [ ] Todas as páginas carregam
- [ ] Sem erros no console
- [ ] Funcionalidades básicas funcionam

---

## 📋 PASSO 6: Commit das Mudanças (2 min)

### **6.1 Adicionar Todas as Mudanças**

```bash
# Parar servidor (Ctrl+C)

# Ver status
git status

# Adicionar todos os arquivos modificados
git add .

# Verificar o que será commitado
git status
```

---

### **6.2 Fazer Commit**

```bash
# Commit com mensagem descritiva
git commit -m "Rebranding para SimplifiqueIA RH

- Atualizado nome do produto de AutomateAI para SimplifiqueIA RH
- Atualizado domínio para simplifiqueia.com.br
- Atualizado tagline para 'O Canva da Automação para RH'
- Atualizado metadados SEO
- Atualizado textos de interface
- Atualizado emails transacionais
- Atualizado package.json e README.md"
```

---

### **6.3 Verificar Commit**

```bash
# Ver último commit
git log -1

# Ver arquivos modificados no commit
git show --name-only
```

---

## 📋 PASSO 7: Merge ou Continuar Trabalhando

### **Opção A: Continuar na Branch Rebranding**

```bash
# Continuar trabalhando na branch rebranding
# Fazer mais ajustes se necessário
# Testar mais funcionalidades
```

**Vantagens:**

- ✅ Código principal intocado
- ✅ Pode testar extensivamente
- ✅ Pode fazer ajustes incrementais

---

### **Opção B: Fazer Merge para Main (quando estiver pronto)**

```bash
# Voltar para branch principal
git checkout main

# Fazer merge da branch rebranding
git merge rebranding

# Verificar que tudo está ok
npm run dev
npm run build

# Push para repositório remoto (se houver)
git push origin main
```

---

### **Opção C: Manter Ambas as Branches**

```bash
# Branch main: Versão AutomateAI (atual)
# Branch rebranding: Versão SimplifiqueIA RH (nova)

# Alternar entre branches conforme necessário
git checkout main        # Versão antiga
git checkout rebranding  # Versão nova
```

---

## 🔄 Comandos Úteis Durante o Processo

### **Ver Diferenças Entre Branches**

```bash
# Ver arquivos diferentes entre main e rebranding
git diff main rebranding --name-only

# Ver diferenças de um arquivo específico
git diff main rebranding src/app/layout.tsx
```

---

### **Desfazer Mudanças (se necessário)**

```bash
# Desfazer mudanças não commitadas
git checkout -- arquivo.tsx

# Voltar para branch main (abandona rebranding)
git checkout main
git branch -D rebranding  # Deleta branch rebranding
```

---

### **Criar Backup da Branch**

```bash
# Criar tag de backup
git tag backup-antes-rebranding

# Listar tags
git tag

# Voltar para tag se necessário
git checkout backup-antes-rebranding
```

---

## ⚠️ Troubleshooting

### **Erro: "Changes not staged for commit"**

```bash
# Adicionar mudanças
git add .
git commit -m "Suas mudanças"
```

---

### **Erro: "Build failed"**

```bash
# Limpar cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

---

### **Erro: "Cannot find module"**

```bash
# Verificar imports
npm run type-check

# Corrigir imports manualmente
# Rodar build novamente
npm run build
```

---

### **Erro: "Port 3001 already in use"**

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Ou usar outra porta
PORT=3002 npm run dev
```

---

## 📊 Checklist Final

### **Antes de Considerar Completo:**

**Código:**

- [ ] Branch rebranding criada
- [ ] Script de rebranding executado
- [ ] Ajustes manuais feitos
- [ ] Commit realizado

**Testes:**

- [ ] npm run dev funciona
- [ ] npm run build funciona
- [ ] Todas as páginas carregam
- [ ] Funcionalidades básicas funcionam
- [ ] Sem erros no console

**Visual:**

- [ ] Título correto em todas as páginas
- [ ] Tagline atualizada
- [ ] Footer atualizado
- [ ] Emails atualizados

**Documentação:**

- [ ] README.md atualizado
- [ ] package.json atualizado
- [ ] .env.example atualizado

---

## 🎉 Conclusão

Após completar todos os passos:

1. **Branch rebranding** contém todas as mudanças
2. **Branch main** permanece intocada
3. Você pode **alternar entre branches** conforme necessário
4. Quando estiver satisfeito, pode fazer **merge para main**

---

## 📞 Suporte

Se encontrar problemas:

1. Verificar seção de Troubleshooting acima
2. Consultar `docs/REBRANDING_FRONTEND.md` para detalhes
3. Verificar logs do console do navegador
4. Verificar logs do terminal

---

**Tempo Total Estimado:** 30-40 minutos  
**Segurança:** ✅ Branch isolada, código principal intocado  
**Reversível:** ✅ Pode voltar para main a qualquer momento

**Pronto para começar!** 🚀
