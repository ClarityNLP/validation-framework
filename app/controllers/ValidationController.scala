package controllers

import javax.inject.Inject

import play.api.db.Database
import play.api.libs.functional.syntax.unlift
import play.api.libs.json.{Format, Json, __}
import play.api.mvc.{Action, Controller}
import play.api.libs.functional.syntax._


/**
  * Created by ncampbell7 on 5/8/17.
  */
class ValidationController @Inject() (db: Database) extends Controller {

  case class User(user_id: Long, username: String,
                  authentication: String, authentication_method: String,
                  date_created: String, date_updated: String)
  object User {
    implicit val format: Format[User] = (
        (__ \ "user_id").format[Long] and
        (__ \ "username").format[String] and
        (__ \ "authentication").format[String] and
        (__ \ "authentication_method").format[String] and
        (__ \ "date_created").format[String] and
        (__ \ "date_updated").format[String]
      )(User.apply, unlift(User.unapply))
  }

  def getUsers() = Action {
    var users = List[User]()
    val conn = db.getConnection()
    val queryString = "select * from validation.validation_user"
    try {
      val rs = conn.createStatement().executeQuery(queryString)
      while (rs.next()) {
        users ::= User(rs.getLong("user_id"), rs.getString("username"), rs.getString("authentication"),
          rs.getString("authentication_method"), rs.getString("date_created"), rs.getString("date_last_login"))
      }
    } finally {
      conn.close()
    }
    Ok(Json.toJson(users))
  }

  def getUser(user_id:Long) = Action {
    var users = List[User]()
    val conn = db.getConnection()
    val queryString = s"select * from validation.validation_user where user_id='$user_id'"
    try {
      val rs = conn.createStatement().executeQuery(queryString)
      while (rs.next()) {
        users ::= User(rs.getLong("user_id"), rs.getString("username"), rs.getString("authentication"),
          rs.getString("authentication_method"), rs.getString("date_created"), rs.getString("date_last_login"))
      }
    } finally {
      conn.close()
    }
    Ok(Json.toJson(users))
  }

}
