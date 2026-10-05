import { PrismaClient, Role, KategoriLayanan, JenisAksesPsikotes } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      nama: 'Admin Empathika',
      role: Role.ADMIN,
    },
  });

  const biroOwner = await prisma.user.create({
    data: {
      nama: 'Biro Owner',
      role: Role.USER,
      no_telepon: '081234567890',
    },
  });

  console.log(`Created admin user: ${adminUser.nama}`);
  console.log(`Created biro owner: ${biroOwner.nama}`);

  // 2. Create Biro
  const biro = await prisma.biro.create({
    data: {
      nama_biro: 'Biro Psikologi Sejahtera',
      slug: 'biro-psikologi-sejahtera',
      id_user: biroOwner.id, // Set as Owner
      alamat: 'Jl. Kesejahteraan No. 1, Jakarta',
      aktif: true,
    },
  });

  console.log(`Created biro: ${biro.nama_biro}`);

  // 3. Create Spesialisasi
  const spesialisasiKlinis = await prisma.spesialisasi.create({
    data: {
      nama: 'Psikolog Klinis Dewasa',
    },
  });

  console.log(`Created spesialisasi: ${spesialisasiKlinis.nama}`);

  // 4. Create Psikolog
  const psikolog = await prisma.psikolog.create({
    data: {
      nama_gelar: 'Dr. Jane Doe, M.Psi., Psikolog',
      email: 'janedoe@example.com',
      no_str: '123456789',
      bio: 'Berpengalaman dalam menangani kecemasan dan depresi.',
      tarif_per_jam: 150000.00,
      id_spesialisasi: spesialisasiKlinis.id,
    },
  });

  console.log(`Created psikolog: ${psikolog.nama_gelar}`);

  // 5. Create Layanan
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

  // 6. Create Paket Psikotes
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
