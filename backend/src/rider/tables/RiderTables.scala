package delivery.rider.tables

object RiderTables:
  val RiderAccounts = "rider_accounts"
  val RiderProfiles = "rider_profiles"
  val RiderAssignments = "rider_assignments"

  val all: List[String] = List(RiderAccounts, RiderProfiles, RiderAssignments)

end RiderTables
