package controllers

import dao.SolrDAO
import javax.inject.Inject
import play.api.libs.json.Json
import play.api.mvc._
import play.api.mvc.Controller
import services.JsonMapper
import services.WebAPIService
import org.webjars.play.RequireJS


class SearchController @Inject() (webJarAssets: WebJarAssets, requireJS: RequireJS, solrDAO: dao.SolrDAO, wepAPIsvc:WebAPIService) extends Controller with JsonMapper {

   def index = Action {
    Ok(views.html.index.render(webJarAssets, requireJS, "Search"))
   }

   def queryText(query:String, start:Int, rows:Int) = Action {
     val res = solrDAO.simpleQuery(query, rows, start, null)
     Ok(Json.toJson(res))
   }


}
