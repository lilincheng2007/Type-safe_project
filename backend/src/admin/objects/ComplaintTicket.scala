package delivery.admin.objects

final case class ComplaintTicket(
    id: String,
    orderId: String,
    customerName: String,
    summary: String,
    severity: String,
    status: String
)
