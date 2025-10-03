# MVP Agent Builder - Guia de Implantação

## 🚀 Guia Completo de Implantação em Produção

**Atualizado em:** 23 de Setembro de 2025  
**Versão do Sistema:** 0.1.0  
**Status de Prontidão:** 🟡 73% Pronto (Correções críticas necessárias)

Este guia cobre a configuração completa e implantação do MVP Agent Builder com todos os recursos implementados.

## ⚠️ **AVISO IMPORTANTE - LEIA ANTES DE PROSSEGUIR**

**O sistema possui problemas críticos de segurança que DEVEM ser corrigidos antes da produção:**

- 🔴 **Middleware de autenticação desabilitado** - Rotas não estão protegidas
- 🔴 **36% dos testes falhando** - Estabilidade questionável
- 🔴 **Variáveis de ambiente expostas** - Risco de vazamento de credenciais

**Consulte o documento `ANALISE_SISTEMA_PRODUCAO.md` para detalhes completos.**

## 📋 Pré-requisitos

### Requisitos do Sistema

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker (opcional)
- Git

### Ferramentas de Desenvolvimento

- npm ou yarn
- Prisma CLI
- Docker Compose (para desenvolvimento local)

## 🔧 Configuração para Desenvolvimento Local

### 1. Configuração do Banco de Dados (PostgreSQL)

#### Opção A: Docker Compose (Recomendado)

```bash
# Use o docker-compose.yml existente no diretório raiz
cd c:\G-STUFF\projects\automate_ai\AutomateAI
docker-compose up -d postgres pgadmin redis
```

#### Opção B: Instalação Local

```bash
# Instale PostgreSQL e crie o banco de dados
createdb automateai_mvp
```

### 2. Configuração do Ambiente

Crie o arquivo `.env` no diretório mvp-agent-builder:

```bash
# Banco de Dados
DATABASE_URL="postgresql://postgres:password@localhost:5432/automateai_mvp"

# Autenticação
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="sua-chave-jwt-super-secreta-mude-em-producao"

# Provedores OAuth (Opcional - obtenha dos respectivos provedores)
GOOGLE_CLIENT_ID="seu-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="seu-google-oauth-client-secret"
GITHUB_CLIENT_ID="seu-github-oauth-client-id"
GITHUB_CLIENT_SECRET="seu-github-oauth-client-secret"

# Provedores de IA (Opcional - sistema funciona com respostas de fallback)
OPENAI_API_KEY="sk-sua-chave-api-openai"
ANTHROPIC_API_KEY="sua-chave-api-anthropic"
GOOGLE_AI_API_KEY="sua-chave-api-google-ai"

# Sistema de Filas Redis
REDIS_URL="redis://localhost:6379"

# Rate Limiting (Upstash Redis - Opcional, volta para memória)
UPSTASH_REDIS_REST_URL="https://sua-url-redis-upstash"
UPSTASH_REDIS_REST_TOKEN="seu-token-upstash"

# Segurança
ALLOWED_ORIGINS="http://localhost:3000,https://seudominio.com"
```

### 3. Instalação e Configuração

```bash
# Navegue para o diretório do projeto
cd c:\G-STUFF\projects\automate_ai\AutomateAI\mvp-agent-builder

# Instale as dependências
npm install --legacy-peer-deps

# Gere o cliente Prisma
npx prisma generate

# Aplique o schema do banco de dados
npx prisma db push

# Popule o banco com dados iniciais
npx prisma db seed

# Execute o servidor de desenvolvimento
npm run dev
```

### 4. Verificar Instalação

Visite `http://localhost:3001` e verifique:

- ✅ Página inicial carrega
- ✅ Páginas de autenticação funcionam (`/auth/signin`, `/auth/signup`)
- ✅ Interface do construtor de agentes carrega
- ✅ Templates estão disponíveis
- ✅ Monitoramento de filas funciona (se Redis estiver rodando)

## 🐳 Implantação com Docker

### Construir e Executar com Docker

```bash
# Construa a imagem Docker
docker build -t mvp-agent-builder .

# Execute com variáveis de ambiente
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e NEXTAUTH_SECRET="seu-segredo" \
  -e REDIS_URL="redis://redis:6379" \
  mvp-agent-builder
```

### Docker Compose (Stack Completo)

Crie `docker-compose.production.yml`:

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/mvp_agent_builder
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_SECRET=seu-segredo-de-producao
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: mvp_agent_builder
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## ☁️ Implantação na Nuvem

### Implantação Vercel (Recomendado)

1. **Preparar para Vercel:**

```bash
npm install -g vercel
vercel login
```

2. **Configurar Variáveis de Ambiente no Vercel:**

   - Adicione todas as variáveis de ambiente do `.env`
   - Configure PostgreSQL externo (Supabase, PlanetScale, etc.)
   - Configure Redis externo (Upstash, Redis Cloud, etc.)

3. **Implantar:**

```bash
vercel --prod
```

### Implantação AWS/Azure/GCP

1. **Registry de Containers:**

