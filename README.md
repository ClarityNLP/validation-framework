## Validation Framework

TODO - this documentation needs to be expanded

#### To prepare javascript
```
npm install
```
Note: We are transitioning from Angular to React.

If you see errors with webpack, you may need to instal webpack globally. 
```
npm install --global webpack
```

#### Requirements
- Relational patient database in [OMOP format](https://www.ohdsi.org/data-standardization/the-common-data-model/)
- Local Postgres DB/schema, set up with `app/sql` scripts
- Local OHDSI WebAPI pointing to this branch `patient-records-addon` [(Link)](https://github.com/OHDSI/WebAPI/tree/patient-records-addon)
  - Note: Standard OHDSI WebAPI doesn't pull out patient-level data
- Patient note data stored in [Solr 6.x+](http://lucene.apache.org/solr/)
  - Simple guide [here](simple-solr-setup.md)

#### To compile

```
sbt compile
```

#### To run (default conf)

```
sbt run
```

#### To run (external conf) - Recommended
Copy `conf/application.conf` to a another local directory and modify values.

```
sbt "run -Dconfig.file=/opt/conf/prod.conf"
```

#### To run with Eclipse Debugging
```
sbt -jvm-debug 9999 "run -Dconfig.file=/opt/conf/prod.conf"
```

Then setup a new Debug Configuration, as a Remote Java Application on this project on localhost:9999
