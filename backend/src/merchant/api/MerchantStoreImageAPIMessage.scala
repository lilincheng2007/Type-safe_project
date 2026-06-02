package delivery.merchant.api

import cats.effect.IO
import delivery.merchant.tables.merchantstore.MerchantStoreTable
import delivery.shared.api.APIWithRoleMessage
import delivery.shared.objects.{MerchantId}
import delivery.shared.objects.apiTypes.{OkResponse}

import java.sql.Connection

final case class MerchantStoreImageAPIMessage(merchantId: MerchantId, imageUrl: String) extends APIWithRoleMessage[OkResponse]:
  override def plan(connection: Connection, username: String): IO[OkResponse] =
    for
      merchant <- MerchantAPIMessageSupport.requireOwnedStore(connection, username, merchantId)
      imageOpt <- MerchantAPIMessageSupport.validateImageUrl(imageUrl)
      _ <- MerchantStoreTable.upsert(connection, username, merchant.copy(imageUrl = imageOpt))
    yield OkResponse(ok = true)
