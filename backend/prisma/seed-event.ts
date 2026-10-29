import {
  PrismaClient,
  JenisEvent,
  StatusEvent,
  TipeTransaksi,
  MetodePembayaran,
  StatusPembayaran,
  StatusBooking,
} from '@prisma/client'

const prisma = new PrismaClient()

// ============================================================================
// DATA SEED EVENT
// ============================================================================
const DEMO_EVENTS = [
  {
    seedKey: 'EVT-SEED-001',
    judul: 'Workshop SEFT: Spiritual Emotional Freedom Technique',
    jenis_event: JenisEvent.WORKSHOP,
    deskripsi:
      'Pelatihan intensif dan interaktif untuk melepaskan beban emosi, trauma ringan, dan kecemasan harian menggunakan perpaduan teknik spiritualitas dan energi psikologi bersama praktisi ahli.',
    tanggal: '2026-11-25',
    jam_mulai: '09:00',
    durasi_menit: 180,
    lokasi: 'Kantor Empathika Cikutra, Bandung',
    kuota: 30,
    harga: 200000,
    banner_url:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    nama_pembicara: 'Dian Kartika, M.Psi., Psikolog',
    status: StatusEvent.UPCOMING,
  },
  {
    seedKey: 'EVT-SEED-002',
    judul: 'Seminar Nasional: Mengelola Burnout & Menemukan Makna Hidup',
    jenis_event: JenisEvent.SEMINAR,
    deskripsi:
      'Seminar komprehensif bagi profesional muda dan mahasiswa dalam menghadapi beban ekspektasi karir, kejenuhan kerja, serta strategi membangun resiliensi emosional jangka panjang.',
    tanggal: '2026-12-10',
    jam_mulai: '13:30',
    durasi_menit: 150,
    lokasi: 'Grand Ballroom Hotel Savoy Homann, Bandung',
    kuota: 100,
    harga: 125000,
    banner_url:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    nama_pembicara: 'Dr. Sarah Melani, M.Psi & Tim Psikolog',
    status: StatusEvent.UPCOMING,
  },
  {
    seedKey: 'EVT-SEED-003',
    judul: 'Webinar Interaktif: Mindfulness & Self-Healing untuk Keseharian',
    jenis_event: JenisEvent.WEBINAR,
    deskripsi:
      'Sesi webinar daring panduan praktis meditasi pernapasan, relaksasi otot progresif, dan teknik grounding mandiri untuk meredakan ketegangan dari rumah.',
    tanggal: '2026-11-15',
    jam_mulai: '19:30',
    durasi_menit: 90,
    lokasi: 'Zoom Cloud Meeting (Tautan dikirim via Email & WhatsApp)',
    kuota: 200,
    harga: 50000,
    banner_url:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    nama_pembicara: 'Dr. Andi Pratama, Sp.KJ',
    status: StatusEvent.UPCOMING,
  },
  {
    seedKey: 'EVT-SEED-004',
    judul: 'Workshop Empathika Goes to School: Mental Health First Aid Remaja',
    jenis_event: JenisEvent.WORKSHOP,
    deskripsi:
      'Edukasi dan pelatihan pertolongan pertama kesehatan mental bagi guru bimbingan konseling dan pengurus OSIS di lingkungan sekolah menengah.',
    tanggal: '2026-10-15',
    jam_mulai: '08:30',
    durasi_menit: 240,
    lokasi: 'Aula SMA Negeri 3 Bandung',
    kuota: 60,
    harga: 75000,
    banner_url:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    nama_pembicara: 'Tim Fasilitator Empathika Training',
    status: StatusEvent.COMPLETED,
  },
  {
    seedKey: 'EVT-SEED-005',
    judul: 'Webinar Parenting: Membangun Komunikasi Hangat dengan Anak Generasi Alpha',
    jenis_event: JenisEvent.WEBINAR,
    deskripsi:
      'Konsep materi webinar pola asuh positif, manajemen waktu gawai (screen-time), dan penguatan keterikatan batin orang tua bersama anak.',
    tanggal: '2026-12-20',
    jam_mulai: '10:00',
    durasi_menit: 120,
    lokasi: 'Zoom Cloud Meeting',
    kuota: 150,
    harga: 60000,
    banner_url:
      'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=800&q=80',
    nama_pembicara: 'Rina Wulandari, M.Psi., Psikolog Anak',
    status: StatusEvent.DRAFT,
  },
]

