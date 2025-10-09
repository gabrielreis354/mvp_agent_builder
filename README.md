# 🤖 SimplifiqueIA RH

**Automação Inteligente para Recursos Humanos**

Plataforma colaborativa para criar, executar e compartilhar agentes de IA que automatizam processos de RH. Interface visual drag-and-drop, multi-usuário, multi-empresa.

**Versão:** 2.0.0 | **Última Atualização:** 09/10/2025

---

## 🎉 NOVIDADES (v2.0.0 - 09/10/2025)

- ✅ **Email Universal**: Renderização dinâmica de qualquer estrutura JSON
- ✅ **Sistema de Convites Seguro**: Validação completa com auditoria
- ✅ **Compartilhamento de Agentes**: Torne agentes públicos na organização
- ✅ **Fallback de IA**: Anthropic → OpenAI → Google automático
- ✅ **Multi-Tenancy Auditado**: Isolamento total entre organizações (9.5/10)
- ✅ **Documentação Completa**: 12 novos documentos técnicos

📖 **Ver detalhes:** [`RESUMO_FINAL_IMPLEMENTACOES_09_10.md`](RESUMO_FINAL_IMPLEMENTACOES_09_10.md)

---

## 🎯 O Que É

SimplifiqueIA RH transforma processos manuais de RH em fluxos automatizados inteligentes:

- **Análise de Currículos**: Triagem e pontuação automática de candidatos
- **Contratos CLT**: Validação e análise de conformidade legal
- **Gestão de Despesas**: Processamento de vale-transporte, refeição, reembolsos
- **Onboarding**: Checklist personalizado por cargo e departamento
- **Avaliação 360°**: Análise de feedbacks e PDI automático

**Diferencial:** Interface visual "tipo Canva" - sem código, em português, para profissionais de RH.

---

## ✨ Funcionalidades

### **Para Usuários de RH:**

- 🎨 **Editor Visual**: Crie agentes arrastando blocos (sem código)
- 📝 **Linguagem Natural**: Descreva o que precisa em português
- 📄 **Upload de Documentos**: PDFs, DOCs, planilhas processados automaticamente
- 📊 **Relatórios Profissionais**: HTML e PDF prontos para impressão
- 📧 **Envio Automático**: Relatórios por email configuráveis

### **Para Empresas:**

- 🏢 **Multi-Empresa**: Isolamento completo de dados por organização
- 👥 **Multi-Usuário**: Compartilhe agentes com sua equipe
- 🔐 **Controle de Acesso**: Papéis ADMIN e USER
- 📈 **Analytics**: Métricas de uso e economia de tempo
- 🔒 **Compliance LGPD**: Auditoria e segurança empresarial

### **Tecnologia:**

- 🧠 **IA Real**: OpenAI GPT-4, Anthropic Claude, Google Gemini
- ⚡ **Fallback Inteligente**: Sistema resiliente entre provedores
- 🔄 **Filas Assíncronas**: Redis + BullMQ para processamento escalável
- 💾 **Banco Robusto**: PostgreSQL + Prisma com auditoria completa

---

## 🚀 Início Rápido

### **Pré-requisitos:**

```bash
Node.js 18+
PostgreSQL 14+
Redis 6+ (opcional para filas)
```

### **Instalação (5 minutos):**

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/simplifiqueia-rh.git
cd simplifiqueia-rh

# 2. Instale dependências
npm install

# 3. Configure ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves

# 4. Configure banco de dados
npm run db:generate
npm run db:push
npm run db:seed

# 5. Inicie o servidor
npm run dev
```

**Acesse:** http://localhost:3001

---

## ⚙️ Configuração

### **Variáveis Essenciais (.env.local):**

```bash
# Banco de Dados (obrigatório)
DATABASE_URL="postgresql://user:pass@localhost:5432/simplifiqueia_rh"

# Autenticação (obrigatório)
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="gere-uma-chave-secreta-aqui"

