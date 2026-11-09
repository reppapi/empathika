import { AdminProfileData } from "../types"

export const DEFAULT_ADMIN: AdminProfileData = {
  nama: "Administrator Empathika",
  email: "admin@empathika.com",
  noTelepon: "0878-7878-5498",
  bio: "Bertanggung jawab atas operasional biro, manajemen layanan, serta koordinasi psikolog dan jadwal klien di Empathika.",
  foto: null,
  alamat: "Jl. Cikutra No.312, Neglasari, Kec. Cibeunying Kaler, Kota Bandung, Jawa Barat 41024",
  linkMaps: "https://maps.app.goo.gl/4VJEM2aoFPAUSC4s7?g_st=iw",
}

export const DEFAULT_PSIKOLOG: AdminProfileData = {
  nama: "",
  email: "",
  noTelepon: "",
  bio: "",
  foto: null,
  kategoriProfesi: "psikolog",
  spesialisasi: "",
  noStr: "",
  noSipp: "",
  pendidikanText: "",
  quote: "",
  instagram: "",
  jenisKelamin: "",
  videoIntroUrl: "",
  videoThumbnail: "",
  videoDuration: "",
  keahlian: [],
  profilLengkap: [],
}
