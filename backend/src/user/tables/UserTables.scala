package delivery.user.tables

object UserTables:
  val Credentials = "user_credentials"
  val CustomerProfiles = "customer_profiles"
  val CustomerSessions = "customer_sessions"

  val all: List[String] = List(Credentials, CustomerProfiles, CustomerSessions)

end UserTables
