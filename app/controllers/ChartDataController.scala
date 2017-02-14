package controllers

import dao.SolrDAO
import javax.inject.Inject
import play.api.libs.json.Json
import play.api.mvc._
import play.api.mvc.Controller
import services.JsonMapper
import services.WebAPIService

class ChartDataController @Inject() (solrDAO: dao.SolrDAO, wepAPIsvc:WebAPIService) extends Controller with JsonMapper {
   def getSubjectDocuments(subjectId:String, highlightQuery:String) = Action {
     val res = solrDAO.querySubjectDocuments(subjectId, highlightQuery)
     Ok(Json.toJson(res))
   }
   
   def getSubjectRecords(subjectId:String, useSourceValue:String) = Action {
     val res = wepAPIsvc.getPersonRecords(subjectId, useSourceValue)
     Ok(res)
   }
   
   def getSubjectInfo(subjectId:String, useSourceValue:String) = Action {
    val res = wepAPIsvc.getPersonDemographics(subjectId, useSourceValue)
    Ok(res)
   }
   
   def getReport(reportId:String, origQuery:String) = Action {
    val res = solrDAO.querySingleDocument(reportId, origQuery)
    Ok(Json.toJson(res))
   }
}