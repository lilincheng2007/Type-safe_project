package delivery.db

import cats.effect.IO
import cats.syntax.all.*
import io.circe.parser.decode
import io.circe.syntax.*
import io.circe.{Decoder, Encoder}
import org.postgresql.util.PGobject
import org.typelevel.log4cats.Logger

import javax.sql.DataSource
import java.sql.Connection

/** 将任意快照类型 `S` 以 JSONB 单行持久化（每微服务独立数据库实例）。 */
object DeliverySnapshotStore:

  private val tableSql: String =
    """CREATE TABLE IF NOT EXISTS delivery_app_state (
      |  singleton SMALLINT PRIMARY KEY CHECK (singleton = 1),
      |  payload JSONB NOT NULL
      |)""".stripMargin

  def migrate(ds: DataSource)(using log: Logger[IO]): IO[Unit] =
    IO.blocking {
      val c = ds.getConnection()
      try
        val st = c.createStatement()
        try
          val _ = st.execute(tableSql)
          ()
        finally st.close()
      finally c.close()
    }.flatTap(_ => log.info("DB schema ready (delivery_app_state)"))

  def load[S: Decoder](ds: DataSource)(using log: Logger[IO]): IO[Option[S]] =
    IO.blocking {
      val c = ds.getConnection()
      try
        val ps = c.prepareStatement("SELECT payload::text FROM delivery_app_state WHERE singleton = 1")
        try
          val rs = ps.executeQuery()
          if rs.next() then Some(rs.getString(1)) else None
        finally ps.close()
      finally c.close()
    }.flatMap {
      case None => IO.pure(None)
      case Some(raw) =>
        decode[S](raw) match
          case Left(err) =>
            log.error(err)(s"Failed to decode snapshot from DB: ${err.getMessage}") *>
              IO.raiseError(new IllegalStateException(err.getMessage))
          case Right(st) => IO.pure(Some(st))
    }

  def loadOrSeed[S: Encoder: Decoder](ds: DataSource, seed: S)(using log: Logger[IO]): IO[S] =
    load[S](ds).flatMap {
      case Some(st) => IO.pure(st)
      case None     => log.info("No snapshot row; inserting seed data") *> save(ds)(seed).as(seed)
    }

  def save[S: Encoder](ds: DataSource)(state: S)(using Logger[IO]): IO[Unit] =
    IO.blocking {
      val json = state.asJson.noSpaces
      val pg = PGobject()
      pg.setType("jsonb")
      pg.setValue(json)
      withConnection(ds) { c =>
        val ps = c.prepareStatement(
          """INSERT INTO delivery_app_state (singleton, payload) VALUES (1, ?)
            |ON CONFLICT (singleton) DO UPDATE SET payload = EXCLUDED.payload""".stripMargin
        )
        try
          ps.setObject(1, pg)
          ps.executeUpdate()
        finally ps.close()
      }
    }

  private def withConnection[A](ds: DataSource)(f: Connection => A): A =
    val c = ds.getConnection()
    try f(c)
    finally c.close()

end DeliverySnapshotStore
