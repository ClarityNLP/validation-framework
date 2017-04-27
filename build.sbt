import play.sbt.PlayImport.PlayKeys._

name := """validation-framework"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala, SbtWeb)

scalaVersion := "2.11.8"

libraryDependencies ++= Seq(
  jdbc,
  cache,
  ws,
  specs2 % Test,
  "org.webjars" %% "webjars-play" % "2.5.0",
  "org.webjars" % "react" % "15.3.2",
  "org.webjars" % "marked" % "0.3.2",
  "org.webjars" % "jquery" % "2.2.4",
  "org.webjars" % "bootstrap" % "3.3.7-1",
  "org.webjars" % "bootswatch-flatly" % "3.3.7",
  "com.codeborne" % "phantomjsdriver" % "1.2.1",
  "org.scalatestplus.play" %% "scalatestplus-play" % "1.5.1" % Test,
  "com.typesafe.play" %% "play-slick" % "2.0.0",
  "org.apache.solr" % "solr-solrj" % "6.3.0",
  "postgresql" % "postgresql" % "9.1-901.jdbc4",
  "org.scalaj" %% "scalaj-http" % "2.3.0"
)

playRunHooks <+= baseDirectory.map(Webpack.apply)

routesGenerator := InjectedRoutesGenerator

excludeFilter in (Assets, JshintKeys.jshint) := "*.js"

watchSources ~= { (ws: Seq[File]) =>
  ws filterNot { path =>
    path.getName.endsWith(".js") || path.getName == ("build")
  }
}

pipelineStages := Seq(digest, gzip)

resolvers += "scalaz-bintray" at "http://dl.bintray.com/scalaz/releases"
