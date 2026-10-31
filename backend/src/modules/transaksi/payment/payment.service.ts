import { env } from '../../../config/env'

export interface CreateInvoiceParams {
  externalId: string // ID Transaksi atau Kode Transaksi unik
  amount: number
  payerEmail?: string
  description: string
  customer?: {
    given_names?: string
    email?: string
    mobile_number?: string
  }
  customerNotificationPreference?: {
    invoice_created?: string[]
    invoice_reminder?: string[]
    invoice_paid?: string[]
    invoice_expired?: string[]
  }
  paymentMethods?: string[]
  successRedirectUrl?: string
  failureRedirectUrl?: string
}

export interface XenditInvoiceResponse {
  id: string
  external_id: string
  user_id?: string
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED'
  merchant_name: string
  amount: number
  payer_email?: string
  description: string
  invoice_url: string
  expiry_date: string
  payment_method?: string
  payment_channel?: string
  payment_destination?: string
  paid_at?: string
  created: string
  updated: string
  currency?: string
}

export const paymentService = {
  /**
   * Mengirim request pembuatan invoice ke Xendit v2 Invoice API
   */
  createInvoice: async (params: CreateInvoiceParams): Promise<XenditInvoiceResponse> => {
    const secretKey = env.XENDIT_SECRET_KEY

    // Jika secret key belum di-set di .env (misalnya di mode dev/lokal offline),
    // berikan mock invoice URL agar pengujian frontend tetap berjalan lancar tanpa crash
    if (!secretKey) {
      console.warn('[Xendit] XENDIT_SECRET_KEY belum diisi di .env. Mengembalikan invoice mock untuk development.')
      const fallbackUrl = `${env.FRONTEND_URL || 'http://localhost:3000'}/checkout/${encodeURIComponent(params.externalId)}?simulated=true`
      return {
        id: `mock-inv-${Date.now()}`,
        external_id: params.externalId,
        status: 'PENDING',
        merchant_name: 'Empathika Indonesia',
        amount: params.amount,
        payer_email: params.payerEmail,
        description: params.description,
        invoice_url: fallbackUrl,
        expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        currency: 'IDR',
      }
    }

    // Basic Auth Xendit: format Base64 dari "${secretKey}:"
    const basicAuth = Buffer.from(`${secretKey}:`).toString('base64')

    const bodyPayload: Record<string, unknown> = {
      external_id: params.externalId,
      amount: Math.round(params.amount),
      description: params.description,
      invoice_duration: 86400, // 24 jam dalam detik
      currency: 'IDR',
    }

    if (params.payerEmail) {
      bodyPayload.payer_email = params.payerEmail
    }

    if (params.customer) {
      bodyPayload.customer = params.customer
    }

    if (params.customerNotificationPreference) {
      bodyPayload.customer_notification_preference = params.customerNotificationPreference
    }

    if (params.paymentMethods && params.paymentMethods.length > 0) {
      bodyPayload.payment_methods = params.paymentMethods
    }

    if (params.successRedirectUrl) {
      bodyPayload.success_redirect_url = params.successRedirectUrl
    }

    if (params.failureRedirectUrl) {
      bodyPayload.failure_redirect_url = params.failureRedirectUrl
    }

    const response = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify(bodyPayload),
    })

    if (!response.ok) {
      const errBody = await response.text()
      let parsedErr: any
      try {
        parsedErr = JSON.parse(errBody)
      } catch {
        parsedErr = errBody
      }
      console.error('[Xendit API Error]:', parsedErr)
      throw Object.assign(
        new Error(parsedErr?.message || 'Gagal membuat tagihan pembayaran Xendit'),
        { statusCode: response.status, details: parsedErr }
      )
    }

    const data = (await response.json()) as XenditInvoiceResponse
    return data
  },

  /**
   * Inisiasi transaksi umum (kompatibilitas layer sebelumnya)
   */
  initiate: async (input: { transaksiId: string; amount: number; method: string }): Promise<string> => {
    const inv = await paymentService.createInvoice({
      externalId: input.transaksiId,
      amount: input.amount,
      description: `Pembayaran Transaksi #${input.transaksiId}`,
    })
    return inv.invoice_url
  },

  /**
   * Verifikasi callback token dari Xendit (x-callback-token header)
   */
  verifyWebhookSignature: (callbackTokenHeader?: string): boolean => {
    const expectedToken = env.XENDIT_WEBHOOK_TOKEN
    // Jika belum diset di .env dev, izinkan lewat dengan warning
    if (!expectedToken) {
      return true
    }
    return callbackTokenHeader === expectedToken
  },
}
