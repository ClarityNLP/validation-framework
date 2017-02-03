## Validation Framework

#### To compile

```
sbt compile
```

#### To run (default conf)

```
sbt run
```

#### To run (external conf)

```
sbt "run -Dconfig.file=/opt/conf/prod.conf"
```

#### To run with Eclipse Debugging
```
sbt -jvm-debug 9999 "run -Dconfig.file=/opt/conf/prod.conf"
```

Then setup a new Debug Configuration, as a Remote Java Application on this project on localhost:9999