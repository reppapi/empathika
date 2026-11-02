import type { FastifyInstance } from 'fastify'
import { DokumentasiRepository } from './dokumentasi.repository'
import type {
  CreateDokumentasiInput,
  UpdateDokumentasiInput,
  DokumentasiQueryInput,
} from './dokumentasi.schema'
import { deleteUploadedFile } from '../../utils/file-storage'

export class DokumentasiService {
  private repo: DokumentasiRepository

  constructor(fastify: FastifyInstance) {
    this.repo = new DokumentasiRepository(fastify.prisma)
  }

  async getAll(query?: DokumentasiQueryInput) {
    return this.repo.findAll(query)
  }

  async getById(id: string) {
    const item = await this.repo.findById(id)
    if (!item) {
      throw Object.assign(new Error('Dokumentasi event tidak ditemukan'), { statusCode: 404 })
    }
    return item
  }

  async create(data: CreateDokumentasiInput) {
    if (data.foto && data.foto.length > 10) {
      throw Object.assign(new Error('Maksimal foto dokumentasi adalah 10 foto'), {
        statusCode: 400,
      })
    }
    return this.repo.create(data)
  }

  async update(id: string, data: UpdateDokumentasiInput) {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw Object.assign(new Error('Dokumentasi event tidak ditemukan'), { statusCode: 404 })
    }

    if (data.foto && data.foto.length > 10) {
      throw Object.assign(new Error('Maksimal foto dokumentasi adalah 10 foto'), {
        statusCode: 400,
      })
    }

    // Jika foto diperbarui, cari foto lama yang tidak ada di daftar foto baru lalu hapus file fisiknya
    if (data.foto !== undefined) {
      const newUrls = new Set(data.foto.map((f) => f.foto_url))
      const removedPhotos = existing.foto.filter((f) => !newUrls.has(f.foto_url))
      for (const p of removedPhotos) {
        deleteUploadedFile(p.foto_url)
      }
    }

    return this.repo.update(id, data)
  }

  async delete(id: string) {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw Object.assign(new Error('Dokumentasi event tidak ditemukan'), { statusCode: 404 })
    }

    // Hapus data dari DB
    const deleted = await this.repo.delete(id)

    // Hapus semua file foto fisik terkait dari storage
    for (const f of existing.foto) {
      deleteUploadedFile(f.foto_url)
    }

    return deleted
  }
}

