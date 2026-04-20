import { ShoppingCart, Store } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Merchant, Product } from '@/objects/merchant'
import type { MerchantId, ProductId } from '@/objects/shared'

type HomeTabProps = {
  merchants: Merchant[]
  products: Product[]
  selectedMerchantId: MerchantId
  onSelectMerchant: (merchantId: MerchantId) => void
  onAddProductToCart: (merchantId: MerchantId, productId: ProductId) => void
}

export function HomeTab({
  merchants,
  products,
  selectedMerchantId,
  onSelectMerchant,
  onAddProductToCart,
}: HomeTabProps) {
  const selectedMerchant = merchants.find((merchant) => merchant.id === selectedMerchantId) ?? null
  const selectedMerchantProducts = products.filter(
    (product) => product.merchantId === selectedMerchantId && product.listingStatus === '上架',
  )

  return (
    <div className="space-y-4">
      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="size-5 text-orange-500" />
            商家列表
          </CardTitle>
          <CardDescription>点击商家后可浏览该商家对应菜品</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {merchants.map((merchant) => (
            <button
              key={merchant.id}
              type="button"
              className={`rounded-xl border p-4 text-left transition-colors ${
                selectedMerchantId === merchant.id
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-orange-100 bg-white hover:bg-orange-50/60'
              }`}
              onClick={() => onSelectMerchant(merchant.id)}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{merchant.storeName}</p>
                <Badge variant="outline">{merchant.category}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">{merchant.address}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle>商家菜品</CardTitle>
          <CardDescription>{selectedMerchant ? `${selectedMerchant.storeName} 的可选菜品` : '请选择商家'}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {selectedMerchantProducts.map((product) => (
            <div key={product.id} className="space-y-2 rounded-xl border border-orange-100 p-4">
              <p className="font-medium text-slate-900">{product.name}</p>
              <p className="text-sm text-slate-600">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-orange-600">{product.price} 元</span>
                <Button size="sm" onClick={() => onAddProductToCart(product.merchantId, product.id)}>
                  <ShoppingCart className="size-4" />
                  加入购物车
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
