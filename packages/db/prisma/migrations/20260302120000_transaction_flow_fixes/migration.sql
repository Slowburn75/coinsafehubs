-- Add profile fields to users
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "firstName" TEXT,
  ADD COLUMN IF NOT EXISTS "lastName" TEXT,
  ADD COLUMN IF NOT EXISTS "phone" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"("phone");

-- Add approval metadata to transactions
ALTER TABLE "Transaction"
  ADD COLUMN IF NOT EXISTS "approvedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "processedAt" TIMESTAMP(3);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Transaction_approvedBy_fkey'
  ) THEN
    ALTER TABLE "Transaction"
      ADD CONSTRAINT "Transaction_approvedBy_fkey"
      FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Wallet storage
CREATE TABLE IF NOT EXISTS "Wallet" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "network" TEXT NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Wallet_network_address_key" ON "Wallet"("network", "address");
CREATE INDEX IF NOT EXISTS "Wallet_userId_idx" ON "Wallet"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Wallet_userId_fkey'
  ) THEN
    ALTER TABLE "Wallet"
      ADD CONSTRAINT "Wallet_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Password reset tokens
CREATE TABLE IF NOT EXISTS "PasswordReset" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PasswordReset_tokenHash_key" ON "PasswordReset"("tokenHash");
CREATE INDEX IF NOT EXISTS "PasswordReset_userId_expiresAt_idx" ON "PasswordReset"("userId", "expiresAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PasswordReset_userId_fkey'
  ) THEN
    ALTER TABLE "PasswordReset"
      ADD CONSTRAINT "PasswordReset_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Email verification codes
CREATE TABLE IF NOT EXISTS "EmailVerification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "EmailVerification_userId_expiresAt_idx" ON "EmailVerification"("userId", "expiresAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'EmailVerification_userId_fkey'
  ) THEN
    ALTER TABLE "EmailVerification"
      ADD CONSTRAINT "EmailVerification_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Notification preferences
CREATE TABLE IF NOT EXISTS "NotificationSettings" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "emailDeposits" BOOLEAN NOT NULL DEFAULT true,
  "emailWithdrawals" BOOLEAN NOT NULL DEFAULT true,
  "emailSecurityAlerts" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "NotificationSettings_userId_key" ON "NotificationSettings"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'NotificationSettings_userId_fkey'
  ) THEN
    ALTER TABLE "NotificationSettings"
      ADD CONSTRAINT "NotificationSettings_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
