package controllers

import javax.inject.Inject
import play.api.mvc.Controller
import play.api.mvc.Action
import org.webjars.play.RequireJS

class IndexController @Inject() extends Controller {

  def welcome = Action {
    Ok("Welcome!")
  }

}
