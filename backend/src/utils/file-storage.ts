import { existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Menghapus file fisik dari direktori storage uploads backend
 * @param fileUrl URL lengkap atau path relatif gambar (misal: "http://localhost:3001/uploads/abc.webp" atau "/uploads/abc.webp")
 */
export function deleteUploadedFile(fileUrl?: string | null): void {
  if (!fileUrl) return

  try {
    // Ambil nama file dari URL
    // Contoh URL: "http://localhost:3001/uploads/58a5c321-xxx.webp" -> "58a5c321-xxx.webp"
    const cleanedPath = fileUrl.split('?')[0] // hilangkan query params jika ada
    const parts = cleanedPath.split('/uploads/')
    if (parts.length < 2) return

    const relativeSubpath = parts[1] // contoh: "58a5c321-xxx.webp" atau "videos/xyz.mp4"
    if (!relativeSubpath || relativeSubpath.includes('..')) {
      // Keamanan path traversal
      return
    }

    const fullPath = join(process.cwd(), 'public', 'uploads', relativeSubpath)
    if (existsSync(fullPath)) {
      unlinkSync(fullPath)
    }
  } catch (err) {
    console.warn(`[deleteUploadedFile] Gagal menghapus file "${fileUrl}":`, err)
  }
}

