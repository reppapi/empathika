export interface WorkshopGalleryImage {
  src: string
  alt: string
}

export interface WorkshopContentData {
  slug: string
  title: string
  subtitle?: string
  intro: string
  benefits?: string[]
  additionalInfo?: string
  closing: string
  heroImage: string
  heroImageAlt: string
  gallery: WorkshopGalleryImage[]
}

export const WORKSHOP_DETAILS_DATA: Record<string, WorkshopContentData> = {
  seft: {
    slug: "seft",
    title: "Workshop SEFT",
    subtitle: "Spiritual Emotional Freedom Technique",
    intro:
      "Workshop SEFT (Spiritual Emotional Freedom Technique) adalah program pengembangan diri dan terapi emosi yang membantu peserta mengelola emosi, meredakan stres, serta melepaskan beban batin secara mendalam melalui teknik yang mengintegrasikan psikologi energi, relaksasi emosi, dan pendekatan spiritualitas yang menenangkan.",
    benefits: [
      "Membantu meredakan stres, kecemasan berlebih, dan ketegangan emosional",
      "Meningkatkan ketenangan batin, kejernihan pikiran, dan kesadaran diri (self-awareness)",
      "Membekali peserta keterampilan praktis self-healing mandiri yang dapat diterapkan kapan saja dalam kehidupan sehari-hari",
    ],
    additionalInfo:
      "Workshop ini dirancang secara praktis, aplikatif, dan interaktif. Peserta tidak hanya memahami konsep teoretis dan mengalami proses pelepasan emosi secara langsung, tetapi juga dilatih langkah demi langkah teknik SEFT agar dapat mempraktikkannya secara mandiri di rumah maupun lingkungan kerja. Seluruh sesi dipandu langsung oleh fasilitator berpengalaman dengan pendekatan yang empatik, aman, privat, serta menjunjung tinggi kode etik profesional.",
    closing:
      "Program Workshop SEFT terbuka bagi individu, komunitas, institusi pendidikan, maupun perusahaan yang ingin menciptakan lingkungan yang sehat secara emosional dan mental.",
    // TODO: Ganti placeholder hero image dengan foto banner asli Workshop SEFT
    heroImage:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    heroImageAlt: "Hero Dokumentasi Workshop SEFT Empathika",
    // TODO: Ganti 3 placeholder foto berikut dengan dokumentasi kegiatan Workshop SEFT
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Dokumentasi sesi relaksasi dan teknik SEFT",
      },
      {
        src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Dokumentasi interaksi fasilitator dengan peserta workshop SEFT",
      },
      {
        src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Dokumentasi sesi reflektif peserta workshop SEFT",
      },
    ],
  },
  "peer-helper": {
    slug: "peer-helper",
    title: "Pelatihan & Workshop Konselor Sebaya",
    subtitle: "Peer Helper Training Program",
    intro:
      "Program pelatihan pembekalan komprehensif bagi siswa, mahasiswa, pendidik, dan komunitas untuk mengasah kepekaan sosial, keterampilan komunikasi suportif, serta kemampuan menjadi pendengar aktif dan konselor sebaya (peer helper) yang empatik tanpa menghakimi.",
    benefits: [
      "Mengembangkan keterampilan active listening dan komunikasi empatik yang efektif",
      "Mampu mendeteksi tanda-tanda awal stres psikologis atau krisis emosional pada teman sebaya",
      "Memahami batasan peran konselor sebaya serta prosedur rujukan (referral) ke tenaga profesional",
      "Membangun lingkungan komunitas, kampus, atau sekolah yang suportif dan peduli kesehatan mental",
    ],
    additionalInfo:
      "Pelatihan ini mengombinasikan pemahaman teori dasar konseling, studi kasus riil, role-play komunikasi, dan simulasi pendampingan teman sebaya. Peserta dibimbing langsung oleh psikolog profesional agar memiliki kesiapan mental, empati yang terarah, dan rasa tanggung jawab dalam mendampingi rekan di lingkungannya.",
    closing:
      "Program dapat disesuaikan dengan kebutuhan sekolah, universitas, organisasi kepemudaan, maupun komunitas yang ingin mencetak konselor sebaya tangguh dan beretika.",
    // TODO: Ganti placeholder hero image dengan foto banner asli Workshop Peer Helper
    heroImage:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    heroImageAlt: "Hero Dokumentasi Pelatihan Konselor Sebaya Empathika",
    // TODO: Ganti 3 placeholder foto berikut dengan dokumentasi kegiatan Workshop Peer Helper
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Dokumentasi diskusi interaktif pelatihan konselor sebaya",
      },
      {
        src: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Dokumentasi role-play active listening konselor sebaya",
      },
      {
        src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        alt: "Dokumentasi kolaborasi kelompok peserta pelatihan",
      },
    ],
  },
}

