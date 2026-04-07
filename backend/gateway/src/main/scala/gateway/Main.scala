package gateway

import cats.effect.{IO, IOApp}
import com.comcast.ip4s.{host, port, Port}
import org.http4s.Uri
import org.http4s.ember.client.EmberClientBuilder
import org.http4s.ember.server.EmberServerBuilder
import org.http4s.server.middleware.CORS
import org.typelevel.log4cats.Logger
import org.typelevel.log4cats.slf4j.Slf4jLogger

object Main extends IOApp.Simple:

  private given Logger[IO] = Slf4jLogger.getLogger[IO]

  private def listenPort: Port =
    Port.fromInt(sys.env.get("PORT").flatMap(_.toIntOption).getOrElse(8787)).getOrElse(port"8787")

  private def parseBase(envKey: String, defaultValue: String): Uri =
    Uri.unsafeFromString(sys.env.getOrElse(envKey, defaultValue).stripSuffix("/"))

  def run: IO[Unit] =
    EmberClientBuilder.default[IO].build.use { client =>
      val userBase = parseBase("USER_SERVICE_URL", "http://127.0.0.1:8782")
      val orderBase = parseBase("ORDER_SERVICE_URL", "http://127.0.0.1:8783")
      val merchantBase = parseBase("MERCHANT_SERVICE_URL", "http://127.0.0.1:8784")
      val riderBase = parseBase("RIDER_SERVICE_URL", "http://127.0.0.1:8785")
      val adminBase = parseBase("ADMIN_SERVICE_URL", "http://127.0.0.1:8786")
      val routes = GatewayRoutes(client, userBase, orderBase, merchantBase, riderBase, adminBase)
      val httpApp = CORS.policy.withAllowOriginAll.httpApp(routes.orNotFound)
      for
        _ <- Logger[IO].info(
          s"api-gateway on 0.0.0.0:${listenPort.value} -> user/order/merchant/rider/admin"
        )
        _ <- EmberServerBuilder
          .default[IO]
          .withHost(host"0.0.0.0")
          .withPort(listenPort)
          .withHttpApp(httpApp)
          .build
          .useForever
      yield ()
    }

end Main
