# MVP Agent Builder - Construtor de Agentes IA

## 🚀 Plataforma Completa para Automação com IA

O MVP Agent Builder é uma plataforma de nível empresarial para criar e executar fluxos de trabalho de automação alimentados por IA. Com interface visual intuitiva, integração com múltiplos provedores de IA e recursos de segurança robustos.

## ✨ Recursos Principais

### 🤖 **Integração Multi-IA**

- **OpenAI**: GPT-4, embeddings, moderação
- **Anthropic**: Claude 3 (Opus, Sonnet, Haiku)
- **Google AI**: Gemini Pro, Vision, embeddings
- **Fallback Automático**: Sistema resiliente com múltiplos provedores

### 🔄 **Sistema de Filas Assíncronas**

- **Redis + Bull Queue**: Processamento de alta performance
- **Monitoramento em Tempo Real**: Dashboard de jobs e métricas
- **Retry Inteligente**: Estratégias configuráveis de reprocessamento
- **Escalabilidade**: Suporte a múltiplos workers

### 🔐 **Segurança Empresarial**

- **Autenticação Multi-Provedor**: Google, GitHub, credenciais
- **Controle de Acesso**: Funções USER, ADMIN, SUPER_ADMIN, VIEWER
- **Rate Limiting**: Proteção contra DDoS e abuso
- **Auditoria Completa**: Log de todas as ações do sistema

### 📊 **Banco de Dados Robusto**

- **PostgreSQL + Prisma**: ORM type-safe e performático
- **Migrações Versionadas**: Controle de mudanças do schema
- **Dados de Seed**: Templates e configurações iniciais
- **Métricas de Uso**: Analytics e relatórios detalhados

### 🚀 **CI/CD Completo**

- **GitHub Actions**: Pipeline automatizado
- **Testes Multi-Camada**: Unit, integração, E2E, segurança
- **Docker**: Containerização otimizada
- **Deploy Automático**: Staging e produção

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    MVP Agent Builder                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)  │  Backend API  │  Banco PostgreSQL   │
│  - Interface Visual  │  - Autenticação│  - Dados Persistentes│
│  - Construtor Drag&Drop│ - Rate Limiting│ - Auditoria      │
│  - Monitoramento     │  - Validação   │  - Métricas       │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────────────┐
                    │  Sistema Filas  │
                    │  Redis + Bull   │
                    └─────────────────┘
                              │
                    ┌─────────────────┐
                    │  Provedores IA  │
                    │ OpenAI/Anthropic│
                    │    /Google      │
                    └─────────────────┘
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm ou yarn

### Instalação Local

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/mvp-agent-builder.git
cd mvp-agent-builder
```

2. **Configure o ambiente**

```bash
cp .env.example .env
# Edite .env com suas configurações
```

3. **Instale dependências**

```bash
npm install --legacy-peer-deps
```

4. **Configure o banco de dados**

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. **Inicie o servidor**

```bash
npm run dev
```

6. **Acesse a aplicação**

```
http://localhost:3000
```

## 📚 Documentação Completa

### Guias Principais

- 📋 **[Resumo de Implementação](./RESUMO_IMPLEMENTACAO.md)** - Visão geral completa do projeto
- 🚀 **[Guia de Implantação](./GUIA_IMPLANTACAO.md)** - Deploy em produção passo a passo
- 🔒 **[Guia de Segurança](./GUIA_SEGURANCA.md)** - Implementação de segurança empresarial
- 🔄 **[Guia CI/CD](./GUIA_IMPLEMENTACAO_CICD.md)** - Pipeline de integração contínua
- 🤖 **[Guia Integração IA](./GUIA_INTEGRACAO_IA.md)** - Configuração dos provedores de IA

### Guias Técnicos (Inglês)

- 🧪 **[Testing Guide](./TESTING_GUIDE.md)** - Estratégias de teste
- 📖 **[API Documentation](./API_DOCUMENTATION.md)** - Referência da API
- 🔧 **[Development Guide](./DEVELOPMENT_GUIDE.md)** - Ambiente de desenvolvimento

## 🎯 Templates de Agentes Incluídos

### Para Departamento de RH

- **📄 Analisador de Contratos RH**: Análise automática de contratos trabalhistas
- **📝 Triagem de Currículos**: Pontuação e ranking de candidatos
- **🎯 Onboarding Automático**: Checklist personalizado por cargo
- **📊 Avaliação de Desempenho**: Análise de feedbacks 360°

### Para Uso Geral

- **📧 Suporte Automático**: Atendimento inteligente ao cliente
- **💰 Analisador Financeiro**: Processamento de despesas e relatórios
- **📁 Processador de Documentos**: Extração e validação de dados
- **🔍 Analisador de Sentimentos**: Análise de feedback e reviews

## 🔧 Configuração de Ambiente

### Variáveis Essenciais

```bash
# Banco de Dados
DATABASE_URL="postgresql://user:pass@localhost:5432/mvp_agent_builder"

