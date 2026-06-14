package delivery.merchant.api

import cats.effect.IO
import delivery.platform.api.APIWithRoleMessage

import java.sql.Connection

/**
  * @deprecated 仅用于兼容旧 apiName: merchantstoreapi，请改用 MerchantCreateStoreOnboardingRequestAPIMessage
  */
final case class MerchantStoreAPIMessage(
    storeName: String,
    address: String,
    description: String,
    tags: Option[List[String]] = None
) extends APIWithRoleMessage[String]:
  override def plan(connection: Connection, username: String): IO[String] =
    MerchantCreateStoreOnboardingRequestAPIMessage(storeName, address, description, tags).plan(connection, username)
