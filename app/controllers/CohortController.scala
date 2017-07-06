package controllers

import services.WebAPIService
import services.JsonMapper
import javax.inject.Inject
import play.api.mvc.Controller
import play.api.mvc.Action
import org.webjars.play.RequireJS

import org.pac4j.core.profile._
import org.pac4j.play.PlayWebContext
import org.pac4j.play.scala._

import play.libs.concurrent.HttpExecutionContext
import org.pac4j.core.config.Config
import org.pac4j.core.context.Pac4jConstants
import org.pac4j.play.store.PlaySessionStore

class CohortController @Inject() (val config: Config, val playSessionStore: PlaySessionStore, override val ec: HttpExecutionContext, configuration: play.api.Configuration, webJarAssets: WebJarAssets, requireJS: RequireJS, solrDAO: dao.SolrDAO, wepAPIsvc:WebAPIService) extends Controller with Security[CommonProfile] with JsonMapper {

  def index() = Secure("FormClient", "chart_review") { profiles =>
     Action { request =>
       val webContext = new PlayWebContext(request, playSessionStore)
       val csrfToken = webContext.getSessionAttribute(Pac4jConstants.CSRF_TOKEN).asInstanceOf[String]
       val sessionId = webContext.getSessionAttribute(Pac4jConstants.SESSION_ID).asInstanceOf[String]
       Ok(views.html.cohorts(true, profiles, csrfToken, sessionId, webJarAssets, requireJS, "Cohorts"))
     }
   }

   def cohortdetails(cohortId:Option[Int], setId:Option[Int], viewOnly:Option[Boolean]) = Secure("FormClient", "chart_review") { profiles =>
      Action { request =>
        val webContext = new PlayWebContext(request, playSessionStore)
        val csrfToken = webContext.getSessionAttribute(Pac4jConstants.CSRF_TOKEN).asInstanceOf[String]
        val sessionId = webContext.getSessionAttribute(Pac4jConstants.SESSION_ID).asInstanceOf[String]
        Ok(views.html.cohortdetails(true, profiles, csrfToken, sessionId, webJarAssets, requireJS, "Cohort Details",
          cohortId.getOrElse(-1), setId.getOrElse(-1), viewOnly.getOrElse(true)))
      }
    }

   def getCohorts = Action {
     val cohorts = wepAPIsvc.getCohortDefinitions()
     Ok(cohorts)
   }

  def getCohortDefinition(cohortId:String) = Action {
    val cohort = wepAPIsvc.getCohortDefinition(cohortId)
    Ok(cohort)
  }

   def getCohortEntities(cohortId:String) = Action {
     val cohortEntities = wepAPIsvc.getCohortEntities(cohortId)
     Ok(cohortEntities)
   }
}
