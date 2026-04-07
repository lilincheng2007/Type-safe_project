package merchantservice

import cats.effect.{IO, IOApp, Ref}
import com.comcast.ip4s.{host, port, Port}
import delivery.db.{DatabaseConfig, DatabasePool, DeliverySnapshotStore}
import delivery.model.JsonCodecs.given
import delivery.model.MerchantServiceState
import delivery.store.SeedBootstrap
import org.http4s.ember.server.EmberServerBuilder
import org.typelevel.log4cats.Logger
import org.typelevel.log4cats.slf4j.Slf4jLogger

object Main extends IOApp.Simple:

  private given Logger[IO] = Slf4jLogger.getLogger[IO]

  private def listenPort: Port =
    Port.fromInt(sys.env.get("PORT").flatMap(_.toIntOption).getOrElse(8784)).getOrElse(port"8784")

  private def dbCfg: DatabaseConfig =
    DatabaseConfig.fromEnv.copy(
      databaseName = sys.env.getOrElse("DB_NAME", "delivery_merchant"),
      poolName = sys.env.getOrElse("DB_POOL_NAME", "merchant-service-pool")
    )

  def run: IO[Unit] =
    DatabasePool.resourceFor(dbCfg).use { ds =>
      for
        _ <- DeliverySnapshotStore.migrate(ds)
        initial <- DeliverySnapshotStore.loadOrSeed[MerchantServiceState](ds, SeedBootstrap.merchantState)
        ref <- Ref.of[IO, MerchantServiceState](initial)
        persist = (s: MerchantServiceState) => DeliverySnapshotStore.save(ds)(s)
        routes = MerchantRoutes(ref, persist)
        _ <- Logger[IO].info(s"merchant-service on 0.0.0.0:${listenPort.value} (DB=${dbCfg.databaseName})")
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
