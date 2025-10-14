-- Adicionar colunas faltantes na tabela Invitation (se não existirem)
ALTER TABLE "Invitation" 
ADD COLUMN IF NOT EXISTS "acceptedByUserId" TEXT,
ADD COLUMN IF NOT EXISTS "invitedBy" TEXT,
ADD COLUMN IF NOT EXISTS "usedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "usedByIp" TEXT;
