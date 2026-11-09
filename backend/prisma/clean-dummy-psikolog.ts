import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDummyPsikolog() {
  console.log('Memulai pembersihan data dummy psikolog di database...')

  try {
    const dummyEmails = [
      'psikolog@empathika.test',
      'putriqoida@empathika.com',
      'galuh@empathika.com',
      'dimas@empathika.com',
      'nadia@empathika.com',
      'farhan@empathika.com',
      'anindya@empathika.com',
      'rian@empathika.com',
      'rayhan@empathika.com',
      'amanda@empathika.com',
    ]

    const countBefore = await prisma.psikolog.count()
    console.log(`Total psikolog saat ini: ${countBefore}`)

    // 1. Cari account dummy
    const dummyAccounts = await prisma.account.findMany({
      where: {
        OR: [
          { email: { in: dummyEmails } },
          { email: { contains: 'test', mode: 'insensitive' } },
        ],
      },
      select: { id: true, email: true },
    })

    const dummyAccountIds = dummyAccounts.map((a) => a.id)

    // 2. Hapus jadwal slot dummy yang terkait
    await prisma.jadwalSlot.deleteMany({
      where: {
        psikolog: {
          id_account: { in: dummyAccountIds },
        },
      },
    })

    // 3. Hapus profil psikolog dummy
    const deletedPsi = await prisma.psikolog.deleteMany({
      where: {
        id_account: { in: dummyAccountIds },
      },
    })

    // 4. Hapus account dummy
    const deletedAcc = await prisma.account.deleteMany({
      where: {
        id: { in: dummyAccountIds },
      },
    })

    console.log(`Berhasil menghapus ${deletedPsi.count} psikolog dummy dan ${deletedAcc.count} akun dummy!`)

    const countAfter = await prisma.psikolog.count()
    console.log(`Sisa psikolog valid di database: ${countAfter}`)
  } catch (error) {
    console.error('Gagal membersihkan data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDummyPsikolog()
