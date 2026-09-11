// Handler khusus E-Wallet (GoPay, OVO, Dana)
export const ewalletHandler = {
  create: async (params: { transaksiId: string; amount: number; wallet: string }) => {
    // TODO: Call Midtrans E-Wallet API
    return { qr_code_url: '', deeplink_url: '' }
  },
}
