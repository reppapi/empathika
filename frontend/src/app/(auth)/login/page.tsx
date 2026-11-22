import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/SharedLoginForm";

async function getEmpathikaPublicProfile() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`${apiUrl}/admin/profile/public`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      return json?.data || null;
    }
  } catch {
    // Fallback jika backend offline / timeout
  }
  return null;
}

export default async function LoginPage() {
  const profile = await getEmpathikaPublicProfile();
  const initialFoto = profile?.foto || null;

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginForm initialEmpathikaFoto={initialFoto} />
    </Suspense>
  );
}
