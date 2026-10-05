// Psikolog types
export interface Psikolog {
  id: string
  name: string
  slug: string
  photo: string | null
  specialization: string[]
  bio: string
  rating: number
  priceOnline: number
  priceOffline: number
}

export interface PsikologFilter {
  specialization?: string
  priceMin?: number
  priceMax?: number
  search?: string
}

