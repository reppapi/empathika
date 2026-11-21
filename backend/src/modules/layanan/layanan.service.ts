import type { FastifyInstance } from 'fastify'
import { LayananRepository } from './layanan.repository'
import type { CreateLayananInput, UpdateLayananInput } from './layanan.schema'
import type { KategoriLayanan, Prisma } from '@prisma/client'

export class LayananService {
  private repo: LayananRepository

  constructor(fastify: FastifyInstance) {
    this.repo = new LayananRepository(fastify.prisma)
  }

  private normalizeKategori(val?: string): KategoriLayanan {
    if (!val) return 'KONSULTASI'
    const clean = val.toUpperCase().trim()
    if (clean === '01' || clean === 'KONSULTASI') return 'KONSULTASI'
    if (clean === '03' || clean === 'WORKSHOP') return 'WORKSHOP'
    if (clean === '04' || clean === 'SEMINAR') return 'SEMINAR'
    if (clean === '05' || clean === 'ASESMEN') return 'ASESMEN'
    return 'KONSULTASI'
  }

  private normalizeAktif(aktif?: boolean | string, status?: string): boolean {
    if (typeof aktif === 'boolean') return aktif
    if (typeof aktif === 'string') return aktif.toLowerCase() === 'aktif' || aktif.toLowerCase() === 'true'
    if (status) return status.toLowerCase() === 'aktif'
    return true
  }

