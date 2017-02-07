package dao

import java.util.Date

import scala.collection.JavaConverters._

import org.apache.solr.client.solrj.SolrQuery
import org.apache.solr.client.solrj.SolrQuery.SortClause
import org.apache.solr.client.solrj.impl.HttpSolrClient

import javax.inject.Inject

class SolrDAO @Inject() (configuration: play.api.Configuration)  {

  val url = configuration.underlying.getString("solr.url");
  val solr = new HttpSolrClient.Builder(url).build();
  
  val subjectField = configuration.underlying.getString("solr.subject_field");
  
  def querySubjectDocuments(subjectId:String) = {
    val sort = new SortClause("report_date", "asc")
    query(subjectField + ":" + subjectId, 1000, 0, sort)
  }
  
  def query(q:String, rows:Integer, start:Integer, sort:SortClause) = {
    val query = new SolrQuery()
    query.setQuery(q)
    query.setRows(rows)
    query.setStart(start)
    if (sort != null) {
      query.setSort(sort)
    }
    
    query.setHighlight(true).setHighlightSnippets(1)
    query.setParam("hl.usePhraseHighlighter", true)
    query.setParam("hl.fl", "report_text")
    query.setParam("hl.simple.pre", "<b>")
    query.setParam("hl.simple.post", "</b>")
    
    
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
          val doc = new models.Document(resDoc.getFieldValue("id").toString(),
              resDoc.getFieldValue("source").toString(),
              resDoc.getFieldValue(subjectField).toString(),
              resDoc.getFieldValue("report_date").asInstanceOf[Date],
              snippet,
              resDoc.getFieldValue("report_text").toString())
          docs += doc
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