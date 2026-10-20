import { PrismaClient, Role, KategoriLayanan, JenisAksesPsikotes } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Hash passwords menggunakan Bcrypt asli (10 salt rounds)
  const hashedAdminPassword = await bcrypt.hash('Admin123!', 10);
  const hashedBiroPassword = await bcrypt.hash('Biro123!', 10);
  const hashedPsikologPassword = await bcrypt.hash('Psikolog123!', 10);

  // 1. Create Accounts (Admin & Biro Owner)
  const adminAccount = await prisma.account.upsert({
    where: { email: 'admin@empathika.test' },
    update: {
      password: hashedAdminPassword,
    },
    create: {
      nama: 'Admin Empathika',
      email: 'admin@empathika.test',
      password: hashedAdminPassword,
      role: Role.ADMIN,
    },
  });

  const biroOwnerAccount = await prisma.account.upsert({
    where: { email: 'biro@cendekiamuda.org' },
    update: {
      password: hashedBiroPassword,
    },
    create: {
      nama: 'Admin Biro Cendekia Muda',
      email: 'biro@cendekiamuda.org',
      password: hashedBiroPassword,
      role: Role.BIRO,
      no_telepon: '081234567890',
    },
  });

  console.log(`Created/found admin account: ${adminAccount.nama}`);
  console.log(`Created/found biro owner account: ${biroOwnerAccount.nama}`);

  // 2. Create Biro
  const biro = await prisma.biro.upsert({
    where: { slug: 'cendekia-muda' },
    update: {},
    create: {
      nama_biro: 'Biro Konseling Cendekia Muda',
      slug: 'cendekia-muda',
      id_account: biroOwnerAccount.id, // Penanggung Jawab Biro
      alamat: 'Jl. Kaliurang KM 5, Sleman, D.I. Yogyakarta',
      status: 'ACTIVE',
    },
  });

  // Hubungkan biroOwnerAccount dengan id_biro yang baru dibuat
  await prisma.account.update({
    where: { id: biroOwnerAccount.id },
    data: { id_biro: biro.id },
  });

  console.log(`Created/found biro: ${biro.nama_biro}`);

  // 3. Create Sample Client (Tamu Pemesan Layanan)
  let sampleClient = await prisma.client.findFirst({
    where: { no_telepon: '0812-0083-773' },
  });

  if (!sampleClient) {
    sampleClient = await prisma.client.create({
      data: {
        nama: 'Karen Sya',
        no_telepon: '0812-0083-773',
        usia: 22,
        jenis_kelamin: 'Perempuan',
        id_biro: biro.id,
      },
    });
  }

  console.log(`Created/found sample client: ${sampleClient.nama}`);

  // 4. Create Spesialisasi
  let spesialisasiKlinis = await prisma.spesialisasi.findFirst({
    where: { nama: 'Psikolog Klinis Dewasa' },
  });

  if (!spesialisasiKlinis) {
    spesialisasiKlinis = await prisma.spesialisasi.create({
      data: {
        nama: 'Psikolog Klinis Dewasa',
      },
    });
  }

  console.log(`Created/found spesialisasi: ${spesialisasiKlinis.nama}`);

  // 5. Create Akun Psikolog & Profil Klinis
  const psikologAccount = await prisma.account.upsert({
    where: { email: 'psikolog@empathika.test' },
    update: {
      password: hashedPsikologPassword,
    },
    create: {
      nama: 'Dr. Jane Doe, M.Psi., Psikolog',
      email: 'psikolog@empathika.test',
      password: hashedPsikologPassword,
      role: Role.PSIKOLOG,
      no_telepon: '081399887766',
    },
  });

  const psikolog = await prisma.psikolog.upsert({
    where: { id_account: psikologAccount.id },
    update: {},
    create: {
      id_account: psikologAccount.id, // Relasi 1-to-1 ke Account
      id_spesialisasi: spesialisasiKlinis.id,
      kategori: 'Psikolog Klinis Dewasa',
      nama_gelar: 'Dr. Jane Doe, M.Psi., Psikolog',
      no_str: '123456789',
      bio: 'Berpengalaman dalam menangani kecemasan dan depresi.',
      tarif_per_jam: 150000.00,
    },
  });

  console.log(`Created/found psikolog: ${psikolog.nama_gelar}`);

  // 6. Create Layanan
  let layananKonsultasi = await prisma.layanan.findFirst({
    where: { nama: 'Konsultasi Individu (Online)' },
  });

  if (!layananKonsultasi) {
    layananKonsultasi = await prisma.layanan.create({
      data: {
        nama: 'Konsultasi Individu (Online)',
        kategori: KategoriLayanan.KONSULTASI,
        deskripsi: 'Sesi konsultasi 1 on 1 dengan psikolog klinis melalui video call.',
        harga_weekday: 150000.00,
        harga_weekend: 200000.00,
        aktif: true,
      },
    });
  }

  console.log(`Created/found layanan: ${layananKonsultasi.nama}`);

  // 7. Create Paket Psikotes
  let paketPsikotes = await prisma.paketPsikotes.findFirst({
    where: { judul: 'Tes Kepribadian Dasar' },
  });

  if (!paketPsikotes) {
    paketPsikotes = await prisma.paketPsikotes.create({
      data: {
        judul: 'Tes Kepribadian Dasar',
        jenis_akses: JenisAksesPsikotes.GRATIS,
        harga: 0,
        deskripsi: 'Tes untuk mengetahui tipe kepribadian dasar Anda.',
      },
    });
  }

  console.log(`Created/found paket psikotes: ${paketPsikotes.judul}`);

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