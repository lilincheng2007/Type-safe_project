package delivery.merchant.objects.apiTypes

import delivery.merchant.objects.{Merchant, Product}

final case class CatalogResponse(merchants: List[Merchant], products: List[Product])
