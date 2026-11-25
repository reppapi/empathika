import { Suspense } from "react";
import { headers } from "next/headers";
import { LoginForm } from "@/features/auth/components/SharedLoginForm";

function extractSubdomainSlug(host: string | null): string | null {
  if (!host) return null;
  const hostname = host.split(":")[0].toLowerCase();
  if (hostname.endsWith(".localhost")) {
    const parts = hostname.replace(/\.localhost$/, "").split(".");
    const sub = parts[parts.length - 1];
    if (sub && sub !== "www") return sub;
    return null;
  }
  if (hostname.endsWith(".lvh.me")) {
    const parts = hostname.replace(/\.lvh.me$/, "").split(".");
    const sub = parts[parts.length - 1];
    if (sub && sub !== "www") return sub;
    return null;
  }
  const parts = hostname.split(".");
  if (parts.length > 2) {
    const sub = parts[0];
    if (sub && sub !== "www") return sub;
  }
  return null;
}

async function getBiroPublicProfile(apiUrl: string, slug: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${apiUrl}/biro/public/${slug}`, {
      signal: controller.signal,
      next: { revalidate: 60 },
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      return json?.data || json || null;
    }
  } catch {}
  return null;
}

async function getEmpathikaPublicProfile(apiUrl: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${apiUrl}/admin/profile/public`, {
      signal: controller.signal,
      next: { revalidate: 60 },
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      return json?.data || null;
    }
  } catch {}
  return null;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { biro?: string; tenant?: string };
}) {
  const headersList = headers();
  const host = headersList.get("host");
  const biroSlugFromHeader = headersList.get("x-biro-slug") || headersList.get("x-tenant-slug");
  const slug =
    searchParams?.biro?.toLowerCase().trim() ||
    searchParams?.tenant?.toLowerCase().trim() ||
    biroSlugFromHeader ||
    extractSubdomainSlug(host);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  let initialBiroProfile = null;
  let initialEmpathikaFoto = null;

  if (slug) {
    initialBiroProfile = await getBiroPublicProfile(apiUrl, slug);
  } else {
    const adminProfile = await getEmpathikaPublicProfile(apiUrl);
    initialEmpathikaFoto = adminProfile?.foto || null;
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginForm
        initialBiroProfile={initialBiroProfile}
        initialEmpathikaFoto={initialEmpathikaFoto}
        initialSlug={slug || null}
      />
    </Suspense>
  );
}
