package models

import java.util.Date

case class Document(reportId:String, source:String, subject:String, reportDate:Date, snippet:String, reportText:String)

case class SolrResults(documentsSize:Long, documents:scala.collection.mutable.ListBuffer[models.Document], subjectFacets:collection.mutable.Map[String, String])