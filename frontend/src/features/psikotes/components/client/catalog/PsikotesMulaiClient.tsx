/** Halaman pengerjaan tes psikotes (soal berurutan, pengisian identitas, proteksi reload, dan submit jawaban). */
"use client"

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { usePsikotesTest } from "@/features/psikotes/hooks/usePsikotesTest";
import { psikotesService, type PaketPsikotesApiResponse } from "@/services/psikotes.service";
import { useAuthStore } from "@/store/authStore";
import { Loader2, AlertCircle, WifiOff, RefreshCw } from "lucide-react";
import PsikotesFormIdentitas, { type IdentityData } from "./PsikotesFormIdentitas";
import { navigateToPsikotesHasil } from "@/features/psikotes/utils/navigationHistory";
import {
  isCATS as checkCATS,
  isCDI as checkCDI,
  isDASS as checkDASS,
  isGAD as checkGAD,
  isIGDS as checkIGDS,
  isPHQ as checkPHQ,
  isPackagePaid,
} from "@/features/psikotes/utils/instrumentDetector";

// Helper pengecekan kelengkapan data identitas peserta berbayar
const isIdentityFullyCompleted = (data: IdentityData) => {
  const numUmur = parseInt(data.umur || "", 10);
  const isUnderAge = !isNaN(numUmur) && numUmur > 0 && numUmur < 18;

  if (isUnderAge) {
    return Boolean(
      data.nama?.trim() &&
      data.tempatLahir?.trim() &&
      data.tanggalLahir?.trim() &&
      data.umur?.trim() &&
      data.jenisKelamin?.trim() &&
      data.namaOrangTua?.trim() &&
      data.noTeleponOrangTua?.trim() &&
      data.pendidikan?.trim()
    );
  }

  return Boolean(
    data.nama?.trim() &&
    data.noTelepon?.trim() &&
    data.tempatLahir?.trim() &&
    data.tanggalLahir?.trim() &&
    data.status?.trim() &&
    data.umur?.trim() &&
    data.jenisKelamin?.trim() &&
    data.pekerjaan?.trim() &&
    data.pendidikan?.trim()
  );
};

