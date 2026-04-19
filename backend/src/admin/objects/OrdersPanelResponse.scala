package delivery.admin.objects

import delivery.order.objects.Order
import delivery.rider.objects.Rider

final case class OrdersPanelResponse(orders: List[Order], riders: List[Rider])
