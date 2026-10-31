/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import {
  Users,
  FileText,
  Plus,
  X,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Save,
  Upload,
  Trash2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  BookOpen,
  DollarSign,
  Info,
  TrendingUp,
  Briefcase,
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  Download,
  Eye,
  AlertTriangle,
  Compass,
  Loader2,
} from "lucide-react";
import { ActionButtonDetail, ActionButtonEdit, ActionButtonDelete, EditIcon } from "@/components/shared/TableActionButtons";
import { AdminSummaryCard } from "@/components/shared/AdminSummaryCard";
import {
  AdminDataTable,
  AdminTableContainer,
  AdminSearchInput,
  AdminFilterTabItem,
  AdminStatusBadge,
  ColumnDef,
} from "@/components/shared/AdminDataTable";
import { INITIAL_JUDUL_LIST, INITIAL_PESERTA_LIST } from "../../data/adminPsikotesData";
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service";
import { uploadService } from "@/services/upload.service";
import type {
  AdminPsikotesPeserta,
  Interpretasi,
  JudulPsikotesItem,
  PaketData,
  PaketDetailItem,
  Soal,
  JenisAkses,
  Tip,
} from "../../types/adminPsikotes";

const LOCAL_STORAGE_KEY = "empathika_admin_psikotes_judul_v5";

