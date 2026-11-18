import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { headers, cookies } from "next/headers"
import "./globals.css"
import { QueryProvider } from "@/providers/QueryProvider"
import { AuthProvider } from "@/providers/AuthProvider"
import { TenantProvider } from "@/context/TenantContext"
import { NavigationProgressBar } from "@/components/shared/NavigationProgressBar"
import type { PublicBiroProfile } from "@/services/biro.service"

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Empathika - Platform Kesehatan Mental",
  description: "Konsultasi psikologi, psikotes, dan layanan kesehatan mental profesional.",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const cookieStore = cookies()

  const biroSlug = headersList.get("x-biro-slug") || null
  let biroThemeColor = headersList.get("x-biro-theme-color") || null
  let initialProfile: PublicBiroProfile | null = null

  if (biroSlug) {
    const cookieColor = cookieStore.get(`biro_theme_${biroSlug}`)?.value
    if (cookieColor) {
      biroThemeColor = decodeURIComponent(cookieColor)
    }

    // Ambil profil biro langsung dari backend saat SSR dengan cache: "no-store",
    // sehingga saat nama/profil diubah di database, HTML SSR langsung ter-render dengan nama biro terbaru
    // dan tidak ada jeda menampilkan slug biro (misal: "BIRO-NISCAN").
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1200)

      const res = await fetch(`${apiUrl}/biro/public/${encodeURIComponent(biroSlug)}`, {
        signal: controller.signal,
        cache: "no-store",
      })
      clearTimeout(timeoutId)

      if (res.ok) {
        const json = await res.json()
        if (json?.data) {
          initialProfile = json.data
          if (json.data.warna_tema) {
            biroThemeColor = json.data.warna_tema
          }
        }
      }
    } catch {
      // Fallback aman jika backend tidak merespons dalam 1.2 detik
    }
  }

  // Anti-flicker inline script: dieksekusi oleh browser di <head> sebelum rendering body.
  // Memastikan jika warna tersimpan di localStorage / cookie / admin, langsung terpasang ke <html>.
  const antiFlickerScript = `(function() {
  try {
    var hostname = window.location.hostname.toLowerCase();
    var slug = null;
    if (window.location.search) {
      var params = new URLSearchParams(window.location.search);
      slug = params.get('biro') || params.get('tenant');
    }
    if (!slug) {
      if (hostname.endsWith('.localhost')) {
        var parts = hostname.replace(/\\.localhost$/, '').split('.');
        var sub = parts[parts.length - 1];
        if (sub && sub !== 'www') slug = sub;
      } else if (hostname.endsWith('.lvh.me')) {
        var parts = hostname.replace(/\\.lvh.me$/, '').split('.');
        var sub = parts[parts.length - 1];
        if (sub && sub !== 'www') slug = sub;
      } else {
        var parts = hostname.split('.');
        if (parts.length > 2 && parts[0] !== 'www') {
          slug = parts[0];
        }
      }
    }

    if (slug) {
      var cachedColor = null;
      try {
        cachedColor = localStorage.getItem('biro_theme_' + slug);
      } catch(e) {}

      if (!cachedColor) {
        var match = document.cookie.match(new RegExp('(?:^|; )biro_theme_' + slug + '=([^;]*)'));
        if (match) cachedColor = decodeURIComponent(match[1]);
      }

      if (cachedColor) {
        document.documentElement.style.setProperty('--biro-theme-color', cachedColor);
        document.documentElement.setAttribute('data-biro-theme', 'true');
      }
    } else if (window.location.pathname.startsWith('/admin-biro')) {
      try {
        var adminColor = localStorage.getItem('biro_theme_color');
        if (adminColor) {
          document.documentElement.style.setProperty('--biro-theme-color', adminColor);
          document.documentElement.setAttribute('data-biro-theme', 'true');
        }
      } catch(e) {}
    }
  } catch(e) {}
})();`

  return (
    <html
      lang="id"
      data-biro-theme={biroThemeColor ? "true" : undefined}
      style={biroThemeColor ? ({ "--biro-theme-color": biroThemeColor } as React.CSSProperties) : undefined}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: antiFlickerScript }} />
      </head>
      <body className={`${poppins.className} ${poppins.variable} antialiased bg-gray-50`} suppressHydrationWarning>
        <NavigationProgressBar />
        <QueryProvider>
          <AuthProvider>
            <TenantProvider
              initialSlug={biroSlug}
              initialThemeColor={biroThemeColor}
              initialProfile={initialProfile}
            >
              {children}
            </TenantProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

