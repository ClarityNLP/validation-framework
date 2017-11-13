package dao

import java.util.Date

import scala.collection.JavaConverters._

import org.apache.solr.client.solrj.SolrQuery
import org.apache.solr.client.solrj.SolrQuery.SortClause
import org.apache.solr.client.solrj.impl.HttpSolrClient
import org.apache.solr.client.solrj.impl.CloudSolrClient

import javax.inject.Inject

class SolrDAO @Inject() (configuration: play.api.Configuration)  {

  val url: String = configuration.underlying.getString("solr.url")
  val core: String = configuration.underlying.getString("ohdsi.default.core")
  //val solr = new HttpSolrClient.Builder(url).build()

  val solr: CloudSolrClient = new CloudSolrClient.Builder()
      .withZkHost(url)
      .build()
  solr.setDefaultCollection(core)
  
  val subjectField: String = configuration.underlying.getString("solr.subject_field")
  val reportField: String = configuration.underlying.getString("solr.report_id_field")
  
  def querySubjectDocuments(subjectId:String, highlightQuery:String):models.SolrResults = {
    val sort = new SortClause("report_date", "asc")
    val q = if (highlightQuery != null && highlightQuery.trim().length() > 0) {
      highlightQuery
    } else {
      "*:*"
    }
    query(q, subjectField + ":" + subjectId, 1000, 0, sort,"0", "full-highlighting")
  }
  
  def querySingleDocument(id:String, highlightQuery:String):models.SolrResults = {
    val q = if (highlightQuery != null && highlightQuery.trim().length() > 0) {
      highlightQuery
    } else {
      "*:*"
    }
    query(q, reportField + ":" + id, 1, 0, null, "0", "full-highlighting")
  }
  
  def simpleQuery(q:String, rows:Integer, start:Integer, sort:SortClause):models.SolrResults = {
    query(q, null, rows, start, sort, "100", "full-highlighting")
  }
  
  def query(q:String, fq:String, rows:Integer, start:Integer, sort:SortClause, highlightFragSize:String, highlightClass:String):models.SolrResults = {
    val query = new SolrQuery()
    query.setQuery(q)
    if (fq != null) {
      query.setFilterQueries(fq)
    }
    query.setRows(rows)
    query.setStart(start)
    if (sort != null) {
      query.setSort(sort)
    }
    
    query.setHighlight(true).setHighlightSnippets(1)
    query.setParam("hl.usePhraseHighlighter", true)
    query.setParam("hl.fl", "report_text")
    query.setParam("hl.simple.pre", "<span class=\"" + highlightClass + "\">")
    query.setParam("hl.simple.post", "</span>")
    query.setParam("hl.fragsize", highlightFragSize);
    
    
    query.setFacet(true)
    query.setFacetMinCount(1)
    query.setFacetLimit(-1)
    query.addFacetField(subjectField)
    
    val docs = new scala.collection.mutable.ListBuffer[models.Document]()
    val subjectFacets = collection.mutable.Map[String, String]()
    var numFound = 0.toLong
    
    try {
      val response = solr.query(query);
      
      if (response != null) {
        val results = response.getResults();
        numFound = results.getNumFound()
        val highlights = response.getHighlighting();
        val resultsIterator = results.iterator()
        while (resultsIterator.hasNext()) {
          val resDoc = resultsIterator.next()
          val id = resDoc.getFieldValue("id").toString()
          val snippetMap = highlights.get(id)
          val snippet = if (snippetMap != null && snippetMap.containsKey("report_text")) {
            val reportSnippet = snippetMap.get("report_text")
            if (reportSnippet != null && reportSnippet.size() > 0) {
              reportSnippet.get(0)
            } else {
              ""
            }
          } else {
            ""
          }
          val txt = resDoc.getFieldValue("report_text").toString().trim()
          if (txt.length > 0) {
            val doc = new models.Document(resDoc.getFieldValue("id").toString(),
                resDoc.getFieldValue("source").toString(),
                resDoc.getFieldValue(subjectField).toString(),
                resDoc.getFieldValue("report_date").asInstanceOf[Date],
                snippet,
                txt)
            
            docs += doc
          }
        }
        
        val subjectFacet = response.getFacetField(subjectField)
        val ffcount = subjectFacet.getValueCount()
        val counts = subjectFacet.getValues()
        val subjectIterator = counts.iterator()
        while (subjectIterator.hasNext()) {
          val c = subjectIterator.next()
          val facetLabel = c.getName();
          val facetCount = c.getCount();
          
          subjectFacets.put(facetLabel, facetCount.toString())
        }
      }
    } catch {
      case e:Exception => e.printStackTrace()
    }
    
    new models.SolrResults(numFound, docs, subjectFacets)
  }

}