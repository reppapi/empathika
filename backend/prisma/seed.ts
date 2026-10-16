import { PrismaClient, Role, KategoriLayanan, JenisAksesPsikotes } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Hash password agar akun staf bisa langsung login di frontend/backend
  const adminPassword = await bcrypt.hash('AdminPasswordHashed123!', 10);
  const biroPassword = await bcrypt.hash('BiroPasswordHashed123!', 10);
  const psikologPassword = await bcrypt.hash('PsikologPasswordHashed123!', 10);

  // 1. Create Accounts (Admin & Biro Owner)
  const adminAccount = await prisma.account.create({
    data: {
      nama: 'Admin Empathika',
      email: 'admin@empathika.test',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const biroOwnerAccount = await prisma.account.create({
    data: {
      nama: 'Admin Biro Cendekia Muda',
      email: 'biro@cendekiamuda.org',
      password: biroPassword,
      role: Role.BIRO,
      no_telepon: '081234567890',
    },
  });

  console.log(`Created admin account: ${adminAccount.nama}`);
  console.log(`Created biro owner account: ${biroOwnerAccount.nama}`);

  // 2. Create Biro
  const biro = await prisma.biro.create({
    data: {
      nama_biro: 'Biro Konseling Cendekia Muda',
      slug: 'cendekia-muda',
      id_account: biroOwnerAccount.id, // Penanggung Jawab Biro
      alamat: 'Jl. Kaliurang KM 5, Sleman, D.I. Yogyakarta',
      aktif: true,
    },
  });

  // Hubungkan biroOwnerAccount dengan id_biro yang baru dibuat
  await prisma.account.update({
    where: { id: biroOwnerAccount.id },
    data: { id_biro: biro.id },
  });

  console.log(`Created biro: ${biro.nama_biro}`);

  // 3. Create Sample Client (Tamu Pemesan Layanan)
  const sampleClient = await prisma.client.create({
    data: {
      nama: 'Karen Sya',
      no_telepon: '0812-0083-773',
      email: 'karennsya@gmail.com',
      deskripsi_trauma: 'Kecemasan akademik & regulasi stres skripsi',
      id_biro: biro.id,
    },
  });

  console.log(`Created sample client: ${sampleClient.nama}`);

  // 4. Create Spesialisasi
  const spesialisasiKlinis = await prisma.spesialisasi.create({
    data: {
      nama: 'Psikolog Klinis Dewasa',
    },
  });

  console.log(`Created spesialisasi: ${spesialisasiKlinis.nama}`);

  // 5. Create Akun Psikolog & Profil Klinis
  const psikologAccount = await prisma.account.create({
    data: {
      nama: 'Dr. Jane Doe, M.Psi., Psikolog',
      email: 'psikolog@empathika.test',
      password: psikologPassword,
      role: Role.PSIKOLOG,
      no_telepon: '081399887766',
    },
  });

  const psikolog = await prisma.psikolog.create({
    data: {
      id_account: psikologAccount.id, // Relasi 1-to-1 ke Account
      id_spesialisasi: spesialisasiKlinis.id,
      nama_gelar: 'Dr. Jane Doe, M.Psi., Psikolog',
      no_str: '123456789',
      bio: 'Berpengalaman dalam menangani kecemasan dan depresi.',
      tarif_per_jam: 150000.00,
    },
  });

  console.log(`Created psikolog: ${psikolog.nama_gelar}`);

  // 6. Create Layanan
  const layananKonsultasi = await prisma.layanan.create({
    data: {
      nama: 'Konsultasi Individu (Online)',
      kategori: KategoriLayanan.KONSULTASI_INDIVIDU,
      deskripsi: 'Sesi konsultasi 1 on 1 dengan psikolog klinis melalui video call.',
      harga_weekday: 150000.00,
      harga_weekend: 200000.00,
      aktif: true,
    },
  });

  console.log(`Created layanan: ${layananKonsultasi.nama}`);

  // 7. Create Paket Psikotes
  const paketPsikotes = await prisma.paketPsikotes.create({
    data: {
      judul: 'Tes Kepribadian Dasar',
      kategori: 'Kepribadian',
      jenis_akses: JenisAksesPsikotes.GRATIS,
      harga: 0,
      deskripsi: 'Tes untuk mengetahui tipe kepribadian dasar Anda.',
    },
  });

  console.log(`Created paket psikotes: ${paketPsikotes.judul}`);

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
