import { createBrowserRouter, Navigate } from 'react-router-dom'

import { GuestRouteGuard, RoleRouteGuard } from '@/components/RoleRouteGuards'
import AdminConsole from '@/pages/AdminConsole'
import PlatformPromotionsPage from '@/pages/AdminConsole/PlatformPromotionsPage'
import CustomerPortal from '@/pages/CustomerPortal'
import CustomerCheckoutPage from '@/pages/CustomerPortal/components/CustomerCheckoutPage'
import CustomerMerchantOrderPage from '@/pages/CustomerPortal/components/CustomerMerchantOrderPage'
import Login from '@/pages/Login'
import MerchantConsole from '@/pages/MerchantConsole'
import OrderChatPage from '@/pages/OrderChatPage'
import Register from '@/pages/Register'
import { UserRoles } from '@/objects/shared/ids'
import RiderApp from '@/pages/RiderApp'

const routes = [
  {
    path: '/',
    element: <Navigate replace to="/auth/login" />,
  },
  {
    path: '/auth/login',
    element: (
      <GuestRouteGuard>
        <Login />
      </GuestRouteGuard>
    ),
  },
  {
    path: '/auth/register',
    element: (
      <GuestRouteGuard>
        <Register />
      </GuestRouteGuard>
    ),
  },
  {
    path: '/delivery/customer/m/:merchantId',
    element: (
      <RoleRouteGuard allowedRoles={[UserRoles.customer]}>
        <CustomerMerchantOrderPage />
      </RoleRouteGuard>
    ),
  },
  {
    path: '/delivery/customer/checkout',
    element: (
      <RoleRouteGuard allowedRoles={[UserRoles.customer]}>
        <CustomerCheckoutPage />
      </RoleRouteGuard>
    ),
  },
  {
    path: '/delivery/customer',
    element: (
      <RoleRouteGuard allowedRoles={[UserRoles.customer]}>
        <CustomerPortal />
      </RoleRouteGuard>
    ),
  },
  {
    path: '/delivery/merchant',
    element: (
      <RoleRouteGuard allowedRoles={[UserRoles.merchant]}>
        <MerchantConsole />
      </RoleRouteGuard>
    ),
  },
  {
    path: '/delivery/rider',
    element: (
      <RoleRouteGuard allowedRoles={[UserRoles.rider]}>
        <RiderApp />
      </RoleRouteGuard>
    ),
  },
  {
    path: '/delivery/chat/:orderId',
    element: (
      <RoleRouteGuard allowedRoles={[UserRoles.customer, UserRoles.merchant, UserRoles.rider]}>
        <OrderChatPage />
      </RoleRouteGuard>
    ),
  },
  {
    path: '/delivery/admin/promotions',
    element: (
      <RoleRouteGuard allowedRoles={[UserRoles.admin]}>
        <PlatformPromotionsPage />
      </RoleRouteGuard>
    ),
  },
  {
    path: '/delivery/admin',
    element: (
      <RoleRouteGuard allowedRoles={[UserRoles.admin]}>
        <AdminConsole />
      </RoleRouteGuard>
    ),
  },
  {
    path: '*',
    element: <Navigate replace to="/auth/login" />,
  },
]

export const router = createBrowserRouter(routes)
