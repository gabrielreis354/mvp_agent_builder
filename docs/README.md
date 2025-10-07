# 📚 Documentação SimplifiqueIA RH

**Última atualização:** 07/10/2025  
**Versão:** 3.0 (limpa e essencial)

---

## 🎯 Documentação Essencial

Esta documentação foi simplificada para manter apenas o essencial. **4 arquivos** cobrem tudo que você precisa:

### **1. [../README.md](../README.md)** - Apresentação do Produto

**O que é:** Visão geral completa do SimplifiqueIA RH  
**Quando usar:** Primeira vez no projeto, entender o valor do produto  
**Conteúdo:**

- O que é o SimplifiqueIA RH
- Funcionalidades principais
- Início rápido (instalação em 5 minutos)
- Configuração de ambiente
- Templates incluídos
- Stack tecnológica
- Deploy em produção
- Problemas comuns

### **2. [DESENVOLVIMENTO.md](./DESENVOLVIMENTO.md)** - Guia do Desenvolvedor

**O que é:** Como desenvolver, testar e fazer deploy  
**Quando usar:** Desenvolvendo features, contribuindo com código  
**Conteúdo:**

- Ambiente de desenvolvimento
- Estrutura do código
- Padrões e convenções
- Como criar novos agentes
- Testes automatizados
- Build e deploy
- Troubleshooting técnico

### **3. [deployment/GUIA_IMPLANTACAO.md](./deployment/GUIA_IMPLANTACAO.md)** - Deploy em Produção

**O que é:** Guia completo de implantação  
**Quando usar:** Fazendo deploy em produção  
**Conteúdo:**

- Preparação para produção
- Deploy em Vercel, AWS, Azure
- Configuração de domínio
- SSL/HTTPS
- Monitoramento
- Backup e recuperação
- Segurança e compliance

### **4. Este Arquivo (README.md)** - Índice da Documentação

**O que é:** Navegação rápida pela documentação  
**Quando usar:** Para encontrar o que precisa

---

## 🚀 Início Rápido

**Novo no projeto?** Siga esta ordem:

1. **Leia:** [../README.md](../README.md) - Entenda o produto (10 min)
2. **Configure:** Siga a seção "Início Rápido" do README (5 min)
3. **Desenvolva:** [DESENVOLVIMENTO.md](./DESENVOLVIMENTO.md) quando for codificar
4. **Deploy:** [deployment/GUIA_IMPLANTACAO.md](./deployment/GUIA_IMPLANTACAO.md) quando for para produção

---

## 📂 Estrutura Simplificada

```
simplifiqueia-rh/
├── README.md                          ← Apresentação do produto
├── .env.example                       ← Template de configuração
├── docs/
│   ├── README.md                      ← Este arquivo (índice)
│   ├── DESENVOLVIMENTO.md             ← Guia do desenvolvedor
│   └── deployment/
│       └── GUIA_IMPLANTACAO.md        ← Deploy em produção
└── [código fonte...]
```

**Total:** 4 arquivos de documentação (vs 45 anteriores)  
**Redução:** 91% menos arquivos

---

## 🎯 Comandos Rápidos

### **Desenvolvimento:**

```bash
npm run dev                 # Servidor dev (porta 3001)
npm run db:studio           # Prisma Studio (visualizar banco)
npm run type-check          # Verificar tipos TypeScript
```

### **Build e Deploy:**

```bash
npm run build               # Build de produção
npm run build:clean         # Build com limpeza de cache
npm run start               # Servidor de produção
```

### **Banco de Dados:**

```bash
npm run db:generate         # Gerar Prisma Client
npm run db:push             # Aplicar schema ao banco
npm run db:seed             # Popular dados iniciais
npm run db:migrate          # Criar migração
```

### **Testes:**

```bash
npm test                    # Rodar testes
npm run test:coverage       # Cobertura de testes
```

---

## 📖 Informações Adicionais

### **Tecnologias Principais:**

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma, PostgreSQL
- **IA:** OpenAI GPT-4, Anthropic Claude, Google Gemini
- **Autenticação:** NextAuth.js
- **Filas:** Redis + BullMQ

### **Links Úteis:**

- 🌐 **Site:** https://simplifiqueia.com.br
- 📧 **Suporte:** suporte@simplifiqueia.com.br
- 💬 **Discord:** [Comunidade SimplifiqueIA](https://discord.gg/simplifiqueia)
- 🐛 **Issues:** [GitHub Issues](https://github.com/seu-usuario/simplifiqueia-rh/issues)

---

## 🧹 Limpeza Realizada

**Antes (06/10/2025):**

- 45 arquivos .md
- Informação duplicada e desatualizada
- Histórico de rebranding misturado
- Difícil encontrar informação relevante

**Depois (07/10/2025):**

- 4 arquivos .md essenciais
- Informação consolidada e atual
- Apenas documentação relevante
- Fácil navegação e manutenção

**Arquivos removidos:**

- Documentação de rebranding (concluído)
- Histórico de correções e erros
- Guias duplicados
- Documentação obsoleta

---

**Versão da documentação:** 3.0 (limpa e essencial)  
**Última limpeza:** 07/10/2025
