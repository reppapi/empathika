"use client"

import { useState } from "react"
import { uploadService } from "@/services/upload.service"

interface UseBlogFormImageOptions {
  initialBannerUrl?: string | null
}

export function useBlogFormImage(options?: UseBlogFormImageOptions) {
  const [existingBannerUrl, setExistingBannerUrl] = useState<string | null>(
    options?.initialBannerUrl ?? null
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>(
    options?.initialBannerUrl ?? ""
  )
  const [isUploading, setIsUploading] = useState(false)

  const handleSelectFile = async (file: File) => {
    try {
      const { compressImage, IMAGE_PRESETS } = await import("@/lib/imageCompressor")
      const compressed = await compressImage(file, IMAGE_PRESETS.blog)
      setImageFile(compressed.file)
      setImagePreviewUrl(compressed.dataUrl)
    } catch {
      setImageFile(file)
      setImagePreviewUrl(URL.createObjectURL(file))
    }
  }

  const uploadIfSelected = async (): Promise<string | null> => {
    if (!imageFile) {
      return existingBannerUrl
    }
    setIsUploading(true)
    try {
      const url = await uploadService.uploadImage(imageFile)
      return url
    } finally {
      setIsUploading(false)
    }
  }

  return {
    imageFile,
    imagePreviewUrl,
    setImagePreviewUrl,
    setExistingBannerUrl,
    isUploading,
    handleSelectFile,
    uploadIfSelected,
  }
}

