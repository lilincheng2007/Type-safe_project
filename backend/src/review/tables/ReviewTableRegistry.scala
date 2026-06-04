package delivery.review.tables

import cats.effect.IO

import java.sql.Connection

object ReviewTableRegistry:
  def initialize(connection: Connection): IO[Unit] =
    ReviewTableInitializer.initialize(connection)
