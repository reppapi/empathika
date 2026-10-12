export interface KerjaSamaItem {
  id: string
  slug: string
  title: string
  shortName: string
  description: string
  pelatihanTitle: string
  pelatihanDeskripsi: string
  pelatihanImage: string
  mitraTitle: string
  mitraDeskripsi: string
  mitraImage: string
  color: string
  status: "AKTIF" | "NONAKTIF"
  urutan: number
}

export interface KerjaSamaPageConfig {
  heroTitle: string
  heroHighlight: string
  heroDescription1: string
  heroBannerImage: string
  heroDescription2: string
  footerCallout: string
  kontak: {
    email: string
    whatsapp: string
    formInHouseTraining: string
    formAsesmen: string
    formAffiliate: string
    formLainnya: string
  }
}

export interface PengajuanKerjaSama {
  id: string
  tanggal: string
  namaInstansi: string
  kategori: string
  namaPIC: string
  email: string
  telepon: string
  pesan: string
  status: "Menunggu" | "Dihubungi" | "Disetujui" | "Ditolak"
  tipeFormulir?: "asesmen" | "in-house-training" | "affiliate" | "lainnya"
  formTitle?: string
  jawabanDetail?: Record<string, string | string[]>
}

export interface FormulirPertanyaan {
  id: string
  label: string
  key: string
  type: "radio" | "text" | "textarea"
  options?: string[]
  placeholder?: string
  required?: boolean
}

export interface FormulirConfigItem {
  id: string
  slug: string
  categorySlug?: string
  title: string
  categoryDefault: string
  description: string
  pertanyaanKhusus: FormulirPertanyaan[]
}

