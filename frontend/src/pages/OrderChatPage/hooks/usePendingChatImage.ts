import { useEffect, useState } from 'react'

export type PendingChatImage = { file: File; previewUrl: string }

export function usePendingChatImage() {
  const [pendingImage, setPendingImage] = useState<PendingChatImage | null>(null)

  const selectPendingImageFile = (file: File | undefined, disabled = false) => {
    if (!file || disabled) return
    setPendingImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl)
      return { file, previewUrl: URL.createObjectURL(file) }
    })
  }

  const clearPendingImage = () => {
    setPendingImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl)
      return null
    })
  }

  useEffect(() => {
    return () => {
      if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl)
    }
  }, [pendingImage])

  return {
    pendingImage,
    selectPendingImageFile,
    clearPendingImage,
  }
}
