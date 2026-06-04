package delivery.admin.api

import cats.effect.IO
import delivery.admin.tables.storeonboarding.StoreOnboardingRequestTable
import delivery.merchant.objects.Merchant
import delivery.merchant.tables.merchantaccount.MerchantAccountTable
import delivery.merchant.tables.merchantstore.MerchantStoreTable
import delivery.shared.api.{APIWithRoleMessage, HttpApiError}
import delivery.shared.objects.MerchantCategory
import delivery.shared.objects.apiTypes.OkResponse

import java.sql.Connection

final case class AdminStoreOnboardingAcceptAPIMessage(requestId: String) extends APIWithRoleMessage[OkResponse]:
  override def plan(connection: Connection, username: String): IO[OkResponse] =
    if requestId.trim.isEmpty then IO.raiseError(HttpApiError.BadRequest("申请 ID 不能为空"))
    else
      for
        request <- StoreOnboardingRequestTable.findPending(connection, requestId.trim)
        onboarding <- IO.fromOption(request)(HttpApiError.NotFound("未找到待审核的店铺申请"))
        account <- MerchantAccountTable.findByUsername(connection, onboarding.ownerUsername)
        merchantAccount <- IO.fromOption(account)(HttpApiError.BadRequest("未找到申请对应的商家账号"))
        nowMillis <- IO.realTime.map(_.toMillis)
        merchant = Merchant(
          id = s"m-local-$nowMillis",
          storeName = onboarding.storeName,
          category = MerchantCategory.中餐,
          address = onboarding.address,
          phone = merchantAccount.profile.phone,
          rating = 5,
          tags = List("新店"),
          featuredProductIds = Nil,
          imageUrl = None,
          description = onboarding.description
        )
        _ <- MerchantStoreTable.upsert(connection, onboarding.ownerUsername, merchant)
        _ <- StoreOnboardingRequestTable.accept(connection, onboarding.id, username)
      yield OkResponse(ok = true)
