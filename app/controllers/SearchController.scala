package controllers

import javax.inject.Inject
import play.api.mvc.Action
import play.api.mvc.Controller
import dao.SolrDAO

 

class SearchController @Inject() (solrDAO: dao.SolrDAO) extends Controller {
  
   def index = Action {
    Ok(views.html.index.render("Search", "Begin exploring patient and document level clinical data."))
   }
   
   def text(query:String, start:Int, rows:Int) = Action {
     solrDAO.query(query, rows, start)
     Ok("hi")
   }
}