package delivery.review.routes

import cats.effect.IO
import delivery.review.api.*
import delivery.review.objects.*
import delivery.review.objects.apiTypes.*
import delivery.review.utils.ReviewImageUploads
import delivery.shared.api.RegisteredAPIMessage
import delivery.shared.api.RegisteredAPIMessage.{api, apiWithRole}
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.ErrorBody
import delivery.shared.objects.apiTypes.OkResponse
import io.circe.generic.auto.*
import fs2.Stream
import org.http4s.*
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*
import org.http4s.headers.`Content-Type`

import java.nio.file.Files
import java.util.regex.Pattern

object ReviewRoutes:
  private val storedImagePattern: Pattern =
    Pattern.compile("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(jpg|jpeg|png|gif|webp)$", Pattern.CASE_INSENSITIVE)

  val imagePublicRoutes: HttpRoutes[IO] =
    HttpRoutes.of[IO] { case GET -> Root / imageFile =>
      if !storedImagePattern.matcher(imageFile).matches() then BadRequest(ErrorBody("非法文件名"))
      else
        val dir = ReviewImageUploads.directory.normalize
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

  val apiMessages: List[RegisteredAPIMessage] = List(
    api[MerchantReviewsAPIMessage, MerchantReviewsResponse],
    apiWithRole[CustomerSubmitOrderReviewAPIMessage, OkResponse]("customer"),
    apiWithRole[CustomerReviewVoteAPIMessage, OkResponse]("customer"),
    apiWithRole[CustomerReviewImageFileAPIMessage, String]("customer")
  )

end ReviewRoutes
