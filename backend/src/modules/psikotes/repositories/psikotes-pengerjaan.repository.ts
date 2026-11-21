/** Sub-repository kalkulasi skoring dan submit pengerjaan asesmen psikotes */
import type { PrismaClient } from '@prisma/client'
import type { SubmitPsikotesInput } from '../psikotes.schema'
import {
  hitungSkorAlatUkur,
} from '../alat-ukur'
import { createHasilAccessToken } from '../hasil-token'
import { normalizePhoneNumber, formatIndonesianPhone, generateOrderId } from '../../../utils'
import { determineKategoriPeserta } from './peserta-kategori.helper'

export class PsikotesPengerjaanRepository {
  constructor(private prisma: PrismaClient) {}

  async submit(idPaket: string, input: SubmitPsikotesInput) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Validasi paket psikotes
      const paket = await tx.paketPsikotes.findUnique({
        where: { id: idPaket },
        include: {
          soal_psikotes: {
            include: {
              pilihan_jawaban: {
                orderBy: { label: 'asc' },
              },
            },
            orderBy: { urutan: 'asc' },
          },
          interpretasi_psikotes: true,
          alat_ukur: true,
        },
      })

      if (!paket) {
        throw Object.assign(new Error('Paket psikotes tidak ditemukan'), { statusCode: 404 })
      }

      if (paket.status !== 'PUBLISHED') {
        throw Object.assign(
          new Error('Paket psikotes belum dipublikasikan atau sedang dinonaktifkan.'),
          { statusCode: 403 }
        )
      }

      // Deteksi apakah paket memerlukan telaah klinis psikolog (misal: MCMI-IV / klinis berbayar)
      const isNeedReview = Boolean(
        !Boolean(
          paket.alat_ukur?.kode === 'DASS-42' ||
          paket.alat_ukur?.kode === 'DASS_42' ||
          paket.judul?.toLowerCase().includes('dass') ||
          paket.judul?.toLowerCase().includes('depresi, kecemasan, dan stres')
        ) &&
        ((paket as any).perlu_review_psikolog ||
        paket.alat_ukur?.kode === 'MCMI_4' ||
        paket.judul?.toLowerCase().includes('mcmi'))
      )
      const targetStatusPengerjaan = isNeedReview ? 'MENUNGGU_REVIEW' : 'SELESAI'

      // 2. Normalisasi format jawaban (baik array [{ id_soal, id_pilihan }] maupun record { [id_soal]: id_pilihan })
      const normalizedAnswers: Array<{ id_soal: string; id_pilihan: string }> = []
      if (Array.isArray(input.jawaban)) {
        for (const item of input.jawaban) {
          normalizedAnswers.push({ id_soal: item.id_soal, id_pilihan: item.id_pilihan })
        }
      } else if (typeof input.jawaban === 'object' && input.jawaban !== null) {
        for (const [id_soal, id_pilihan] of Object.entries(input.jawaban)) {
          normalizedAnswers.push({ id_soal, id_pilihan: String(id_pilihan) })
        }
      }

      if (!paket.soal_psikotes || paket.soal_psikotes.length === 0) {
        throw Object.assign(
          new Error('Paket tes ini belum memiliki daftar soal yang valid.'),
          { statusCode: 400 }
        )
      }

      // Buat lookup map soal & pilihan jawaban untuk bobot dan verifikasi integritas
      const validSoalIds = new Set(paket.soal_psikotes.map((s) => s.id))
      const pilihanMap = new Map<string, { id: string; id_soal: string; bobot: number; label: string }>()
      for (const soal of paket.soal_psikotes) {
        for (const pil of soal.pilihan_jawaban) {
          pilihanMap.set(pil.id, pil)
        }
      }

      let totalSkor = 0
      const seenSoalIds = new Set<string>()
      const jawabanToInsert: Array<{ id_soal_psikotes: string; id_pilihan_jawaban: string; skor: number }> = []

