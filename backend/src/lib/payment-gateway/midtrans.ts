// Midtrans SDK wrapper
// Install: pnpm add midtrans-client

interface MidtransConfig {
  serverKey: string
  isProduction: boolean
}

export function createMidtransClient(_config: MidtransConfig) {
  // TODO: import dan inisiasi Midtrans SDK
  // const snap = new midtransClient.Snap({ isProduction: config.isProduction, serverKey: config.serverKey })
  return {
    createTransaction: async (_params: unknown) => {
      // return snap.createTransaction(params)
      throw new Error('Midtrans belum diimplementasikan')
    },
  }
}
