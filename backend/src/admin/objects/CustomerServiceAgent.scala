package delivery.admin.objects

final case class CustomerServiceAgent(
    id: String,
    name: String,
    department: String,
    channel: String,
    ticketIds: List[String]
)
