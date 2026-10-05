import apiClient from "@/lib/axios"

export const bookingService = {
  createBooking: (payload: unknown) =>
    apiClient.post("/booking", payload).then((r) => r.data),

  getBookingById: (id: string) =>
    apiClient.get(`/booking/${id}`).then((r) => r.data),

  getMyBookings: () =>
    apiClient.get("/booking/me").then((r) => r.data),

  cancelBooking: (id: string) =>
    apiClient.patch(`/booking/${id}/cancel`).then((r) => r.data),
}