```bash
# Construa e envie para seu registry
docker build -t seu-registry/mvp-agent-builder .
docker push seu-registry/mvp-agent-builder
```

2. **Configuração do Banco de Dados:**

   - Use PostgreSQL gerenciado (RDS, Azure Database, Cloud SQL)
   - Use Redis gerenciado (ElastiCache, Azure Cache, Memorystore)

3. **Variáveis de Ambiente:**
   - Configure todas as variáveis de ambiente necessárias
   - Use gerenciamento de segredos (AWS Secrets Manager, Azure Key Vault, etc.)

## 🔐 Lista de Verificação de Segurança em Produção

### Segurança do Ambiente

- [ ] Alterar todas as senhas e segredos padrão
- [ ] Usar gerenciamento de segredos específico do ambiente
- [ ] Habilitar HTTPS/TLS para todas as conexões
- [ ] Configurar origens CORS adequadas
- [ ] Configurar regras de firewall adequadas

### Segurança do Banco de Dados

- [ ] Usar connection pooling
- [ ] Habilitar conexões SSL
- [ ] Backups regulares configurados
- [ ] Log de acesso habilitado
- [ ] Princípio do menor privilégio para usuários do banco

### Segurança da Aplicação

- [ ] Rate limiting configurado
- [ ] Validação de entrada habilitada
- [ ] Cabeçalhos de segurança configurados
- [ ] Log de auditoria habilitado
- [ ] Tratamento de erros não expõe dados sensíveis

## 📊 Monitoramento e Observabilidade

### Verificações de Saúde

```bash
# Saúde da aplicação
curl http://localhost:3000/api/health

# Saúde da fila
curl http://localhost:3000/api/queue/stats
```

### Logging

- Logs da aplicação: Verificar saída do console
- Logs do banco de dados: Logs do PostgreSQL
- Logs da fila: Logs do Redis
- Logs de auditoria: Tabela `audit_logs` do banco

### Métricas para Monitorar

- Tempos de resposta
- Taxas de erro
- Taxas de conclusão de jobs da fila
- Uso do pool de conexões do banco
- Uso de memória e CPU
- Sessões ativas de usuários

## 🧪 Testando o Sistema Completo

### 1. Fluxo de Autenticação

```bash
# Testar registro de usuário
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Usuário Teste","email":"teste@exemplo.com","password":"senha123"}'

# Testar login (usar navegador para OAuth)
```

### 2. Execução de Agente

```bash
# Testar execução de agente
curl -X POST http://localhost:3000/api/agents/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "agentId": "contract-analyzer-rh",
    "input": {
      "document": "Conteúdo do contrato de teste",
      "email": "destinatario@exemplo.com"
    }
  }'
```

### 3. Sistema de Filas

```bash
# Testar execução assíncrona
curl -X POST http://localhost:3000/api/agents/execute-async \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "agentId": "resume-screener",
    "input": {"resume": "Conteúdo do currículo de teste"}
  }'

# Verificar status do job
curl http://localhost:3000/api/agents/job-status/ID_DO_JOB
```

## 🚨 Solução de Problemas

### Problemas Comuns

**Problemas de Conexão com Banco de Dados:**

```bash
# Verificar se PostgreSQL está rodando
pg_isready -h localhost -p 5432

# Verificar se o banco existe
psql -h localhost -U postgres -l
```

**Problemas de Conexão com Redis:**

```bash
# Verificar se Redis está rodando
redis-cli ping

# Verificar conexão Redis
redis-cli -h localhost -p 6379 info
```

**Problemas de Build:**

```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Regenerar cliente Prisma
npx prisma generate
```

**Problemas de Autenticação:**

- Verificar se NEXTAUTH_SECRET está definido
- Verificar configurações dos provedores OAuth
- Verificar se URLs de callback estão corretas

### Problemas de Performance

- Verificar performance das consultas do banco
- Monitorar uso de memória do Redis
- Revisar configurações de rate limiting
- Verificar vazamentos de memória

## 📈 Considerações de Escalabilidade

### Escalabilidade Horizontal

- Usar load balancer para múltiplas instâncias da app
- Configurar session store (Redis) para sessões compartilhadas
- Usar connection pooling do banco de dados
- Implementar CDN para assets estáticos

### Escalabilidade Vertical

- Monitorar uso de CPU e memória
- Otimizar consultas do banco de dados
- Configurar processos worker apropriados
- Ajustar configurações de garbage collection

## 🔄 Manutenção

### Tarefas Regulares

- [ ] Backups do banco de dados
- [ ] Atualizações de segurança
- [ ] Monitoramento de performance
- [ ] Rotação de logs
- [ ] Renovação de certificados (se usando SSL customizado)

### Atualizações

```bash
# Atualizar dependências
npm update

# Atualizar Prisma
npx prisma generate
npx prisma db push

# Reiniciar aplicação
pm2 restart mvp-agent-builder  # se usando PM2
```

Este guia de implantação fornece tudo o que é necessário para implantar e manter com sucesso o MVP Agent Builder em ambientes de produção.