# Provedores de IA (pelo menos um)
OPENAI_API_KEY="sk-sua-chave-openai"
ANTHROPIC_API_KEY="sua-chave-anthropic"
GOOGLE_AI_API_KEY="sua-chave-google"

# OAuth (opcional)
GOOGLE_CLIENT_ID="seu-client-id"
GOOGLE_CLIENT_SECRET="seu-client-secret"
GITHUB_CLIENT_ID="seu-client-id"
GITHUB_CLIENT_SECRET="seu-client-secret"

# Redis (opcional - para filas)
REDIS_URL="redis://localhost:6379"

# Email (opcional - para envio de relatórios)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASSWORD="sua-senha-app"
```

### **Comandos Úteis:**

```bash
# Desenvolvimento
npm run dev                 # Servidor dev (porta 3001)
npm run db:studio           # Prisma Studio (visualizar banco)
npm run type-check          # Verificar tipos TypeScript

# Build e Deploy
npm run build               # Build de produção
npm run build:clean         # Build com limpeza de cache
npm run start               # Servidor de produção

# Banco de Dados
npm run db:migrate          # Criar migração
npm run db:push             # Aplicar schema sem migração
npm run db:seed             # Popular dados iniciais
npm run db:reset            # Resetar banco (cuidado!)

# Testes
npm test                    # Rodar testes
npm run test:coverage       # Cobertura de testes
```

---

## 📂 Estrutura do Projeto

```
simplifiqueia-rh/
├── src/
│   ├── app/
│   │   ├── (app)/              # Páginas protegidas (builder, agents, profile)
│   │   ├── api/                # Endpoints da API
│   │   ├── auth/               # Páginas de autenticação
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── agent-builder/      # Editor visual de agentes
│   │   ├── auth/               # Componentes de autenticação
│   │   ├── layout/             # Header, footer, sidebar
│   │   └── ui/                 # Componentes reutilizáveis (shadcn/ui)
│   ├── lib/
│   │   ├── ai-providers/       # Integração OpenAI, Anthropic, Google
│   │   ├── auth/               # Configuração NextAuth
│   │   ├── processors/         # Processadores de PDF, DOCX
│   │   ├── runtime/            # Engine de execução de agentes
│   │   └── database/           # Prisma client e helpers
│   └── types/                  # Tipos TypeScript
├── prisma/
│   ├── schema.prisma           # Schema do banco
│   └── seed.ts                 # Dados iniciais
├── public/                     # Assets estáticos
├── docs/                       # Documentação técnica
└── tests/                      # Testes automatizados
```

---

## 🎨 Templates Incluídos

### **RH & Jurídico:**

1. **Analisador de Contratos RH** - Validação CLT, análise de riscos
2. **Triagem de Currículos** - Pontuação e ranking automático
3. **Onboarding Automático** - Checklist personalizado por cargo
4. **Avaliação de Desempenho** - Análise 360° e PDI
5. **Analisador de Despesas** - Vale-transporte, refeição, reembolsos

### **Suporte & Comunicação:**

6. **Suporte RH Automático** - Classificação e roteamento de dúvidas
7. **Comunicação Interna** - Geração de comunicados e vagas
8. **Gestor de Processos** - Prazos legais e distribuição de tarefas

### **Documentos:**

9. **Processador de Documentos** - OCR para RG, CPF, carteira de trabalho
10. **Gerador de Relatórios** - Relatórios HTML/PDF profissionais

---

## 🛠️ Stack Tecnológica

| Camada             | Tecnologia                                    |
| ------------------ | --------------------------------------------- |
| **Frontend**       | Next.js 14, React 18, TypeScript              |
| **Estilização**    | Tailwind CSS, shadcn/ui, Framer Motion        |
| **Backend**        | Next.js API Routes, Node.js                   |
| **Banco de Dados** | PostgreSQL 14+, Prisma ORM                    |
| **Autenticação**   | NextAuth.js, OAuth (Google, GitHub)           |
| **IA**             | OpenAI GPT-4, Anthropic Claude, Google Gemini |
| **Filas**          | Redis, BullMQ                                 |
| **Processamento**  | pdf-parse, Tesseract.js (OCR), docx           |
| **Deploy**         | Vercel, Docker, AWS/Azure                     |

---

## 🔒 Segurança

- ✅ **Autenticação Multi-Fator**: Email/senha + OAuth
- ✅ **Rate Limiting**: Proteção contra abuso de APIs
- ✅ **Validação de Input**: XSS e SQL Injection prevention
- ✅ **RBAC**: Controle de acesso baseado em papéis
- ✅ **Auditoria**: Log de todas as ações do sistema
- ✅ **Criptografia**: Senhas com bcrypt, tokens JWT
- ✅ **LGPD Compliant**: Isolamento de dados, consentimento

---

## 📊 Monitoramento

### **Endpoints de Saúde:**

- `GET /api/health` - Status geral da aplicação
- `GET /api/health/database` - Status do PostgreSQL
- `GET /api/health/redis` - Status do Redis
- `GET /api/queue/stats` - Estatísticas das filas

### **Métricas Coletadas:**

- Tempo de resposta das APIs
- Taxa de sucesso das execuções
- Uso de tokens e custos de IA
- Usuários ativos e agentes criados
- Performance do sistema

---

## 🚢 Deploy em Produção

### **Opção 1: Vercel (Recomendado)**

```bash
# 1. Instale Vercel CLI
npm i -g vercel

