# 🎨 Guia de Rebranding Frontend - SimplifiqueIA RH

**Data:** 06/10/2025  
**Objetivo:** Atualizar frontend de AutomateAI para SimplifiqueIA RH  
**Escopo:** Apenas mudanças visuais e de texto, sem alteração de código backend

---

## ✅ Checklist de Implementação

### **FASE 1: Configuração Central (5 min)**

- [x] Criar `src/config/branding.ts` com todas as constantes
- [ ] Importar em `src/app/layout.tsx` para metadados globais

### **FASE 2: Metadados e SEO (10 min)**

**Arquivo: `src/app/layout.tsx`**

```typescript
import { BRANDING } from '@/config/branding'

export const metadata: Metadata = {
  title: BRANDING.seo.title,
  description: BRANDING.seo.description,
  keywords: BRANDING.seo.keywords,
  openGraph: {
    title: BRANDING.seo.title,
    description: BRANDING.seo.description,
    url: BRANDING.urls.website,
    siteName: BRANDING.platform.fullName,
    images: [{ url: BRANDING.seo.ogImage }],
  },
}
```

**Checklist:**

- [ ] Atualizar `layout.tsx` com novos metadados
- [ ] Verificar `favicon.ico` (pode manter temporariamente)
- [ ] Atualizar `manifest.json` se existir

---

### **FASE 3: Landing Page (15 min)**

**Arquivo: `src/app/page.tsx` (ou componente da home)**

**Mudanças principais:**

```typescript
import { BRANDING } from '@/config/branding'

// Hero Section
<h1>
  {BRANDING.platform.fullName}
  <span>{BRANDING.platform.tagline}</span>
</h1>

// Descrição
<p>{BRANDING.features.tagline1}</p>
<p>{BRANDING.features.tagline2}</p>

// CTA
<Button>Começar com SimplifiqueIA RH</Button>
```

**Checklist:**

- [ ] Título principal
- [ ] Subtítulo/tagline
- [ ] Descrição de benefícios
- [ ] Textos de CTAs
- [ ] Seção "Como funciona"
- [ ] Depoimentos (se houver)
- [ ] Footer

---

### **FASE 4: Autenticação (10 min)**

**Arquivo: `src/app/auth/signin/page.tsx`**

```typescript
import { BRANDING } from '@/config/branding'

<h1>{BRANDING.messages.loginTitle}</h1>
<p>Entre no {BRANDING.platform.fullName} para automatizar seu RH</p>
```

**Arquivo: `src/app/auth/signup/page.tsx`**

```typescript
<h1>{BRANDING.messages.signupTitle}</h1>
<p>Crie sua conta e simplifique seu RH com IA</p>
```

**Checklist:**

- [ ] Título da página de login
- [ ] Título da página de cadastro
- [ ] Textos de boas-vindas
- [ ] Links de rodapé
- [ ] Mensagens de erro/sucesso

---

### **FASE 5: Header/Navbar (5 min)**

**Arquivo: `src/components/layout/header.tsx` (ou similar)**

```typescript
import { BRANDING } from '@/config/branding'

<Logo>
  <span>{BRANDING.platform.name}</span>
  <span className="text-sm">{BRANDING.product.vertical}</span>
</Logo>
```

**Checklist:**

- [ ] Logo/Nome no header
- [ ] Menu de navegação
- [ ] Botões de ação
- [ ] Dropdown de usuário

---

### **FASE 6: Builder de Agentes (10 min)**

**Arquivo: `src/app/builder/page.tsx`**

```typescript
import { BRANDING } from '@/config/branding'

<title>{BRANDING.messages.builderTitle}</title>
<h1>Construtor de Agentes - {BRANDING.platform.name}</h1>
```

**Checklist:**

- [ ] Título da página
- [ ] Textos de ajuda/tooltips
- [ ] Mensagens de validação
- [ ] Botões de ação

---

### **FASE 7: Dashboard/Perfil (10 min)**

**Arquivo: `src/app/profile/page.tsx` ou `src/app/dashboard/page.tsx`**

```typescript
import { BRANDING } from '@/config/branding'

<h1>Bem-vindo ao {BRANDING.platform.fullName}</h1>
<p>Simplifique seu RH com automação inteligente</p>
```

**Checklist:**

- [ ] Mensagem de boas-vindas
- [ ] Cards de estatísticas
- [ ] Seções de conteúdo
- [ ] Botões de ação

---

### **FASE 8: Emails Transacionais (15 min)**

**Arquivos em `src/emails/` ou templates de email**

**Template de Boas-vindas:**

```html
<h1>Bem-vindo ao SimplifiqueIA RH!</h1>
<p>Obrigado por se juntar à plataforma que simplifica a gestão de RH com inteligência artificial.</p>
```

**Checklist:**

- [ ] Email de boas-vindas
- [ ] Email de reset de senha
- [ ] Email de notificações
- [ ] Assinatura de emails

---

### **FASE 9: Mensagens de Sistema (10 min)**

**Arquivo: `src/lib/messages.ts` (criar se não existir)**

```typescript
export const SYSTEM_MESSAGES = {
  errors: {
    generic: 'Ops! Algo deu errado no SimplifiqueIA RH.',
    auth: 'Erro de autenticação. Por favor, faça login novamente.',
    // ... outras mensagens
  },
  success: {
    agentCreated: 'Agente criado com sucesso no SimplifiqueIA RH!',
    // ... outras mensagens
  },
}
```

