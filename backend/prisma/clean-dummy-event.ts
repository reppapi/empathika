/**
 * Script Cleanup Data Dummy - Event Module
 * Jalankan dengan: npx ts-node prisma/clean-dummy-event.ts
 * atau: npx tsx prisma/clean-dummy-event.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDummyEvent() {
  console.log('================================================================')
  console.log('  Memulai pembersihan data dummy Event...')
  console.log('================================================================')

  try {
    // ─── 1. Cek kondisi awal ────────────────────────────────────────
    const totalEvent = await prisma.event.count()
    const totalBookingEvent = await prisma.bookingEvent.count()
    console.log(`\n📊 Kondisi database saat ini:`)
    console.log(`   - Total Event          : ${totalEvent}`)
    console.log(`   - Total BookingEvent   : ${totalBookingEvent}`)

    // ─── 2. Hapus booking_event dummy dulu (karena FK ke events) ───
    const deletedBookings = await prisma.bookingEvent.deleteMany({
      where: {
        OR: [
          { kode_tiket: { contains: 'test', mode: 'insensitive' } },
          { kode_tiket: { contains: 'dummy', mode: 'insensitive' } },
          { kode_tiket: { contains: 'MOCK', mode: 'insensitive' } },
        ],
      },
    })

    if (deletedBookings.count > 0) {
      console.log(`\n🗑️  BookingEvent dummy dihapus: ${deletedBookings.count} record`)
    } else {
      console.log('\n✅ Tidak ada BookingEvent dummy ditemukan.')
    }

    // ─── 3. Hapus event dummy berdasarkan kata kunci ────────────────
    const deletedEvents = await prisma.event.deleteMany({
      where: {
        OR: [
          { judul: { contains: 'test', mode: 'insensitive' } },
          { judul: { contains: 'dummy', mode: 'insensitive' } },
          { judul: { contains: 'lorem', mode: 'insensitive' } },
          { judul: { contains: 'coba', mode: 'insensitive' } },
          { judul: { contains: 'sample', mode: 'insensitive' } },
          { deskripsi: { contains: 'lorem ipsum', mode: 'insensitive' } },
          { nama_pembicara: { contains: 'test', mode: 'insensitive' } },
          { nama_pembicara: { contains: 'dummy', mode: 'insensitive' } },
        ],
      },
    })

    if (deletedEvents.count > 0) {
      console.log(`🗑️  Event dummy dihapus: ${deletedEvents.count} record`)
    } else {
      console.log('✅ Tidak ada Event dummy ditemukan.')
    }

    // ─── 4. Laporan akhir ─────────────────────────────────────────
    const totalEventAfter = await prisma.event.count()
    const totalBookingEventAfter = await prisma.bookingEvent.count()
    console.log(`\n📊 Kondisi database setelah cleanup:`)
    console.log(`   - Total Event          : ${totalEventAfter}`)
    console.log(`   - Total BookingEvent   : ${totalBookingEventAfter}`)
    console.log('\n✅ Selesai. Database bersih dari data dummy Event.')
  } catch (error) {
    console.error('\n❌ Gagal membersihkan data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }

  console.log('================================================================\n')
}

cleanDummyEvent()
