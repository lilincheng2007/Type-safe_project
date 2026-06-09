package delivery.merchant.objects.apiTypes

final case class CreateStoreRequest(storeName: String, address: String, description: String, tags: List[String] = Nil)
