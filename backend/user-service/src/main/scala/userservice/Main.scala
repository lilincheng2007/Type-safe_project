package userservice

import cats.effect.{IO, IOApp}
import com.comcast.ip4s.{host, port, Port}
import delivery.db.{DatabaseConfig, DatabasePool, DeliverySnapshotStore}
import delivery.model.JsonCodecs.given
import delivery.model.UserServiceState
import delivery.store.SeedBootstrap
import org.http4s.ember.client.EmberClientBuilder
import org.http4s.ember.server.EmberServerBuilder
import org.typelevel.log4cats.Logger
import org.typelevel.log4cats.slf4j.Slf4jLogger

object Main extends IOApp.Simple:

  private given Logger[IO] = Slf4jLogger.getLogger[IO]

  private def listenPort: Port =
    Port.fromInt(sys.env.get("PORT").flatMap(_.toIntOption).getOrElse(8782)).getOrElse(port"8782")

  private def dbCfg: DatabaseConfig =
    DatabaseConfig.fromEnv.copy(
      databaseName = sys.env.getOrElse("DB_NAME", "delivery_user"),
      poolName = sys.env.getOrElse("DB_POOL_NAME", "user-service-pool")
    )

  def run: IO[Unit] =
    val resources = for
      client <- EmberClientBuilder.default[IO].build
      ds <- DatabasePool.resourceFor(dbCfg)
    yield (client, ds)

    resources.use { case (httpClient, ds) =>
      for
        _ <- DeliverySnapshotStore.migrate(ds)
        initial <- DeliverySnapshotStore.loadOrSeed[UserServiceState](ds, SeedBootstrap.userState)
        ref <- cats.effect.Ref.of[IO, UserServiceState](initial)
        persist = (s: UserServiceState) => DeliverySnapshotStore.save(ds)(s)
        merchantUrl = sys.env.getOrElse("MERCHANT_SERVICE_URL", "http://127.0.0.1:8784")
        riderUrl = sys.env.getOrElse("RIDER_SERVICE_URL", "http://127.0.0.1:8785")
        routes = UserRoutes(httpClient, ref, persist, merchantUrl, riderUrl)
        _ <- Logger[IO].info(s"user-service on 0.0.0.0:${listenPort.value} (DB=${dbCfg.databaseName})")
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
