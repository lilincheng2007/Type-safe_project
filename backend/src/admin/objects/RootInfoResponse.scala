package delivery.admin.objects

final case class RootInfoResponse(
    service: String,
    message: String,
    modules: Map[String, RootInfoModule]
)
