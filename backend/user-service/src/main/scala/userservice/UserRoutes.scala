package userservice

import cats.effect.IO
import cats.effect.kernel.Ref
import cats.syntax.all.*
import delivery.auth.JwtSupport
import delivery.http.support.{AuthHttp, MeJson}
import delivery.interop.InternalToken
import delivery.model.*
import delivery.model.JsonCodecs.given
import delivery.store.UserDomainOps
import io.circe.Json
import org.http4s.*
import org.http4s.Method.POST
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.client.Client
import org.http4s.dsl.io.*

object UserRoutes:

  def apply(
      httpClient: Client[IO],
      ref: Ref[IO, UserServiceState],
      persist: UserServiceState => IO[Unit],
      merchantBaseUrl: String,
      riderBaseUrl: String
  ): HttpRoutes[IO] =
    val merchantBootstrap =
      Uri.unsafeFromString(s"${merchantBaseUrl.stripSuffix("/")}/internal/bootstrap-merchant")
    val riderBootstrap =
      Uri.unsafeFromString(s"${riderBaseUrl.stripSuffix("/")}/internal/bootstrap-rider")

    val publicApi = HttpRoutes.of[IO] {
      case GET -> Root =>
        Ok(
          Json.obj(
            "service" -> Json.fromString("user-service"),
            "message" -> Json.fromString("用户与认证服务")
          )
        )

      case GET -> Root / "api" / "health" =>
        Ok(JsonCodecs.HealthOk(true))

      case req @ POST -> Root / "api" / "auth" / "login" =>
        for
          body <- req.as[LoginRequest]
          st <- ref.get
          resp <- UserDomainOps.verifyLogin(st, body.role, body.username, body.password) match
            case Left(msg) => AuthHttp.unauthorizedJson(msg)
            case Right(()) =>
              val token = JwtSupport.signToken(body.username, body.role)
              Ok(LoginResponse(token, body.username, body.role))
        yield resp

      case req @ POST -> Root / "api" / "auth" / "register" =>
        for
          body <- req.as[RegisterRequest]
          st <- ref.get
          resp <- body.role match
            case "admin" => BadRequest(ErrorBody("不可注册管理员"))
            case "customer" =>
              UserDomainOps.registerCustomer(st, body.username, body.password) match
                case Left(msg)    => BadRequest(ErrorBody(msg))
                case Right(newSt) => ref.set(newSt) *> persist(newSt) *> Ok(OkResponse(true))
            case "merchant" =>
              UserDomainOps.registerMerchantCredential(st, body.username, body.password) match
                case Left(msg) => BadRequest(ErrorBody(msg))
                case Right(ns) =>
                  val internalReq =
                    Request[IO](POST, merchantBootstrap)
                      .withHeaders(InternalToken.header)
                      .withEntity(BootstrapUserRequest(body.username))
                  httpClient.run(internalReq).use { r =>
                    if r.status.isSuccess then ref.set(ns) *> persist(ns) *> Ok(OkResponse(true))
                    else BadRequest(ErrorBody("商户服务不可用，注册未完成"))
                  }
            case "rider" =>
              UserDomainOps.registerRiderCredential(st, body.username, body.password) match
                case Left(msg) => BadRequest(ErrorBody(msg))
                case Right(ns) =>
                  val internalReq =
                    Request[IO](POST, riderBootstrap)
                      .withHeaders(InternalToken.header)
                      .withEntity(BootstrapUserRequest(body.username))
                  httpClient.run(internalReq).use { r =>
                    if r.status.isSuccess then ref.set(ns) *> persist(ns) *> Ok(OkResponse(true))
                    else BadRequest(ErrorBody("骑手服务不可用，注册未完成"))
                  }
            case _ => BadRequest(ErrorBody("无效角色"))
        yield resp

      case req @ GET -> Root / "api" / "auth" / "me" =>
        AuthHttp.requireRole(req, "customer") { user =>
          ref.get.flatMap { st =>
            MeJson.customer(st, user) match
              case Left(msg) => NotFound(ErrorBody(msg))
              case Right(j)  => Ok(j)
          }
        }

      case req @ PATCH -> Root / "api" / "delivery" / "me" / "customer" / "profile" =>
        AuthHttp.requireRole(req, "customer") { user =>
          for
            patch <- req.as[CustomerProfilePatch]
            st <- ref.get
            resp <- UserDomainOps.patchCustomer(st, user, patch) match
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right(ns) => ref.set(ns) *> persist(ns) *> Ok(OkResponse(true))
          yield resp
        }
    }

    val internal = HttpRoutes.of[IO] {
      case req @ GET -> Root / "internal" / "customer-profile" / username =>
        if !InternalToken.authorize(req) then
          Forbidden(ErrorBody("内部调用拒绝"))
        else
          ref.get.flatMap { st =>
            st.customerAccounts.find(_.username == username) match
              case None    => NotFound(ErrorBody("未找到顾客"))
              case Some(a) => Ok(a.profile)
          }

      case req @ POST -> Root / "internal" / "checkout-complete" =>
        if !InternalToken.authorize(req) then Forbidden(ErrorBody("内部调用拒绝"))
        else
          for
            body <- req.as[CheckoutCompleteRequest]
            st <- ref.get
            resp <- UserDomainOps.checkoutComplete(st, body) match
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right(ns) => ref.set(ns) *> persist(ns) *> Ok(OkResponse(true))
          yield resp
    }

    publicApi <+> internal

end UserRoutes
