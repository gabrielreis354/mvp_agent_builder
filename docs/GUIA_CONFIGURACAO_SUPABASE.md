# 🗄️ Guia de Configuração do Supabase - MVP Agent Builder

## 🎯 **PASSO A PASSO COMPLETO**

### **1. CRIAR CONTA E PROJETO**

1. **Acesse:** <https://supabase.com>
2. **Clique em "Start your project"**
3. **Faça login** (recomendo usar GitHub)
4. **Clique em "New Project"**

### **2. CONFIGURAR PROJETO**

**Dados do projeto:**

- **Name:** `automateai-prod`
- **Database Password:** `AutomateAI2025!` (ou sua senha forte)
- **Region:** `South America (São Paulo)`
- **Pricing Plan:** `Free` (0$/mês)

### **3. AGUARDAR CRIAÇÃO**

- Tempo: ~2 minutos
- Status: "Setting up your project..."
- Quando pronto: Dashboard aparecerá

### **4. COPIAR CONNECTION STRING**

No dashboard do Supabase:

1. **Vá em:** Settings → Database
2. **Seção:** Connection string
3. **Copie:** URI (connection pooling)

**Exemplo:**

```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

### **5. CONFIGURAR VARIÁVEIS DE AMBIENTE**

Crie o arquivo `.env.production` na raiz do projeto:

```bash
# BANCO DE DADOS SUPABASE
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

# AUTENTICAÇÃO
NEXTAUTH_URL="https://seudominio.com"
NEXTAUTH_SECRET="sua-chave-secreta-de-32-caracteres-ou-mais"

# REDIS (OPCIONAL - pode usar Upstash)
REDIS_URL="redis://localhost:6379"

# IA PROVIDERS
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_AI_API_KEY="..."

# OUTROS
NODE_ENV="production"
```

### **6. EXECUTAR MIGRAÇÕES**

```bash
# Instalar Prisma CLI (se não tiver)
npm install -g prisma

# Executar migrações
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate

# (Opcional) Visualizar banco
npx prisma studio
```

### **7. VERIFICAR CONEXÃO**

Teste a conexão criando um script simples:

```javascript
// test-db-connection.js
const { PrismaClient } = require("@prisma/client");

async function testConnection() {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log("✅ Conexão com Supabase estabelecida!");

    // Testar uma query simples
    const userCount = await prisma.user.count();
    console.log(`📊 Usuários no banco: ${userCount}`);
  } catch (error) {
    console.error("❌ Erro na conexão:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

Execute: `node test-db-connection.js`

## 🔧 **CONFIGURAÇÕES AVANÇADAS**

### **Connection Pooling (Recomendado)**

No Supabase, use sempre a URL com pooling:

- ✅ `pooler.supabase.com:5432` (Connection pooling)
- ❌ `db.supabase.com:5432` (Direct connection)

### **SSL Configuration**

O Supabase já vem com SSL habilitado. Se der erro, adicione:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### **Backup Automático**

O Supabase Free inclui:

- ✅ Backup diário automático
- ✅ Point-in-time recovery (7 dias)
- ✅ Replicação automática

## 📊 **MONITORAMENTO**

### **Dashboard Supabase**

Acesse: https://app.supabase.com/project/[seu-projeto]

**Métricas disponíveis:**

- Database size
- Active connections
- Query performance
- API requests

### **Alertas**

Configure alertas para:

- Uso de storage > 80%
- Conexões > 50
- Queries lentas > 5s

## 🚨 **LIMITES DO PLANO GRATUITO**

| Recurso           | Limite Free | Quando Upgrade     |
| ----------------- | ----------- | ------------------ |
| **Storage**       | 500MB       | Quando > 400MB     |
| **Bandwidth**     | 5GB/mês     | Quando > 4GB       |
| **Database Size** | 500MB       | Quando > 400MB     |
| **Auth Users**    | 50.000      | Raramente atingido |

### **Upgrade para Pro ($25/mês):**

- 8GB storage
- 250GB bandwidth
- Backup de 30 dias
- Support por email

## ✅ **CHECKLIST FINAL**

- [ ] Projeto Supabase criado
- [ ] Connection string copiada
- [ ] `.env.production` configurado
- [ ] Migrações executadas (`npx prisma migrate deploy`)
- [ ] Conexão testada
- [ ] Dashboard funcionando
- [ ] Backup configurado

## 🔄 **MIGRAÇÃO DE DADOS**

Se você tem dados no banco local:

```bash
# 1. Fazer dump do banco local
pg_dump postgresql://localhost:5432/automateai > backup_local.sql

# 2. Restaurar no Supabase
psql "postgresql://postgres:[senha]@[host]:5432/postgres" < backup_local.sql
```

## 🆘 **TROUBLESHOOTING**

### **Erro: "Connection refused"**

- Verificar se a senha está correta
- Verificar se a URL está completa
- Tentar com `sslmode=require`

### **Erro: "Too many connections"**

- Usar connection pooling URL
- Verificar se não há conexões abertas sem fechar

### **Erro: "Database does not exist"**

- Usar `postgres` como database name
- Não criar database customizado no Supabase

## 🚀 **PRÓXIMOS PASSOS**

Após configurar o Supabase:

1. **Testar todas as funcionalidades**
2. **Configurar Redis (Upstash)**
3. **Deploy da aplicação**
4. **Monitoramento em produção**

---

**Tempo estimado:** 15-30 minutos  
**Custo:** $0/mês (até 500MB)  
**Escalabilidade:** Até 2.000+ usuários no plano gratuito
