"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Mail, Lock, ArrowRight } from "lucide-react";
import { DUMMY_ADMIN, DUMMY_PSIKOLOG, DUMMY_BIRO } from "../data/dummyAuth";
import { useAuthStore } from "@/store/authStore";

export function LoginForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setIsLoading(true);

    // Simulasi delay network
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Cek akun Admin Utama
    if (trimmedEmail === DUMMY_ADMIN.email && trimmedPassword === DUMMY_ADMIN.password) {
      document.cookie = "access_token=dummy-admin-token; path=/; max-age=86400";
      setAuth(
        { id: "1", name: "Admin Empathika", email: trimmedEmail, role: "ADMIN" },
        "dummy-admin-token"
      );
      router.push("/admin");
      router.refresh();
      return;
    }

    // Cek akun Psikolog
    if (trimmedEmail === DUMMY_PSIKOLOG.email && trimmedPassword === DUMMY_PSIKOLOG.password) {
      document.cookie = "access_token=dummy-psikolog-token; path=/; max-age=86400";
      setAuth(
        { id: "2", name: "Psikolog Empathika", email: trimmedEmail, role: "PSIKOLOG" },
        "dummy-psikolog-token"
      );
      router.push("/admin/psikolog-web");
      router.refresh();
      return;
    }

    // Cek akun Admin Biro (Read-only mitra)
    if (trimmedEmail === DUMMY_BIRO.email && trimmedPassword === DUMMY_BIRO.password) {
      document.cookie = "access_token=dummy-biro-token; path=/; max-age=86400";
      setAuth(
        { id: "3", name: "Admin Biro Cendekia Muda", email: trimmedEmail, role: "BIRO" },
        "dummy-biro-token"
      );
      router.push("/admin-biro/transaksi");
      router.refresh();
      return;
    }

    // Jika tidak cocok dengan akun manapun
    setIsLoading(false);
    setError("Email atau password yang Anda masukkan tidak sesuai.");
  };

  return (
    <div className="min-h-screen flex font-poppins selection:bg-[#561269]/20 selection:text-[#561269]">

      {/* ── Kiri: Form Login ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 bg-white">
        <div className="w-full max-w-md flex flex-col items-center">

          {/* Logo */}
          <div className="w-20 h-20 rounded-full bg-[#561269] shadow-md flex items-center justify-center mb-6">
            <span className="text-3xl font-bold text-white">E</span>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#561269] mb-3">
              Selamat Datang di<br />Empathika
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed px-4">
              Silakan masuk menggunakan akun Anda<br />untuk melanjutkan ke dashboard.
            </p>
          </div>



          <form onSubmit={handleSubmit} className="w-full space-y-5">

            {/* Error Message */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-800">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] transition-all disabled:bg-gray-50 disabled:text-gray-500 placeholder:text-gray-400 text-sm"
                  placeholder="Masukkan email Anda"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-800">Kata Sandi</label>
                <button type="button" className="text-xs font-bold text-[#561269] hover:text-[#360842] transition-colors">
                  Lupa Sandi?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-11 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] transition-all disabled:bg-gray-50 disabled:text-gray-500 placeholder:text-gray-400 text-sm"
                  placeholder="Masukkan kata sandi"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#561269] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-[#561269] bg-gray-100 border-gray-300 rounded focus:ring-[#561269]"
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                Ingat saya di perangkat ini
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-white font-bold bg-[#561269] hover:bg-[#460e56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#561269] disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="px-4 text-xs text-gray-400 font-medium">Or</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              className="w-full flex justify-center items-center gap-3 py-3.5 px-4 rounded-xl text-gray-700 font-bold bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Lanjutkan dengan Google
            </button>

          </form>
        </div>
      </div>

      {/* ── Kanan: Visual Empathika (Fluid Mesh Gradient) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1c0524] flex-col justify-end p-16 overflow-hidden rounded-l-[3rem] shadow-[-20px_0_50px_-15px_rgba(86,18,105,0.15)]">

        {/* --- Organic Mesh Gradient Blobs --- */}
        {/* Blob Atas Kiri */}
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-[100%] bg-[#701a8a] opacity-70 blur-[120px] pointer-events-none" />

        {/* Blob Bawah Kanan */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] rounded-[100%] bg-[#360842] opacity-90 blur-[100px] pointer-events-none" />

        {/* Blob Tengah (Aksen Terang) */}
        <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-[#a347c7] opacity-40 blur-[140px] pointer-events-none" />

        {/* Blob Bawah Kiri (Gelap) */}
        <div className="absolute bottom-[10%] left-[-20%] w-[70%] h-[70%] rounded-full bg-[#20042b] opacity-80 blur-[100px] pointer-events-none" />

        {/* Overlay Gradasi Gelap (Memberikan efek kedalaman/depth) */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#0a000d]/90 pointer-events-none mix-blend-multiply" />

        {/* Overlay Tekstur Noise Lembut */}
        <div
          className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Quote Card (Glassmorphism) */}
        <div className="relative z-10 w-full max-w-sm ml-auto bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/20">
          <div className="text-5xl text-white/30 font-serif leading-none mb-3">&ldquo;</div>
          <p className="text-white font-bold text-lg leading-relaxed mb-6">
            Setiap perjalanan penyembuhan dimulai dengan langkah kecil untuk memahami diri sendiri.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-white/40" />
            <span className="text-white/80 text-xs font-bold tracking-widest uppercase">Empathika Care</span>
          </div>
        </div>

      </div>
    </div>
  );
}