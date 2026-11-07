import { BLOG_CONSTANTS } from "../constants/blogConstants"
import type { BackendBlogItem, BlogPost } from "../types"

export function createExcerpt(text: string, maxLength: number = BLOG_CONSTANTS.EXCERPT_MAX_LENGTH): string {
  const plain = (text || "").replace(/\s+/g, " ").trim()
  return plain.length > maxLength ? `${plain.substring(0, maxLength)}...` : plain
}

export function mapBackendBlogToPost(item: BackendBlogItem): BlogPost {
  return {
    id: item.id,
    slug: item.id,
    title: item.judul,
    excerpt: createExcerpt(item.isi),
    content: (item.isi || "").split("\n").filter((p) => p.trim() !== ""),
    date: item.tanggal_terbit,
    imageUrl: item.banner_url ?? undefined,
  }
}

export function formatBlogDate(dateStr: string | Date): string {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