export default function PsikotesMulaiClient({ params }: { params: { testId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dbData, setDbData] = useState<PaketPsikotesApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [localError, setLocalError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // State Identitas Peserta Khusus Paket Berbayar (DASS-42 / Berbayar)
  const [identityData, setIdentityData] = useState<IdentityData>({
    nama: "",
    noTelepon: "",
    tempatLahir: "",
    tanggalLahir: "",
    status: "",
    umur: "",
    jenisKelamin: "",
    pekerjaan: "",
    pendidikan: "",
    namaOrangTua: "",
    noTeleponOrangTua: "",
    persetujuanWali: false,
  });
  const [isIdentityCompleted, setIsIdentityCompleted] = useState(false);
  // State Pertanyaan Tambahan (Functional Impairment) khusus GAD-7 & PHQ-9 (Wajib dideklarasikan di top-level hooks)
  const [isAtFunctionalStep, setIsAtFunctionalStep] = useState(false);
  const [functionalAnswer, setFunctionalAnswer] = useState<number | null>(null);
  // State Khusus Instrumen CATS (Child and Adolescent Trauma Screen)
  const [catsPeristiwaLainnya, setCatsPeristiwaLainnya] = useState<string>("");
  const [catsPeristiwaPalingMengganggu, setCatsPeristiwaPalingMengganggu] = useState<string>("");
  const [catsShowDistressPrompt, setCatsShowDistressPrompt] = useState<boolean>(false);
  const [catsShowZeroPTEComplete, setCatsShowZeroPTEComplete] = useState<boolean>(false);
  const advanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const submitLockRef = useRef(false);

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, []);

  const fetchPackage = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await psikotesService.getById(params.testId);
      if (res && res.success && res.data) {
        setDbData(res.data);
      } else {
        setErrorMessage("Paket psikotes tidak ditemukan di database.");
      }
    } catch (err: any) {
      console.error("Gagal mengambil instrumen psikotes:", err);
      setErrorMessage("Tidak dapat terhubung ke server backend. Silakan periksa koneksi atau coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackage();
  }, [params.testId]);

  // Cegah pengerjaan ulang jika tiket pada sesi ini baru saja diselesaikan (misal akibat back/reload)
  useEffect(() => {
    const rawBooking = searchParams.get("bookingId") || searchParams.get("orderId");
    if (!rawBooking) return;
    try {
      const completedId = localStorage.getItem(`empathika_psikotes_done_${rawBooking}`);
      if (completedId) {
        const savedToken =
          searchParams.get("token") ||
          localStorage.getItem(`empathika_psikotes_token_${completedId}`) ||
          localStorage.getItem(`empathika_psikotes_token_${rawBooking}`);
        const tokenParam = savedToken ? `&token=${encodeURIComponent(savedToken)}` : "";
        navigateToPsikotesHasil(
          router,
          params.testId,
          `/psikotes/${params.testId}/hasil?paket=berbayar&bookingId=${encodeURIComponent(completedId)}${tokenParam}`
        );
      }
    } catch {}
  }, [params.testId, searchParams, router]);

  const questions = (dbData?.soal_psikotes && dbData.soal_psikotes.length > 0)
    ? dbData.soal_psikotes.map((s) => {
        const sortedPilihan = [...(s.pilihan_jawaban || [])].sort((a, b) => {
          const numA = Number(a.label);
          const numB = Number(b.label);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return (Number(a.bobot) || 0) - (Number(b.bobot) || 0);
        });
        return {
          id: s.id,
          text: s.pertanyaan,
          options: sortedPilihan.map((p) => p.teks_jawaban),
          weights: sortedPilihan.map((p) => Number(p.bobot) || 0),
          pilihanList: sortedPilihan,
        };
      })
    : [];

  const totalQuestions = questions.length;

  // Verifikasi keabsahan butir soal dari database:
  // Data Kritis: TIDAK BOLEH ADA FALLBACK SOAL ATAU OPSI RUSAK.
  const hasInvalidOptions = dbData?.soal_psikotes?.some(
    (s) => !s.pertanyaan || !s.pilihan_jawaban || s.pilihan_jawaban.length < 2
  );

  const calculateScore = (ans: Record<number, number>) => {
    return Object.entries(ans).reduce((sum, [qIdx, optIdx]) => {
      const q = questions[Number(qIdx)];
      return sum + Number(q?.weights[optIdx] ?? 0);
    }, 0);
  };

  const {
    currentIndex,
    setCurrentIndex,
    answers,
    setAnswers,
    showError,
    handleOptionSelect,
    handleNext,
    handlePrev,
    goToNext,
  } = usePsikotesTest(totalQuestions, params.testId, calculateScore);

  const isIGDS = checkIGDS(dbData, params.testId);
  const isDASS = checkDASS(dbData, params.testId);
  const isPHQ = checkPHQ(dbData, params.testId);
  const isGAD = checkGAD(dbData, params.testId);
  const isCDI = checkCDI(dbData, params.testId);
  const isCATS = checkCATS(dbData, params.testId);

  const isPaidFlow = Boolean(
    (dbData
      ? isPackagePaid(dbData)
      : isDASS) ||
    searchParams.get("paket") === "berbayar" ||
    searchParams.get("plan") === "berbayar" ||
    Boolean(searchParams.get("bookingId")) ||
    Boolean(searchParams.get("orderId"))
  );

  // 0. Prefill Data Diri Peserta dari localStorage
  useEffect(() => {
    try {
      let savedNama = "";
      let savedPhone = "";
      let savedTempatLahir = "";
      let savedTanggalLahir = "";
      let savedStatus = "";
      let savedUmur = "";
      let savedGender = "";
      let savedPekerjaan = "";
      let savedPendidikan = "";
      let savedNamaOrangTua = "";
      let savedNoTeleponOrangTua = "";
      let savedPersetujuanWali = false;

      const raw = localStorage.getItem("empathika_peserta_psikotes");
      if (raw) {
        const parsed = JSON.parse(raw);
        // HANYA ambil nama jika ini data peserta yang sudah mengisi form identitas lengkap sebelumnya
        // JANGAN gunakan nama pembeli dari transaksi/checkout
        if (parsed.tempatLahir && parsed.tanggalLahir && parsed.nama) {
          savedNama = parsed.nama;
          savedPhone = parsed.noTelepon || parsed.no_telepon || parsed.whatsapp || "";
          savedTempatLahir = parsed.tempatLahir;
          savedTanggalLahir = parsed.tanggalLahir;
          savedStatus = parsed.status || "";
          savedUmur = parsed.umur ? String(parsed.umur) : "";
          savedGender = parsed.jenisKelamin || "";
          savedPekerjaan = parsed.pekerjaan || "";
          savedPendidikan = parsed.pendidikan || "";
          savedNamaOrangTua = parsed.namaOrangTua || parsed.nama_orang_tua || "";
          savedNoTeleponOrangTua = parsed.noTeleponOrangTua || parsed.no_telepon_orang_tua || "";
          savedPersetujuanWali = parsed.persetujuanWali ?? false;
        }
      }

      const mergedData: IdentityData = {
        nama: savedNama || "",
        noTelepon: savedPhone || "",
        tempatLahir: savedTempatLahir || "",
        tanggalLahir: savedTanggalLahir || "",
        status: savedStatus || "",
        umur: savedUmur || "",
        jenisKelamin: savedGender || "",
        pekerjaan: savedPekerjaan || "",
        pendidikan: savedPendidikan || "",
        namaOrangTua: savedNamaOrangTua || "",
        noTeleponOrangTua: savedNoTeleponOrangTua || "",
        persetujuanWali: Boolean(savedPersetujuanWali),
      };

      setIdentityData(mergedData);

      // Cek apakah data identitas sudah benar-benar lengkap terisi
      const isComplete = isIdentityFullyCompleted(mergedData);
      const rawSession = sessionStorage.getItem(`empathika_psikotes_progress_${params.testId}`);
      if (rawSession && isComplete) {
        const parsedSession = JSON.parse(rawSession);
        if (parsedSession?.identityCompleted) {
          setIsIdentityCompleted(true);
        } else {
          setIsIdentityCompleted(false);
        }
      } else {
        // Jika data identitas belum lengkap, WAJIB tampilkan formulir identitas
        setIsIdentityCompleted(false);
      }
    } catch {}
  }, [params.testId, searchParams]);

  // 1. Session Recovery: Pulihkan progres jika halaman tidak sengaja ter-refresh
  useEffect(() => {
    if (questions.length === 0) return;
    try {
      const raw = sessionStorage.getItem(`empathika_psikotes_progress_${params.testId}`);
      if (raw) {
        const saved = JSON.parse(raw);
        const currentOrderId = searchParams.get("orderId");
        // Jika terdapat orderId di URL namun berbeda dari orderId sesi sebelumnya, bersihkan sesi lama
        if (currentOrderId && saved.orderId && saved.orderId !== currentOrderId) {
          sessionStorage.removeItem(`empathika_psikotes_progress_${params.testId}`);
          setIsIdentityCompleted(false);
          return;
        }

        // Pada paket berbayar, jika data identitas belum lengkap, jangan pulihkan progres jawaban
        const isCompleted = isIdentityFullyCompleted(identityData);
        if (isPaidFlow && !isCompleted) {
          setIsIdentityCompleted(false);
          return;
        }

        if (saved && typeof saved.answers === "object" && Object.keys(saved.answers).length > 0) {
          setAnswers(saved.answers);
          if (typeof saved.currentIndex === "number" && saved.currentIndex < questions.length) {
            setCurrentIndex(saved.currentIndex);
          }
          if (typeof saved.functionalAnswer === "number") {
            setFunctionalAnswer(saved.functionalAnswer);
          }
          if (typeof saved.isAtFunctionalStep === "boolean") {
            setIsAtFunctionalStep(saved.isAtFunctionalStep);
          }
          if (typeof saved.catsPeristiwaLainnya === "string") {
            setCatsPeristiwaLainnya(saved.catsPeristiwaLainnya);
          }
          if (typeof saved.catsPeristiwaPalingMengganggu === "string") {
            setCatsPeristiwaPalingMengganggu(saved.catsPeristiwaPalingMengganggu);
          }
          if (typeof saved.catsShowDistressPrompt === "boolean") {
            setCatsShowDistressPrompt(saved.catsShowDistressPrompt);
          }
          if (typeof saved.identityCompleted === "boolean" && isCompleted) {
            setIsIdentityCompleted(saved.identityCompleted);
          }
        }
      }
    } catch {}
  }, [params.testId, questions.length, setAnswers, setCurrentIndex, searchParams, isPaidFlow, identityData]);

  // 2. Simpan progres sementara ke sessionStorage
  useEffect(() => {
    if (questions.length === 0) return;
    if (Object.keys(answers).length === 0 && !isAtFunctionalStep && !isIdentityCompleted) return;
    try {
      sessionStorage.setItem(
        `empathika_psikotes_progress_${params.testId}`,
        JSON.stringify({
          orderId: searchParams.get("orderId") || null,
          answers,
          currentIndex,
          functionalAnswer,
          isAtFunctionalStep,
          catsPeristiwaLainnya,
          catsPeristiwaPalingMengganggu,
          catsShowDistressPrompt,
          identityCompleted: isIdentityCompleted,
        })
      );
    } catch {}
  }, [
    answers,
    currentIndex,
    functionalAnswer,
    isAtFunctionalStep,
    isIdentityCompleted,
    catsPeristiwaLainnya,
    catsPeristiwaPalingMengganggu,
    catsShowDistressPrompt,
    params.testId,
    questions.length,
    searchParams,
  ]);

  const currentQuestion = questions[currentIndex] || questions[0] || {
    id: "",
    text: "",
    options: [] as string[],
    weights: [] as number[],
    pilihanList: [],
  };
  const progressPercentage = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  // Instruksi / Timeframe dinamis per instrumen psikotes:
  // 1. Prioritaskan instruksiSingkat dari metadata alat ukur backend
  // 2. Deteksi kode instrumen baku (IGDS: 12 bulan, DASS: 1 minggu, PHQ/GAD: 2 minggu)
  // 3. Fallback netral untuk tes umum: "Pilihlah opsi yang paling menggambarkan kondisimu:"
  // Identifikasi Instrumen Fungsional GAD-7 & PHQ-9
  const isFunctionalInstrument = isPHQ || isGAD;

  const FUNCTIONAL_QUESTION = {
    title:
      "Seberapa besar kesulitan yang Anda alami dalam melakukan pekerjaan, mengurus rumah tangga, atau berinteraksi dengan orang lain akibat keluhan tersebut?",
    options: [
      "Tidak menyulitkan sama sekali",
      "Sedikit menyulitkan",
      "Sangat menyulitkan",
      "Luar biasa menyulitkan",
    ],
  };

  // Cek apakah ada minimal 1 jawaban dengan skor > 0 pada butir utama
  const hasSymptomScoreGreaterThanZero = (currentAnswers = answers) => {
    return Object.entries(currentAnswers).some(([qIdx, optIdx]) => {
      const q = questions[Number(qIdx)];
      const weight = q?.weights[optIdx] ?? 0;
      return weight > 0;
    });
  };

  const timeframeText = isCATS
    ? currentIndex < 15
      ? "Berikut adalah beberapa peristiwa yang mungkin pernah dialami anak. Pilih Ya jika pernah dialami dan Tidak jika tidak pernah dialami."
      : currentIndex < 35
      ? "Dalam 2 minggu terakhir, seberapa sering anak mengalami hal-hal berikut:"
      : "Pilih Ya atau Tidak untuk menunjukkan apakah masalah yang dialami anak mengganggu aspek-aspek berikut:"
    : dbData?.alat_ukur?.instruksiSingkat ||
      (isIGDS
        ? "Dalam 12 bulan terakhir, seberapa sering kamu:"
        : isDASS
        ? "Dalam 1 minggu terakhir, seberapa sering kamu:"
        : isPHQ || isGAD || isCDI
        ? "Dalam 2 minggu terakhir, seberapa sering kamu:"
        : "Pilihlah opsi yang paling menggambarkan kondisimu:");

  const shouldShowIdentityForm = isPaidFlow && !isIdentityCompleted;

  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleSelectOption = (optionIdx: number) => {
    if (isAdvancing || isSubmitting) return;

    handleOptionSelect(optionIdx);
    setLocalError(false);
    setSubmitError(null);

    // Khusus CATS butir 15 (index 14) jika memilih "Ya", jangan langsung auto-advance agar peserta dapat mengisi teks peristiwa lainnya
    if (isCATS && currentIndex === 14 && optionIdx === 1) {
      return;
    }

    // Di butir terakhir:
    if (isLastQuestion) {
      // Jika instrumen GAD-7 / PHQ-9 dan ada jawaban dengan skor > 0, lanjut ke pertanyaan tambahan
      if (isFunctionalInstrument) {
        const nextAnswers = { ...answers, [currentIndex]: optionIdx };
        const hasScore = hasSymptomScoreGreaterThanZero(nextAnswers);
        if (hasScore) {
          setIsAdvancing(true);
          if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
          advanceTimeoutRef.current = setTimeout(() => {
            setIsAtFunctionalStep(true);
            setIsAdvancing(false);
          }, 350);
          return;
        }
      }
      return;
    }

    // Auto-advance dengan debouncing ketat agar tidak ada soal terlewat saat klik cepat
    setIsAdvancing(true);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    advanceTimeoutRef.current = setTimeout(() => {
      // Khusus CATS butir 15 (index 14) jika dijawab "Tidak":
      if (isCATS && currentIndex === 14) {
        const nextAnswers: Record<number, number> = { ...answers, [14]: optionIdx };
        const pteCount = questions.slice(0, 15).filter((q, idx) => {
          const a = nextAnswers[idx];
          return a !== undefined && q.weights[a] > 0;
        }).length;
        if (pteCount === 0) {
          setCatsShowZeroPTEComplete(true);
          setIsAdvancing(false);
          return;
        } else {
          setCatsShowDistressPrompt(true);
          setIsAdvancing(false);
          return;
        }
      }

      goToNext();
      setIsAdvancing(false);
    }, 350);
  };

  const handleSafePrev = () => {
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    setIsAdvancing(false);
    setLocalError(false);

    if (isAtFunctionalStep) {
      setIsAtFunctionalStep(false);
      setCurrentIndex(totalQuestions - 1);
      return;
    }

    if (isCATS && catsShowZeroPTEComplete) {
      setCatsShowZeroPTEComplete(false);
      setCurrentIndex(14);
      return;
    }

    if (isCATS && catsShowDistressPrompt) {
      setCatsShowDistressPrompt(false);
      setCurrentIndex(14);
      return;
    }

    if (isCATS && currentIndex === 15) {
      const pteCount = questions.slice(0, 15).filter((q, idx) => {
        const a = answers[idx];
        return a !== undefined && q.weights[a] > 0;
      }).length;
      if (pteCount > 0) {
        setCatsShowDistressPrompt(true);
        setCurrentIndex(14);
        return;
      }
    }

    handlePrev();
  };

  const handleSafeNext = () => {
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    setIsAdvancing(false);
    setLocalError(false);

    // Jika sedang di layar CATS: Pilih Peristiwa Paling Mengganggu
    if (isCATS && catsShowDistressPrompt) {
      setCatsShowDistressPrompt(false);
      setCurrentIndex(15);
      return;
    }

    // Jika sedang di layar CATS: 0 PTE Selesai
    if (isCATS && catsShowZeroPTEComplete) {
      handleFinish();
      return;
    }

    if (answers[currentIndex] === undefined) {
      setLocalError(true);
      return;
    }

    // Khusus CATS saat di butir 15 (index 14):
    if (isCATS && currentIndex === 14) {
      const pteCount = questions.slice(0, 15).filter((q, idx) => {
        const a = answers[idx];
        return a !== undefined && q.weights[a] > 0;
      }).length;

      if (pteCount === 0) {
        setCatsShowZeroPTEComplete(true);
        return;
      }

      if (!catsShowDistressPrompt) {
        setCatsShowDistressPrompt(true);
        return;
      }
    }

    if (isLastQuestion) {
      if (isFunctionalInstrument && hasSymptomScoreGreaterThanZero()) {
        setIsAtFunctionalStep(true);
        return;
      }
      handleFinish();
      return;
    }

    handleNext();
  };

  const handleFinish = async () => {
    if (submitLockRef.current || isSubmitting) return;
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    setIsAdvancing(false);

    // Jika belum berada di functional step tapi instrumen ini memenuhi syarat pemicu:
    if (!isAtFunctionalStep && isFunctionalInstrument && hasSymptomScoreGreaterThanZero()) {
      if (answers[currentIndex] === undefined) {
        setLocalError(true);
        return;
      }
      setIsAtFunctionalStep(true);
      return;
    }

    // Hitung jawaban efektif (khusus CATS jika 0 PTE dialami, butir 16–40 otomatis bernilai 0 / Tidak Pernah)
    const effectiveAnswers = { ...answers };
    if (isCATS) {
      const pteCount = questions.slice(0, 15).filter((q, idx) => {
        const a = effectiveAnswers[idx];
        return a !== undefined && q.weights[a] > 0;
      }).length;
      if (pteCount === 0) {
        for (let i = 15; i < totalQuestions; i++) {
          effectiveAnswers[i] = 0;
        }
      }
    }

    // Jika sedang di functional step, validasi jawaban fungsional wajib dipilih
    if (isAtFunctionalStep && functionalAnswer === null) {
      setLocalError(true);
      return;
    }

    // Validasi 1: Butir saat ini wajib dijawab
    if (!isAtFunctionalStep && !catsShowZeroPTEComplete && effectiveAnswers[currentIndex] === undefined) {
      setLocalError(true);
      return;
    }

    // Validasi 2: Integritas butir lengkap - tidak boleh ada butir terlewat
    const missingIdx = questions.findIndex((_, idx) => effectiveAnswers[idx] === undefined);
    if (missingIdx !== -1) {
      setIsAtFunctionalStep(false);
      setCatsShowZeroPTEComplete(false);
      setCatsShowDistressPrompt(false);
      setCurrentIndex(missingIdx);
      setLocalError(true);
      setSubmitError(`Pertanyaan nomor ${missingIdx + 1} belum dijawab. Mohon lengkapi seluruh pertanyaan terlebih dahulu.`);
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);
    let pesertaNama = "";
    let pesertaWa = "";
    let pesertaEmail = "";

    try {
      // Ambil data diri peserta:
      // Pada psikotes gratis, peserta tidak mengisi formulir identitas (anonim).
      // Data diri hanya diambil jika paket berbayar dari pendaftaran / formulir identitas peserta.
      const isPaketGratis = !isPaidFlow;

      if (isPaidFlow) {
        pesertaNama = identityData.nama.trim();
        pesertaWa = identityData.noTelepon?.trim() || "";
        pesertaEmail = searchParams.get("email") || "";

        if (!pesertaNama || !pesertaWa) {
          try {
            const raw = localStorage.getItem("empathika_peserta_psikotes");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (!pesertaNama && parsed.nama) pesertaNama = parsed.nama;
              if (!pesertaWa && (parsed.noTelepon || parsed.no_telepon || parsed.whatsapp)) {
                pesertaWa = parsed.noTelepon || parsed.no_telepon || parsed.whatsapp;
              }
              if (!pesertaEmail && parsed.email) pesertaEmail = parsed.email;
            }
          } catch {}
        }
      } else {
        pesertaNama = searchParams.get("nama") || "";
        pesertaWa = searchParams.get("whatsapp") || searchParams.get("no_telepon") || "";
        pesertaEmail = searchParams.get("email") || "";

        if (!pesertaNama || !pesertaWa || !pesertaEmail) {
          try {
            const raw = localStorage.getItem("empathika_peserta_psikotes");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (!pesertaNama && parsed.nama) pesertaNama = parsed.nama;
              if (!pesertaWa && (parsed.no_telepon || parsed.whatsapp)) pesertaWa = parsed.no_telepon || parsed.whatsapp;
              if (!pesertaEmail && parsed.email) pesertaEmail = parsed.email;
            }
          } catch {}
        }

        // Fallback dari user yang sedang login jika bukan akun admin
        const authUser = useAuthStore.getState().user;
        if (authUser && authUser.role !== "ADMIN" && (authUser as any).role !== "admin") {
          if (!pesertaNama && authUser.name) pesertaNama = authUser.name;
          if (!pesertaEmail && authUser.email) pesertaEmail = authUser.email;
        }
      }

      // Validasi integritas butir soal: tidak boleh ada submit jika data soal kosong
      if (questions.length === 0) {
        throw new Error("Tidak ada butir soal yang dapat dikirim.");
      }

      // Susun payload jawaban untuk dikirim ke backend sesuai urutan pilihan yang ditampilkan
      const jawabanPayload = questions.map((q, idx) => {
        const selectedOptIdx = effectiveAnswers[idx] ?? 0;
        const pilihan = q.pilihanList[selectedOptIdx];
        return {
          id_soal: q.id,
          id_pilihan: pilihan ? pilihan.id : q.pilihanList[0]?.id,
        };
      });

      const bookingIdParam = searchParams.get("bookingId") || searchParams.get("orderId") || undefined;
      const parsedUmur = identityData.umur ? parseInt(identityData.umur, 10) : undefined;
      const isUnderAge = !isNaN(Number(parsedUmur)) && Number(parsedUmur) < 18;
      const calculatedKategori = !isNaN(Number(parsedUmur))
        ? (Number(parsedUmur) < 12 ? "ANAK" : Number(parsedUmur) <= 17 ? "REMAJA" : "DEWASA")
        : undefined;

      const res = await psikotesService.submitJawaban(params.testId, {
        jawaban: jawabanPayload,
        dampak_aktivitas: (isPHQ || isGAD) && functionalAnswer !== null ? functionalAnswer : undefined,
        peristiwa_lainnya: isCATS && catsPeristiwaLainnya.trim() ? catsPeristiwaLainnya.trim() : undefined,
        peristiwaLainnya: isCATS && catsPeristiwaLainnya.trim() ? catsPeristiwaLainnya.trim() : undefined,
        peristiwa_paling_mengganggu: isCATS && catsPeristiwaPalingMengganggu.trim() ? catsPeristiwaPalingMengganggu.trim() : undefined,
        peristiwaPalingMengganggu: isCATS && catsPeristiwaPalingMengganggu.trim() ? catsPeristiwaPalingMengganggu.trim() : undefined,
        id_booking: bookingIdParam,
        bookingId: bookingIdParam,
        orderId: searchParams.get("orderId") || undefined,
        kode_akses: searchParams.get("orderId") || undefined,
        nama: isPaidFlow ? (identityData.nama.trim() || pesertaNama || undefined) : (pesertaNama || undefined),
        no_telepon: isPaidFlow
          ? (isUnderAge
              ? (identityData.noTeleponOrangTua?.trim() || identityData.noTelepon?.trim() || pesertaWa || undefined)
              : (identityData.noTelepon?.trim() || pesertaWa || undefined))
          : (pesertaWa || undefined),
        email: pesertaEmail || undefined,
        peserta: isPaidFlow
          ? {
              nama_lengkap: identityData.nama.trim() || pesertaNama || "Peserta Psikotes",
              no_telepon: isUnderAge
                ? (identityData.noTelepon?.trim() || identityData.noTeleponOrangTua?.trim() || undefined)
                : (identityData.noTelepon?.trim() || undefined),
              nama_orang_tua: isUnderAge ? (identityData.namaOrangTua?.trim() || undefined) : undefined,
              no_telepon_orang_tua: isUnderAge ? (identityData.noTeleponOrangTua?.trim() || undefined) : undefined,
              tempat_lahir: identityData.tempatLahir.trim() || undefined,
              tanggal_lahir: identityData.tanggalLahir.trim() || undefined,
              status_pernikahan: !isUnderAge ? (identityData.status.trim() || undefined) : undefined,
              usia: !isNaN(Number(parsedUmur)) ? Number(parsedUmur) : undefined,
              kategori_peserta: calculatedKategori,
              jenis_kelamin: identityData.jenisKelamin.trim() || undefined,
              pekerjaan: !isUnderAge ? (identityData.pekerjaan.trim() || undefined) : undefined,
              pendidikan: identityData.pendidikan.trim() || undefined,
              persetujuan_wali: isUnderAge ? Boolean(identityData.persetujuanWali) : undefined,
            }
          : undefined,
        klien: (pesertaNama || (isPaidFlow && identityData.nama)) ? {
          nama: (isPaidFlow ? identityData.nama.trim() : pesertaNama) || undefined,
          no_telepon: (isPaidFlow ? (identityData.noTelepon?.trim() || pesertaWa) : pesertaWa) || undefined,
          email: pesertaEmail || undefined,
          usia: !isNaN(Number(parsedUmur)) ? Number(parsedUmur) : undefined,
          jenis_kelamin: identityData.jenisKelamin.trim() || undefined,
        } : undefined,
      });

      if (res && res.success && res.data) {
        const query = new URLSearchParams(searchParams.toString());
        if (res.data.detail_skor?.tanpaSkorTotal) {
          query.delete("skor");
        } else {
          query.set("skor", String(res.data.total_skor));
        }
        query.set("bookingId", res.data.id_booking);
        if (res.data.access_token) {
          query.set("token", res.data.access_token);
          try {
            localStorage.setItem(`empathika_psikotes_token_${res.data.id_booking}`, res.data.access_token);
          } catch {}
        }

        // Jika ada data subscales (DASS-42 / RCMAS / CDI), simpan skor per dimensi ke URL
        if (res.data.detail_skor?.subscales) {
          const subs = res.data.detail_skor.subscales;
          if (subs.depression?.skor !== undefined) query.set("dep", String(subs.depression.skor));
          if (subs.anxiety?.skor !== undefined) query.set("anx", String(subs.anxiety.skor));
          if (subs.stress?.skor !== undefined) query.set("str", String(subs.stress.skor));
          if (subs.physiological?.skor !== undefined) query.set("phys", String(subs.physiological.skor));
          if (subs.worry?.skor !== undefined) query.set("worry", String(subs.worry.skor));
          if (subs.concentration?.skor !== undefined) query.set("conc", String(subs.concentration.skor));
          if (subs.negativeMood?.skor !== undefined) query.set("cdi_nm", String(subs.negativeMood.skor));
          if (subs.interpersonalProblem?.skor !== undefined) query.set("cdi_ip", String(subs.interpersonalProblem.skor));
          if (subs.ineffectiveness?.skor !== undefined) query.set("cdi_ineff", String(subs.ineffectiveness.skor));
          if (subs.anhedonia?.skor !== undefined) query.set("cdi_anh", String(subs.anhedonia.skor));
          if (subs.negativeSelfEsteem?.skor !== undefined) query.set("cdi_nse", String(subs.negativeSelfEsteem.skor));
          if (subs.intrusion?.skor !== undefined) query.set("cats_b", String(subs.intrusion.skor));
          if (subs.avoidance?.skor !== undefined) query.set("cats_c", String(subs.avoidance.skor));
          if (subs.cognitionMood?.skor !== undefined) query.set("cats_d", String(subs.cognitionMood.skor));
          if (subs.arousal?.skor !== undefined) query.set("cats_e", String(subs.arousal.skor));
        }

        // Jika ada skor CATS (PTE & Fungsi Psikososial), simpan ke URL
        if (res.data.detail_skor?.pte?.totalDialami !== undefined) {
          query.set("cats_pte", String(res.data.detail_skor.pte.totalDialami));
        }
        if (res.data.detail_skor?.fungsiPsikososial?.totalTerganggu !== undefined) {
          query.set("cats_f", String(res.data.detail_skor.fungsiPsikososial.totalTerganggu));
        }

        // Jika ada skor Lie Scale (RCMAS), simpan ke URL (untuk dashboard psikolog)
        if (res.data.detail_skor?.lieScale?.skor !== undefined) {
          query.set("lie", String(res.data.detail_skor.lieScale.skor));
        }

        // Jika ada data evaluasi DSM (IGDS9-SF), simpan ke URL
        if (res.data.detail_skor?.dsmEvaluation) {
          const dsm = res.data.detail_skor.dsmEvaluation;
          if (dsm.kriteriaSangatSering !== undefined) query.set("dsm5", String(dsm.kriteriaSangatSering));
          if (dsm.isIndikasiEvaluasi) query.set("dsmAlert", "1");
        }

        // Protokol Krisis / Melukai Diri untuk instrumen PHQ-9 dan CDI (Butir 9).
        // Instrumen DASS-42, GAD-7, dan RCMAS tidak memiliki butir skrining melukai diri.
        const isPHQ9 =
          dbData?.alat_ukur?.kode?.toUpperCase().includes("PHQ") ||
          dbData?.judul?.toUpperCase().includes("PHQ") ||
          params.testId.toLowerCase().includes("phq");

        const isCDI =
          dbData?.alat_ukur?.kode?.toUpperCase().includes("CDI") ||
          dbData?.judul?.toUpperCase().includes("CDI") ||
          params.testId.toLowerCase().includes("cdi");

        const hasHarm =
          (isPHQ9 || isCDI) &&
          Boolean(
            res.data.detail_skor?.ideMelukaiDiri ||
            (answers[8] !== undefined && Number(questions[8]?.weights[answers[8]]) > 0)
          );

        if (hasHarm) {
          query.set("harm", "1");
        }

        // Simpan jawaban pertanyaan tambahan (Functional Impairment) ke query param & localStorage
        if (functionalAnswer !== null) {
          query.set("impairment", String(functionalAnswer));
          try {
            localStorage.setItem(`empathika_impairment_${params.testId}`, String(functionalAnswer));
          } catch {}
        }

        // Bersihkan progres sesi karena tes sudah berhasil diselesaikan & disimpan
        try {
          sessionStorage.removeItem(`empathika_psikotes_progress_${params.testId}`);
        } catch {}

        if (isPaidFlow) {
          query.set("paket", "berbayar");
          const rawBooking = searchParams.get("bookingId") || searchParams.get("orderId");
          const canonicalBookingId = res.data.id_booking || rawBooking || "";
          if (canonicalBookingId) {
            query.set("bookingId", canonicalBookingId);
            try {
              localStorage.setItem(`empathika_psikotes_done_${canonicalBookingId}`, canonicalBookingId);
              if (res.data.access_token) {
                localStorage.setItem(`empathika_psikotes_token_${canonicalBookingId}`, res.data.access_token);
                if (rawBooking) {
                  localStorage.setItem(`empathika_psikotes_token_${rawBooking}`, res.data.access_token);
                }
              }
              if (rawBooking) {
                localStorage.setItem(`empathika_psikotes_done_${rawBooking}`, canonicalBookingId);
              }
            } catch {}
          }
          const finalNama = identityData.nama.trim() || pesertaNama;
          const finalWa = isUnderAge
            ? (identityData.noTelepon?.trim() || identityData.noTeleponOrangTua?.trim() || pesertaWa)
            : (identityData.noTelepon?.trim() || pesertaWa);
          if (finalNama) query.set("nama", finalNama);
          if (finalWa) query.set("whatsapp", finalWa);
          if (calculatedKategori) query.set("kategori", calculatedKategori);
          if (!isUnderAge && identityData.status) query.set("status", identityData.status.trim());
          if (identityData.umur) query.set("umur", identityData.umur.trim());
          if (identityData.jenisKelamin) query.set("gender", identityData.jenisKelamin.trim());
          if (!isUnderAge && identityData.pekerjaan) query.set("pekerjaan", identityData.pekerjaan.trim());
          if (identityData.pendidikan) query.set("pendidikan", identityData.pendidikan.trim());
          if (pesertaEmail) query.set("email", pesertaEmail);
        } else {
          query.set("paket", "gratis");
          if (pesertaNama) query.set("nama", pesertaNama);
          if (pesertaWa) query.set("whatsapp", pesertaWa);
          if (pesertaEmail) query.set("email", pesertaEmail);
        }
        navigateToPsikotesHasil(router, params.testId, `/psikotes/${params.testId}/hasil?${query.toString()}`);
        return;
      }

      throw new Error(res?.message || "Server tidak dapat memproses jawaban psikotes.");
    } catch (err: any) {
      console.error("Gagal menyimpan jawaban psikotes ke server:", err);
      const status = err?.response?.status;
      const backendMessage = err?.response?.data?.message;
      const existingBooking = searchParams.get("bookingId") || searchParams.get("orderId");

      // Jika tiket ternyata sudah selesai (misal karena double-submit atau sesi sebelumnya), langsung arahkan ke hasil
      if (
        status === 400 &&
        existingBooking &&
        typeof backendMessage === "string" &&
        backendMessage.toLowerCase().includes("sudah selesai")
      ) {
        try {
          sessionStorage.removeItem(`empathika_psikotes_progress_${params.testId}`);
        } catch {}
        let existingToken = searchParams.get("token") || "";
        if (!existingToken) {
          try {
            existingToken = localStorage.getItem(`empathika_psikotes_token_${existingBooking}`) || "";
          } catch {}
        }
        const tokenParam = existingToken ? `&token=${encodeURIComponent(existingToken)}` : "";
        navigateToPsikotesHasil(
          router,
          params.testId,
          `/psikotes/${params.testId}/hasil?paket=berbayar&bookingId=${encodeURIComponent(existingBooking)}${tokenParam}`
        );
        return;
      }

      setSubmitError(
        backendMessage ||
          err?.message ||
          "Terjadi kendala saat mengirim jawaban ke server. Pastikan koneksi internet stabil lalu coba lagi."
      );
      submitLockRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSelesaiButton =
    isAtFunctionalStep ||
    catsShowZeroPTEComplete ||
    (!catsShowDistressPrompt && isLastQuestion && (!isFunctionalInstrument || !hasSymptomScoreGreaterThanZero()));

  const effectiveProgressPercentage =
    isAtFunctionalStep || catsShowZeroPTEComplete
      ? 100
      : catsShowDistressPrompt
      ? Math.round((15 / (totalQuestions || 40)) * 100)
      : progressPercentage;

  // 4. Keyboard Shortcuts Listener (Desktop: 1-4, A-D, Panah Kiri/Kanan, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldShowIdentityForm) return;
      if (isLoading || !dbData || questions.length === 0 || hasInvalidOptions) return;
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === "input" || targetTag === "textarea" || targetTag === "select") return;
      if (isSubmitting || isAdvancing) return;

      const key = e.key.toLowerCase();

      // Pilihan opsi jawaban 1-5 atau A-E
      let optIdx: number | null = null;
      if (key === "1" || key === "a") optIdx = 0;
      else if (key === "2" || key === "b") optIdx = 1;
      else if (key === "3" || key === "c") optIdx = 2;
      else if (key === "4" || key === "d") optIdx = 3;
      else if (key === "5" || key === "e") optIdx = 4;

      if (optIdx !== null) {
        if (isAtFunctionalStep) {
          if (optIdx < FUNCTIONAL_QUESTION.options.length) {
            setFunctionalAnswer(optIdx);
            setLocalError(false);
            setSubmitError(null);
          }
        } else {
          const numOptions = currentQuestion?.options?.length || 0;
          if (optIdx < numOptions) {
            handleSelectOption(optIdx);
          }
        }
        return;
      }

      // Panah Kiri: Sebelumnya
      if (e.key === "ArrowLeft") {
        if (currentIndex > 0 || isAtFunctionalStep) {
          handleSafePrev();
        }
        return;
      }

      // Panah Kanan atau Enter: Lanjut / Selesai
      if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        if (isSelesaiButton) {
          handleFinish();
        } else {
          handleSafeNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isLoading,
    dbData,
    questions.length,
    hasInvalidOptions,
    currentIndex,
    isAtFunctionalStep,
    isSubmitting,
    isAdvancing,
    currentQuestion,
    isSelesaiButton,
    answers,
    functionalAnswer,
  ]);

  // Layar Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-[#561269] mb-4" />
        <p className="text-sm text-gray-500 font-medium">Memuat soal psikotes...</p>
      </div>
    );
  }

  // Layar Error Koneksi — Jika backend mati
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] font-sans pt-28 sm:pt-32 lg:pt-36 pb-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-red-100 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Gagal Menghubungkan ke Server</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {errorMessage}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={fetchPackage}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#561269] text-white text-xs font-bold hover:bg-[#763E8B] transition shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
            <Link
              href={`/psikotes/${params.testId}`}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition shadow-sm"
            >
              Kembali
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // DATA KRITIS: Integritas Klinis Soal & Opsi Jawaban
  if (!dbData || questions.length === 0 || hasInvalidOptions) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] font-sans pt-28 sm:pt-32 lg:pt-36 pb-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-amber-200 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{dbData?.judul || "Instrumen Psikotes"}</h2>
          <p className="text-sm font-semibold text-gray-800 mb-2">
            Instrumen Soal Belum Dikonfigurasi
          </p>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Demi menjaga integritas dan akurasi klinis, tes ini tidak dapat dimulai karena butir pertanyaan atau opsi pilihan jawaban belum terdaftar di database. Silakan hubungi tim Empathika.
          </p>
          <Link
            href="/psikotes"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#561269] hover:bg-[#763E8B] text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Kembali ke Daftar Psikotes
          </Link>
        </div>
      </div>
    );
  }

  // Layar Formulir Identitas Peserta (Khusus Paket Berbayar / DASS-42)
  if (shouldShowIdentityForm) {
    return (
      <PsikotesFormIdentitas
        data={identityData}
        onChange={setIdentityData}
        onComplete={() => setIsIdentityCompleted(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfb] pt-28 sm:pt-32 lg:pt-36 pb-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#561269] selection:text-white flex flex-col justify-between">
      <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col">
        {/* Top Progress Bar */}
        <div className="mb-6 md:mb-8">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#561269] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${effectiveProgressPercentage}%` }}
            />
          </div>

          <div className="mt-2.5 flex justify-between items-center text-xs text-gray-500">
            {!isAtFunctionalStep && !catsShowZeroPTEComplete && (
              <span className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wide">
                {isCATS && catsShowDistressPrompt ? (
                  <span className="text-[#561269] font-bold">Peristiwa Paling Mengganggu</span>
                ) : (
                  <>
                    Pertanyaan <span className="font-bold text-gray-800">{currentIndex + 1}</span> dari {totalQuestions}
                  </>
                )}
              </span>
            )}
            {isCATS && catsShowZeroPTEComplete && (
              <span className="text-xs sm:text-sm font-semibold text-gray-500 tracking-wide">
                Konfirmasi Penyelesaian
              </span>
            )}
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-gray-100 mb-6 flex-1 flex flex-col justify-center transition-all duration-300">
            {isAtFunctionalStep ? (
              <>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-relaxed text-center mb-6 md:mb-8 max-w-xl mx-auto">
                  {FUNCTIONAL_QUESTION.title}
                </h2>

                {/* Options Khusus Functional Impairment */}
                <div className="flex flex-col gap-3">
                  {FUNCTIONAL_QUESTION.options.map((opt, idx) => {
                    const isSelected = functionalAnswer === idx;
                    return (
                      <button
                        key={idx}
                        disabled={isSubmitting}
                        onClick={() => {
                          setFunctionalAnswer(idx);
                          setLocalError(false);
                          setSubmitError(null);
                        }}
                        className={`text-left w-full p-3.5 sm:p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3.5 group cursor-pointer ${
                          isSelected 
                            ? "border-[#561269] bg-[#561269]/5 shadow-xs scale-[1.005]" 
                            : "border-gray-100 hover:border-[#561269]/30 hover:bg-gray-50/80"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors duration-200 font-bold text-xs ${
                          isSelected ? "border-[#561269] bg-[#561269] text-white" : "border-gray-300 text-gray-500 group-hover:border-[#561269]/50 group-hover:text-[#561269]"
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`text-sm sm:text-base font-medium leading-relaxed transition-colors duration-200 ${
                          isSelected ? "text-[#561269]" : "text-gray-700"
                        }`}>
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : isCATS && catsShowZeroPTEComplete ? (
              <div className="text-center py-4 px-2 space-y-4 max-w-lg mx-auto">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
                  Tidak Ada Paparan Peristiwa Traumatis Dilaporkan
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Berdasarkan jawaban pada 15 daftar peristiwa, anak/remaja tidak melaporkan adanya peristiwa yang berpotensi menimbulkan trauma. Sesuai alur asesmen, pemeriksaan gejala PTSD tidak perlu dilanjutkan karena tidak ditemukan paparan peristiwa traumatis dalam jawaban.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinish}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#561269] hover:bg-[#763E8B] text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan Hasil...</span>
                      </>
                    ) : (
                      <span>Selesaikan Asesmen & Lihat Hasil</span>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setCatsShowZeroPTEComplete(false)}
                    className="w-full sm:w-auto px-5 py-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold transition cursor-pointer"
                  >
                    Cek Kembali Jawaban
                  </button>
                </div>
              </div>
            ) : isCATS && catsShowDistressPrompt ? (
              <div className="space-y-6 max-w-xl mx-auto w-full">
                <div className="text-center">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
                    Mana yang paling mengganggu anak sekarang?
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    Dari peristiwa yang telah dipilih sebelumnya, tuliskan peristiwa yang paling mengganggu anak saat ini.
                  </p>
                </div>

                {/* Input Teks Bebas */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    Jawaban:
                  </label>
                  <textarea
                    rows={3}
                    value={catsPeristiwaPalingMengganggu}
                    onChange={(e) => {
                      setCatsPeristiwaPalingMengganggu(e.target.value);
                      setLocalError(false);
                    }}
                    placeholder="Tuliskan peristiwa yang paling mengganggu anak di sini..."
                    className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#561269] focus:ring-2 focus:ring-[#561269]/20 transition shadow-xs"
                  />
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs sm:text-sm text-gray-400 font-medium text-center mb-2">
                  {timeframeText}
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug md:leading-normal text-center mb-6 md:mb-8">
                  {currentQuestion.text}
                </h2>

                {/* Options */}
                <div className="flex flex-col gap-3">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = answers[currentIndex] === idx;
                    return (
                      <button
                        key={idx}
                        disabled={isAdvancing || isSubmitting}
                        onClick={() => handleSelectOption(idx)}
                        className={`text-left w-full p-3.5 sm:p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3.5 group cursor-pointer ${
                          isSelected 
                            ? "border-[#561269] bg-[#561269]/5 shadow-xs scale-[1.005]" 
                            : "border-gray-100 hover:border-[#561269]/30 hover:bg-gray-50/80"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors duration-200 font-bold text-xs ${
                          isSelected ? "border-[#561269] bg-[#561269] text-white" : "border-gray-300 text-gray-500 group-hover:border-[#561269]/50 group-hover:text-[#561269]"
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`text-sm sm:text-base font-medium leading-relaxed transition-colors duration-200 ${
                          isSelected ? "text-[#561269]" : "text-gray-700"
                        }`}>
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Khusus CATS butir 15 (index 14): Jika dijawab "Ya", sediakan kolom essay singkat untuk menyebutkan peristiwanya */}
                {isCATS && currentIndex === 14 && answers[14] === 1 && (
                  <div className="mt-4 animate-fadeIn space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      Sebutkan peristiwa tersebut:
                    </label>
                    <textarea
                      rows={2}
                      value={catsPeristiwaLainnya}
                      onChange={(e) => setCatsPeristiwaLainnya(e.target.value)}
                      placeholder="Contoh: Mengalami perundungan parah di lingkungan sekolah..."
                      className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#561269] focus:border-transparent transition shadow-2xs"
                    />
                  </div>
                )}
              </>
            )}
            
            {(showError || localError) && (
              <p className="text-red-500 text-xs sm:text-sm font-medium text-center mt-5 animate-pulse">
                Silakan pilih jawaban terlebih dahulu.
              </p>
            )}

            {submitError && (
              <div className="mt-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm text-center flex flex-col items-center gap-2">
                <p className="font-semibold">{submitError}</p>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Coba Kirim Ulang
                </button>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 mt-auto pt-1">
            <button
              onClick={handleSafePrev}
              disabled={
                (currentIndex === 0 && !isAtFunctionalStep && !catsShowDistressPrompt && !catsShowZeroPTEComplete) ||
                isSubmitting ||
                isAdvancing
              }
              className={`px-5 py-2.5 sm:py-3 rounded-xl font-bold transition-all duration-200 text-xs sm:text-sm cursor-pointer ${
                currentIndex === 0 && !isAtFunctionalStep && !catsShowDistressPrompt && !catsShowZeroPTEComplete
                  ? "opacity-0 pointer-events-none" 
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-xs"
              }`}
            >
              Sebelumnya
            </button>

            <button
              onClick={isSelesaiButton ? handleFinish : handleSafeNext}
              disabled={isSubmitting || isAdvancing}
              className={`px-6 py-2.5 sm:py-3 rounded-xl font-extrabold transition-all duration-200 text-xs sm:text-sm flex items-center gap-2 bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 shadow-sm hover:shadow-md cursor-pointer ${
                isSubmitting || isAdvancing ? "opacity-80 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gray-950" />
                  <span>Selesai</span>
                </>
              ) : isSelesaiButton ? (
                <span>Selesai</span>
              ) : catsShowDistressPrompt ? (
                <>
                  <span>Lanjut ke Pertanyaan Gejala</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                </>
              ) : (
                <>
                  <span>Berikutnya</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
