"use client"
import Link from "next/link"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-primary">Empathika</Link>
        <div className="flex gap-6">
          <Link href="/psikolog">Psikolog</Link>
          <Link href="/layanan">Layanan</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/psikotes">Psikotes</Link>
          <Link href="/login">Masuk</Link>
        </div>
      </div>
    </nav>
  )
}

