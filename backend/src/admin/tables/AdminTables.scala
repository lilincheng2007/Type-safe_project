package delivery.admin.tables

object AdminTables:
  val AdminAccounts = "admin_accounts"
  val Campaigns = "promotion_campaigns"
  val ComplaintTickets = "complaint_tickets"
  val MerchantApplications = "merchant_applications"
  val ServiceAgents = "service_agents"
  val OperationsManagers = "operations_managers"

  val all: List[String] =
    List(AdminAccounts, Campaigns, ComplaintTickets, MerchantApplications, ServiceAgents, OperationsManagers)

end AdminTables
