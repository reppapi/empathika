"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  const navLinks = [
    { name: "home", path: "/" },
    { name: "layanan", path: "/layanan" },
    { name: "konseling", path: "/konseling" },
    { name: "psikolog", path: "/psikolog" },
    { name: "blog", path: "/blog" },
    { name: "kerja sama", path: "/kerja-sama" },
    { name: "tentang kami", path: "/tentang-kami" },
  ]

  return (
    <header className="fixed top-6 left-0 right-0 z-50 w-full px-4 font-poppins">
      {/* Menggunakan justify-center tapi dengan jarak (gap) yang lebih lebar */}
      <div className="mx-auto flex items-center justify-center gap-10 md:gap-14">
        
        {/* 1. Logo Block */}
        <Link 
          href="/"
          className="h-14 w-14 shrink-0 rounded-full bg-[#4A1B6D] transition-transform hover:scale-105"
          aria-label="Home"
        ></Link>

        {/* 2. Main Navigation Block */}
        <nav className="hidden items-center rounded-full bg-[#4A1B6D] px-2 py-1.5 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.path)
            
            return (
              <Link
                key={link.name}
                href={link.path as any}
                className={`rounded-full px-5 py-2 text-[14px] font-normal lowercase tracking-wide transition-colors ${
                  active 
                    ? "bg-[#6A3296] text-white" 
                    : "text-white hover:text-gray-200"
                }`}
              >
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* 3. Booking Sesi Block */}
        <Link 
          href="/booking"
          className="flex h-11 shrink-0 items-center justify-center rounded-full bg-[#4A1B6D] px-6 text-[14px] font-normal lowercase tracking-wide text-white transition-transform hover:scale-105"
        >
          booking sesi
        </Link>

      </div>
    </header>
  )
}
