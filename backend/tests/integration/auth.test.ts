import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '../../src/app'

describe('POST /auth/login', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 401 for invalid credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'test@test.com', password: 'wrongpassword' },
    })
    expect(response.statusCode).toBe(401)
  })
})

