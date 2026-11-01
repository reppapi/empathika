import { z } from "zod"

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile()
  } catch {
    // Ignore if .env doesn't exist
  }
}

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL harus berupa URL valid"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET minimal 32 karakter"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(["development", "staging", "production", "test"]).default("development"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  BASE_URL: z.string().optional(), // e.g. http://localhost:3001 - untuk generate URL file upload
  MIDTRANS_SERVER_KEY: z.string().optional(),
  MIDTRANS_CLIENT_KEY: z.string().optional(),
  XENDIT_SECRET_KEY: z.string().optional(),
  XENDIT_WEBHOOK_TOKEN: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("Invalid environment variables:")
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
