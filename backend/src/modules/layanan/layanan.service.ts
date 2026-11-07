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
    if (clean === '02' || clean === 'PSIKOTES') return 'PSIKOTES'
    if (clean === '03' || clean === 'WORKSHOP') return 'WORKSHOP'
    if (clean === '04' || clean === 'SEMINAR') return 'SEMINAR'
    if (clean === '05' || clean === 'ASESMEN') return 'ASESMEN'
    if (clean === 'PELATIHAN_PEER_HELPER') return 'PELATIHAN_PEER_HELPER'
    if (clean === 'EVENT') return 'EVENT'
    return 'KONSULTASI'
  }

  private normalizeAktif(aktif?: boolean | string, status?: string): boolean {
    if (typeof aktif === 'boolean') return aktif
    if (typeof aktif === 'string') return aktif.toLowerCase() === 'aktif' || aktif.toLowerCase() === 'true'
    if (status) return status.toLowerCase() === 'aktif'
    return true
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
    return this.repo.findAll(queryParams)
  }

  async getById(id: string) {
    const item = await this.repo.findById(id)
    if (!item) throw Object.assign(new Error('Layanan tidak ditemukan'), { statusCode: 404 })
    return item
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
    const tarifTenagaAhli = input.tarif_tenaga_ahli || null

    // Jika kategori Konsultasi dan ada tarif_tenaga_ahli, fallback harga umum ke tarif psikolog
    if (tarifTenagaAhli && typeof tarifTenagaAhli === 'object') {
      const psi = (tarifTenagaAhli as any).psikolog
      if (psi) {
        if (!hargaWeekday && psi.weekday) hargaWeekday = Number(psi.weekday)
        if (!hargaWeekend && psi.weekend) hargaWeekend = Number(psi.weekend)
      }
    }

    const bannerUrl = input.banner_url || input.bannerUrl || null
    const aktif = this.normalizeAktif(input.aktif, input.status)

    const createData: Prisma.LayananCreateInput = {
      nama,
      kategori,
      metode,
      deskripsi,
      harga_weekday: hargaWeekday,
      harga_weekend: hargaWeekend,
      tarif_tenaga_ahli: tarifTenagaAhli as any,
      banner_url: bannerUrl,
      aktif,
    }

    return this.repo.create(createData)
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
      updateData.tarif_tenaga_ahli = input.tarif_tenaga_ahli as any

      // Jika ada tarif_tenaga_ahli psikolog, sinkronkan juga harga_weekday/weekend utama
      if (input.tarif_tenaga_ahli && typeof input.tarif_tenaga_ahli === 'object') {
        const psi = (input.tarif_tenaga_ahli as any).psikolog
        if (psi) {
          if (psi.weekday && updateData.harga_weekday === undefined) updateData.harga_weekday = Number(psi.weekday)
          if (psi.weekend && updateData.harga_weekend === undefined) updateData.harga_weekend = Number(psi.weekend)
        }
      }
    }

    if (input.banner_url !== undefined || input.bannerUrl !== undefined) {
      updateData.banner_url = input.banner_url ?? input.bannerUrl ?? null
    }

    if (input.aktif !== undefined || input.status !== undefined) {
      updateData.aktif = this.normalizeAktif(input.aktif, input.status)
    }

    return this.repo.update(id, updateData)
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
