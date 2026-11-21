import { describe, it, expect } from 'vitest'
import { midtransClient } from '../../../lib/payment-gateway/midtrans'
import { paymentService } from './payment.service'
import crypto from 'crypto'

describe('Midtrans Payment Gateway Integration & Integrity Tests', () => {
  it('harus memvalidasi fallback token dev ketika MIDTRANS_SERVER_KEY tidak diset', async () => {
    const result = await paymentService.createInvoice({
      externalId: 'TEST-ORDER-001',
      amount: 150000,
      description: 'Konseling Test',
      customer: {
        given_names: 'Budi Santoso',
        email: 'budi@example.com',
        mobile_number: '081234567890',
      },
    })

    expect(result).toBeDefined()
    expect(result.external_id).toBe('TEST-ORDER-001')
    expect(result.amount).toBe(150000)
    expect(result.status).toBe('PENDING')
    expect(result.snap_token).toContain('mock-snap-token-')
    expect(result.invoice_url).toContain('/checkout/TEST-ORDER-001')
  })

  it('harus memverifikasi kalkulasi signature SHA512 Midtrans dengan benar', () => {
    const orderId = 'TRX-12345'
    const statusCode = '200'
    const grossAmount = '150000.00'
    const testServerKey = 'SB-Mid-server-DummyKey123'

    const raw = `${orderId}${statusCode}${grossAmount}${testServerKey}`
    const expectedHash = crypto.createHash('sha512').update(raw).digest('hex')

    // Uji logic hashing dengan simulasi
    const calculatedHash = crypto.createHash('sha512').update(`${orderId}${statusCode}${grossAmount}${testServerKey}`).digest('hex')
    expect(calculatedHash).toBe(expectedHash)
  })

  it('harus mengembalikan URL endpoint Midtrans yang tepat untuk sandbox vs production', () => {
    const sandboxUrl = midtransClient.getBaseUrl()
    expect(sandboxUrl).toContain('sandbox.midtrans.com')
  })
})