  private async ensureDefaultPartnershipServices() {
    try {
      const kCount = await this.repo.countByKategori('KONSULTASI')
      if (kCount === 0) {
        await this.repo.create({
          nama: 'Konsultasi Individu',
          kategori: 'KONSULTASI',
          metode: 'Online/Offline',
          deskripsi: 'Sesi konsultasi psikologi privat secara one-on-one untuk membantu mengatasi kecemasan, stres, trauma, serta pengembangan potensi diri baik secara online maupun offline.',
          harga_weekday: 150000,
          harga_weekend: 200000,
          tarif_tenaga_ahli: {
            psikolog: { weekday: '150.000', weekend: '200.000' },
            konselor: { weekday: '100.000', weekend: '150.000' },
            peer: { weekday: '50.000', weekend: '75.000' },
          },
          aktif: true,
        })
      }

      const wsCount = await this.repo.countByKategori('WORKSHOP')
      if (wsCount === 0) {
        await this.repo.create({
          nama: 'Workshop SEFT',
          kategori: 'WORKSHOP',
          metode: 'Online/Offline',
          deskripsi: `Workshop SEFT (Spiritual Emotional Freedom Technique) adalah program pengembangan diri dan terapi emosi yang membantu peserta mengelola emosi, meredakan stres, serta melepaskan beban batin secara mendalam melalui teknik yang mengintegrasikan psikologi energi, relaksasi emosi, dan pendekatan spiritualitas yang menenangkan.\n\nWorkshop ini dirancang secara praktis, aplikatif, dan interaktif. Peserta tidak hanya memahami konsep teoretis dan mengalami proses pelepasan emosi secara langsung, tetapi juga dilatih langkah demi langkah teknik SEFT agar dapat mempraktikkannya secara mandiri di rumah maupun lingkungan kerja. Seluruh sesi dipandu langsung oleh fasilitator berpengalaman dengan pendekatan yang empatik, aman, privat, serta menjunjung tinggi kode etik profesional.`,
          harga_weekday: 0,
          harga_weekend: 0,
          banner_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          tarif_tenaga_ahli: {
            foto_kegiatan: [
              'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            ],
          },
          aktif: true,
        })

        await this.repo.create({
          nama: 'Pelatihan & Workshop Konselor Sebaya',
          kategori: 'WORKSHOP',
          metode: 'Online/Offline',
          deskripsi: `Program pelatihan pembekalan komprehensif bagi siswa, mahasiswa, pendidik, dan komunitas untuk mengasah kepekaan sosial, keterampilan komunikasi suportif, serta kemampuan menjadi pendengar aktif dan konselor sebaya (peer helper) yang empatik tanpa menghakimi.\n\nPelatihan ini mengombinasikan pemahaman teori dasar konseling, studi kasus riil, role-play komunikasi, dan simulasi pendampingan teman sebaya. Peserta dibimbing langsung oleh psikolog profesional agar memiliki kesiapan mental, empati yang terarah, dan rasa tanggung jawab dalam mendampingi rekan di lingkungannya.`,
          harga_weekday: 0,
          harga_weekend: 0,
          banner_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          tarif_tenaga_ahli: {
            foto_kegiatan: [
              'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            ],
          },
          aktif: true,
        })
      }

      const smCount = await this.repo.countByKategori('SEMINAR')
      if (smCount === 0) {
        await this.repo.create({
          nama: 'Seminar Empathika',
          kategori: 'SEMINAR',
          metode: 'Online/Offline',
          deskripsi: `Empathika menyelenggarakan program seminar sebagai ruang edukatif dan reflektif untuk meningkatkan pemahaman psikologis serta kesadaran diri dalam menghadapi berbagai dinamika kehidupan, baik personal, keluarga, maupun profesional.\n\nProgram dirancang secara interaktif dan aplikatif dengan materi yang mudah dipahami, memadukan psikoedukasi dengan sesi reflektif dan healing (SEFT) agar peserta dapat mengenali serta melepaskan beban emosional secara lebih mendalam.`,
          harga_weekday: 0,
          harga_weekend: 0,
          banner_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          tarif_tenaga_ahli: {
            foto_kegiatan: [
              'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            ],
          },
          aktif: true,
        })
      }
      const asCount = await this.repo.countByKategori('ASESMEN')
      if (asCount === 0) {
        await this.repo.create({
          nama: 'Asesmen Minat Bakat',
          kategori: 'ASESMEN',
          metode: 'Online/Offline',
          deskripsi: 'Pemetaan komprehensif potensi akademik, kecenderungan minat karir, dan profil bakat individu bersama tim profesional Empathika.',
          harga_weekday: 400000,
          harga_weekend: 500000,
          tarif_tenaga_ahli: {
            asesmen: {
              online: 350000,
              offline: { weekday: 400000, weekend: 500000 },
            },
          },
          aktif: true,
        })
      }
    } catch (e) {
      // Ignored if db not connected or migration in progress
    }
  }

  public enrichLayanan(item: any) {
    if (!item) return item
    const isKonsultasi = (item.kategori || '').toUpperCase() === 'KONSULTASI'
    const profesiTersedia: string[] = []

    if (isKonsultasi) {
      const t = item.tarif_tenaga_ahli
      if (t && typeof t === 'object') {
        const psi = t.psikolog
        const kon = t.konselor
        const peer = t.peer

        const hasPsi = psi && (Number(psi.weekday) > 0 || Number(psi.weekend) > 0)
        const hasKon = kon && (Number(kon.weekday) > 0 || Number(kon.weekend) > 0)
        const hasPeer = peer && (Number(peer.weekday) > 0 || Number(peer.weekend) > 0)

        if (hasPsi) profesiTersedia.push('psikolog')
        if (hasKon) profesiTersedia.push('konselor')
        if (hasPeer) profesiTersedia.push('peer')
      }

      // Fallback jika belum diatur di tarif_tenaga_ahli namun harga weekday/weekend utama ada
      if (
        profesiTersedia.length === 0 &&
        (Number(item.harga_weekday) > 0 || Number(item.harga_weekend) > 0)
      ) {
        profesiTersedia.push('psikolog')
      }
    }

    return {
      ...item,
      profesi_tersedia: profesiTersedia,
      kategori_tenaga_tersedia: profesiTersedia,
    }
  }

  async getAll(params?: Record<string, unknown>) {
    const queryParams: { kategori?: string; aktif?: boolean; search?: string } = {}
    if (params?.kategori && typeof params.kategori === 'string') {
      queryParams.kategori = this.normalizeKategori(params.kategori)
    }
    if (params?.aktif !== undefined) {
      queryParams.aktif = params.aktif === 'true' || params.aktif === true
    }
    if (params?.search && typeof params.search === 'string') {
      queryParams.search = params.search
    }
    const items = await this.repo.findAll(queryParams)
    let enriched = items.map((item) => this.enrichLayanan(item))

    // Filter dinamis berdasarkan kategori tenaga ahli jika ada parameter query
    const targetKategoriTenaga = (
      params?.kategori_tenaga ||
      params?.kategoriTenaga ||
      params?.profesi
    )
    if (targetKategoriTenaga && typeof targetKategoriTenaga === 'string') {
      const cleanTarget = targetKategoriTenaga.toLowerCase().replace('-konselor', '').trim()
      enriched = enriched.filter((item) => {
        if (item.kategori !== 'KONSULTASI') return true
        const profesiList = item.profesi_tersedia || []
        return profesiList.includes(cleanTarget)
      })
    }

    return enriched
  }

  async getById(id: string) {
    const item = await this.repo.findById(id)
    if (!item) throw Object.assign(new Error('Layanan tidak ditemukan'), { statusCode: 404 })
    return this.enrichLayanan(item)
  }

  async create(input: CreateLayananInput) {
    const nama = (input.nama || input.layanan || '').trim()
    if (!nama) {
      throw Object.assign(new Error('Nama layanan wajib diisi'), { statusCode: 400 })
    }

    const existing = await this.repo.findByNama(nama)
    if (existing) {
      throw Object.assign(new Error(`Layanan dengan nama "${nama}" sudah terdaftar`), { statusCode: 409 })
    }

    const kategori = this.normalizeKategori(input.kategori || input.kategoriId)
    const metode = input.metode?.trim() || 'Online/Offline'
    const deskripsi = input.deskripsi?.trim() || ''
    let hargaWeekday = input.harga_weekday !== undefined ? input.harga_weekday : (input.weekday !== undefined ? input.weekday : 0)
    let hargaWeekend = input.harga_weekend !== undefined ? input.harga_weekend : (input.weekend !== undefined ? input.weekend : 0)
    let tarifTenagaAhli: any = input.tarif_tenaga_ahli || null
    if (input.foto_kegiatan && input.foto_kegiatan.length > 0) {
      tarifTenagaAhli = tarifTenagaAhli && typeof tarifTenagaAhli === 'object' ? { ...tarifTenagaAhli } : {}
      tarifTenagaAhli.foto_kegiatan = input.foto_kegiatan
    }
    if (input.manfaat !== undefined) {
      tarifTenagaAhli = tarifTenagaAhli && typeof tarifTenagaAhli === 'object' ? { ...tarifTenagaAhli } : {}
      tarifTenagaAhli.manfaat = input.manfaat
    }

    // Jika kategori Konsultasi dan ada tarif_tenaga_ahli, fallback harga umum ke tarif tenaga ahli pertama yang aktif
    if (tarifTenagaAhli && typeof tarifTenagaAhli === 'object') {
      const psi = (tarifTenagaAhli as any).psikolog
      const kon = (tarifTenagaAhli as any).konselor
      const peer = (tarifTenagaAhli as any).peer
      const firstActive = (psi && (psi.weekday || psi.weekend) ? psi : null) ||
                          (kon && (kon.weekday || kon.weekend) ? kon : null) ||
                          (peer && (peer.weekday || peer.weekend) ? peer : null)
      if (firstActive) {
        if (!hargaWeekday && firstActive.weekday) hargaWeekday = Number(firstActive.weekday)
        if (!hargaWeekend && firstActive.weekend) hargaWeekend = Number(firstActive.weekend)
      }
    }

    let bannerUrl = input.banner_url || input.bannerUrl || null
    if (!bannerUrl && input.foto_kegiatan && input.foto_kegiatan.length > 0) {
      bannerUrl = input.foto_kegiatan[0]
    }
    const aktif = this.normalizeAktif(input.aktif, input.status)

    const createData: Prisma.LayananCreateInput = {
      nama,
      kategori,
      metode,
      deskripsi,
      harga_weekday: hargaWeekday,
      harga_weekend: hargaWeekend,
      banner_url: bannerUrl,
      aktif,
    }

    if (tarifTenagaAhli !== undefined) {
      const dataWithTarif: Record<string, any> = createData
      dataWithTarif.tarif_tenaga_ahli = tarifTenagaAhli
    }

    const created = await this.repo.create(createData)
    return this.enrichLayanan(created)
  }

  async update(id: string, input: UpdateLayananInput) {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw Object.assign(new Error('Layanan tidak ditemukan'), { statusCode: 404 })
    }

    const updateData: Prisma.LayananUpdateInput = {}

    const nama = (input.nama || input.layanan)?.trim()
    if (nama && nama !== existing.nama) {
      const duplicate = await this.repo.findByNama(nama)
      if (duplicate && duplicate.id !== id) {
        throw Object.assign(new Error(`Layanan dengan nama "${nama}" sudah terdaftar`), { statusCode: 409 })
      }
      updateData.nama = nama
    }

    if (input.kategori || input.kategoriId) {
      updateData.kategori = this.normalizeKategori(input.kategori || input.kategoriId)
    }

    if (input.metode !== undefined) {
      updateData.metode = input.metode.trim() || 'Online/Offline'
    }

    if (input.deskripsi !== undefined) {
      updateData.deskripsi = input.deskripsi.trim()
    }

    if (input.harga_weekday !== undefined) {
      updateData.harga_weekday = input.harga_weekday
    } else if (input.weekday !== undefined) {
      updateData.harga_weekday = input.weekday
    }

    if (input.harga_weekend !== undefined) {
      updateData.harga_weekend = input.harga_weekend
    } else if (input.weekend !== undefined) {
      updateData.harga_weekend = input.weekend
    }

    if (input.tarif_tenaga_ahli !== undefined) {
      const dataWithTarif: Record<string, any> = updateData
      dataWithTarif.tarif_tenaga_ahli = input.tarif_tenaga_ahli as any

      // Jika ada tarif_tenaga_ahli, sinkronkan juga harga_weekday/weekend utama dengan tenaga ahli pertama yang aktif
      if (input.tarif_tenaga_ahli && typeof input.tarif_tenaga_ahli === 'object') {
        const psi = (input.tarif_tenaga_ahli as any).psikolog
        const kon = (input.tarif_tenaga_ahli as any).konselor
        const peer = (input.tarif_tenaga_ahli as any).peer
        const firstActive = (psi && (psi.weekday || psi.weekend) ? psi : null) ||
                            (kon && (kon.weekday || kon.weekend) ? kon : null) ||
                            (peer && (peer.weekday || peer.weekend) ? peer : null)
        if (firstActive) {
          if (firstActive.weekday && updateData.harga_weekday === undefined) updateData.harga_weekday = Number(firstActive.weekday)
          if (firstActive.weekend && updateData.harga_weekend === undefined) updateData.harga_weekend = Number(firstActive.weekend)
        }
      }
    }

    if (input.foto_kegiatan !== undefined) {
      const existingTarif = (existing.tarif_tenaga_ahli && typeof existing.tarif_tenaga_ahli === 'object' ? existing.tarif_tenaga_ahli : {}) as any
      const currentTarif = (updateData as any).tarif_tenaga_ahli || existingTarif
      const updatedTarif = { ...currentTarif, foto_kegiatan: input.foto_kegiatan }
      ;(updateData as any).tarif_tenaga_ahli = updatedTarif

      if (input.banner_url === undefined && input.bannerUrl === undefined && input.foto_kegiatan.length > 0) {
        updateData.banner_url = input.foto_kegiatan[0]
      }
    }

    if (input.manfaat !== undefined) {
      const existingTarif = (existing.tarif_tenaga_ahli && typeof existing.tarif_tenaga_ahli === 'object' ? existing.tarif_tenaga_ahli : {}) as any
      const currentTarif = (updateData as any).tarif_tenaga_ahli || existingTarif
      const updatedTarif = { ...currentTarif, manfaat: input.manfaat }
      ;(updateData as any).tarif_tenaga_ahli = updatedTarif
    }

    if (input.banner_url !== undefined || input.bannerUrl !== undefined) {
      updateData.banner_url = input.banner_url ?? input.bannerUrl ?? null
    }

    if (input.aktif !== undefined || input.status !== undefined) {
      updateData.aktif = this.normalizeAktif(input.aktif, input.status)
    }

    const updated = await this.repo.update(id, updateData)
    return this.enrichLayanan(updated)
  }

  async delete(id: string) {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw Object.assign(new Error('Layanan tidak ditemukan'), { statusCode: 404 })
    }

    if ((existing as any)._count && (existing as any)._count.booking_konsultasi > 0) {
      // Soft delete jika sudah ada riwayat booking konsultasi
      return this.repo.update(id, { aktif: false })
    }

    return this.repo.delete(id)
  }
}
