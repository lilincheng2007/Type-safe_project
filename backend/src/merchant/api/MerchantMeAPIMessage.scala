package delivery.merchant.api

import cats.effect.IO
import delivery.merchant.objects.{MerchantStoreProfile}
import delivery.merchant.objects.apiTypes.{MerchantMeResponse}
import delivery.merchant.tables.catalogproduct.CatalogProductTable
import delivery.merchant.tables.merchantaccount.MerchantAccountTable
import delivery.merchant.tables.merchantstore.MerchantStoreTable
import delivery.merchant.utils.MerchantApiSupport
import delivery.order.tables.order.OrderTable
import delivery.shared.api.{APIWithRoleMessage, HttpApiError}

import java.sql.Connection

final case class MerchantMeAPIMessage() extends APIWithRoleMessage[MerchantMeResponse]:
  override def plan(connection: Connection, username: String): IO[MerchantMeResponse] =
    for
      account <- MerchantAccountTable.findByUsername(connection, username)
      response <- account match
        case None => IO.pure(None)
        case Some(value) =>
          for
            stores <- MerchantStoreTable.listByOwner(connection, username)
            storeIds = stores.map(_.id)
            products <- CatalogProductTable.list(connection)
            orders <- OrderTable.listByMerchantIds(connection, storeIds)
          yield
            val ordersByMerchantId = orders.groupBy(_.merchantId)
            val storeProfiles = stores.map { merchant =>
              val merchantOrders = ordersByMerchantId.getOrElse(merchant.id, Nil)
              MerchantStoreProfile(
                merchant = merchant,
                products = products.filter(_.merchantId == merchant.id),
                pendingOrders = merchantOrders.filterNot(order => MerchantAPIMessageSupport.isHistoryOrderStatus(order.status)),
                historyOrders = merchantOrders.filter(order => MerchantAPIMessageSupport.isHistoryOrderStatus(order.status))
              )
            }
            Some(MerchantApiSupport.merchantMeResponse(username, value.copy(profile = value.profile.copy(stores = storeProfiles))))
      output <- response match
        case None => IO.raiseError(HttpApiError.NotFound(MerchantApiSupport.merchantNotFound.error))
        case Some(value) => IO.pure(value)
    yield output
