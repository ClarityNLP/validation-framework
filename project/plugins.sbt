resolvers += "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/"
resolvers += "JBoss" at "https://repository.jboss.org/"

// The Play plugin
addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.5.10")


// the eclipse plugin
addSbtPlugin("com.typesafe.sbteclipse" % "sbteclipse-plugin" % "4.0.0")

// web plugins

// Compiles CoffeeScript: https://github.com/sbt/sbt-coffeescript
addSbtPlugin("com.typesafe.sbt" % "sbt-coffeescript" % "1.0.0")

// "Less" CSS compiler: https://github.com/sbt/sbt-less
addSbtPlugin("com.typesafe.sbt" % "sbt-less" % "1.1.0")

// Lint your JavaScript files: https://github.com/sbt/sbt-jshint
addSbtPlugin("com.typesafe.sbt" % "sbt-jshint" % "1.0.4")

// RequireJS optimizes JS and CSS inclusions: https://github.com/sbt/sbt-rjs
addSbtPlugin("com.typesafe.sbt" % "sbt-rjs" % "1.0.8")

// Asset fingerprinting allows aggressive caching: https://github.com/sbt/sbt-digest
addSbtPlugin("com.typesafe.sbt" % "sbt-digest" % "1.1.1")

// Javascript unit-testing support: https://github.com/sbt/sbt-mocha and https://mochajs.org/
addSbtPlugin("com.typesafe.sbt" % "sbt-mocha" % "1.1.0")

// "Sass" CSS scripting: https://github.com/irundaia/sbt-sassify
addSbtPlugin("org.irundaia.sbt" % "sbt-sassify" % "1.4.6")

addSbtPlugin("com.typesafe.sbt" % "sbt-gzip" % "1.0.0")

addSbtPlugin("org.ensime" % "sbt-ensime" % "1.12.9")

addSbtPlugin("com.github.mpeltonen" % "sbt-idea" % "1.6.0")
