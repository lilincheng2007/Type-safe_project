package delivery.db

import cats.effect.IO

final case class DatabaseConfig(
    host: String,
    port: Int,
    databaseName: String,
    user: String,
    password: String,
    maxPoolSize: Int,
    connectionTimeoutMs: Long,
    poolName: String
)

object DatabaseConfig:

  extension (config: DatabaseConfig)
    def jdbcUrl: String =
      s"jdbc:postgresql://${config.host}:${config.port}/${config.databaseName}"

  /**
   * 默认按本机常见安装（超级用户 `postgres`）。若使用仓库内 Docker Compose，镜像会创建同名用户；
   * 若你仍使用旧 compose（用户名为 `db`），请设置 `DB_USER=db` `DB_PASSWORD=root`。
   */
  def fromEnv: IO[DatabaseConfig] =
    IO.delay(
      DatabaseConfig(
        host = sys.env.getOrElse("DB_HOST", "127.0.0.1"),
        port = sys.env.get("DB_PORT").flatMap(_.toIntOption).getOrElse(5432),
        databaseName = sys.env.getOrElse("DB_NAME", "delivery_backend"),
        user = sys.env.getOrElse("DB_USER", "postgres"),
        password = sys.env.getOrElse("DB_PASSWORD", "postgres"),
        maxPoolSize = sys.env.get("DB_MAX_POOL_SIZE").flatMap(_.toIntOption).getOrElse(10),
        connectionTimeoutMs = sys.env.get("DB_CONNECTION_TIMEOUT_MS").flatMap(_.toLongOption).getOrElse(3000L),
        poolName = sys.env.getOrElse("DB_POOL_NAME", "delivery-backend-pool")
      )
    )

end DatabaseConfig
