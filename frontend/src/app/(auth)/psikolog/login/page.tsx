import { redirect } from "next/navigation";

// Halaman login psikolog terpisah sudah dihapus.
// Semua login dilakukan melalui satu halaman: /login
export default function PsikologLoginRedirectPage() {
  redirect("/login");
}