// ============================================================================
// DATA PESERTA & TRANSAKSI DEMO EVENT
// ============================================================================
const DEMO_PESERTA_EVENT = [
  {
    eventSeedKey: 'EVT-SEED-001', // Workshop SEFT
    client: {
      nama: 'Farhan Maulana',
      email: 'farhan.maulana@gmail.com',
      no_telepon: '081298765432',
      usia: 27,
      jenis_kelamin: 'Laki-laki',
    },
    transaksi: {
      kode_transaksi: 'TRX-EVT-001',
      metode_pembayaran: MetodePembayaran.TRANSFER_BANK,
      channel_pembayaran: 'bca',
    },
    kode_tiket: 'TIK-SEFT-001',
  },
  {
    eventSeedKey: 'EVT-SEED-001', // Workshop SEFT
    client: {
      nama: 'Nadya Safira',
      email: 'nadya.safira@gmail.com',
      no_telepon: '085612349876',
      usia: 24,
      jenis_kelamin: 'Perempuan',
    },
    transaksi: {
      kode_transaksi: 'TRX-EVT-002',
      metode_pembayaran: MetodePembayaran.QRIS,
      channel_pembayaran: 'qris',
    },
    kode_tiket: 'TIK-SEFT-002',
  },
  {
    eventSeedKey: 'EVT-SEED-002', // Seminar Nasional
    client: {
      nama: 'Bima Adiputra',
      email: 'bima.adiputra@gmail.com',
      no_telepon: '082134567812',
      usia: 29,
      jenis_kelamin: 'Laki-laki',
    },
    transaksi: {
      kode_transaksi: 'TRX-EVT-003',
      metode_pembayaran: MetodePembayaran.TRANSFER_BANK,
      channel_pembayaran: 'mandiri',
    },
    kode_tiket: 'TIK-BRN-001',
  },
]

