package delivery.admin.tables

import cats.effect.IO
import delivery.admin.tables.storeonboarding.StoreOnboardingRequestTableInitializer

import java.sql.Connection

object AdminTableRegistry:
  val StoreOnboardingRequests = "store_onboarding_requests"

  def initialize(connection: Connection): IO[Unit] =
    StoreOnboardingRequestTableInitializer.initialize(connection)

end AdminTableRegistry
