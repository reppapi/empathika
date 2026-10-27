import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/SharedLoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginForm />
    </Suspense>
  );
}
