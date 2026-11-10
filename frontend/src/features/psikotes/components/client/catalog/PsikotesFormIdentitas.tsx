"use client";

import React, { useState } from "react";
import { AlertCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { formatToIndonesianPhone } from "@/components/shared/checkout/FormDataPeserta";

export interface IdentityData {
  nama: string;
  noTelepon: string;
  tempatLahir: string;
  tanggalLahir: string;
  status: string;
  umur: string;
  jenisKelamin: string;
  pekerjaan: string;
  pendidikan: string;
}

export interface PsikotesFormIdentitasProps {
  data: IdentityData;
  onChange: React.Dispatch<React.SetStateAction<IdentityData>>;
  onComplete: () => void;
}

export default function PsikotesFormIdentitas({
  data,
  onChange,
  onComplete,
}: PsikotesFormIdentitasProps) {
  const [identityError, setIdentityError] = useState<string | null>(null);

  // Kalkulasi umur otomatis berdasarkan tanggal lahir yang dipilih
  const handleTanggalLahirChange = (val: string) => {
    let nextUmur = data.umur;
    if (val) {
      const birthDate = new Date(val);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        if (calculatedAge > 0 && calculatedAge < 120) {
          nextUmur = String(calculatedAge);
        }
      }
    }
    onChange((prev) => ({
      ...prev,
      tanggalLahir: val,
      umur: nextUmur,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIdentityError(null);

    const nama = data.nama.trim();
    const noTelepon = data.noTelepon.trim();
    const tempatLahir = data.tempatLahir.trim();
    const tanggalLahir = data.tanggalLahir.trim();
    const status = data.status.trim();
    const umur = data.umur.trim();
    const jenisKelamin = data.jenisKelamin.trim();
    const pekerjaan = data.pekerjaan.trim();
    const pendidikan = data.pendidikan.trim();

    if (!nama) {
      setIdentityError("Nama lengkap wajib diisi.");
      return;
    }
    if (!noTelepon) {
      setIdentityError("Nomor WhatsApp peserta wajib diisi.");
      return;
    }
    const cleanDigits = noTelepon.replace(/\D/g, "");
    const local = cleanDigits.startsWith("62") ? cleanDigits.slice(2) : cleanDigits;
    if (!local.startsWith("8") || local.length < 9) {
      setIdentityError("Nomor WhatsApp tidak valid (minimal 10 digit, diawali angka 8).");
      return;
    }
    if (local.length > 13) {
      setIdentityError("Nomor WhatsApp terlalu panjang (maksimal 14 digit angka).");
      return;
    }
    if (!tempatLahir) {
      setIdentityError("Tempat lahir wajib diisi.");
      return;
    }
    if (!tanggalLahir) {
      setIdentityError("Tanggal lahir wajib diisi.");
      return;
    }
    if (!status) {
      setIdentityError("Status pernikahan wajib dipilih.");
      return;
    }
    if (!umur || isNaN(Number(umur)) || Number(umur) < 5 || Number(umur) > 120) {
      setIdentityError("Umur wajib diisi dengan angka yang valid (5 - 120 tahun).");
      return;
    }
    if (!jenisKelamin) {
      setIdentityError("Jenis kelamin wajib dipilih.");
      return;
    }
    if (!pekerjaan) {
      setIdentityError("Pekerjaan wajib diisi (misal: Mahasiswa, Karyawan, Wiraswasta, dsb).");
      return;
    }
    if (!pendidikan) {
      setIdentityError("Pendidikan terakhir wajib dipilih.");
      return;
    }

    try {
      localStorage.setItem(
        "empathika_peserta_psikotes",
        JSON.stringify({
          nama,
          noTelepon,
          no_telepon: noTelepon,
          whatsapp: noTelepon,
          tempatLahir,
          tanggalLahir,
          status,
          umur: Number(umur),
          jenisKelamin,
          pekerjaan,
          pendidikan,
        })
      );
    } catch {}

    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#fbfbfb] font-sans pt-20 sm:pt-24 lg:pt-28 pb-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-[720px] w-full mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-9 shadow-sm border border-gray-100">
          {/* Header Form Tanpa Icon */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Data Identitas Peserta
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-lg mx-auto leading-relaxed">
              Silakan lengkapi data diri Anda sebelum memulai tes. Data ini akan dicantumkan pada tabel peserta dan laporan hasil resmi asesmen.
            </p>
          </div>

          {/* Error Feedback */}
          {identityError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50/90 border border-red-200 flex items-start gap-3 text-red-700 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span className="text-xs sm:text-sm font-medium leading-relaxed">{identityError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Grid 2 Kolom: Nama Lengkap & Nomor WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={data.nama}
                  onChange={(e) => onChange((prev) => ({ ...prev, nama: e.target.value }))}
                  placeholder="Contoh: Budi Pratama"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#561269] focus:ring-2 focus:ring-[#561269]/15 transition font-medium text-gray-800 placeholder:text-gray-400"
                />
              </div>

              {/* Nomor WhatsApp Peserta */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Nomor WhatsApp Peserta <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={data.noTelepon}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (!raw.trim() || raw.trim() === "+" || raw.trim() === "+6" || raw.trim() === "+62" || raw.trim() === "+62 ") {
                      onChange((prev) => ({ ...prev, noTelepon: "" }));
                      return;
                    }
                    onChange((prev) => ({ ...prev, noTelepon: formatToIndonesianPhone(raw) }));
                  }}
                  placeholder="+62 812-3456-7890"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#561269] focus:ring-2 focus:ring-[#561269]/15 transition font-medium text-gray-800 placeholder:text-gray-400 font-mono"
                />
              </div>
            </div>

            {/* Grid 2 Kolom: Tempat Lahir & Tanggal Lahir */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tempat Lahir */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Tempat Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={data.tempatLahir}
                  onChange={(e) => onChange((prev) => ({ ...prev, tempatLahir: e.target.value }))}
                  placeholder="Contoh: Jakarta"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#561269] focus:ring-2 focus:ring-[#561269]/15 transition font-medium text-gray-800 placeholder:text-gray-400"
                />
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={data.tanggalLahir}
                  onChange={(e) => handleTanggalLahirChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#561269] focus:ring-2 focus:ring-[#561269]/15 transition font-medium text-gray-800 bg-white"
                />
              </div>
            </div>

            {/* Grid 2 Kolom: Jenis Kelamin & Umur */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Jenis Kelamin */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {["Laki-laki", "Perempuan"].map((gender) => {
                    const isSelected = data.jenisKelamin === gender;
                    return (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => onChange((prev) => ({ ...prev, jenisKelamin: gender }))}
                        className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
                          isSelected
                            ? "border-[#561269] bg-purple-50 text-[#561269] shadow-xs"
                            : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? "border-[#561269]" : "border-gray-300"}`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#561269]" />}
                        </span>
                        <span>{gender}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Umur */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Umur (Tahun) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={120}
                  value={data.umur}
                  onChange={(e) => onChange((prev) => ({ ...prev, umur: e.target.value }))}
                  placeholder="Contoh: 24"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#561269] focus:ring-2 focus:ring-[#561269]/15 transition font-medium text-gray-800 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Grid 2 Kolom: Status Pernikahan & Pendidikan Terakhir */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status Pernikahan */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Status Pernikahan <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={data.status}
                  onChange={(e) => onChange((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#561269] focus:ring-2 focus:ring-[#561269]/15 transition font-medium text-gray-800 bg-white"
                >
                  <option value="">Pilih Status Pernikahan</option>
                  <option value="Belum Menikah">Belum Menikah</option>
                  <option value="Menikah">Menikah</option>
                  <option value="Cerai Hidup">Cerai Hidup</option>
                  <option value="Cerai Mati">Cerai Mati</option>
                </select>
              </div>

              {/* Pendidikan Terakhir */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Pendidikan Terakhir <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={data.pendidikan}
                  onChange={(e) => onChange((prev) => ({ ...prev, pendidikan: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#561269] focus:ring-2 focus:ring-[#561269]/15 transition font-medium text-gray-800 bg-white"
                >
                  <option value="">Pilih Pendidikan Terakhir</option>
                  <option value="SD / Sederajat">SD / Sederajat</option>
                  <option value="SMP / Sederajat">SMP / Sederajat</option>
                  <option value="SMA / SMK / Sederajat">SMA / SMK / Sederajat</option>
                  <option value="Diploma (D1 - D4)">Diploma (D1 - D4)</option>
                  <option value="Sarjana (S1)">Sarjana (S1)</option>
                  <option value="Magister (S2)">Magister (S2)</option>
                  <option value="Doktor (S3)">Doktor (S3)</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            {/* Pekerjaan */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Pekerjaan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={data.pekerjaan}
                onChange={(e) => onChange((prev) => ({ ...prev, pekerjaan: e.target.value }))}
                placeholder="Contoh: Karyawan Swasta / Mahasiswa / Wiraswasta"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#561269] focus:ring-2 focus:ring-[#561269]/15 transition font-medium text-gray-800 placeholder:text-gray-400"
              />
            </div>

            {/* Security / Privacy notice */}
            <div className="pt-1">
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Kerahasiaan data identitas Anda terlindungi sesuai standar etika asesmen psikologi klinis.</span>
              </div>
            </div>

            {/* Tombol Lanjut ke Tes */}
            <button
              type="submit"
              className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#561269] hover:bg-[#763E8B] text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Mulai Mengerjakan Tes</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

