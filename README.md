# Empathika Web

Website CV Empathika - Platform psikologi untuk konsultasi, psikotes, dan layanan kesehatan mental.

## Stack
- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS + TanStack Query + Zustand
- **Backend**: Fastify + TypeScript + Prisma + PostgreSQL
- **Shared**: pnpm workspace monorepo + shared-types package

## Getting Started

Install semua dependencies:
  pnpm install

Copy env files:
  cp frontend/.env.example frontend/.env.development
  cp backend/.env.example backend/.env.development

Jalankan development:
  pnpm dev