      for (const ans of normalizedAnswers) {
        if (!ans.id_soal || !ans.id_pilihan) {
          throw Object.assign(
            new Error('Setiap jawaban wajib menyertakan id_soal dan id_pilihan yang valid.'),
            { statusCode: 400 }
          )
        }
        if (!validSoalIds.has(ans.id_soal)) {
          throw Object.assign(
            new Error('Terdapat id_soal yang tidak termasuk dalam paket tes ini.'),
            { statusCode: 400 }
          )
        }
        if (seenSoalIds.has(ans.id_soal)) {
          throw Object.assign(
            new Error('Terdapat jawaban ganda untuk butir soal yang sama.'),
            { statusCode: 400 }
          )
        }
        const pil = pilihanMap.get(ans.id_pilihan)
        if (!pil || pil.id_soal !== ans.id_soal) {
          throw Object.assign(
            new Error('Pilihan jawaban tidak valid untuk butir soal yang dikirim.'),
            { statusCode: 400 }
          )
        }

        seenSoalIds.add(ans.id_soal)
        const skor = pil.bobot
        totalSkor += skor
        jawabanToInsert.push({
          id_soal_psikotes: ans.id_soal,
          id_pilihan_jawaban: ans.id_pilihan,
          skor,
        })
      }

      if (seenSoalIds.size !== paket.soal_psikotes.length) {
        throw Object.assign(
          new Error(
            `Semua pertanyaan harus dijawab sebelum submit (${seenSoalIds.size}/${paket.soal_psikotes.length} terjawab).`
          ),
          { statusCode: 400 }
        )
      }

      // Jika paket terhubung dengan alat ukur baku (Code-First / Hybrid), hitung skor & diagnosa dengan engine alat ukur
      let calculationResult: any = null
      if (paket.alat_ukur) {
        const jawabanMap: Record<number | string, any> = {}
        for (let idx = 0; idx < normalizedAnswers.length; idx++) {
          const ans = normalizedAnswers[idx]
          const pil = pilihanMap.get(ans.id_pilihan)
          const skor = pil ? pil.bobot : 0
          // Ambil urutan nomor soal dari database jika ada, atau fallback ke indeks
          const soalObj = paket.soal_psikotes.find((s) => s.id === ans.id_soal)
          const qNumMatch = ans.id_soal.match(/q-(\d+)/i) || ans.id_soal.match(/(\d+)$/)
          const qNum = soalObj?.urutan ?? (qNumMatch ? parseInt(qNumMatch[1], 10) : idx + 1)

          const teksAns =
            (ans as any).teks_jawaban ||
            (ans as any).teks ||
            (input as any).choci_isian?.[String(qNum)] ||
            (input as any).choci_isian?.[String(idx)]
          if (typeof teksAns === 'string' && teksAns.trim()) {
            jawabanMap[qNum] = teksAns.trim()
          } else {
            jawabanMap[qNum] = skor
          }
        }
        if ((input as any).choci_isian && typeof (input as any).choci_isian === 'object') {
          const rawIsian = (input as any).choci_isian as Record<string, string>
          // Petakan indeks 0-based ke nomor butir 1-based CHOCI secara aman
          if (rawIsian['10'] && typeof rawIsian['10'] === 'string') jawabanMap[11] = rawIsian['10'].trim()
          if (rawIsian['11'] && typeof rawIsian['11'] === 'string') jawabanMap[12] = rawIsian['11'].trim()
          if (rawIsian['12'] && typeof rawIsian['12'] === 'string') jawabanMap[13] = rawIsian['12'].trim()
          if (rawIsian['29'] && typeof rawIsian['29'] === 'string') jawabanMap[30] = rawIsian['29'].trim()
          if (rawIsian['30'] && typeof rawIsian['30'] === 'string') jawabanMap[31] = rawIsian['30'].trim()
          if (rawIsian['31'] && typeof rawIsian['31'] === 'string') jawabanMap[32] = rawIsian['31'].trim()
          jawabanMap['choci_isian'] = rawIsian
        }
        if (input.dampak_aktivitas !== undefined && input.dampak_aktivitas !== null) {
          jawabanMap['difficulty'] = input.dampak_aktivitas
        }
        const mostDistressing =
          (input as any).peristiwaPalingMengganggu ||
          input.peristiwa_paling_mengganggu
        if (mostDistressing) {
          jawabanMap['peristiwa_paling_mengganggu'] = mostDistressing as any
          jawabanMap['peristiwaPalingMengganggu'] = mostDistressing as any
        }
        const otherEvent =
          (input as any).peristiwaLainnya ||
          input.peristiwa_lainnya
        if (otherEvent) {
          jawabanMap['peristiwa_lainnya'] = otherEvent as any
          jawabanMap['peristiwaLainnya'] = otherEvent as any
        }
        try {
          calculationResult = hitungSkorAlatUkur(paket.alat_ukur.kode, jawabanMap)
          if (calculationResult?.tanpaSkorTotal) {
            totalSkor = 0
          } else if (calculationResult && typeof calculationResult.totalSkor === 'number') {
            totalSkor = calculationResult.totalSkor
          }
        } catch (err: any) {
          if (err?.statusCode) {
            throw err
          }
          console.warn(`[PSIKOTES] Gagal hitung skor modul ${paket.alat_ukur.kode}:`, err)
        }
      }

