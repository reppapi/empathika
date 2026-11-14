import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/providers/QueryProvider"
import { AuthProvider } from "@/providers/AuthProvider"
import { TenantProvider } from "@/context/TenantContext"
import { NavigationProgressBar } from "@/components/shared/NavigationProgressBar"

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${poppins.className} ${poppins.variable} antialiased bg-gray-50`} suppressHydrationWarning>
        <NavigationProgressBar />
        <QueryProvider>
          <AuthProvider>
            <TenantProvider>{children}</TenantProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

