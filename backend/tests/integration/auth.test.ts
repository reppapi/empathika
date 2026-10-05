import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '../../src/app'

describe('GET /auth/me', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 without auth token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
    })
    expect(response.statusCode).toBe(401)
  })
})
