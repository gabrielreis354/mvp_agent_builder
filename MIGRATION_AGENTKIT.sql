-- ============================================
-- ANÁLISE DAS MUDANÇAS NO SCHEMA
-- ============================================
--
-- NOVAS FUNCIONALIDADES ADICIONADAS:
-- 1. Sistema de Chat Conversacional (AgentKit)
-- 2. Threads de conversa com agentes
-- 3. Histórico de mensagens
-- 4. Status de threads (ACTIVE, ARCHIVED, COMPLETED)
--
-- TABELAS CRIADAS:
-- 1. agent_threads - Armazena conversas/threads
-- 2. thread_messages - Armazena mensagens individuais
--
-- ENUMS CRIADOS:
-- 1. ThreadStatus - Status da thread (ACTIVE, ARCHIVED, COMPLETED)
-- 2. MessageRole - Papel da mensagem (USER, ASSISTANT, SYSTEM)
--
-- RELAÇÕES:
-- - User -> AgentThread (1:N)
-- - Agent -> AgentThread (1:N)
-- - AgentThread -> ThreadMessage (1:N)
--
-- ============================================

-- ============================================
-- PASSO 1: CRIAR ENUMS
-- ============================================

-- Enum para status da thread
CREATE TYPE "ThreadStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'COMPLETED');

-- Enum para papel da mensagem
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- ============================================
-- PASSO 2: CRIAR TABELA agent_threads
-- ============================================

CREATE TABLE "agent_threads" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "title" TEXT,
    "status" "ThreadStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_threads_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- PASSO 3: CRIAR TABELA thread_messages
-- ============================================

CREATE TABLE "thread_messages" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thread_messages_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- PASSO 4: CRIAR ÍNDICES
-- ============================================

-- Índices para agent_threads
CREATE INDEX "agent_threads_userId_idx" ON "agent_threads"("userId");
CREATE INDEX "agent_threads_agentId_idx" ON "agent_threads"("agentId");
CREATE INDEX "agent_threads_status_idx" ON "agent_threads"("status");
CREATE INDEX "agent_threads_updatedAt_idx" ON "agent_threads"("updatedAt");

-- Índices para thread_messages
CREATE INDEX "thread_messages_threadId_idx" ON "thread_messages"("threadId");
CREATE INDEX "thread_messages_createdAt_idx" ON "thread_messages"("createdAt");

-- ============================================
-- PASSO 5: CRIAR FOREIGN KEYS (RELAÇÕES)
-- ============================================

-- Relação agent_threads -> users
ALTER TABLE "agent_threads" 
ADD CONSTRAINT "agent_threads_userId_fkey" 
FOREIGN KEY ("userId") 
REFERENCES "users"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Relação agent_threads -> agents
ALTER TABLE "agent_threads" 
ADD CONSTRAINT "agent_threads_agentId_fkey" 
FOREIGN KEY ("agentId") 
REFERENCES "agents"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Relação thread_messages -> agent_threads
ALTER TABLE "thread_messages" 
ADD CONSTRAINT "thread_messages_threadId_fkey" 
FOREIGN KEY ("threadId") 
REFERENCES "agent_threads"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('agent_threads', 'thread_messages');

-- Verificar se os enums foram criados
SELECT typname 
FROM pg_type 
WHERE typname IN ('ThreadStatus', 'MessageRole');

-- ============================================
-- RESUMO DA MIGRAÇÃO
-- ============================================
--
-- ✅ 2 Enums criados:
--    - ThreadStatus (3 valores)
--    - MessageRole (3 valores)
--
-- ✅ 2 Tabelas criadas:
--    - agent_threads (8 colunas + 4 índices)
--    - thread_messages (5 colunas + 2 índices)
--
-- ✅ 3 Foreign Keys criadas:
--    - agent_threads -> users
--    - agent_threads -> agents
--    - thread_messages -> agent_threads
--
-- 🎯 Funcionalidade: Sistema de chat conversacional
-- com histórico persistente e threads organizadas
--
-- ============================================
