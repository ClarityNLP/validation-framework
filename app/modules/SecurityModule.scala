package modules

import com.google.inject.AbstractModule
import controllers.{CustomAuthorizer, HttpActionAdapter}
import org.pac4j.core.authorization.authorizer.RequireAnyRoleAuthorizer
import org.pac4j.core.client.Clients
import org.pac4j.http.client.direct.{DirectBasicAuthClient, ParameterClient}
import org.pac4j.http.client.indirect.FormClient
import org.pac4j.jwt.credentials.authenticator.JwtAuthenticator
import org.pac4j.play.{CallbackController, LogoutController}
import play.api.{Configuration, Environment}
import org.pac4j.play.store.{PlayCacheSessionStore, PlaySessionStore}
import org.pac4j.core.config.Config
import org.pac4j.jwt.config.signature.SecretSignatureConfiguration

class SecurityModule(environment: Environment, configuration: Configuration) extends AbstractModule {

  override def configure(): Unit = {
    val baseUrl = ""
    val secretSignature = configuration.underlying.getString("signature.secret")

    val directBasicAuthClient = new DirectBasicAuthClient(new UsernamePasswordAuthenticator(configuration))
    val formClient = new FormClient(baseUrl + "/loginForm", new UsernamePasswordAuthenticator(configuration))

    val jwtAuthenticator = new JwtAuthenticator()
    jwtAuthenticator.addSignatureConfiguration(new SecretSignatureConfiguration(secretSignature))
    val parameterClient = new ParameterClient("token", jwtAuthenticator)
    parameterClient.setSupportGetRequest(true)
    parameterClient.setSupportPostRequest(false)

    val clients = new Clients(baseUrl + "/callback", directBasicAuthClient, formClient, parameterClient)

    val config = new Config(clients)
    config.addAuthorizer("admin", new RequireAnyRoleAuthorizer[Nothing]("ADMIN"))
    config.addAuthorizer("search", new RequireAnyRoleAuthorizer[Nothing]("ADMIN", "SEARCH"))
    config.addAuthorizer("chart_review", new RequireAnyRoleAuthorizer[Nothing]("ADMIN", "CHART_REVIEW"))
    config.setHttpActionAdapter(new HttpActionAdapter())
    bind(classOf[Config]).toInstance(config)

    bind(classOf[PlaySessionStore]).to(classOf[PlayCacheSessionStore])

    val callbackController = new CallbackController()
    callbackController.setDefaultUrl("/search")
    callbackController.setMultiProfile(true)
    bind(classOf[CallbackController]).toInstance(callbackController)

    val logoutController = new LogoutController()
    logoutController.setDefaultUrl("/")
    bind(classOf[LogoutController]).toInstance(logoutController)
  }
}
