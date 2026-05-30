package delivery.rider.tables.riderassignment

import cats.effect.IO
import delivery.shared.objects.{OrderId, OrderStatus, RiderId}

import java.sql.{Connection, Timestamp}
import java.time.Instant

object RiderAssignmentTable:

  private val upsertSql: String =
    """
      |INSERT INTO rider_assignments (rider_id, order_id, status, completed_at)
      |VALUES (?, ?, ?, ?)
      |ON CONFLICT (rider_id, order_id) DO UPDATE SET
      |  status = EXCLUDED.status,
      |  completed_at = EXCLUDED.completed_at
      |""".stripMargin

  def upsert(connection: Connection, riderId: RiderId, orderId: OrderId, status: OrderStatus): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(upsertSql)
      try
        statement.setString(1, riderId)
        statement.setString(2, orderId)
        statement.setString(3, status.toString)
        if OrderStatus.history.contains(status) then
          statement.setTimestamp(4, Timestamp.from(Instant.now()))
        else statement.setNull(4, java.sql.Types.TIMESTAMP_WITH_TIMEZONE)
        val _ = statement.executeUpdate()
        ()
      finally statement.close()
    }

end RiderAssignmentTable
