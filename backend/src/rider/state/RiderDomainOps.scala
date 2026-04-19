package delivery.rider.state

import cats.effect.IO
import delivery.rider.objects.*

object RiderDomainOps:

  def bootstrapRider(state: RiderServiceState, username: String): IO[Either[String, RiderServiceState]] =
    if state.riderAccounts.exists(_.username == username) then IO.pure(Left("骑手已存在"))
    else
      IO.realTime.map(_.toMillis).map { nowMillis =>
        val newRider = Rider(s"r-$nowMillis", username, "", "请更新当前位置", "空闲", 0, 5, "未分配站点", 0)
        val acc = RiderAccount("rider", username, "", RiderProfile(newRider, 0, Nil, Nil))
        Right(state.copy(riders = state.riders :+ newRider, riderAccounts = state.riderAccounts :+ acc))
      }

end RiderDomainOps
