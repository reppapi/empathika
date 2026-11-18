/** Redireksi rute lama /psikotes/bayar ke rute resmi /psikotes/checkout. */
import { redirect } from "next/navigation"

export default function PsikotesBayarPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const query = new URLSearchParams()
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        val.forEach((v) => query.append(key, v))
      } else if (val !== undefined) {
        query.append(key, val)
      }
    })
  }
  const queryString = query.toString()
  redirect(queryString ? `/psikotes/checkout?${queryString}` : "/psikotes/checkout")
}

