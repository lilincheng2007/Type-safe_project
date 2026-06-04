package delivery.review.tables

import cats.effect.IO

import java.sql.Connection

object MerchantReviewVoteTable:
  def setVote(connection: Connection, reviewId: String, customerId: String, vote: String): IO[Unit] =
    IO.blocking {
      if vote == "none" then
        val statement = connection.prepareStatement("DELETE FROM merchant_review_votes WHERE review_id = ? AND customer_id = ?")
        try
          statement.setString(1, reviewId)
          statement.setString(2, customerId)
          val _ = statement.executeUpdate()
          ()
        finally statement.close()
      else
        val statement = connection.prepareStatement(
          """
            |INSERT INTO merchant_review_votes (review_id, customer_id, vote, updated_at)
            |VALUES (?, ?, ?, now())
            |ON CONFLICT (review_id, customer_id) DO UPDATE SET vote = EXCLUDED.vote, updated_at = now()
            |""".stripMargin
        )
        try
          statement.setString(1, reviewId)
          statement.setString(2, customerId)
          statement.setString(3, vote)
          val _ = statement.executeUpdate()
          ()
        finally statement.close()
    }
