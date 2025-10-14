-- AlterTable (com IF NOT EXISTS para evitar erros)
DO $$ 
BEGIN
    -- Adicionar colunas na tabela Invitation
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invitation' AND column_name='acceptedByUserId') THEN
        ALTER TABLE "Invitation" ADD COLUMN "acceptedByUserId" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invitation' AND column_name='invitedBy') THEN
        ALTER TABLE "Invitation" ADD COLUMN "invitedBy" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invitation' AND column_name='usedAt') THEN
        ALTER TABLE "Invitation" ADD COLUMN "usedAt" TIMESTAMP(3);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Invitation' AND column_name='usedByIp') THEN
        ALTER TABLE "Invitation" ADD COLUMN "usedByIp" TEXT;
    END IF;
    
    -- Adicionar colunas na tabela users
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='company') THEN
        ALTER TABLE "users" ADD COLUMN "company" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='verificationCode') THEN
        ALTER TABLE "users" ADD COLUMN "verificationCode" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='verificationCodeExpires') THEN
        ALTER TABLE "users" ADD COLUMN "verificationCodeExpires" TIMESTAMP(3);
    END IF;
END $$;

-- CreateTable (com IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS "password_resets" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (com IF NOT EXISTS)
CREATE UNIQUE INDEX IF NOT EXISTS "password_resets_token_key" ON "password_resets"("token");

-- CreateIndex (com IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS "password_resets_email_idx" ON "password_resets"("email");

-- CreateIndex (com IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS "password_resets_token_idx" ON "password_resets"("token");
