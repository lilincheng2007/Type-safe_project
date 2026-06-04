const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

export function getLocalImageFileError(file: File): string | null {
  if (file.size > 2 * 1024 * 1024) {
    return '图片不能超过 2MB'
  }

  const contentType = file.type.trim().toLowerCase()
  const fileName = file.name.trim().toLowerCase()
  const hasAllowedExtension = allowedImageExtensions.some((extension) => fileName.endsWith(extension))

  if (contentType && !allowedImageMimeTypes.has(contentType)) {
    return '仅支持 JPEG/PNG/GIF/WebP 图片'
  }

  if (!contentType && !hasAllowedExtension) {
    return '仅支持 JPEG/PNG/GIF/WebP 图片'
  }

  return null
}
