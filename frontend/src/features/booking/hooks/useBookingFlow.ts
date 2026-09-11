import { bookingService } from "@/services/booking.service"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function useBookingFlow() {
  const queryClient = useQueryClient()

  const myBookings = useQuery({
    queryKey: ["booking", "me"],
    queryFn: bookingService.getMyBookings,
  })

  const createBooking = useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", "me"] })
    },
  })

  const cancelBooking = useMutation({
    mutationFn: bookingService.cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", "me"] })
    },
  })

  return { myBookings, createBooking, cancelBooking }
}

