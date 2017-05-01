package controllers

import javax.inject.Inject

import org.pac4j.core.client.{Clients, IndirectClient}
import org.pac4j.core.config.Config
import org.pac4j.core.context.Pac4jConstants
import org.pac4j.core.credentials.Credentials
import org.pac4j.core.profile._
import org.pac4j.http.client.indirect.FormClient
import org.pac4j.play.PlayWebContext
import org.pac4j.play.scala._
import org.pac4j.play.store.PlaySessionStore
import org.webjars.play.RequireJS
import play.api.mvc.{Action, Controller, _}
import play.libs.concurrent.HttpExecutionContext
import services.{JsonMapper, WebAPIService}

import scala.collection.JavaConversions._

class IndexController @Inject() (val config: Config, val playSessionStore: PlaySessionStore, override val ec: HttpExecutionContext, configuration: play.api.Configuration, webJarAssets: WebJarAssets, requireJS: RequireJS, webAPIsvc:WebAPIService) extends Controller with Security[CommonProfile] with JsonMapper {

  val defaultOhdsiSource = configuration.underlying.getString("ohdsi.default.core")
  val auth = new modules.UsernamePasswordAuthenticator()

  def getSources = Action {
    val sources = webAPIsvc.getSources()
    Ok(sources)
  }

  def getSource = Action {
    Ok(defaultOhdsiSource);
  }

  def hash(text:String) = Action {
    val output = auth.hashPassword(text)
    Ok(output)
  }

  private def getProfiles(implicit request: RequestHeader): List[CommonProfile] = {
    val webContext = new PlayWebContext(request, playSessionStore)
    val profileManager = new ProfileManager[CommonProfile](webContext)
    val profiles = profileManager.getAll(true)
    asScalaBuffer(profiles).toList
  }

  def index = Secure("FormClient") { profiles =>
    Action { request =>
      val webContext = new PlayWebContext(request, playSessionStore)
      val csrfToken = webContext.getSessionAttribute(Pac4jConstants.CSRF_TOKEN).asInstanceOf[String]
      val sessionId = webContext.getSessionAttribute(Pac4jConstants.SESSION_ID).asInstanceOf[String]
      Ok(views.html.index(true, profiles, csrfToken, sessionId, webJarAssets, requireJS, "Home"))
    }
  }

  def loginForm = Action { implicit request =>
    val formClient = config.getClients.findClient("FormClient").asInstanceOf[FormClient]
    Ok(views.html.loginForm.render(false, formClient.getCallbackUrl, webJarAssets, requireJS, "Home"))
  }

  def forceLogin = Action { request =>
    val context: PlayWebContext = new PlayWebContext(request, playSessionStore)
    val client = config.getClients.findClient(context.getRequestParameter(Clients.DEFAULT_CLIENT_NAME_PARAMETER)).asInstanceOf[IndirectClient[Credentials,CommonProfile]]
    Redirect(client.getRedirectAction(context).getLocation)
  }


}
