// Handler QRIS
export const qrisHandler = {
  create: async (_params: { transaksiId: string; amount: number }) => {
    // TODO: Call Midtrans QRIS API
    return { qr_string: '', qr_code_url: '' }
  },
}
