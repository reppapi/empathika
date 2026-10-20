import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const delBooking = await prisma.bookingEvent.deleteMany({})
  console.log('Deleted booking_event:', delBooking.count)
  const delEvent = await prisma.event.deleteMany({})
  console.log('Deleted event:', delEvent.count)
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
