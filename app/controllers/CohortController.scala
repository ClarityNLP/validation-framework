package controllers

import services.WebAPIService
import services.JsonMapper
import javax.inject.Inject
import play.api.mvc.Controller
import play.api.mvc.Action

class CohortController @Inject() (solrDAO: dao.SolrDAO, wepAPIsvc:WebAPIService) extends Controller with JsonMapper {
   def index = Action {
    Ok(views.html.cohorts.render("Cohorts", "Begin exploring clinical cohorts."))
   }
   
   def getCohorts = Action {
     val cohorts = wepAPIsvc.getCohortDefinitions()
     Ok(cohorts)
   }
   
   def getCohortEntities(cohortId:String) = Action {
     val cohortEntities = wepAPIsvc.getCohortEntities(cohortId)
     Ok(cohortEntities)
   }
}