import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Admin user
  const adminHash = await bcrypt.hash('admin123secure', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@empathika.id' },
    update: {},
    create: {
      name: 'Admin Empathika',
      email: 'admin@empathika.id',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  })
  console.log('Admin created:', admin.email)

  // Sample psikolog
  const psikolog = await prisma.psikolog.upsert({
    where: { slug: 'dr-sarah-amanda' },
    update: {},
    create: {
      name: 'Dr. Sarah Amanda, M.Psi',
      slug: 'dr-sarah-amanda',
      bio: 'Psikolog klinis dengan pengalaman 10 tahun dalam menangani kecemasan dan depresi.',
      priceOnline: 150000,
      priceOffline: 200000,
      specializations: {
        create: [
          { name: 'Kecemasan' },
          { name: 'Depresi' },
          { name: 'Trauma' },
        ],
      },
    },
  })
  console.log('Psikolog created:', psikolog.name)

  // Sample layanan
  const layanan = await prisma.layanan.upsert({
    where: { slug: 'konsultasi-individu' },
    update: {},
    create: {
      slug: 'konsultasi-individu',
      nama: 'Konsultasi Individu',
      deskripsi: 'Sesi konsultasi pribadi 1-on-1 dengan psikolog profesional.',
      tipe: 'INDIVIDU',
      harga: 150000,
    },
  })
  console.log('Layanan created:', layanan.nama)

  console.log('Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.\())

