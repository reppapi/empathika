import crypto from 'crypto'
import { env } from '../../config/env'

export interface MidtransTransactionDetails {
  order_id: string
  gross_amount: number
}

export interface MidtransCustomerDetails {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
}

export interface MidtransItemDetails {
  id: string
  price: number
  quantity: number
  name: string
}

export interface CreateSnapTransactionParams {
  orderId: string
  amount: number
  customer?: {
    name?: string
    email?: string
    phone?: string
  }
  itemDetails?: MidtransItemDetails[]
  callbacks?: {
    finish?: string
    error?: string
    pending?: string
  }
  paymentMethods?: string[]
}

export interface MidtransSnapResponse {
  token: string
  redirect_url: string
}

export interface MidtransWebhookPayload {
  transaction_time?: string
  transaction_status: string
  transaction_id: string
  status_message?: string
  status_code: string
  signature_key: string
  payment_type: string
  order_id: string
  gross_amount: string
  fraud_status?: string
  currency?: string
  settlement_time?: string
  va_numbers?: Array<{ bank: string; va_number: string }>
  payment_amounts?: Array<{ amount: string; paid_at: string }>
  [key: string]: any
}

export const midtransClient = {
  isProduction: (): boolean => env.MIDTRANS_IS_PRODUCTION === 'true',

  getBaseUrl: (): string => {
    return midtransClient.isProduction()
      ? 'https://app.midtrans.com/snap/v1'
      : 'https://app.sandbox.midtrans.com/snap/v1'
  },

  getSnapJsUrl: (): string => {
    return midtransClient.isProduction()
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'
  },

  /**
   * Membuat Snap Transaction Token & Redirect URL
   */
  createTransaction: async (params: CreateSnapTransactionParams): Promise<MidtransSnapResponse> => {
    const serverKey = env.MIDTRANS_SERVER_KEY

    // Fallback Mock jika MIDTRANS_SERVER_KEY belum diisi di .env
    if (!serverKey) {
      console.warn('[Midtrans] MIDTRANS_SERVER_KEY belum diisi di .env. Mengembalikan Snap token mock untuk development.')
      const fallbackUrl = `${env.FRONTEND_URL || 'http://localhost:3000'}/checkout/${encodeURIComponent(params.orderId)}?simulated=true`
      return {
        token: `mock-snap-token-${Date.now()}`,
        redirect_url: fallbackUrl,
      }
    }

    const authString = Buffer.from(`${serverKey}:`).toString('base64')

    // Pecah nama menjadi first & last name jika ada
    const nameParts = (params.customer?.name || '').trim().split(' ')
    const firstName = nameParts[0] || 'Klien'
    const lastName = nameParts.slice(1).join(' ') || undefined

    const bodyPayload = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: Math.round(params.amount),
      },
      customer_details: {
        first_name: firstName,
        ...(lastName && { last_name: lastName }),
        email: params.customer?.email || undefined,
        phone: params.customer?.phone || undefined,
      },
      ...(params.itemDetails && params.itemDetails.length > 0 && {
        item_details: params.itemDetails,
      }),
      callbacks: {
        finish: params.callbacks?.finish || `${env.FRONTEND_URL}/konseling/success?orderId=${params.orderId}&status=success`,
        error: params.callbacks?.error || `${env.FRONTEND_URL}/konseling/bayar?orderId=${params.orderId}&status=failed`,
        pending: params.callbacks?.pending || `${env.FRONTEND_URL}/konseling/pending?orderId=${params.orderId}&status=pending`,
      },
    }

    const response = await fetch(`${midtransClient.getBaseUrl()}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${authString}`,
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
      console.error('[Midtrans Snap API Error]:', parsedErr)
      throw Object.assign(
        new Error(parsedErr?.error_messages?.[0] || 'Gagal membuat transaksi pembayaran Midtrans'),
        { statusCode: response.status, details: parsedErr }
      )
    }

    const data = (await response.json()) as MidtransSnapResponse
    return data
  },

  /**
   * Verifikasi signature notifikasi webhook Midtrans:
   * SHA512(order_id + status_code + gross_amount + ServerKey)
   */
  verifySignature: (payload: MidtransWebhookPayload): boolean => {
    const serverKey = env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      // Jika di local env belum diset, bypass untuk kemudahan dev
      return true
    }

    const { order_id, status_code, gross_amount, signature_key } = payload
    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return false
    }

    const raw = `${order_id}${status_code}${gross_amount}${serverKey}`
    const expectedSignature = crypto.createHash('sha512').update(raw).digest('hex')

    return signature_key.toLowerCase() === expectedSignature.toLowerCase()
  },
}
