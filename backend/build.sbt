ThisBuild / scalaVersion := "3.3.3"
ThisBuild / organization := "com.delivery"
ThisBuild / version := "0.1.0-SNAPSHOT"

/** fork 子进程的 stderr 默认被 sbt 标成 [error]；转发到标准输出，避免 INFO 误判为错误 */
ThisBuild / Compile / run / outputStrategy := Some(StdoutOutput)

val http4sV = "0.23.27"

lazy val commonLibDeps = Seq(
  "org.typelevel" %% "cats-effect" % "3.5.4",
  "org.http4s" %% "http4s-dsl" % http4sV,
  "org.http4s" %% "http4s-ember-server" % http4sV,
  "org.http4s" %% "http4s-ember-client" % http4sV,
  "org.http4s" %% "http4s-circe" % http4sV,
  "io.circe" %% "circe-generic" % "0.14.9",
  "io.circe" %% "circe-parser" % "0.14.9",
  "com.github.jwt-scala" %% "jwt-circe" % "10.0.1",
  "com.zaxxer" % "HikariCP" % "5.1.0",
  "org.postgresql" % "postgresql" % "42.7.4",
  "org.typelevel" %% "log4cats-slf4j" % "2.7.0",
  "org.slf4j" % "slf4j-simple" % "2.0.13"
)

lazy val shared = (project in file("shared")).settings(
  name := "delivery-shared",
  scalacOptions ++= Seq("-deprecation", "-feature", "-unchecked"),
  libraryDependencies ++= commonLibDeps
)

lazy val userService = (project in file("user-service"))
  .dependsOn(shared)
  .settings(
    name := "user-service",
    scalacOptions ++= Seq("-deprecation", "-feature", "-unchecked"),
    Compile / run / mainClass := Some("userservice.Main")
  )

lazy val orderService = (project in file("order-service"))
  .dependsOn(shared)
  .settings(
    name := "order-service",
    scalacOptions ++= Seq("-deprecation", "-feature", "-unchecked"),
    Compile / run / mainClass := Some("orderservice.Main")
  )

lazy val merchantService = (project in file("merchant-service"))
  .dependsOn(shared)
  .settings(
    name := "merchant-service",
    scalacOptions ++= Seq("-deprecation", "-feature", "-unchecked"),
    Compile / run / mainClass := Some("merchantservice.Main")
  )

lazy val riderService = (project in file("rider-service"))
  .dependsOn(shared)
  .settings(
    name := "rider-service",
    scalacOptions ++= Seq("-deprecation", "-feature", "-unchecked"),
    Compile / run / mainClass := Some("riderservice.Main")
  )

lazy val adminService = (project in file("admin-service"))
  .dependsOn(shared)
  .settings(
    name := "admin-service",
    scalacOptions ++= Seq("-deprecation", "-feature", "-unchecked"),
    Compile / run / mainClass := Some("adminservice.Main")
  )

lazy val gateway = (project in file("gateway"))
  .dependsOn(shared)
  .settings(
    name := "gateway",
    scalacOptions ++= Seq("-deprecation", "-feature", "-unchecked"),
    Compile / run / mainClass := Some("gateway.Main")
  )

/** 单 JVM 起全栈（开发用），见 stack/src/.../stack/Main.scala */
lazy val stack = (project in file("stack"))
  .dependsOn(shared, userService, orderService, merchantService, riderService, adminService, gateway)
  .settings(
    name := "stack",
    scalacOptions ++= Seq("-deprecation", "-feature", "-unchecked"),
    Compile / run / mainClass := Some("stack.Main"),
    Compile / run / fork := true
  )

lazy val root = (project in file("."))
  .aggregate(shared, userService, orderService, merchantService, riderService, adminService, gateway, stack)
  .dependsOn(stack)
  .settings(
    name := "delivery-backend-root",
    publish / skip := true,
    /** 在 backend 根目录执行 `sbt run` 时启动全栈（与 `sbt stack/run` 相同） */
    Compile / run / mainClass := Some("stack.Main"),
    Compile / run / fork := true
  )