**Checklist:**

- [ ] Mensagens de erro
- [ ] Mensagens de sucesso
- [ ] Toasts/Notificações
- [ ] Validações de formulário

---

### **FASE 10: Footer (5 min)**

**Arquivo: `src/components/layout/footer.tsx`**

```typescript
import { BRANDING } from '@/config/branding'

<footer>
  <p>© 2025 {BRANDING.company.name}. Todos os direitos reservados.</p>
  <a href={BRANDING.urls.docs}>Documentação</a>
  <a href={BRANDING.urls.support}>Suporte</a>
</footer>
```

**Checklist:**

- [ ] Copyright
- [ ] Links úteis
- [ ] Redes sociais
- [ ] Informações de contato

---

## 🔍 Busca e Substituição Global

### **Substituições Simples (usar Find & Replace no VSCode):**

```bash
# Buscar e substituir em todos os arquivos .tsx, .ts, .jsx, .js

AutomateAI → SimplifiqueIA RH
automateai → simplifiqueia
AutomateAI MVP → SimplifiqueIA RH
Automate AI → Simplifique IA

# Domínios
automationia.com.br → simplifiqueia.com.br
localhost:3001 → localhost:3001 (manter para dev)
```

### **Comando VSCode:**

1. Pressione `Ctrl+Shift+H` (Find & Replace em múltiplos arquivos)
2. Em "Files to include": `src/**/*.{ts,tsx,js,jsx}`
3. Substituir um por vez, revisando cada ocorrência

---

## 📝 Arquivos de Configuração

### **package.json**

```json
{
  "name": "simplifiqueia-rh",
  "version": "1.0.0",
  "description": "SimplifiqueIA RH - Automação Inteligente para Recursos Humanos",
  "author": "SimplifiqueIA",
  "homepage": "https://simplifiqueia.com.br"
}
```

### **.env.example**

```bash
# SimplifiqueIA RH - Configurações

NEXT_PUBLIC_APP_NAME="SimplifiqueIA RH"
NEXT_PUBLIC_APP_URL="https://simplifiqueia.com.br"
NEXT_PUBLIC_SUPPORT_EMAIL="suporte@simplifiqueia.com.br"
```

### **README.md**

```markdown
# SimplifiqueIA RH

Plataforma de automação inteligente para Recursos Humanos.

## O Canva da Automação para RH

Automatize processos de RH com IA: análise de currículos, contratos, 
folha de pagamento e muito mais. Interface visual simples, sem código.
```

---

## ✅ Validação Final

### **Checklist de Teste:**

- [ ] Abrir `http://localhost:3001` e verificar landing page
- [ ] Verificar título da aba do navegador
- [ ] Testar fluxo de cadastro completo
- [ ] Testar fluxo de login
- [ ] Criar um agente no builder
- [ ] Verificar emails recebidos
- [ ] Testar em mobile (responsivo)
- [ ] Verificar console do navegador (sem erros)

### **Páginas para Revisar:**

1. `/` - Landing page
2. `/auth/signin` - Login
3. `/auth/signup` - Cadastro
4. `/builder` - Construtor
5. `/profile` - Perfil
6. `/agents` - Lista de agentes
7. Qualquer outra página pública

---

## 🚀 Deploy

### **Antes do Deploy:**

1. [ ] Commit todas as mudanças
2. [ ] Testar build: `npm run build`
3. [ ] Verificar se não há erros de TypeScript
4. [ ] Testar produção local: `npm run start`

### **Configurar Domínio:**

1. [ ] Apontar `simplifiqueia.com.br` para servidor
2. [ ] Configurar SSL/HTTPS
3. [ ] Atualizar variáveis de ambiente em produção
4. [ ] Configurar redirect de `automationia.com.br` → `simplifiqueia.com.br`

---

## ⏱️ Tempo Estimado Total

| Fase | Tempo | Prioridade |
|------|-------|------------|
| Configuração Central | 5 min | Alta |
| Metadados e SEO | 10 min | Alta |
| Landing Page | 15 min | Alta |
| Autenticação | 10 min | Alta |
| Header/Navbar | 5 min | Alta |
| Builder | 10 min | Média |
| Dashboard/Perfil | 10 min | Média |
| Emails | 15 min | Média |
| Mensagens | 10 min | Baixa |
| Footer | 5 min | Baixa |
| **TOTAL** | **1h 35min** | - |

---

## 📌 Notas Importantes

1. **Não mexer em:**
   - Lógica de backend
   - APIs
   - Banco de dados
   - Estrutura de pastas

2. **Focar em:**
   - Textos visíveis ao usuário
   - Metadados SEO
   - Mensagens de interface
   - Emails transacionais

3. **Testar sempre:**
   - Após cada fase
   - Em diferentes navegadores
   - Em mobile

---

## 🆘 Problemas Comuns

### **Erro: Cannot find module '@/config/branding'**

**Solução:** Verificar se o arquivo foi criado em `src/config/branding.ts`

### **Textos não atualizando**

**Solução:** Limpar cache do Next.js

```bash
rm -rf .next
npm run dev
```

### **Build falhando**

**Solução:** Verificar imports e tipos TypeScript

```bash
npm run type-check
```

---

**Pronto para começar!** 🚀

Siga as fases em ordem e marque os checkboxes conforme completa.
