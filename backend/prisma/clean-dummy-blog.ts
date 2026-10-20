import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDummyBlog() {
  console.log('Memulai pembersihan data dummy artikel blog...')

  try {
    // 1. Cek apakah ada data blog
    const countBefore = await prisma.artikelBlog.count()
    console.log(`Total artikel blog saat ini: ${countBefore}`)

    // 2. Bersihkan data dummy (misalnya artikel dengan kata kunci dummy/test atau bersihkan semua data lama)
    // Opsi: Hapus record artikel blog yang memiliki judul yang mengandung kata 'dummy' atau 'test', atau reset tabel
    const deleted = await prisma.artikelBlog.deleteMany({
      where: {
        OR: [
          { judul: { contains: 'test', mode: 'insensitive' } },
          { judul: { contains: 'dummy', mode: 'insensitive' } },
          { isi: { contains: 'lorem ipsum', mode: 'insensitive' } },
        ],
      },
    })

    console.log(`Berhasil menghapus ${deleted.count} artikel blog dummy!`)

    const countAfter = await prisma.artikelBlog.count()
    console.log(`Sisa artikel blog valid: ${countAfter}`)
  } catch (error) {
    console.error('Gagal membersihkan data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDummyBlog()
