package delivery.merchant.validators

import cats.effect.IO
import delivery.merchant.objects.Merchant
import delivery.merchant.tables.merchantstore.MerchantStoreTable
import delivery.platform.api.HttpApiError
import delivery.domain.MerchantId

import java.sql.Connection

object MerchantStoreOwnershipValidator:

  def requireOwnedStore(connection: Connection, username: String, merchantId: MerchantId): IO[Merchant] =
    MerchantStoreTable.listByOwner(connection, username).flatMap { stores =>
      IO.fromOption(stores.find(_.id == merchantId))(HttpApiError.BadRequest("无权操作该店铺"))
    }

end MerchantStoreOwnershipValidator