# Autenticação
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"

# Provedores de IA (opcional)
OPENAI_API_KEY="sk-sua-chave-openai"
ANTHROPIC_API_KEY="sua-chave-anthropic"
GOOGLE_AI_API_KEY="sua-chave-google-ai"

# Sistema de Filas
REDIS_URL="redis://localhost:6379"
```

## 🐳 Deploy com Docker

### Build e Execução

```bash
# Build da imagem
docker build -t mvp-agent-builder .

# Executar container
docker run -p 3000:3000 \
  -e DATABASE_URL="sua-url-banco" \
  -e NEXTAUTH_SECRET="seu-segredo" \
  mvp-agent-builder
```

### Docker Compose

```bash
# Subir stack completo
docker-compose up -d
```

## 🧪 Executar Testes

```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Cobertura de testes
npm run test:coverage
```

## 📊 Monitoramento e Métricas

### Endpoints de Saúde

- `/api/health` - Status geral da aplicação
- `/api/health/database` - Status do banco de dados
- `/api/health/redis` - Status do Redis
- `/api/queue/stats` - Estatísticas das filas

### Métricas Coletadas

- Tempo de resposta das APIs
- Taxa de sucesso das execuções
- Uso de tokens e custos de IA
- Métricas de usuários ativos
- Performance do sistema

## 🤝 Contribuindo

### Processo de Desenvolvimento

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Padrões de Código

- TypeScript strict mode
- ESLint + Prettier para formatação
- Testes obrigatórios para novas features
- Documentação atualizada

## 📈 Roadmap

### Fase 1 - Estabilização ✅

- [x] Integração completa com provedores de IA
- [x] Sistema de filas assíncronas
- [x] Autenticação e autorização
- [x] Pipeline CI/CD completo
- [x] Segurança empresarial

### Fase 2 - Recursos Avançados (Q1 2025)

- [ ] Marketplace de templates
- [ ] Colaboração em tempo real
- [ ] Analytics avançadas
- [ ] Multi-tenancy

### Fase 3 - Escala Empresarial (Q2 2025)

- [ ] Integração SSO (SAML, LDAP)
- [ ] Conformidade SOC2/GDPR
- [ ] Soluções white-label
- [ ] SLAs empresariais

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

### Documentação

- 📚 [Documentação Completa](./docs/)
- 🎥 [Vídeos Tutoriais](./docs/videos/)
- 💡 [Exemplos de Uso](./examples/)

### Comunidade

- 💬 [Discord](https://discord.gg/mvp-agent-builder)
- 📧 [Email de Suporte](mailto:support@mvp-agent-builder.com)
- 🐛 [Reportar Bugs](https://github.com/seu-usuario/mvp-agent-builder/issues)

---

**MVP Agent Builder** - Construindo o futuro da automação com IA 🚀
