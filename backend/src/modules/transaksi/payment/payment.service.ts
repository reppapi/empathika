// Payment Gateway abstraction layer
// Ganti implementasi di sini kalau pindah dari Midtrans ke Xendit/dll

interface PaymentInitInput {
  transaksiId: string
  amount: number
  method: string
}

export const paymentService = {
  initiate: async (input: PaymentInitInput): Promise<string> => {
    // TODO: Implementasi Midtrans/Xendit SDK
    // Return URL redirect ke halaman pembayaran
    console.log('Initiating payment:', input)
    return https://payment-gateway.example.com/pay/
  },

  verifyWebhookSignature: (payload: unknown, signature: string): boolean => {
    // TODO: Verifikasi HMAC signature dari payment gateway
    return true
  },
}
