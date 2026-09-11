// Midtrans SDK wrapper
// Install: pnpm add midtrans-client

interface MidtransConfig {
  serverKey: string
  isProduction: boolean
}

export function createMidtransClient(config: MidtransConfig) {
  // TODO: import dan inisiasi Midtrans SDK
  // const snap = new midtransClient.Snap({ isProduction: config.isProduction, serverKey: config.serverKey })
  return {
    createTransaction: async (params: unknown) => {
      // return snap.createTransaction(params)
      throw new Error('Midtrans belum diimplementasikan')
    },
  }
}
