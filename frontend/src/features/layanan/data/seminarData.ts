export interface SeminarGalleryImage {
  src: string
  alt: string
}

export interface SeminarContentData {
  title: string
  intro: string
  programs: Array<{
    name: string
    description: string
  }>
  closing: string
  heroImage: string
  heroImageAlt: string
  gallery: SeminarGalleryImage[]
}

export const SEMINAR_DETAIL_DATA: SeminarContentData = {
  title: "Seminar Empathika",
  intro:
    "Empathika menyelenggarakan program seminar sebagai ruang edukatif dan reflektif untuk meningkatkan pemahaman psikologis serta kesadaran diri dalam menghadapi berbagai dinamika kehidupan, baik personal, keluarga, maupun profesional.",
  programs: [
    {
      name: "Seminar",
      description:
        "Berfokus pada psikoedukasi dengan materi yang aplikatif, relevan, dan mudah dipahami.",
    },
    {
      name: "Seminar & Healing",
      description:
        "Memadukan psikoedukasi dengan sesi reflektif dan healing (SEFT) agar peserta dapat mengenali, meresapi, dan melepaskan beban emosional secara lebih mendalam.",
    },
  ],
  closing:
    "Program dirancang secara interaktif dan dapat disesuaikan dengan kebutuhan institusi, komunitas, maupun masyarakat umum, dengan tetap menjunjung nilai empati, profesionalisme, dan kebermanfaatan.",
  // TODO: Ganti placeholder hero image dengan foto banner asli seminar
  heroImage:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  heroImageAlt: "Hero Dokumentasi Seminar Empathika",
  // TODO: Ganti 3 placeholder foto di bawah hero ini dengan 3 foto asli kegiatan seminar
  gallery: [
    {
      src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Dokumentasi kegiatan seminar sesi edukasi",
    },
    {
      src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Dokumentasi interaksi peserta dan pemateri seminar",
    },
    {
      src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Dokumentasi sesi reflektif dan healing peserta seminar",
    },
  ],
}
