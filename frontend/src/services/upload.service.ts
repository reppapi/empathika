import apiClient from "@/lib/axios"

export const uploadService = {
  /**
   * Upload file gambar langsung ke server (tanpa kompresi tambahan).
   */
  uploadImageRaw: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiClient.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    const result = response.data
    if (!result?.success || !result?.data?.url) {
      throw new Error(result?.message ?? "Gagal mengupload gambar")
    }

    return result.data.url as string
  },

  /**
   * Upload file gambar ke server dengan kompresi otomatis di browser.
   * Mengompresi file ke WebP/JPEG tajam (~150-300KB) sebelum dikirim ke API.
   */
  uploadImage: async (file: File): Promise<string> => {
    let fileToUpload = file

    try {
      if (typeof window !== "undefined" && file.type?.startsWith("image/")) {
        const { compressImage } = await import("@/lib/imageCompressor")
        const res = await compressImage(file, { maxWidth: 1280, maxHeight: 1280, quality: 0.82 })
        fileToUpload = res.file
      }
    } catch (compressErr) {
      console.warn("Client compression notice:", compressErr)
    }

    const formData = new FormData()
    formData.append("file", fileToUpload)

    const response = await apiClient.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    const result = response.data
    if (!result?.success || !result?.data?.url) {
      throw new Error(result?.message ?? "Gagal mengupload gambar")
    }

    return result.data.url as string
  },
}
