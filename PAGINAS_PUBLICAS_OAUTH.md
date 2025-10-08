# Páginas Públicas para Google OAuth - SimplifiqueIA

**Data:** 08/10/2025  
**Status:** ✅ Implementado e Pronto para Configuração OAuth

---

## 📋 Estrutura Implementada

### **Arquitetura de Rotas Públicas:**

```
src/app/
  ├── (public)/                    # Grupo de rotas públicas
  │   ├── layout.tsx              # Layout simples com header/footer
  │   ├── privacy/
  │   │   └── page.tsx            # Política de Privacidade
  │   └── terms/
  │       └── page.tsx            # Termos de Serviço
```

### **Por que usar grupo (public)?**

O grupo `(public)` no Next.js 13+ App Router:

- ✅ **Não afeta a URL** - Rotas ficam `/privacy` e `/terms` (sem `/public/`)
- ✅ **Layout isolado** - Não herda layout autenticado da aplicação
- ✅ **Organização clara** - Separa páginas públicas das protegidas
- ✅ **Sem middleware** - Não passa pelo NextAuth middleware

---

## 🎨 Design Implementado

### **Layout Público (layout.tsx):**

**Header:**

- Logo SimplifiqueIA com ícone Brain
- Links: Privacidade, Termos, Login
- Background glassmorphism
- Responsivo mobile/desktop

**Footer:**

- Copyright dinâmico (ano atual)
- Links rápidos: Privacidade, Termos, Contato
- Email de contato

**Estilo:**

- Gradiente azul-roxo (consistente com design system)
- Glassmorphism (backdrop-blur)
- Responsivo e acessível

---

## 📄 Páginas Criadas

### **1. Política de Privacidade (/privacy)**

**Conteúdo Completo:**

- ✅ **10 seções detalhadas** conforme LGPD
- ✅ **Ícones visuais** para cada seção
- ✅ **Linguagem clara** para usuários não-técnicos
- ✅ **Metadata SEO** otimizada

**Seções Incluídas:**

1. Introdução
2. Informações que Coletamos (cadastro, uso, OAuth)
3. Como Usamos Suas Informações
4. Compartilhamento de Informações
5. Segurança dos Dados
6. Seus Direitos (LGPD)
7. Retenção de Dados
8. Cookies e Tecnologias Similares
9. Alterações nesta Política
10. Contato (DPO)

**Conformidade LGPD:**

- ✅ Direito de acesso, correção, exclusão
- ✅ Portabilidade de dados
- ✅ Revogação de consentimento
- ✅ Contato do DPO (Data Protection Officer)

### **2. Termos de Serviço (/terms)**

**Conteúdo Completo:**

- ✅ **14 seções detalhadas**
- ✅ **Cláusulas jurídicas** profissionais
- ✅ **Linguagem acessível** mas juridicamente válida
- ✅ **Metadata SEO** otimizada

**Seções Incluídas:**

1. Aceitação dos Termos
2. Descrição do Serviço
3. Cadastro e Conta
4. Uso Aceitável
5. Conteúdo do Usuário
6. Planos e Pagamentos
7. Propriedade Intelectual
8. Limitações de Responsabilidade
9. Indenização
10. Suspensão e Rescisão
11. Alterações nos Termos
12. Lei Aplicável e Jurisdição
13. Disposições Gerais
14. Contato

---

## 🔗 URLs Públicas Geradas

### **Para Configuração do Google OAuth:**

```
Política de Privacidade:
https://seu-dominio.com/privacy

Termos de Serviço:
https://seu-dominio.com/terms
```

### **Em Desenvolvimento (localhost):**

```
http://localhost:3001/privacy
http://localhost:3001/terms
```

---

## 🚀 Como Configurar Google OAuth

### **1. Acesse Google Cloud Console:**

```
https://console.cloud.google.com/
```

### **2. Crie/Selecione Projeto:**

- Nome: SimplifiqueIA
- ID do Projeto: simplifiquia-oauth

### **3. Ative Google+ API:**

- APIs & Services → Library
- Buscar "Google+ API"
- Clicar "Enable"

### **4. Configure Tela de Consentimento OAuth:**

**Informações Básicas:**

- Nome do app: SimplifiqueIA
- Email de suporte: contato@simplifiquia.com.br
- Logo do app: (upload do logo)

**Domínios Autorizados:**

```
localhost (para dev)
seu-dominio.com (para produção)
```

**Links Obrigatórios:**

```
Página inicial: https://seu-dominio.com
Política de Privacidade: https://seu-dominio.com/privacy
Termos de Serviço: https://seu-dominio.com/terms
```

**Escopos Solicitados:**

```
- email
- profile
- openid
```

### **5. Crie Credenciais OAuth 2.0:**

**Tipo:** Web Application

**Origens JavaScript Autorizadas:**

```
http://localhost:3001 (dev)
https://seu-dominio.com (prod)
```

**URIs de Redirecionamento Autorizados:**

```
http://localhost:3001/api/auth/callback/google (dev)
https://seu-dominio.com/api/auth/callback/google (prod)
```

### **6. Copie Credenciais para .env.local:**

```bash
# Google OAuth
GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
```

---

## ✅ Checklist de Configuração OAuth

