package controllers

import javax.inject.Inject

import dao.SolrDAO
import org.pac4j.core.config.Config
import org.pac4j.core.context.Pac4jConstants
import org.pac4j.core.profile._
import org.pac4j.play.PlayWebContext
import org.pac4j.play.scala._
import org.pac4j.play.store.PlaySessionStore
import org.webjars.play.RequireJS
import play.api.libs.json.Json
import play.api.mvc.{Controller, _}
import play.libs.concurrent.HttpExecutionContext
import services.{JsonMapper, WebAPIService}

class SearchController @Inject() (val config: Config, val playSessionStore: PlaySessionStore, override val ec: HttpExecutionContext, configuration: play.api.Configuration, webJarAssets: WebJarAssets, requireJS: RequireJS, solrDAO: SolrDAO, wepAPIsvc:WebAPIService) extends Controller with Security[CommonProfile] with JsonMapper  {

  def index = Secure("FormClient", "search") { profiles =>
    Action { request =>
      val webContext = new PlayWebContext(request, playSessionStore)
      val csrfToken = webContext.getSessionAttribute(Pac4jConstants.CSRF_TOKEN).asInstanceOf[String]
      val sessionId = webContext.getSessionAttribute(Pac4jConstants.SESSION_ID).asInstanceOf[String]
      Ok(views.html.search(true, profiles, csrfToken, sessionId, webJarAssets, requireJS, "Search"))
    }
  }

   def queryText(query:String, start:Int, rows:Int) = Action {
     val res = solrDAO.simpleQuery(query, rows, start, null)
     Ok(Json.toJson(res))
   }


}
