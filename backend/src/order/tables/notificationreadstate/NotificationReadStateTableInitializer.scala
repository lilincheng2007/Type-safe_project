package delivery.order.tables.notificationreadstate

import cats.effect.IO

import java.sql.Connection

object NotificationReadStateTableInitializer:
  private val initSql: String =
    """
      |CREATE TABLE IF NOT EXISTS notification_read_states (
      |  owner_username VARCHAR(120) NOT NULL,
      |  notification_id TEXT NOT NULL,
      |  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      |  PRIMARY KEY (owner_username, notification_id)
      |);
      |CREATE INDEX IF NOT EXISTS notification_read_states_owner_idx ON notification_read_states(owner_username, read_at DESC);
      |""".stripMargin

  def initialize(connection: Connection): IO[Unit] =
    IO.blocking {
      val statement = connection.createStatement()
      try
        val _ = statement.execute(initSql)
        ()
      finally statement.close()
    }

end NotificationReadStateTableInitializer
