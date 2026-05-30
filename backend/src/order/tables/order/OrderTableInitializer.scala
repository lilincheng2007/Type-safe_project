package delivery.order.tables.order

import cats.effect.IO
import delivery.shared.objects.OrderStatus

import java.sql.Connection

object OrderTableInitializer:

  private val orderStatusSql: String = OrderStatus.values.map(status => s"'${status.toString}'").mkString(", ")

  private val initTableSql: String =
    s"""
      |CREATE TABLE IF NOT EXISTS orders (
      |  id VARCHAR(80) PRIMARY KEY,
      |  customer_id VARCHAR(80) NOT NULL,
      |  customer_name VARCHAR(120) NOT NULL,
      |  customer_phone VARCHAR(40) NOT NULL,
      |  merchant_id VARCHAR(80) NOT NULL,
      |  rider_id VARCHAR(80),
      |  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
      |  delivery_address TEXT NOT NULL,
      |  status VARCHAR(32) NOT NULL CHECK (status IN ($orderStatusSql)),
      |  placed_at VARCHAR(40) NOT NULL,
      |  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      |  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      |);
      |
      |CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders(customer_id);
      |CREATE INDEX IF NOT EXISTS orders_merchant_id_idx ON orders(merchant_id);
      |CREATE INDEX IF NOT EXISTS orders_rider_id_idx ON orders(rider_id);
      |CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
      |""".stripMargin

  def initialize(connection: Connection): IO[Unit] =
    IO.blocking {
      val statement = connection.createStatement()
      try
        val _ = statement.execute(initTableSql)
        ()
      finally statement.close()
    }

end OrderTableInitializer
