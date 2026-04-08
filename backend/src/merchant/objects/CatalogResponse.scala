package delivery.merchant.objects

import delivery.model.{Merchant, Product}

final case class CatalogResponse(merchants: List[Merchant], products: List[Product])
