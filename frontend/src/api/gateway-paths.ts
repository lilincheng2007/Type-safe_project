/**
 * 与 API 网关对外路径一致（Vite 代理 `/api` 前缀）。
 * 后端：user 8782 / order 8783 / merchant 8784 / rider 8785 / admin 8786 → gateway 8787
 */
export const gatewayPaths = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
  },
  delivery: {
    catalog: '/delivery/catalog',
    customerCheckout: '/delivery/me/customer/checkout',
    customerProfile: '/delivery/me/customer/profile',
    merchantProfile: '/delivery/me/merchant/profile',
    merchantStores: '/delivery/me/merchant/stores',
    overview: '/delivery/overview',
    ordersPanel: '/delivery/orders-panel',
    platformMeta: '/delivery/platform-meta',
  },
} as const
