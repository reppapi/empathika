import { midtransClient, CreateSnapTransactionParams, MidtransSnapResponse } from '../../../lib/payment-gateway/midtrans'

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
  paymentMethods?: string[]
  successRedirectUrl?: string
  failureRedirectUrl?: string
}

export interface PaymentGatewayResponse {
  id: string
  external_id: string
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED'
  amount: number
  invoice_url: string
  snap_token?: string
  expiry_date?: string
}

export const paymentService = {
  /**
   * Membuat tagihan transaksi melalui Midtrans Snap API.
   * Tetap mengembalikan interface kompatibel (invoice_url & snap_token)
   * agar tidak merusak modul atau frontend yang sudah ada.
   */
  createInvoice: async (params: CreateInvoiceParams): Promise<PaymentGatewayResponse> => {
    const snapParams: CreateSnapTransactionParams = {
      orderId: params.externalId,
      amount: params.amount,
      customer: {
        name: params.customer?.given_names,
        email: params.customer?.email || params.payerEmail,
        phone: params.customer?.mobile_number,
      },
      itemDetails: [
        {
          id: params.externalId,
          price: Math.round(params.amount),
          quantity: 1,
          name: (params.description || 'Layanan Empathika').slice(0, 50),
        },
      ],
      callbacks: {
        finish: params.successRedirectUrl,
        error: params.failureRedirectUrl,
      },
      paymentMethods: params.paymentMethods,
    }

    const snap = await midtransClient.createTransaction(snapParams)

    return {
      id: snap.token,
      external_id: params.externalId,
      status: 'PENDING',
      amount: params.amount,
      invoice_url: snap.redirect_url,
      snap_token: snap.token,
    }
  },

  /**
   * Inisiasi transaksi umum
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
   * Verifikasi signature notifikasi webhook Midtrans
   */
  verifyWebhookSignature: (payload: any): boolean => {
    return midtransClient.verifySignature(payload)
  },
}
