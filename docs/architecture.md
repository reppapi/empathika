# Arsitektur Empathika Web

## Overview

Monorepo ringan dengan pnpm workspace.

## Stack

| Layer     | Teknologi                          |
|-----------|------------------------------------|
| Frontend  | Next.js 14 (App Router) + TS       |
| Backend   | Fastify + TS                        |
| Database  | PostgreSQL + Prisma ORM             |
| Styling   | Tailwind CSS                        |
| HTTP      | Axios                               |
| State     | TanStack Query + Zustand           |
| Auth      | JWT (access + refresh token)       |
| Payment   | Midtrans/Xendit (VA, e-wallet, QRIS)|

## Keputusan Arsitektur

### Monorepo ringan (pnpm workspace)
Tim full-stack sering mengerjakan 1 fitur end-to-end (FE+BE). Monorepo memungkinkan 1 PR = 1 fitur lengkap.

### Feature-based structure
Setiap domain bisnis (booking, psikolog, dll) memiliki folder sendiri di FE dan BE. Memudahkan kerja paralel 3 developer tanpa merge conflict.

### TanStack Query + Zustand
Mengurangi boilerplate. TanStack Query untuk server state, Zustand untuk client state lokal.

### Env management
File .env tidak pernah di-commit. Staging/production env di-input via platform dashboard (Vercel, Railway).

