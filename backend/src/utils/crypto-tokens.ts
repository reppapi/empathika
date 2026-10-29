// File: backend/src/utils/crypto-tokens.ts
import crypto from "crypto"

export function generateSecureRandomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex")
}

export function hashTokenSha256(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}
