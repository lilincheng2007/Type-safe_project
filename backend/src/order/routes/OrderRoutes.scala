package delivery.order.routes

import delivery.order.api.*
import delivery.order.objects.Order
import cats.effect.IO
import delivery.order.objects.apiTypes.{CheckoutResponse, CustomerOrdersResponse, OrderCancelResponse, OrderChatMessagesResponse, OrderChatUnreadCountsResponse, OrderRefundRequestResponse}
import delivery.order.utils.RefundImageUploads
import delivery.shared.api.RegisteredAPIMessage
import delivery.shared.api.RegisteredAPIMessage.apiWithRole
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.ErrorBody
import io.circe.generic.auto.*
import fs2.Stream
import org.http4s.*
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*
import org.http4s.headers.`Content-Type`

import java.nio.file.Files
import java.util.regex.Pattern

object OrderRoutes:
  private val storedImagePattern: Pattern =
    Pattern.compile("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(jpg|jpeg|png|gif|webp)$", Pattern.CASE_INSENSITIVE)

  val refundImagePublicRoutes: HttpRoutes[IO] =
    HttpRoutes.of[IO] { case GET -> Root / imageFile =>
      if !storedImagePattern.matcher(imageFile).matches() then BadRequest(ErrorBody("非法文件名"))
      else
        val dir = RefundImageUploads.directory.normalize
        val path = dir.resolve(imageFile).normalize
        if !java.util.Objects.equals(path.getParent, dir) then BadRequest(ErrorBody("非法路径"))
        else if !Files.isRegularFile(path) then NotFound()
        else
          IO.blocking(Files.readAllBytes(path)).flatMap { bytes =>
            val media =
              if imageFile.toLowerCase.endsWith(".png") then MediaType.image.png
              else if imageFile.toLowerCase.endsWith(".gif") then MediaType.image.gif
              else if imageFile.toLowerCase.endsWith(".webp") then MediaType.image.webp
              else MediaType.image.jpeg
            Ok(Stream.emits(bytes).covary[IO]).map(_.putHeaders(`Content-Type`(media)))
          }
    }

  val apiMessages: List[RegisteredAPIMessage] =
    val registered = List(
    apiWithRole[CustomerOrdersAPIMessage, CustomerOrdersResponse]("customer"),
    apiWithRole[OrderDetailAPIMessage, Order]("customer"),
    apiWithRole[OrderCancelAPIMessage, OrderCancelResponse]("customer"),
    apiWithRole[OrderCompleteAPIMessage, Order]("customer"),
    apiWithRole[OrderRefundRequestAPIMessage, OrderRefundRequestResponse]("customer"),
    apiWithRole[CustomerRefundImageFileAPIMessage, String]("customer"),
    apiWithRole[CustomerOrderImageFileAPIMessage, String]("customer"),
    apiWithRole[MerchantOrderImageFileAPIMessage, String]("merchant"),
    apiWithRole[RiderOrderImageFileAPIMessage, String]("rider"),
    apiWithRole[CustomerOrderChatMessagesAPIMessage, OrderChatMessagesResponse]("customer"),
    apiWithRole[CustomerSendOrderChatMessageAPIMessage, OrderChatMessagesResponse]("customer"),
    apiWithRole[CustomerOrderChatUnreadCountsAPIMessage, OrderChatUnreadCountsResponse]("customer"),
    apiWithRole[MerchantOrderChatMessagesAPIMessage, OrderChatMessagesResponse]("merchant"),
    apiWithRole[MerchantSendOrderChatMessageAPIMessage, OrderChatMessagesResponse]("merchant"),
    apiWithRole[MerchantOrderChatUnreadCountsAPIMessage, OrderChatUnreadCountsResponse]("merchant"),
    apiWithRole[RiderOrderChatMessagesAPIMessage, OrderChatMessagesResponse]("rider"),
    apiWithRole[RiderSendOrderChatMessageAPIMessage, OrderChatMessagesResponse]("rider"),
    apiWithRole[RiderOrderChatUnreadCountsAPIMessage, OrderChatUnreadCountsResponse]("rider"),
    apiWithRole[CheckoutAPIMessage, CheckoutResponse]("customer")
    )
    val requiredNames = Set(
      "customerorderchatmessagesapi",
      "customersendorderchatmessageapi",
      "customerorderchatunreadcountsapi",
      "customerorderimagefileapi"
    )
    val registeredNames = registered.map(_.apiName).toSet
    val missing = requiredNames.diff(registeredNames)
    require(missing.isEmpty, s"订单聊天 API 未注册：${missing.toList.sorted.mkString(", ")}")
    registered

end OrderRoutes
