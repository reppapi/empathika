// Handler khusus Virtual Account (BCA, BNI, Mandiri, Permata)
export const vaHandler = {
  create: async (params: { transaksiId: string; amount: number; bank: string }) => {
    // TODO: Call Midtrans Bank Transfer API
    return { va_number: '1234567890', bank: params.bank }
  },
}
