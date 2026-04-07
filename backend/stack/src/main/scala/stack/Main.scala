package stack

import cats.effect.{IO, IOApp, Ref, Resource}
import cats.syntax.all.*
import com.comcast.ip4s.*
import delivery.db.{DatabaseConfig, DatabasePool, DeliverySnapshotStore}
import delivery.model.JsonCodecs.given
import delivery.model.*
import delivery.store.SeedBootstrap
import merchantservice.MerchantRoutes
import orderservice.OrderRoutes
import org.http4s.ember.client.EmberClientBuilder
import org.http4s.ember.server.EmberServerBuilder
import org.http4s.server.Server
import org.http4s.server.middleware.CORS
import org.typelevel.log4cats.Logger
import org.typelevel.log4cats.slf4j.Slf4jLogger
import userservice.UserRoutes
import adminservice.AdminRoutes
import gateway.GatewayRoutes
import riderservice.RiderRoutes

/**
 * 本地一键启动：单进程内监听 6 个业务端口 + 网关 8787，每服务连接各自 DB（与独立 Main 一致）。
 * 使用：`cd backend && sbt stack/run`
 */
object Main extends IOApp.Simple:

  private given Logger[IO] = Slf4jLogger.getLogger[IO]

  private def cfg(db: String, pool: String): DatabaseConfig =
    DatabaseConfig.fromEnv.copy(databaseName = db, poolName = pool)

  private def serve(name: String, port: Int, app: org.http4s.HttpApp[IO]): Resource[IO, Server] =
    val p = Port.fromInt(port).getOrElse(port"8787")
    EmberServerBuilder
      .default[IO]
      .withHost(host"0.0.0.0")
      .withPort(p)
      .withHttpApp(app)
      .build
      .evalTap(_ => Logger[IO].info(s"$name listening on 0.0.0.0:$port"))

  def run: IO[Unit] =
    val userUrl = "http://127.0.0.1:8782"
    val orderUrl = "http://127.0.0.1:8783"
    val merchantUrl = "http://127.0.0.1:8784"
    val riderUrl = "http://127.0.0.1:8785"
    val adminUrl = "http://127.0.0.1:8786"

    val stackApp: Resource[IO, Unit] =
      for
        client <- EmberClientBuilder.default[IO].build
        dsUser <- DatabasePool.resourceFor(cfg("delivery_user", "stack-user-pool"))
        dsOrder <- DatabasePool.resourceFor(cfg("delivery_order", "stack-order-pool"))
        dsMerchant <- DatabasePool.resourceFor(cfg("delivery_merchant", "stack-merchant-pool"))
        dsRider <- DatabasePool.resourceFor(cfg("delivery_rider", "stack-rider-pool"))
        dsAdmin <- DatabasePool.resourceFor(cfg("delivery_admin", "stack-admin-pool"))
        _ <- Resource.eval(DeliverySnapshotStore.migrate(dsUser))
        _ <- Resource.eval(DeliverySnapshotStore.migrate(dsOrder))
        _ <- Resource.eval(DeliverySnapshotStore.migrate(dsMerchant))
        _ <- Resource.eval(DeliverySnapshotStore.migrate(dsRider))
        _ <- Resource.eval(DeliverySnapshotStore.migrate(dsAdmin))
        u0 <- Resource.eval(DeliverySnapshotStore.loadOrSeed(dsUser, SeedBootstrap.userState))
        o0 <- Resource.eval(DeliverySnapshotStore.loadOrSeed(dsOrder, SeedBootstrap.orderState))
        m0 <- Resource.eval(DeliverySnapshotStore.loadOrSeed(dsMerchant, SeedBootstrap.merchantState))
        r0 <- Resource.eval(DeliverySnapshotStore.loadOrSeed(dsRider, SeedBootstrap.riderState))
        a0 <- Resource.eval(DeliverySnapshotStore.loadOrSeed(dsAdmin, SeedBootstrap.adminState))
        refU <- Resource.eval(Ref.of[IO, UserServiceState](u0))
        refO <- Resource.eval(Ref.of[IO, OrderServiceState](o0))
        refM <- Resource.eval(Ref.of[IO, MerchantServiceState](m0))
        refR <- Resource.eval(Ref.of[IO, RiderServiceState](r0))
        refA <- Resource.eval(Ref.of[IO, AdminServiceState](a0))
        persistU = (s: UserServiceState) => DeliverySnapshotStore.save(dsUser)(s)
        persistO = (s: OrderServiceState) => DeliverySnapshotStore.save(dsOrder)(s)
        persistM = (s: MerchantServiceState) => DeliverySnapshotStore.save(dsMerchant)(s)
        persistR = (s: RiderServiceState) => DeliverySnapshotStore.save(dsRider)(s)
        persistA = (s: AdminServiceState) => DeliverySnapshotStore.save(dsAdmin)(s)
        userApp = UserRoutes(client, refU, persistU, merchantUrl, riderUrl).orNotFound
        orderApp = OrderRoutes(client, refO, persistO, userUrl, merchantUrl).orNotFound
        merchantApp = MerchantRoutes(refM, persistM).orNotFound
        riderApp = RiderRoutes(refR, persistR).orNotFound
        adminApp = AdminRoutes(client, refA, orderUrl, merchantUrl, riderUrl).orNotFound
        gwU = org.http4s.Uri.unsafeFromString(userUrl)
        gwO = org.http4s.Uri.unsafeFromString(orderUrl)
        gwM = org.http4s.Uri.unsafeFromString(merchantUrl)
        gwR = org.http4s.Uri.unsafeFromString(riderUrl)
        gwA = org.http4s.Uri.unsafeFromString(adminUrl)
        gatewayApp = CORS.policy.withAllowOriginAll.httpApp(
          GatewayRoutes(client, gwU, gwO, gwM, gwR, gwA).orNotFound
        )
        _ <- serve("user-service", 8782, userApp)
        _ <- serve("order-service", 8783, orderApp)
        _ <- serve("merchant-service", 8784, merchantApp)
        _ <- serve("rider-service", 8785, riderApp)
        _ <- serve("admin-service", 8786, adminApp)
        _ <- serve("gateway", 8787, gatewayApp)
      yield ()

    stackApp.use { _ =>
      Logger[IO].info(
        "stack: user 8782, order 8783, merchant 8784, rider 8785, admin 8786, gateway 8787"
      ) *> IO.never
    }

end Main
