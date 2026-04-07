import cats.effect.{IO, IOApp, Ref}
import com.comcast.ip4s.{Port, host, port}
import delivery.http.DeliveryRoutes
import delivery.model.AppState
import delivery.store.AccountStoreBuilder
import org.http4s.server.middleware.CORS
import org.http4s.ember.server.EmberServerBuilder
import org.typelevel.log4cats.Logger
import org.typelevel.log4cats.slf4j.Slf4jLogger

object Main extends IOApp.Simple:

  private given Logger[IO] = Slf4jLogger.getLogger[IO]

  def run: IO[Unit] =
    val portNum =
      Option(System.getenv("PORT")).flatMap(_.toIntOption).filter(_ > 0).getOrElse(8787)
    val listenPort = Port.fromInt(portNum).getOrElse(port"8787")

    for
      ref <- Ref.of[IO, AppState](AccountStoreBuilder.initialAppState)
      httpApp0 = DeliveryRoutes(ref)
      httpApp = CORS.policy.withAllowOriginAll.httpApp(httpApp0)
      _ <- Logger[IO].info(s"delivery-backend listening on 0.0.0.0:$portNum (set PORT to override)")
      _ <- EmberServerBuilder
        .default[IO]
        .withHost(host"0.0.0.0")
        .withPort(listenPort)
        .withHttpApp(httpApp)
        .build
        .useForever
    yield ()

end Main
