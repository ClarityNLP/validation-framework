package controllers

import javax.inject.Inject

import org.postgresql.util.PSQLException
import play.api.db.Database
import play.api.libs.json.{JsError, Json}
import play.api.mvc.{Action, Controller}

/**
  * Created by ncampbell7 on 4/25/17.
  */
class AnnotationController @Inject() (db: Database) extends Controller {

  def putAnnotationQuestion(annotationId: Int) = Action { request =>
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
    Ok("{success:True}")
  }

  def getAnnotationQuestion(annotationId: Int) = Action {
    var jsonStr = "{\"response\":"
    var response = ""
    var queryString = "SELECT * from validation.annotation_question WHERE annotation_question_id='" + annotationId + "'"
    val conn = db.getConnection()
    try {
      val stmt = conn.createStatement()
      val rs = stmt.executeQuery(queryString)
      while (rs.next()) {
        val annotation_question_id = rs.getString("annotation_question_id")
        val question_name = rs.getString("question_name")
        val question_type = rs.getString("question_type")
        val help_text = rs.getString("help_text")
        val date_created = rs.getString("date_created")
        val date_updated = rs.getString("date_updated")
        response +=
          s
          """
               |{"annotation_question_id":"$annotation_question_id
",
               | "question_name":"
             $question_name
",
               | "question_type":"$
             question_type
",
               | "help_text":"$help_text
",
               | "date_created":"$date_created",
               | "date_updated":"$date_updated"
               |}
           |""".stripMargin
      }
    } catch {
      case e: Exception => BadRequest(

        "Something went horrifically wrong. Error: " + e.getMessage)
    }
    finally {
      conn.close()
    }

    if (response.length > 1) {
      jsonStr += response
    }
    else {
      jsonStr += """ "" """ // Empty quotations
    }
    Ok(Json.parse(jsonStr + "}"));
  }

  def putAnnotationQuestionAnswer(

                                   annotationId:Int) = Action { request =>
    val json = request.body.
      asJson.get
    val conn = db.getConnection
    ()

      val annotation_question_id =
        (json \ "annotation_question_id").as[String]
      val text = (json \
        "text").as[String]
      val value = (json \ "value").as[
        String]
      val help_text = (json \ "help_text").as[String]

      val queryString =
        s
        """insert into validation.annotation_question_answer
           | (annotation_question_answer_id, annotation_question_id, text, value, help_text, date_created, date_updated)
           | values ($
         annotationId, '$annotation_question_id', '$text', '$
         value', '$help_text
', current_date, current_date)
           | on conflict (annotation_question_answer_id) do update set
           | annotation_question_id = '$annotation_question_id',
           | text = '$text',
           | value = '$value',
           | help_text  = '$help_text',
           | date_updated = current_date
           | """.stripMargin
    try {
      var rs = conn.createStatement().execute(queryString)
    } finally {
      conn.close()
    }
    Created("{success:True}")
  }

  def getAnnotationQuestionAnswer(annotationId:Int) = Action {
    var jsonStr = "{\"response\":"
    var response = ""
    var queryString = "select * from validation.annotation_question_answer where annotation_question_answer_id='" + annotationId + "'"
    val conn = db.getConnection()
    try {
      val stmt = conn.createStatement()
      val rs = stmt.executeQuery(queryString)
      while(rs.next()) {
        val annotation_question_answer_id = rs.getString("annotation_question_answer_id")
        val annotation_question_id = rs.getString("annotation_question_id")
        val text = rs.getString("text")
        val value = rs.getString("value")
        val date_created = rs.getString("date_created")
        val date_updated = rs.getString("date_updated")
        response +=
          s"""
             |{"annotation_question_answer_id":"$annotation_question_answer_id",
             | "annotation_question_id":"$annotation_question_id",
             | "text":"$text",
             | "value":"$value",
             | "date_created":"$date_created",
             | "date_updated":"$date_updated"
             |}
             |""".stripMargin
      }
    } catch {
      case e : Exception => BadRequest("Something went horrifically wrong. Error: " +

        e.getMessage)
    } finally {
      conn.close()
    }
    if (response.length > 1) {
      jsonStr += response
    }
    else {
      jsonStr += """ "" """ // Empty quotations
    }
    Ok(Json.parse(jsonStr + "}"));
  }

  def putAnnotationSet(annotationSetId:Int) = Action { request =>
    val json = request.body.asJson.get
    val conn = db.getConnection()
    val annotation_set_definition_id = (json \ "annotation_set_definition_id").as[String]
    val cohort_name = (json \ "cohort_name").as[String]
    val cohort_source = (json \ "cohort_source").as[String]
    val cohort_id = (json \ "cohort_id").as[String]
    val owner = (json \ "owner").as[String]

    val queryString =
      s"""insert into validation.annotation_set
         | (annotation_set_id, annotation_set_definition_id, cohort_name, cohort_source, cohort_id, owner, date_created, date_updated)
         | values ($annotationSetId, $annotation_set_definition_id, '$cohort_name', '$cohort_source', '$cohort_id', '$owner', current_date, current_date)
         | on conflict (annotation_set_id) do update set
         | annotation_set_definition_id = '$annotationSetId',
         | cohort_name = '$cohort_name',
         | cohort_source = '$cohort_source',
         | cohort_id  = '$cohort_id',
         | owner = '$owner',
         | date_updated = current_date
         | """.stripMargin
    try {
      var rs = conn.createStatement().execute(queryString)
    } finally {
      conn.close()
    }
    Created("{success:True}")
  }

  def getAnnotationSet(annotationSetId:Int) = Action {
    var jsonStr = "{\"response\":"
    var response = ""
    var queryString = "select * from validation.annotation_set WHERE annotation_set_id='" + annotationSetId + "'"
    val conn = db.getConnection()
    try {
      val stmt = conn.createStatement()
      val rs = stmt.executeQuery(queryString)
      while(rs.next()) {
        val annotation_set_definition_id = rs.getString("annotation_set_definition_id")
        val cohort_name = rs.getString("cohort_name")
        val cohort_source = rs.getString("cohort_source")
        val cohort_id = rs.getString("cohort_id")
        var owner = rs.getString("owner")
        val date_created = rs.getString("date_created")
        val date_updated = rs.getString("date_updated")
        response +=
          s"""
             |{"annotation_question_id":"$annotation_set_definition_id",
             | "question_name":"$cohort_name",
             | "question_type":"$cohort_source",
             | "help_text":"$cohort_id",
             | "owner":"$owner",
             | "date_created":"$date_created",
             | "date_updated":"$date_updated"
             |}
             |""".stripMargin
      }
    } catch {
      case e: Exception => BadRequest("Something went horrifically wrong. Error: " + e.getMessage)
    }
    finally {
      conn.close()
    }
    if (response.length > 1) {
      jsonStr += response
    }
    else {
      jsonStr += """ "" """ // Empty quotations
    }
    Ok(Json.parse(jsonStr + "}"));
  }
}
