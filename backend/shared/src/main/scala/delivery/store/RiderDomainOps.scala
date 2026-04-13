package delivery.store

import cats.effect.IO
import delivery.model.*

object RiderDomainOps:

  def bootstrapRider(state: RiderServiceState, username: String): IO[Either[String, RiderServiceState]] =
    if state.riderAccounts.exists(_.username == username) then IO.pure(Left("骑手已存在"))
    else
      IO.realTime.map(_.toMillis).map { nowMillis =>
        val newRider = Rider(
          id = s"r-$nowMillis",
          name = username,
          phone = "",
          realtimeLocation = "请更新当前位置",
          status = "空闲",
          totalOrders = 0,
          rating = 5,
          station = "未分配站点",
          salary = 0
        )
        val acc = RiderAccount(
          "rider",
          username,
          "",
          RiderProfile(newRider, 0, Nil, Nil)
        )
        Right(state.copy(riders = state.riders :+ newRider, riderAccounts = state.riderAccounts :+ acc))
      }

end RiderDomainOps
