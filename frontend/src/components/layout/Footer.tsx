"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Mail, Phone } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { useTenantContext } from "@/context/TenantContext";

export function Footer() {
  const pathname = usePathname();
  const { isBiro, biroProfile, withBiro } = useTenantContext();
  const themeColor = isBiro && biroProfile?.warna_tema ? biroProfile.warna_tema : "#561269";

  const handleNavClick = (path: string) => {
    if (isBiro && path.includes("#")) {
      const hash = path.substring(path.indexOf("#"));
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else if (isBiro && (path === "" || path === "/")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const [contact, setContact] = useState({
    alamat: "Jl. Cikutra No.312, Neglasari\nKec. Cibeunying Kaler, Kota Bandung\nJawa Barat 41024",
    email: "empathika889@gmail.com",
    noTelepon: "0878-7878-5498",
    instagram: "https://www.instagram.com/empathika_psikologi?psln=dzgxaTNybnZhbmts",
    tiktok: "https://www.tiktok.com/@empathika_psikologi?_r=1&_t=ZS-9Aje7iAkpFZ",
    youtube: "",
    linkedin: "",
  });

  useEffect(() => {
    const loadProfileData = () => {
      // 1. Cek cache lokal agar instan
      try {
        const saved = localStorage.getItem("empathika_admin_profile");
        if (saved) {
          const parsed = JSON.parse(saved);
          setContact((prev) => ({
            alamat: parsed.alamat || prev.alamat,
            email: parsed.email || prev.email,
            noTelepon: parsed.noTelepon || parsed.no_telepon || prev.noTelepon,
            instagram: parsed.instagram || prev.instagram,
            tiktok: parsed.tiktok || prev.tiktok,
            youtube: parsed.youtube !== undefined ? parsed.youtube : prev.youtube,
            linkedin: parsed.linkedin !== undefined ? parsed.linkedin : prev.linkedin,
          }));
        }
      } catch {}

      // 2. Ambil data terbaru dari backend database (Publik)
      adminService
        .getPublicProfile()
        .then((res) => {
          if (res?.data) {
            setContact((prev) => ({
              alamat: res.data.alamat || prev.alamat,
              email: res.data.email || prev.email,
              noTelepon: res.data.no_telepon || res.data.noTelepon || prev.noTelepon,
              instagram: res.data.instagram || prev.instagram,
              tiktok: res.data.tiktok || prev.tiktok,
              youtube: res.data.youtube !== undefined ? res.data.youtube : prev.youtube,
              linkedin: res.data.linkedin !== undefined ? res.data.linkedin : prev.linkedin,
            }));
          }
        })
        .catch(() => {
          // Fallback ke default jika offline/error
        });
    };

    loadProfileData();

    window.addEventListener("storage", loadProfileData);
    window.addEventListener("focus", loadProfileData);

    return () => {
      window.removeEventListener("storage", loadProfileData);
      window.removeEventListener("focus", loadProfileData);
    };
  }, []);

  const cleanWa = contact.noTelepon ? contact.noTelepon.replace(/\D/g, "") : "";
  const waNumber = cleanWa.startsWith("0") ? "62" + cleanWa.slice(1) : cleanWa;
  const waUrl = waNumber ? `https://wa.me/${waNumber}` : "https://wa.me/6287878785498";

  const getValidUrl = (url?: string) => {
    if (!url || !url.trim()) return "#";
    const trimmed = url.trim();
    return trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;
  };

  const igUrl = getValidUrl(contact.instagram || "https://www.instagram.com/empathika_psikologi?psln=dzgxaTNybnZhbmts");
  const tiktokUrl = getValidUrl(contact.tiktok || "https://www.tiktok.com/@empathika_psikologi?_r=1&_t=ZS-9Aje7iAkpFZ");
  const linkedinUrl = getValidUrl(contact.linkedin);
  const ytUrl = getValidUrl(contact.youtube);

  return (
    <footer className="bg-[#EFE9F3] text-gray-800 pt-16 pb-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-8 lg:mb-12">
          
          {/* Brand & Description */}
          {/* Brand & Description */}
          <div className="lg:col-span-2 space-y-4 md:pr-8">
            <Link 
              href={withBiro("/") as any}
              className="inline-flex items-center gap-3"
            >
              {/* Logo (Circle) */}
              <div 
                className="h-14 w-14 shrink-0 rounded-full flex items-center justify-center text-white font-extrabold text-xl overflow-hidden shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                {biroProfile?.logoURI ? (
                  <img src={biroProfile.logoURI} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  (biroProfile?.nama_biro?.[0] || "E").toUpperCase()
                )}
              </div>
              <span 
                className="text-[22px] font-extrabold tracking-widest uppercase truncate"
                style={{ color: themeColor }}
              >
                {isBiro && biroProfile?.nama_biro ? biroProfile.nama_biro : "EMPATHIKA"}
              </span>
            </Link>
            <p className="text-gray-600 leading-relaxed font-medium">
              {isBiro && biroProfile?.deskripsi ? biroProfile.deskripsi : "Platform psikologi dan kesehatan mental."}
            </p>
            <p className="text-[#3B074B] font-semibold text-lg max-w-sm leading-snug">
              &quot;Menemani setiap langkahmu untuk memahami diri, bertumbuh, dan menjadi lebih baik.&quot;
            </p>
          </div>

          {/* Links - Empathika / Biro */}
          <div className="space-y-5">
            <h4 className="font-bold text-[#3B074B] text-lg tracking-wide">{isBiro ? "Tentang Biro" : "Empathika"}</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href={withBiro("/tentang-kami") as any}
                  className="text-gray-600 hover:text-[#561269] font-medium transition-colors underline underline-offset-4 decoration-[#561269]/40 hover:decoration-[#561269]"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link 
                  href={withBiro("/psikolog") as any}
                  className="text-gray-600 hover:text-[#561269] font-medium transition-colors underline underline-offset-4 decoration-[#561269]/40 hover:decoration-[#561269]"
                >
                  Psikolog
                </Link>
              </li>
              <li>
                <Link 
                  href={withBiro("/blog") as any}
                  className="text-gray-600 hover:text-[#561269] font-medium transition-colors underline underline-offset-4 decoration-[#561269]/40 hover:decoration-[#561269]"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href={withBiro("/kerja-sama") as any}
                  className="text-gray-600 hover:text-[#561269] font-medium transition-colors underline underline-offset-4 decoration-[#561269]/40 hover:decoration-[#561269]"
                >
                  Mitra Kerjasama
                </Link>
              </li>
            </ul>
          </div>

          {/* Links - Layanan */}
          <div className="space-y-5">
            <h4 className="font-bold text-[#3B074B] text-lg tracking-wide">Layanan</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href={withBiro("/konseling") as any}
                  className="text-gray-600 hover:text-[#561269] font-medium transition-colors underline underline-offset-4 decoration-[#561269]/40 hover:decoration-[#561269]"
                >
                  Konsultasi
                </Link>
              </li>
              <li>
                <Link 
                  href={withBiro("/layanan") as any}
                  className="text-gray-600 hover:text-[#561269] font-medium transition-colors underline underline-offset-4 decoration-[#561269]/40 hover:decoration-[#561269]"
                >
                  Asesmen
                </Link>
              </li>
              <li>
                <Link 
                  href={withBiro("/psikotes") as any}
                  className="text-gray-600 hover:text-[#561269] font-medium transition-colors underline underline-offset-4 decoration-[#561269]/40 hover:decoration-[#561269]"
                >
                  Psikotes
                </Link>
              </li>
              <li>
                <Link 
                  href={withBiro("/event") as any}
                  className="text-gray-600 hover:text-[#561269] font-medium transition-colors underline underline-offset-4 decoration-[#561269]/40 hover:decoration-[#561269]"
                >
                  Event
                </Link>
              </li>
            </ul>
          </div>

          {/* Links - Bantuan & Kontak */}
          <div className="space-y-5">
            <h4 className="font-bold text-[#3B074B] text-lg tracking-wide">Hubungi Kami</h4>
            
            <div className="space-y-4 pt-1">
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-[#561269]/70" />
                <span className="text-sm font-medium whitespace-pre-line">
                  {isBiro && biroProfile?.alamat ? biroProfile.alamat : contact.alamat}
                </span>
              </div>
              <a 
                href={`mailto:${isBiro && biroProfile?.owner?.email ? biroProfile.owner.email : contact.email}`} 
                className="flex items-center gap-3 text-gray-600 hover:text-[#561269] transition-colors group"
              >
                <Mail className="w-5 h-5 shrink-0 text-[#561269]/70 group-hover:text-[#561269]" />
                <span className="text-sm font-medium">
                  {isBiro && biroProfile?.owner?.email ? biroProfile.owner.email : contact.email}
                </span>
              </a>
              <a 
                href={`https://wa.me/${(isBiro && biroProfile?.no_telepon ? biroProfile.no_telepon : waNumber).replace(/\D/g, "")}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 text-gray-600 hover:text-[#561269] transition-colors group"
              >
                <Phone className="w-5 h-5 shrink-0 text-[#561269]/70 group-hover:text-[#561269]" />
                <span className="text-sm font-medium">
                  {isBiro && biroProfile?.no_telepon ? biroProfile.no_telepon : contact.noTelepon}
                </span>
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
            <Link 
              href={withBiro("/privacy-policy") as any}
              className="text-sm font-medium text-gray-500 hover:text-[#561269] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href={withBiro("/terms-conditions") as any}
              className="text-sm font-medium text-gray-500 hover:text-[#561269] transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={igUrl}
              target={igUrl !== "#" ? "_blank" : undefined}
              rel={igUrl !== "#" ? "noopener noreferrer" : undefined}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/60 text-[#561269] hover:bg-white hover:shadow-sm hover:-translate-y-0.5 transition-all"
              aria-label="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a
              href={tiktokUrl}
              target={tiktokUrl !== "#" ? "_blank" : undefined}
              rel={tiktokUrl !== "#" ? "noopener noreferrer" : undefined}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/60 text-[#561269] hover:bg-white hover:shadow-sm hover:-translate-y-0.5 transition-all"
              aria-label="TikTok"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            <a
              href={linkedinUrl}
              target={linkedinUrl !== "#" ? "_blank" : undefined}
              rel={linkedinUrl !== "#" ? "noopener noreferrer" : undefined}
              className={`w-9 h-9 flex items-center justify-center rounded-full bg-white/60 text-[#561269] hover:bg-white hover:shadow-sm hover:-translate-y-0.5 transition-all ${
                linkedinUrl === "#" ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-label="LinkedIn"
            >
              <span className="font-bold text-lg font-sans -tracking-wide">in</span>
            </a>
            <a
              href={ytUrl}
              target={ytUrl !== "#" ? "_blank" : undefined}
              rel={ytUrl !== "#" ? "noopener noreferrer" : undefined}
              className={`w-9 h-9 flex items-center justify-center rounded-full bg-white/60 text-[#561269] hover:bg-white hover:shadow-sm hover:-translate-y-0.5 transition-all ${
                ytUrl === "#" ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-label="YouTube"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
