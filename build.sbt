name := """validation-framework"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala, SbtWeb)

scalaVersion := "2.11.8"

libraryDependencies ++= Seq(
  jdbc,
  cache,
  ws,
  "org.scalatestplus.play" %% "scalatestplus-play" % "1.5.1" % Test,
  "com.typesafe.play" %% "play-slick" % "2.0.0",
  "org.apache.solr" % "solr-solrj" % "6.3.0",
  "postgresql" % "postgresql" % "9.1-901.jdbc4",
  "org.scalaj" %% "scalaj-http" % "2.3.0"
)
