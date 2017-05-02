package controllers

import javax.inject.Inject

import org.pac4j.core.config.Config
import org.pac4j.core.context.Pac4jConstants
import org.pac4j.core.profile._
import org.pac4j.play.PlayWebContext
import org.pac4j.play.scala._
import org.pac4j.play.store.PlaySessionStore
import org.webjars.play.RequireJS
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import play.libs.concurrent.HttpExecutionContext
import services.{JsonMapper, WebAPIService}

class ChartDataController @Inject() (val config: Config, val playSessionStore: PlaySessionStore, override val ec: HttpExecutionContext, solrDAO: dao.SolrDAO, wepAPIsvc:WebAPIService, webJarAssets: WebJarAssets, requireJS: RequireJS) extends Controller with Security[CommonProfile] with JsonMapper {
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