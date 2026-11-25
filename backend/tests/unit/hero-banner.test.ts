import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { AdminService } from '../../src/modules/admin/admin.service'
import { existsSync, unlinkSync } from 'fs'
import { join } from 'path'

describe('Hero Banner Service Unit Tests', () => {
  let mockRepo: any
  let service: AdminService
  const jsonPath = join(process.cwd(), 'data', 'hero-banners.json')

  const cleanupJson = () => {
    try {
      if (existsSync(jsonPath)) unlinkSync(jsonPath)
    } catch {}
  }

  beforeEach(() => {
    cleanupJson()
    mockRepo = {
      getSiteSetting: vi.fn(),
      upsertSiteSetting: vi.fn(),
    }
    // Instantiate AdminService with mock repo and mock Fastify
    service = new AdminService({} as any)
    ;(service as any).repo = mockRepo
  })

  afterAll(() => {
    cleanupJson()
  })

  it('mengembalikan defaultSlide dan array banner kosong jika belum ada data', async () => {
    mockRepo.getSiteSetting.mockResolvedValue(null)

    const res = await service.getHeroBannersPublic()
    expect(res.activeBanners).toEqual([])
    expect(res.defaultSlide.title).toBe(
      'Ruang Aman untuk Pulih Bersama Psikolog Profesional & Terpercaya'
    )
  })

  it('menyaring banner yang nonaktif', async () => {
    mockRepo.getSiteSetting.mockResolvedValue({
      value: {
        promoBanners: [
          {
            id: 'b-1',
            gambar: '/uploads/b1.webp',
            aktif: false,
          },
        ],
      },
    })

    const res = await service.getHeroBannersPublic()
    expect(res.activeBanners).toHaveLength(0)
  })

  it('menyaring banner yang belum mulai atau sudah lewat kadaluarsa', async () => {
    mockRepo.getSiteSetting.mockResolvedValue({
      value: {
        promoBanners: [
          {
            id: 'b-past',
            gambar: '/uploads/past.webp',
            aktif: true,
            tanggalBerakhir: '2020-01-01', // Past date
          },
          {
            id: 'b-future',
            gambar: '/uploads/future.webp',
            aktif: true,
            tanggalMulai: '2099-01-01', // Future date
          },
          {
            id: 'b-valid',
            gambar: '/uploads/valid.webp',
            aktif: true,
            tanggalMulai: '2020-01-01',
            tanggalBerakhir: '2099-12-31',
          },
        ],
      },
    })

    const res = await service.getHeroBannersPublic()
    expect(res.activeBanners).toHaveLength(1)
    expect(res.activeBanners[0].id).toBe('b-valid')
  })

  it('berhasil menyimpan banner dan memanggil upsertSiteSetting', async () => {
    mockRepo.upsertSiteSetting.mockResolvedValue({})

    const payload = {
      promoBanners: [
        {
          id: 'b-new',
          gambar: '/uploads/new.webp',
          linkTujuan: '/event/webinar',
          aktif: true,
        },
      ],
      defaultSlide: {
        title: 'Judul Baru',
        subtitle: 'Subjudul Baru',
        link: '/konseling',
      },
    }

    const res = await service.updateHeroBanners(payload)
    expect(res.promoBanners).toHaveLength(1)
    expect(res.defaultSlide?.title).toBe('Judul Baru')
    expect(mockRepo.upsertSiteSetting).toHaveBeenCalledWith('hero_banners', expect.any(Object))
  })
})
