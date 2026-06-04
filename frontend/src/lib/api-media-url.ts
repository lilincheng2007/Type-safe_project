/**
 * 将 API 返回的相对路径（如 `/api/merchant/store-images/...`）解析为浏览器可请求的绝对地址。
 *
 * 1. `VITE_API_BASE` 为 `http(s)://...` 时，相对路径需拼到该基址上（否则 `<img src="/api/...">` 仍指向前端源）。
 * 2. 开发环境常见 `VITE_API_BASE=/api`：图片也优先走同源 `/api/...`，让 Vite 代理统一转发。
 */
export function resolveApiMediaUrl(url: string | null | undefined): string {
  if (url == null) return ''
  const trimmed = String(url).trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed

  if (trimmed.startsWith('/api')) {
    return trimmed
  }

  const rawBase = (import.meta.env.VITE_API_BASE as string | undefined)?.trim()
  const base = rawBase && rawBase.length > 0 ? rawBase : '/api'
  const normalized = base.replace(/\/$/, '')

  if (
    trimmed.startsWith('/') &&
    (normalized.startsWith('http://') || normalized.startsWith('https://'))
  ) {
    const baseForResolve = normalized.endsWith('/') ? normalized : `${normalized}/`
    return new URL(trimmed, baseForResolve).href
  }

  return trimmed
}
