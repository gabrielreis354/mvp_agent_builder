# 💻 Guia de Desenvolvimento

Como desenvolver, testar e fazer deploy.

---

## 🔄 Fluxo de Trabalho

### **1. Desenvolvimento Local:**

```bash
# Iniciar banco
docker-compose up -d postgres

# Rodar app
npm run dev

# Abrir Prisma Studio (em outro terminal)
npm run db:studio
```

### **2. Criar Nova Feature:**

```bash
# Criar branch
git checkout -b feature/nome-da-feature

# Desenvolver...
# Testar...

# Commit
git add .
git commit -m "feat: descrição da feature"

# Push
git push origin feature/nome-da-feature
```

### **3. Deploy:**

```bash
# Merge para main
git checkout main
git merge feature/nome-da-feature
git push origin main

# Vercel faz deploy automaticamente!
```

---

## 🗄️ Trabalhando com Banco de Dados

### **Criar Migration:**

```bash
# 1. Editar schema.prisma
# 2. Criar migration
npm run db:migrate
# Nome: add_new_field

# 3. Testar localmente
npm run dev

# 4. Commit (inclui migration)
git add prisma/migrations/
git commit -m "feat: adiciona novo campo"
```

### **Comandos do Prisma:**

```bash
npm run db:studio      # Abrir Prisma Studio
npm run db:migrate     # Criar/aplicar migrations
npm run db:push        # Push schema (sem migration)
npm run db:generate    # Gerar Prisma Client
npm run db:reset       # Resetar banco (CUIDADO!)
```

---

## 🧪 Testes

### **Rodar Testes:**

```bash
# Todos os testes
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Específico
npm test -- system-validation
```

### **Type Check:**

```bash
npm run type-check
```

---

## 🏗️ Build

### **Build Local:**

```bash
# Com limpeza de cache
npm run build:clean

# Build normal
npm run build:local
```

### **Build Produção (Vercel):**

Automático ao fazer `git push`!

---

## 📁 Estrutura do Projeto

```
mvp-agent-builder/
├── src/
│   ├── app/              # Páginas Next.js
│   ├── components/       # Componentes React
│   ├── lib/              # Bibliotecas e utils
│   │   ├── errors/       # Sistema de erros
│   │   ├── runtime/      # Engine de execução
│   │   └── ai-providers/ # Provedores de IA
│   └── types/            # TypeScript types
├── prisma/
│   ├── schema.prisma     # Schema do banco
│   └── migrations/       # Migrations
├── docs/                 # Documentação
└── tests/                # Testes
```

---

## 🎨 Padrões de Código

### **Componentes React:**

```typescript
'use client'

import { useState } from 'react'

export function MeuComponente() {
  const [state, setState] = useState()
  
  return <div>...</div>
}
```

### **APIs:**

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Lógica
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
```

### **Tratamento de Erros:**

```typescript
import { ErrorHandler, ValidationError } from '@/lib/errors/error-handler'

try {
  // Código
} catch (error) {
  const appError = ErrorHandler.handle(error)
  // Usar appError.userMessage para mostrar ao usuário
}
```

---

## 🔑 Variáveis de Ambiente

### **Local (.env.local):**

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
OPENAI_API_KEY="sk-..."
```

### **Produção (Vercel Dashboard):**

Configurar no dashboard do Vercel.

**NUNCA** commitar `.env.local`!

---

## 📝 Convenções

### **Commits:**

```bash
feat: nova funcionalidade
fix: correção de bug
docs: documentação
refactor: refatoração
test: testes
chore: tarefas gerais
```

### **Branches:**

```bash
feature/nome-da-feature
fix/nome-do-bug
refactor/nome-da-refatoracao
```

---

## ✅ Checklist antes do Deploy

- [ ] Testes passando
- [ ] Type-check sem erros
- [ ] Build local funciona
- [ ] Migrations testadas
- [ ] Variáveis configuradas no Vercel
- [ ] README atualizado (se necessário)