# 2. Configure variáveis de ambiente no dashboard Vercel
# 3. Deploy
vercel --prod
```

### **Opção 2: Docker**

```bash
# Build
docker build -t simplifiqueia-rh .

# Run
docker run -p 3001:3001 \
  -e DATABASE_URL="sua-url" \
  -e NEXTAUTH_SECRET="seu-segredo" \
  simplifiqueia-rh
```

### **Opção 3: VPS (Ubuntu)**

```bash
# 1. Instale dependências
sudo apt update
sudo apt install nodejs npm postgresql redis-server

# 2. Clone e configure
git clone https://github.com/seu-usuario/simplifiqueia-rh.git
cd simplifiqueia-rh
npm install
cp .env.example .env.local
# Edite .env.local

# 3. Build e inicie
npm run build
npm run start

# 4. Configure PM2 (opcional)
npm i -g pm2
pm2 start npm --name "simplifiqueia-rh" -- start
pm2 save
pm2 startup
```

**Documentação completa:** [docs/deployment/GUIA_IMPLANTACAO.md](docs/deployment/GUIA_IMPLANTACAO.md)

---

## 🐛 Problemas Comuns

### **Erro: Port 3001 already in use**

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### **Erro: Prisma Client not generated**

```bash
npm run db:generate
```

### **Erro: Build failed (EPERM)**

```bash
npm run clean
npm run build:clean
```

### **Erro: Redis connection failed**

```bash
# Redis é opcional - desabilite se não usar filas
# Remova REDIS_URL do .env.local
```

---

## 📚 Documentação

- 📖 **[Guia de Desenvolvimento](docs/DESENVOLVIMENTO.md)** - Como desenvolver e contribuir
- 🚀 **[Guia de Deploy](docs/deployment/GUIA_IMPLANTACAO.md)** - Deploy em produção
- 📋 **[Índice Completo](docs/README.md)** - Toda a documentação técnica

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga o processo:

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona minha feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

**Padrões:**

- TypeScript strict mode
- ESLint + Prettier
- Testes para novas features
- Documentação atualizada

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para detalhes.

---

## 🆘 Suporte

- 📧 **Email**: suporte@simplifiqueia.com.br
- 💬 **Discord**: [Comunidade SimplifiqueIA](https://discord.gg/simplifiqueia)
- 🐛 **Issues**: [GitHub Issues](https://github.com/seu-usuario/simplifiqueia-rh/issues)
- 📚 **Docs**: [docs/](docs/)

---

**SimplifiqueIA RH** - Automatize seu RH com Inteligência Artificial 🚀
