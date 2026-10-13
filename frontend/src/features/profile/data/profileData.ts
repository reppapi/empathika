import { AdminProfileData } from "../types"

export const DEFAULT_ADMIN: AdminProfileData = {
  nama: "Administrator Empathika",
  email: "admin@empathika.com",
  noTelepon: "081234567890",
  bio: "Bertanggung jawab atas operasional biro, manajemen layanan, serta koordinasi psikolog dan jadwal klien di Empathika.",
  foto: null,
}

export const DEFAULT_PSIKOLOG: AdminProfileData = {
  nama: "Rizki Putri Dzulqaidah, S.Psi.",
  email: "putriqoida@empathika.com",
  noTelepon: "082198765432",
  bio: "Konselor yang memiliki ketertarikan pada bidang kesehatan mental dan pendampingan individu. Saya meyakini bahwa didengarkan dan dipahami merupakan bagian penting dari proses pemulihan dan pertumbuhan diri.",
  foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
  kategoriProfesi: "konselor",
  spesialisasi: "Konselor Kesehatan Mental",
  noStr: "STR-8921-2023",
  noSipp: "SIPP-1049-2024",
  pendidikanText: "Sarjana Psikologi (S.Psi.) - UIN Sunan Gunung Djati Bandung",
  quote: "Setiap manusia adalah cerita yang sedang bertumbuh, layak didengar, dihargai, dan ditemani.",
  instagram: "@putriqoida",
  jenisKelamin: "Perempuan",
  videoIntroUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  videoThumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
  videoDuration: "01:30",
  keahlian: [
    "Hubungan",
    "Romantis",
    "Keluarga",
    "Self-Confidence",
    "Pengembangan Diri",
    "Quarter Life Crisis",
  ],
  profilLengkap: [
    "Konselor yang memiliki ketertarikan pada bidang kesehatan mental dan pendampingan individu. Saya meyakini bahwa didengarkan dan dipahami merupakan bagian penting dari proses pemulihan dan pertumbuhan diri.",
    "Saya hadir untuk menemani setiap individu dalam perjalanan mengenali diri dan menemukan kekuatan dalam dirinya.",
  ],
}
