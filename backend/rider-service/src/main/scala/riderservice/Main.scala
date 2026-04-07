package riderservice

import cats.effect.{IO, IOApp, Ref}
import com.comcast.ip4s.{host, port, Port}
import delivery.db.{DatabaseConfig, DatabasePool, DeliverySnapshotStore}
import delivery.model.JsonCodecs.given
import delivery.model.RiderServiceState
import delivery.store.SeedBootstrap
import org.http4s.ember.server.EmberServerBuilder
import org.typelevel.log4cats.Logger
import org.typelevel.log4cats.slf4j.Slf4jLogger

object Main extends IOApp.Simple:

  private given Logger[IO] = Slf4jLogger.getLogger[IO]

  private def listenPort: Port =
    Port.fromInt(sys.env.get("PORT").flatMap(_.toIntOption).getOrElse(8785)).getOrElse(port"8785")

  private def dbCfg: DatabaseConfig =
    DatabaseConfig.fromEnv.copy(
      databaseName = sys.env.getOrElse("DB_NAME", "delivery_rider"),
      poolName = sys.env.getOrElse("DB_POOL_NAME", "rider-service-pool")
    )

  def run: IO[Unit] =
    DatabasePool.resourceFor(dbCfg).use { ds =>
      for
        _ <- DeliverySnapshotStore.migrate(ds)
        initial <- DeliverySnapshotStore.loadOrSeed[RiderServiceState](ds, SeedBootstrap.riderState)
        ref <- Ref.of[IO, RiderServiceState](initial)
        persist = (s: RiderServiceState) => DeliverySnapshotStore.save(ds)(s)
        routes = RiderRoutes(ref, persist)
        _ <- Logger[IO].info(s"rider-service on 0.0.0.0:${listenPort.value} (DB=${dbCfg.databaseName})")
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
