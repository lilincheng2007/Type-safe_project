package delivery.merchant.services

import cats.effect.IO
import delivery.merchant.objects.Product
import delivery.merchant.tables.catalogproduct.CatalogProductTable
import delivery.merchant.validators.MerchantStoreOwnershipValidator
import delivery.domain.MerchantId

import java.sql.Connection

object MerchantOwnedProductService:

  def listOwnedProducts(connection: Connection, username: String, merchantId: MerchantId): IO[List[Product]] =
    for
      _ <- MerchantStoreOwnershipValidator.requireOwnedStore(connection, username, merchantId)
      products <- CatalogProductTable.list(connection)
    yield products.filter(_.merchantId == merchantId)

end MerchantOwnedProductService
