package delivery

import cats.effect.{IO, IOApp, Ref, Resource}
import cats.syntax.all.*
import com.comcast.ip4s.*
import delivery.shared.db.{DatabasePool, DeliverySnapshotStore}
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.DeliveryState
import org.http4s.ember.server.EmberServerBuilder
import org.http4s.server.middleware.CORS
import org.typelevel.log4cats.Logger
import org.typelevel.log4cats.slf4j.Slf4jLogger

object Main extends IOApp.Simple:

  private given Logger[IO] = Slf4jLogger.getLogger[IO]

  def run: IO[Unit] =
    val app: Resource[IO, Unit] =
      dbBackedServer.handleErrorWith { (err: Throwable) =>
        Resource.eval(Logger[IO].warn(err)("PostgreSQL unavailable, starting with in-memory state")) *>
          inMemoryServer
      }

    app.use(_ => IO.never)

  private def dbBackedServer: Resource[IO, Unit] =
    for
      ds <- DatabasePool.resource
      _ <- Resource.eval(DeliverySnapshotStore.migrate(ds))
      state0 <- Resource.eval(DeliverySnapshotStore.loadOrSeed(ds, DeliveryState.seed))
      ref <- Resource.eval(Ref.of[IO, DeliveryState](state0))
      persist = (state: DeliveryState) => DeliverySnapshotStore.save(ds)(state)
      _ <- buildServer(ref, persist)
    yield ()

  private def inMemoryServer: Resource[IO, Unit] =
    for
      ref <- Resource.eval(Ref.of[IO, DeliveryState](DeliveryState.seed))
      _ <- buildServer(ref, _ => IO.unit)
    yield ()

  private def buildServer(
      ref: Ref[IO, DeliveryState],
      persist: DeliveryState => IO[Unit]
  ): Resource[IO, Unit] =
    val httpApp = CORS.policy.withAllowOriginAll.httpApp(DeliveryRoutes(ref, persist).orNotFound)
    EmberServerBuilder
      .default[IO]
      .withHost(host"0.0.0.0")
      .withPort(port"8787")
      .withHttpApp(httpApp)
      .build
      .evalTap(_ => Logger[IO].info("delivery-backend listening on 0.0.0.0:8787"))
      .map(_ => ())

end Main
