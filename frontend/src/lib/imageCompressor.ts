import { uploadService } from "@/services/upload.service"

export interface CompressImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  mimeType?: "image/webp" | "image/jpeg"
}

export interface CompressImageResult {
  file: File
  dataUrl: string
  originalSizeKB: number
  compressedSizeKB: number
  compressionRatio: number
}

export type ImagePreset =
  | "layanan"
  | "blog"
  | "event"
  | "psikolog"
  | "biro"
  | "psikotes"
  | "default"

/**
 * Konfigurasi preset resolusi & kualitas per fitur
 * Disesuaikan presisi dengan container aspect-ratio di halaman client & profil tenaga ahli.
 */
export const IMAGE_PRESETS: Record<ImagePreset, CompressImageOptions> = {
  // Sesuai rasio kartu layanan & hero banner asesmen (16:9 / Landscape, max width 1200, height 675)
  layanan: { maxWidth: 1200, maxHeight: 675, quality: 0.85, mimeType: "image/webp" },
  // Sesuai rasio thumbnail & hero artikel blog (16:9, max width 1200, height 675)
  blog: { maxWidth: 1200, maxHeight: 675, quality: 0.85, mimeType: "image/webp" },
  // Sesuai banner & poster kegiatan (16:9 / 4:5, max width 1200, height 1200)
  event: { maxWidth: 1200, maxHeight: 1200, quality: 0.85, mimeType: "image/webp" },
  // Sesuai kartu psikolog (4:3) & avatar lingkaran detail profil (1:1, max width 800, height 800)
  psikolog: { maxWidth: 800, maxHeight: 800, quality: 0.88, mimeType: "image/webp" },
  // Sesuai logo biro & instansi mitra (1:1 / Horizontal transparan, max width 600, height 600)
  biro: { maxWidth: 600, maxHeight: 600, quality: 0.88, mimeType: "image/webp" },
  // Sesuai katalog paket psikotes (16:9, max width 1200, height 675)
  psikotes: { maxWidth: 1200, maxHeight: 675, quality: 0.85, mimeType: "image/webp" },
  // General standard fallback
  default: { maxWidth: 1280, maxHeight: 1280, quality: 0.82, mimeType: "image/webp" },
}

/**
 * Kompresi gambar otomatis di sisi client (browser) sebelum diunggah atau disimpan.
 * - Mengubah resolusi secara proporsional ke batas aman fitur yang ditentukan.
 * - Mengonversi ke WebP / JPEG teroptimasi dengan kualitas optimal.
 * - Menghemat ukuran file rata-rata 75% hingga 90% tanpa mengurangi ketajaman visual.
 */
export async function compressImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<CompressImageResult> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.82,
    mimeType = "image/webp",
  } = options

  const originalSizeKB = Math.round(file.size / 1024)

  return new Promise((resolve, reject) => {
    // Validasi tipe file harus berupa gambar
    if (!file.type || !file.type.startsWith("image/")) {
      return reject(new Error("File yang dipilih bukan gambar yang valid."))
    }

    // Jika file SVG atau GIF animasi, jangan di-compress via canvas agar animasinya tidak hilang
    if (file.type === "image/svg+xml" || file.type === "image/gif") {
      const reader = new FileReader()
      reader.onload = () => {
        resolve({
          file,
          dataUrl: reader.result as string,
          originalSizeKB,
          compressedSizeKB: originalSizeKB,
          compressionRatio: 0,
        })
      }
      reader.onerror = () => reject(new Error("Gagal membaca file gambar."))
      reader.readAsDataURL(file)
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error("Format gambar rusak atau tidak didukung."))
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Hitung skala aspect ratio proporsional
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          return reject(new Error("Browser tidak mendukung canvas 2D context."))
        }

        // Terapkan interpolasi kualitas tinggi untuk gambar tajam
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, width, height)

        // Generate dataUrl
        let dataUrl = canvas.toDataURL(mimeType, quality)
        // Fallback jika browser lawas belum mendukung export WebP di canvas
        if (!dataUrl.startsWith(`data:${mimeType}`)) {
          dataUrl = canvas.toDataURL("image/jpeg", quality)
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Gagal membuat blob gambar terkompresi."))
            }

            const extension = mimeType === "image/webp" ? ".webp" : ".jpg"
            const cleanName = file.name.replace(/\.[^/.]+$/, "")
            const compressedFile = new File([blob], `${cleanName}${extension}`, {
              type: blob.type,
              lastModified: Date.now(),
            })

            const compressedSizeKB = Math.round(blob.size / 1024)
            const compressionRatio =
              originalSizeKB > 0
                ? Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100)
                : 0

            resolve({
              file: compressedFile,
              dataUrl,
              originalSizeKB,
              compressedSizeKB,
              compressionRatio,
            })
          },
          mimeType,
          quality
        )
      }

      img.src = e.target?.result as string
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Memproses dan mengunggah gambar:
 * 1. Mengompresi file di browser secara instan sesuai preset fitur (Layanan, Blog, Psikolog, Event, dll)
 * 2. Mengunggah file terkompresi ke backend API (/upload/image)
 * 3. Jika backend tidak tersedia/gagal auth, fallback ke Data URL yang sudah terkompresi aman
 */
export async function processAndUploadImage(
  file: File,
  presetOrNotify?: ImagePreset | CompressImageOptions | ((message: string) => void),
  optionalPreset?: ImagePreset | CompressImageOptions
): Promise<{ url: string; infoText: string; compressedFile: File }> {
  // Validasi ukuran awal maksimal 30MB
  if (file.size > 30 * 1024 * 1024) {
    throw new Error("Ukuran foto asli maksimal 30MB!")
  }

  let onNotify: ((message: string) => void) | undefined
  let options: CompressImageOptions = IMAGE_PRESETS.default

  if (typeof presetOrNotify === "function") {
    onNotify = presetOrNotify
    if (typeof optionalPreset === "string" && IMAGE_PRESETS[optionalPreset]) {
      options = IMAGE_PRESETS[optionalPreset]
    } else if (typeof optionalPreset === "object" && optionalPreset) {
      options = optionalPreset
    }
  } else if (typeof presetOrNotify === "string" && IMAGE_PRESETS[presetOrNotify]) {
    options = IMAGE_PRESETS[presetOrNotify]
  } else if (typeof presetOrNotify === "object" && presetOrNotify) {
    options = presetOrNotify
  }

  onNotify?.("Mengompresi foto sesuai rasio fitur...")
  const compressed = await compressImage(file, options)

  const infoText = `${compressed.originalSizeKB}KB → ${compressed.compressedSizeKB}KB (-${compressed.compressionRatio}%)`

  // Coba upload ke server backend
  try {
    onNotify?.("Mengunggah foto ke server...")
    const serverUrl = await uploadService.uploadImageRaw(compressed.file)
    return { url: serverUrl, infoText, compressedFile: compressed.file }
  } catch {
    // Fallback aman ke Data URL terkompresi (~100-250KB)
    return { url: compressed.dataUrl, infoText, compressedFile: compressed.file }
  }
}
