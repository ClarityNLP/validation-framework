package controllers

import javax.inject.Inject

import play.api.db.Database
import play.api.libs.json.{JsError, Json}
import play.api.mvc.{Action, Controller}

/**
  * Created by ncampbell7 on 4/25/17.
  */
class AnnotationController @Inject() (db: Database) extends Controller {

  def putAnnotationQuestion(annotationId:Int) = Action { request =>
    val json = request.body.asJson.get
    val conn = db.getConnection()
    val question_name = (json \ "question_name").as[String]
    val question_type = (json \ "question_type").as[String]
    val help_text = (json \ "help_text").as[String]
    val queryString =
        s"""insert into validation.annotation_question
         | (annotation_question_id, question_name, question_type, help_text, date_created, date_updated)
         | values ($annotationId, '$question_name', '$question_type', '$help_text', current_date, current_date)
         | on conflict (annotation_question_id) do update set
         | question_name = '$question_name',
         | question_type = '$question_type',
         | help_text  = '$help_text',
         | date_updated = current_date
         | """.stripMargin
    try {
      var rs = conn.createStatement().execute(queryString)
    } finally {
      conn.close()
    }
    Ok("Ok")
  }

  def getAnnotationQuestion(annotationId:Int) = Action {
    var jsonStr = "{\"response\":"
    var queryString = "SELECT * from validation.annotation_question WHERE annotation_question_id='" + annotationId + "'"
    val conn = db.getConnection()
    try {
      val stmt = conn.createStatement()
      val rs = stmt.executeQuery(queryString)
      while(rs.next()) {
          val annotation_question_id = rs.getString("annotation_question_id")
          val question_name = rs.getString("question_name")
          val question_type = rs.getString("question_type")
          val help_text = rs.getString("help_text")
          val date_created = rs.getString("date_created")
          val date_updated = rs.getString("date_updated")
          jsonStr +=
            s"""
               |{"annotation_question_id":"$annotation_question_id",
               | "question_name":"$question_name",
               | "question_type":"$question_type",
               | "help_text":"$help_text",
               | "date_created":"$date_created",
               | "date_updated":"$date_updated"
               |}
           |""".stripMargin
      }
    } finally {
      conn.close()
    }
    printf(jsonStr+"}")
    Ok(Json.parse(jsonStr + "}"));
  }

}
