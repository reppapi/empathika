import apiClient from "@/lib/axios"

export const uploadService = {
  /**
   * Upload file gambar ke server.
   * Menerima File object, return URL permanen dari server.
   */
  uploadImage: async (file: File): Promise<string> => {
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
}
