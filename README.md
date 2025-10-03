# 🤖 AutomateAI - Plataforma de Automação Colaborativa

O AutomateAI é uma plataforma de automação de processos que permite a criação, execução e compartilhamento de agentes de IA em um ambiente colaborativo. Projetado para equipes, ele transforma a maneira como as empresas automatizam tarefas, promovendo a reutilização de inteligência e a governança centralizada.

## ✨ Funcionalidades Principais

- 🏢 **Sistema de Organizações**: Crie e gerencie espaços de trabalho para sua equipe.
- 🤝 **Colaboração em Tempo Real**: Compartilhe agentes com membros da organização e veja o trabalho de todos em um só lugar.
- 👑 **Controle de Acesso por Papel (RBAC)**: Defina papéis de `ADMIN` e `USER` para gerenciar permissões.
- 🎨 **Editor Visual de Agentes**: Interface drag-and-drop para construir fluxos de automação complexos sem código.
- 🔐 **Autenticação Segura**: Login com email/senha e provedores OAuth (Google, GitHub) via NextAuth.js.
- 🧠 **Suporte a Múltiplas IAs**: Integre com OpenAI, Anthropic, Google AI e mais.
- 📄 **Processamento de Documentos**: Extraia informações de PDFs, DOCs, e planilhas.

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS & shadcn/ui
- **Backend & API**: Next.js API Routes
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Autenticação**: NextAuth.js

## 🚀 Começando

**1. Pré-requisitos:**
- Node.js (v18+)
- npm / yarn
- PostgreSQL

**2. Instalação:**
```bash
git clone https://github.com/seu-usuario/automate-ai.git
cd automate-ai/mvp-agent-builder
npm install
```

**3. Configuração do Ambiente:**
```bash
cp .env.example .env.local
```

Preencha as variáveis no `.env.local` com suas chaves (banco de dados, NextAuth, provedores OAuth, etc.).

**4. Migração do Banco de Dados:**
```bash
npx prisma generate
npx prisma db push
```

**5. Rodando o Projeto:**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📂 Estrutura do Projeto

- `src/app/(app)/`: Contém as páginas protegidas por autenticação que compartilham o layout principal com header (`/agents`, `/profile`, etc.).
- `src/app/api/`: Endpoints da API, organizados por funcionalidade.
- `src/components/`: Componentes React reutilizáveis.
- `src/lib/`: Funções utilitárias, configuração de autenticação e instâncias de clientes (Prisma).
- `prisma/`: Schema do banco de dados e migrações.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um Pull Request.

1. Fork o repositório.
2. Crie uma nova branch (`git checkout -b feature/minha-feature`).
3. Faça suas alterações e commit (`git commit -m 'feat: Adiciona minha feature'`).
4. Envie para a sua branch (`git push origin feature/minha-feature`).
5. Abra um Pull Request.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
