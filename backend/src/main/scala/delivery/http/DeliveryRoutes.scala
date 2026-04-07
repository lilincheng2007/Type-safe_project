package delivery.http

import cats.effect.{IO, Ref}
import cats.syntax.all.*
import delivery.auth.JwtSupport
import delivery.model.*
import delivery.model.JsonCodecs.given
import delivery.store.StoreOps
import io.circe.Json
import io.circe.syntax.*
import org.http4s.*
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*
import org.http4s.headers.Authorization

object DeliveryRoutes:

  // http4s `Unauthorized` DSL expects WWW-Authenticate；JSON API 使用 401 + body
  private def unauthorizedJson(msg: String): IO[Response[IO]] =
    Response[IO](Status.Unauthorized).withEntity(ErrorBody(msg)).pure[IO]

  def apply(state: Ref[IO, AppState]): HttpApp[IO] =
    val routes = HttpRoutes.of[IO] {
      case GET -> Root =>
        Ok(
          Json.obj(
            "message" -> Json.fromString("外卖演示 API（Scala / http4s）"),
            "health" -> Json.fromString("/api/health"),
            "docs" -> Json.fromString("前端经 Vite 代理访问 /api/*")
          )
        )

      case GET -> Root / "api" / "health" =>
        Ok(JsonCodecs.HealthOk(true))

      case req @ POST -> Root / "api" / "auth" / "login" =>
        for
          body <- req.as[LoginRequest]
          st <- state.get
          resp <- StoreOps.verifyLogin(st, body.role, body.username, body.password) match
            case Left(msg) => unauthorizedJson(msg)
            case Right(()) =>
              val token = JwtSupport.signToken(body.username, body.role)
              Ok(LoginResponse(token, body.username, body.role))
        yield resp

      case req @ POST -> Root / "api" / "auth" / "register" =>
        for
          body <- req.as[RegisterRequest]
          st <- state.get
          resp <- StoreOps.register(st, body.role, body.username, body.password) match
            case Left(msg)    => BadRequest(ErrorBody(msg))
            case Right(newSt) => state.set(newSt) *> Ok(OkResponse(true))
        yield resp

      case req @ GET -> Root / "api" / "auth" / "me" =>
        withBearer(req) { (user, role) =>
          state.get.flatMap { st =>
            buildMeJson(st, user, role) match
              case Left(msg) => NotFound(ErrorBody(msg))
              case Right(j)  => Ok(j)
          }
        }

      case GET -> Root / "api" / "delivery" / "catalog" =>
        state.get.flatMap { s =>
          Ok(CatalogResponse(s.catalogMerchants, s.catalogProducts))
        }

      case req @ POST -> Root / "api" / "delivery" / "me" / "customer" / "checkout" =>
        requireRole(req, "customer") { user =>
          for
            body <- req.as[CheckoutRequest]
            st <- state.get
            resp <- StoreOps.checkout(st, user, body.lines) match
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right((newSt, out)) =>
                state.set(newSt) *> Ok(out)
          yield resp
        }

      case req @ PATCH -> Root / "api" / "delivery" / "me" / "customer" / "profile" =>
        requireRole(req, "customer") { user =>
          for
            patch <- req.as[CustomerProfilePatch]
            st <- state.get
            resp <- StoreOps.patchCustomer(st, user, patch) match
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right(ns) => state.set(ns) *> Ok(OkResponse(true))
          yield resp
        }

      case req @ PUT -> Root / "api" / "delivery" / "me" / "merchant" / "profile" =>
        requireRole(req, "merchant") { user =>
          for
            body <- req.as[MerchantProfileBody]
            st <- state.get
            resp <- StoreOps.replaceMerchantProfile(st, user, body.profile) match
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right(ns) => state.set(ns) *> Ok(OkResponse(true))
          yield resp
        }

      case req @ POST -> Root / "api" / "delivery" / "me" / "merchant" / "stores" =>
        requireRole(req, "merchant") { user =>
          for
            body <- req.as[CreateStoreRequest]
            st <- state.get
            resp <- StoreOps.createMerchantStore(st, user, body.storeName, body.address) match
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right((ns, mid)) =>
                state.set(ns) *> Ok(CreateStoreResponse(ok = true, merchantId = mid))
          yield resp
        }

      case req @ GET -> Root / "api" / "delivery" / "overview" =>
        requireRole(req, "admin") { _ =>
          state.get.flatMap { s =>
            Ok(
              OverviewResponse(
                merchants = s.catalogMerchants,
                orders = s.orders,
                riders = s.riders,
                campaigns = s.campaigns,
                complaintTickets = s.complaintTickets
              )
            )
          }
        }

      case req @ GET -> Root / "api" / "delivery" / "orders-panel" =>
        requireRole(req, "admin") { _ =>
          state.get.flatMap { s =>
            Ok(OrdersPanelResponse(orders = s.orders, riders = s.riders))
          }
        }

      case req @ GET -> Root / "api" / "delivery" / "platform-meta" =>
        requireRole(req, "admin") { _ =>
          state.get.flatMap { s =>
            Ok(
              PlatformMetaResponse(
                campaigns = s.campaigns,
                complaintTickets = s.complaintTickets,
                merchantApplications = s.merchantApplications,
                serviceAgents = s.serviceAgents,
                operationsManagers = s.operationsManagers
              )
            )
          }
        }
    }
    routes.orNotFound

  private def bearerToken(req: Request[IO]): Option[String] =
    req.headers.get[Authorization].collect {
      case Authorization(Credentials.Token(AuthScheme.Bearer, t)) => t
    }

  private def withBearer(req: Request[IO])(f: (String, String) => IO[Response[IO]]): IO[Response[IO]] =
    bearerToken(req) match
      case None =>
        unauthorizedJson("缺少 Authorization Bearer token")
      case Some(token) =>
        JwtSupport.verifyToken(token).flatMap {
          case Left(msg)     => unauthorizedJson(msg)
          case Right(pair) => f(pair._1, pair._2)
        }

  private def requireRole(req: Request[IO], expected: String)(use: String => IO[Response[IO]]): IO[Response[IO]] =
    withBearer(req) { (user, role) =>
      if role != expected then Forbidden(ErrorBody("权限不足"))
      else use(user)
    }

  private def buildMeJson(state: AppState, username: String, role: String): Either[String, Json] =
    val store = state.accountStore
    role match
      case "customer" =>
        store.customerAccounts.find(_.username == username) match
          case None => Left("未找到账号")
          case Some(acc) =>
            Right(
              Json.obj(
                "username" -> username.asJson,
                "role" -> role.asJson,
                "customerAccount" -> CustomerAccountPublic(acc.role, acc.username, acc.profile).asJson
              )
            )
      case "merchant" =>
        store.merchantAccounts.find(_.username == username) match
          case None => Left("未找到账号")
          case Some(acc) =>
            Right(
              Json.obj(
                "username" -> username.asJson,
                "role" -> role.asJson,
                "merchantAccount" -> MerchantAccountPublic(acc.role, acc.username, acc.profile).asJson
              )
            )
      case "rider" =>
        store.riderAccounts.find(_.username == username) match
          case None => Left("未找到账号")
          case Some(acc) =>
            Right(
              Json.obj(
                "username" -> username.asJson,
                "role" -> role.asJson,
                "riderAccount" -> RiderAccountPublic(acc.role, acc.username, acc.profile).asJson
              )
            )
      case "admin" =>
        store.adminAccounts.find(_.username == username) match
          case None => Left("未找到账号")
          case Some(acc) =>
            Right(
              Json.obj(
                "username" -> username.asJson,
                "role" -> role.asJson,
                "adminAccount" -> AdminAccountPublic(acc.role, acc.username, acc.displayName).asJson
              )
            )
      case _ => Left("无效角色")

end DeliveryRoutes
