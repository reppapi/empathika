-- File: backend/prisma/migrations/20261028000000_add_account_security_and_email_change/migration.sql

-- AlterTable accounts
ALTER TABLE "accounts" ADD COLUMN "passwordChangedAt" TIMESTAMP(3);
ALTER TABLE "accounts" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 1;

-- CreateTable email_change_requests
CREATE TABLE "email_change_requests" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "newEmail" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_change_requests_tokenHash_key" ON "email_change_requests"("tokenHash");
CREATE INDEX "email_change_requests_accountId_idx" ON "email_change_requests"("accountId");
CREATE INDEX "email_change_requests_expiresAt_idx" ON "email_change_requests"("expiresAt");

-- AddForeignKey
ALTER TABLE "email_change_requests" ADD CONSTRAINT "email_change_requests_accountId_fkey" 
FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;