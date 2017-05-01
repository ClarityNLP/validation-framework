import play.sbt.PlayImport.PlayKeys._

name := """validation-framework"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala, SbtWeb)

scalaVersion := "2.11.8"

libraryDependencies ++= Seq(
  jdbc,
  cache,
  ws,
  filters,
  specs2 % Test,
  "org.pac4j" % "play-pac4j" % "3.0.0-RC2",
  "org.pac4j" % "pac4j-http" % "2.0.0-RC2",
  "org.pac4j" % "pac4j-cas" % "2.0.0-RC2",
  "org.pac4j" % "pac4j-openid" % "2.0.0-RC2" exclude("xml-apis" , "xml-apis"),
  "org.pac4j" % "pac4j-oauth" % "2.0.0-RC2",
  "org.pac4j" % "pac4j-saml" % "2.0.0-RC2",
  "org.pac4j" % "pac4j-oidc" % "2.0.0-RC2" exclude("commons-io" , "commons-io"),
  "org.pac4j" % "pac4j-gae" % "2.0.0-RC2",
  "org.pac4j" % "pac4j-jwt" % "2.0.0-RC2" exclude("commons-io" , "commons-io"),
  "org.pac4j" % "pac4j-ldap" % "2.0.0-RC2",
  "org.pac4j" % "pac4j-sql" % "2.0.0-RC2",
  "org.pac4j" % "pac4j-mongo" % "2.0.0-RC2",
  "org.pac4j" % "pac4j-stormpath" % "2.0.0-RC2",
  "com.typesafe.play" % "play-cache_2.11" % "2.5.4",
  "org.webjars" %% "webjars-play" % "2.5.0",
  "org.webjars" % "react" % "15.3.2",
  "org.webjars" % "marked" % "0.3.2",
  "org.webjars" % "jquery" % "2.2.4",
  "org.webjars" % "bootstrap" % "3.3.7-1",
  "com.codeborne" % "phantomjsdriver" % "1.2.1",
  "org.scalatestplus.play" %% "scalatestplus-play" % "1.5.1" % Test,
  "com.typesafe.play" %% "play-slick" % "2.0.0",
  "org.apache.solr" % "solr-solrj" % "6.3.0",
  "postgresql" % "postgresql" % "9.1-901.jdbc4",
  "org.scalaj" %% "scalaj-http" % "2.3.0",
  "commons-io" % "commons-io" % "2.5",
  "com.roundeights" %% "hasher" % "1.2.0"
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

resolvers ++= Seq(Resolver.mavenLocal, "scalaz-bintray" at "http://dl.bintray.com/scalaz/releases", "Sonatype snapshots repository" at "https://oss.sonatype.org/content/repositories/snapshots/")

fork in run := true
