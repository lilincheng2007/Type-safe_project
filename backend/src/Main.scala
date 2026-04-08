package delivery

import cats.effect.{IO, IOApp, Ref, Resource}
import com.comcast.ip4s.*
import delivery.db.{DatabasePool, DeliverySnapshotStore}
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
      for
        ds <- DatabasePool.resource
        _ <- Resource.eval(DeliverySnapshotStore.migrate(ds))
        state0 <- Resource.eval(DeliverySnapshotStore.loadOrSeed(ds, DeliveryState.seed))
        ref <- Resource.eval(Ref.of[IO, DeliveryState](state0))
        persist = (state: DeliveryState) => DeliverySnapshotStore.save(ds)(state)
        httpApp = CORS.policy.withAllowOriginAll.httpApp(DeliveryRoutes(ref, persist).orNotFound)
        _ <- EmberServerBuilder
          .default[IO]
          .withHost(host"0.0.0.0")
          .withPort(port"8787")
          .withHttpApp(httpApp)
          .build
          .evalTap(_ => Logger[IO].info("delivery-backend listening on 0.0.0.0:8787"))
      yield ()

    app.use(_ => IO.never)

end Main