      // 3. Tentukan interpretasi hasil berdasarkan skor
      let matchedInterpretasi: any = null
      if (calculationResult) {
        // Cari interpretasi yang cocok dari tabel DB jika ada
        const dbMatched = paket.interpretasi_psikotes.find(
          (i) => totalSkor >= i.min_skor && totalSkor <= i.max_skor
        )

        matchedInterpretasi = {
          id: dbMatched?.id || null,
          grade: dbMatched?.grade || calculationResult.grade || 'Hasil Tes',
          judul: dbMatched?.judul || calculationResult.kategori || 'Hasil Asesmen',
          deskripsi: dbMatched?.deskripsi || calculationResult.deskripsi || '',
        }
      } else {
        const interpretasiList = paket.interpretasi_psikotes || []

        if (interpretasiList.length > 0) {
          // Cari rentang persis
          matchedInterpretasi = interpretasiList.find(
            (i) => totalSkor >= i.min_skor && totalSkor <= i.max_skor
          )

          if (!matchedInterpretasi) {
            // Cari tier terdekat jika skor di luar min/max
            const sorted = [...interpretasiList].sort((a, b) => a.min_skor - b.min_skor)
            if (totalSkor < sorted[0].min_skor) {
              matchedInterpretasi = sorted[0]
            } else {
              matchedInterpretasi = sorted[sorted.length - 1]
            }
          }
        } else {
          // Buat 1 interpretasi default jika paket belum memiliki data interpretasi
          matchedInterpretasi = await tx.interpretasiPsikotes.create({
            data: {
              id_paket: paket.id,
              min_skor: 0,
              max_skor: 1000,
              grade: 'Hasil Umum',
              judul: 'Hasil Asesmen Psikotes',
              deskripsi: 'Tes telah diselesaikan dengan baik.',
            },
          })
        }
      }

      // 4. Cari apakah sudah ada entri BookingPsikotes yang dibuat saat transaksi/checkout (hasil_tes masih null)
      let booking: any = null
      const explicitBookingId = (
        (input as any).id_booking ||
        (input as any).bookingId ||
        (input as any).orderId ||
        (input as any).kode_akses ||
        ''
      ).trim()

      if (explicitBookingId) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(explicitBookingId)
        booking = await tx.bookingPsikotes.findFirst({
          where: isUuid
            ? {
              OR: [
                { id: explicitBookingId },
                { id_transaksi: explicitBookingId },
                { kode_akses: { equals: explicitBookingId, mode: 'insensitive' } },
              ],
            }
            : {
              OR: [
                { kode_akses: { equals: explicitBookingId, mode: 'insensitive' } },
                { kode_akses: { equals: explicitBookingId.replace(/\s+/g, ''), mode: 'insensitive' } },
                { transaksi: { kode_transaksi: { equals: explicitBookingId, mode: 'insensitive' } } },
                { transaksi: { kode_transaksi: { equals: explicitBookingId.replace(/\s+/g, ''), mode: 'insensitive' } } },
              ],
            },
          include: { hasil_tes: true, client: true, transaksi: true },
        })

