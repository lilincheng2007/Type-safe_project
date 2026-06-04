import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import { getLocalImageFileError } from '@/lib/local-image-file'

class CustomerRefundImageFileAPI extends APIMessage<string> {
  readonly apiName = 'customerrefundimagefileapi'
  readonly bytesBase64: string
  readonly contentTypeLower: string
  readonly filenameHint: string | null

  constructor(bytesBase64: string, contentTypeLower: string, filenameHint: string | null) {
    super()
    this.bytesBase64 = bytesBase64
    this.contentTypeLower = contentTypeLower
    this.filenameHint = filenameHint
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('图片内容读取失败'))
        return
      }
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = () => reject(new Error('图片内容读取失败'))
    reader.readAsDataURL(file)
  })
}

export function uploadRefundImageFileIO(file: File): TaskIO<string> {
  return async () => {
    const fileError = getLocalImageFileError(file)
    if (fileError) throw new Error(fileError)
    const contentTypeLower = file.type.toLowerCase()
    const bytesBase64 = await fileToBase64(file)
    return sendAPI(new CustomerRefundImageFileAPI(bytesBase64, contentTypeLower, file.name || null))()
  }
}
