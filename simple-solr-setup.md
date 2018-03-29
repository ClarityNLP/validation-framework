# Setting up a local Solr Cloud instance

* [Install Solr](https://cwiki.apache.org/confluence/display/solr/Installing+Solr)
* [Setup Solr Cloud](https://cwiki.apache.org/confluence/display/solr/Installing+Solr)
    * e.g. `bin/solr -e cloud`
    * Since this is local, you can use all the defaults, except the core name, instead of `gettingstarted` use `report_core`
* Solr is now running at [http://localhost:8983](http://localhost:8983) (Zookeeper on port 9983)
* Setup custom tokenized field type
```bash
curl -X POST -H 'Content-type:application/json' --data-binary '{
  "add-field-type" : {
     "name":"searchText",
     "class":"solr.TextField",
     "positionIncrementGap":"100",
     "analyzer" : {
        "charFilters":[{
           "class":"solr.PatternReplaceCharFilterFactory",
           "replacement":"$1$1",
           "pattern":"([a-zA-Z])\\\\1+" }],
        "tokenizer":{
           "class":"solr.WhitespaceTokenizerFactory" },
        "filters":[{
           "class":"solr.WordDelimiterFilterFactory",
           "preserveOriginal":"0" }]}}
}' http://localhost:8983/solr/report_core/schema
```
* Add standard fields
```bash
curl -X POST -H 'Content-type:application/json' --data-binary '{
  "add-field":{"name":"report_date","type":"date","indexed":true,"stored":true},
"add-field":{"name":"report_id","type":"string","indexed":true,"stored":true},
"add-field":{"name":"report_text","type":"searchText","indexed":true,"stored":true,"termPositions":true,"termVectors":true,"docValues":false,"required":true},
"add-field":{"name":"source","type":"string","indexed":true,"stored":true},
"add-field":{"name":"subject","type":"string","indexed":true,"stored":true},"add-field":{"name":"report_type","type":"string","indexed":true,"stored":true}
}' http://localhost:8983/solr/report_core/schema
```
* Add dynamic fields
```bash
curl -X POST -H 'Content-type:application/json' --data-binary '{
 "add-dynamic-field":{"name":"*_section","type":"searchText","indexed":true,"stored":false},
"add-dynamic-field":{"name":"*_id","type":"long","indexed":true,"stored":true},
"add-dynamic-field":{"name":"*_ids","type":"long","multiValued":true,"indexed":true,"stored":true},
"add-dynamic-field":{"name":"*_system","type":"string","indexed":true,"stored":true},
"add-dynamic-field":{"name":"*_attr","type":"string","indexed":true,"stored":true},
"add-dynamic-field":{"name":"*_attrs","type":"string","multiValued":true,"indexed":true,"stored":true}
}' http://localhost:8983/solr/report_core/schema
```
* Load data into Solr
    * See sample [here](https://github.com/ClarityNLP/nlp-data-loader/blob/master/src/main/scala/gtri/nlp/data/ingest/CSVLoader.scala) for loading notes from the MIMIC data set
* To stop Solr
`bin/solr stop -all`
* To start Solr cloud non-interactively
`bin/solr -e cloud -noprompt`
* Deleting documents
`curl "http://localhost:8983/solr/cotiviti/update?commit=true" -H "Content-Type: text/xml" --data-binary '<delete><query>*:*</query></delete>'`