- [ ] Páginas públicas criadas (/privacy, /terms)
- [ ] Projeto criado no Google Cloud Console
- [ ] Google+ API ativada
- [ ] Tela de consentimento configurada
- [ ] Links de privacidade/termos adicionados
- [ ] Credenciais OAuth 2.0 criadas
- [ ] Domínios autorizados configurados
- [ ] URIs de redirecionamento configurados
- [ ] Variáveis de ambiente adicionadas (.env.local)
- [ ] NextAuth configurado com Google provider
- [ ] Testado login com Google

---

## 🧪 Como Testar

### **1. Testar Páginas Públicas:**

```bash
# Iniciar servidor
npm run dev

# Acessar no navegador:
http://localhost:3001/privacy
http://localhost:3001/terms
```

**Validar:**

- ✅ Páginas carregam sem autenticação
- ✅ Header e footer aparecem
- ✅ Conteúdo está formatado corretamente
- ✅ Links de navegação funcionam

### **2. Testar OAuth (após configuração):**

```bash
# Acessar página de login
http://localhost:3001/auth/signin

# Clicar em "Continuar com Google"
# Deve abrir popup do Google
# Após autorizar, deve redirecionar para app
```

**Validar:**

- ✅ Popup do Google abre
- ✅ Tela de consentimento mostra links corretos
- ✅ Após autorizar, usuário é criado no banco
- ✅ Redirecionamento para página inicial funciona

---

## 📝 Customizações Necessárias

### **Antes de Deploy em Produção:**

1. **Atualizar Emails de Contato:**

```typescript
// Em privacy/page.tsx e terms/page.tsx
suporte@simplifiqueia.com.br  // Trocar para email real
dpo@simplifiquia.com.br          // Trocar para email real
contato@simplifiquia.com.br      // Trocar para email real
```

2. **Atualizar Jurisdição (Termos):**

```typescript
// Em terms/page.tsx, seção 12
"comarca de [SUA CIDADE]"; // Trocar para sua cidade
```

3. **Adicionar Endereço Físico (se necessário):**

```typescript
// Adicionar em ambas as páginas se exigido por lei
"Endereço: Rua X, Nº Y, Cidade - Estado, CEP";
```

4. **Revisar com Advogado:**

- ⚠️ **Importante:** Estes textos são templates
- ⚠️ Recomendamos revisão jurídica antes de produção
- ⚠️ Especialmente seções de responsabilidade e jurisdição

---

## 🔒 Conformidade Legal

### **LGPD (Lei Geral de Proteção de Dados):**

- ✅ Política de Privacidade completa
- ✅ Direitos do titular claramente descritos
- ✅ Base legal para processamento
- ✅ Contato do DPO disponível
- ✅ Retenção de dados especificada

### **Código de Defesa do Consumidor:**

- ✅ Termos claros e acessíveis
- ✅ Direito de cancelamento especificado
- ✅ Política de reembolso transparente
- ✅ Limitações de responsabilidade

### **Marco Civil da Internet:**

- ✅ Privacidade e proteção de dados
- ✅ Guarda de logs conforme lei
- ✅ Remoção de conteúdo ilícito

---

## 🎨 Personalização Visual

### **Se Quiser Usar HTML Customizado:**

As páginas atuais usam React/TypeScript. Se você tem HTML pronto:

**Opção 1 - Converter HTML para JSX:**

```bash
# Use ferramenta online:
https://transform.tools/html-to-jsx
```

**Opção 2 - Usar dangerouslySetInnerHTML:**

```typescript
<div dangerouslySetInnerHTML={{ __html: seuHtmlAqui }} />
```

**Opção 3 - Criar Componente Separado:**

```typescript
// src/components/legal/privacy-content.tsx
export function PrivacyContent() {
  return <div>{/* Seu HTML aqui */}</div>;
}
```

---

## 📊 Métricas e Analytics

### **Recomendações:**

1. **Google Analytics:**

```typescript
// Adicionar tracking de visualizações
pageview("/privacy");
pageview("/terms");
```

2. **Hotjar/Microsoft Clarity:**

- Ver onde usuários clicam
- Identificar seções mais lidas
- Otimizar conteúdo

3. **Métricas Importantes:**

- % de usuários que leem antes de aceitar
- Tempo médio na página
- Taxa de rejeição
- Seções mais acessadas

---

## 🚀 Próximos Passos

### **Imediato:**

1. ✅ Testar páginas localmente
2. ✅ Configurar Google OAuth Console
3. ✅ Adicionar credenciais ao .env.local
4. ✅ Testar login com Google

### **Antes de Produção:**

1. Revisar textos com advogado
2. Atualizar emails de contato
3. Adicionar endereço físico (se necessário)
4. Configurar domínio de produção no Google OAuth
5. Testar em staging

### **Pós-Deploy:**

1. Monitorar analytics das páginas
2. Coletar feedback de usuários
3. Atualizar conforme mudanças na lei
4. Revisar anualmente

---

## 📞 Suporte

Se precisar de ajuda:

1. **Problemas Técnicos:**

   - Verificar console do navegador (F12)
   - Verificar logs do servidor
   - Verificar configuração OAuth

2. **Problemas de Conteúdo:**

   - Revisar textos com equipe jurídica
   - Adaptar para seu modelo de negócio específico
   - Adicionar/remover seções conforme necessário

3. **Problemas OAuth:**
   - Verificar URIs de redirecionamento
   - Verificar domínios autorizados
   - Verificar credenciais no .env.local

---

**Implementado por:** Cascade AI  
**Status:** ✅ Pronto para Configuração OAuth  
**Próximo Passo:** Configurar Google Cloud Console
