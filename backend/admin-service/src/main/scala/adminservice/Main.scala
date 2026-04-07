package adminservice

import cats.effect.{IO, IOApp, Ref}
import com.comcast.ip4s.{host, port, Port}
import delivery.db.{DatabaseConfig, DatabasePool, DeliverySnapshotStore}
import delivery.model.JsonCodecs.given
import delivery.model.AdminServiceState
import delivery.store.SeedBootstrap
import org.http4s.ember.client.EmberClientBuilder
import org.http4s.ember.server.EmberServerBuilder
import org.typelevel.log4cats.Logger
import org.typelevel.log4cats.slf4j.Slf4jLogger

object Main extends IOApp.Simple:

  private given Logger[IO] = Slf4jLogger.getLogger[IO]

  private def listenPort: Port =
    Port.fromInt(sys.env.get("PORT").flatMap(_.toIntOption).getOrElse(8786)).getOrElse(port"8786")

  private def dbCfg: DatabaseConfig =
    DatabaseConfig.fromEnv.copy(
      databaseName = sys.env.getOrElse("DB_NAME", "delivery_admin"),
      poolName = sys.env.getOrElse("DB_POOL_NAME", "admin-service-pool")
    )

  def run: IO[Unit] =
    val resources = for
      client <- EmberClientBuilder.default[IO].build
      ds <- DatabasePool.resourceFor(dbCfg)
    yield (client, ds)

    resources.use { case (httpClient, ds) =>
      for
        _ <- DeliverySnapshotStore.migrate(ds)
        initial <- DeliverySnapshotStore.loadOrSeed[AdminServiceState](ds, SeedBootstrap.adminState)
        ref <- Ref.of[IO, AdminServiceState](initial)
        orderUrl = sys.env.getOrElse("ORDER_SERVICE_URL", "http://127.0.0.1:8783")
        merchantUrl = sys.env.getOrElse("MERCHANT_SERVICE_URL", "http://127.0.0.1:8784")
        riderUrl = sys.env.getOrElse("RIDER_SERVICE_URL", "http://127.0.0.1:8785")
        routes = AdminRoutes(httpClient, ref, orderUrl, merchantUrl, riderUrl)
        _ <- Logger[IO].info(s"admin-service on 0.0.0.0:${listenPort.value} (DB=${dbCfg.databaseName})")
        _ <- EmberServerBuilder
          .default[IO]
          .withHost(host"0.0.0.0")
          .withPort(listenPort)
          .withHttpApp(routes.orNotFound)
          .build
          .useForever
      yield ()
    }

end Main
