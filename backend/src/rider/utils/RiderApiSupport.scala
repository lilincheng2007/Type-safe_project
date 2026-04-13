package delivery.rider.utils

import delivery.rider.objects.{RiderAccountPublic, RiderMeResponse}
import delivery.shared.objects.ErrorBody

object RiderApiSupport:

  def riderNotFound: ErrorBody = ErrorBody("未找到账号")

  def riderMeResponse(username: String, account: delivery.model.RiderAccount): RiderMeResponse =
    RiderMeResponse(
      username = username,
      role = "rider",
      riderAccount = RiderAccountPublic(account.role, account.username, account.profile)
    )

end RiderApiSupport
