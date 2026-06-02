package delivery.merchant.api

import cats.effect.IO
import delivery.merchant.tables.merchantstore.MerchantStoreTable
import delivery.merchant.utils.StoreImageUploads
import delivery.shared.api.{APIWithRoleMessage, HttpApiError}
import delivery.shared.objects.MerchantId

import java.nio.file.Files
import java.sql.Connection
import java.util.Base64
import java.util.UUID

final case class MerchantStoreImageFileAPIMessage(
    merchantId: MerchantId,
    bytesBase64: String,
    contentTypeLower: String,
    filenameHint: Option[String]
) extends APIWithRoleMessage[String]:
  override def plan(connection: Connection, username: String): IO[String] =
    for
      bytes <- IO.blocking(Base64.getDecoder.decode(bytesBase64)).handleErrorWith(_ => IO.raiseError(HttpApiError.BadRequest("图片内容格式错误")))
      _ <- if bytes.length > 2 * 1024 * 1024 then IO.raiseError(HttpApiError.BadRequest("图片不能超过 2MB")) else IO.unit
      _ <- if bytes.isEmpty then IO.raiseError(HttpApiError.BadRequest("未收到文件内容")) else IO.unit
      ext <- IO.fromEither(MerchantAPIMessageSupport.storeImageExtension(contentTypeLower, filenameHint).left.map(HttpApiError.BadRequest.apply))
      merchant <- MerchantAPIMessageSupport.requireOwnedStore(connection, username, merchantId)
      storedName = s"${UUID.randomUUID()}$ext"
      publicPath = s"/api/merchant/store-images/$storedName"
      _ <- IO.blocking(Files.write(StoreImageUploads.directory.resolve(storedName), bytes))
      _ <- MerchantStoreTable.upsert(connection, username, merchant.copy(imageUrl = Some(publicPath)))
    yield publicPath
