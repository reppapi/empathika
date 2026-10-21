"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import { adminService } from "@/services/admin.service";

export function Footer() {
  const [contact, setContact] = useState({
    alamat: "Jl. Cikutra No.312, Neglasari\nKec. Cibeunying Kaler, Kota Bandung\nJawa Barat 41024",
    email: "empathika889@gmail.com",
    noTelepon: "0878-7878-5498",
  });

  useEffect(() => {
    // 1. Cek cache lokal agar instan
    try {
      const saved = localStorage.getItem("empathika_admin_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        setContact((prev) => ({
          alamat: parsed.alamat || prev.alamat,
          email: parsed.email || prev.email,
          noTelepon: parsed.noTelepon || parsed.no_telepon || prev.noTelepon,
        }));
      }
    } catch {}

    // 2. Ambil data terbaru dari backend database (Publik)
    let isMounted = true;
    adminService
      .getPublicProfile()
      .then((res) => {
        if (isMounted && res?.data) {
          setContact({
            alamat: res.data.alamat || "Jl. Cikutra No.312, Neglasari\nKec. Cibeunying Kaler, Kota Bandung\nJawa Barat 41024",
            email: res.data.email || "empathika889@gmail.com",
            noTelepon: res.data.no_telepon || res.data.noTelepon || "0878-7878-5498",
          });
        }
      })
      .catch(() => {
        // Fallback ke default jika offline/error
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const cleanWa = contact.noTelepon ? contact.noTelepon.replace(/\D/g, "") : "";
  const waNumber = cleanWa.startsWith("0") ? "62" + cleanWa.slice(1) : cleanWa;
  const waUrl = waNumber ? `https://wa.me/${waNumber}` : "https://wa.me/6287878785498";

  return (
    <footer className="bg-[#EFE9F3] pt-16 pb-8 text-gray-800">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          
          {/* Brand & Description */}
          <div className="lg:col-span-2 space-y-4 md:pr-8">
            <Link href="/" className="inline-flex items-center gap-3">
              {/* Logo (Circle) */}
              <div className="h-14 w-14 shrink-0 rounded-full bg-[#561269]"></div>
              <span className="text-[24px] font-extrabold tracking-widest text-[#561269] uppercase">EMPATHIKA</span>
            </Link>
            <p className="text-gray-600 leading-relaxed font-medium">
              Platform psikologi dan kesehatan mental.
            </p>
            <p className="text-[#3B074B] font-semibold text-lg max-w-sm leading-snug">
              &quot;Menemani setiap langkahmu untuk memahami diri, bertumbuh, dan menjadi lebih baik.&quot;
            </p>
          </div>

          {/* Links - Empathika */}
          <div className="space-y-5">
            <h4 className="font-bold text-[#3B074B] text-lg tracking-wide">Empathika</h4>
            <ul className="space-y-3">
              <li><Link href={"/tentang-kami" as any} className="text-gray-600 hover:text-[#561269] font-medium transition-colors underline underline-offset-4 decoration-[#561269]/40 hover:decoration-[#561269]">Tentang Kami</Link></li>
              <li><Link href={"/psikolog" as any} className="text-gray-600 hover:text-[#561269] font-medium transition-colors underline underline-offset-4 decoration-[#561269]/40 hover:decoration-[#561269]">Psikolog</Link></li>
              <li><Link href={"/blog" as any} className="text-gray-600 hover:text-[#561269] font-medium transition-colors underline underline-offset-4 decoration-[#561269]/40 hover:decoration-[#561269]">Blog</Link></li>
              <li><Link href={"/kerja-sama" as any} className="text-gray-600 hover:text-[#561269] font-medium transition-colors underline underline-offset-4 decoration-[#561269]/40 hover:decoration-[#561269]">Mitra Kerjasama</Link></li>
            </ul>
          </div>

          {/* Links - Layanan */}
          <div className="space-y-5">
            <h4 className="font-bold text-[#3B074B] text-lg tracking-wide">Layanan</h4>
            <ul className="space-y-3">
              <li><Link href={"/konseling" as any} className="text-gray-600 hover:text-[#561269] font-medium transition-colors underline underline-offset-4 decoration-[#561269]/40 hover:decoration-[#561269]">Konsultasi</Link></li>
              <li><Link href={"/layanan" as any} className="text-gray-600 hover:text-[#561269] font-medium transition-colors underline underline-offset-4 decoration-[#561269]/40 hover:decoration-[#561269]">Asesmen</Link></li>
              <li><Link href={"/psikotes" as any} className="text-gray-600 hover:text-[#561269] font-medium transition-colors underline underline-offset-4 decoration-[#561269]/40 hover:decoration-[#561269]">Psikotes</Link></li>
              <li><Link href={"/event" as any} className="text-gray-600 hover:text-[#561269] font-medium transition-colors underline underline-offset-4 decoration-[#561269]/40 hover:decoration-[#561269]">Event</Link></li>
            </ul>
          </div>

          {/* Links - Bantuan & Kontak */}
          <div className="space-y-5">
            <h4 className="font-bold text-[#3B074B] text-lg tracking-wide">Hubungi Kami</h4>
            
            <div className="space-y-4 pt-1">
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-[#561269]/70" />
                <span className="text-sm font-medium whitespace-pre-line">{contact.alamat}</span>
              </div>
              <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-gray-600 hover:text-[#561269] transition-colors group">
                <Mail className="w-5 h-5 shrink-0 text-[#561269]/70 group-hover:text-[#561269]" />
                <span className="text-sm font-medium">{contact.email}</span>
              </a>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-[#561269] transition-colors group">
                <Phone className="w-5 h-5 shrink-0 text-[#561269]/70 group-hover:text-[#561269]" />
                <span className="text-sm font-medium">{contact.noTelepon}</span>
              </a>
            </div>
          </div>


        </div>

        {/* Bottom */}
        <div className="border-t border-[#dccddd] pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 font-medium text-sm text-center md:text-left">
            Copyright &copy; 2026 Empathika. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <Link href={"/privacy-policy" as any} className="text-sm font-medium text-gray-500 hover:text-[#561269] transition-colors">Privacy Policy</Link>
            <Link href={"/terms-conditions" as any} className="text-sm font-medium text-gray-500 hover:text-[#561269] transition-colors">Terms & Conditions</Link>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/60 text-[#561269] hover:bg-white hover:shadow-sm hover:-translate-y-0.5 transition-all" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/60 text-[#561269] hover:bg-white hover:shadow-sm hover:-translate-y-0.5 transition-all" aria-label="TikTok">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/60 text-[#561269] hover:bg-white hover:shadow-sm hover:-translate-y-0.5 transition-all" aria-label="LinkedIn">
              <span className="font-bold text-lg font-sans -tracking-wide">in</span>
            </a>
            <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/60 text-[#561269] hover:bg-white hover:shadow-sm hover:-translate-y-0.5 transition-all" aria-label="YouTube">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
