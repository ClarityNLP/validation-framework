package controllers

import javax.inject.Inject
import play.api.mvc.Action
import play.api.mvc.Controller
import dao.SolrDAO

import play.api.mvc._
import play.api.libs.json._
import play.api.libs.functional.syntax._
 

class SearchController @Inject() (solrDAO: dao.SolrDAO) extends Controller {
  
  implicit val documentWrites: Writes[models.Document] = (
    (JsPath \ "reportId").write[String] and
    (JsPath \ "source").write[String] and
    (JsPath \ "subject").write[String] and
    (JsPath \ "reportDate").write[java.util.Date] and
    (JsPath \ "snippet").write[String] and
    (JsPath \ "reportText").write[String]
  )(unlift(models.Document.unapply))

  implicit val solrResultsWrites: Writes[models.SolrResults] = (
    (JsPath \ "documentsSize").write[Long] and
    (JsPath \ "documents").write[scala.collection.mutable.ListBuffer[models.Document]] and
    (JsPath \ "subjectFacets").write[collection.mutable.Map[String, String]]
  )(unlift(models.SolrResults.unapply))
 

   def index = Action {
    Ok(views.html.index.render("Search", "Begin exploring patient and document level clinical data."))
   }
   
   def text(query:String, start:Int, rows:Int) = Action {
     val res = solrDAO.query(query, rows, start)
     Ok(Json.toJson(res))
   }
}