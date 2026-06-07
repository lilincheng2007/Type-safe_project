package delivery.order.objects

final case class OrderTimelineEvent(
    key: String,
    label: String,
    occurredAt: String,
    description: Option[String] = None
)
