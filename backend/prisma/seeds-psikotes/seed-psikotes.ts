import { PrismaClient } from '@prisma/client'
import { seedGAD7, GAD7_SOAL, GAD7_OPSI, GAD7_INTERPRETASI } from './seeds/seed-gad7'
import { seedPHQ9, PHQ9_SOAL, PHQ9_OPSI, PHQ9_INTERPRETASI } from './seeds/seed-phq9'
import { seedDASS42, DASS42_SOAL, DASS42_OPSI, DASS42_INTERPRETASI } from './seeds/seed-dass42'

const prisma = new PrismaClient()

// Re-export constants untuk kompatibilitas jika ada modul lain yang mengimpor
export {
  seedGAD7,
  GAD7_SOAL,
  GAD7_OPSI,
  GAD7_INTERPRETASI,
  seedPHQ9,
  PHQ9_SOAL,
  PHQ9_OPSI,
  PHQ9_INTERPRETASI,
  seedDASS42,
  DASS42_SOAL,
  DASS42_OPSI,
  DASS42_INTERPRETASI,
}

// ============================================================================
// MAIN ORCHESTRATOR SEEDER PSIKOTES
// Menjalankan semua seeder alat ukur secara berurutan dan terstruktur
// ============================================================================
export async function seedPsikotes(customPrisma?: PrismaClient) {
  const p = customPrisma || prisma
  console.log('========================================================')
  console.log('🌱 MEMULAI ORCHESTRATOR SEEDER PSIKOTES...')
  console.log('========================================================')

  // 1. Bersihkan paket legacy yang sudah tidak digunakan (Kejenuhan & Kepribadian Dasar)
  const legacyList = await p.paketPsikotes.findMany({
    where: {
      OR: [
        { judul: { contains: 'Kejenuhan', mode: 'insensitive' } },
        { judul: { contains: 'Kepribadian Dasar', mode: 'insensitive' } },
      ],
    },
    include: {
      soal_psikotes: true,
      booking_psikotes: true,
    },
  })

  if (legacyList.length > 0) {
    console.log(`🧹 Membersihkan ${legacyList.length} paket legacy lama...`)
    for (const leg of legacyList) {
      const bIds = leg.booking_psikotes.map((b) => b.id)
      if (bIds.length > 0) {
        await p.hasilTes.deleteMany({ where: { id_booking: { in: bIds } } })
        await p.jawabanPsikotes.deleteMany({ where: { id_booking: { in: bIds } } })
        await p.bookingPsikotes.deleteMany({ where: { id: { in: bIds } } })
      }
      const sIds = leg.soal_psikotes.map((s) => s.id)
      if (sIds.length > 0) {
        await p.pilihanJawaban.deleteMany({ where: { id_soal: { in: sIds } } })
        await p.soalPsikotes.deleteMany({ where: { id: { in: sIds } } })
      }
      await p.interpretasiPsikotes.deleteMany({ where: { id_paket: leg.id } })
      await p.paketPsikotes.delete({ where: { id: leg.id } })
    }
    console.log('   ✓ Paket legacy berhasil dibersihkan.')
  }

  // 2. Jalankan seeder per modul alat ukur
  const paketGAD7 = await seedGAD7(p)
  const paketPHQ9 = await seedPHQ9(p)
  const paketDASS42 = await seedDASS42(p)

  console.log('\n========================================================')
  console.log('🎉 SELURUH SEEDER PSIKOTES BERHASIL DIJALANKAN!')
  console.log('========================================================')
  console.log('Paket Aktif di Database:')
  console.log(`1. "${paketGAD7.judul}" -> GRATIS (Rp 0) [Alat: GAD-7]`)
  console.log(`2. "${paketPHQ9.judul}" -> GRATIS (Rp 0) [Alat: PHQ-9]`)
  console.log(`3. "${paketDASS42.judul}" -> GRATIS (Rp 0) [Alat: DASS-42]`)
  console.log('========================================================\n')
}

if (process.argv[1]?.includes('seed-psikotes')) {
  seedPsikotes()
    .then(async () => {
      await prisma.$disconnect()
    })
    .catch(async (e) => {
      console.error('❌ Error saat menjalankan seed-psikotes:', e)
      await prisma.$disconnect()
      process.exit(1)
    })
}
