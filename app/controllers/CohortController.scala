package controllers

import services.WebAPIService
import services.JsonMapper
import javax.inject.Inject
import play.api.mvc.Controller
import play.api.mvc.Action
import org.webjars.play.RequireJS

class CohortController @Inject() (webJarAssets: WebJarAssets, requireJS: RequireJS, solrDAO: dao.SolrDAO, wepAPIsvc:WebAPIService) extends Controller with JsonMapper {
   def index = Action {
    Ok(views.html.cohorts.render(webJarAssets, requireJS, "Cohorts"))
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
