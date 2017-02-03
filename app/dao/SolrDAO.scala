package dao

import org.apache.solr.client.solrj.SolrQuery
import org.apache.solr.client.solrj.impl.HttpSolrClient
import scala.collection.JavaConverters._

import javax.inject.Inject

class SolrDAO @Inject() (configuration: play.api.Configuration)  {

  val url = configuration.underlying.getString("solr.url");
  val solr = new HttpSolrClient.Builder(url).build();
  
  val subjectField = configuration.underlying.getString("solr.subject_field");
  
  def query(q:String, rows:Integer, start:Integer) = {
    val query = new SolrQuery()
    query.setQuery(q)
    query.setRows(rows)
    query.setStart(start)
    
    query.setHighlight(true).setHighlightSnippets(1)
    query.setParam("hl.usePhraseHighlighter", true)
    query.setParam("hl.fl", "report_text")
    
    query.setFacet(true)
    query.setFacetMinCount(1)
    query.setFacetLimit(-1)
    query.addFacetField(subjectField)

    val response = solr.query(query);
    val results = response.getResults();
    val highlights = response.getHighlighting();
    val subjectFacet = response.getFacetField(subjectField)
    
    
    response
  }

}