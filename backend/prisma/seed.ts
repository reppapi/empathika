import { PrismaClient, Role, KategoriLayanan, JenisAksesPsikotes } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create Users dengan Email & Password Nyata
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const psikologPasswordHash = await bcrypt.hash('Psikolog123!', 10);
  const biroPasswordHash = await bcrypt.hash('Biro123!', 10);

  // Admin Utama
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@empathika.test' },
    update: {
      password: adminPasswordHash,
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@empathika.test',
      nama: 'Admin Utama Empathika',
      password: adminPasswordHash,
      role: Role.ADMIN,
      no_telepon: '081299990001',
    },
  });

  // Admin Psikolog
  const psikologUser = await prisma.user.upsert({
    where: { email: 'psikolog@empathika.test' },
    update: {
      password: psikologPasswordHash,
      role: Role.PSIKOLOG,
    },
    create: {
      email: 'psikolog@empathika.test',
      nama: 'Psikolog Empathika',
      password: psikologPasswordHash,
      role: Role.PSIKOLOG,
      no_telepon: '081299990002',
    },
  });

  // Biro Owner (Role: BIRO)
  const biroOwner = await prisma.user.upsert({
    where: { email: 'biro@empathika.test' },
    update: {
      password: biroPasswordHash,
      role: Role.BIRO,
    },
    create: {
      email: 'biro@empathika.test',
      nama: 'Biro Psikologi Partner',
      password: biroPasswordHash,
      role: Role.BIRO,
      no_telepon: '081234567890',
    },
  });

  console.log(`Created/Updated admin user: ${adminUser.email}`);
  console.log(`Created/Updated psikolog user: ${psikologUser.email}`);
  console.log(`Created/Updated biro owner: ${biroOwner.email}`);

  // 2. Create or find Biro
  let biro = await prisma.biro.findUnique({
    where: { slug: 'biro-psikologi-sejahtera' },
  });

  if (!biro) {
    biro = await prisma.biro.create({
      data: {
        nama_biro: 'Biro Psikologi Sejahtera',
        slug: 'biro-psikologi-sejahtera',
        id_user: biroOwner.id,
        alamat: 'Jl. Kesejahteraan No. 1, Jakarta',
        aktif: true,
      },
    });
    console.log(`Created biro: ${biro.nama_biro}`);
  } else {
    console.log(`Biro already exists: ${biro.nama_biro}`);
  }

  // 3. Create Spesialisasi
  let spesialisasiKlinis = await prisma.spesialisasi.findFirst({
    where: { nama: 'Psikolog Klinis Dewasa' },
  });

  if (!spesialisasiKlinis) {
    spesialisasiKlinis = await prisma.spesialisasi.create({
      data: {
        nama: 'Psikolog Klinis Dewasa',
      },
    });
    console.log(`Created spesialisasi: ${spesialisasiKlinis.nama}`);
  }

  // 4. Create Psikolog
  let psikolog = await prisma.psikolog.findUnique({
    where: { email: 'janedoe@example.com' },
  });

  if (!psikolog) {
    psikolog = await prisma.psikolog.create({
      data: {
        nama_gelar: 'Dr. Jane Doe, M.Psi., Psikolog',
        email: 'janedoe@example.com',
        no_str: '123456789',
        bio: 'Berpengalaman dalam menangani kecemasan dan depresi.',
        tarif_per_jam: 150000.0,
        id_spesialisasi: spesialisasiKlinis.id,
      },
    });
    console.log(`Created psikolog: ${psikolog.nama_gelar}`);
  }

  // 5. Create Layanan
  let layananKonsultasi = await prisma.layanan.findFirst({
    where: { nama: 'Konsultasi Individu (Online)' },
  });

  if (!layananKonsultasi) {
    layananKonsultasi = await prisma.layanan.create({
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
  }

  // 6. Create Paket Psikotes
  let paketPsikotes = await prisma.paketPsikotes.findFirst({
    where: { judul: 'Tes Kepribadian Dasar' },
  });

  if (!paketPsikotes) {
    paketPsikotes = await prisma.paketPsikotes.create({
      data: {
        judul: 'Tes Kepribadian Dasar',
        kategori: 'Kepribadian',
        jenis_akses: JenisAksesPsikotes.GRATIS,
        harga: 0,
        deskripsi: 'Tes untuk mengetahui tipe kepribadian dasar Anda.',
      },
    });
    console.log(`Created paket psikotes: ${paketPsikotes.judul}`);
  }

  // 7. Create Artikel Blog
  const artikel1 = await prisma.artikelBlog.upsert({
    where: { slug: 'mengenal-inner-child' },
    update: {},
    create: {
      judul: 'Mengenal Inner Child: Mengapa Luka Masa Lalu Mempengaruhi Masa Kini?',
      slug: 'mengenal-inner-child',
      isi: 'Pernahkah Anda bertanya-tanya mengapa Anda bereaksi sangat emosional terhadap hal-hal tertentu yang bagi orang lain mungkin tampak biasa saja? Dalam ilmu psikologi, fenomena ini sering dikaitkan dengan konsep "Inner Child" atau anak batin.',
      waktu_baca_menit: 4,
      jumlah_dilihat: 1240,
    },
  });

  const artikel2 = await prisma.artikelBlog.upsert({
    where: { slug: 'burnout-vs-stres' },
    update: {},
    create: {
      judul: 'Burnout vs Stres Biasa: Kenali Perbedaannya Sebelum Terlambat',
      slug: 'burnout-vs-stres',
      isi: 'Di era produktivitas yang bergerak serba cepat, kata "burnout" sering kali dilontarkan saat seseorang merasa lelah bekerja. Namun, tahukah Anda bahwa stres biasa dan burnout adalah dua kondisi psikologis yang berbeda?',
      waktu_baca_menit: 5,
      jumlah_dilihat: 890,
    },
  });

  console.log(`Created artikel: ${artikel1.judul}, ${artikel2.judul}`);

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