        if (booking && input.id_biro) {
          if (booking.client && (!booking.client.id_biro || booking.client.id_biro !== input.id_biro)) {
            await tx.client.update({ where: { id: booking.client.id }, data: { id_biro: input.id_biro } }).catch(() => {});
          }
          if (booking.transaksi && (!booking.transaksi.id_biro_tenant || booking.transaksi.id_biro_tenant !== input.id_biro)) {
            await tx.transaksi.update({ where: { id: booking.transaksi.id }, data: { id_biro_tenant: input.id_biro } }).catch(() => {});
          }
        }

        if (booking && (booking.status_pengerjaan === 'SELESAI' || booking.hasil_tes)) {
          throw Object.assign(
            new Error('Tes untuk tiket ini sudah selesai dikerjakan dan tidak dapat diulang kembali.'),
            { statusCode: 400 }
          )
        }

        const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000
        if (booking?.createdAt && Date.now() - new Date(booking.createdAt).getTime() > THREE_MONTHS_MS) {
          throw Object.assign(
            new Error(
              'Masa berlaku tiket pengerjaan asesmen ini telah berakhir (berlaku 3 bulan sejak tanggal pembelian). Silakan hubungi admin Empathika jika Anda memerlukan bantuan.'
            ),
            { statusCode: 410 }
          )
        }

