package controllers

import dao.SolrDAO
import javax.inject.Inject
import play.api.libs.json.Json
import play.api.mvc._
import play.api.mvc.Controller
import services.JsonMapper
import services.WebAPIService
 

class SearchController @Inject() (solrDAO: dao.SolrDAO, wepAPIsvc:WebAPIService) extends Controller with JsonMapper {
 
   def index = Action {
    Ok(views.html.index.render("Search", "Begin exploring patient and document level clinical data."))
   }
   
   def queryText(query:String, start:Int, rows:Int) = Action {
     val res = solrDAO.simpleQuery(query, rows, start, null)
     Ok(Json.toJson(res))
   }
   
   def getSubjectDocuments(subjectId:String, highlightQuery:String) = Action {
     val res = solrDAO.querySubjectDocuments(subjectId, highlightQuery)
     Ok(Json.toJson(res))
   }
   
   def getSubjectRecords(subjectId:String) = Action {
     val res = wepAPIsvc.getPersonRecords(subjectId)
     Ok(res)
   }
   
   def getSubjectInfo(subjectId:String) = Action {
    val res = wepAPIsvc.getPersonDemographics(subjectId)
    Ok(res)
   }
   
   def getReport(reportId:String, origQuery:String) = Action {
    val res = solrDAO.querySingleDocument(reportId, origQuery)
    Ok(Json.toJson(res))
   }
   
}