package delivery.admin.tables.storeonboarding

import cats.effect.IO

import java.sql.Connection

object StoreOnboardingRequestTableInitializer:

  private val initTableSql: String =
    """
      |CREATE TABLE IF NOT EXISTS store_onboarding_requests (
      |  id VARCHAR(80) PRIMARY KEY,
      |  owner_username VARCHAR(80) NOT NULL REFERENCES merchant_accounts(username) ON DELETE CASCADE,
      |  store_name VARCHAR(160) NOT NULL,
      |  address TEXT NOT NULL,
      |  description TEXT NOT NULL DEFAULT '',
      |  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      |  status VARCHAR(24) NOT NULL DEFAULT 'pending',
      |  rejection_reason TEXT,
      |  reviewed_by VARCHAR(80),
      |  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      |  reviewed_at TIMESTAMPTZ,
      |  CHECK (status IN ('pending', 'accepted', 'rejected'))
      |);
      |
      |ALTER TABLE store_onboarding_requests ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb;
      |
      |CREATE INDEX IF NOT EXISTS store_onboarding_requests_status_idx ON store_onboarding_requests(status);
      |CREATE INDEX IF NOT EXISTS store_onboarding_requests_owner_username_idx ON store_onboarding_requests(owner_username);
      |""".stripMargin

  def initialize(connection: Connection): IO[Unit] =
    IO.blocking {
      val statement = connection.createStatement()
      try
        val _ = statement.execute(initTableSql)
        ()
      finally statement.close()
    }

end StoreOnboardingRequestTableInitializer
