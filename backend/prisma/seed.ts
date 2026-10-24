import { PrismaClient, Role, KategoriLayanan, JenisAksesPsikotes, TipeTransaksi, MetodePembayaran, StatusPembayaran } from '@prisma/client';
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
      aktif: true,
    },
    create: {
      nama: 'Admin Empathika',
      email: 'admin@empathika.test',
      password: hashedAdminPassword,
      role: Role.ADMIN,
      aktif: true,
    },
  });

  const biroOwnerAccount = await prisma.account.upsert({
    where: { email: 'biro@cendekiamuda.org' },
    update: {
      password: hashedBiroPassword,
      aktif: true,
    },
    create: {
      nama: 'Admin Biro Cendekia Muda',
      email: 'biro@cendekiamuda.org',
      password: hashedBiroPassword,
      role: Role.BIRO,
      no_telepon: '081234567890',
      aktif: true,
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
      id_account: biroOwnerAccount.id,
      alamat: 'Jl. Kaliurang KM 5, Sleman, D.I. Yogyakarta',
      status: 'ACTIVE',
    },
  });

  await prisma.account.update({
    where: { id: biroOwnerAccount.id },
    data: { id_biro: biro.id },
  });

  console.log(`Created/found biro: ${biro.nama_biro}`);

  // 3. Create Sample Client
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

  // 4. Create Spesialisasi Helper
  const spesialisasiMap = new Map<string, string>();
  const spesialisasiList = [
    'Psikolog Klinis Dewasa',
    'Psikolog Keluarga & Pasangan',
    'Psikolog Perkembangan',
    'Psikolog Klinis',
    'Peer Konselor Mahasiswa',
    'Psikolog Anak & Remaja',
    'Konselor Kesehatan Mental',
    'Konselor Karier & Kehidupan',
    'Psikolog Klinis Umum',
  ];

  for (const namaSpec of spesialisasiList) {
    let spec = await prisma.spesialisasi.findFirst({ where: { nama: namaSpec } });
    if (!spec) {
      spec = await prisma.spesialisasi.create({ data: { nama: namaSpec } });
    }
    spesialisasiMap.set(namaSpec, spec.id);
  }

  // 5. Daftar Psikolog & Konselor Komprehensif
  const dataTenagaAhli = [
    {
      email: 'psikolog@empathika.test',
      nama: 'Dr. Jane Doe, M.Psi., Psikolog',
      kategori: 'Psikolog',
      spesialisasi: 'Psikolog Klinis Dewasa',
      tarif: 150000,
      no_str: '123456789',
      no_sipp: 'SIPP-1234-JKT',
      bio: 'Berpengalaman dalam menangani kecemasan, depresi, dan dinamika kesehatan mental dewasa.',
      quote: 'Menerima kerentanan diri adalah langkah awal dari pemulihan sejati.',
      instagram: '@drjanedoe.psi',
      foto: 'https://images.unsplash.com/photo-1594824813589-3221bf3a5bb4?auto=format&fit=crop&q=80&w=400',
      pendidikan: 'Universitas Indonesia',
      keahlian: 'Kecemasan, Depresi, Regulasi Emosi, CBT',
      jumlah_sesi: 0,
      jenis_kelamin: 'Perempuan',
      pengalaman_tahun: '6 - 10 Tahun',
    },
    {
      email: 'putriqoida@empathika.com',
      nama: 'Rizki Putri Dzulqaidah, S.Psi.',
      kategori: 'Konselor',
      spesialisasi: 'Konselor Kesehatan Mental',
      tarif: 120000,
      no_str: null,
      no_sipp: null,
      bio: 'Konselor yang memiliki ketertarikan pada bidang kesehatan mental dan pendampingan individu. Saya meyakini bahwa didengarkan dan dipahami merupakan bagian penting dari proses pemulihan dan pertumbuhan diri.',
      quote: 'Setiap manusia adalah cerita yang sedang bertumbuh, layak didengar, dihargai, dan ditemani.',
      instagram: '@putriqoida',
      foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      pendidikan: 'UIN Sunan Gunung Djati Bandung',
      keahlian: 'Hubungan, Romantis, Keluarga, Self-Confidence, Pengembangan Diri, Quarter Life Crisis',
      jumlah_sesi: 0,
      jenis_kelamin: 'Perempuan',
      pengalaman_tahun: '2 - 4 Tahun',
    },
    {
      email: 'galuh@empathika.com',
      nama: 'Galuh Kikiany S., M.Psi., Psikolog',
      kategori: 'Psikolog',
      spesialisasi: 'Psikolog Keluarga & Pasangan',
      tarif: 200000,
      no_str: '0987654321',
      no_sipp: 'SIPP-5678-YOG',
      bio: 'Fokus pada konseling hubungan romantis, bimbingan pranikah, dan dinamika keharmonisan keluarga.',
      quote: 'Komunikasi yang sehat dan rasa saling menghargai adalah pondasi utama dari setiap hubungan yang kokoh.',
      instagram: '@galuhkikiany',
      foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
      pendidikan: 'Universitas Gadjah Mada',
      keahlian: 'Konseling Pra-Nikah, Mediasi Konflik, Relasi Pasangan, Pengasuhan Keluarga',
      jumlah_sesi: 0,
      jenis_kelamin: 'Perempuan',
      pengalaman_tahun: '5 - 10 Tahun',
    },
    {
      email: 'dimas@empathika.com',
      nama: 'Dimas Ardiansyah, M.Psi., Psikolog',
      kategori: 'Psikolog',
      spesialisasi: 'Psikolog Perkembangan',
      tarif: 175000,
      no_str: '1122334455',
      no_sipp: 'SIPP-9911-JKT',
      bio: 'Membantu remaja dan dewasa muda dalam menghadapi krisis identitas, burnout, dan arah tujuan hidup.',
      quote: 'Menemukan arah hidup dimulai dari keberanian untuk jujur pada diri sendiri tentang apa yang kita rasakan.',
      instagram: '@dimas.ardian',
      foto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
      pendidikan: 'Universitas Indonesia',
      keahlian: 'Quarter Life Crisis, Arah Karier, Burnout & Stres, Pencarian Jati Diri',
      jumlah_sesi: 0,
      jenis_kelamin: 'Laki-laki',
      pengalaman_tahun: '4 - 7 Tahun',
    },
    {
      email: 'nadia@empathika.com',
      nama: 'Nadia Safira, M.Psi., Psikolog',
      kategori: 'Psikolog',
      spesialisasi: 'Psikolog Klinis',
      tarif: 180000,
      no_str: '5566778899',
      no_sipp: 'SIPP-3344-BDG',
      bio: 'Pendekatan Cognitive Behavioral Therapy (CBT) untuk mengatasi depresi, trauma, dan regulasi emosi.',
      quote: 'Pemulihan bukan tentang tidak pernah merasa terluka, melainkan belajar memeluk diri di setiap prosesnya.',
      instagram: '@nadiasafira.psi',
      foto: 'https://images.unsplash.com/photo-1594824813589-3221bf3a5bb4?auto=format&fit=crop&q=80&w=400',
      pendidikan: 'Universitas Padjadjaran',
      keahlian: 'Depresi & Kecemasan, Trauma Healing, Regulasi Emosi, Terapi Kognitif (CBT)',
      jumlah_sesi: 0,
      jenis_kelamin: 'Perempuan',
      pengalaman_tahun: '6 - 8 Tahun',
    },
    {
      email: 'farhan@empathika.com',
      nama: 'Farhan Maulana, S.Psi., C.Ht.',
      kategori: 'Peer Konselor',
      spesialisasi: 'Peer Konselor Mahasiswa',
      tarif: 100000,
      no_str: null,
      no_sipp: null,
      bio: 'Konselor sebaya untuk manajemen stres perkuliahan, relasi pertemanan, dan pengembangan diri.',
      quote: 'Stres adalah bagian dari perjalanan belajar, yang terpenting adalah kita tahu kapan harus beristirahat.',
      instagram: '@farhan.maulana',
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      pendidikan: 'Universitas Sebelas Maret',
      keahlian: 'Stres Akademik & Kuliah, Manajemen Waktu, Pengembangan Diri, Konflik Pertemanan',
      jumlah_sesi: 0,
      jenis_kelamin: 'Laki-laki',
      pengalaman_tahun: '2 - 4 Tahun',
    },
    {
      email: 'anindya@empathika.com',
      nama: 'Anindya Putri, M.Psi., Psikolog',
      kategori: 'Psikolog',
      spesialisasi: 'Psikolog Anak & Remaja',
      tarif: 190000,
      no_str: '9988776655',
      no_sipp: 'SIPP-7788-SBY',
      bio: 'Spesialis pengasuhan anak (parenting), tumbuh kembang anak, dan komunikasi keluarga.',
      quote: 'Anak yang merasa didengar dan dicintai akan tumbuh menjadi pribadi yang percaya diri dan berdaya.',
      instagram: '@anindyaputri.psi',
      foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      pendidikan: 'Universitas Airlangga',
      keahlian: 'Pola Asuh (Parenting), Tumbuh Kembang Anak, Emosi & Tantrum Anak, Komunikasi Keluarga',
      jumlah_sesi: 0,
      jenis_kelamin: 'Perempuan',
      pengalaman_tahun: '5 - 9 Tahun',
    },
    {
      email: 'rian@empathika.com',
      nama: 'Rian Hidayat, M.Psi., Psikolog',
      kategori: 'Psikolog',
      spesialisasi: 'Psikolog Klinis Dewasa',
      tarif: 160000,
      no_str: '3344556677',
      no_sipp: 'SIPP-1122-YOG',
      bio: 'Fokus pada gangguan suasana hati (mood disorder), kecemasan sosial, dan trauma healing.',
      quote: 'Menerima kerentanan diri bukanlah kelemahan, melainkan awal dari kekuatan sejati.',
      instagram: '@rianhidayat.psi',
      foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      pendidikan: 'Universitas Gadjah Mada',
      keahlian: 'Kecemasan Sosial, Mood & Suasana Hati, Mindfulness, Trauma Healing',
      jumlah_sesi: 0,
      jenis_kelamin: 'Laki-laki',
      pengalaman_tahun: '4 - 6 Tahun',
    },
    {
      email: 'citra@empathika.com',
      nama: 'Citra Kirana, S.Psi., CPC',
      kategori: 'Konselor',
      spesialisasi: 'Konselor Karier & Kehidupan',
      tarif: 120000,
      no_str: null,
      no_sipp: null,
      bio: 'Life coach & Konselor karier, membantu menentukan arah karier dan work-life balance.',
      quote: 'Karier yang bermakna adalah karier yang sejalan dengan nilai dan tujuan hidupmu.',
      instagram: '@citrakirana.coach',
      foto: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400',
      pendidikan: 'Universitas Padjadjaran',
      keahlian: 'Perencanaan Karier, Imposter Syndrome, Work-Life Balance, Self-Confidence',
      jumlah_sesi: 0,
      jenis_kelamin: 'Perempuan',
      pengalaman_tahun: '3 - 5 Tahun',
    },
    {
      email: 'wahyu@empathika.com',
      nama: 'Wahyu Pratama, M.Psi., Psikolog',
      kategori: 'Psikolog',
      spesialisasi: 'Psikolog Klinis Umum',
      tarif: 175000,
      no_str: '7788990011',
      no_sipp: 'SIPP-4455-JKT',
      bio: 'Konseling individual, resolusi konflik interpersonal, dan manajemen amarah (anger management).',
      quote: 'Mengendalikan amarah adalah seni memahami pesan yang ingin disampaikan oleh emosi kita.',
      instagram: '@wahyupratama.psi',
      foto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
      pendidikan: 'Universitas Indonesia',
      keahlian: 'Manajemen Amarah, Resolusi Konflik, Komunikasi Asertif, Konseling Dewasa',
      jumlah_sesi: 0,
      jenis_kelamin: 'Laki-laki',
      pengalaman_tahun: '5 - 8 Tahun',
    },
  ];

  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0));
  const tomorrowUtc = new Date(todayUtc);
  tomorrowUtc.setUTCDate(todayUtc.getUTCDate() + 1);

  const createdPsikologs = [];

  for (const item of dataTenagaAhli) {
    const acc = await prisma.account.upsert({
      where: { email: item.email },
      update: {
        nama: item.nama,
        foto: item.foto,
        bio: item.bio,
        password: hashedPsikologPassword,
        aktif: true,
      },
      create: {
        nama: item.nama,
        email: item.email,
        password: hashedPsikologPassword,
        role: Role.PSIKOLOG,
        no_telepon: '081234567890',
        foto: item.foto,
        bio: item.bio,
        aktif: true,
      },
    });

    const specId = spesialisasiMap.get(item.spesialisasi) || spesialisasiMap.get('Psikolog Klinis Dewasa')!;

    const psi = await prisma.psikolog.upsert({
      where: { id_account: acc.id },
      update: {
        nama_gelar: item.nama,
        kategori: item.kategori,
        id_spesialisasi: specId,
        tarif_per_jam: item.tarif,
        bio: item.bio,
        quote: item.quote,
        instagram: item.instagram,
        foto: item.foto,
        pendidikan: item.pendidikan,
        keahlian: item.keahlian,
        jumlah_sesi: 0,
        jenis_kelamin: item.jenis_kelamin,
        pengalaman_tahun: item.pengalaman_tahun,
        no_str: item.no_str,
        no_sipp: item.no_sipp,
      },
      create: {
        id_account: acc.id,
        id_spesialisasi: specId,
        kategori: item.kategori,
        nama_gelar: item.nama,
        tarif_per_jam: item.tarif,
        bio: item.bio,
        quote: item.quote,
        instagram: item.instagram,
        foto: item.foto,
        pendidikan: item.pendidikan,
        keahlian: item.keahlian,
        jumlah_sesi: 0,
        jenis_kelamin: item.jenis_kelamin,
        pengalaman_tahun: item.pengalaman_tahun,
        no_str: item.no_str,
        no_sipp: item.no_sipp,
      },
    });

    createdPsikologs.push(psi);

    // Jadwal slot tidak dibuat otomatis secara default.
    // Menunggu jadwal dibuka mandiri oleh admin atau psikolog yang bersangkutan.
  }

  console.log(`Created/updated ${createdPsikologs.length} psikolog & konselor.`);

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
        harga_weekday: 150000.0,
        harga_weekend: 200000.0,
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

  // 8. Create Sample Booking for the first psychologist
  const firstPsi = createdPsikologs[0];
  const bookedSlot = await prisma.jadwalSlot.upsert({
    where: { id: 'slot-sample-booked-001' },
    update: { tanggal: todayUtc },
    create: {
      id: 'slot-sample-booked-001',
      id_psikolog: firstPsi.id,
      tipe_jadwal: 'KONSULTASI',
      tanggal: todayUtc,
      jam_mulai: new Date(Date.UTC(1970, 0, 1, 19, 0, 0)),
      jam_selesai: new Date(Date.UTC(1970, 0, 1, 20, 0, 0)),
      status: 'SUDAH_DIBOOKING',
    },
  });

  // 9. Create Sample Transaksi linked to the Booking
  const sampleTransaksi = await prisma.transaksi.upsert({
    where: { kode_transaksi: 'TRX-SEED-20261024-001' },
    update: {},
    create: {
      kode_transaksi: 'TRX-SEED-20261024-001',
      id_client: sampleClient.id,
      tipe_transaksi: TipeTransaksi.KONSULTASI,
      subtotal: 150000.0,
      biaya_admin: 0.0,
      total: 150000.0,
      metode_pembayaran: MetodePembayaran.QRIS,
      channel_pembayaran: 'QRIS',
      status_pembayaran: StatusPembayaran.PAID,
      tanggal_bayar: new Date(),
    },
  });

  await prisma.bookingKonsultasi.upsert({
    where: { kode_pesanan: 'EMP-KONS-SEED-01' },
    update: {
      id_transaksi: sampleTransaksi.id,
    },
    create: {
      kode_pesanan: 'EMP-KONS-SEED-01',
      id_client: sampleClient.id,
      id_layanan: layananKonsultasi.id,
      id_jadwal: bookedSlot.id,
      id_transaksi: sampleTransaksi.id,
      metode: 'ONLINE',
      deskripsi_trauma: 'Merasa cemas berlebih saat menghadapi situasi sosial.',
      status: 'CONFIRMED',
    },
  });

  // 10. Create/Upsert Sample Invoice
  await prisma.invoice.upsert({
    where: { id_transaksi: sampleTransaksi.id },
    update: {
      harga: sampleTransaksi.total,
      nama_client: sampleClient.nama,
      no_wa_client: sampleClient.no_telepon,
      judul_layanan: layananKonsultasi.nama,
      metode_bayar: sampleTransaksi.metode_pembayaran,
    },
    create: {
      nomor: 'INV-20261024-0001',
      id_transaksi: sampleTransaksi.id,
      nama_client: sampleClient.nama,
      no_wa_client: sampleClient.no_telepon,
      nama_psikolog: firstPsi.nama_gelar,
      judul_layanan: layananKonsultasi.nama,
      tanggal_sesi: new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), todayUtc.getUTCDate(), 19, 0, 0)),
      jenis_sesi: 'ONLINE',
      harga: sampleTransaksi.total,
      metode_bayar: sampleTransaksi.metode_pembayaran,
      tanggal_bayar: new Date(),
    },
  });

  console.log(`Created/linked sample transaksi: ${sampleTransaksi.kode_transaksi}`);

  await prisma.psikolog.update({
    where: { id: firstPsi.id },
    data: { jumlah_sesi: 1 },
  });

  console.log('Seeding finished successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    throw e;
  });