        if (booking?.transaksi && booking.transaksi.status_pembayaran !== 'PAID') {
          throw Object.assign(
            new Error('Pembayaran tiket belum lunas. Selesaikan pembayaran terlebih dahulu sebelum mengirimkan jawaban tes.'),
            { statusCode: 400 }
          )
        }
      }

      // 4b. Resolusi Data Klien (Akun Pemesan / Kontak Transaksi)
      // JIKA booking sudah ada: gunakan Klien pembeli dari booking tanpa menimpa namanya dengan nama peserta tes
      const isPaketGratis = paket.jenis_akses === 'GRATIS'
      const inputName = (!isPaketGratis && ((input as any).peserta?.nama_lengkap?.trim() || input.klien?.nama?.trim() || input.nama?.trim())) || ''
      const rawPhone = (!isPaketGratis && ((input as any).peserta?.no_telepon_orang_tua?.trim() || input.klien?.no_telepon?.trim() || input.no_telepon?.trim())) || ''
      const inputPhone = normalizePhoneNumber(rawPhone) || rawPhone
      let client = booking?.client || null

      if (!client) {
        if (isPaketGratis) {
          // Tamu anonim (tes gratis): gunakan record Tamu Anonim agar tabel clients tidak terduplikasi
          client = await tx.client.findFirst({
            where: {
              nama: 'Tamu Anonim',
              no_telepon: null,
              id_biro: input.id_biro || null,
            },
          })

          if (!client) {
            client = await tx.client.create({
              data: {
                nama: 'Tamu Anonim',
                no_telepon: null,
                id_biro: input.id_biro || null,
              },
            })
          }
        } else {
          // Pendaftar berbayar mandiri tanpa booking awal (kombinasi nomor telepon DAN nama case-insensitive)
          if (inputPhone && inputName) {
            client = await tx.client.findFirst({
              where: {
                AND: [
                  {
                    OR: [
                      { no_telepon: inputPhone },
                      ...(rawPhone ? [{ no_telepon: rawPhone }] : []),
                    ],
                  },
                  { nama: { equals: inputName, mode: 'insensitive' } },
                ],
                id_biro: input.id_biro || null,
              },
            })
          } else if (inputPhone) {
            client = await tx.client.findFirst({
              where: {
                OR: [
                  { no_telepon: inputPhone },
                  ...(rawPhone ? [{ no_telepon: rawPhone }] : []),
                ],
                id_biro: input.id_biro || null,
              },
            })
          } else if (inputName) {
            client = await tx.client.findFirst({
              where: {
                nama: { equals: inputName, mode: 'insensitive' },
                id_biro: input.id_biro || null,
              },
            })
          }

          if (!client) {
            client = await tx.client.create({
              data: {
                nama: inputName || 'Klien Psikotes',
                no_telepon: inputPhone || null,
                usia: input.klien?.usia || null,
                jenis_kelamin: input.klien?.jenis_kelamin || null,
                id_biro: input.id_biro || null,
              },
            })
          } else if (input.id_biro && (!client.id_biro || client.id_biro !== input.id_biro)) {
            client = await tx.client.update({
              where: { id: client.id },
              data: { id_biro: input.id_biro },
            }).catch(() => client)
          }
        }
      }

      // Tentukan target paket untuk booking:
      // Selalu hubungkan ke paket yang sedang dikerjakan (tidak dialihkan ke sibling paket berbayar)
      const targetBookingPaketId = paket.id

      // Jika belum ketemu dan bukan tamu anonim, cari booking terakhir milik klien ini untuk paket ini yang belum ada hasil_tes (status 'Berjalan')
      if ((!booking || booking.hasil_tes) && client && client.nama !== 'Tamu Anonim') {
        booking = await tx.bookingPsikotes.findFirst({
          where: {
            id_client: client.id,
            OR: [
              { id_paket: paket.id },
              { paket: { judul: { equals: paket.judul.trim(), mode: 'insensitive' } } },
            ],
            hasil_tes: null,
          },
          orderBy: { createdAt: 'desc' },
          include: { hasil_tes: true, client: true, transaksi: true },
        })
      }

      // Fallback tambahan: jika belum ketemu tapi ada nomor HP pembeli/peserta, cari booking berbayar terakhir untuk paket yang sama yang belum ada hasil_tes
      if ((!booking || booking.hasil_tes) && inputPhone) {
        const normInput = normalizePhoneNumber(rawPhone) || inputPhone
        const formattedInput = formatIndonesianPhone(rawPhone)
        booking = await tx.bookingPsikotes.findFirst({
          where: {
            id_paket: targetBookingPaketId,
            OR: [
              { client: { no_telepon: normInput } },
              { client: { no_telepon: formattedInput } },
              { client: { no_telepon: inputPhone } },
              { client: { no_telepon: rawPhone } },
            ],
            hasil_tes: null,
          },
          orderBy: { createdAt: 'desc' },
          include: { hasil_tes: true, client: true, transaksi: true },
        })
      }

      // Jika ada booking berjalan yang sudah ada, klaim secara atomik agar tidak terjadi submit ganda bersamaan
      if (booking && !booking.hasil_tes) {
        if (booking.transaksi && booking.transaksi.status_pembayaran !== 'PAID') {
          throw Object.assign(
            new Error('Pembayaran tiket belum lunas. Selesaikan pembayaran terlebih dahulu sebelum mengirimkan jawaban tes.'),
            { statusCode: 400 }
          )
        }

        const claimResult = await tx.bookingPsikotes.updateMany({
          where: {
            id: booking.id,
            status_pengerjaan: { notIn: ['SELESAI'] },
            hasil_tes: null,
          },
          data: {
            status_pengerjaan: targetStatusPengerjaan,
          },
        })

        if (claimResult.count === 0) {
          throw Object.assign(
            new Error('Tes untuk tiket ini sudah selesai dikerjakan dan tidak dapat diulang kembali.'),
            { statusCode: 400 }
          )
        }

        if (booking.id_paket !== targetBookingPaketId) {
          booking = await tx.bookingPsikotes.update({
            where: { id: booking.id },
            data: {
              id_paket: targetBookingPaketId,
              riwayat_kesehatan: (input as any).riwayat_kesehatan || booking.riwayat_kesehatan,
            },
          })
        } else if ((input as any).riwayat_kesehatan) {
          booking = await tx.bookingPsikotes.update({
            where: { id: booking.id },
            data: { riwayat_kesehatan: (input as any).riwayat_kesehatan },
          })
        }
      } else {
        // Buat entri BookingPsikotes baru jika memang belum pernah ada
        booking = await tx.bookingPsikotes.create({
          data: {
            id_paket: targetBookingPaketId,
            id_client: client.id,
            id_transaksi: null,
            riwayat_kesehatan: (input as any).riwayat_kesehatan || null,
            status_pengerjaan: targetStatusPengerjaan,
          },
        })
      }

      // Pastikan booking berbayar selalu memiliki entri transaksi resmi
      if (paket.jenis_akses === 'BERBAYAR' && !booking.id_transaksi) {
        const nominal = Number(paket.harga) > 0 ? Number(paket.harga) : 75000
        const kodeTrx =
          (input as any).orderId ||
          (input as any).kode_transaksi ||
          booking.kode_akses ||
          `PSI-${generateOrderId()}`
        const effectiveBiroId = (input as any).id_biro || client.id_biro || null
        const newTrx = await tx.transaksi.create({
          data: {
            id_client: client.id,
            id_biro_tenant: effectiveBiroId,
            kode_transaksi: kodeTrx,
            tipe_transaksi: 'PSIKOTES',
            subtotal: nominal,
            biaya_admin: 0,
            total: nominal,
            metode_pembayaran: 'QRIS',
            channel_pembayaran: 'QRIS',
            status_pembayaran: 'PAID',
            tanggal_bayar: new Date(),
          },
        })
        booking = await tx.bookingPsikotes.update({
          where: { id: booking.id },
          data: {
            id_transaksi: newTrx.id,
            kode_akses: booking.kode_akses || kodeTrx,
          },
        })
      }

      // 5b. Simpan/sinkronkan data peserta tes ke tabel peserta_psikotes jika bukan tamu anonim
      const pesertaSource = (input as any).peserta || input.klien || {}
      const namaPeserta = (input as any).peserta?.nama_lengkap || input.klien?.nama || inputName
      const usiaPeserta = pesertaSource.usia ?? client.usia ?? null
      const isUnderAge = usiaPeserta !== null && Number(usiaPeserta) < 18
      const kategoriOtomatis =
        pesertaSource.kategori_peserta ||
        determineKategoriPeserta(usiaPeserta)

      // Pemisahan data Anak/Remaja (<18) vs Dewasa (>=18) sesuai standar etika klinis:
      let namaOrangTua: string | null = null
      let noTeleponOrangTua: string | null = null
      let pekerjaan: string | null = null
      let statusPernikahan: string | null = null
      let noHpPeserta: string | null = null

      if (isUnderAge) {
        namaOrangTua = pesertaSource.nama_orang_tua || null
        noTeleponOrangTua =
          pesertaSource.no_telepon_orang_tua ||
          pesertaSource.whatsapp ||
          pesertaSource.no_telepon ||
          null
        noHpPeserta = pesertaSource.no_telepon || null
        pekerjaan = null
        statusPernikahan = null
      } else {
        namaOrangTua = null
        noTeleponOrangTua = null
        pekerjaan = pesertaSource.pekerjaan || null
        statusPernikahan = pesertaSource.status_pernikahan || null
        noHpPeserta =
          pesertaSource.no_telepon ||
          pesertaSource.whatsapp ||
          (input as any).no_telepon ||
          null
      }

      // 5b. Simpan profil peserta tes ke tabel peserta_psikotes (khusus pengerjaan resmi dengan data identitas)
      if (namaPeserta && (client.nama !== 'Tamu Anonim' || (input as any).peserta)) {
        await (tx as any).pesertaPsikotes.upsert({
          where: { id_booking: booking.id },
          create: {
            id_booking: booking.id,
            nama_lengkap: namaPeserta,
            no_telepon: noHpPeserta,
            jenis_kelamin: pesertaSource.jenis_kelamin || client.jenis_kelamin || 'Laki-laki',
            tempat_lahir: pesertaSource.tempat_lahir || null,
            tanggal_lahir: pesertaSource.tanggal_lahir ? new Date(pesertaSource.tanggal_lahir) : null,
            usia: usiaPeserta,
            kategori_peserta: kategoriOtomatis,
            nama_orang_tua: namaOrangTua,
            no_telepon_orang_tua: noTeleponOrangTua,
            pendidikan: pesertaSource.pendidikan || null,
            pekerjaan: pekerjaan,
            status_pernikahan: statusPernikahan,
          },
          update: {
            nama_lengkap: namaPeserta,
            no_telepon: noHpPeserta ?? undefined,
            jenis_kelamin: pesertaSource.jenis_kelamin || client.jenis_kelamin || undefined,
            tempat_lahir: pesertaSource.tempat_lahir || undefined,
            tanggal_lahir: pesertaSource.tanggal_lahir ? new Date(pesertaSource.tanggal_lahir) : undefined,
            usia: usiaPeserta ?? undefined,
            kategori_peserta: kategoriOtomatis || undefined,
            nama_orang_tua: namaOrangTua,
            no_telepon_orang_tua: noTeleponOrangTua,
            pendidikan: pesertaSource.pendidikan || undefined,
            pekerjaan: pekerjaan,
            status_pernikahan: statusPernikahan,
          },
        }).catch(() => { })
      }

      // 6. Simpan butir jawaban ke tabel jawaban_psikotes jika soal berasal dari database asli
      if (jawabanToInsert.length > 0) {
        const isRealDbQuestions = paket.soal_psikotes.some(
          (s) => s.id === jawabanToInsert[0].id_soal_psikotes && !s.id.includes('-q-')
        )

        if (isRealDbQuestions) {
          await tx.jawabanPsikotes.deleteMany({
            where: { id_booking: booking.id },
          })

          await tx.jawabanPsikotes.createMany({
            data: jawabanToInsert.map((j) => ({
              id_booking: booking.id,
              id_soal_psikotes: j.id_soal_psikotes,
              id_pilihan_jawaban: j.id_pilihan_jawaban,
              skor: j.skor,
            })),
          })
        }
      }

      // 7. Simpan hasil penilaian akhir ke tabel hasil_tes (upsert agar tidak terjadi duplicate key)
      const detailSkorPayload = calculationResult || {
        total_soal: paket.soal_psikotes.length,
        soal_dijawab: jawabanToInsert.length,
      }

      const hasilTes = await tx.hasilTes.upsert({
        where: { id_booking: booking.id },
        create: {
          id_booking: booking.id,
          id_interpretasi: matchedInterpretasi?.id || null,
          total_skor: totalSkor,
          detail_skor: detailSkorPayload,
          snapshot_jawaban: input.jawaban as any,
        },
        update: {
          id_interpretasi: matchedInterpretasi?.id || null,
          total_skor: totalSkor,
          detail_skor: detailSkorPayload,
          snapshot_jawaban: input.jawaban as any,
          tanggal_selesai: new Date(),
        },
        include: {
          interpretasi: true,
        },
      })

      // 7b. Tandai status pengerjaan tiket/booking (MENUNGGU_REVIEW jika tes klinis, SELESAI jika tes biasa)
      await tx.bookingPsikotes.update({
        where: { id: booking.id },
        data: {
          status_pengerjaan: targetStatusPengerjaan,
        },
      }).catch(() => { })

      return {
        id_booking: booking.id,
        status_pengerjaan: targetStatusPengerjaan,
        access_token: createHasilAccessToken(booking.id),
        id_paket: paket.id,
        judul_paket: paket.judul,
        client: {
          id: client.id,
          nama: client.nama,
          no_telepon: client.no_telepon,
        },
        peserta: {
          nama_lengkap: namaPeserta,
          no_telepon: noHpPeserta,
          usia: usiaPeserta,
          jenis_kelamin: pesertaSource.jenis_kelamin || client.jenis_kelamin || null,
          kategori_peserta: kategoriOtomatis,
        },
        total_skor: totalSkor,
        detail_skor: detailSkorPayload,
        hasil: {
          id: hasilTes.id,
          grade: matchedInterpretasi.grade,
          judul: matchedInterpretasi.judul,
          deskripsi: matchedInterpretasi.deskripsi,
          tanggal_selesai: hasilTes.tanggal_selesai,
        },
      }
    }, { maxWait: 10000, timeout: 25000 })
  }

}
