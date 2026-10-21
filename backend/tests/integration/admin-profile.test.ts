import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '../../src/app'

describe('Admin Utama Profile API (/admin/profile)', () => {
  let adminToken: string
  let nonAdminToken: string

  beforeAll(async () => {
    await app.ready()

    // Login as Admin Utama (from seed)
    const adminLoginRes = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'admin@empathika.test',
        password: 'Admin123!',
      },
    })
    const adminLoginBody = JSON.parse(adminLoginRes.body)
    if (adminLoginBody.data?.accessToken) {
      adminToken = adminLoginBody.data.accessToken
    }

    // Login as Biro (non-admin)
    const biroLoginRes = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'biro@cendekiamuda.org',
        password: 'Biro123!',
      },
    })
    const biroLoginBody = JSON.parse(biroLoginRes.body)
    if (biroLoginBody.data?.accessToken) {
      nonAdminToken = biroLoginBody.data.accessToken
    }
  })

  afterAll(async () => {
    await app.close()
  })

  it('1. GET /admin/profile/public should return public contact & location without authentication', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/admin/profile/public',
    })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
    expect(body.data).toHaveProperty('alamat')
    expect(body.data).toHaveProperty('link_maps')
    expect(body.data).toHaveProperty('email')
    expect(body.data).toHaveProperty('no_telepon')
  })

  it('2. GET /admin/profile should return 401 when called without token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/admin/profile',
    })
    expect(res.statusCode).toBe(401)
  })

  it('3. PUT /admin/profile should return 401 when called without token', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: '/admin/profile',
      payload: {
        alamat: 'Jl. Uji Coba No. 1',
      },
    })
    expect(res.statusCode).toBe(401)
  })

  it('4. PUT /admin/profile should return 403 when called by non-admin role', async () => {
    if (!nonAdminToken) return

    const res = await app.inject({
      method: 'PUT',
      url: '/admin/profile',
      headers: {
        authorization: `Bearer ${nonAdminToken}`,
      },
      payload: {
        alamat: 'Jl. Ilegal No. 99',
      },
    })
    expect(res.statusCode).toBe(403)
  })

  it('5. GET /admin/profile should return admin data when authenticated as Admin Utama', async () => {
    if (!adminToken) return

    const res = await app.inject({
      method: 'GET',
      url: '/admin/profile',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    })
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.success).toBe(true)
    expect(body.data.role).toBe('ADMIN')
  })

  it('6. PUT /admin/profile should allow Admin Utama to update contact and location', async () => {
    if (!adminToken) return

    const testAlamat = 'Jl. Cikutra No.312, Neglasari, Kec. Cibeunying Kaler, Kota Bandung, Jawa Barat 41024'
    const testMaps = 'https://maps.app.goo.gl/4VJEM2aoFPAUSC4s7?g_st=iw'
    const testTelp = '0878-7878-5498'

    const res = await app.inject({
      method: 'PUT',
      url: '/admin/profile',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {
        nama: 'Admin Utama Empathika',
        noTelepon: testTelp,
        alamat: testAlamat,
        linkMaps: testMaps,
        bio: 'Pengelola platform Empathika',
      },
    })

    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.success).toBe(true)
    expect(body.data.alamat).toBe(testAlamat)
    expect(body.data.link_maps).toBe(testMaps)
    expect(body.data.no_telepon).toBe(testTelp)

    // Verify public endpoint reflects the update
    const publicRes = await app.inject({
      method: 'GET',
      url: '/admin/profile/public',
    })
    expect(publicRes.statusCode).toBe(200)
    const publicBody = JSON.parse(publicRes.body)
    expect(publicBody.data.alamat).toBe(testAlamat)
    expect(publicBody.data.link_maps).toBe(testMaps)
    expect(publicBody.data.no_telepon).toBe(testTelp)
  })
})
