-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "acceptedByUserId" TEXT,
ADD COLUMN     "invitedBy" TEXT,
ADD COLUMN     "usedAt" TIMESTAMP(3),
ADD COLUMN     "usedByIp" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "company" TEXT,
ADD COLUMN     "verificationCode" TEXT,
ADD COLUMN     "verificationCodeExpires" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_token_key" ON "password_resets"("token");

-- CreateIndex
CREATE INDEX "password_resets_email_idx" ON "password_resets"("email");

-- CreateIndex
CREATE INDEX "password_resets_token_idx" ON "password_resets"("token");
