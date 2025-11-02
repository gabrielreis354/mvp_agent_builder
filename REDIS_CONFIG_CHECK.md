# ✅ CHECKLIST: CONFIGURAÇÃO REDIS APÓS MIGRAÇÃO

## 🔍 VARIÁVEIS DE AMBIENTE A VERIFICAR

### **1. No arquivo `.env.local` (linha 22):**

```bash
# ✅ Verificar/Atualizar
REDIS_URL=redis://localhost:6379

# Se mudou host/porta/senha:
REDIS_URL=redis://:[senha]@[host]:[porta]/[db]

# Exemplo com senha:
REDIS_URL=redis://:minha_senha@localhost:6379/0

# Exemplo remoto:
REDIS_URL=redis://:senha@seu-redis.com:6379/0
```

### **2. Variáveis individuais (opcional - usadas por algumas bibliotecas):**

Adicione no `.env.local` se ainda não existirem:

```bash
REDIS_HOST=localhost          # Seu novo host
REDIS_PORT=6379              # Sua nova porta
REDIS_PASSWORD=              # Senha se houver
REDIS_DB=0                   # Database number (0-15)
```

---

## 📁 ARQUIVOS QUE USAM REDIS

### **1. Cache de IA** (`lib/cache/redis-client.ts`)
- **Uso:** Cache de respostas da IA, rate limiting
- **Lê:** `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- **Fallback:** localhost:6379

### **2. Fila de Agentes** (`lib/queue/redis-client.ts`)
- **Uso:** Sistema de filas Bull
- **Lê:** `REDIS_URL`
- **Fallback:** redis://localhost:6379

### **3. Sessões/Relatórios** (`lib/redis.ts`)
- **Uso:** Armazenamento de relatórios e sessões
- **Lê:** `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- **Fallback:** localhost:6379

---

## 🔧 PASSOS APÓS MUDAR REDIS

### **1. Atualizar `.env.local`:**

```bash
# Opção A: URL completa (recomendado)
REDIS_URL=redis://:[nova_senha]@[novo_host]:[nova_porta]/[db]

# Opção B: Variáveis separadas
REDIS_HOST=novo_host
REDIS_PORT=nova_porta
REDIS_PASSWORD=nova_senha
REDIS_DB=0
```

### **2. Reiniciar servidor Next.js:**

```bash
# Ctrl+C no terminal
npm run dev
```

### **3. Verificar conexão:**

Veja logs do terminal:
```
✓ Redis connected successfully
✓ Redis ready for operations
```

### **4. Testar funcionalidades:**

- ✅ Executar agente (testa fila)
- ✅ Salvar relatório (testa storage)
- ✅ Gerar análise IA (testa cache)

---

## ⚠️ PROBLEMAS COMUNS

### **Erro: "Redis connection error"**

**Causa:** URL/credenciais incorretas

**Solução:**
```bash
# Testar conexão manual
redis-cli -h seu_host -p sua_porta -a sua_senha ping
# Deve retornar: PONG
```

### **Erro: "NOAUTH Authentication required"**

**Causa:** Faltou senha

**Solução:**
```bash
REDIS_URL=redis://:SUA_SENHA@host:porta
# ou
REDIS_PASSWORD=SUA_SENHA
```

### **Erro: "Connection refused"**

**Causa:** Redis não está rodando ou porta errada

**Solução:**
```bash
# Windows: Verificar serviço
services.msc → buscar "Redis"

# Ou iniciar Redis manualmente
redis-server
```

---

## 📊 VERIFICAR SE MIGRAÇÃO FOI COMPLETA

### **1. Checar dados migrados:**

```bash
# Conectar ao novo Redis
redis-cli -h novo_host -p porta -a senha

# Listar todas as keys
KEYS *

# Ver relatórios
KEYS report:*

# Ver cache IA
KEYS ai_cache:*

# Ver rate limits
KEYS rate_limit:*
```

### **2. Quantidade de dados:**

```bash
# Contar keys
DBSIZE

# Ver memória usada
INFO memory
```

---

## 🎯 CONFIGURAÇÃO FINAL RECOMENDADA

No `.env.local`:

```bash
# ============================================
# REDIS CONFIGURATION (após migração)
# ============================================

# URL completa (mais fácil)
REDIS_URL=redis://:[senha]@[host]:[porta]/[db]

# OU variáveis separadas (mais flexível)
REDIS_HOST=[seu_host]
REDIS_PORT=[sua_porta]
REDIS_PASSWORD=[sua_senha]
REDIS_DB=0

# Não remover estas:
PDF_SERVICE_URL=http://localhost:8001
NEXT_PUBLIC_PDF_SERVICE_URL=http://localhost:8001
```

---

## ✅ CHECKLIST RÁPIDO

- [ ] Atualizei `REDIS_URL` no `.env.local`
- [ ] Verifiquei host/porta/senha estão corretos
- [ ] Reiniciei servidor Next.js
- [ ] Vi logs "Redis connected successfully"
- [ ] Testei executar agente
- [ ] Testei salvar relatório
- [ ] Dados antigos foram migrados
- [ ] Sistema funcionando normalmente

---

**Se tudo acima está ✅, a migração está completa! 🎉**
