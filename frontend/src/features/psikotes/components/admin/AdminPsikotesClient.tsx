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
} from "../../types/adminPsikotes";

const LOCAL_STORAGE_KEY = "empathika_admin_psikotes_judul_v5";

function mapApiResponseToJudul(items: PaketPsikotesApiResponse[]): JudulPsikotesItem[] {
  return items.map((item) => {
    const paketDetail: PaketDetailItem = {
      id: item.id,
      judulId: item.id,
      namaJudul: item.judul,
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
      interpretasiList: (item.interpretasi_psikotes || []).map((i) => ({
        id: i.id,
        min: String(i.min_skor),
        max: String(i.max_skor),
        judul: i.judul,
        kategori: i.grade || "Umum",
        deskripsi: i.deskripsi,
        makna: i.makna || "",
        saran: Array.isArray(i.tips) ? i.tips : [],
      })),
      updatedAt: new Date(item.updatedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      pesertaCount: item._count?.booking_psikotes || 0,
    };

    return {
      id: item.id,
      judul: item.judul,
      kategori: "Umum",
      deskripsi: item.deskripsi || "",
      image: item.banner_url || "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=100&h=100",
      paketList: [paketDetail],
    };
  });
}

export default function AdminPsikotesClient() {
  const [activeTab, setActiveTab] = useState<"peserta" | "paket" | "form-paket">("peserta");
  const [formTab, setFormTab] = useState<"info" | "soal" | "preview" | "interpretasi">("info");
  const [aksesFilter, setAksesFilter] = useState<"Semua" | "Gratis" | "Berbayar">("Semua");
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

  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }, []);

  // Form State
  const [isResumingDraft, setIsResumingDraft] = useState(false);
  const [activeDraftPackageId, setActiveDraftPackageId] = useState<string | number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Edit Published Package State & Participant Warning
  const [isEditingPublished, setIsEditingPublished] = useState(false);
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
    status: "Aktif",
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

  const pesertaList = INITIAL_PESERTA_LIST;

  // Notification auto-dismiss
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Filtering Peserta
  const filteredPeserta = pesertaList.filter((peserta) => {
    if (aksesFilter === "Semua") return true;
    return peserta.jenisAkses === aksesFilter;
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

  // Calculate totals for summary
  const totalPaketCount = judulList.reduce((acc, curr) => acc + curr.paketList.length, 0);
  const totalDraftCount = judulList.reduce(
    (acc, curr) => acc + curr.paketList.filter((p) => p.status === "Draf").length,
    0
  );

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

  // Helper: Open form to create a new psychological test title or package
  const openFormTambah = (targetJudul?: JudulPsikotesItem, preferredAkses?: JenisAkses) => {
    setFormErrors([]);
    setIsResumingDraft(false);
    setIsEditingPublished(false);
    setHasParticipants(false);
    setHasConfirmedWarning(false);
    setActiveDraftPackageId(null);
    setActiveTab("form-paket");
    setFormTab("info");

    if (targetJudul) {
      // Adding package to an existing title
      const existingGratis = targetJudul.paketList.find((p) => p.jenisAkses === "Gratis");
      const existingBerbayar = targetJudul.paketList.find((p) => p.jenisAkses === "Berbayar");

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
        deskripsi: targetJudul.deskripsi,
        bannerUrl: targetJudul.image || "",
        benefits: [""],
        waktu: defaultAkses === "Gratis" ? "15" : "30",
        jenisAkses: defaultAkses,
        harga: defaultAkses === "Gratis" ? "" : "Rp 50.000",
        numericHarga: defaultAkses === "Gratis" ? 0 : 50000,
        status: "Aktif",
        jumlahSoal: 0,
        modeJudul: "ada",
      });

      // Default blank questions & interpretations for separate package
      const newSoalId = Date.now();
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
      setInterpretasiList(
        defaultAkses === "Berbayar"
          ? getBerbayarDefaultInterpretasi(targetJudul.judul, targetJudul.kategori)
          : [
            {
              id: Date.now(),
              min: "0",
              max: "5",
              judul: "",
              kategori: targetJudul.kategori,
              deskripsi: "",
              makna: "",
              saran: [{ title: "", desc: "" }],
            },
          ]
      );
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
        benefits: [""],
        waktu: "15",
        jenisAkses: "Gratis",
        harga: "",
        numericHarga: 0,
        status: "Aktif",
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
      setInterpretasiList(draftPackage.interpretasiList);
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
    setIsResumingDraft(false);
    setIsEditingPublished(targetPaket.status === "Aktif");
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
      setInterpretasiList(targetPaket.interpretasiList);
    } else {
      setInterpretasiList(
        targetPaket.jenisAkses === "Berbayar"
          ? getBerbayarDefaultInterpretasi(targetJudul.judul, targetJudul.kategori)
          : [
              {
                id: Date.now(),
                min: "0",
                max: "5",
                judul: "",
                kategori: targetJudul.kategori,
                deskripsi: "",
                makna: "",
                saran: [{ title: "", desc: "" }],
              },
            ]
      );
    }

    setNotification({
      type: "info",
      message: `Membuka mode edit untuk paket "${targetJudul.judul} (${targetPaket.jenisAkses})".`,
    });
  };

  // Helper: Intercept Tab Switching to validate warning for packages with participants
  const handleTabSwitch = (target: "info" | "soal" | "preview" | "interpretasi") => {
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

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 2MB.");
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
    setPaketData((prev) => ({
      ...prev,
      benefits: (prev.benefits || []).filter((_, i) => i !== idx),
    }));
  };

  // Soal Management
  const handleSimpanSoal = () => {
    if (!currentSoal.teks.trim()) {
      alert("Teks pertanyaan tidak boleh kosong.");
      return;
    }
    const emptyPilihan = currentSoal.pilihan.find((p) => p.text.trim() === "");
    if (emptyPilihan) {
      alert("Harap lengkapi teks semua pilihan jawaban.");
      return;
    }

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
    if (paketData.jenisAkses === "Berbayar") {
      const def = getBerbayarDefaultInterpretasi(paketData.nama, paketData.kategori)[0];
      setInterpretasiList((prev) => [
        ...prev,
        {
          ...def,
          id: Date.now(),
          judul: "",
        },
      ]);
    } else {
      setInterpretasiList((prev) => [
        ...prev,
        {
          id: Date.now(),
          min: "",
          max: "",
          judul: "",
          kategori: paketData.kategori,
          deskripsi: "",
          makna: "",
          saran: [{ title: "", desc: "" }],
        },
      ]);
    }
  };

  const updateInterpretasi = (id: string | number, key: keyof Interpretasi, val: string) => {
    setInterpretasiList((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: val } : item)));
  };

  const updateBlindspot = (interId: string | number, idx: number, val: string) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interId) {
          const list = [...(item.blindspots || [])];
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
          return { ...item, blindspots: [...(item.blindspots || []), ""] };
        }
        return item;
      })
    );
  };

  const removeBlindspot = (interId: string | number, idx: number) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interId && item.blindspots) {
          return { ...item, blindspots: item.blindspots.filter((_, i) => i !== idx) };
        }
        return item;
      })
    );
  };

  const updateKekuatan = (interId: string | number, idx: number, val: string) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interId) {
          const list = [...(item.kekuatanUtama || [])];
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
          return { ...item, kekuatanUtama: [...(item.kekuatanUtama || []), ""] };
        }
        return item;
      })
    );
  };

  const removeKekuatan = (interId: string | number, idx: number) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interId && item.kekuatanUtama) {
          return { ...item, kekuatanUtama: item.kekuatanUtama.filter((_, i) => i !== idx) };
        }
        return item;
      })
    );
  };

  const updateLingkungan = (interId: string | number, idx: number, val: string) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interId) {
          const list = [...(item.lingkunganOptimal || [])];
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
          return { ...item, lingkunganOptimal: [...(item.lingkunganOptimal || []), ""] };
        }
        return item;
      })
    );
  };

  const removeLingkungan = (interId: string | number, idx: number) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interId && item.lingkunganOptimal) {
          return { ...item, lingkunganOptimal: item.lingkunganOptimal.filter((_, i) => i !== idx) };
        }
        return item;
      })
    );
  };

  const addSaran = (interpretasiId: string | number) => {
    setInterpretasiList((prev) =>
      prev.map((item) => {
        if (item.id === interpretasiId) {
          return { ...item, saran: [...item.saran, { title: "", desc: "" }] };
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
          return { ...item, saran: item.saran.filter((_, i) => i !== saranIndex) };
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
  const handleSaveDraft = async (navigateBack: boolean = true) => {
    const titleName = paketData.nama.trim() || "Draf Psikotes Tanpa Judul";
    const packageId = (isResumingDraft || isEditingPublished) && activeDraftPackageId ? activeDraftPackageId : paketData.id;

    setIsSubmitting(true);
    try {
      const apiPayload = {
        judul: titleName,
        deskripsi: paketData.deskripsi || "Draf deskripsi paket psikotes",
        banner_url: paketData.bannerUrl || null,
        benefits: (paketData.benefits || []).filter((b) => b.trim().length > 0),
        jenis_akses: (paketData.jenisAkses === "Gratis" ? "GRATIS" : "BERBAYAR") as any,
        harga: paketData.jenisAkses === "Gratis" ? 0 : (paketData.numericHarga || 0),
        status: (isEditingPublished ? "PUBLISHED" : "DRAFT") as any,
        soal_psikotes: soalList.map((s, idx) => ({
          urutan: idx + 1,
          pertanyaan: s.teks || `Pertanyaan ${idx + 1}`,
          pilihan_jawaban: s.pilihan.map((p, pIdx) => ({
            label: String.fromCharCode(65 + pIdx),
            teks_jawaban: p.text || `Pilihan ${pIdx + 1}`,
            bobot: parseInt(p.bobot) || 0,
          })),
        })),
        interpretasi_psikotes: interpretasiList.map((i, iIdx) => ({
          min_skor: parseInt(i.min) || 0,
          max_skor: parseInt(i.max) || 0,
          grade: i.kategori || `Grade ${iIdx + 1}`,
          judul: i.judul || `Interpretasi ${iIdx + 1}`,
          deskripsi: i.deskripsi || "Penjelasan interpretasi",
          makna: i.makna || "",
          tips: i.saran || [],
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

      await loadDataFromBackend();

      setNotification({
        type: "success",
        message: `Draf paket "${titleName}" berhasil disimpan ke database!`,
      });

      if (navigateBack) {
        setActiveTab("paket");
      }
    } catch (err: any) {
      console.error("Gagal menyimpan draf ke database:", err);
      setNotification({
        type: "error",
        message: `Gagal menyimpan draf: ${err.response?.data?.message || err.message || "Terjadi kesalahan"}`,
      });
      if (navigateBack) {
        setActiveTab("paket");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSaveDraftClick = () => {
    handleSaveDraft(true);
  };

  // Publish Package (Requires all mandatory fields)
  const handlePublikasikan = async () => {
    const errors: string[] = [];

    if (!paketData.nama.trim()) {
      errors.push("Judul psikotes wajib diisi.");
    }
    if (!paketData.deskripsi.trim()) {
      errors.push("Deskripsi paket wajib diisi.");
    }

    if (soalList.length === 0) {
      errors.push("Minimal harus memiliki 1 butir soal yang telah disimpan.");
    } else {
      const incompleteSoal = soalList.some(
        (s) => !s.teks.trim() || s.pilihan.length < 2 || s.pilihan.some((p) => !p.text.trim())
      );
      if (incompleteSoal) {
        errors.push("Terdapat butir soal yang belum lengkap (teks pertanyaan atau pilihan jawaban masih kosong).");
      }
    }

    if (interpretasiList.length === 0) {
      errors.push("Minimal harus memiliki 1 kategori interpretasi hasil.");
    } else {
      const incompleteInter = interpretasiList.some(
        (i) => !i.judul.trim() || !i.deskripsi.trim()
      );
      if (incompleteInter) {
        errors.push("Konfigurasi interpretasi hasil belum lengkap (judul hasil atau deskripsi wajib diisi).");
      }
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      handleSaveDraft(false); // Automatically keep draft safe without redirecting
      return;
    }

    // Validation passed! Publish package
    const titleName = paketData.nama.trim();
    const packageId = (isResumingDraft || isEditingPublished) && activeDraftPackageId ? activeDraftPackageId : paketData.id;

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
          tips: i.saran || [],
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

  const handleDeleteJudul = async (id: string | number) => {
    if (confirm("Apakah Anda yakin ingin menghapus judul psikotes ini beserta seluruh paket di dalamnya dari database?")) {
      try {
        if (typeof id === "string" && id.length > 10) {
          await psikotesService.delete(id);
        }
        await loadDataFromBackend();
        setJudulList((prev) => prev.filter((j) => j.id !== id));
        if (selectedJudul && selectedJudul.id === id) {
          setSelectedJudul(null);
        }
        setNotification({
          type: "info",
          message: "Judul psikotes berhasil dihapus dari database.",
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

  // Peserta Table Columns
  const pesertaColumns: ColumnDef<AdminPsikotesPeserta>[] = [
    {
      key: "peserta",
      header: "Peserta",
      render: (peserta: AdminPsikotesPeserta) => (
        <div className="flex flex-col">
          <span className="font-extrabold text-gray-900 leading-tight">{peserta.nama}</span>
          <span className="text-xs text-gray-500 mt-0.5">{peserta.noHp}</span>
        </div>
      ),
    },
    {
      key: "paket",
      header: "Paket Tes",
      render: (peserta: AdminPsikotesPeserta) => (
        <span className="font-semibold text-gray-800">{peserta.paket}</span>
      ),
    },
    {
      key: "akses",
      header: "Akses",
      render: (peserta: AdminPsikotesPeserta) => (
        <AdminStatusBadge variant={peserta.jenisAkses === "Gratis" ? "success" : "warning"} className="w-28">
          {peserta.jenisAkses}
        </AdminStatusBadge>
      ),
    },
    {
      key: "tanggal",
      header: "Tanggal",
      render: (peserta: AdminPsikotesPeserta) => (
        <span className="text-gray-600 font-medium">{peserta.tanggal}</span>
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
        const gratis = item.paketList.find((p) => p.jenisAkses === "Gratis");
        const berbayar = item.paketList.find((p) => p.jenisAkses === "Berbayar");

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
        const berbayar = item.paketList.find((p) => p.jenisAkses === "Berbayar");

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
        const targetEdit = activePaket || draftPaket || item.paketList[0];

        return (
          <div className="flex items-center justify-center gap-2">
            <ActionButtonDetail onClick={() => setSelectedJudul(item)} title="Lihat Detail Psikotes" />

            {/* Tombol Aksi Edit */}
            {targetEdit && (
              <ActionButtonEdit
                onClick={() => handleEditPaket(item, targetEdit)}
                title="Edit Paket Psikotes"
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

            <ActionButtonDelete onClick={() => handleDeleteJudul(item.id)} title="Hapus Judul" />
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

      {/* Cards Navigation (Summary Cards) */}
      {activeTab !== "form-paket" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <AdminSummaryCard
            label="Data Peserta &amp; Hasil Tes"
            value={`${pesertaList.length} Peserta`}
            description="Lihat riwayat pengerjaan dan hasil psikotes peserta Gratis maupun Berbayar."
            icon={<Users className={`w-6 h-6 ${activeTab === "peserta" ? "text-[#561269]" : "text-blue-500"}`} />}
            iconBgColor={activeTab === "peserta" ? "bg-purple-100 text-[#561269]" : "bg-blue-50 text-blue-500"}
            isActive={activeTab === "peserta"}
            onClick={() => setActiveTab("peserta")}
          />

          <AdminSummaryCard
            label="Kelola Paket Psikotes"
            value={`${judulList.length} Judul (${totalPaketCount} Paket)`}
            description={`Kelola paket Gratis & Berbayar terpisah. Tersedia ${totalDraftCount} draf tersimpan.`}
            icon={<FileText className={`w-6 h-6 ${activeTab === "paket" ? "text-[#561269]" : "text-purple-600"}`} />}
            iconBgColor={activeTab === "paket" ? "bg-purple-100 text-[#561269]" : "bg-purple-50 text-purple-600"}
            isActive={activeTab === "paket"}
            onClick={() => setActiveTab("paket")}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. DAFTAR PESERTA TAB */}
      {/* ========================================================= */}
      {activeTab === "peserta" && (
        <AdminTableContainer>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex items-center gap-6 sm:gap-8 border-b border-transparent overflow-x-auto pb-1 text-sm">
              {(["Semua", "Gratis", "Berbayar"] as const).map((filter) => (
                <AdminFilterTabItem
                  key={filter}
                  label={`Peserta ${filter}`}
                  isActive={aksesFilter === filter}
                  onClick={() => setAksesFilter(filter)}
                />
              ))}
            </div>
          </div>

          <AdminDataTable
            columns={pesertaColumns}
            data={filteredPeserta}
            keyExtractor={(item) => item.id}
            emptyMessage="Belum ada data pengerjaan untuk kategori ini."
          />
        </AdminTableContainer>
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
                  }
                }}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-2 text-sm font-semibold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar Psikotes
              </button>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center flex-wrap gap-3">
                {isEditingPublished
                  ? "Edit Paket Psikotes Dipublikasi"
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

            {/* Always accessible Save Draft Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onSaveDraftClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4 text-gray-600" /> {isEditingPublished ? "Simpan Perubahan" : "Simpan Draf"}
              </button>
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
                {/* 1.1 Mode Pemilihan Judul Psikotes */}
                {!isResumingDraft && (
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
                              const selectedId = parseInt(e.target.value, 10);
                              const found = incompleteTitles.find((j) => j.id === selectedId);
                              if (found) {
                                const hasGratis = found.paketList.some((p) => p.jenisAkses === "Gratis");
                                const defaultAkses: JenisAkses = hasGratis ? "Berbayar" : "Gratis";
                                setPaketData((prev) => ({
                                  ...prev,
                                  judulId: found.id,
                                  nama: found.judul,
                                  kategori: found.kategori,
                                  deskripsi: found.deskripsi,
                                  jenisAkses: defaultAkses,
                                  harga: defaultAkses === "Gratis" ? "" : "Rp 50.000",
                                  numericHarga: defaultAkses === "Gratis" ? 0 : 50000,
                                }));
                                if (defaultAkses === "Berbayar") {
                                  setInterpretasiList((prev) =>
                                    prev.length <= 1 && (!prev[0] || (!prev[0].judul && !prev[0].deskripsi))
                                      ? getBerbayarDefaultInterpretasi(found.judul, found.kategori)
                                      : prev
                                  );
                                }
                              }
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] outline-none bg-white font-medium"
                          >
                            {incompleteTitles.map((j) => (
                              <option key={j.id} value={j.id}>
                                {j.judul}
                              </option>
                            ))}
                          </select>

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
                  {/* Judul Psikotes (Kategori dihapus sesuai permintaan) */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-800">
                      Nama/Judul Psikotes <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={paketData.nama}
                      disabled={paketData.modeJudul === "ada"}
                      onChange={(e) => setPaketData((prev) => ({ ...prev, nama: e.target.value }))}
                      className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm font-medium ${paketData.modeJudul === "ada"
                          ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                          : "focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269]"
                        }`}
                      placeholder="Contoh: Tes Kepribadian (MBTI)"
                    />
                  </div>

                  {/* Deskripsi */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-800">
                      Deskripsi Paket <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={paketData.deskripsi}
                      onChange={(e) => setPaketData((prev) => ({ ...prev, deskripsi: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] outline-none text-sm"
                      placeholder="Tuliskan tujuan asesmen, manfaat bagi peserta, dan gambaran umum tes..."
                    ></textarea>
                  </div>

                  {/* Jenis Akses (Strictly Gratis or Berbayar - No hybrid!) */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-800">
                      Jenis Akses Paket <span className="text-red-500">*</span>
                    </label>

                    {/* Duplicate Prevention Check */}
                    {(() => {
                      if (paketData.modeJudul === "ada" && paketData.judulId) {
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
                                  Akses tanpa biaya untuk peserta dengan hasil ringkas.
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
                                  setInterpretasiList((prev) =>
                                    prev.length <= 1 && (!prev[0] || (!prev[0].judul && !prev[0].deskripsi))
                                      ? getBerbayarDefaultInterpretasi(paketData.nama, paketData.kategori)
                                      : prev
                                  );
                                }}
                                className="mt-1 text-[#561269] focus:ring-[#561269]"
                              />
                              <div>
                                <span className="font-bold text-sm text-gray-900 block">
                                  Paket Berbayar {hasBerbayar && "(Sudah Ada)"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Akses komprehensif berbayar dengan laporan dan interpretasi mendalam.
                                </span>
                              </div>
                            </label>
                          </div>
                        );
                      }

                      // Mode Judul Baru
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
                                Akses tanpa biaya untuk peserta dengan hasil ringkas.
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
                                setInterpretasiList((prev) =>
                                  prev.length <= 1 && (!prev[0] || (!prev[0].judul && !prev[0].deskripsi))
                                    ? getBerbayarDefaultInterpretasi(paketData.nama, paketData.kategori)
                                    : prev
                                );
                              }}
                              className="mt-1 text-[#561269] focus:ring-[#561269]"
                            />
                            <div>
                              <span className="font-bold text-sm text-gray-900 block">Paket Berbayar</span>
                              <span className="text-xs text-gray-500">
                                Akses komprehensif berbayar dengan laporan dan interpretasi mendalam.
                              </span>
                            </div>
                          </label>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Input Harga (Estimasi Waktu Pengerjaan dihapus sesuai permintaan) */}
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
                        onChange={(e) => handleHargaChange(e.target.value)}
                        placeholder="Contoh: 50000"
                        className={`flex-1 block w-full px-4 py-2.5 border border-gray-300 text-sm font-medium outline-none ${paketData.jenisAkses === "Gratis"
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] bg-white"
                          }`}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {paketData.jenisAkses === "Berbayar"
                        ? "Format Rupiah baku. Paket berbayar wajib memiliki harga nominal yang valid."
                        : "Paket gratis tidak memerlukan biaya transaksi."}
                    </p>
                  </div>

                  {/* Banner Upload */}
                  <div className="space-y-2">
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
                            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, atau WebP (Maks. 2MB)</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Poin Manfaat: Apa yang kamu dapatkan */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-semibold text-gray-800">
                          Apa yang Kamu Dapatkan? (Poin Manfaat)
                        </label>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Poin-poin ini akan ditampilkan di halaman detail psikotes user.
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
                      {(paketData.benefits || []).length === 0 ? (
                        <p className="text-xs text-gray-400 italic py-1">
                          Belum ada poin manfaat. Klik &quot;+ Tambah Poin&quot; untuk menambahkan.
                        </p>
                      ) : (
                        (paketData.benefits || []).map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-6 text-center text-xs font-bold text-gray-400">
                              {idx + 1}.
                            </span>
                            <input
                              type="text"
                              value={benefit}
                              onChange={(e) => updateBenefit(idx, e.target.value)}
                              placeholder={`Contoh: Hasil skor dan interpretasi ${idx === 0 ? "karakter diri" : ""}`}
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
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons for Step 1 */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-8">
                  <button
                    type="button"
                    onClick={onSaveDraftClick}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-gray-500" /> Simpan sebagai Draf
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("paket")}
                      className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
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
                          onChange={(e) => setCurrentSoal((prev) => ({ ...prev, teks: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] outline-none bg-white text-sm"
                          placeholder="Tuliskan butir pertanyaan psikotes di sini..."
                        ></textarea>
                      </div>

                      <div className="space-y-3 pt-2">
                        <label className="text-sm font-semibold text-gray-800 flex justify-between items-center">
                          <span>Pilihan Jawaban &amp; Bobot Skor</span>
                          <span className="text-xs text-gray-500 font-normal">Minimal 2 pilihan jawaban</span>
                        </label>
                        {currentSoal.pilihan.map((pil, idx) => (
                          <div key={idx} className="flex gap-3">
                            <input
                              type="text"
                              value={pil.text}
                              onChange={(e) => updatePilihan(idx, "text", e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#561269]/20 focus:border-[#561269] outline-none text-sm bg-white"
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
                    onClick={onSaveDraftClick}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-gray-500" /> Simpan sebagai Draf
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormTab("info")}
                      className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      Kembali ke Info
                    </button>
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
                    onClick={onSaveDraftClick}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-gray-500" /> Simpan sebagai Draf
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormTab("soal")}
                      className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      Kembali ke Soal
                    </button>
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
                              {paketData.jenisAkses === "Berbayar" ? "Judul Hasil / Tipe Profil" : "Judul Hasil"}{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={item.judul}
                              onChange={(e) => updateInterpretasi(item.id, "judul", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#561269]/20 outline-none text-sm bg-white font-semibold"
                              placeholder={
                                paketData.jenisAkses === "Berbayar"
                                  ? "Misal: ENFJ-A (Protagonist) / Words of Affirmation"
                                  : "Misal: Orientasi Introvert (I) / Tingkat Stres Tinggi"
                              }
                            />
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
                              ? "Interpretasi Analisis (Deskripsi Ilmiah)"
                              : "Deskripsi Ilmiah / Interpretasi Hasil"}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={3}
                            value={item.deskripsi}
                            onChange={(e) => updateInterpretasi(item.id, "deskripsi", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#561269]/20 outline-none text-sm bg-white"
                            placeholder={
                              paketData.jenisAkses === "Berbayar"
                                ? "Karakteristikmu mencerminkan kecenderungan analitis yang kuat, gaya komunikasi yang terstruktur, serta orientasi tinggi terhadap pencapaian dan kolaborasi yang harmonis..."
                                : "Deskripsi formal mengenai indikasi psikologis dari hasil tes ini..."
                            }
                          ></textarea>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            {paketData.jenisAkses === "Berbayar"
                              ? "Implikasi bagi Kehidupan Sehari-hari"
                              : "Apa Artinya Bagi Peserta?"}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={2}
                            value={item.makna}
                            onChange={(e) => updateInterpretasi(item.id, "makna", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#561269]/20 outline-none text-sm bg-white"
                            placeholder={
                              paketData.jenisAkses === "Berbayar"
                                ? "Mampu melihat potensi orang lain, menginspirasi perubahan positif, dan menciptakan atmosfer kerja yang kohesif serta terarah pada tujuan jangka panjang..."
                                : "Penjelasan dengan bahasa santai dan mudah dipahami oleh peserta..."
                            }
                          ></textarea>
                        </div>

                        {/* FITUR KHUSUS BERBAYAR: Analisis Karakteristik & Dinamika Diri */}
                        {paketData.jenisAkses === "Berbayar" && (
                          <div className="space-y-4 pt-3 border-t border-purple-100">
                            <div>
                              <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-[#561269]" />
                                Analisis Karakteristik, Kekuatan &amp; Titik Rawan
                              </label>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Pemetaan mendalam keunggulan utama, area blindspot, dan lingkungan kerja optimal pada laporan resmi peserta:
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Kekuatan Utama */}
                              <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200/80 shadow-2xs space-y-2.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    Kekuatan Utama (Core Strengths)
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => addKekuatan(item.id)}
                                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" /> Tambah Butir
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  {(item.kekuatanUtama && item.kekuatanUtama.length > 0
                                    ? item.kekuatanUtama
                                    : [
                                      "Komunikasi persuasif yang berakar pada empati tulus.",
                                      "Kemampuan membangun keselarasan dan kohesi tim kerja.",
                                      "Ketajaman dalam merumuskan solusi berpusat pada manusia.",
                                    ]
                                  ).map((kek, kIdx) => (
                                    <div key={kIdx} className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 ml-1" />
                                      <input
                                        type="text"
                                        value={kek}
                                        onChange={(e) => updateKekuatan(item.id, kIdx, e.target.value)}
                                        className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg outline-none"
                                        placeholder="Butir kekuatan utama..."
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeKekuatan(item.id, kIdx)}
                                        className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Titik Rawan & Blindspots */}
                              <div className="p-4 bg-rose-50/40 rounded-xl border border-rose-200/80 shadow-2xs space-y-2.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                    Titik Rawan (Blindspots)
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => addBlindspot(item.id)}
                                    className="text-[11px] font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" /> Tambah Butir
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  {(item.blindspots && item.blindspots.length > 0
                                    ? item.blindspots
                                    : [
                                      "Cenderung mengabaikan kebutuhan diri sendiri demi mendahulukan orang lain.",
                                      "Rentan mengalami kelelahan emosional saat menyerap masalah sekitar.",
                                      "Sulit menolak beban kerja tambahan atau menetapkan batasan diri yang tegas.",
                                    ]
                                  ).map((bl, bIdx) => (
                                    <div key={bIdx} className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 ml-1" />
                                      <input
                                        type="text"
                                        value={bl}
                                        onChange={(e) => updateBlindspot(item.id, bIdx, e.target.value)}
                                        className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg outline-none"
                                        placeholder="Area blindspot yang perlu diwaspadai..."
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeBlindspot(item.id, bIdx)}
                                        className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Lingkungan Kerja Optimal */}
                            <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/80 shadow-2xs space-y-2.5">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <Compass className="w-3.5 h-3.5 text-amber-600" />
                                  Lingkungan &amp; Budaya Kerja Optimal
                                </span>
                                <button
                                  type="button"
                                  onClick={() => addLingkungan(item.id)}
                                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" /> Tambah Butir
                                </button>
                              </div>
                              <div className="space-y-2">
                                {(item.lingkunganOptimal && item.lingkunganOptimal.length > 0
                                  ? item.lingkunganOptimal
                                  : [
                                    "Industri edukasi, psikologi, human resource, dan konsultasi.",
                                    "Posisi strategis dengan ruang kolaborasi tim yang fleksibel.",
                                    "Budaya organisasi yang menghargai inovasi dan empati.",
                                  ]
                                ).map((ling, lIdx) => (
                                  <div key={lIdx} className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <input
                                      type="text"
                                      value={ling}
                                      onChange={(e) => updateLingkungan(item.id, lIdx, e.target.value)}
                                      className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-amber-200 rounded-lg outline-none"
                                      placeholder="Karakteristik lingkungan optimal..."
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeLingkungan(item.id, lIdx)}
                                      className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer"
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
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormTab("preview")}
                      className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      Kembali ke Preview
                    </button>
                    <button
                      type="button"
                      onClick={onSaveDraftClick}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-gray-500" /> {isEditingPublished ? "Simpan Perubahan" : "Simpan sebagai Draf"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handlePublikasikan}
                    className="inline-flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-gray-950 bg-[#EAB308] hover:bg-[#CA8A04] rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" /> {isEditingPublished ? "Simpan & Perbarui Paket" : "Publikasikan Paket"}
                  </button>
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
                              <span>Durasi: {paketGratis.waktu}</span>
                              <span>•</span>
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
                              <span>Durasi: {paketBerbayar.waktu}</span>
                              <span>•</span>
                              <span>Soal: {paketBerbayar.jumlahSoal} butir</span>
                            </div>
                            {paketBerbayar.interpretasiList && paketBerbayar.interpretasiList.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedJudul(null);
                                  setPreviewBerbayarModal({
                                    title: `${selectedJudul.judul} (Paket Berbayar)`,
                                    inter: paketBerbayar.interpretasiList[0],
                                  });
                                }}
                                className="w-full mt-3 py-2 px-3 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#561269] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" /> Preview Format Laporan User
                              </button>
                            )}
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
      {selectedPeserta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div
            className={`bg-white rounded-3xl shadow-2xl w-full ${selectedPeserta.jenisAkses === "Berbayar" ? "max-w-4xl" : "max-w-2xl"
              } overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#561269]/10 text-[#561269] rounded-xl flex items-center justify-center text-sm font-bold uppercase shrink-0">
                  {selectedPeserta.nama.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 leading-tight">
                    {selectedPeserta.nama}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedPeserta.paket} · {selectedPeserta.tanggal}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AdminStatusBadge
                  className="w-28 text-[11px]"
                  variant={selectedPeserta.jenisAkses === "Gratis" ? "success" : "warning"}
                >
                  {selectedPeserta.jenisAkses}
                </AdminStatusBadge>
                <button
                  onClick={() => setSelectedPeserta(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Participant Profile Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Kontak Peserta</span>
                  <p className="text-xs font-semibold text-gray-800">{selectedPeserta.noHp}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Status Pengerjaan</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${selectedPeserta.status === "Selesai" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                  >
                    {selectedPeserta.status}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Skor / Hasil Akhir</span>
                  <p className="text-xs font-extrabold text-[#561269]">{selectedPeserta.skor}</p>
                </div>
              </div>

              {/* JIKA BERBAYAR: LAPORAN LENGKAP MENYESUAIKAN HASIL DI WEBSITE USER */}
              {selectedPeserta.jenisAkses === "Berbayar" && selectedPeserta.status === "Selesai" && (() => {
                const inter = getPesertaInterpretasi(selectedPeserta);
                return (
                  <div className="space-y-6 pt-2">
                    {/* Header Laporan Resmi Berbayar */}
                    <div className="border-b border-gray-200 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#561269] bg-purple-50 px-2.5 py-0.5 rounded-full">
                          Laporan Analisis Asesmen Lengkap
                        </span>
                        <h4 className="text-base font-extrabold text-gray-900 mt-1">
                          Evaluasi Hasil Peserta: {selectedPeserta.nama}
                        </h4>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        Cakupan: Analisis Komprehensif
                      </span>
                    </div>

                    {/* 1. Hasil Utama Card */}
                    <div className="bg-white rounded-2xl border border-purple-200 p-6 sm:p-7 shadow-xs text-center space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Tipe Kepribadian / Profil Teridentifikasi
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-black text-[#561269] tracking-tight">
                        {selectedPeserta.skor}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed pt-1">
                        {inter.deskripsi}
                      </p>
                    </div>

                    {/* 2. Interpretasi Analisis & Implikasi */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-1.5">
                          <Info className="w-4 h-4 text-[#561269]" />
                          Interpretasi Analisis &amp; Landasan Ilmiah
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {inter.deskripsi}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FAF8FB] border border-[#EFE7F2]">
                        <span className="text-[10px] font-bold text-[#561269] uppercase tracking-wider block mb-1">
                          Implikasi bagi Kehidupan Sehari-hari
                        </span>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {inter.makna}
                        </p>
                      </div>
                    </div>

                    {/* 3. Analisis Karakteristik: Kekuatan Utama vs Blindspots */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-1">
                          <ShieldCheck className="w-4 h-4 text-[#561269]" />
                          Analisis Karakteristik &amp; Dinamika Diri
                        </h4>
                        <p className="text-xs text-gray-500">
                          Pemetaan keunggulan utama serta area blindspot yang perlu diperhatikan:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
                          <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Kekuatan Utama (Core Strengths)
                          </span>
                          <ul className="space-y-1.5 text-xs text-emerald-950">
                            {(inter.kekuatanUtama || [
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

                        <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/70 space-y-2">
                          <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            Titik Rawan (Blindspots)
                          </span>
                          <ul className="space-y-1.5 text-xs text-rose-950">
                            {(inter.blindspots || [
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
                    </div>

                    {/* 4. Lingkungan & Budaya Kerja Optimal */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-3">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-1">
                          <Compass className="w-4 h-4 text-[#561269]" />
                          Lingkungan &amp; Budaya Kerja Optimal
                        </h4>
                        <p className="text-xs text-gray-500">
                          Kondisi eksternal yang paling mendukung potensi dan produktivitas:
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/70">
                        <ul className="space-y-1.5 text-xs text-gray-800">
                          {(inter.lingkunganOptimal || [
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
                    </div>

                    {/* 5. Langkah Pengembangan Diri */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-1">
                          <HeartHandshake className="w-4 h-4 text-[#561269]" />
                          Langkah Pengembangan Diri
                        </h4>
                        <p className="text-xs text-gray-500">
                          Saran praktis untuk memaksimalkan potensi peserta:
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        {inter.saran.map((tip, index) => (
                          <div key={index} className="flex gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex-shrink-0 mt-0.5">
                              <CheckCircle2 className="w-4 h-4 text-[#561269]" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-gray-900">{tip.title}</h5>
                              <p className="mt-0.5 text-xs text-gray-600 leading-relaxed">{tip.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 6. Card Informasi Asesmen */}
                    <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-gray-700 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-[#561269] block">Validitas Asesmen</span>
                        <span className="text-[11px] text-gray-500">Respon pengerjaan dinilai konsisten</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <span>Cakupan: <strong>Analisis Komprehensif</strong></span>
                        <span>•</span>
                        <span>Status: <strong className="text-emerald-700">Terverifikasi</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* JIKA GRATIS: PERTAHANKAN TAMPILAN ASLI TANPA DIUBAH */}
              {selectedPeserta.jenisAkses === "Gratis" && selectedPeserta.status === "Selesai" && (
                <div>
                  <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Ringkasan Analisis Psikotes
                  </h5>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm text-gray-700 leading-relaxed">
                    Berdasarkan asesmen psikotes yang telah diselesaikan, peserta menunjukkan kecenderungan yang konsisten dengan profil &quot;{selectedPeserta.skor}&quot;. Hasil ini dapat dijadikan acuan dalam konsultasi lanjutan atau pengembangan diri secara mandiri.
                  </div>
                </div>
              )}

              {/* Belum Selesai */}
              {selectedPeserta.status !== "Selesai" && (
                <div className="text-center p-6 border border-dashed border-gray-200 rounded-2xl">
                  <Clock className="w-7 h-7 text-amber-500 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Peserta masih dalam proses pengerjaan tes.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
              {selectedPeserta.jenisAkses === "Berbayar" && selectedPeserta.status === "Selesai" ? (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Cetak Laporan (PDF)
                </button>
              ) : (
                <div></div>
              )}
              <button
                onClick={() => setSelectedPeserta(null)}
                className="px-6 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

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

              {/* Interpretasi Analisis */}
              <section className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5 flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#561269]" />
                    Interpretasi Analisis &amp; Landasan Ilmiah
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {previewBerbayarModal.inter.deskripsi}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8FB] border border-[#EFE7F2]">
                  <h4 className="text-[10px] font-bold text-[#561269] uppercase tracking-wider mb-1">
                    Implikasi bagi Kehidupan Sehari-hari
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {previewBerbayarModal.inter.makna}
                  </p>
                </div>
              </section>

              {/* Analisis Karakteristik: Kekuatan Utama vs Blindspots */}
              <section className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#561269]" />
                    Analisis Karakteristik &amp; Dinamika Diri
                  </h3>
                  <p className="text-xs text-gray-500">
                    Pemetaan keunggulan utama serta area blindspot yang perlu diperhatikan:
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Kekuatan Utama (Core Strengths)
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
                      Titik Rawan (Blindspots)
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

              {/* Lingkungan & Budaya Kerja Optimal */}
              <section className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#561269]" />
                    Lingkungan &amp; Budaya Kerja Optimal
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
