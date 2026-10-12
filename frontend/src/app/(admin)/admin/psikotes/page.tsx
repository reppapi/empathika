/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Users, FileText, Database, Search, Filter, Eye, Download, Plus, Edit, Trash2, Settings, X, CheckCircle, Clock, ChevronLeft, Save, Upload, List, Hash, AlignLeft, BarChart2 } from "lucide-react";
import { ActionButtonDetail, ActionButtonEdit, ActionButtonDelete } from "@/components/shared/TableActionButtons";

type SoalOption = { text: string; bobot: string };
type Soal = { id: number; tipe: string; teks: string; pilihan: SoalOption[] };
type Tip = { title: string; desc: string };
type Interpretasi = { id: number; min: string; max: string; judul: string; kategori: string; deskripsi: string; makna: string; saran: Tip[] };
type PaketData = {
  id: number;
  nama: string;
  kategori: string;
  deskripsi: string;
  waktu: string;
  jenisAkses: string;
  harga: string;
  status: string;
  jumlahSoal: number;
};

export default function AdminPsikotesPage() {
  const [activeTab, setActiveTab] = useState<"peserta" | "paket" | "form-paket" | null>(null);
  const [formTab, setFormTab] = useState<"info" | "soal" | "preview" | "interpretasi">("info");
  const [isEditing, setIsEditing] = useState(false);
  const [aksesFilter, setAksesFilter] = useState<"Semua" | "Gratis" | "Berbayar">("Semua");
  const [selectedPeserta, setSelectedPeserta] = useState<any | null>(null);

  // Form State
  const [paketData, setPaketData] = useState<PaketData>({
    id: 0,
    nama: "",
    kategori: "Kepribadian",
    deskripsi: "",
    waktu: "",
    jenisAkses: "Gratis",
    harga: "",
    status: "Aktif",
    jumlahSoal: 0,
  });

  const [soalList, setSoalList] = useState<Soal[]>([]);
  const [activeSoalId, setActiveSoalId] = useState<number>(Date.now());
  const [currentSoal, setCurrentSoal] = useState<Soal>({ id: activeSoalId, tipe: "Pilihan Ganda", teks: "", pilihan: [{ text: "", bobot: "0" }, { text: "", bobot: "0" }] });
  const [interpretasiList, setInterpretasiList] = useState<Interpretasi[]>([
    { id: Date.now(), min: "", max: "", judul: "", kategori: "", deskripsi: "", makna: "", saran: [{ title: "", desc: "" }] }
  ]);

  // Mock data untuk Daftar Peserta
  const pesertaList = [
    { id: 1, nama: "Budi Santoso", noHp: "081234567890", paket: "Tes Kepribadian (MBTI)", tanggal: "08 Okt 2026", status: "Selesai", skor: "Tipe: INTJ", jenisAkses: "Gratis" },
    { id: 2, nama: "Siti Aminah", noHp: "081298765432", paket: "Tes Minat Karier", tanggal: "07 Okt 2026", status: "Selesai", skor: "Kuat di Analitis", jenisAkses: "Berbayar" },
    { id: 3, nama: "Andi Saputra", noHp: "085612341234", paket: "Tes Tingkat Stres", tanggal: "07 Okt 2026", status: "Berjalan", skor: "-", jenisAkses: "Gratis" },
    { id: 4, nama: "Rina Wijaya", noHp: "081122334455", paket: "Tes Kecerdasan Emosional", tanggal: "06 Okt 2026", status: "Selesai", skor: "EQ: 120", jenisAkses: "Berbayar" },
  ];

  // Mock data untuk Kelola Paket
  const [paketList, setPaketList] = useState([
    { id: 1, nama: "Tes Kepribadian (MBTI)", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=100&h=100", kategori: "Kepribadian", harga: "Rp 50.000", jumlahSoal: 60, waktu: "30 Menit", status: "Aktif" },
    { id: 2, nama: "Tes Minat Karier", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=100&h=100", kategori: "Karier", harga: "Rp 75.000", jumlahSoal: 45, waktu: "45 Menit", status: "Aktif" },
    { id: 3, nama: "Tes Tingkat Stres", image: "https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&q=80&w=100&h=100", kategori: "Klinis", harga: "Gratis", jumlahSoal: 20, waktu: "15 Menit", status: "Aktif" },
  ]);

  const [searchPaket, setSearchPaket] = useState("");

  const filteredPeserta = pesertaList.filter((peserta) => {
    if (aksesFilter === "Semua") return true;
    return peserta.jenisAkses === aksesFilter;
  });

  const filteredPaket = paketList.filter(paket => 
    paket.nama.toLowerCase().includes(searchPaket.toLowerCase()) || 
    paket.kategori.toLowerCase().includes(searchPaket.toLowerCase())
  );

  const openForm = (paketToEdit?: any) => {
    setActiveTab("form-paket");
    setFormTab("info");
    if (paketToEdit) {
      setIsEditing(true);
      setPaketData({
        id: paketToEdit.id,
        nama: paketToEdit.nama,
        kategori: paketToEdit.kategori,
        deskripsi: "Deskripsi paket " + paketToEdit.nama,
        waktu: paketToEdit.waktu.replace(" Menit", ""),
        harga: paketToEdit.harga === "Gratis" || paketToEdit.harga === "Rp 0" ? "" : paketToEdit.harga.replace(/[^0-9]/g, ""),
        jenisAkses: paketToEdit.harga === "Gratis" || paketToEdit.harga === "Rp 0" ? "Gratis" : "Berbayar",
        status: paketToEdit.status,
        jumlahSoal: paketToEdit.jumlahSoal
      });
      
      const editSoal = [{ id: Date.now(), tipe: "Pilihan Ganda", teks: "Soal contoh edit", pilihan: [{ text: "Ya", bobot: "1" }, { text: "Tidak", bobot: "0" }] }];
      setSoalList(editSoal);
      setActiveSoalId(editSoal[0].id);
      setCurrentSoal(editSoal[0]);
      setInterpretasiList([{ id: Date.now(), min: "0", max: "100", judul: "Hasil Normal", kategori: "Kategori A", deskripsi: "Kondisi umum", makna: "Anda dalam keadaan baik.", saran: [{ title: "Tetap Tenang", desc: "Pertahankan kebiasaan baik." }] }]);
    } else {
      setIsEditing(false);
      setPaketData({ id: 0, nama: "", kategori: "Kepribadian", deskripsi: "", waktu: "", jenisAkses: "Gratis", harga: "", status: "Aktif", jumlahSoal: 0 });
      setSoalList([]);
      const newId = Date.now();
      setActiveSoalId(newId);
      setCurrentSoal({ id: newId, tipe: "Pilihan Ganda", teks: "", pilihan: [{ text: "", bobot: "0" }, { text: "", bobot: "0" }] });
      setInterpretasiList([{ id: Date.now(), min: "", max: "", judul: "", kategori: "", deskripsi: "", makna: "", saran: [{ title: "", desc: "" }] }]);
    }
  };

  const validateInfo = () => {
    return true; // Bypass validasi untuk keperluan demo UI
  };

  const handleNextToSoal = () => {
    if (validateInfo()) {
      setFormTab("soal");
    }
  };

  const handleSimpanSoal = () => {
    if (!currentSoal.teks) {
      alert("Teks pertanyaan tidak boleh kosong.");
      return;
    }
    const emptyPilihan = currentSoal.pilihan.find(p => p.text.trim() === "");
    if (emptyPilihan) {
      alert("Harap lengkapi teks semua pilihan jawaban.");
      return;
    }
    
    setSoalList(prev => {
      const idx = prev.findIndex(s => s.id === currentSoal.id);
      if (idx >= 0) {
        const nextList = [...prev];
        nextList[idx] = currentSoal;
        return nextList;
      } else {
        return [...prev, currentSoal];
      }
    });
    alert("Soal berhasil disimpan sementara.");
  };

  const handleBuatSoalBaru = () => {
    const newId = Date.now();
    setActiveSoalId(newId);
    setCurrentSoal({ id: newId, tipe: "Pilihan Ganda", teks: "", pilihan: [{ text: "", bobot: "0" }, { text: "", bobot: "0" }] });
  };

  const selectSoal = (s: Soal) => {
    setActiveSoalId(s.id);
    setCurrentSoal(s);
  };
  const handleNextToPreview = () => {
    setFormTab("preview");
  };
  
  const handleNextToInterpretasi = () => {
    setFormTab("interpretasi"); // Bypass validasi untuk keperluan demo UI
  };

  const addPilihan = () => {
    setCurrentSoal(prev => ({
      ...prev,
      pilihan: [...prev.pilihan, { text: "", bobot: "0" }]
    }));
  };

  const updatePilihan = (index: number, key: 'text'|'bobot', val: string) => {
    setCurrentSoal(prev => {
      const p = [...prev.pilihan];
      p[index] = { ...p[index], [key]: val };
      return { ...prev, pilihan: p };
    });
  };

  const removePilihan = (index: number) => {
    if (currentSoal.pilihan.length <= 2) {
      alert("Minimal harus ada 2 pilihan jawaban.");
      return;
    }
    setCurrentSoal(prev => ({
      ...prev,
      pilihan: prev.pilihan.filter((_, i) => i !== index)
    }));
  };

  const deleteSoal = (id: number) => {
    if (confirm("Yakin ingin menghapus soal ini dari daftar?")) {
      const newList = soalList.filter(s => s.id !== id);
      setSoalList(newList);
      if (currentSoal.id === id) {
        if (newList.length > 0) {
          selectSoal(newList[0]);
        } else {
          handleBuatSoalBaru();
        }
      }
    }
  };

  const addInterpretasi = () => {
    setInterpretasiList(prev => [...prev, { id: Date.now(), min: "", max: "", judul: "", kategori: "", deskripsi: "", makna: "", saran: [{ title: "", desc: "" }] }]);
  };

  const updateInterpretasi = (id: number, key: keyof Interpretasi, val: string) => {
    setInterpretasiList(prev => prev.map(item => item.id === id ? { ...item, [key]: val } : item));
  };

  const addSaran = (interpretasiId: number) => {
    setInterpretasiList(prev => prev.map(item => {
      if (item.id === interpretasiId) {
        return { ...item, saran: [...item.saran, { title: "", desc: "" }] };
      }
      return item;
    }));
  };

  const updateSaran = (interpretasiId: number, saranIndex: number, key: 'title' | 'desc', val: string) => {
    setInterpretasiList(prev => prev.map(item => {
      if (item.id === interpretasiId) {
        const newSaran = [...item.saran];
        newSaran[saranIndex] = { ...newSaran[saranIndex], [key]: val };
        return { ...item, saran: newSaran };
      }
      return item;
    }));
  };

  const removeSaran = (interpretasiId: number, saranIndex: number) => {
    setInterpretasiList(prev => prev.map(item => {
      if (item.id === interpretasiId) {
        return { ...item, saran: item.saran.filter((_, i) => i !== saranIndex) };
      }
      return item;
    }));
  };

  const removeInterpretasi = (id: number) => {
    if (interpretasiList.length <= 1) {
      alert("Minimal harus ada 1 interpretasi.");
      return;
    }
    if (confirm("Hapus kategori interpretasi ini?")) {
      setInterpretasiList(prev => prev.filter(item => item.id !== id));
    }
  };

  const simpanPaketLengkap = () => {
    alert("Paket berhasil disimpan (Simulasi UI Saja)!");
    setActiveTab("paket");
  };

  const handleDeletePaket = (id: number) => {
    alert("Hapus paket psikotes ditiadakan (Simulasi UI Saja).");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      {activeTab !== "form-paket" && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Psikotes</h1>
          <p className="text-gray-500 mt-1">Kelola data peserta, paket soal, dan bank soal psikotes.</p>
        </div>
      )}

      {/* Cards Navigation */}
      {activeTab !== "form-paket" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card: Daftar Peserta */}
          <div 
            onClick={() => setActiveTab("peserta")}
            className={`bg-white p-6 rounded-xl border shadow-sm transition-all cursor-pointer group flex flex-col h-full ${activeTab === 'peserta' ? 'border-[#561269] ring-1 ring-[#561269]' : 'border-gray-100 hover:border-[#561269]/30 hover:shadow-md'}`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${activeTab === 'peserta' ? 'bg-[#561269] text-white' : 'bg-[#561269]/10 text-[#561269]'}`}>
              <Users className="w-6 h-6" />
            </div>
            <h3 className={`font-semibold text-lg transition-colors ${activeTab === 'peserta' ? 'text-[#561269]' : 'text-gray-800 group-hover:text-[#561269]'}`}>Data Peserta & Hasil Tes</h3>
            <p className="text-sm text-gray-500 mt-2 flex-grow">Lihat riwayat pengerjaan dan hasil psikotes peserta.</p>
          </div>

          {/* Card: Kelola Paket Psikotes */}
          <div 
            onClick={() => setActiveTab("paket")}
            className={`bg-white p-6 rounded-xl border shadow-sm transition-all cursor-pointer group flex flex-col h-full ${activeTab === 'paket' ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-100 hover:border-blue-500/30 hover:shadow-md'}`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${activeTab === 'paket' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
              <FileText className="w-6 h-6" />
            </div>
            <h3 className={`font-semibold text-lg transition-colors ${activeTab === 'paket' ? 'text-blue-600' : 'text-gray-800 group-hover:text-blue-600'}`}>Kelola Psikotes</h3>
            <p className="text-sm text-gray-500 mt-2 flex-grow">Atur paket psikotes, soal, dan interpretasi hasil dalam satu tempat.</p>
          </div>
        </div>
      )}

      {/* --- CONTENT SECTION --- */}
      
      {/* 1. Placeholder (Jika belum ada yang diklik) */}
      {!activeTab && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-medium text-gray-700 mb-2">Pilih Menu Manajemen</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Silakan klik salah satu kartu di atas untuk menampilkan data daftar peserta, pengaturan paket, atau bank soal.
          </p>
        </div>
      )}

      {/* 2. Daftar Peserta Section */}
      {activeTab === "peserta" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col mb-6 gap-3">
            <h2 className="text-xl font-bold text-gray-800">Daftar Peserta Psikotes</h2>
            <div className="flex bg-gray-100 p-1 rounded-lg w-max">
              {(['Semua', 'Gratis', 'Berbayar'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setAksesFilter(filter)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    aksesFilter === filter
                      ? 'bg-white text-[#561269] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Peserta</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paket Tes</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Akses</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPeserta.length > 0 ? (
                    filteredPeserta.map((peserta) => (
                      <tr key={peserta.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800">{peserta.nama}</span>
                            <span className="text-sm text-gray-500">{peserta.noHp}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">{peserta.paket}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            peserta.jenisAkses === 'Gratis' ? 'bg-gray-50 text-gray-600 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {peserta.jenisAkses}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{peserta.tanggal}</td>
                        <td className="px-6 py-4 text-center">
                          <ActionButtonDetail
                            onClick={() => setSelectedPeserta(peserta)}
                            title="Lihat Detail"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 bg-gray-50/30">
                        <div className="flex flex-col items-center justify-center">
                          <Filter className="w-8 h-8 text-gray-300 mb-3" />
                          <p>Belum ada data pengerjaan untuk kategori ini.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Kelola Paket Section */}
      {activeTab === "paket" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-800">Kelola Psikotes</h2>
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari paket tes..." 
                  value={searchPaket}
                  onChange={(e) => setSearchPaket(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] text-sm"
                />
              </div>
              <button 
                onClick={() => openForm()}
                className="flex items-center gap-2 px-4 py-2 bg-[#561269] text-white rounded-lg hover:bg-[#561269]/90 text-sm font-medium whitespace-nowrap shadow-sm"
              >
                <Plus className="w-4 h-4" /> Tambah Paket
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Paket</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Harga</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Jml. Soal</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPaket.length > 0 ? filteredPaket.map((paket) => (
                    <tr key={paket.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img src={paket.image} alt={paket.nama} className="object-cover w-full h-full" />
                          </div>
                          <span className="font-semibold text-gray-800">{paket.nama}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{paket.kategori}</td>
                      <td className="px-6 py-4 text-sm font-medium text-emerald-600">{paket.harga}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center">{paket.jumlahSoal}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                          <ActionButtonEdit
                            onClick={() => openForm(paket)}
                            title="Edit"
                          />
                          <ActionButtonDelete
                            onClick={() => handleDeletePaket(paket.id)}
                            title="Hapus"
                          />
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 bg-gray-50/30">
                        <p>Paket tidak ditemukan.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Form Paket Section (Tambah/Edit) */}
      {activeTab === "form-paket" && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="mb-8">
            <button 
              onClick={() => {
                if(confirm("Apakah Anda yakin ingin membatalkan? Perubahan yang belum disimpan akan hilang.")) {
                  setActiveTab("paket");
                }
              }}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar Psikotes
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? "Edit Psikotes" : "Tambah Psikotes Baru"}
            </h2>
          </div>

          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-3xl mx-auto relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-2 bg-[#fdfdfd] px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${formTab === 'info' ? 'bg-[#561269] text-white ring-4 ring-[#561269]/20' : (formTab === 'soal' || formTab === 'preview' || formTab === 'interpretasi') ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {(formTab === 'soal' || formTab === 'preview' || formTab === 'interpretasi') ? <CheckCircle className="w-5 h-5" /> : 1}
                </div>
                <span className={`text-sm font-medium ${formTab === 'info' ? 'text-[#561269]' : 'text-gray-500'}`}>Informasi Paket</span>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col items-center gap-2 bg-[#fdfdfd] px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${formTab === 'soal' ? 'bg-[#561269] text-white ring-4 ring-[#561269]/20' : (formTab === 'preview' || formTab === 'interpretasi') ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {(formTab === 'preview' || formTab === 'interpretasi') ? <CheckCircle className="w-5 h-5" /> : 2}
                </div>
                <span className={`text-sm font-medium ${formTab === 'soal' ? 'text-[#561269]' : 'text-gray-500'}`}>Pengisian Soal</span>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col items-center gap-2 bg-[#fdfdfd] px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${formTab === 'preview' ? 'bg-[#561269] text-white ring-4 ring-[#561269]/20' : formTab === 'interpretasi' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {formTab === 'interpretasi' ? <CheckCircle className="w-5 h-5" /> : 3}
                </div>
                <span className={`text-sm font-medium ${formTab === 'preview' ? 'text-[#561269]' : 'text-gray-500'}`}>Preview Soal</span>
              </div>
              {/* Step 4 */}
              <div className="flex flex-col items-center gap-2 bg-[#fdfdfd] px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${formTab === 'interpretasi' ? 'bg-[#561269] text-white ring-4 ring-[#561269]/20' : 'bg-gray-200 text-gray-500'}`}>
                  4
                </div>
                <span className={`text-sm font-medium ${formTab === 'interpretasi' ? 'text-[#561269]' : 'text-gray-500'}`}>Interpretasi</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8">
            {/* Step 1: Info */}
            {formTab === "info" && (
              <div className="animate-in fade-in space-y-8">
                <div className="space-y-6 max-w-4xl mx-auto">
                  <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">Informasi Dasar</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Nama/Judul Psikotes <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={paketData.nama}
                        onChange={(e) => setPaketData(prev => ({ ...prev, nama: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] outline-none transition-all" 
                        placeholder="Contoh: Tes Kepribadian (MBTI)" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Kategori <span className="text-red-500">*</span></label>
                      <select 
                        value={paketData.kategori}
                        onChange={(e) => setPaketData(prev => ({ ...prev, kategori: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] outline-none transition-all"
                      >
                        <option>Kepribadian</option>
                        <option>Karier</option>
                        <option>Klinis</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Deskripsi Paket <span className="text-red-500">*</span></label>
                    <textarea 
                      rows={4} 
                      value={paketData.deskripsi}
                      onChange={(e) => setPaketData(prev => ({ ...prev, deskripsi: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] outline-none transition-all" 
                      placeholder="Tuliskan deskripsi singkat mengenai tujuan dan manfaat tes ini..."
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Jenis Akses <span className="text-red-500">*</span></label>
                      <select 
                        value={paketData.jenisAkses}
                        onChange={(e) => setPaketData(prev => ({ ...prev, jenisAkses: e.target.value, harga: e.target.value === "Gratis" ? "" : prev.harga }))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] outline-none transition-all"
                      >
                        <option>Gratis</option>
                        <option>Berbayar</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Harga (Rp) {paketData.jenisAkses === "Berbayar" && <span className="text-red-500">*</span>}</label>
                      <input 
                        type="number" 
                        value={paketData.harga}
                        onChange={(e) => setPaketData(prev => ({ ...prev, harga: e.target.value }))}
                        disabled={paketData.jenisAkses === "Gratis"}
                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg outline-none transition-all ${paketData.jenisAkses === "Gratis" ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]'}`}
                        placeholder="0 jika gratis" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Upload Banner/Gambar</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#561269]/50 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700">Klik untuk upload atau drag & drop</p>
                      <p className="text-xs mt-1">SVG, PNG, JPG atau GIF (Maks. 2MB)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <input 
                      type="checkbox" 
                      id="status" 
                      checked={paketData.status === "Aktif"}
                      onChange={(e) => setPaketData(prev => ({ ...prev, status: e.target.checked ? "Aktif" : "Nonaktif" }))}
                      className="w-5 h-5 text-[#561269] rounded border-gray-300 focus:ring-[#561269]" 
                    />
                    <div>
                      <label htmlFor="status" className="text-sm font-medium text-gray-800 block cursor-pointer">Aktifkan paket ini untuk publik</label>
                      <span className="text-xs text-gray-500">Jika dicentang, paket ini akan langsung muncul di halaman peserta.</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-8 max-w-4xl mx-auto">
                  <button onClick={() => {
                    if(confirm("Batal dan kembali ke daftar? Perubahan tidak akan disimpan.")) {
                      setActiveTab("paket");
                    }
                  }} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
                  <button onClick={handleNextToSoal} className="px-6 py-2.5 text-sm font-medium text-white bg-[#561269] rounded-lg hover:bg-[#561269]/90 transition-colors shadow-sm">Berikutnya</button>
                </div>
              </div>
            )}

            {/* Step 2: Soal */}
            {formTab === "soal" && (
              <div className="animate-in fade-in">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Form Kiri */}
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-800">
                        {soalList.find(s => s.id === currentSoal.id) ? "Edit Soal" : "Buat Soal Baru"}
                      </h3>

                    </div>
                    
                    <div className="space-y-5 bg-gray-50/50 border border-gray-100 rounded-xl p-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Teks Pertanyaan <span className="text-red-500">*</span></label>
                        <textarea 
                          rows={4} 
                          value={currentSoal.teks}
                          onChange={(e) => setCurrentSoal(prev => ({ ...prev, teks: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] outline-none bg-white" 
                          placeholder="Tuliskan pertanyaan di sini..." 
                        ></textarea>
                      </div>

                      <div className="space-y-3 pt-2">
                        <label className="text-sm font-medium text-gray-700 flex justify-between items-center">
                          <span>Pilihan Jawaban & Bobot Skor</span>
                        </label>
                        {currentSoal.pilihan.map((pil, idx) => (
                          <div key={idx} className="flex gap-3">
                            <input 
                              type="text" 
                              value={pil.text}
                              onChange={(e) => updatePilihan(idx, 'text', e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] outline-none text-sm bg-white" 
                              placeholder={`Pilihan ${idx+1}`} 
                            />
                            <div className="w-24 relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Skor</span>
                              <input 
                                type="number" 
                                value={pil.bobot}
                                onChange={(e) => updatePilihan(idx, 'bobot', e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] outline-none text-sm bg-white" 
                                placeholder="0" 
                              />
                            </div>
                            <button onClick={() => removePilihan(idx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors bg-white border border-gray-200"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                        <button onClick={addPilihan} className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-2 flex items-center gap-1">
                          <Plus className="w-4 h-4" /> Tambah Opsi
                        </button>
                      </div>
                      
                      <div className="pt-4 flex justify-between">
                        {soalList.find(s => s.id === currentSoal.id) ? (
                          <button onClick={() => deleteSoal(currentSoal.id)} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Hapus Soal
                          </button>
                        ) : <div></div>}
                        <button onClick={handleSimpanSoal} className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm">
                          <Save className="w-4 h-4" /> Simpan Soal
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Kanan (List Soal) */}
                  <div className="w-full lg:w-72 space-y-4">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 sticky top-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-800">Daftar Soal</h4>
                        <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{soalList.length} Soal</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mb-6 max-h-[300px] overflow-y-auto pr-1">
                        {soalList.map((s, idx) => (
                          <button 
                            key={s.id}
                            onClick={() => selectSoal(s)}
                            className={`aspect-square rounded-lg border flex flex-col items-center justify-center font-medium transition-all text-sm
                              ${s.id === currentSoal.id 
                                ? 'bg-[#561269] border-[#561269] text-white shadow-sm ring-2 ring-[#561269]/20 ring-offset-1' 
                                : 'bg-white border-gray-200 text-gray-600 hover:border-[#561269]/50 hover:text-[#561269]'
                              }`}
                          >
                            {idx + 1}
                            <CheckCircle className={`w-3 h-3 mt-0.5 ${s.id === currentSoal.id ? 'text-white/70' : 'text-emerald-500'}`} />
                          </button>
                        ))}
                        {/* Draft indikator soal baru yang belum disave */}
                        {!soalList.find(s => s.id === currentSoal.id) && (
                          <div className="aspect-square rounded-lg border border-dashed border-gray-400 bg-gray-100 flex flex-col items-center justify-center font-medium text-sm text-gray-600 opacity-70">
                            {soalList.length + 1}
                          </div>
                        )}
                        <button onClick={handleBuatSoalBaru} className="aspect-square rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 flex flex-col gap-2">
                        <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Soal tersimpan</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-8">
                  <button onClick={() => setFormTab("info")} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Kembali</button>
                  <button onClick={handleNextToPreview} className="px-6 py-2.5 text-sm font-medium text-white bg-[#561269] rounded-lg hover:bg-[#561269]/90 transition-colors shadow-sm">Berikutnya</button>
                </div>
              </div>
            )}

            {/* Step 3: Preview Soal */}
            {formTab === "preview" && (
              <div className="animate-in fade-in space-y-8">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Preview Semua Soal</h3>
                      <p className="text-sm text-gray-500 mt-1">Tinjau seluruh soal Anda sebelum lanjut ke interpretasi. Anda memiliki {soalList.length} soal.</p>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-xl">
                    {soalList.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
                        <p className="text-gray-500 font-medium">Belum ada soal yang ditambahkan.</p>
                      </div>
                    ) : (
                      soalList.map((s, idx) => {
                        const isIncomplete = !s.teks || s.pilihan.some(p => !p.text.trim());
                        return (
                          <div key={s.id} className={`p-5 rounded-xl border ${isIncomplete ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className="flex justify-between items-start gap-4 mb-4">
                              <div className="flex items-center gap-3">
                                <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${isIncomplete ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}>{idx + 1}</span>
                                <div>
                                  <h4 className="text-gray-800 font-medium text-sm md:text-base leading-snug">{s.teks || <span className="text-red-400 italic">Pertanyaan kosong...</span>}</h4>
                                  <span className="text-xs text-gray-500 mt-1 inline-block bg-gray-100 px-2 py-0.5 rounded-full">{s.tipe}</span>
                                </div>
                              </div>
                              <button onClick={() => { selectSoal(s); setFormTab("soal"); }} className="flex-shrink-0 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-xs font-medium transition-colors flex items-center gap-1.5">
                                <Edit className="w-3.5 h-3.5" /> Edit
                              </button>
                            </div>
                            <div className="ml-11 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {s.pilihan.map((p, i) => (
                                <div key={i} className={`px-4 py-2.5 rounded-lg border text-sm flex justify-between items-center ${!p.text.trim() ? 'border-red-200 bg-white text-red-400 italic' : 'border-gray-200 bg-gray-50/50 text-gray-700'}`}>
                                  <span>{p.text || "Jawaban kosong..."}</span>
                                  <span className="text-xs font-semibold px-2 py-1 bg-white border border-gray-200 rounded-md text-gray-600 shadow-sm">Skor: {p.bobot}</span>
                                </div>
                              ))}
                            </div>
                            {isIncomplete && (
                              <p className="ml-11 mt-3 text-xs text-red-500 flex items-center gap-1.5 font-medium"><X className="w-3.5 h-3.5" /> Ada data yang belum lengkap pada soal ini.</p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-8 max-w-4xl mx-auto">
                  <button onClick={() => setFormTab("soal")} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Kembali</button>
                  <button onClick={handleNextToInterpretasi} className="px-6 py-2.5 text-sm font-medium text-white bg-[#561269] rounded-lg hover:bg-[#561269]/90 transition-colors shadow-sm">Berikutnya</button>
                </div>
              </div>
            )}

            {/* Step 3: Interpretasi */}
            {formTab === "interpretasi" && (
              <div className="animate-in fade-in space-y-8">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Interpretasi Hasil</h3>
                      <p className="text-sm text-gray-500 mt-1">Atur kesimpulan berdasarkan rentang skor atau logika tes.</p>
                    </div>
                    <button onClick={addInterpretasi} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 text-sm font-medium transition-colors">
                      <Plus className="w-4 h-4" /> Tambah Kategori
                    </button>
                  </div>

                  <div className="space-y-6">
                    {interpretasiList.map((item, idx) => (
                      <div key={item.id} className="border border-gray-200 rounded-xl p-6 relative bg-gray-50/30 hover:shadow-md transition-shadow">
                        <button onClick={() => removeInterpretasi(item.id)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pr-10">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Batas Bawah Skor</label>
                            <input 
                              type="number" 
                              value={item.min}
                              onChange={(e) => updateInterpretasi(item.id, "min", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#561269]/20 outline-none text-sm bg-white" 
                              placeholder="Misal: 0" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Batas Atas Skor</label>
                            <input 
                              type="number" 
                              value={item.max}
                              onChange={(e) => updateInterpretasi(item.id, "max", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#561269]/20 outline-none text-sm bg-white" 
                              placeholder="Misal: 49" 
                            />
                          </div>
                        </div>
                        <div className="space-y-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Judul Hasil <span className="text-red-500">*</span></label>
                              <input 
                                type="text" 
                                value={item.judul}
                                onChange={(e) => updateInterpretasi(item.id, "judul", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#561269]/20 outline-none font-medium bg-white" 
                                placeholder="Misal: Tingkat Stres Tinggi" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori / Tipe Hasil</label>
                              <input 
                                type="text" 
                                value={item.kategori}
                                onChange={(e) => updateInterpretasi(item.id, "kategori", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#561269]/20 outline-none text-sm bg-white" 
                                placeholder="Misal: Klinis" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Interpretasi Hasil <span className="text-red-500">*</span></label>
                            <textarea 
                              rows={3} 
                              value={item.deskripsi}
                              onChange={(e) => updateInterpretasi(item.id, "deskripsi", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#561269]/20 outline-none text-sm bg-white" 
                              placeholder="Deskripsi ilmiah atau interpretasi formal dari hasil ini..."
                            ></textarea>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Apa Artinya Untuk Peserta?</label>
                            <textarea 
                              rows={3} 
                              value={item.makna}
                              onChange={(e) => updateInterpretasi(item.id, "makna", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#561269]/20 outline-none text-sm bg-white" 
                              placeholder="Penjelasan dengan bahasa yang lebih santai dan mudah dipahami oleh peserta..."
                            ></textarea>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Tips / Saran (Opsional)</label>
                            <div className="space-y-3">
                              {item.saran.map((s, idx) => (
                                <div key={idx} className="flex gap-2">
                                  <div className="flex-1 space-y-2">
                                    <input
                                      type="text"
                                      value={s.title}
                                      onChange={(e) => updateSaran(item.id, idx, 'title', e.target.value)}
                                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#561269]/20 outline-none text-sm bg-white font-medium"
                                      placeholder="Judul Tips (Misal: Lakukan Relaksasi)"
                                    />
                                    <textarea
                                      rows={2}
                                      value={s.desc}
                                      onChange={(e) => updateSaran(item.id, idx, 'desc', e.target.value)}
                                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#561269]/20 outline-none text-sm bg-white"
                                      placeholder="Deskripsi mendetail..."
                                    />
                                  </div>
                                  <button onClick={() => removeSaran(item.id, idx)} className="self-start mt-1 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-200"><X className="w-4 h-4" /></button>
                                </div>
                              ))}
                              <button onClick={() => addSaran(item.id)} className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                <Plus className="w-3.5 h-3.5" /> Tambah Tips Baru
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-8 max-w-4xl mx-auto">
                  <button onClick={() => setFormTab("preview")} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Kembali</button>
                  <button onClick={simpanPaketLengkap} className="flex items-center gap-2 px-8 py-2.5 text-sm font-medium text-white bg-[#561269] rounded-lg hover:bg-[#561269]/90 transition-colors shadow-sm">
                    <Save className="w-4 h-4" /> Simpan Paket Psikotes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPeserta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-800">Detail Hasil Psikotes</h3>
              <button 
                onClick={() => setSelectedPeserta(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Profile Info */}
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="w-20 h-20 bg-[#561269]/10 text-[#561269] rounded-full flex items-center justify-center text-2xl font-bold uppercase shrink-0">
                  {selectedPeserta.nama.substring(0, 2)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{selectedPeserta.nama}</h4>
                  <p className="text-gray-500 mb-3">{selectedPeserta.noHp}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                      {selectedPeserta.paket}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                      selectedPeserta.jenisAkses === 'Gratis' ? 'bg-gray-50 text-gray-600 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      Akses: {selectedPeserta.jenisAkses}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                      selectedPeserta.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      Status: {selectedPeserta.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Result Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                  <p className="text-sm text-gray-500 mb-1">Tanggal Pengerjaan</p>
                  <p className="font-semibold text-gray-800">{selectedPeserta.tanggal}</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                  <p className="text-sm text-gray-500 mb-1">Skor / Hasil Akhir</p>
                  <p className="font-semibold text-gray-800">{selectedPeserta.skor}</p>
                </div>
              </div>

              {/* Dummy Answers / Analysis */}
              {selectedPeserta.status === "Selesai" ? (
                <div>
                  <h5 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" /> Ringkasan Analisis
                  </h5>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Berdasarkan hasil pengerjaan tes, peserta menunjukkan kecenderungan yang sesuai dengan deskripsi singkat berikut. Kemampuan adaptasi dan konsentrasi berada pada tingkat yang diharapkan dari profil &quot;{selectedPeserta.skor}&quot;.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed border-gray-200 rounded-xl">
                  <Clock className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                  <p className="text-gray-500">Tes masih berlangsung. Hasil analisis lengkap belum tersedia.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button 
                onClick={() => setSelectedPeserta(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
              {selectedPeserta.status === "Selesai" && (
                <button className="px-4 py-2 text-sm font-medium text-white bg-[#561269] rounded-lg hover:bg-[#561269]/90 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" /> Unduh Laporan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
