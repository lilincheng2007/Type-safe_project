package delivery.order.tables

object OrderTables:
  val Orders = "orders"
  val OrderItems = "order_items"
  val CheckoutRequests = "checkout_requests"

  val all: List[String] = List(Orders, OrderItems, CheckoutRequests)

end OrderTables
