package delivery.admin.objects

import delivery.model.{Order, Rider}

final case class OrdersPanelResponse(orders: List[Order], riders: List[Rider])