function mapApiResponseToJudul(items: PaketPsikotesApiResponse[]): JudulPsikotesItem[] {
  const judulMap = new Map<string, JudulPsikotesItem>();

  items.forEach((item) => {
    // Normalisasi nama judul: hapus imbuhan label seperti "(Gratis)" atau "(Berbayar)" jika ada
    const cleanJudul = item.judul
      .replace(/\s*\((gratis|berbayar|free|paid|paket lengkap)\)\s*$/i, "")
      .trim();
    const normalizedKey = cleanJudul.toLowerCase();

    const paketDetail: PaketDetailItem = {
      id: item.id,
      judulId: item.id,
      namaJudul: cleanJudul,
      kategori: "Umum",
      deskripsi: item.deskripsi || "",
      bannerUrl: item.banner_url || undefined,
      benefits: Array.isArray(item.benefits) ? item.benefits : undefined,
      jenisAkses: item.jenis_akses === "GRATIS" ? "Gratis" : "Berbayar",
      harga: item.jenis_akses === "GRATIS" ? "Gratis" : `Rp ${Number(item.harga).toLocaleString("id-ID")}`,
      numericHarga: Number(item.harga) || 0,
      waktu: "15 Menit",
      status: item.status === "PUBLISHED" ? "Aktif" : "Draf",
      jumlahSoal: item.soal_psikotes?.length || 0,
      soalList: (item.soal_psikotes || []).map((s) => ({
        id: s.id,
        tipe: "Pilihan Ganda",
        teks: s.pertanyaan,
        pilihan: (s.pilihan_jawaban || []).map((p) => ({
          text: p.teks_jawaban,
          bobot: String(p.bobot),
        })),
      })),
      interpretasiList: (item.interpretasi_psikotes || []).map((i) => {
        let saran: Tip[] = [];
        let kekuatanUtama: string[] = [];
        let blindspots: string[] = [];
        let lingkunganOptimal: string[] = [];
        let judulKekuatan = "Potensi atau Kekuatan Utama";
        let judulBlindspots = "Area yang Perlu Dikembangkan";
        let judulLingkungan = "Kondisi atau Lingkungan yang Mendukung";

        if (Array.isArray(i.tips)) {
          saran = i.tips;
        } else if (i.tips && typeof i.tips === "object") {
          const t = i.tips as any;
          saran = Array.isArray(t.saran) ? t.saran : [];
          kekuatanUtama = Array.isArray(t.kekuatanUtama) ? t.kekuatanUtama : [];
          blindspots = Array.isArray(t.blindspots) ? t.blindspots : [];
          lingkunganOptimal = Array.isArray(t.lingkunganOptimal) ? t.lingkunganOptimal : [];
          if (t.judulKekuatan) judulKekuatan = t.judulKekuatan;
          if (t.judulBlindspots) judulBlindspots = t.judulBlindspots;
          if (t.judulLingkungan) judulLingkungan = t.judulLingkungan;
        }

        return {
          id: i.id,
          min: String(i.min_skor),
          max: String(i.max_skor),
          judul: i.judul,
          kategori: i.grade || "Umum",
          deskripsi: i.deskripsi,
          makna: i.makna || "",
          saran,
          kekuatanUtama,
          blindspots,
          lingkunganOptimal,
          judulKekuatan,
          judulBlindspots,
          judulLingkungan,
        };
      }),
      updatedAt: new Date(item.updatedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      pesertaCount: item._count?.booking_psikotes || 0,
    };

    if (judulMap.has(normalizedKey)) {
      const existing = judulMap.get(normalizedKey)!;
      const existingIdx = existing.paketList.findIndex(
        (p) => p.id === paketDetail.id || (p.jenisAkses === paketDetail.jenisAkses && p.status === paketDetail.status)
      );
      if (existingIdx >= 0) {
        existing.paketList[existingIdx] = paketDetail;
      } else {
        existing.paketList.push(paketDetail);
      }
      if (!existing.deskripsi && paketDetail.deskripsi) {
        existing.deskripsi = paketDetail.deskripsi;
      }
      if ((!existing.image || existing.image.includes("unsplash")) && paketDetail.bannerUrl) {
        existing.image = paketDetail.bannerUrl;
      }
    } else {
      judulMap.set(normalizedKey, {
        id: item.id,
        judul: cleanJudul,
        kategori: "Umum",
        deskripsi: item.deskripsi || "",
        image: item.banner_url || "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=100&h=100",
        paketList: [paketDetail],
      });
    }
  });

  return Array.from(judulMap.values());
}

export default function AdminPsikotesClient() {
  const [activeTab, setActiveTab] = useState<"peserta" | "paket" | "form-paket">("peserta");
  const [formTab, setFormTab] = useState<"info" | "soal" | "preview" | "interpretasi">("info");
  const [aksesFilter, setAksesFilter] = useState<"Berbayar" | "Semua" | "Gratis">("Berbayar");
  const [paketFilter, setPaketFilter] = useState<"Dipublikasi" | "Draf">("Dipublikasi");
  const [searchPaket, setSearchPaket] = useState("");

  // Modals
  const [selectedPeserta, setSelectedPeserta] = useState<AdminPsikotesPeserta | null>(null);
  const [selectedJudul, setSelectedJudul] = useState<JudulPsikotesItem | null>(null);
  const [previewBerbayarModal, setPreviewBerbayarModal] = useState<{ title: string; inter: Interpretasi } | null>(null);

  // Notifications & Validations
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);

  // Core Data: Judul Psikotes and its packages
  const [judulList, setJudulList] = useState<JudulPsikotesItem[]>(INITIAL_JUDUL_LIST);

  // Core Data: Peserta Realtime dari Database (Hanya Peserta Psikotes Berbayar)
  const [pesertaList, setPesertaList] = useState<AdminPsikotesPeserta[]>([]);
  const [pesertaSummary, setPesertaSummary] = useState({
    total_peserta: 0,
    total_gratis: 0,
    total_berbayar: 0,
    total_selesai: 0,
  });
  const [isLoadingPeserta, setIsLoadingPeserta] = useState(false);

  // Validasi Paket: Peringatan pada setiap field wajib
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (fieldName: string) => {
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPesertaFromBackend = async () => {
    setIsLoadingPeserta(true);
    try {
      const res = await psikotesService.getPeserta({ jenis_akses: "BERBAYAR" });
      if (res && res.success && res.data) {
        setPesertaSummary(res.data.summary);
        const rawItems = Array.isArray(res.data.items) ? res.data.items : [];
        const mapped: AdminPsikotesPeserta[] = rawItems.map((it: any) => ({
          id: it.id,
          nama: it.nama_peserta,
          noHp: it.no_hp,
          paket: it.nama_paket,
          tanggal: new Date(it.tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          status: it.status as "Selesai" | "Berjalan",
          skor: it.skor,
          jenisAkses: it.jenis_akses as "Gratis" | "Berbayar",
          usia: it.usia,
          jenisKelamin: it.jenis_kelamin,
          totalSkor: it.total_skor,
          hasil: it.hasil,
        }));
        setPesertaList(mapped);
      }
    } catch (err) {
      console.error("Gagal membaca data peserta dari server:", err);
    } finally {
      setIsLoadingPeserta(false);
    }
  };

  const loadDataFromBackend = async () => {
    try {
      const res = await psikotesService.getList({ status: "ALL", include_draft: true });
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = mapApiResponseToJudul(res.data);
        setJudulList(mapped);
      }
    } catch (err) {
      console.error("Gagal membaca data dari server:", err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadDataFromBackend();
    loadPesertaFromBackend();
  }, []);

  // Form State
  const [isResumingDraft, setIsResumingDraft] = useState(false);
  const [activeDraftPackageId, setActiveDraftPackageId] = useState<string | number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Edit Published Package State & Participant Warning
  const [isEditingPublished, setIsEditingPublished] = useState(false);
  const [isEditingPackage, setIsEditingPackage] = useState(false);
  const isEditMode = Boolean(isEditingPackage || isEditingPublished || isResumingDraft || activeDraftPackageId);
  const [hasParticipants, setHasParticipants] = useState(false);
  const [hasConfirmedWarning, setHasConfirmedWarning] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<"soal" | "interpretasi" | null>(null);

  const DEFAULT_BENEFITS: string[] = [""];

  const [paketData, setPaketData] = useState<PaketData>({
    id: 0,
    judulId: 0,
    nama: "",
    kategori: "Kepribadian",
    deskripsi: "",
    bannerUrl: "",
    benefits: [""],
    waktu: "15",
    jenisAkses: "Gratis",
    harga: "",
    numericHarga: 0,
    status: "Draf",
    jumlahSoal: 0,
    modeJudul: "baru",
  });

  const [soalList, setSoalList] = useState<Soal[]>([]);
  const [activeSoalId, setActiveSoalId] = useState<string | number>(Date.now());
  const [currentSoal, setCurrentSoal] = useState<Soal>({
    id: activeSoalId,
    tipe: "Pilihan Ganda",
    teks: "",
    pilihan: [
      { text: "", bobot: "1" },
      { text: "", bobot: "0" },
    ],
  });

  const [interpretasiList, setInterpretasiList] = useState<Interpretasi[]>([
    {
      id: Date.now(),
      min: "0",
      max: "5",
      judul: "",
      kategori: "",
      deskripsi: "",
      makna: "",
      saran: [{ title: "", desc: "" }],
    },
  ]);

  // Notification auto-dismiss
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Filtering Peserta (Khusus Peserta Berbayar)
  const filteredPeserta = pesertaList.filter((peserta) => {
    return (
      peserta.jenisAkses === "Berbayar" &&
      peserta.nama !== "Tamu Anonim"
    );
  });


  // Filtering Judul & Paket
  const filteredJudul = judulList.filter((item) => {
    const matchesSearch =
      item.judul.toLowerCase().includes(searchPaket.toLowerCase()) ||
      item.kategori.toLowerCase().includes(searchPaket.toLowerCase());
    if (!matchesSearch) return false;

    if (paketFilter === "Dipublikasi") {
      return item.paketList.some((p) => p.status === "Aktif");
    }
    if (paketFilter === "Draf") {
      return item.paketList.some((p) => p.status === "Draf");
    }
    return true;
  });

  // Calculate totals for summary: dihitung berdasarkan jumlah judul paket, bukan dari varian "Paket & Akses"
  const totalPaketCount = judulList.filter((item) =>
    item.paketList.some((p) => p.status === "Aktif")
  ).length || judulList.length;

  const totalDraftCount = judulList.filter((item) =>
    item.paketList.some((p) => p.status === "Draf")
  ).length;

  // Helper: Default Berbayar interpretation matching user website (PsikotesHasilClient)
  const getBerbayarDefaultInterpretasi = (nama: string, kategori: string): Interpretasi[] => {
    const isLove = nama.toLowerCase().includes("love");
    const isKarier = nama.toLowerCase().includes("karier");

    if (isLove) {
      return [
        {
          id: Date.now(),
          min: "0",
          max: "5",
          judul: "Words of Affirmation (Kata-Kata Penegasan)",
          kategori: `${kategori || "Relasi"} Berbayar`,
          deskripsi:
            "Hasil asesmen komprehensif menunjukkan bahasa cinta utamamu adalah Words of Affirmation. Kamu paling merasa dihargai dan dicintai melalui kata-kata verbal yang tulus, apresiasi spesifik, dan komunikasi yang membangun.",
          makna:
            "Implikasi bagi Hubungan: Pujian yang tulus, ucapan terima kasih yang jujur, dan kata-kata penyemangat memiliki dampak emosional yang mendalam bagimu dalam memperkuat ikatan hubungan interpersonal.",
          kekuatanUtama: [
            "Kemampuan mengekspresikan apresiasi verbal yang menyejukkan dan memvalidasi perasaan orang lain.",
            "Sensitivitas tinggi terhadap nada bicara dan kebutuhan emosional pasangan atau sahabat.",
            "Komunikasi afektif yang membangun rasa aman, keterbukaan, dan kepercayaan jangka panjang.",
          ],
          blindspots: [
            "Sangat sensitif terhadap kritik pedas, nada bicara ketus, atau sarkasme ringan dari orang terdekat.",
            "Dapat meragukan ketulusan atau kasih sayang orang lain jika tidak dinyatakan secara verbal berulang kali.",
            "Kerap menahan kekecewaan sendiri demi menjaga suasana verbal tetap positif di depan orang lain.",
          ],
          lingkunganOptimal: [
            "Lingkungan relasi personal dan kerja yang mengedepankan budaya apresiatif serta umpan balik positif.",
            "Dinamika kelompok kerja yang saling menghargai usaha anggota tim secara transparan.",
            "Pola interaksi yang asertif, jujur, dan bebas dari sindiran atau sarkasme pasif.",
          ],
          saran: [
            {
              title: "Komunikasikan Terbuka",
              desc: "Ungkapkan pada pasangan atau sahabat bahwa apresiasi verbal sangat berarti untukmu.",
            },
            {
              title: "Catat Kata-kata Berharga",
              desc: "Simpan pesan atau catatan penyemangat sebagai pengingat saat menghadapi hari yang berat.",
            },
            {
              title: "Latih Self-Compassion",
              desc: "Ucapkan kata-kata apresiasi dan validasi positif pada dirimu sendiri setiap hari.",
            },
          ],
        },
      ];
    }

    if (isKarier) {
      return [
        {
          id: Date.now(),
          min: "0",
          max: "5",
          judul: "Social - Artistic (Kreatif & Humanis)",
          kategori: `${kategori || "Karier"} Berbayar`,
          deskripsi:
            "Dominasi minat berfokus pada inovasi, ekspresi ide orisinal, serta komunikasi persuasif yang berakar pada empati tulus.",
          makna:
            "Kekuatan Utama & Lingkungan Kerja Optimal: Unggul dalam industri edukasi, psikologi, human resource, dan perancangan strategi kreatif dengan ruang kolaborasi tim yang fleksibel.",
          kekuatanUtama: [
            "Kreativitas tinggi dalam memecahkan masalah interpersonal dan operasional.",
            "Kecerdasan emosional yang mendukung komunikasi asertif dan diplomatis.",
            "Kemampuan mengubah konsep abstrak menjadi strategi implementatif yang menarik.",
          ],
          blindspots: [
            "Cenderung menghindari konfrontasi langsung meskipun ada masalah struktural yang mendesak.",
            "Rentan overthinking terhadap ekspektasi atau pandangan orang lain terhadap hasil kerjanya.",
            "Sering kesulitan menetapkan batasan profesional ketika urusan pekerjaan menyentuh empati emosional.",
          ],
          lingkunganOptimal: [
            "Industri kreatif, agensi konsultan, riset sosial, dan human capital.",
            "Organisasi yang memiliki budaya terbuka, suportif, dan inovatif.",
            "Posisi yang memungkinkan interaksi berkelanjutan dengan klien atau komunitas.",
          ],
          saran: [
            {
              title: "Eksplorasi Peran Strategis",
              desc: "Kembangkan potensi pada posisi People Development Specialist, UI/UX Researcher, atau Talent Strategist.",
            },
            {
              title: "Atur Batasan Energi",
              desc: "Jaga keseimbangan antara keterlibatan sosial dan waktu jeda refleksi mandiri.",
            },
          ],
        },
      ];
    }

    return [
      {
        id: Date.now(),
        min: "0",
        max: "5",
        judul: "ENFJ-A (Protagonist)",
        kategori: `${kategori || "Kepribadian"} Berbayar`,
        deskripsi:
          "Karakteristikmu mencerminkan kecenderungan analitis yang kuat, gaya komunikasi yang terstruktur, serta orientasi tinggi terhadap pencapaian dan kolaborasi yang harmonis.",
        makna:
          "Implikasi bagi Kehidupan Sehari-hari: Mampu membangun keselarasan dan kohesi tim kerja, merumuskan solusi berpusat pada manusia, serta menginspirasi rekan kerja dengan empati tulus.",
        kekuatanUtama: [
          "Komunikasi persuasif yang berakar pada empati tulus dan pemahaman interpersonal.",
          "Kemampuan membangun keselarasan dan kohesi tim kerja dalam mencapai target bersama.",
          "Ketajaman dalam merumuskan solusi strategis yang tetap berpusat pada kesejahteraan manusia.",
        ],
        blindspots: [
          "Cenderung mengabaikan kebutuhan diri sendiri demi mendahulukan kepentingan atau perasaan orang lain.",
          "Rentan mengalami kelelahan emosional (burnout) akibat terlalu menyerap beban masalah lingkungan sekitar.",
          "Sulit menolak permintaan tambahan atau menetapkan batasan beban kerja pribadi yang tegas.",
        ],
        lingkunganOptimal: [
          "Industri edukasi, psikologi, human resource, konsultasi, dan pengembangan komunitas.",
          "Posisi strategis dengan ruang kolaborasi tim yang fleksibel, hangat, dan suportif.",
          "Budaya organisasi yang menghargai inovasi sosial, empati, dan pengakuan personal yang transparan.",
        ],
        saran: [
          {
            title: "Beri Waktu Jeda",
            desc: "Luangkan waktu 15-30 menit setiap hari tanpa gangguan untuk relaksasi, meditasi, atau sekadar melakukan hobi ringan.",
          },
          {
            title: "Cerita pada Orang Terdekat",
            desc: "Membagikan beban pikiran pada seseorang yang kamu percaya bisa membantu mengurangi tekanan emosional.",
          },
          {
            title: "Atur Prioritas",
            desc: "Fokus pada hal-hal yang paling penting dan mendesak. Jangan ragu untuk mengatakan 'tidak' jika kapasitasmu sudah penuh.",
          },
        ],
      },
    ];
  };

  // Helper: Find participant's detailed Berbayar interpretation matching user side
  const getPesertaInterpretasi = (peserta: AdminPsikotesPeserta): Interpretasi => {
    for (const judul of judulList) {
      for (const pkt of judul.paketList) {
        if (
          peserta.paket.toLowerCase().includes(judul.judul.toLowerCase()) &&
          pkt.jenisAkses === peserta.jenisAkses
        ) {
          const matched = pkt.interpretasiList.find(
            (inter) =>
              peserta.skor.toLowerCase().includes(inter.judul.toLowerCase()) ||
              inter.judul.toLowerCase().includes(peserta.skor.toLowerCase())
          );
          if (matched) return matched;
          if (pkt.interpretasiList.length > 0) return pkt.interpretasiList[0];
        }
      }
    }
    return getBerbayarDefaultInterpretasi(peserta.paket, "Kepribadian")[0];
  };

  // Default Universal Benefits for Paid Psychological Test Package
  const DEFAULT_BERBAYAR_BENEFITS = [
    "Hasil analisis sesuai jenis psikotes yang dipilih",
    "Interpretasi hasil dan karakteristik secara mendalam",
    "Insight mengenai potensi, kelebihan, dan area pengembangan diri",
    "Rekomendasi dan panduan pengembangan diri sesuai hasil asesmen",
  ];

  // Default Universal Benefits for Free Psychological Test Package
  const DEFAULT_GRATIS_BENEFITS = [
    "Akses pengerjaan asesmen secara online tanpa biaya",
    "Hasil skor dan profil asesmen langsung keluar",
    "Ringkasan interpretasi hasil dan makna bagi peserta",
    "Tips dasar dan saran aksi pengembangan praktis",
  ];

  // Helper: Blank interpretation for clean/empty form
  const createBlankInterpretasi = (kategori: string = "", isBerbayar: boolean = false): Interpretasi => ({
    id: Date.now(),
    min: isBerbayar ? "" : "0",
    max: isBerbayar ? "" : "5",
    judul: "",
    kategori: kategori,
    deskripsi: "",
    makna: "",
    kekuatanUtama: [""],
    blindspots: [""],
    lingkunganOptimal: [""],
    judulKekuatan: "Potensi atau Kekuatan Utama",
    judulBlindspots: "Area yang Perlu Dikembangkan",
    judulLingkungan: "Kondisi atau Lingkungan yang Mendukung",
    saran: [{ title: "", desc: "" }],
  });

  // Helper: Open form to create a new psychological test title or package
  const openFormTambah = (targetJudul?: JudulPsikotesItem, preferredAkses?: JenisAkses) => {
    setFormErrors([]);
    setFieldErrors({});
    setIsResumingDraft(false);
    setIsEditingPublished(false);
    setIsEditingPackage(false);
    setHasParticipants(false);
    setHasConfirmedWarning(false);
    setActiveDraftPackageId(null);
    setActiveTab("form-paket");
    setFormTab("info");

    if (targetJudul) {
      // Adding package to an existing title (Gratis sudah ada mau nambah Berbayar, atau sebaliknya)
      const existingGratis = targetJudul.paketList.find((p) => p.jenisAkses === "Gratis");
      const existingBerbayar = targetJudul.paketList.find((p) => p.jenisAkses === "Berbayar");
      const existingPkg = existingGratis || existingBerbayar || targetJudul.paketList[0];

      let defaultAkses: JenisAkses = preferredAkses || "Berbayar";
      if (!preferredAkses) {
        if (!existingGratis && existingBerbayar) defaultAkses = "Gratis";
        else if (existingGratis && !existingBerbayar) defaultAkses = "Berbayar";
      }

      setPaketData({
        id: Date.now(),
        judulId: targetJudul.id,
        nama: targetJudul.judul,
        kategori: targetJudul.kategori,
        deskripsi: existingPkg?.deskripsi || targetJudul.deskripsi || "",
        bannerUrl: existingPkg?.bannerUrl || targetJudul.image || "",
        benefits: existingPkg?.benefits && existingPkg.benefits.length > 0 ? [...existingPkg.benefits] : [""],
        waktu: existingPkg?.waktu ? existingPkg.waktu.replace(/[^0-9]/g, "") : (defaultAkses === "Gratis" ? "15" : "30"),
        jenisAkses: defaultAkses,
        harga: defaultAkses === "Gratis" ? "" : "Rp 50.000",
        numericHarga: defaultAkses === "Gratis" ? 0 : 50000,
        status: "Draf",
        jumlahSoal: existingPkg?.soalList?.length || 0,
        modeJudul: "ada",
      });

      // Wariskan bank soal dari paket yang sudah ada jika tersedia
      const sourceSoals = existingPkg?.soalList && existingPkg.soalList.length > 0 ? existingPkg.soalList : [];
      setSoalList([...sourceSoals]);
      if (sourceSoals.length > 0) {
        setActiveSoalId(sourceSoals[0].id);
        setCurrentSoal(sourceSoals[0]);
      } else {
        const newSoalId = Date.now();
        setActiveSoalId(newSoalId);
        setCurrentSoal({
          id: newSoalId,
          tipe: "Pilihan Ganda",
          teks: "",
          pilihan: [
            { text: "", bobot: "1" },
            { text: "", bobot: "0" },
          ],
        });
      }

      setInterpretasiList([
        createBlankInterpretasi(targetJudul.kategori, defaultAkses === "Berbayar"),
      ]);
    } else {
      // Brand new test title
      const newSoalId = Date.now();
      setPaketData({
        id: Date.now(),
        judulId: 0,
        nama: "",
        kategori: "Kepribadian",
        deskripsi: "",
        bannerUrl: "",
        benefits: [""], // Default 1 kotak input
        waktu: "15",
        jenisAkses: "Gratis",
        harga: "",
        numericHarga: 0,
        status: "Draf",
        jumlahSoal: 0,
        modeJudul: "baru",
      });
      setSoalList([]);
      setActiveSoalId(newSoalId);
      setCurrentSoal({
        id: newSoalId,
        tipe: "Pilihan Ganda",
        teks: "",
        pilihan: [
          { text: "", bobot: "1" },
          { text: "", bobot: "0" },
        ],
      });
      setInterpretasiList([
        {
          id: Date.now(),
          min: "0",
          max: "5",
          judul: "",
          kategori: "Kepribadian",
          deskripsi: "",
          makna: "",
          kekuatanUtama: [""],
          blindspots: [""],
          lingkunganOptimal: [""],
          judulKekuatan: "Potensi atau Kekuatan Utama",
          judulBlindspots: "Area yang Perlu Dikembangkan",
          judulLingkungan: "Kondisi atau Lingkungan yang Mendukung",
          saran: [{ title: "", desc: "" }],
        },
      ]);
    }
  };

  // Helper: Resume Draft
  const resumeDraft = (targetJudul: JudulPsikotesItem, draftPackage: PaketDetailItem) => {
    setFormErrors([]);
    setIsResumingDraft(true);
    setIsEditingPublished(false);
    setIsEditingPackage(true);
    setHasParticipants(false);
    setHasConfirmedWarning(false);
    setActiveDraftPackageId(draftPackage.id);
    setActiveTab("form-paket");
    setFormTab("info");

    setPaketData({
      id: draftPackage.id,
      judulId: targetJudul.id,
      nama: targetJudul.judul,
      kategori: targetJudul.kategori,
      deskripsi: draftPackage.deskripsi || targetJudul.deskripsi,
      bannerUrl: draftPackage.bannerUrl || targetJudul.image || "",
      benefits: draftPackage.benefits && draftPackage.benefits.length > 0 ? draftPackage.benefits : [""],
      waktu: draftPackage.waktu.replace(/[^0-9]/g, "") || "15",
      jenisAkses: draftPackage.jenisAkses,
      harga: draftPackage.harga === "Gratis" ? "" : draftPackage.harga,
      numericHarga: draftPackage.numericHarga,
      status: "Draf",
      jumlahSoal: draftPackage.jumlahSoal,
      modeJudul: "ada",
    });

    const draftSoals = draftPackage.soalList && draftPackage.soalList.length > 0 ? draftPackage.soalList : [];
    setSoalList(draftSoals);

    if (draftSoals.length > 0) {
      setActiveSoalId(draftSoals[0].id);
      setCurrentSoal(draftSoals[0]);
    } else {
      const newId = Date.now();
      setActiveSoalId(newId);
      setCurrentSoal({
        id: newId,
        tipe: "Pilihan Ganda",
        teks: "",
        pilihan: [
          { text: "", bobot: "1" },
          { text: "", bobot: "0" },
        ],
      });
    }

    if (draftPackage.interpretasiList && draftPackage.interpretasiList.length > 0) {
      setInterpretasiList(
        draftPackage.interpretasiList.map((i) => ({
          ...i,
          kekuatanUtama: i.kekuatanUtama && i.kekuatanUtama.length > 0 ? i.kekuatanUtama : [""],
          blindspots: i.blindspots && i.blindspots.length > 0 ? i.blindspots : [""],
          lingkunganOptimal: i.lingkunganOptimal && i.lingkunganOptimal.length > 0 ? i.lingkunganOptimal : [""],
          saran: i.saran && i.saran.length > 0 ? i.saran : [{ title: "", desc: "" }],
        }))
      );
    } else {
      setInterpretasiList([
        {
          id: Date.now(),
          min: "0",
          max: "5",
          judul: "",
          kategori: targetJudul.kategori,
          deskripsi: "",
          makna: "",
          kekuatanUtama: [""],
          blindspots: [""],
          lingkunganOptimal: [""],
          judulKekuatan: "Potensi atau Kekuatan Utama",
          judulBlindspots: "Area yang Perlu Dikembangkan",
          judulLingkungan: "Kondisi atau Lingkungan yang Mendukung",
          saran: [{ title: "", desc: "" }],
        },
      ]);
    }

    setNotification({
      type: "info",
      message: `Melanjutkan pengerjaan Draf "${targetJudul.judul} (${draftPackage.jenisAkses})". Semua data yang tersimpan telah dimuat.`,
    });
  };

  // Helper: Edit Published or Existing Package
  const handleEditPaket = (targetJudul: JudulPsikotesItem, targetPaket: PaketDetailItem) => {
    setFormErrors([]);
    setIsResumingDraft(targetPaket.status !== "Aktif");
    setIsEditingPublished(targetPaket.status === "Aktif");
    setIsEditingPackage(true);
    setActiveDraftPackageId(targetPaket.id);

    // Cek apakah sudah ada peserta yang mengerjakan paket ini
    const participantsExist =
      (typeof targetPaket.pesertaCount === "number" && targetPaket.pesertaCount > 0) ||
      pesertaList.some(
        (p) =>
          p.paket.toLowerCase().includes(targetJudul.judul.toLowerCase()) &&
          p.jenisAkses === targetPaket.jenisAkses
      );

    setHasParticipants(participantsExist);
    setHasConfirmedWarning(false);
    setActiveTab("form-paket");
    setFormTab("info");

    setPaketData({
      id: targetPaket.id,
      judulId: targetJudul.id,
      nama: targetJudul.judul,
      kategori: targetJudul.kategori,
      deskripsi: targetPaket.deskripsi || targetJudul.deskripsi,
      bannerUrl: targetPaket.bannerUrl || targetJudul.image || "",
      benefits:
        targetPaket.benefits && targetPaket.benefits.length > 0
          ? targetPaket.benefits
          : [""],
      waktu: targetPaket.waktu.replace(/[^0-9]/g, "") || "15",
      jenisAkses: targetPaket.jenisAkses,
      harga: targetPaket.harga === "Gratis" ? "" : targetPaket.harga,
      numericHarga: targetPaket.numericHarga,
      status: targetPaket.status,
      jumlahSoal: targetPaket.jumlahSoal,
      modeJudul: "ada",
    });

    const questions = targetPaket.soalList && targetPaket.soalList.length > 0 ? targetPaket.soalList : [];
    setSoalList(questions);

    if (questions.length > 0) {
      setActiveSoalId(questions[0].id);
      setCurrentSoal(questions[0]);
    } else {
      const newId = Date.now();
      setActiveSoalId(newId);
      setCurrentSoal({
        id: newId,
        tipe: "Pilihan Ganda",
        teks: "",
        pilihan: [
          { text: "", bobot: "1" },
          { text: "", bobot: "0" },
        ],
      });
    }

    if (targetPaket.interpretasiList && targetPaket.interpretasiList.length > 0) {
      setInterpretasiList(
        targetPaket.interpretasiList.map((i) => ({
          ...i,
          kekuatanUtama: i.kekuatanUtama && i.kekuatanUtama.length > 0 ? i.kekuatanUtama : [""],
          blindspots: i.blindspots && i.blindspots.length > 0 ? i.blindspots : [""],
          lingkunganOptimal: i.lingkunganOptimal && i.lingkunganOptimal.length > 0 ? i.lingkunganOptimal : [""],
          saran: i.saran && i.saran.length > 0 ? i.saran : [{ title: "", desc: "" }],
        }))
      );
    } else {
      setInterpretasiList([
        createBlankInterpretasi(targetJudul.kategori, targetPaket.jenisAkses === "Berbayar"),
      ]);
    }

    setNotification({
      type: "info",
      message: `Membuka mode edit untuk paket "${targetJudul.judul} (${targetPaket.jenisAkses})".`,
    });
  };

  // Helper: Validasi Step 1 (Informasi Paket)
  const validateStepInfo = (): boolean => {
    const errors: Record<string, string> = {};

    if (isEditMode || paketData.modeJudul === "baru") {
      if (!paketData.nama.trim()) {
        errors["nama"] = "Nama/Judul psikotes wajib diisi.";
      }
      if (!paketData.deskripsi.trim()) {
        errors["deskripsi"] = "Deskripsi paket psikotes wajib diisi.";
      }
    } else {
      if (!paketData.judulId) {
        errors["judulId"] = "Pilih instrumen psikotes yang ingin ditambahkan paketnya.";
      }
      if (!paketData.deskripsi.trim()) {
        errors["deskripsi"] = "Deskripsi paket psikotes wajib diisi.";
      }
    }

    if (paketData.jenisAkses === "Berbayar") {
      if (!paketData.numericHarga || paketData.numericHarga <= 0) {
        errors["harga"] = "Harga nominal paket berbayar wajib diisi (minimal Rp 1).";
      }
    }

    setFieldErrors((prev) => ({ ...prev, ...errors }));

    if (Object.keys(errors).length > 0) {
      setNotification({
        type: "error",
        message: "Harap lengkapi semua field wajib bertanda bintang (*) pada Informasi Paket.",
      });
      return false;
    }
    return true;
  };

  // Helper: Validasi Step 2 (Soal)
  const validateStepSoal = (): boolean => {
    if (soalList.length === 0) {
      setFieldErrors((prev) => ({ ...prev, soalList: "Minimal harus memiliki 1 butir soal yang telah disimpan." }));
      setNotification({
        type: "error",
        message: "Minimal harus memiliki 1 butir soal yang telah disimpan sebelum melanjutkan.",
      });
      return false;
    }
    return true;
  };

  // Helper: Intercept Tab Switching to validate warning for packages with participants
  const handleTabSwitch = (target: "info" | "soal" | "preview" | "interpretasi") => {
    // Validasi saat berpindah maju dari Step 1 (info)
    if (formTab === "info" && target !== "info") {
      if (!validateStepInfo()) return;
    }

    // Validasi saat berpindah maju dari Step 2 (soal)
    if (formTab === "soal" && (target === "preview" || target === "interpretasi")) {
      if (!validateStepSoal()) return;
    }

    if (
      isEditingPublished &&
      hasParticipants &&
      !hasConfirmedWarning &&
      (target === "soal" || target === "interpretasi")
    ) {
      setPendingTab(target);
      setShowWarningModal(true);
      return;
    }
    setFormTab(target);
  };

  // Format Rupiah Input Helper
  const handleHargaChange = (val: string) => {
    const rawNumber = val.replace(/[^0-9]/g, "");
    if (!rawNumber) {
      setPaketData((prev) => ({ ...prev, harga: "", numericHarga: 0 }));
      return;
    }
    const num = parseInt(rawNumber, 10);
    const formatted = `Rp ${num.toLocaleString("id-ID")}`;
    setPaketData((prev) => ({
      ...prev,
      harga: formatted,
      numericHarga: num,
    }));
  };

  // Helper Upload Banner
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 10MB.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const url = await uploadService.uploadImage(file);
      setPaketData((prev) => ({ ...prev, bannerUrl: url }));
      setNotification({
        type: "success",
        message: "Banner instrumen psikotes berhasil diunggah!",
      });
    } catch (err: any) {
      console.error("Gagal mengunggah banner:", err);
      alert(err.message || "Gagal mengunggah gambar");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveBanner = () => {
    setPaketData((prev) => ({ ...prev, bannerUrl: "" }));
  };

  // Helper Benefits ("Apa yang akan kamu dapatkan")
  const addBenefit = () => {
    setPaketData((prev) => ({
      ...prev,
      benefits: [...(prev.benefits || []), ""],
    }));
  };

  const updateBenefit = (idx: number, val: string) => {
    setPaketData((prev) => {
      const list = [...(prev.benefits || [])];
      list[idx] = val;
      return { ...prev, benefits: list };
    });
  };

  const removeBenefit = (idx: number) => {
    setPaketData((prev) => {
      const filtered = (prev.benefits || []).filter((_, i) => i !== idx);
      return {
        ...prev,
        benefits: filtered.length > 0 ? filtered : [""],
      };
    });
  };

  // Soal Management
  const handleSimpanSoal = () => {
    const errs: Record<string, string> = {};
    if (!currentSoal.teks.trim()) {
      errs["soal_teks"] = "Teks pertanyaan psikotes tidak boleh kosong.";
    }
    currentSoal.pilihan.forEach((p, idx) => {
      if (!p.text.trim()) {
        errs[`soal_pilihan_${idx}`] = `Pilihan ${idx + 1} tidak boleh kosong.`;
      }
    });

    if (Object.keys(errs).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errs }));
      setNotification({
        type: "error",
        message: "Harap lengkapi teks pertanyaan dan semua pilihan jawaban.",
      });
      return;
    }

    // Bersihkan error soal
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next["soal_teks"];
      delete next["soalList"];
      Object.keys(next).forEach((k) => {
        if (k.startsWith("soal_pilihan_")) delete next[k];
      });
      return next;
    });

    setSoalList((prev) => {
      const idx = prev.findIndex((s) => s.id === currentSoal.id);
      if (idx >= 0) {
        const nextList = [...prev];
        nextList[idx] = currentSoal;
        return nextList;
      } else {
        return [...prev, currentSoal];
      }
    });

    setNotification({
      type: "success",
      message: "Butir soal berhasil disimpan.",
    });
  };

  const handleBuatSoalBaru = () => {
    const newId = Date.now();
    setActiveSoalId(newId);
    setCurrentSoal({
      id: newId,
      tipe: "Pilihan Ganda",
      teks: "",
      pilihan: [
        { text: "", bobot: "1" },
        { text: "", bobot: "0" },
      ],
    });
  };

  const selectSoal = (s: Soal) => {
    setActiveSoalId(s.id);
    setCurrentSoal(s);
  };

  const addPilihan = () => {
    setCurrentSoal((prev) => ({
      ...prev,
      pilihan: [...prev.pilihan, { text: "", bobot: "0" }],
    }));
  };

  const updatePilihan = (index: number, key: "text" | "bobot", val: string) => {
    setCurrentSoal((prev) => {
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
    setCurrentSoal((prev) => ({
      ...prev,
      pilihan: prev.pilihan.filter((_, i) => i !== index),
    }));
  };

  const deleteSoal = (id: string | number) => {
    if (confirm("Hapus butir soal ini dari daftar?")) {
      const newList = soalList.filter((s) => s.id !== id);
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

  // Interpretasi Management
  const addInterpretasi = () => {
    setInterpretasiList((prev) => [
      ...prev,
      createBlankInterpretasi(paketData.kategori, paketData.jenisAkses === "Berbayar"),
    ]);
  };

  const updateInterpretasi = (id: string | number, key: keyof Interpretasi, val: string) => {
    clearFieldError(`interpretasi_${id}_${key}`);
    setInterpretasiList((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: val } : item)));
  };

  const updateBlindspot = (interId: string | number, idx: number, val: string) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interId) {
          const list = [...(item.blindspots && item.blindspots.length > 0 ? item.blindspots : [""])];
          list[idx] = val;
          return { ...item, blindspots: list };
        }
        return item;
      })
    );
  };

  const addBlindspot = (interId: string | number) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interId) {
          return { ...item, blindspots: [...(item.blindspots && item.blindspots.length > 0 ? item.blindspots : [""]), ""] };
        }
        return item;
      })
    );
  };

  const removeBlindspot = (interId: string | number, idx: number) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interId && item.blindspots) {
          const filtered = item.blindspots.filter((_, i) => i !== idx);
          return { ...item, blindspots: filtered.length > 0 ? filtered : [""] };
        }
        return item;
      })
    );
  };

  const updateKekuatan = (interId: string | number, idx: number, val: string) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interId) {
          const list = [...(item.kekuatanUtama && item.kekuatanUtama.length > 0 ? item.kekuatanUtama : [""])];
          list[idx] = val;
          return { ...item, kekuatanUtama: list };
        }
        return item;
      })
    );
  };

  const addKekuatan = (interId: string | number) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interId) {
          return { ...item, kekuatanUtama: [...(item.kekuatanUtama && item.kekuatanUtama.length > 0 ? item.kekuatanUtama : [""]), ""] };
        }
        return item;
      })
    );
  };

  const removeKekuatan = (interId: string | number, idx: number) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interId && item.kekuatanUtama) {
          const filtered = item.kekuatanUtama.filter((_, i) => i !== idx);
          return { ...item, kekuatanUtama: filtered.length > 0 ? filtered : [""] };
        }
        return item;
      })
    );
  };

  const updateLingkungan = (interId: string | number, idx: number, val: string) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interId) {
          const list = [...(item.lingkunganOptimal && item.lingkunganOptimal.length > 0 ? item.lingkunganOptimal : [""])];
          list[idx] = val;
          return { ...item, lingkunganOptimal: list };
        }
        return item;
      })
    );
  };

  const addLingkungan = (interId: string | number) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interId) {
          return { ...item, lingkunganOptimal: [...(item.lingkunganOptimal && item.lingkunganOptimal.length > 0 ? item.lingkunganOptimal : [""]), ""] };
        }
        return item;
      })
    );
  };

  const removeLingkungan = (interId: string | number, idx: number) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interId && item.lingkunganOptimal) {
          const filtered = item.lingkunganOptimal.filter((_, i) => i !== idx);
          return { ...item, lingkunganOptimal: filtered.length > 0 ? filtered : [""] };
        }
        return item;
      })
    );
  };

  const addSaran = (interpretasiId: string | number) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interpretasiId) {
          return { ...item, saran: [...(item.saran && item.saran.length > 0 ? item.saran : [{ title: "", desc: "" }]), { title: "", desc: "" }] };
        }
        return item;
      })
    );
  };

  const updateSaran = (interpretasiId: string | number, saranIndex: number, key: "title" | "desc", val: string) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interpretasiId) {
          const newSaran = [...item.saran];
          newSaran[saranIndex] = { ...newSaran[saranIndex], [key]: val };
          return { ...item, saran: newSaran };
        }
        return item;
      })
    );
  };

  const removeSaran = (interpretasiId: string | number, saranIndex: number) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interpretasiId) {
          const filtered = item.saran.filter((_, i) => i !== saranIndex);
          return { ...item, saran: filtered.length > 0 ? filtered : [{ title: "", desc: "" }] };
        }
        return item;
      })
    );
  };

  const removeInterpretasi = (id: string | number) => {
    if (interpretasiList.length <= 1) {
      alert("Minimal harus ada 1 kategori interpretasi.");
      return;
    }
    if (confirm("Hapus kategori interpretasi ini?")) {
      setInterpretasiList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Save Draft (Can be done anytime, even with incomplete data)
  const handleSaveDraft = async (
    navigateBack: boolean = true,
    forceStatus?: "DRAFT" | "PUBLISHED"
  ) => {
    const titleName = paketData.nama.trim() || "Draf Psikotes Tanpa Judul";
    const packageId =
      activeDraftPackageId ||
      (typeof paketData.id === "string" && paketData.id.length > 10 ? paketData.id : null);

    setIsSubmitting(true);
    try {
      // If forceStatus is provided, honor it. Otherwise, if editing a published package, retain PUBLISHED, else DRAFT.
      const targetStatus = forceStatus ?? (isEditingPublished ? "PUBLISHED" : "DRAFT");
      const isPublishedStatus = targetStatus === "PUBLISHED";

      const apiPayload = {
        judul: titleName,
        deskripsi: paketData.deskripsi || "Draf deskripsi paket psikotes",
        banner_url: paketData.bannerUrl || null,
        benefits: (paketData.benefits || []).filter((b) => b.trim().length > 0),
        jenis_akses: (paketData.jenisAkses === "Gratis" ? "GRATIS" : "BERBAYAR") as any,
        harga: paketData.jenisAkses === "Gratis" ? 0 : (paketData.numericHarga || 0),
        status: targetStatus as any,
        soal_psikotes: soalList.map((s, idx) => {
          const rawChoices = s.pilihan && s.pilihan.length > 0 ? [...s.pilihan] : [];
          while (rawChoices.length < 2) {
            rawChoices.push({
              text: `Pilihan ${rawChoices.length + 1}`,
              bobot: "0",
            });
          }
          return {
            urutan: idx + 1,
            pertanyaan: s.teks.trim() || `Pertanyaan ${idx + 1}`,
            pilihan_jawaban: rawChoices.map((p, pIdx) => ({
              label: String.fromCharCode(65 + pIdx),
              teks_jawaban: p.text.trim() || `Pilihan ${pIdx + 1}`,
              bobot: parseInt(p.bobot) || 0,
            })),
          };
        }),
        interpretasi_psikotes: interpretasiList.map((i, iIdx) => ({
          min_skor: parseInt(i.min) || 0,
          max_skor: parseInt(i.max) || 0,
          grade: i.kategori || `Grade ${iIdx + 1}`,
          judul: i.judul.trim() || `Interpretasi ${iIdx + 1}`,
          deskripsi: i.deskripsi.trim() || "Penjelasan interpretasi",
          makna: i.makna?.trim() || "",
          tips: {
            saran: i.saran || [],
            kekuatanUtama: i.kekuatanUtama || [],
            blindspots: i.blindspots || [],
            lingkunganOptimal: i.lingkunganOptimal || [],
            judulKekuatan: i.judulKekuatan || "Potensi atau Kekuatan Utama",
            judulBlindspots: i.judulBlindspots || "Area yang Perlu Dikembangkan",
            judulLingkungan: i.judulLingkungan || "Kondisi atau Lingkungan yang Mendukung",
          } as any,
        })),
      };

      if (packageId && typeof packageId === "string" && packageId.length > 10) {
        await psikotesService.update(packageId, apiPayload);
      } else {
        const created = await psikotesService.create(apiPayload);
        if (created?.data?.id) {
          setActiveDraftPackageId(created.data.id);
          setIsResumingDraft(true);
        }
      }

      setPaketData((prev) => ({
        ...prev,
        status: isPublishedStatus ? "Aktif" : "Draf",
      }));

      await loadDataFromBackend();

      setNotification({
        type: "success",
        message: isPublishedStatus
          ? `Perubahan paket "${titleName}" berhasil disimpan ke database!`
          : `Draf paket "${titleName}" berhasil disimpan ke database!`,
      });

      if (navigateBack) {
        setActiveTab("paket");
        setIsEditingPackage(false);
        if (!isPublishedStatus) {
          setPaketFilter("Draf");
        }
      }
    } catch (err: any) {
      console.error("Gagal menyimpan ke database:", err);
      setNotification({
        type: "error",
        message: `Gagal menyimpan: ${err.response?.data?.message || err.message || "Terjadi kesalahan"}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSaveDraftClick = () => {
    handleSaveDraft(true, "DRAFT");
  };

  // Publish Package (Requires all mandatory fields)
  const handlePublikasikan = async () => {
    const errors: string[] = [];
    const newFieldErrors: Record<string, string> = {};

    // 1. Validasi Info Paket
    if (isEditMode || paketData.modeJudul === "baru") {
      if (!paketData.nama.trim()) {
        errors.push("Judul psikotes wajib diisi.");
        newFieldErrors["nama"] = "Nama/Judul psikotes wajib diisi.";
      }
      if (!paketData.deskripsi.trim()) {
        errors.push("Deskripsi paket wajib diisi.");
        newFieldErrors["deskripsi"] = "Deskripsi paket psikotes wajib diisi.";
      }
    } else {
      if (!paketData.judulId) {
        errors.push("Pilih instrumen psikotes yang ingin ditambahkan paketnya.");
        newFieldErrors["judulId"] = "Pilih instrumen psikotes yang ingin ditambahkan paketnya.";
      }
      if (!paketData.deskripsi.trim()) {
        errors.push("Deskripsi paket wajib diisi.");
        newFieldErrors["deskripsi"] = "Deskripsi paket psikotes wajib diisi.";
      }
    }

    if (paketData.jenisAkses === "Berbayar") {
      if (!paketData.numericHarga || paketData.numericHarga <= 0) {
        errors.push("Harga paket berbayar wajib diisi (minimal Rp 1).");
        newFieldErrors["harga"] = "Harga nominal paket berbayar wajib diisi (minimal Rp 1).";
      }
    }

    // 2. Validasi Soal
    if (soalList.length === 0) {
      errors.push("Minimal harus memiliki 1 butir soal yang telah disimpan.");
      newFieldErrors["soalList"] = "Minimal harus memiliki 1 butir soal yang telah disimpan.";
    } else {
      const incompleteSoal = soalList.some(
        (s) => !s.teks.trim() || s.pilihan.length < 2 || s.pilihan.some((p) => !p.text.trim())
      );
      if (incompleteSoal) {
        errors.push("Terdapat butir soal yang belum lengkap (teks pertanyaan atau pilihan jawaban masih kosong).");
        newFieldErrors["soalList"] = "Terdapat butir soal yang belum lengkap.";
      }
    }

    // 3. Validasi Interpretasi
    if (interpretasiList.length === 0) {
      errors.push("Minimal harus memiliki 1 kategori interpretasi hasil.");
      newFieldErrors["interpretasiList"] = "Minimal harus memiliki 1 kategori interpretasi hasil.";
    } else {
      interpretasiList.forEach((i, idx) => {
        if (!i.judul.trim()) {
          errors.push(`Judul hasil asesmen pada interpretasi #${idx + 1} wajib diisi.`);
          newFieldErrors[`interpretasi_${i.id}_judul`] = "Judul hasil asesmen wajib diisi.";
        }
        if (!i.deskripsi.trim()) {
          errors.push(`Interpretasi hasil pada interpretasi #${idx + 1} wajib diisi.`);
          newFieldErrors[`interpretasi_${i.id}_deskripsi`] = "Interpretasi hasil wajib diisi.";
        }
        if (!i.makna.trim()) {
          errors.push(`Makna hasil pada interpretasi #${idx + 1} wajib diisi.`);
          newFieldErrors[`interpretasi_${i.id}_makna`] = "Makna hasil wajib diisi.";
        }
      });
    }

    setFieldErrors(newFieldErrors);

    if (errors.length > 0) {
      setFormErrors(errors);
      // Pindahkan formTab ke step pertama yang bermasalah
      if (newFieldErrors["nama"] || newFieldErrors["deskripsi"] || newFieldErrors["judulId"] || newFieldErrors["harga"]) {
        setFormTab("info");
      } else if (newFieldErrors["soalList"] || soalList.length === 0) {
        setFormTab("soal");
      } else {
        setFormTab("interpretasi");
      }
      handleSaveDraft(false); // Automatically keep draft safe without redirecting
      setNotification({
        type: "error",
        message: "Paket belum lengkap. Periksa tanda peringatan merah pada setiap field wajib.",
      });
      return;
    }

    // Validation passed! Publish package
    const titleName = paketData.nama.trim();
    const packageId = activeDraftPackageId || (typeof paketData.id === "string" && paketData.id.length > 10 ? paketData.id : null);

    setIsSubmitting(true);
    try {
      const apiPayload = {
        judul: titleName,
        deskripsi: paketData.deskripsi.trim(),
        banner_url: paketData.bannerUrl || null,
        benefits: (paketData.benefits || []).filter((b) => b.trim().length > 0),
        jenis_akses: (paketData.jenisAkses === "Gratis" ? "GRATIS" : "BERBAYAR") as any,
        harga: paketData.jenisAkses === "Gratis" ? 0 : (paketData.numericHarga || 0),
        status: "PUBLISHED" as const,
        soal_psikotes: soalList.map((s, idx) => ({
          urutan: idx + 1,
          pertanyaan: s.teks,
          pilihan_jawaban: s.pilihan.map((p, pIdx) => ({
            label: String.fromCharCode(65 + pIdx),
            teks_jawaban: p.text,
            bobot: parseInt(p.bobot) || 0,
          })),
        })),
        interpretasi_psikotes: interpretasiList.map((i, iIdx) => ({
          min_skor: parseInt(i.min) || 0,
          max_skor: parseInt(i.max) || 0,
          grade: i.kategori || `Grade ${iIdx + 1}`,
          judul: i.judul,
          deskripsi: i.deskripsi,
          makna: i.makna || "",
          tips: {
            saran: i.saran || [],
            kekuatanUtama: i.kekuatanUtama || [],
            blindspots: i.blindspots || [],
            lingkunganOptimal: i.lingkunganOptimal || [],
            judulKekuatan: i.judulKekuatan || "Potensi atau Kekuatan Utama",
            judulBlindspots: i.judulBlindspots || "Area yang Perlu Dikembangkan",
            judulLingkungan: i.judulLingkungan || "Kondisi atau Lingkungan yang Mendukung",
          } as any,
        })),
      };

      if (packageId && typeof packageId === "string" && packageId.length > 10) {
        await psikotesService.update(packageId, apiPayload);
      } else {
        await psikotesService.create(apiPayload);
      }

      await loadDataFromBackend();

      setNotification({
        type: "success",
        message: isEditingPublished
          ? `Perubahan paket psikotes "${titleName}" berhasil disimpan ke database!`
          : `Paket psikotes "${titleName} (${paketData.jenisAkses})" berhasil disimpan ke database dan kini aktif!`,
      });

      setActiveTab("paket");
      setIsEditingPackage(false);
    } catch (err: any) {
      console.error("Gagal mempublikasikan ke database:", err);
      setNotification({
        type: "error",
        message: `Gagal mempublikasikan: ${err.response?.data?.message || err.message || "Terjadi kesalahan"}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJudul = async (target: JudulPsikotesItem | string | number) => {
    const item = typeof target === "object" ? target : judulList.find((j) => j.id === target);
    const title = item ? item.judul : "judul psikotes ini";

    if (confirm(`Apakah Anda yakin ingin menghapus judul psikotes "${title}" beserta seluruh paket di dalamnya dari database?`)) {
      try {
        if (item) {
          for (const p of item.paketList) {
            if (typeof p.id === "string" && p.id.length > 10) {
              await psikotesService.delete(p.id);
            }
          }
        } else if (typeof target === "string" && target.length > 10) {
          await psikotesService.delete(target);
        }
        await loadDataFromBackend();
        const targetId = item ? item.id : target;
        setJudulList((prev) => prev.filter((j) => j.id !== targetId));
        if (selectedJudul && selectedJudul.id === targetId) {
          setSelectedJudul(null);
        }
        setNotification({
          type: "info",
          message: `Judul psikotes "${title}" berhasil dihapus dari database.`,
        });
      } catch (err: any) {
        console.error("Gagal menghapus:", err);
        setNotification({
          type: "error",
          message: `Gagal menghapus: ${err.response?.data?.message || err.message || "Terjadi kesalahan"}`,
        });
      }
    }
  };

  const getPesertaReportDetail = (peserta: AdminPsikotesPeserta) => {
    const paketLower = (peserta.paket || "").toLowerCase().trim();
    const skorLower = (peserta.skor || "").toLowerCase().trim();

    // 1. Ekstrak langsung dari peserta.hasil (Data Asli dari Database Hasil Tes Peserta)
    let detailJudul = peserta.hasil?.judul && peserta.hasil.judul !== "—" ? peserta.hasil.judul : "";
    let detailGrade = peserta.hasil?.grade && peserta.hasil.grade !== "—" ? peserta.hasil.grade : peserta.skor;
    let deskripsi = peserta.hasil?.deskripsi && peserta.hasil.deskripsi !== "—" ? peserta.hasil.deskripsi : "";
    let makna = peserta.hasil?.makna && peserta.hasil.makna !== "—" ? peserta.hasil.makna : "";

    let kekuatanUtama: string[] = [];
    let blindspots: string[] = [];
    let lingkunganOptimal: string[] = [];
    let tips: Array<{ title: string; desc: string }> = [];
    let judulKekuatan = "Potensi atau Kekuatan Utama";
    let judulBlindspots = "Area yang Perlu Dikembangkan";
    let judulLingkungan = "Kondisi atau Lingkungan yang Mendukung";

    // Parse tips jika disimpan dalam format objek JSON / string / array
    if (peserta.hasil?.tips) {
      let rawTips: any = peserta.hasil.tips;
      if (typeof rawTips === "string") {
        try {
          rawTips = JSON.parse(rawTips);
        } catch {
          rawTips = [];
        }
      }

      if (rawTips && typeof rawTips === "object" && !Array.isArray(rawTips)) {
        if (Array.isArray(rawTips.kekuatanUtama) && rawTips.kekuatanUtama.length > 0) {
          kekuatanUtama = rawTips.kekuatanUtama;
        }
        if (Array.isArray(rawTips.blindspots) && rawTips.blindspots.length > 0) {
          blindspots = rawTips.blindspots;
        }
        if (Array.isArray(rawTips.lingkunganOptimal) && rawTips.lingkunganOptimal.length > 0) {
          lingkunganOptimal = rawTips.lingkunganOptimal;
        }
        if (rawTips.judulKekuatan) judulKekuatan = rawTips.judulKekuatan;
        if (rawTips.judulBlindspots) judulBlindspots = rawTips.judulBlindspots;
        if (rawTips.judulLingkungan) judulLingkungan = rawTips.judulLingkungan;

        if (Array.isArray(rawTips.saran) && rawTips.saran.length > 0) {
          tips = rawTips.saran.map((s: any) =>
            typeof s === "string" ? { title: "Rekomendasi", desc: s } : s
          );
        }
      } else if (Array.isArray(rawTips) && rawTips.length > 0) {
        tips = rawTips.map((t: any) =>
          typeof t === "string" ? { title: "Rekomendasi", desc: t } : t
        );
      }
    }

    // 2. Jika ada informasi yang belum lengkap, cocokkan dengan interpretasi paket di judulList
    let interFound: Interpretasi | undefined;
    for (const j of judulList) {
      for (const p of j.paketList) {
        const pNama = p.namaJudul.toLowerCase().trim();
        const jJudul = j.judul.toLowerCase().trim();
        if (
          pNama === paketLower ||
          jJudul === paketLower ||
          paketLower.includes(jJudul) ||
          jJudul.includes(paketLower) ||
          paketLower.includes(pNama)
        ) {
          // Cari interpretasi yang benar-benar cocok dengan grade / skor peserta
          const matchInter = p.interpretasiList.find((i) => {
            const targetGrade = (detailGrade || peserta.skor || "").toLowerCase().trim();
            const targetJudul = (detailJudul || "").toLowerCase().trim();
            const iKat = (i.kategori || "").toLowerCase().trim();
            const iJud = (i.judul || "").toLowerCase().trim();

            if (targetGrade && (iKat === targetGrade || iJud.includes(targetGrade) || targetGrade.includes(iJud))) {
              return true;
            }
            if (targetJudul && (iJud === targetJudul || iJud.includes(targetJudul) || targetJudul.includes(iJud))) {
              return true;
            }
            if (peserta.totalSkor !== null && peserta.totalSkor !== undefined) {
              const min = Number(i.min);
              const max = Number(i.max);
              if (!isNaN(min) && !isNaN(max) && peserta.totalSkor >= min && peserta.totalSkor <= max) {
                return true;
              }
            }
            return false;
          });

          if (matchInter) {
            interFound = matchInter;
            break;
          }
        }
      }
      if (interFound) break;
    }

    if (interFound) {
      if (!detailJudul) detailJudul = interFound.judul;
      if (!deskripsi) deskripsi = interFound.deskripsi;
      if (!makna) makna = interFound.makna;
      if (kekuatanUtama.length === 0 && interFound.kekuatanUtama && interFound.kekuatanUtama.length > 0) {
        kekuatanUtama = interFound.kekuatanUtama;
      }
      if (blindspots.length === 0 && interFound.blindspots && interFound.blindspots.length > 0) {
        blindspots = interFound.blindspots;
      }
      if (lingkunganOptimal.length === 0 && interFound.lingkunganOptimal && interFound.lingkunganOptimal.length > 0) {
        lingkunganOptimal = interFound.lingkunganOptimal;
      }
      if (interFound.judulKekuatan) judulKekuatan = interFound.judulKekuatan;
      if (interFound.judulBlindspots) judulBlindspots = interFound.judulBlindspots;
      if (interFound.judulLingkungan) judulLingkungan = interFound.judulLingkungan;
      if (tips.length === 0 && interFound.saran && interFound.saran.length > 0) {
        tips = interFound.saran;
      }
    }

    // 3. Fallback cerdas spesifik sesuai tes dan skor peserta (bukan generic MBTI untuk semua tes)
    const isStres = paketLower.includes("stres") || paketLower.includes("stress") || paketLower.includes("burnout");
    const isLove = paketLower.includes("love") || paketLower.includes("cinta") || paketLower.includes("asmara");
    const isKarier = paketLower.includes("karier") || paketLower.includes("karir") || paketLower.includes("minat") || paketLower.includes("bakat");

    if (isStres) {
      const isHighStress =
        skorLower.includes("tinggi") ||
        skorLower.includes("berat") ||
        (peserta.totalSkor !== null && peserta.totalSkor !== undefined && peserta.totalSkor >= 15);
      const isLowStress =
        skorLower.includes("rendah") ||
        skorLower.includes("tenang") ||
        skorLower.includes("resiliensi") ||
        (peserta.totalSkor !== null && peserta.totalSkor !== undefined && peserta.totalSkor <= 7);

      if (isHighStress) {
        if (!detailJudul) detailJudul = "Beban Mental Tinggi (Indikasi Kejenuhan Ekstrem)";
        if (!deskripsi) deskripsi = "Tingkat stres psikologis dan beban emosionalmu saat ini tergolong tinggi. Kamu tengah mengalami tekanan kognitif dan keletihan mental signifikan yang membutuhkan penanganan serta jeda pemulihan.";
        if (!makna) makna = "Menunjukkan kondisi kelelahan psikis yang cukup mendalam. Hal ini dapat memengaruhi kestabilan mood, kualitas tidur, dan efektivitas kerja bila tidak segera diseimbangkan.";
        judulKekuatan = "Respon Adaptif & Kesadaran Diri";
        judulBlindspots = "Titik Rawan (Blindspots Stres)";
        judulLingkungan = "Kondisi Pemulihan Optimal";
        if (kekuatanUtama.length === 0) {
          kekuatanUtama = [
            "Kesadaran tinggi terhadap sinyal kelelahan fisik dan beban psikologis yang sedang dialami.",
            "Dedikasi dan rasa tanggung jawab yang sangat tinggi terhadap komitmen pekerjaan atau keluarga.",
            "Kesiapan mental untuk mencari solusi dan memulihkan kestabilan emosional secara proaktif."
          ];
        }
        if (blindspots.length === 0) {
          blindspots = [
            "Kecenderungan menumpuk beban mental sendirian tanpa segera mendelegasikan tugas.",
            "Sulit menolak permintaan baru sehingga batasan kapasitas diri terlewati (overwhelmed).",
            "Pola istirahat dan tidur yang terganggu akibat pikiran yang terus bekerja tanpa jeda."
          ];
        }
        if (lingkunganOptimal.length === 0) {
          lingkunganOptimal = [
            "Ruang kerja dengan ritme yang terprediksi dan ekspektasi beban tugas yang realistis.",
            "Budaya tim yang suportif, minim micromanagement, dan menghargai work-life balance.",
            "Akses mudah untuk beristirahat sejenak (micro-break) dan lingkungan kerja yang tenang."
          ];
        }
        if (tips.length === 0) {
          tips = [
            { title: "Dekompresi Mental Terjadwal", desc: "Terapkan jeda 10-15 menit di sela aktivitas harian tanpa paparan layar gadget atau pekerjaan." },
            { title: "Penetapan Batasan Asertif", desc: "Beranikan diri untuk mengatakan 'belum bisa saat ini' untuk permintaan di luar prioritas utama." },
            { title: "Dukungan Profesional & Konseling", desc: "Pertimbangkan sesi konseling dengan psikolog untuk mengurai akar pemicu stres secara bertahap." }
          ];
        }
      } else if (isLowStress) {
        if (!detailJudul) detailJudul = "Resiliensi Tinggi & Keseimbangan Emosi Prima";
        if (!deskripsi) deskripsi = "Tingkat stres psikologismu berada pada kategori rendah dan sangat terkendali. Kamu memiliki kapasitas resiliensi serta ketenangan emosi yang sangat prima dalam merespons dinamika tugas.";
        if (!makna) makna = "Menunjukkan kestabilan psikologis yang sehat, kemampuan koping stres yang matang, serta kebiasaan menjaga keseimbangan pikiran yang berjalan efektif.";
        judulKekuatan = "Kekuatan Regulasi Emosi";
        judulBlindspots = "Area Waspada Stres";
        judulLingkungan = "Kondisi Pertumbuhan Potensi";
        if (kekuatanUtama.length === 0) {
          kekuatanUtama = [
            "Kapasitas regulasi emosi yang stabil dalam merespons tekanan kerja dan tantangan mendadak.",
            "Kemampuan memilah mana hal yang berada dalam kendali diri vs di luar kendali secara objektif.",
            "Keseimbangan energi dan fokus yang konsisten dalam menyelesaikan target harian."
          ];
        }
        if (blindspots.length === 0) {
          blindspots = [
            "Bisa meremehkan potensi stres kumulatif jangka panjang karena merasa selalu mampu bertahan.",
            "Terkadang kurang sensitif terhadap rekan kerja yang memiliki ambang toleransi stres lebih rendah."
          ];
        }
        if (lingkunganOptimal.length === 0) {
          lingkunganOptimal = [
            "Lingkungan kerja dinamis yang memberikan ruang tantangan baru dan otonomi penuh.",
            "Komunitas profesional yang berorientasi pada pencapaian kolaboratif dan inovasi."
          ];
        }
        if (tips.length === 0) {
          tips = [
            { title: "Pertahankan Rutinitas Positif", desc: "Lanjutkan kebiasaan olahraga, pola tidur teratur, dan relaksasi yang menjaga ketenangan emosimu." },
            { title: "Dukungan Empatis untuk Tim", desc: "Bantu rekan tim yang sedang berjuang dengan beban mental melalui pendampingan suportif." }
          ];
        }
      } else {
        // Stres Sedang
        if (!detailJudul) detailJudul = "Tingkat Stres Moderat (Perlu Kewaspadaan Dini)";
        if (!deskripsi) deskripsi = "Tingkat stresmu berada pada ambang moderat. Meskipun masih dapat beraktivitas secara produktif, keletihan mental mulai terasa dan perlu diimbangi dengan manajemen istirahat yang lebih disiplin.";
        if (!makna) makna = "Sinyal alami bahwa tubuh dan pikiranmu membutuhkan penyelarasan kembali sebelum keletihan berkembang menjadi kejenuhan (burnout).";
        judulKekuatan = "Daya Tahan Kerja";
        judulBlindspots = "Faktor Pemicu Stres";
        judulLingkungan = "Kondisi Kerja Seimbang";
        if (kekuatanUtama.length === 0) {
          kekuatanUtama = [
            "Daya tahan mental yang cukup baik dalam menghadapi fluktuasi beban tugas harian.",
            "Mampu menyelesaikan tanggung jawab inti meskipun merasakan tekanan berkala."
          ];
        }
        if (blindspots.length === 0) {
          blindspots = [
            "Mulai muncul gejala keletihan fisik ringan dan penurunan konsentrasi di penghujung hari.",
            "Kecenderungan menunda waktu istirahat hingga pekerjaan benar-benar menumpuk."
          ];
        }
        if (lingkunganOptimal.length === 0) {
          lingkunganOptimal = [
            "Lingkungan dengan pembagian peran yang jelas dan komunikasi tim yang transparan.",
            "Fleksibilitas waktu kerja yang memungkinkan pemulihan energi secara mandiri."
          ];
        }
        if (tips.length === 0) {
          tips = [
            { title: "Audit Beban Kerja Mingguan", desc: "Identifikasi tugas yang bisa didelegasikan atau dipangkas untuk mengurangi beban kognitif." },
            { title: "Manajemen Jam Istirahat", desc: "Pastikan durasi tidur malam minimal 7 jam berkualitas tanpa distraksi layar gadget." }
          ];
        }
      }
    } else if (isLove) {
      if (skorLower.includes("quality") || skorLower.includes("waktu")) {
        if (!detailJudul) detailJudul = "Kualitas Waktu Bersama (Quality Time)";
        if (!deskripsi) deskripsi = "Bahasa cinta utamamu adalah Quality Time. Kamu paling merasa dihargai dan dicintai ketika seseorang memberikan perhatian penuh tanpa distraksi gadget atau kesibukan lain.";
        if (!makna) makna = "Momen kebersamaan mendalam, percakapan tatap muka yang tulus, dan kegiatan bersama menciptakan rasa keterikatan batin yang sangat kokoh bagimu.";
      } else if (skorLower.includes("service") || skorLower.includes("pelayanan") || skorLower.includes("tindakan")) {
        if (!detailJudul) detailJudul = "Tindakan Nyata & Bantuan Berarti (Acts of Service)";
        if (!deskripsi) deskripsi = "Bahasa cinta utamamu adalah Acts of Service. Tindakan nyata dan kesediaan meringankan bebanmu jauh lebih bermakna daripada sekadar kata-kata manis.";
        if (!makna) makna = "Ketika pasangan atau orang terdekat secara sukarela membantumu dalam tugas harian, kamu merasakan ketulusan kasih sayang yang autentik.";
      } else if (skorLower.includes("gift") || skorLower.includes("hadiah")) {
        if (!detailJudul) detailJudul = "Hadiah Penuh Makna (Receiving Gifts)";
        if (!deskripsi) deskripsi = "Bahasa cinta utamamu adalah Receiving Gifts. Kamu menghargai usaha, pemikiran, dan simbol kasih sayang yang terkandung di balik sebuah pemberian.";
        if (!makna) makna = "Bagi dirimu, hadiah bukanlah tentang nilai nominal, melainkan bukti nyata bahwa seseorang mengingat dan memikirkanmu secara istimewa.";
      } else if (skorLower.includes("touch") || skorLower.includes("sentuhan") || skorLower.includes("fisik")) {
        if (!detailJudul) detailJudul = "Sentuhan Fisik Hangat (Physical Touch)";
        if (!deskripsi) deskripsi = "Bahasa cinta utamamu adalah Physical Touch. Kehadiran fisik, pelukan hangat, dan sentuhan menenangkan memberikan rasa aman emosional yang kuat.";
        if (!makna) makna = "Sentuhan fisik yang tepat menyampaikan kehangatan, penerimaan, dan dukungan tanpa perlu sepatah kata pun diucapkan.";
      } else {
        if (!detailJudul) detailJudul = "Kata-Kata Apresiasi Tulus (Words of Affirmation)";
        if (!deskripsi) deskripsi = "Bahasa cinta utamamu adalah Words of Affirmation. Kamu paling merasa dihargai dan dicintai melalui kata-kata verbal yang tulus, pujian spesifik, dan komunikasi yang membangun.";
        if (!makna) makna = "Pujian yang tulus, ucapan terima kasih yang jujur, dan kata-kata penyemangat memiliki dampak emosional yang mendalam bagimu dalam memperkuat ikatan hubungan interpersonal.";
      }
      judulKekuatan = "Ekspresi Emosional";
      judulBlindspots = "Sensitivitas Relasi";
      judulLingkungan = "Lingkungan Hubungan Sehat";
      if (kekuatanUtama.length === 0) {
        kekuatanUtama = [
          "Kemampuan mengekspresikan empati yang menyejukkan dan memvalidasi perasaan orang lain.",
          "Sensitivitas tinggi terhadap kebutuhan emosional pasangan atau orang terdekat.",
          "Komitmen membangun ikatan yang hangat, terbuka, dan didasari rasa saling percaya."
        ];
      }
      if (blindspots.length === 0) {
        blindspots = [
          "Kerap menahan kekecewaan sendiri demi menjaga keharmonisan suasana di depan orang lain.",
          "Bisa merasa cemas atau meragukan ketulusan jika bahasa cinta yang dibutuhkan tidak terpenuhi."
        ];
      }
      if (lingkunganOptimal.length === 0) {
        lingkunganOptimal = [
          "Lingkungan relasi personal yang mengedepankan komunikasi terbuka dan apresiasi timbal balik.",
          "Pola interaksi yang asertif, jujur, dan bebas dari sindiran atau sarkasme pasif."
        ];
      }
      if (tips.length === 0) {
        tips = [
          { title: "Komunikasikan Kebutuhan Secara Jelas", desc: "Jangan berasumsi orang lain membaca pikiranmu; sampaikan kebutuhan emosionalmu dengan bahasa yang hangat." },
          { title: "Pahami Bahasa Cinta Pasangan", desc: "Pelajari cara pasangan mengekspresikan kasih sayangnya agar tidak terjadi kesalahpahaman persepsi." }
        ];
      }
    } else if (isKarier) {
      if (!detailJudul) detailJudul = peserta.skor ? `Profil Minat: ${peserta.skor}` : "Profil Eksplorasi Karier";
      if (!deskripsi) deskripsi = "Dominasi minat berfokus pada inovasi, pemecahan masalah strategis, serta komunikasi persuasif yang berakar pada empati tulus.";
      if (!makna) makna = "Unggul dalam peran yang mengkombinasikan analisis mendalam, koordinasi tim, dan penciptaan dampak nyata bagi orang banyak.";
      judulKekuatan = "Kekuatan Profesional Utama";
      judulBlindspots = "Tantangan Pengembangan Karier";
      judulLingkungan = "Ekosistem Kerja Produktif";
      if (kekuatanUtama.length === 0) {
        kekuatanUtama = [
          "Kreativitas tinggi dalam merumuskan strategi dan memecahkan masalah kompleks.",
          "Kecerdasan emosional yang mendukung komunikasi asertif, diplomatis, dan kolaboratif.",
          "Kemampuan menerjemahkan ide abstrak menjadi langkah aksi implementatif yang terukur."
        ];
      }
      if (blindspots.length === 0) {
        blindspots = [
          "Cenderung perfeksionis dan kerap overthinking terhadap evaluasi orang lain.",
          "Sulit menetapkan batasan profesional ketika tanggung jawab kerja menyentuh empati personal."
        ];
      }
      if (lingkunganOptimal.length === 0) {
        lingkunganOptimal = [
          "Organisasi dengan kultur terbuka, suportif, dan menghargai ide-ide pembaruan.",
          "Peran yang memberikan fleksibilitas serta ruang kolaborasi lintas divisi."
        ];
      }
      if (tips.length === 0) {
        tips = [
          { title: "Perluas Jejaring Profesional", desc: "Aktif membangun koneksi di industri yang sesuai dengan profil minat dan nilai pribadimu." },
          { title: "Kembangkan Keterampilan Khusus", desc: "Ikuti pelatihan atau sertifikasi mendalam pada bidang yang menjadi kekuatan intimu." }
        ];
      }
    } else {
      if (!detailJudul) detailJudul = peserta.skor || "Profil Karakteristik Personal";
      if (!deskripsi) deskripsi = "Karakteristikmu mencerminkan kecenderungan analitis yang terstruktur, gaya komunikasi empatik, serta orientasi tinggi terhadap pencapaian dan kolaborasi tim.";
      if (!makna) makna = "Mampu membangun keselarasan kerja, merumuskan solusi berpusat pada manusia, serta menginspirasi rekan dengan keteladanan yang konsisten.";
    }

    if (kekuatanUtama.length === 0) {
      kekuatanUtama = [
        "Komunikasi persuasif yang berakar pada empati tulus dan pemahaman interpersonal.",
        "Kemampuan membangun keselarasan dan kohesi tim kerja dalam mencapai target bersama.",
        "Ketajaman dalam merumuskan solusi strategis yang tetap berpusat pada kesejahteraan manusia."
      ];
    }
    if (blindspots.length === 0) {
      blindspots = [
        "Cenderung mengabaikan kebutuhan diri sendiri demi mendahulukan kepentingan orang lain.",
        "Rentan mengalami kelelahan emosional (burnout) jika terlalu banyak menyerap beban lingkungan.",
        "Sulit menolak permintaan tambahan atau menetapkan batasan beban kerja pribadi yang tegas."
      ];
    }
    if (lingkunganOptimal.length === 0) {
      lingkunganOptimal = [
        "Lingkungan kerja kolaboratif dengan budaya apresiasi yang transparan.",
        "Posisi strategis yang memberikan kejelasan peran serta ruang inisiatif mandiri.",
        "Budaya organisasi yang menghargai keseimbangan kerja dan kesejahteraan mental."
      ];
    }
    if (tips.length === 0) {
      tips = [
        { title: "Manajemen Batasan Diri", desc: "Luangkan waktu hening untuk merefleksikan kebutuhan pribadi sebelum merespons permintaan orang lain." },
        { title: "Komunikasi Asertif Bertahap", desc: "Latihlah untuk menyampaikan pandangan kritis secara konstruktif tanpa rasa bersalah yang berlebihan." },
        { title: "Fokus Pengembangan Talenta", desc: "Prioritaskan proyek-proyek kolaboratif yang menuntut empati tinggi dan kepemimpinan suportif." }
      ];
    }

    return {
      judul: detailJudul,
      grade: detailGrade,
      deskripsi,
      makna,
      kekuatanUtama,
      blindspots,
      lingkunganOptimal,
      judulKekuatan,
      judulBlindspots,
      judulLingkungan,
      tips,
    };
  };

  const handleDownloadPdf = (peserta: AdminPsikotesPeserta) => {
    const detail = getPesertaReportDetail(peserta);
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    const tipsHtml = detail.tips.map((t, idx) => `
      <div style="display: flex; gap: 14px; padding: 14px 18px; border-radius: 14px; background: #f9fafb; border: 1px solid #f3f4f6; margin-bottom: 10px;">
        <div style="width: 22px; height: 22px; border-radius: 50%; background: #561269; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; flex-shrink: 0; margin-top: 2px;">
          ${idx + 1}
        </div>
        <div>
          <div style="font-weight: 700; font-size: 13px; color: #111827;">${t.title}</div>
          <div style="font-size: 12px; color: #4b5563; margin-top: 2px; line-height: 1.5;">${t.desc}</div>
        </div>
      </div>
    `).join("");

    const kekuatanHtml = detail.kekuatanUtama.map(item => `
      <li style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 12px; color: #064e3b; line-height: 1.5;">
        <span style="color: #059669; font-weight: bold;">✔</span>
        <span>${item}</span>
      </li>
    `).join("");

    const blindspotHtml = detail.blindspots.map(item => `
      <li style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 12px; color: #881337; line-height: 1.5;">
        <span style="color: #e11d48; font-weight: bold;">⚠</span>
        <span>${item}</span>
      </li>
    `).join("");

    const lingkunganHtml = detail.lingkunganOptimal.map(item => `
      <li style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 12px; color: #78350f; line-height: 1.5;">
        <span style="color: #d97706; font-weight: bold;">✦</span>
        <span>${item}</span>
      </li>
    `).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Hasil Psikotes - ${peserta.nama} - Empathika</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #FAFAFC;
              color: #1f2937;
              margin: 0;
              padding: 0;
              line-height: 1.6;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print-bar {
              position: sticky;
              top: 0;
              background: #561269;
              color: #ffffff;
              padding: 12px 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              box-shadow: 0 4px 14px rgba(0,0,0,0.15);
              z-index: 9999;
            }
            .report-container {
              max-width: 860px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 28px;
              border: 1px solid #e5e7eb;
              padding: 40px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.04);
            }
            .header-badge {
              display: inline-block;
              font-size: 11px;
              font-weight: 800;
              color: #561269;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin-bottom: 6px;
            }
            .report-title {
              font-size: 26px;
              font-weight: 800;
              color: #111827;
              line-height: 1.25;
              margin: 0;
            }
            .client-meta-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              background: #f9fafb;
              border: 1px solid #f3f4f6;
              border-radius: 18px;
              padding: 16px 20px;
              margin: 24px 0 32px 0;
            }
            .meta-label {
              font-size: 10px;
              font-weight: 700;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .meta-val {
              font-size: 13px;
              font-weight: 700;
              color: #111827;
              margin-top: 2px;
            }
            .hero-result-card {
              background: #ffffff;
              border-radius: 24px;
              border: 1.5px solid #e5e7eb;
              padding: 32px 24px;
              text-align: center;
              margin-bottom: 30px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.02);
            }
            .hero-badge-title {
              font-size: 13px;
              font-weight: 600;
              color: #6b7280;
              margin-bottom: 6px;
            }
            .hero-score-val {
              font-size: 38px;
              font-weight: 900;
              color: #561269;
              letter-spacing: -0.5px;
              margin: 0 0 12px 0;
            }
            .hero-desc {
              font-size: 13px;
              color: #4b5563;
              max-width: 620px;
              margin: 0 auto;
              line-height: 1.6;
            }
            .section-box {
              background: #ffffff;
              border-radius: 22px;
              border: 1px solid #e5e7eb;
              padding: 24px 28px;
              margin-bottom: 24px;
            }
            .section-heading {
              font-size: 16px;
              font-weight: 800;
              color: #111827;
              margin: 0 0 6px 0;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .section-sub {
              font-size: 12px;
              color: #6b7280;
              margin: 0 0 16px 0;
            }
            .two-col-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
            }
            .card-strength {
              background: #ecfdf5;
              border: 1px solid #a7f3d0;
              border-radius: 18px;
              padding: 20px;
            }
            .card-blindspot {
              background: #fff1f2;
              border: 1px solid #fecdd3;
              border-radius: 18px;
              padding: 20px;
            }
            .card-amber {
              background: #fffbeb;
              border: 1px solid #fde68a;
              border-radius: 18px;
              padding: 20px;
            }
            .signature-area {
              margin-top: 40px;
              padding-top: 24px;
              border-top: 1px dashed #e5e7eb;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            @media print {
              .no-print-bar { display: none !important; }
              body { background: white !important; padding: 0 !important; color: #1f2937 !important; }
              .report-container {
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
              }
              .report-title {
                font-size: 20px !important;
              }
              .hero-score-val {
                font-size: 24px !important;
                margin: 0 0 6px 0 !important;
              }
              .hero-result-card {
                padding: 16px 20px !important;
                border-radius: 12px !important;
                margin-bottom: 14px !important;
                border: 1px solid #e5e7eb !important;
                box-shadow: none !important;
              }
              .section-box {
                padding: 14px 18px !important;
                border-radius: 12px !important;
                margin-bottom: 14px !important;
                border: 1px solid #e5e7eb !important;
                box-shadow: none !important;
              }
              .client-meta-grid {
                margin: 14px 0 18px 0 !important;
                padding: 12px 14px !important;
                border-radius: 12px !important;
                gap: 10px !important;
              }
              .card-strength, .card-blindspot, .card-amber {
                padding: 12px 14px !important;
                border-radius: 10px !important;
              }
              .signature-area {
                margin-top: 20px !important;
                padding-top: 14px !important;
                page-break-inside: avoid !important;
              }
              @page {
                size: A4 portrait;
                margin: 10mm 12mm 10mm 12mm;
              }
              .section-box, .hero-result-card, .two-col-grid, .signature-area {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="no-print-bar">
            <div>
              <strong style="font-size: 14px;">Laporan Resmi Asesmen Psikotes Empathika</strong>
              <span style="font-size: 12px; opacity: 0.85; margin-left: 8px;">(${peserta.nama} &middot; ${peserta.paket})</span>
            </div>
            <div style="display: flex; gap: 10px;">
              <button onclick="window.print()" style="background: #ffffff; color: #561269; border: none; padding: 7px 18px; border-radius: 9999px; font-weight: 700; font-size: 12px; cursor: pointer;">
                Download / Simpan sebagai PDF
              </button>
              <button onclick="window.close()" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 7px 14px; border-radius: 9999px; font-size: 12px; cursor: pointer;">
                Tutup Tab
              </button>
            </div>
          </div>

          <div class="report-container">
            <!-- Header Brand -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #561269;">
              <div>
                <span class="header-badge">Laporan Analisis Asesmen Psikotes</span>
                <h1 class="report-title">${peserta.paket}</h1>
                <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">
                  Evaluasi mendalam profil personal, gaya komunikasi, serta panduan pengembangan potensi dirimu.
                </p>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 22px; font-weight: 900; color: #561269; letter-spacing: -0.5px;">EMPATHIKA</div>
                <div style="font-size: 11px; color: #6b7280;">Biro Psikologi &amp; Layanan Asesmen Digital</div>
              </div>
            </div>

            <!-- Client Metadata -->
            <div class="client-meta-grid">
              <div>
                <div class="meta-label">Nama Klien</div>
                <div class="meta-val">${peserta.nama}</div>
              </div>
              <div>
                <div class="meta-label">Kontak WhatsApp</div>
                <div class="meta-val" style="color: #059669;">${peserta.noHp}</div>
              </div>
              <div>
                <div class="meta-label">Tanggal Asesmen</div>
                <div class="meta-val">${peserta.tanggal}</div>
              </div>
              <div>
                <div class="meta-label">Status Verifikasi</div>
                <div class="meta-val" style="color: #561269;">Terverifikasi Resmi</div>
              </div>
            </div>

            <!-- 1. Hasil Utama -->
            <div class="hero-result-card">
              <div class="hero-badge-title">Profil Karakteristik Utama</div>
              <h2 class="hero-score-val">${peserta.skor || detail.grade}</h2>
              ${detail.judul && detail.judul !== peserta.skor && detail.judul !== detail.grade && detail.judul !== "—" ? `<div style="font-size: 15px; font-weight: 700; color: #374151; margin-bottom: 8px;">${detail.judul}</div>` : ""}
              <p class="hero-desc">${detail.deskripsi}</p>
            </div>

            <!-- 2. Interpretasi & Implikasi -->
            <div class="section-box">
              <h3 class="section-heading">Interpretasi Hasil</h3>
              <p style="font-size: 13px; color: #4b5563; margin: 0 0 16px 0; line-height: 1.6;">
                ${detail.deskripsi}
              </p>

              <div style="padding: 16px 20px; border-radius: 14px; background: #faf8fb; border: 1px solid #efe7f2;">
                <div style="font-size: 11px; font-weight: 800; color: #561269; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                  Makna Hasil dalam Kehidupan Sehari-hari
                </div>
                <p style="font-size: 12px; color: #374151; margin: 0; line-height: 1.6;">
                  ${detail.makna}
                </p>
              </div>
            </div>

            <!-- 3. Karakteristik: Kekuatan Utama vs Blindspots -->
            <div class="section-box">
              <h3 class="section-heading">Analisis Karakteristik &amp; Dinamika Diri</h3>
              <p class="section-sub">Pemetaan keunggulan utama serta area pengembangan yang perlu kamu perhatikan untuk berkembang optimal:</p>

              <div class="two-col-grid">
                <div class="card-strength">
                  <div style="font-size: 12px; font-weight: 800; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                    ${detail.judulKekuatan || "Potensi atau Kekuatan Utama"}
                  </div>
                  <ul style="margin: 0; padding: 0; list-style: none;">
                    ${kekuatanHtml}
                  </ul>
                </div>

                <div class="card-blindspot">
                  <div style="font-size: 12px; font-weight: 800; color: #9f1239; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                    ${detail.judulBlindspots || "Area yang Perlu Dikembangkan"}
                  </div>
                  <ul style="margin: 0; padding: 0; list-style: none;">
                    ${blindspotHtml}
                  </ul>
                </div>
              </div>
            </div>

            <!-- 4. Lingkungan & Budaya Optimal -->
            <div class="section-box">
              <h3 class="section-heading">${detail.judulLingkungan || "Kondisi atau Lingkungan yang Mendukung"}</h3>
              <p class="section-sub">Kondisi eksternal yang paling mendukung performa optimal dan kesejahteraan emosionalmu:</p>
              <div class="card-amber">
                <ul style="margin: 0; padding: 0; list-style: none;">
                  ${lingkunganHtml}
                </ul>
              </div>
            </div>

            <!-- 5. Langkah Pengembangan Diri -->
            <div class="section-box">
              <h3 class="section-heading">Langkah Pengembangan Diri</h3>
              <p class="section-sub">Saran praktis untuk memaksimalkan potensi dan menjaga keseimbangan energimu:</p>
              ${tipsHtml}
            </div>

            <!-- Footer Tanda Tangan Resmi -->
            <div class="signature-area">
              <div style="font-size: 11px; color: #9ca3af;">
                ID Dokumen: EMP-PSI-${String(peserta.id).padStart(6, '0')}<br/>
                Sistem Layanan Psikotes Terverifikasi Empathika
              </div>
              <div style="text-align: center; width: 250px;">
                <div style="font-size: 12px; color: #4b5563; margin-bottom: 50px;">
                  Bandung, ${peserta.tanggal}<br/>
                  Tim Asesor Asesmen Psikologi,
                </div>
                <div style="font-size: 13px; font-weight: 800; color: #111827; border-top: 1.5px solid #111827; padding-top: 6px;">
                  Empathika Psychological Center
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 450);
  };

  // Peserta Table Columns
  const pesertaColumns: ColumnDef<AdminPsikotesPeserta>[] = [
    {
      key: "peserta",
      header: "Nama Peserta",
      render: (peserta: AdminPsikotesPeserta) => (
        <span className="font-extrabold text-gray-900 leading-tight block">
          {peserta.nama}
        </span>
      ),
    },
    {
      key: "kontak",
      header: "Kontak",
      render: (peserta: AdminPsikotesPeserta) => {
        if (!peserta.noHp || peserta.noHp === "—") {
          return <span className="text-gray-400 italic text-xs">—</span>;
        }
        return (
          <a
            href={`https://wa.me/${peserta.noHp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold text-xs sm:text-sm"
          >
            {peserta.noHp}
          </a>
        );
      },
    },
    {
      key: "paket",
      header: "Paket Tes",
      render: (peserta: AdminPsikotesPeserta) => (
        <span className="font-semibold text-gray-800">{peserta.paket}</span>
      ),
    },
    {
      key: "skor",
      header: "Hasil Asesmen",
      render: (peserta: AdminPsikotesPeserta) => (
        <span className="text-xs font-bold text-[#561269] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
          {peserta.skor || "—"}
        </span>
      ),
    },
    {
      key: "tanggal",
      header: "Tanggal",
      render: (peserta: AdminPsikotesPeserta) => (
        <span className="text-gray-600 font-medium text-xs sm:text-sm">{peserta.tanggal}</span>
      ),
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      render: (peserta: AdminPsikotesPeserta) => (
        <div className="flex items-center justify-center">
          <ActionButtonDetail onClick={() => setSelectedPeserta(peserta)} title="Lihat Detail Peserta" />
        </div>
      ),
    },
  ];



  // Judul & Paket Table Columns (Note: NO EDIT BUTTON anywhere per Requirement 4!)
  const judulColumns: ColumnDef<JudulPsikotesItem>[] = [
    {
      key: "judul",
      header: "Judul Psikotes",
      render: (item: JudulPsikotesItem) => (
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 rounded-xl overflow-hidden bg-gray-200/90 shadow-inner flex items-center justify-center">
            <img src={item.image} alt={item.judul} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span
              onClick={() => setSelectedJudul(item)}
              className="font-extrabold text-gray-900 leading-tight hover:text-[#561269] transition-colors cursor-pointer"
            >
              {item.judul}
            </span>
            <span className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.deskripsi}</span>
          </div>
        </div>
      ),
    },
    {
      key: "paketTersedia",
      header: "Paket & Akses",
      render: (item: JudulPsikotesItem) => {
        const gratis =
          item.paketList.find((p) => p.jenisAkses === "Gratis" && (paketFilter === "Draf" ? p.status === "Draf" : p.status === "Aktif")) ||
          item.paketList.find((p) => p.jenisAkses === "Gratis");
        const berbayar =
          item.paketList.find((p) => p.jenisAkses === "Berbayar" && (paketFilter === "Draf" ? p.status === "Draf" : p.status === "Aktif")) ||
          item.paketList.find((p) => p.jenisAkses === "Berbayar");

        return (
          <div className="flex items-center gap-2">
            {gratis && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  gratis.status === "Aktif"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${gratis.status === "Aktif" ? "bg-emerald-500" : "bg-amber-500"}`} />
                Gratis
                {gratis.status === "Draf" && (
                  <span className="text-[10px] text-amber-600 font-medium">(Draf)</span>
                )}
              </span>
            )}
            {berbayar && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  berbayar.status === "Aktif"
                    ? "bg-purple-50 text-[#561269] border border-purple-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${berbayar.status === "Aktif" ? "bg-[#561269]" : "bg-amber-500"}`} />
                Berbayar
                {berbayar.status === "Draf" && (
                  <span className="text-[10px] text-amber-600 font-medium">(Draf)</span>
                )}
              </span>
            )}
            {!gratis && !berbayar && (
              <span className="text-xs text-gray-400 italic">Belum ada paket</span>
            )}
          </div>
        );
      },
    },
    {
      key: "harga",
      header: "Harga",
      render: (item: JudulPsikotesItem) => {
        const berbayar =
          item.paketList.find((p) => p.jenisAkses === "Berbayar" && (paketFilter === "Draf" ? p.status === "Draf" : p.status === "Aktif")) ||
          item.paketList.find((p) => p.jenisAkses === "Berbayar");

        if (berbayar && berbayar.harga) {
          return (
            <span className="text-sm font-semibold text-gray-900">
              {berbayar.harga}
            </span>
          );
        }

        return <span className="text-sm text-gray-400 font-medium">—</span>;
      },
    },
    {
      key: "status",
      header: "Status",
      render: (item: JudulPsikotesItem) => {
        const hasDraft = item.paketList.some((p) => p.status === "Draf");
        const hasAktif = item.paketList.some((p) => p.status === "Aktif");

        if (hasDraft && hasAktif) {
          return (
            <AdminStatusBadge variant="warning" className="w-32">
              Aktif &amp; Draf
            </AdminStatusBadge>
          );
        }
        if (hasDraft) {
          return (
            <AdminStatusBadge variant="warning" className="w-28">
              Draf
            </AdminStatusBadge>
          );
        }
        return (
          <AdminStatusBadge variant="success" className="w-28">
            Dipublikasi
          </AdminStatusBadge>
        );
      },
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      render: (item: JudulPsikotesItem) => {
        const draftPaket = item.paketList.find((p) => p.status === "Draf");
        const activePaket = item.paketList.find((p) => p.status === "Aktif");
        const targetEdit = paketFilter === "Draf" ? (draftPaket || activePaket) : (activePaket || draftPaket);

        return (
          <div className="flex items-center justify-center gap-2">
            <ActionButtonDetail onClick={() => setSelectedJudul(item)} title="Lihat Detail Psikotes" />

            {/* Tombol Aksi Edit */}
            {targetEdit && (
              <ActionButtonEdit
                onClick={() => {
                  if (item.paketList.length > 1) {
                    setSelectedJudul(item);
                  } else {
                    handleEditPaket(item, targetEdit);
                  }
                }}
                title={item.paketList.length > 1 ? "Kelola / Edit Paket" : "Edit Paket Psikotes"}
              />
            )}

            {/* Quick Resume Draft Action if draft exists */}
            {draftPaket && (
              <button
                type="button"
                onClick={() => resumeDraft(item, draftPaket)}
                title="Lanjutkan Draf"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" /> Lanjutkan Draf
              </button>
            )}

            <ActionButtonDelete onClick={() => handleDeleteJudul(item)} title="Hapus Judul" />
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6 font-poppins pb-16">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${notification.type === "success"
              ? "bg-emerald-600 text-white"
              : notification.type === "error"
                ? "bg-red-600 text-white"
                : "bg-[#561269] text-white"
            }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metric Cards Statistik Pengerjaan Asesmen (Paling Atas) */}
      {activeTab !== "form-paket" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Total Peserta Berbayar</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#561269] mt-1 block">
                {pesertaSummary.total_berbayar}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5 block">Memiliki data kontak &amp; WhatsApp</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#561269] flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Total Peserta Gratis</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1 block">
                {pesertaSummary.total_gratis}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5 block">Aktivitas pengerjaan publik (Lead magnet)</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Total Semua Peserta Psikotes</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-700 mt-1 block">
                {pesertaSummary.total_peserta || (pesertaSummary.total_berbayar + pesertaSummary.total_gratis)}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5 block">Akumulasi seluruh peserta psikotes</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Tombol Tab Navigasi: Peserta & Paket (Compact & Proporsional) */}
      {activeTab !== "form-paket" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Tombol Data Peserta */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("peserta");
              loadPesertaFromBackend();
            }}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.99] ${
              activeTab === "peserta"
                ? "bg-[#D3C4D8] border-[#bca7c3] shadow-xs"
                : "bg-white text-gray-800 border-gray-200 hover:border-[#bca7c3] hover:bg-[#D3C4D8]/20 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 transition-colors ${
                  activeTab === "peserta"
                    ? "bg-white/80 text-[#561269] shadow-2xs"
                    : "bg-purple-50 text-[#561269] group-hover:bg-purple-100"
                }`}
              >
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider block ${
                    activeTab === "peserta" ? "text-[#561269]" : "text-gray-400"
                  }`}
                >
                  Data Peserta &amp; Hasil Tes
                </span>
                <p className="text-lg font-extrabold tracking-tight truncate text-gray-900">
                  {pesertaSummary.total_berbayar} Peserta
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  activeTab === "peserta"
                    ? "text-[#561269] translate-x-0.5"
                    : "text-gray-400 group-hover:text-[#561269] group-hover:translate-x-0.5"
                }`}
              />
            </div>
          </button>

          {/* Tombol Kelola Paket */}
          <button
            type="button"
            onClick={() => setActiveTab("paket")}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.99] ${
              activeTab === "paket"
                ? "bg-[#D3C4D8] border-[#bca7c3] shadow-xs"
                : "bg-white text-gray-800 border-gray-200 hover:border-[#bca7c3] hover:bg-[#D3C4D8]/20 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 transition-colors ${
                  activeTab === "paket"
                    ? "bg-white/80 text-[#561269] shadow-2xs"
                    : "bg-purple-50 text-[#561269] group-hover:bg-purple-100"
                }`}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider block ${
                    activeTab === "paket" ? "text-[#561269]" : "text-gray-400"
                  }`}
                >
                  Kelola Paket Psikotes
                </span>
                <p className="text-lg font-extrabold tracking-tight truncate text-gray-900">
                  {totalPaketCount} Paket
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  activeTab === "paket"
                    ? "text-[#561269] translate-x-0.5"
                    : "text-gray-400 group-hover:text-[#561269] group-hover:translate-x-0.5"
                }`}
              />
            </div>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. DAFTAR PESERTA TAB (OPSI 2: FOKUS BERBAYAR + RINGKASAN GRATIS) */}
      {/* ========================================================= */}
      {activeTab === "peserta" && (
        <div className="flex flex-col gap-6">

          <AdminTableContainer>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Daftar Klien Psikotes Berbayar
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Daftar klien yang menyelesaikan asesmen berbayar beserta kontak WhatsApp untuk ditindaklanjuti.
                </p>
              </div>

              <button
                type="button"
                onClick={loadPesertaFromBackend}
                disabled={isLoadingPeserta}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-[#561269] shadow-2xs transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
              >
                {isLoadingPeserta ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memperbarui data...</span>
                  </>
                ) : (
                  <span>Perbarui Data Peserta</span>
                )}
              </button>
            </div>

            <AdminDataTable
              columns={pesertaColumns}
              data={filteredPeserta}
              keyExtractor={(item) => String(item.id)}
              emptyMessage="Belum ada data klien psikotes berbayar yang terdata."
            />
          </AdminTableContainer>

        </div>
      )}


      {/* ========================================================= */}
      {/* 2. KELOLA PAKET TAB (Judul Psikotes & Paket List) */}
      {/* ========================================================= */}
      {activeTab === "paket" && (
        <AdminTableContainer>
          {/* Filter Tabs & Search Header */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 sm:gap-6 border-b border-gray-100 overflow-x-auto pb-2 text-sm">
                {(["Dipublikasi", "Draf"] as const).map((filter) => (
                  <AdminFilterTabItem
                    key={filter}
                    label={
                      filter === "Draf"
                        ? `Draft Tersimpan (${totalDraftCount})`
                        : "Sudah Dipublikasi"
                    }
                    isActive={paketFilter === filter}
                    onClick={() => setPaketFilter(filter)}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => openFormTambah()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] px-6 py-2.5 text-sm font-bold text-gray-950 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" /> Tambah Paket Psikotes
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 mt-2">
              <AdminSearchInput
                placeholder="Cari judul psikotes..."
                value={searchPaket}
                onChange={setSearchPaket}
              />
              <span className="text-xs text-gray-500 font-medium shrink-0">
                Menampilkan {filteredJudul.length} dari {judulList.length} instrumen psikotes
              </span>
            </div>
          </div>

          <AdminDataTable
            columns={judulColumns}
            data={filteredJudul}
            keyExtractor={(item) => item.id}
            emptyMessage={
              paketFilter === "Draf"
                ? "Tidak ada draf paket psikotes tersimpan."
                : "Tidak ada paket psikotes yang cocok dengan filter atau pencarian."
            }
          />
        </AdminTableContainer>
      )}

      {/* ========================================================= */}
      {/* 3. FORM PAKET SECTION (Tambah Paket / Lanjutkan Draf) */}
      {/* ========================================================= */}
      {activeTab === "form-paket" && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          {/* Header & Back Button */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <button
                onClick={() => {
                  if (confirm("Kembali ke daftar? Perubahan yang belum Anda simpan sebagai draf tidak akan tersimpan.")) {
                    setActiveTab("paket");
                    setIsEditingPackage(false);
                  }
                }}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-2 text-sm font-semibold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar Psikotes
              </button>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center flex-wrap gap-3">
                {isEditMode
                  ? `Edit Paket Psikotes (${paketData.jenisAkses})`
                  : isResumingDraft
                  ? "Lanjutkan Pengerjaan Draf Paket"
                  : "Kelola Paket Psikotes Baru"}
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${paketData.jenisAkses === "Gratis"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-purple-100 text-[#561269]"
                    }`}
                >
                  Paket {paketData.jenisAkses}
                </span>
                {isEditingPublished && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    hasParticipants ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}>
                    {hasParticipants ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" /> Ada Riwayat Peserta
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" /> Belum Ada Peserta (Bebas Edit)
                      </>
                    )}
                  </span>
                )}
              </h2>
            </div>

            {/* Always accessible Save Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onSaveDraftClick}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                title="Simpan data saat ini sebagai Draf"
              >
                <Save className="w-4 h-4 text-amber-700" /> Simpan Sebagai Draf
              </button>

              {isEditingPublished && (
                <button
                  type="button"
                  onClick={() => handleSaveDraft(true, "PUBLISHED")}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Simpan perubahan langsung ke paket aktif"
                >
                  <Save className="w-4 h-4 text-[#561269]" /> Simpan Perubahan
                </button>
              )}
            </div>
          </div>

          {/* Validation Alert Banner */}
          {formErrors.length > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 animate-in fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm mb-1">
                    Paket belum dapat dipublikasikan karena informasi wajib belum lengkap:
                  </h4>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    {errorsMap(formErrors).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-red-700 mt-2 font-medium">
                    (Data pengerjaan Anda telah otomatis tersimpan sehingga tidak hilang.)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-3xl mx-auto relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>
              {/* Step 1 */}
              <button
                type="button"
                onClick={() => handleTabSwitch("info")}
                className="flex flex-col items-center gap-2 bg-[#fdfdfd] px-2 cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${formTab === "info"
                      ? "bg-[#561269] text-white ring-4 ring-[#561269]/20"
                      : "bg-emerald-500 text-white"
                    }`}
                >
                  {formTab !== "info" ? <CheckCircle className="w-5 h-5" /> : 1}
                </div>
                <span className={`text-xs font-semibold ${formTab === "info" ? "text-[#561269]" : "text-gray-500"}`}>
                  Informasi Paket
                </span>
              </button>

              {/* Step 2 */}
              <button
                type="button"
                onClick={() => handleTabSwitch("soal")}
                className="flex flex-col items-center gap-2 bg-[#fdfdfd] px-2 cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${formTab === "soal"
                      ? "bg-[#561269] text-white ring-4 ring-[#561269]/20"
                      : formTab === "preview" || formTab === "interpretasi"
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                >
                  {formTab === "preview" || formTab === "interpretasi" ? <CheckCircle className="w-5 h-5" /> : 2}
                </div>
                <span className={`text-xs font-semibold ${formTab === "soal" ? "text-[#561269]" : "text-gray-500"}`}>
                  Pengisian Soal ({soalList.length})
                </span>
              </button>

              {/* Step 3 */}
              <button
                type="button"
                onClick={() => handleTabSwitch("preview")}
                className="flex flex-col items-center gap-2 bg-[#fdfdfd] px-2 cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${formTab === "preview"
                      ? "bg-[#561269] text-white ring-4 ring-[#561269]/20"
                      : formTab === "interpretasi"
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                >
                  {formTab === "interpretasi" ? <CheckCircle className="w-5 h-5" /> : 3}
                </div>
                <span className={`text-xs font-semibold ${formTab === "preview" ? "text-[#561269]" : "text-gray-500"}`}>
                  Preview Soal
                </span>
              </button>

              {/* Step 4 */}
              <button
                type="button"
                onClick={() => handleTabSwitch("interpretasi")}
                className="flex flex-col items-center gap-2 bg-[#fdfdfd] px-2 cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${formTab === "interpretasi"
                      ? "bg-[#561269] text-white ring-4 ring-[#561269]/20"
                      : "bg-gray-200 text-gray-500"
                    }`}
                >
                  4
                </div>
                <span
                  className={`text-xs font-semibold ${formTab === "interpretasi" ? "text-[#561269]" : "text-gray-500"}`}
                >
                  Interpretasi Hasil
                </span>
              </button>
            </div>
          </div>

          {/* Form Content Container */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            {/* ========================================== */}
            {/* STEP 1: INFORMASI PAKET */}
            {/* ========================================== */}
            {formTab === "info" && (
              <div className="animate-in fade-in space-y-8 max-w-4xl mx-auto">
                {/* 1.1 Mode Pemilihan Judul Psikotes (Hanya tampil saat buat paket baru, bukan saat edit) */}
                {!isEditMode && (
                  <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Target Judul Psikotes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label
                        className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition ${paketData.modeJudul === "baru"
                            ? "border-[#561269] bg-purple-50/50"
                            : "border-gray-200 bg-white"
                          }`}
                      >
                        <input
                          type="radio"
                          name="modeJudul"
                          checked={paketData.modeJudul === "baru"}
                          onChange={() =>
                            setPaketData((prev) => ({
                              ...prev,
                              modeJudul: "baru",
                              judulId: 0,
                              nama: "",
                              kategori: "Kepribadian",
                            }))
                          }
                          className="mt-1 text-[#561269] focus:ring-[#561269]"
                        />
                        <div>
                          <p className="font-bold text-sm text-gray-900">Buat Judul Psikotes Baru</p>
                          <p className="text-xs text-gray-500">
                            Membuat instrumen asesmen baru dari awal dengan paket pertama (Gratis atau Berbayar).
                          </p>
                        </div>
                      </label>

                      <label
                        className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition ${paketData.modeJudul === "ada"
                            ? "border-[#561269] bg-purple-50/50"
                            : "border-gray-200 bg-white"
                          }`}
                      >
                        <input
                          type="radio"
                          name="modeJudul"
                          checked={paketData.modeJudul === "ada"}
                          onChange={() => {
                            const incompleteList = judulList.filter((j) => {
                              const hasGratis = j.paketList.some((p) => p.jenisAkses === "Gratis");
                              const hasBerbayar = j.paketList.some((p) => p.jenisAkses === "Berbayar");
                              return !hasGratis || !hasBerbayar;
                            });
                            const firstAvailable = incompleteList[0];
                            if (firstAvailable) {
                              const hasGratis = firstAvailable.paketList.some((p) => p.jenisAkses === "Gratis");
                              const defaultAkses: JenisAkses = hasGratis ? "Berbayar" : "Gratis";
                              setPaketData((prev) => ({
                                ...prev,
                                modeJudul: "ada",
                                judulId: firstAvailable.id,
                                nama: firstAvailable.judul,
                                kategori: firstAvailable.kategori,
                                deskripsi: firstAvailable.deskripsi,
                                jenisAkses: defaultAkses,
                                harga: defaultAkses === "Gratis" ? "" : "Rp 50.000",
                                numericHarga: defaultAkses === "Gratis" ? 0 : 50000,
                              }));
                            } else {
                              setPaketData((prev) => ({
                                ...prev,
                                modeJudul: "ada",
                                judulId: 0,
                              }));
                            }
                          }}
                          className="mt-1 text-[#561269] focus:ring-[#561269]"
                        />
                        <div>
                          <p className="font-bold text-sm text-gray-900">Tambahkan ke Judul Yang Ada</p>
                          <p className="text-xs text-gray-500">
                            Menambahkan jenis paket (Gratis atau Berbayar) yang belum tersedia pada judul yang sudah ada.
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Selector for existing title (Only shows titles with missing package - Option 1) */}
                    {paketData.modeJudul === "ada" && (() => {
                      const incompleteTitles = judulList.filter((j) => {
                        const hasGratis = j.paketList.some((p) => p.jenisAkses === "Gratis");
                        const hasBerbayar = j.paketList.some((p) => p.jenisAkses === "Berbayar");
                        return !hasGratis || !hasBerbayar;
                      });

                      if (incompleteTitles.length === 0) {
                        return (
                          <div className="pt-3 border-t border-gray-200">
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                              <p className="font-bold flex items-center gap-1.5">
                                <Info className="w-4 h-4 text-amber-600" /> Semua Judul Psikotes Sudah Lengkap
                              </p>
                              <p>
                                Seluruh instrumen psikotes yang terdaftar saat ini sudah memiliki paket Gratis dan Berbayar lengkap. Silakan pilih opsi <strong>&quot;Buat Judul Psikotes Baru&quot;</strong> di atas untuk membuat instrumen asesmen baru.
                              </p>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="pt-3 border-t border-gray-200 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <label className="text-xs font-bold text-gray-700 block">
                              Pilih Judul Psikotes Yang Belum Lengkap <span className="text-red-500">*</span>
                            </label>
                            <span className="text-[11px] text-gray-500 font-medium">
                              (Hanya menampilkan judul yang belum memiliki paket Gratis atau Berbayar)
                            </span>
                          </div>

                          <select
                            value={paketData.judulId || ""}
                            onChange={(e) => {
                              clearFieldError("judulId");
                              const selectedId = parseInt(e.target.value, 10);
                              const found = incompleteTitles.find((j) => j.id === selectedId);
                              if (found) {
                                const hasGratis = found.paketList.some((p) => p.jenisAkses === "Gratis");
                                const defaultAkses: JenisAkses = hasGratis ? "Berbayar" : "Gratis";
                                const existingPkg = found.paketList.find((p) => p.jenisAkses === "Gratis") || found.paketList.find((p) => p.jenisAkses === "Berbayar") || found.paketList[0];
                                setPaketData((prev) => ({
                                  ...prev,
                                  judulId: found.id,
                                  nama: found.judul,
                                  kategori: found.kategori,
                                  deskripsi: existingPkg?.deskripsi || found.deskripsi,
                                  bannerUrl: existingPkg?.bannerUrl || found.image || "",
                                  benefits: existingPkg?.benefits && existingPkg.benefits.length > 0 ? [...existingPkg.benefits] : [""],
                                  waktu: existingPkg?.waktu ? existingPkg.waktu.replace(/[^0-9]/g, "") : (defaultAkses === "Gratis" ? "15" : "30"),
                                  jenisAkses: defaultAkses,
                                  harga: defaultAkses === "Gratis" ? "" : "Rp 50.000",
                                  numericHarga: defaultAkses === "Gratis" ? 0 : 50000,
                                }));
                                if (existingPkg?.soalList && existingPkg.soalList.length > 0) {
                                  setSoalList([...existingPkg.soalList]);
                                  setActiveSoalId(existingPkg.soalList[0].id);
                                  setCurrentSoal(existingPkg.soalList[0]);
                                }
                              }
                            }}
                            className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none bg-white font-medium transition ${
                              fieldErrors["judulId"]
                                ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-200"
                                : "border-gray-300 focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
                            }`}
                          >
                            <option value="">-- Pilih Judul Psikotes --</option>
                            {incompleteTitles.map((j) => (
                              <option key={j.id} value={j.id}>
                                {j.judul}
                              </option>
                            ))}
                          </select>
                          {fieldErrors["judulId"] && (
                            <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              {fieldErrors["judulId"]}
                            </p>
                          )}

                          {/* Availability Info for selected incomplete title */}
                          {(() => {
                            const target = incompleteTitles.find((j) => j.id === paketData.judulId);
                            if (!target) return null;
                            const hasGratis = target.paketList.find((p) => p.jenisAkses === "Gratis");
                            const hasBerbayar = target.paketList.find((p) => p.jenisAkses === "Berbayar");

                            return (
                              <div className="p-3.5 bg-white rounded-xl border border-gray-200 text-xs space-y-2">
                                <p className="font-bold text-gray-800">Status Ketersediaan Paket pada Judul Ini:</p>
                                <div className="flex flex-wrap gap-2">
                                  <span
                                    className={`px-2.5 py-1 rounded-full font-semibold ${hasGratis
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-gray-100 text-gray-500 border border-dashed border-gray-300"
                                      }`}
                                  >
                                    Paket Gratis: {hasGratis ? `Tersedia (${hasGratis.status})` : "Belum Dibuat"}
                                  </span>
                                  <span
                                    className={`px-2.5 py-1 rounded-full font-semibold ${hasBerbayar
                                        ? "bg-purple-50 text-[#561269] border border-purple-200"
                                        : "bg-gray-100 text-gray-500 border border-dashed border-gray-300"
                                      }`}
                                  >
                                    Paket Berbayar: {hasBerbayar ? `Tersedia (${hasBerbayar.harga})` : "Belum Dibuat"}
                                  </span>
                                </div>
                                <p className="text-[#561269] font-medium pt-0.5">
                                  💡 Jenis akses otomatis disesuaikan ke paket yang belum tersedia: <strong>Paket {hasGratis ? "Berbayar" : "Gratis"}</strong>.
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 1.2 Form Fields */}
                <div className="space-y-6">
                  {/* Mode Judul Ada: Tampilkan Ringkasan Instrumen & Fokus Input Harga (Hanya saat tambah paket baru ke judul yang ada) */}
                  {!isEditMode && paketData.modeJudul === "ada" && (
                    <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex items-start gap-3">
                      <div className="p-2 bg-[#561269] text-white rounded-xl shrink-0 mt-0.5">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#561269]">
                          Menambahkan Paket {paketData.jenisAkses}
                        </p>
                        <h4 className="text-base font-extrabold text-gray-900">
                          {paketData.nama}
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Informasi nama instrumen, deskripsi, gambar banner, dan poin manfaat otomatis terhubung dari paket yang sudah ada. {paketData.jenisAkses === "Berbayar" ? "Cukup tentukan harga paket di bawah untuk melanjutkan." : "Paket gratis bebas biaya pengerjaan."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Judul/Nama Paket Psikotes (Dapat diedit pada mode edit paket maupun pembuatan judul baru) */}
                  {(isEditMode || paketData.modeJudul === "baru") && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-800">
                        Nama / Judul Paket Psikotes <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={paketData.nama}
                        onChange={(e) => {
                          clearFieldError("nama");
                          setPaketData((prev) => ({ ...prev, nama: e.target.value }));
                        }}
                        className={`w-full px-4 py-2.5 border rounded-xl outline-none text-sm font-medium transition ${
                          fieldErrors["nama"]
                            ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-200"
                            : "border-gray-200 focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
                        }`}
                        placeholder="Contoh: Tes Kepribadian (MBTI)"
                      />
                      {fieldErrors["nama"] && (
                        <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          {fieldErrors["nama"]}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Deskripsi Paket: Selalu ditampilkan langsung tanpa disembunyikan */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-800">
                      Deskripsi Paket <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={paketData.deskripsi}
                      onChange={(e) => {
                        clearFieldError("deskripsi");
                        setPaketData((prev) => ({ ...prev, deskripsi: e.target.value }));
                      }}
                      className={`w-full px-4 py-2.5 border rounded-xl outline-none text-sm transition ${
                        fieldErrors["deskripsi"]
                          ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
                      }`}
                      placeholder="Tuliskan tujuan asesmen, manfaat bagi peserta, dan gambaran umum tes..."
                    ></textarea>
                    {fieldErrors["deskripsi"] && (
                      <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        {fieldErrors["deskripsi"]}
                      </p>
                    )}
                  </div>

                  {/* Jenis Akses */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-800">
                      Jenis Akses Paket <span className="text-red-500">*</span>
                    </label>

                    {(() => {
                      if (!isEditMode && paketData.modeJudul === "ada" && paketData.judulId) {
                        const target = judulList.find((j) => j.id === paketData.judulId);
                        const hasGratis = target?.paketList.some(
                          (p) => p.jenisAkses === "Gratis" && (!isResumingDraft || p.id !== activeDraftPackageId)
                        );
                        const hasBerbayar = target?.paketList.some(
                          (p) => p.jenisAkses === "Berbayar" && (!isResumingDraft || p.id !== activeDraftPackageId)
                        );

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Gratis Option */}
                            <label
                              className={`p-4 rounded-2xl border-2 flex items-start gap-3 transition ${hasGratis
                                  ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200"
                                  : paketData.jenisAkses === "Gratis"
                                    ? "border-emerald-500 bg-emerald-50/40 shadow-xs cursor-pointer"
                                    : "border-gray-200 bg-white cursor-pointer hover:border-gray-300"
                                }`}
                            >
                              <input
                                type="radio"
                                name="jenisAkses"
                                value="Gratis"
                                disabled={Boolean(hasGratis)}
                                checked={paketData.jenisAkses === "Gratis"}
                                onChange={() =>
                                  setPaketData((prev) => ({
                                    ...prev,
                                    jenisAkses: "Gratis",
                                    harga: "",
                                    numericHarga: 0,
                                  }))
                                }
                                className="mt-1 text-emerald-600 focus:ring-emerald-500"
                              />
                              <div>
                                <span className="font-bold text-sm text-gray-900 block">
                                  Paket Gratis {hasGratis && "(Sudah Ada)"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Ringkasan Hasil Psikotes (Online) tanpa biaya dengan interpretasi dasar.
                                </span>
                              </div>
                            </label>

                            {/* Berbayar Option */}
                            <label
                              className={`p-4 rounded-2xl border-2 flex items-start gap-3 transition ${hasBerbayar
                                  ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200"
                                  : paketData.jenisAkses === "Berbayar"
                                    ? "border-[#561269] bg-purple-50/40 shadow-xs cursor-pointer"
                                    : "border-gray-200 bg-white cursor-pointer hover:border-gray-300"
                                }`}
                            >
                              <input
                                type="radio"
                                name="jenisAkses"
                                value="Berbayar"
                                disabled={Boolean(hasBerbayar)}
                                checked={paketData.jenisAkses === "Berbayar"}
                                onChange={() => {
                                  setPaketData((prev) => ({
                                    ...prev,
                                    jenisAkses: "Berbayar",
                                    harga: prev.harga || "Rp 50.000",
                                    numericHarga: prev.numericHarga || 50000,
                                  }));
                                }}
                                className="mt-1 text-[#561269] focus:ring-[#561269]"
                              />
                              <div>
                                <span className="font-bold text-sm text-gray-900 block">
                                  Paket Berbayar {hasBerbayar && "(Sudah Ada)"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Laporan Hasil Psikotes Lengkap (PDF) dengan analisis mendalam dan rekomendasi pengembangan diri.
                                </span>
                              </div>
                            </label>
                          </div>
                        );
                      }

                      // Mode Judul Baru atau Mode Edit
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <label
                            className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition ${paketData.jenisAkses === "Gratis"
                                ? "border-emerald-500 bg-emerald-50/40 shadow-xs"
                                : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                          >
                            <input
                              type="radio"
                              name="jenisAkses"
                              value="Gratis"
                              checked={paketData.jenisAkses === "Gratis"}
                              onChange={() =>
                                setPaketData((prev) => ({
                                  ...prev,
                                  jenisAkses: "Gratis",
                                  harga: "",
                                  numericHarga: 0,
                                }))
                              }
                              className="mt-1 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <span className="font-bold text-sm text-gray-900 block">Paket Gratis</span>
                              <span className="text-xs text-gray-500">
                                Ringkasan Hasil Psikotes (Online) tanpa biaya dengan interpretasi dasar.
                              </span>
                            </div>
                          </label>

                          <label
                            className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition ${paketData.jenisAkses === "Berbayar"
                                ? "border-[#561269] bg-purple-50/40 shadow-xs"
                                : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                          >
                            <input
                              type="radio"
                              name="jenisAkses"
                              value="Berbayar"
                              checked={paketData.jenisAkses === "Berbayar"}
                              onChange={() => {
                                setPaketData((prev) => ({
                                  ...prev,
                                  jenisAkses: "Berbayar",
                                  harga: prev.harga || "Rp 50.000",
                                  numericHarga: prev.numericHarga || 50000,
                                }));
                              }}
                              className="mt-1 text-[#561269] focus:ring-[#561269]"
                            />
                            <div>
                              <span className="font-bold text-sm text-gray-900 block">Paket Berbayar</span>
                              <span className="text-xs text-gray-500">
                                Laporan Hasil Psikotes Lengkap (PDF) dengan analisis mendalam dan rekomendasi pengembangan diri.
                              </span>
                            </div>
                          </label>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Input Harga Paket */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-800 flex items-center justify-between">
                      <span>
                        Harga Paket (Rp) {paketData.jenisAkses === "Berbayar" && <span className="text-red-500">*</span>}
                      </span>
                      {paketData.jenisAkses === "Gratis" && (
                        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          Bebas Biaya (Rp 0)
                        </span>
                      )}
                    </label>
                    <div className="flex rounded-xl shadow-xs overflow-hidden max-w-md">
                      <span className="inline-flex items-center px-4 border border-r-0 border-gray-300 bg-gray-50 text-gray-600 font-bold text-sm">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={
                          paketData.jenisAkses === "Gratis"
                            ? "0"
                            : paketData.numericHarga
                              ? paketData.numericHarga.toLocaleString("id-ID")
                              : ""
                        }
                        disabled={paketData.jenisAkses === "Gratis"}
                        onChange={(e) => {
                          clearFieldError("harga");
                          handleHargaChange(e.target.value);
                        }}
                        placeholder="Contoh: 50000"
                        className={`flex-1 block w-full px-4 py-2.5 border text-sm font-medium outline-none transition ${
                          fieldErrors["harga"]
                            ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-200"
                            : paketData.jenisAkses === "Gratis"
                              ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                              : "border-gray-300 focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] bg-white"
                        }`}
                      />
                    </div>
                    {fieldErrors["harga"] && (
                      <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        {fieldErrors["harga"]}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {paketData.jenisAkses === "Berbayar"
                        ? "Format Rupiah baku. Tentukan harga nominal untuk paket berbayar ini."
                        : "Paket gratis tidak memerlukan biaya transaksi (Rp 0)."}
                    </p>
                  </div>

                  {/* Banner Upload: Selalu ditampilkan langsung tanpa disembunyikan */}
                  <div className="space-y-2 pt-2">
                    <label className="text-sm font-semibold text-gray-800">
                      Upload Banner/Gambar Asesmen
                    </label>
                    <input
                      id="banner-file-input"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleBannerUpload}
                    />

                    {paketData.bannerUrl ? (
                      <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 p-2">
                        <div className="relative h-48 w-full rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img
                            src={paketData.bannerUrl}
                            alt="Banner Asesmen"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-2 px-1">
                          <button
                            type="button"
                            onClick={() => document.getElementById("banner-file-input")?.click()}
                            disabled={isUploadingImage}
                            className="text-xs font-bold text-[#561269] hover:text-[#400d4f] transition-colors cursor-pointer"
                          >
                            Ganti Gambar
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveBanner}
                            disabled={isUploadingImage}
                            className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => !isUploadingImage && document.getElementById("banner-file-input")?.click()}
                        className={`border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#561269]/50 transition-colors cursor-pointer ${
                          isUploadingImage ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 className="w-8 h-8 mb-2 text-[#561269] animate-spin" />
                            <p className="text-sm font-semibold text-gray-800">Mengunggah gambar...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-800">Klik untuk upload atau seret gambar banner</p>
                            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, atau WebP (Maks. 5MB, otomatis dioptimalkan)</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Poin Manfaat: Apa yang kamu dapatkan (Selalu ditampilkan langsung) */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-semibold text-gray-800">
                          Apa yang Kamu Dapatkan? (Poin Manfaat)
                        </label>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Poin-poin ini akan ditampilkan di bagian &quot;Apa yang akan kamu dapatkan?&quot; pada halaman detail psikotes user. Kosongkan jika belum ingin menambahkan.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addBenefit}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#561269] bg-[#561269]/5 hover:bg-[#561269]/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Poin
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(paketData.benefits && paketData.benefits.length > 0 ? paketData.benefits : [""]).map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-6 text-center text-xs font-bold text-gray-400">
                            {idx + 1}.
                          </span>
                          <input
                            type="text"
                            value={benefit}
                            onChange={(e) => updateBenefit(idx, e.target.value)}
                            placeholder={`Contoh: Pemetaan profil kepribadian mendalam`}
                            className="flex-1 px-3.5 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeBenefit(idx)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Poin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons for Step 1 */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("paket");
                      setIsEditingPackage(false);
                    }}
                    className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSaveDraft(true, "DRAFT")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-full shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-amber-700" /> Simpan Sebagai Draf
                    </button>
                    {isEditingPublished && (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleSaveDraft(true, "PUBLISHED")}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#561269] hover:bg-[#400d4f] rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" /> Simpan Perubahan
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleTabSwitch("soal")}
                      className="inline-flex items-center gap-2 px-7 py-2.5 text-sm font-bold text-gray-950 bg-[#EAB308] hover:bg-[#CA8A04] rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      Lanjut: Pengisian Soal <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* STEP 2: PENGISIAN SOAL */}
            {/* ========================================== */}
            {formTab === "soal" && (
              <div className="animate-in fade-in">
                {/* Warning Banner if package has participants */}
                {isEditingPublished && hasParticipants && (
                  <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed">
                      <strong className="block text-sm font-bold text-amber-950 mb-0.5">
                        Peringatan Perubahan Soal:
                      </strong>
                      Paket ini sudah dikerjakan oleh peserta. Mengubah kunci/skor dapat memengaruhi konsistensi riwayat asesmen yang telah diselesaikan peserta sebelumnya.
                    </div>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left Column: Form Editor Soal */}
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {soalList.find((s) => s.id === currentSoal.id) ? "Edit Butir Soal" : "Buat Butir Soal Baru"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Konfigurasi soal untuk paket{" "}
                          <span className="font-bold text-[#561269]">{paketData.jenisAkses}</span>. Soal paket ini
                          terpisah dari paket lainnya.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5 bg-gray-50/60 border border-gray-200/80 rounded-2xl p-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-800">
                          Teks Pertanyaan <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={currentSoal.teks}
                          onChange={(e) => {
                            clearFieldError("soal_teks");
                            setCurrentSoal((prev) => ({ ...prev, teks: e.target.value }));
                          }}
                          className={`w-full px-4 py-2.5 border rounded-xl outline-none bg-white text-sm transition ${
                            fieldErrors["soal_teks"]
                              ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-200"
                              : "border-gray-200 focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
                          }`}
                          placeholder="Tuliskan butir pertanyaan psikotes di sini..."
                        ></textarea>
                        {fieldErrors["soal_teks"] && (
                          <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            {fieldErrors["soal_teks"]}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3 pt-2">
                        <label className="text-sm font-semibold text-gray-800 flex justify-between items-center">
                          <span>Pilihan Jawaban &amp; Bobot Skor</span>
                          <span className="text-xs text-gray-500 font-normal">Minimal 2 pilihan jawaban</span>
                        </label>
                        {currentSoal.pilihan.map((pil, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex gap-3">
                              <input
                                type="text"
                                value={pil.text}
                                onChange={(e) => updatePilihan(idx, "text", e.target.value)}
                                className={`flex-1 px-4 py-2 border rounded-xl outline-none text-sm bg-white transition ${
                                  fieldErrors[`soal_pilihan_${idx}`]
                                    ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-200"
                                    : "border-gray-200 focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
                                }`}
                                placeholder={`Pilihan ${idx + 1}`}
                              />
                              <div className="w-28 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                                  Skor
                                </span>
                                <input
                                  type="number"
                                  value={pil.bobot}
                                  onChange={(e) => updatePilihan(idx, "bobot", e.target.value)}
                                  className="w-full pl-12 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] outline-none text-sm bg-white font-semibold"
                                  placeholder="0"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removePilihan(idx)}
                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors bg-white border border-gray-200 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            {fieldErrors[`soal_pilihan_${idx}`] && (
                              <p className="text-xs text-red-600 font-semibold flex items-center gap-1 ml-1">
                                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                {fieldErrors[`soal_pilihan_${idx}`]}
                              </p>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addPilihan}
                          className="text-xs font-bold text-purple-700 hover:text-purple-800 mt-2 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> Tambah Pilihan Jawaban
                        </button>
                      </div>

                      <div className="pt-4 flex items-center justify-between border-t border-gray-200">
                        {soalList.find((s) => s.id === currentSoal.id) ? (
                          <button
                            type="button"
                            onClick={() => deleteSoal(currentSoal.id)}
                            className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus Soal
                          </button>
                        ) : (
                          <div></div>
                        )}
                        <button
                          type="button"
                          onClick={handleSimpanSoal}
                          className="px-5 py-2.5 text-xs font-bold text-gray-950 bg-[#EAB308] hover:bg-[#CA8A04] rounded-full shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" /> Simpan Butir Soal Ini
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Interactive Soal List Sidebar */}
                  <div className="w-full lg:w-80 space-y-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sticky top-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-900 text-sm">Daftar Soal Paket</h4>
                        <span className="text-xs font-bold bg-purple-100 text-[#561269] px-2.5 py-1 rounded-full">
                          {soalList.length} Soal
                        </span>
                      </div>

                      {fieldErrors["soalList"] && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                          {fieldErrors["soalList"]}
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-2 mb-6 max-h-[320px] overflow-y-auto pr-1">
                        {soalList.map((s, idx) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => selectSoal(s)}
                            className={`aspect-square rounded-xl border flex flex-col items-center justify-center font-bold transition-all text-xs cursor-pointer ${s.id === currentSoal.id
                                ? "bg-[#561269] border-[#561269] text-white shadow-sm ring-2 ring-[#561269]/20"
                                : "bg-white border-gray-200 text-gray-700 hover:border-[#561269]/40"
                              }`}
                          >
                            {idx + 1}
                            <CheckCircle
                              className={`w-3 h-3 mt-1 ${s.id === currentSoal.id ? "text-white/70" : "text-emerald-500"
                                }`}
                            />
                          </button>
                        ))}

                        {/* Indikator soal aktif baru */}
                        {!soalList.find((s) => s.id === currentSoal.id) && (
                          <div className="aspect-square rounded-xl border-2 border-dashed border-[#561269] bg-purple-50 flex flex-col items-center justify-center font-bold text-xs text-[#561269]">
                            {soalList.length + 1}
                            <span className="text-[9px]">Aktif</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleBuatSoalBaru}
                          className="aspect-square rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-[#561269] hover:border-[#561269] hover:bg-purple-50 transition-colors cursor-pointer"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="text-xs text-gray-500 flex flex-col gap-1.5 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Butir soal tersimpan
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-500" /> Butir sedang diedit
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons for Step 2 */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-8">
                  <button
                    type="button"
                    onClick={() => setFormTab("info")}
                    className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Kembali ke Info
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSaveDraft(true, "DRAFT")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-full shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-amber-700" /> Simpan Sebagai Draf
                    </button>
                    {isEditingPublished && (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleSaveDraft(true, "PUBLISHED")}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#561269] hover:bg-[#400d4f] rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" /> Simpan Perubahan
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setFormTab("preview")}
                      className="inline-flex items-center gap-2 px-7 py-2.5 text-sm font-bold text-gray-950 bg-[#EAB308] hover:bg-[#CA8A04] rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      Lanjut: Preview Soal <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* STEP 3: PREVIEW SOAL */}
            {/* ========================================== */}
            {formTab === "preview" && (
              <div className="animate-in fade-in space-y-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Preview Seluruh Soal</h3>
                    <p className="text-xs text-gray-500">
                      Tinjau seluruh pertanyaan dan bobot pilihan jawaban pada paket {paketData.jenisAkses}. Total {soalList.length} butir soal.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleBuatSoalBaru();
                      setFormTab("soal");
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-50 hover:bg-purple-100 text-[#561269] text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Soal Lain
                  </button>
                </div>

                <div className="space-y-4">
                  {soalList.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-300 rounded-2xl">
                      <p className="text-gray-500 font-semibold text-sm">Belum ada butir soal yang disimpan.</p>
                      <button
                        type="button"
                        onClick={() => setFormTab("soal")}
                        className="mt-3 px-5 py-2 bg-[#EAB308] text-gray-950 text-xs font-bold rounded-full cursor-pointer"
                      >
                        Mulai Buat Soal Sekarang
                      </button>
                    </div>
                  ) : (
                    soalList.map((s, idx) => {
                      const isIncomplete = !s.teks.trim() || s.pilihan.some((p) => !p.text.trim());
                      return (
                        <div
                          key={s.id}
                          className={`p-5 rounded-2xl border transition-all ${isIncomplete
                              ? "bg-red-50/50 border-red-200"
                              : "bg-white border-gray-200 shadow-xs hover:border-gray-300"
                            }`}
                        >
                          <div className="flex justify-between items-start gap-4 mb-3">
                            <div className="flex items-start gap-3">
                              <span
                                className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full font-bold text-xs ${isIncomplete ? "bg-red-100 text-red-600" : "bg-purple-100 text-[#561269]"
                                  }`}
                              >
                                {idx + 1}
                              </span>
                              <div>
                                <h4 className="text-gray-900 font-semibold text-sm leading-snug">
                                  {s.teks || <span className="text-red-400 italic">Pertanyaan masih kosong...</span>}
                                </h4>
                                <span className="text-[11px] text-gray-400 mt-0.5 inline-block">{s.tipe}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                selectSoal(s);
                                setFormTab("soal");
                              }}
                              className="px-3 py-1 bg-gray-100 hover:bg-purple-50 text-gray-700 hover:text-[#561269] rounded-lg text-xs font-semibold transition cursor-pointer"
                            >
                              Edit Butir Ini
                            </button>
                          </div>

                          <div className="ml-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {s.pilihan.map((p, i) => (
                              <div
                                key={i}
                                className={`px-3.5 py-2 rounded-xl border text-xs flex justify-between items-center ${!p.text.trim()
                                    ? "border-red-200 bg-white text-red-400 italic"
                                    : "border-gray-200 bg-gray-50/60 text-gray-700"
                                  }`}
                              >
                                <span>{p.text || "Pilihan kosong..."}</span>
                                <span className="font-bold px-2 py-0.5 bg-white border border-gray-200 rounded-md text-gray-700 shadow-2xs">
                                  Skor: {p.bobot}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer Buttons for Step 3 */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-8">
                  <button
                    type="button"
                    onClick={() => setFormTab("soal")}
                    className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Kembali ke Soal
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSaveDraft(true, "DRAFT")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-full shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-amber-700" /> Simpan Sebagai Draf
                    </button>
                    {isEditingPublished && (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleSaveDraft(true, "PUBLISHED")}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#561269] hover:bg-[#400d4f] rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" /> Simpan Perubahan
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleTabSwitch("interpretasi")}
                      className="inline-flex items-center gap-2 px-7 py-2.5 text-sm font-bold text-gray-950 bg-[#EAB308] hover:bg-[#CA8A04] rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      Lanjut: Interpretasi Hasil <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* STEP 4: INTERPRETASI HASIL */}
            {/* ========================================== */}
            {formTab === "interpretasi" && (
              <div className="animate-in fade-in space-y-8 max-w-4xl mx-auto">
                {/* Warning Banner if package has participants */}
                {isEditingPublished && hasParticipants && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed">
                      <strong className="block text-sm font-bold text-amber-950 mb-0.5">
                        Peringatan Perubahan Interpretasi Skor:
                      </strong>
                      Paket ini sudah dikerjakan oleh peserta. Mengubah rentang skor atau interpretasi dapat memengaruhi konsistensi riwayat asesmen yang telah diselesaikan peserta sebelumnya.
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Konfigurasi Interpretasi Hasil {paketData.jenisAkses === "Berbayar" ? "Berbayar" : "Gratis"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Atur kesimpulan, analisis ilmiah, makna personal, dan saran untuk peserta pada paket{" "}
                      <span className="font-bold text-[#561269]">{paketData.jenisAkses}</span>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addInterpretasi}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Kategori Hasil
                  </button>
                </div>

                {/* Info Banner Aligned with User Website */}
                {paketData.jenisAkses === "Berbayar" ? (
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-[#561269] flex items-start gap-3">
                    <Sparkles className="w-5 h-5 shrink-0 text-[#561269] mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-[#561269]">
                        Format Laporan Hasil Berbayar Sesuai Website User
                      </p>
                      <p className="text-purple-900 leading-relaxed">
                        Pada website peserta, paket Berbayar menyajikan <strong>Laporan Analisis Asesmen Lengkap</strong> yang memuat:
                        <strong> Hasil Utama</strong> (tipe kepribadian/profil), <strong>Interpretasi Analisis</strong>,
                        <strong> Implikasi bagi Kehidupan Sehari-hari</strong>, serta <strong>Langkah Pengembangan Diri (Tips Aksi)</strong>.
                        Pastikan seluruh data interpretasi diisi lengkap agar laporan resmi peserta tersaji secara optimal.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-3">
                    <Info className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-emerald-900">
                        Format Laporan Hasil Paket Gratis Sesuai Website User
                      </p>
                      <p className="text-emerald-800 leading-relaxed">
                        Pada paket Gratis, peserta mendapatkan ringkasan hasil berupa identifikasi tipe dasar, interpretasi ringkas, dan saran awal tanpa pemetaan dimensi komprehensif.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {interpretasiList.map((item, idx) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-2xl p-6 relative bg-gray-50/40 hover:shadow-xs transition"
                    >
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        {paketData.jenisAkses === "Berbayar" && (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewBerbayarModal({
                                title: `${paketData.nama || "Tes Psikotes"} (Paket Berbayar)`,
                                inter: item,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#561269] text-xs font-bold transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview Format Laporan User
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeInterpretasi(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pr-10">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Batas Bawah Skor (Min)
                          </label>
                          <input
                            type="number"
                            value={item.min}
                            onChange={(e) => updateInterpretasi(item.id, "min", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#561269]/20 outline-none text-sm bg-white font-medium"
                            placeholder="Misal: 0"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Batas Atas Skor (Max)
                          </label>
                          <input
                            type="number"
                            value={item.max}
                            onChange={(e) => updateInterpretasi(item.id, "max", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#561269]/20 outline-none text-sm bg-white font-medium"
                            placeholder="Misal: 5"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                              {paketData.jenisAkses === "Berbayar" ? "Judul Hasil Asesmen" : "Judul Hasil"}{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={item.judul}
                              onChange={(e) => updateInterpretasi(item.id, "judul", e.target.value)}
                              className={`w-full px-4 py-2 border rounded-xl outline-none text-sm bg-white font-semibold transition ${
                                fieldErrors[`interpretasi_${item.id}_judul`]
                                  ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-200"
                                  : "border-gray-200 focus:ring-2 focus:ring-[#561269]/20"
                              }`}
                              placeholder={
                                paketData.jenisAkses === "Berbayar"
                                  ? "Misal: ENFJ-A (Protagonist) / Words of Affirmation"
                                  : "Misal: Orientasi Introvert (I) / Tingkat Stres Tinggi"
                              }
                            />
                            {fieldErrors[`interpretasi_${item.id}_judul`] && (
                              <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                {fieldErrors[`interpretasi_${item.id}_judul`]}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Kategori Hasil
                            </label>
                            <input
                              type="text"
                              value={item.kategori}
                              onChange={(e) => updateInterpretasi(item.id, "kategori", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#561269]/20 outline-none text-sm bg-white"
                              placeholder={
                                paketData.jenisAkses === "Berbayar"
                                  ? "Misal: Kepribadian Berbayar / Karier Berbayar"
                                  : "Misal: Kepribadian / Klinis"
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            {paketData.jenisAkses === "Berbayar"
                              ? "Interpretasi Hasil"
                              : "Deskripsi Ilmiah / Interpretasi Hasil"}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={3}
                            value={item.deskripsi}
                            onChange={(e) => updateInterpretasi(item.id, "deskripsi", e.target.value)}
                            className={`w-full px-4 py-2 border rounded-xl outline-none text-sm bg-white transition ${
                              fieldErrors[`interpretasi_${item.id}_deskripsi`]
                                ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-200"
                                : "border-gray-200 focus:ring-2 focus:ring-[#561269]/20"
                            }`}
                            placeholder={
                              paketData.jenisAkses === "Berbayar"
                                ? "Karakteristikmu mencerminkan kecenderungan analitis yang kuat, gaya komunikasi yang terstruktur, serta orientasi tinggi terhadap pencapaian dan kolaborasi yang harmonis..."
                                : "Deskripsi formal mengenai indikasi psikologis dari hasil tes ini..."
                            }
                          ></textarea>
                          {fieldErrors[`interpretasi_${item.id}_deskripsi`] && (
                            <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              {fieldErrors[`interpretasi_${item.id}_deskripsi`]}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            {paketData.jenisAkses === "Berbayar"
                              ? "Makna Hasil dalam Kehidupan Sehari-hari"
                              : "Apa Artinya Bagi Peserta?"}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={2}
                            value={item.makna}
                            onChange={(e) => updateInterpretasi(item.id, "makna", e.target.value)}
                            className={`w-full px-4 py-2 border rounded-xl outline-none text-sm bg-white transition ${
                              fieldErrors[`interpretasi_${item.id}_makna`]
                                ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-200"
                                : "border-gray-200 focus:ring-2 focus:ring-[#561269]/20"
                            }`}
                            placeholder={
                              paketData.jenisAkses === "Berbayar"
                                ? "Mampu melihat potensi orang lain, menginspirasi perubahan positif, dan menciptakan atmosfer kerja yang kohesif serta terarah pada tujuan jangka panjang..."
                                : "Penjelasan dengan bahasa santai dan mudah dipahami oleh peserta..."
                            }
                          ></textarea>
                          {fieldErrors[`interpretasi_${item.id}_makna`] && (
                            <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              {fieldErrors[`interpretasi_${item.id}_makna`]}
                            </p>
                          )}
                        </div>

                        {/* FITUR KHUSUS BERBAYAR: Analisis Karakteristik & Dinamika Diri */}
                        {paketData.jenisAkses === "Berbayar" && (
                          <div className="space-y-4 pt-3 border-t border-purple-100">
                            <div>
                              <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-[#561269]" />
                                Analisis Karakteristik &amp; Dinamika Diri
                              </label>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Judul setiap bagian dapat disesuaikan oleh admin dengan mengetik langsung pada kolom judul di bawah:
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Potensi atau Kekuatan Utama */}
                              <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200/80 shadow-2xs space-y-2.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <input
                                      type="text"
                                      value={item.judulKekuatan ?? "Potensi atau Kekuatan Utama"}
                                      onChange={(e) => updateInterpretasi(item.id, "judulKekuatan", e.target.value)}
                                      className="font-bold text-xs text-emerald-950 uppercase tracking-wider bg-transparent border-b border-emerald-300 focus:border-emerald-600 focus:bg-white/80 px-1 py-0.5 outline-none rounded transition w-full"
                                      placeholder="Potensi atau Kekuatan Utama"
                                      title="Klik untuk mengubah judul bagian ini"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => addKekuatan(item.id)}
                                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer shrink-0"
                                  >
                                    <Plus className="w-3 h-3" /> Tambah Butir
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  {(item.kekuatanUtama && item.kekuatanUtama.length > 0 ? item.kekuatanUtama : [""]).map((kek, kIdx) => (
                                    <div key={kIdx} className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 ml-1" />
                                      <input
                                        type="text"
                                        value={kek}
                                        onChange={(e) => updateKekuatan(item.id, kIdx, e.target.value)}
                                        className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg outline-none"
                                        placeholder="Butir potensi atau kekuatan utama..."
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeKekuatan(item.id, kIdx)}
                                        className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer"
                                        title="Hapus butir"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Area yang Perlu Dikembangkan */}
                              <div className="p-4 bg-rose-50/40 rounded-xl border border-rose-200/80 shadow-2xs space-y-2.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                    <input
                                      type="text"
                                      value={item.judulBlindspots ?? "Area yang Perlu Dikembangkan"}
                                      onChange={(e) => updateInterpretasi(item.id, "judulBlindspots", e.target.value)}
                                      className="font-bold text-xs text-rose-950 uppercase tracking-wider bg-transparent border-b border-rose-300 focus:border-rose-600 focus:bg-white/80 px-1 py-0.5 outline-none rounded transition w-full"
                                      placeholder="Area yang Perlu Dikembangkan"
                                      title="Klik untuk mengubah judul bagian ini"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => addBlindspot(item.id)}
                                    className="text-[11px] font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer shrink-0"
                                  >
                                    <Plus className="w-3 h-3" /> Tambah Butir
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  {(item.blindspots && item.blindspots.length > 0 ? item.blindspots : [""]).map((bl, bIdx) => (
                                    <div key={bIdx} className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 ml-1" />
                                      <input
                                        type="text"
                                        value={bl}
                                        onChange={(e) => updateBlindspot(item.id, bIdx, e.target.value)}
                                        className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg outline-none"
                                        placeholder="Butir area yang perlu dikembangkan..."
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeBlindspot(item.id, bIdx)}
                                        className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer"
                                        title="Hapus butir"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Kondisi atau Lingkungan yang Mendukung */}
                            <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/80 shadow-2xs space-y-2.5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <Compass className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <input
                                    type="text"
                                    value={item.judulLingkungan ?? "Kondisi atau Lingkungan yang Mendukung"}
                                    onChange={(e) => updateInterpretasi(item.id, "judulLingkungan", e.target.value)}
                                    className="font-bold text-xs text-amber-950 uppercase tracking-wider bg-transparent border-b border-amber-300 focus:border-amber-600 focus:bg-white/80 px-1 py-0.5 outline-none rounded transition w-full"
                                    placeholder="Kondisi atau Lingkungan yang Mendukung"
                                    title="Klik untuk mengubah judul bagian ini"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => addLingkungan(item.id)}
                                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer shrink-0"
                                >
                                  <Plus className="w-3 h-3" /> Tambah Butir
                                </button>
                              </div>
                              <div className="space-y-2">
                                {(item.lingkunganOptimal && item.lingkunganOptimal.length > 0 ? item.lingkunganOptimal : [""]).map((ling, lIdx) => (
                                  <div key={lIdx} className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <input
                                      type="text"
                                      value={ling}
                                      onChange={(e) => updateLingkungan(item.id, lIdx, e.target.value)}
                                      className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-amber-200 rounded-lg outline-none"
                                      placeholder="Karakteristik kondisi / lingkungan yang mendukung..."
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeLingkungan(item.id, lIdx)}
                                      className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer"
                                      title="Hapus butir"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tips & Saran */}
                        <div className="space-y-2.5 pt-2">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                            {paketData.jenisAkses === "Berbayar"
                              ? "Langkah Pengembangan Diri (Tips & Saran Praktis)"
                              : "Tips / Saran Aksi (Opsional)"}
                          </label>
                          <div className="space-y-2.5">
                            {item.saran.map((s, sIdx) => (
                              <div key={sIdx} className="flex gap-2">
                                <div className="flex-1 space-y-1.5">
                                  <input
                                    type="text"
                                    value={s.title}
                                    onChange={(e) => updateSaran(item.id, sIdx, "title", e.target.value)}
                                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white font-medium"
                                    placeholder={
                                      paketData.jenisAkses === "Berbayar"
                                        ? "Judul Tips (Misal: Beri Waktu Jeda / Cerita pada Orang Terdekat / Atur Prioritas)"
                                        : "Judul Tips (Misal: Atur Batasan Diri)"
                                    }
                                  />
                                  <textarea
                                    rows={2}
                                    value={s.desc}
                                    onChange={(e) => updateSaran(item.id, sIdx, "desc", e.target.value)}
                                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white"
                                    placeholder={
                                      paketData.jenisAkses === "Berbayar"
                                        ? "Deskripsi langkah konkret (Misal: Luangkan waktu 15-30 menit setiap hari tanpa gangguan untuk relaksasi...)"
                                        : "Deskripsi langkah konkret..."
                                    }
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeSaran(item.id, sIdx)}
                                  className="self-start p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addSaran(item.id)}
                              className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Tambah Tips Baru
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Actions for Step 4 */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-8">
                  <button
                    type="button"
                    onClick={() => setFormTab("preview")}
                    className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Kembali ke Preview
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSaveDraft(true, "DRAFT")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-full shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-amber-700" /> Simpan Sebagai Draf
                    </button>

                    <button
                      type="button"
                      onClick={handlePublikasikan}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-gray-950 bg-[#EAB308] hover:bg-[#CA8A04] rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" /> {isEditMode && isEditingPublished ? "Simpan Perubahan Paket" : "Publikasikan Paket"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. DETAIL JUDUL PSIKOTES MODAL (Lihat Paket & Status)     */}
      {/* (NO EDIT ACTION per Requirement 4!)                      */}
      {/* ========================================================= */}
      {selectedJudul && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-200 shadow-inner">
                  <img src={selectedJudul.image} alt={selectedJudul.judul} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 leading-snug">{selectedJudul.judul}</h3>
                  <span className="text-xs font-semibold text-[#561269] bg-purple-50 px-2.5 py-0.5 rounded-md">
                    {selectedJudul.kategori}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedJudul(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-7 max-h-[75vh] overflow-y-auto space-y-6">
              {/* Overview Description */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Deskripsi Instrumen</h4>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  {selectedJudul.deskripsi}
                </p>
              </div>

              {/* Package Details Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Pengelolaan Paket (Gratis &amp; Berbayar)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card Paket Gratis */}
                  {(() => {
                    const paketGratis = selectedJudul.paketList.find((p) => p.jenisAkses === "Gratis");
                    if (paketGratis) {
                      return (
                        <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                Paket Gratis
                              </span>
                              <AdminStatusBadge
                                variant={paketGratis.status === "Aktif" ? "success" : "warning"}
                                className="w-24 text-[10px]"
                              >
                                {paketGratis.status === "Aktif" ? "Dipublikasi" : "Draf"}
                              </AdminStatusBadge>
                            </div>
                            <h5 className="font-extrabold text-xl text-gray-900 mb-1">Rp 0</h5>
                            <p className="text-xs text-gray-600 mb-3">{paketGratis.deskripsi}</p>
                            <div className="flex items-center gap-4 text-xs font-semibold text-gray-700 pt-2 border-t border-emerald-100">
                              <span>Soal: {paketGratis.jumlahSoal} butir</span>
                            </div>
                          </div>

                          {/* If Aktif: Edit button */}
                          {paketGratis.status === "Aktif" && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedJudul(null);
                                handleEditPaket(selectedJudul, paketGratis);
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#561269] text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <EditIcon className="w-3.5 h-3.5" /> Edit Paket Gratis
                            </button>
                          )}

                          {/* If Draf: Resume button */}
                          {paketGratis.status === "Draf" && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedJudul(null);
                                resumeDraft(selectedJudul, paketGratis);
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5" /> Lanjutkan Pengerjaan Draf
                            </button>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <div className="p-5 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col justify-between items-center text-center space-y-4">
                          <div className="pt-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-200 px-2.5 py-0.5 rounded-full inline-block mb-2">
                              Paket Gratis
                            </span>
                            <p className="font-bold text-sm text-gray-800">Belum Ada Paket Gratis</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Judul ini belum memiliki akses gratis bagi peserta.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedJudul(null);
                              openFormTambah(selectedJudul, "Gratis");
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Buat Paket Gratis
                          </button>
                        </div>
                      );
                    }
                  })()}

                  {/* Card Paket Berbayar */}
                  {(() => {
                    const paketBerbayar = selectedJudul.paketList.find((p) => p.jenisAkses === "Berbayar");
                    if (paketBerbayar) {
                      return (
                        <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/20 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-[#561269] bg-purple-100 px-2.5 py-0.5 rounded-full">
                                Paket Berbayar
                              </span>
                              <AdminStatusBadge
                                variant={paketBerbayar.status === "Aktif" ? "success" : "warning"}
                                className="w-24 text-[10px]"
                              >
                                {paketBerbayar.status === "Aktif" ? "Dipublikasi" : "Draf"}
                              </AdminStatusBadge>
                            </div>
                            <h5 className="font-extrabold text-xl text-[#561269] mb-1">{paketBerbayar.harga}</h5>
                            <p className="text-xs text-gray-600 mb-3">{paketBerbayar.deskripsi}</p>
                            <div className="flex items-center gap-4 text-xs font-semibold text-gray-700 pt-2 border-t border-purple-100">
                              <span>Soal: {paketBerbayar.jumlahSoal} butir</span>
                            </div>
                          </div>

                          {/* If Aktif: Edit button */}
                          {paketBerbayar.status === "Aktif" && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedJudul(null);
                                handleEditPaket(selectedJudul, paketBerbayar);
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-[#561269]/10 hover:bg-[#561269]/20 text-[#561269] text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <EditIcon className="w-3.5 h-3.5" /> Edit Paket Berbayar
                            </button>
                          )}

                          {/* If Draf: Resume button */}
                          {paketBerbayar.status === "Draf" && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedJudul(null);
                                resumeDraft(selectedJudul, paketBerbayar);
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5" /> Lanjutkan Pengerjaan Draf
                            </button>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <div className="p-5 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col justify-between items-center text-center space-y-4">
                          <div className="pt-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-200 px-2.5 py-0.5 rounded-full inline-block mb-2">
                              Paket Berbayar
                            </span>
                            <p className="font-bold text-sm text-gray-800">Belum Ada Paket Berbayar</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Judul ini belum memiliki akses berbayar &amp; laporan lengkap.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedJudul(null);
                              openFormTambah(selectedJudul, "Berbayar");
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-[#561269] hover:bg-[#6e1987] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Buat Paket Berbayar
                          </button>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>

            {/* Modal Footer (No Edit Action!) */}
            <div className="px-7 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-xs text-gray-500">
                Total {selectedJudul.paketList.length} paket terdaftar pada judul ini.
              </span>
              <button
                type="button"
                onClick={() => setSelectedJudul(null)}
                className="px-6 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. DETAIL PESERTA MODAL (Riwayat Hasil)                   */}
      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* 5. DETAIL PESERTA MODAL (HASIL DOKUMEN PDF KLIEN)         */}
      {/* ========================================================= */}
      {selectedPeserta && (() => {
        const isCompleted = selectedPeserta.status === "Selesai" || Boolean(selectedPeserta.hasil);
        const detail = getPesertaReportDetail(selectedPeserta);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#561269]/10 text-[#561269] rounded-xl flex items-center justify-center text-sm font-bold uppercase shrink-0">
                    {selectedPeserta.nama.substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-gray-900 leading-tight">
                        {selectedPeserta.nama}
                      </h3>
                      {isCompleted ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Selesai Dinilai
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          Sedang Berjalan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedPeserta.paket} · {selectedPeserta.tanggal}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPeserta(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body (Scrollable Isi Detail) */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-130px)]">
                {/* Data Klien Ringkas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gray-50/80 border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 font-bold block uppercase tracking-wider text-[10px]">
                      Nama Klien
                    </span>
                    <span className="font-bold text-gray-900 text-sm mt-0.5 block truncate">
                      {selectedPeserta.nama}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block uppercase tracking-wider text-[10px]">
                      Kontak WhatsApp
                    </span>
                    <span className="font-semibold text-emerald-700 text-sm mt-0.5 block truncate">
                      {selectedPeserta.noHp}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block uppercase tracking-wider text-[10px]">
                      Paket Psikotes
                    </span>
                    <span className="font-medium text-gray-800 mt-0.5 block truncate">
                      {selectedPeserta.paket}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block uppercase tracking-wider text-[10px]">
                      Tanggal Asesmen
                    </span>
                    <span className="font-medium text-gray-800 mt-0.5 block">
                      {selectedPeserta.tanggal}
                    </span>
                  </div>
                </div>

                {!isCompleted ? (
                  /* Kondisi 1: Peserta Masih Sedang Berjalan (Belum Selesai) */
                  <div className="space-y-4">
                    <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6 sm:p-8 text-center space-y-3">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                        <Clock className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-base">
                        Asesmen Psikotes Masih Sedang Berjalan
                      </h4>
                      <p className="text-xs text-gray-600 max-w-lg mx-auto leading-relaxed">
                        Peserta ini telah terdaftar pada paket <strong>{selectedPeserta.paket}</strong> namun belum menyelesaikan pengisian instrumen tes psikotes. Hasil skor, interpretasi analisis, karakteristik diri, dan laporan resmi PDF akan otomatis terbentuk dan dapat diakses setelah peserta menyelesaikan tes.
                      </p>
                    </div>

                    {selectedPeserta.noHp && selectedPeserta.noHp !== "—" && (
                      <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <span className="text-gray-700 font-medium">
                          Ingatkan peserta untuk menyelesaikan pengisian instrumen tes melalui WhatsApp?
                        </span>
                        <a
                          href={`https://wa.me/${selectedPeserta.noHp.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Halo ${selectedPeserta.nama}, akses asesmen psikotes Anda (${selectedPeserta.paket}) di Empathika telah aktif. Silakan masuk ke akun atau link tes untuk menyelesaikan pengisian instrumen asesmen.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-bold text-[#561269] hover:underline shrink-0"
                        >
                          Kirim Pengingat WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Kondisi 2: Peserta Selesai (Data Asesmen Terverifikasi) */
                  <>
                    {/* 1. Hasil Utama (Hero Card) */}
                    <div className="bg-gradient-to-br from-purple-50/60 via-white to-purple-50/30 rounded-2xl border border-purple-100 p-6 text-center space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Hasil Karakteristik Utama
                        </span>
                        {selectedPeserta.totalSkor !== null && selectedPeserta.totalSkor !== undefined && (
                          <span className="text-[11px] font-bold text-purple-700 bg-purple-100/70 px-2.5 py-0.5 rounded-full border border-purple-200">
                            Total Skor: {selectedPeserta.totalSkor}
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-[#561269] tracking-tight">
                        {selectedPeserta.skor || detail.grade}
                      </h2>
                      {detail.judul && detail.judul !== selectedPeserta.skor && detail.judul !== detail.grade && detail.judul !== "—" && (
                        <h3 className="text-sm sm:text-base font-bold text-gray-800">
                          {detail.judul}
                        </h3>
                      )}
                      <p className="text-xs text-gray-600 max-w-xl mx-auto leading-relaxed pt-1">
                        {detail.deskripsi}
                      </p>
                    </div>

                    {/* 2. Interpretasi & Implikasi */}
                    <div className="space-y-3.5">
                      <div className="p-5 rounded-2xl bg-white border border-gray-200/80 space-y-2">
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-[#561269]" />
                          Interpretasi Analisis &amp; Landasan Ilmiah
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {detail.deskripsi}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FAF8FB] border border-[#EFE7F2]">
                        <h5 className="text-[11px] font-bold text-[#561269] uppercase tracking-wider mb-1">
                          Implikasi bagi Kehidupan Sehari-hari
                        </h5>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {detail.makna}
                        </p>
                      </div>
                    </div>

                    {/* 3. Analisis Karakteristik: Kekuatan Utama vs Blindspots */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Kekuatan Utama */}
                      <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70">
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                            {detail.judulKekuatan || "Kekuatan Utama (Core Strengths)"}
                          </span>
                        </div>
                        <ul className="space-y-2 text-xs text-emerald-950">
                          {detail.kekuatanUtama.map((point, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Titik Rawan */}
                      <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/70">
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">
                            {detail.judulBlindspots || "Titik Rawan (Blindspots)"}
                          </span>
                        </div>
                        <ul className="space-y-2 text-xs text-rose-950">
                          {detail.blindspots.map((point, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* 4. Lingkungan & Budaya Kerja Optimal */}
                    <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/70">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Compass className="w-4 h-4 text-amber-700 shrink-0" />
                        <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                          {detail.judulLingkungan || "Lingkungan & Budaya Optimal"}
                        </span>
                      </div>
                      <ul className="space-y-2 text-xs text-gray-800">
                        {detail.lingkunganOptimal.map((ling, lIdx) => (
                          <li key={lIdx} className="flex items-start gap-2 leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>{ling}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 5. Langkah Pengembangan Diri */}
                    <div className="p-5 rounded-2xl bg-white border border-gray-200/80 space-y-3">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                        <HeartHandshake className="w-4 h-4 text-[#561269]" />
                        Langkah Pengembangan Diri
                      </h4>
                      <div className="space-y-2">
                        {detail.tips.map((tip, idx) => (
                          <div key={idx} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="w-5 h-5 rounded-full bg-[#561269] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-gray-900">{tip.title}</h5>
                              <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{tip.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Dokumen Laporan PDF Resmi Siap Cetak/Download */}
                    <div className="p-5 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-purple-100 text-[#561269] flex items-center justify-center shrink-0 shadow-xs">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 leading-tight">
                            Laporan Resmi Psikotes (Format Web User).pdf
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                            Dokumen evaluasi komprehensif terverifikasi siap unduh dan cetak 1:1 persis website klien.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(selectedPeserta)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-extrabold shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        Download Laporan (PDF)
                      </button>
                    </div>

                    {/* Quick WhatsApp Action */}
                    {selectedPeserta.noHp && selectedPeserta.noHp !== "—" && (
                      <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <span className="text-gray-700 font-medium">
                          Kirimkan pemberitahuan hasil asesmen resmi ini ke nomor klien?
                        </span>
                        <a
                          href={`https://wa.me/${selectedPeserta.noHp.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Halo ${selectedPeserta.nama}, terima kasih telah menyelesaikan asesmen psikotes ${selectedPeserta.paket} di Empathika. Hasil asesmen Anda (${selectedPeserta.skor}${detail.judul && detail.judul !== selectedPeserta.skor ? ` - ${detail.judul}` : ""}) telah siap dan terverifikasi secara resmi.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-bold text-emerald-800 hover:underline shrink-0"
                        >
                          Kirim WhatsApp
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/70 shrink-0">
                <span className="text-xs text-gray-500">
                  Dokumen resmi asesmen psikotes Empathika
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPeserta(null)}
                  className="px-6 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}


      {/* ========================================================= */}
      {/* 6. MODAL PREVIEW FORMAT LAPORAN USER (PAKET BERBAYAR)     */}
      {/* ========================================================= */}
      {previewBerbayarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-[#FAFAFC] rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#561269] bg-purple-50 px-2.5 py-0.5 rounded-full">
                  Preview Tampilan Laporan User (Paket Berbayar)
                </span>
                <h3 className="font-extrabold text-base text-gray-900 mt-1">
                  {previewBerbayarModal.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewBerbayarModal(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* Hasil Utama Card */}
              <section className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs text-center">
                <p className="text-xs font-semibold text-gray-500 mb-1.5">Tipe profil teridentifikasi:</p>
                <h2 className="text-3xl sm:text-4xl font-black text-[#561269] tracking-tight mb-3">
                  {previewBerbayarModal.inter.judul || "Tipe Profil Asesmen"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  {previewBerbayarModal.inter.deskripsi}
                </p>
              </section>

              {/* Interpretasi Hasil */}
              <section className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5 flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#561269]" />
                    Interpretasi Hasil
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {previewBerbayarModal.inter.deskripsi}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8FB] border border-[#EFE7F2]">
                  <h4 className="text-[10px] font-bold text-[#561269] uppercase tracking-wider mb-1">
                    Makna Hasil dalam Kehidupan Sehari-hari
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {previewBerbayarModal.inter.makna}
                  </p>
                </div>
              </section>

              {/* Analisis Karakteristik & Dinamika Diri */}
              <section className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#561269]" />
                    Analisis Karakteristik &amp; Dinamika Diri
                  </h3>
                  <p className="text-xs text-gray-500">
                    Pemetaan potensi keunggulan serta area pengembangan diri:
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {previewBerbayarModal.inter.judulKekuatan || "Potensi atau Kekuatan Utama"}
                    </span>
                    <ul className="space-y-2 text-xs text-emerald-950">
                      {(previewBerbayarModal.inter.kekuatanUtama || [
                        "Komunikasi persuasif yang berakar pada empati tulus.",
                        "Kemampuan membangun keselarasan dan kohesi tim kerja.",
                        "Ketajaman dalam merumuskan solusi berpusat pada manusia.",
                      ]).map((k, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                          <span>{k}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/70 space-y-2">
                    <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      {previewBerbayarModal.inter.judulBlindspots || "Area yang Perlu Dikembangkan"}
                    </span>
                    <ul className="space-y-2 text-xs text-rose-950">
                      {(previewBerbayarModal.inter.blindspots || [
                        "Cenderung mengabaikan kebutuhan diri sendiri demi mendahulukan orang lain.",
                        "Rentan mengalami kelelahan emosional saat menyerap masalah sekitar.",
                        "Sulit menolak beban kerja tambahan atau menetapkan batasan diri yang tegas.",
                      ]).map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Kondisi atau Lingkungan yang Mendukung */}
              <section className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#561269]" />
                    {previewBerbayarModal.inter.judulLingkungan || "Kondisi atau Lingkungan yang Mendukung"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Kondisi eksternal yang paling mendukung performa optimal dan kesejahteraan:
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/70">
                  <ul className="space-y-2 text-xs text-gray-800">
                    {(previewBerbayarModal.inter.lingkunganOptimal || [
                      "Industri edukasi, psikologi, human resource, dan konsultasi.",
                      "Posisi strategis dengan ruang kolaborasi tim yang fleksibel.",
                      "Budaya organisasi yang menghargai inovasi dan empati.",
                    ]).map((l, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Tips & Langkah Pengembangan Diri */}
              <section className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-[#561269]" />
                    Langkah Pengembangan Diri
                  </h3>
                  <p className="text-xs text-gray-500">
                    Saran praktis untuk memaksimalkan potensi:
                  </p>
                </div>
                <div className="space-y-2.5">
                  {previewBerbayarModal.inter.saran.map((tip, index) => (
                    <div key={index} className="flex gap-3.5 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-[#561269]" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900">{tip.title}</h4>
                        <p className="mt-0.5 text-xs text-gray-600 leading-relaxed">{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-white shrink-0">
              <button
                type="button"
                onClick={() => setPreviewBerbayarModal(null)}
                className="px-6 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Peringatan Edit Soal & Penilaian Ketika Paket Sudah Dikerjakan Peserta */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-amber-200">
            <div className="p-6 sm:p-7 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-gray-900">
                  Konfirmasi Perubahan Soal &amp; Penilaian
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Paket ini sudah dikerjakan oleh peserta. Mengubah kunci/skor dapat memengaruhi konsistensi riwayat asesmen yang telah diselesaikan peserta sebelumnya.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-left text-xs text-amber-900 space-y-1">
                <span className="font-bold block text-amber-950">Catatan:</span>
                Informasi umum (Judul, Deskripsi, Banner, Poin Manfaat, Kategori/Harga) bebas diedit kapan saja. Namun untuk butir soal dan interpretasi skor, pastikan perubahan yang Anda buat memang disengaja.
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowWarningModal(false);
                    setPendingTab(null);
                  }}
                  className="px-5 py-2.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Batalkan &amp; Tetap di Info Umum
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasConfirmedWarning(true);
                    setShowWarningModal(false);
                    if (pendingTab) {
                      setFormTab(pendingTab);
                      setPendingTab(null);
                    }
                  }}
                  className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  Saya Mengerti, Lanjutkan Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to format validation errors
function errorsMap(errors: string[]) {
  return errors;
}
