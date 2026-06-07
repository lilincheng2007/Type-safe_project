package delivery.order.tables.notificationreadstate

import cats.effect.IO
import cats.syntax.all.*

import java.sql.Connection

object NotificationReadStateTable:
  private val insertSql: String =
    """
      |INSERT INTO notification_read_states (owner_username, notification_id, read_at)
      |VALUES (?, ?, now())
      |ON CONFLICT (owner_username, notification_id) DO UPDATE SET read_at = now()
      |""".stripMargin

  def listReadIds(connection: Connection, ownerUsername: String): IO[List[String]] =
    IO.blocking {
      val statement = connection.prepareStatement(
        """
          |SELECT notification_id
          |FROM notification_read_states
          |WHERE owner_username = ?
          |ORDER BY read_at DESC
          |LIMIT 1000
          |""".stripMargin
      )
      try
        statement.setString(1, ownerUsername)
        val rs = statement.executeQuery()
        try
          val builder = List.newBuilder[String]
          while rs.next() do builder += rs.getString("notification_id")
          builder.result()
        finally rs.close()
      finally statement.close()
    }

  def markRead(connection: Connection, ownerUsername: String, notificationId: String): IO[Unit] =
    if notificationId.trim.isEmpty then IO.unit
    else
      IO.blocking {
        val statement = connection.prepareStatement(insertSql)
        try
          statement.setString(1, ownerUsername)
          statement.setString(2, notificationId.trim.take(500))
          val _ = statement.executeUpdate()
          ()
        finally statement.close()
      }

  def markAllRead(connection: Connection, ownerUsername: String, notificationIds: List[String]): IO[Unit] =
    notificationIds.map(_.trim).filter(_.nonEmpty).distinct.take(600).foldLeft(IO.unit) { (acc, id) =>
      acc >> markRead(connection, ownerUsername, id)
    }

end NotificationReadStateTable
