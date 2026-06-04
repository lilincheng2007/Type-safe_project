package delivery.order.tables.orderchat

import cats.effect.IO

import java.sql.Connection

object OrderChatMessageTableInitializer:
  private val initSql: String =
    """
      |CREATE TABLE IF NOT EXISTS order_chat_messages (
      |  id VARCHAR(80) PRIMARY KEY,
      |  order_id VARCHAR(80) NOT NULL,
      |  sender_role VARCHAR(32) NOT NULL,
      |  peer_role VARCHAR(32) NOT NULL,
      |  message_type VARCHAR(16) NOT NULL CHECK (message_type IN ('text', 'image')),
      |  content TEXT NOT NULL,
      |  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      |  read_at TIMESTAMPTZ
      |);
      |ALTER TABLE order_chat_messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
      |CREATE INDEX IF NOT EXISTS order_chat_messages_order_idx ON order_chat_messages(order_id, created_at ASC);
      |CREATE INDEX IF NOT EXISTS order_chat_messages_unread_idx ON order_chat_messages(peer_role, read_at, order_id);
      |""".stripMargin

  def initialize(connection: Connection): IO[Unit] =
    IO.blocking {
      val statement = connection.createStatement()
      try
        val _ = statement.execute(initSql)
        ()
      finally statement.close()
    }