// ============================================================================
// MAIN SEEDER FUNCTION
// ============================================================================
async function main() {
  console.log('========================================================')
  console.log('🌱 MEMULAI SEEDER EVENT (seed-event)...')
  console.log('========================================================')

  const createdEventsMap = new Map<string, any>()

  // ──────────────────────────────────────────────────────────────────────────
  // 1. SEED / UPSERT EVENTS
  // ──────────────────────────────────────────────────────────────────────────
  for (const item of DEMO_EVENTS) {
    const tanggalDate = new Date(`${item.tanggal}T00:00:00.000Z`)
    const jamMulaiDate = new Date(`1970-01-01T${item.jam_mulai}:00.000Z`)

    let event = await prisma.event.findFirst({
      where: { judul: item.judul },
    })

    if (!event) {
      event = await prisma.event.create({
        data: {
          judul: item.judul,
          jenis_event: item.jenis_event,
          deskripsi: item.deskripsi,
          tanggal: tanggalDate,
          jam_mulai: jamMulaiDate,
          durasi_menit: item.durasi_menit,
          lokasi: item.lokasi,
          kuota: item.kuota,
          harga: item.harga,
          banner_url: item.banner_url,
          nama_pembicara: item.nama_pembicara,
          status: item.status,
        },
      })
      console.log(`[+] Created event: "${event.judul}" (${event.jenis_event} - ${event.status})`)
    } else {
      event = await prisma.event.update({
        where: { id: event.id },
        data: {
          jenis_event: item.jenis_event,
          deskripsi: item.deskripsi,
          tanggal: tanggalDate,
          jam_mulai: jamMulaiDate,
          durasi_menit: item.durasi_menit,
          lokasi: item.lokasi,
          kuota: item.kuota,
          harga: item.harga,
          banner_url: item.banner_url,
          nama_pembicara: item.nama_pembicara,
          status: item.status,
        },
      })
      console.log(`[*] Updated event: "${event.judul}" (${event.jenis_event} - ${event.status})`)
    }

    createdEventsMap.set(item.seedKey, event)
  }

  console.log('--------------------------------------------------------')
  console.log(`✅ Berhasil menyinkronkan ${DEMO_EVENTS.length} data Event.`)
  console.log('--------------------------------------------------------')

  // ──────────────────────────────────────────────────────────────────────────
  // 2. SEED PESERTA, TRANSAKSI, DAN TIKET EVENT
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n🎟️ Menyiapkan data Peserta, Booking Tiket & Transaksi Event...')

  for (const p of DEMO_PESERTA_EVENT) {
    const targetEvent = createdEventsMap.get(p.eventSeedKey)
    if (!targetEvent) continue

    // 2A. Client (Peserta)
    let client = await prisma.client.findFirst({
      where: { no_telepon: p.client.no_telepon },
    })
    if (!client) {
      client = await prisma.client.create({
        data: {
          nama: p.client.nama,
          no_telepon: p.client.no_telepon,
          usia: p.client.usia,
          jenis_kelamin: p.client.jenis_kelamin,
        },
      })
    } else {
      client = await prisma.client.update({
        where: { id: client.id },
        data: {
          nama: p.client.nama,
          usia: p.client.usia,
          jenis_kelamin: p.client.jenis_kelamin,
        },
      })
    }

    // 2B. Transaksi Event
    const nominalHarga = Number(targetEvent.harga)
    const trx = await prisma.transaksi.upsert({
      where: { kode_transaksi: p.transaksi.kode_transaksi },
      update: {
        id_client: client.id,
        subtotal: nominalHarga,
        total: nominalHarga,
        status_pembayaran: StatusPembayaran.PAID,
        data_pembayaran: JSON.stringify({
          email: p.client.email,
          nama: p.client.nama,
          event_title: targetEvent.judul,
        }),
      },
      create: {
        kode_transaksi: p.transaksi.kode_transaksi,
        id_client: client.id,
        tipe_transaksi: TipeTransaksi.EVENT,
        subtotal: nominalHarga,
        biaya_admin: 0,
        total: nominalHarga,
        metode_pembayaran: p.transaksi.metode_pembayaran,
        channel_pembayaran: p.transaksi.channel_pembayaran,
        status_pembayaran: StatusPembayaran.PAID,
        tanggal_bayar: new Date(),
        data_pembayaran: JSON.stringify({
          email: p.client.email,
          nama: p.client.nama,
          event_title: targetEvent.judul,
        }),
      },
    })

    // 2C. Booking Event (Tiket)
    let bookingEvent = await prisma.bookingEvent.findFirst({
      where: { kode_tiket: p.kode_tiket },
    })

    if (!bookingEvent) {
      bookingEvent = await prisma.bookingEvent.create({
        data: {
          id_event: targetEvent.id,
          id_client: client.id,
          id_transaksi: trx.id,
          kode_tiket: p.kode_tiket,
          status: StatusBooking.CONFIRMED,
        },
      })
      console.log(`    ✓ Tiket [${p.kode_tiket}] terbit untuk ${client.nama} -> "${targetEvent.judul}"`)
    } else {
      bookingEvent = await prisma.bookingEvent.update({
        where: { id: bookingEvent.id },
        data: {
          id_event: targetEvent.id,
          id_client: client.id,
          id_transaksi: trx.id,
          status: StatusBooking.CONFIRMED,
        },
      })
      console.log(`    * Tiket [${p.kode_tiket}] diperbarui untuk ${client.nama} -> "${targetEvent.judul}"`)
    }
  }

  console.log('\n========================================================')
  console.log('🎉 SEEDER EVENT BERHASIL DISELESAIKAN!')
  console.log('========================================================')
  console.log('Ringkasan Data Demo Event:')
  console.log('1. Workshop SEFT (UPCOMING - Terisi 2 Peserta): Farhan Maulana & Nadya Safira')
  console.log('2. Seminar Nasional Burnout (UPCOMING - Terisi 1 Peserta): Bima Adiputra')
  console.log('3. Webinar Mindfulness (UPCOMING - Kuota Siap)')
  console.log('4. Workshop Goes to School (COMPLETED - Untuk demo tab Selesai)')
  console.log('5. Webinar Parenting (DRAFT - Untuk demo tab Draft)')
  console.log('========================================================\n')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error saat menjalankan seed-event:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
