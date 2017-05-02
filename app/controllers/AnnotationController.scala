package controllers

import javax.inject.Inject

import org.postgresql.util.PSQLException
import play.api.db.Database
import play.api.libs.json.{Format, JsError, Json}
import play.api.mvc.{Action, Controller}
import play.api.libs.json._
import play.api.libs.functional.syntax._

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

  case class AnnotationQuestion(annotation_question_id: Long, question_name: String,
                                question_type: String, help_text: String, constraints: String,
                                date_created: String, date_updated: String)
  object AnnotationQuestion {
    implicit val format: Format[AnnotationQuestion] = (
      (__ \ "annotation_question_id").format[Long] and
        (__ \ "question_name").format[String] and
        (__ \ "question_type").format[String] and
        (__ \ "help_text").format[String] and
        (__ \ "constraints").format[String] and
        (__ \ "date_created").format[String] and
        (__ \ "date_updated").format[String]
      )(AnnotationQuestion.apply, unlift(AnnotationQuestion.unapply))
  }

  def getAnnotationQuestion(annotationId: Int) = Action {
    var annotationQuestions = List[AnnotationQuestion]()
    var queryString = "SELECT * from validation.annotation_question WHERE annotation_question_id='" + annotationId + "'"
    val conn = db.getConnection()
    try {
      val stmt = conn.createStatement()
      val rs = stmt.executeQuery(queryString)
      while (rs.next()) {
        val annotation_question_id = rs.getLong("annotation_question_id")
        val question_name = rs.getString("question_name")
        val question_type = rs.getString("question_type")
        val help_text = rs.getString("help_text")
        val constraints = rs.getString("constraints")
        val date_created = rs.getString("date_created")
        val date_updated = rs.getString("date_updated")
        annotationQuestions ::= AnnotationQuestion(annotation_question_id, question_name, question_type, help_text, constraints, date_created, date_updated)
      }
    } finally {
      conn.close()
    }
    Ok(Json.toJson(annotationQuestions));
  }

  def putAnnotationQuestionAnswer(annotationId:Int) = Action { request =>
    val json = request.body.asJson.get
    val conn = db.getConnection()

      val annotation_question_id = (json \ "annotation_question_id").as[String]
      val text = (json \ "text").as[String]
      val value = (json \ "value").as[String]
      val help_text = (json \ "help_text").as[String]

      val queryString =
        s"""insert into validation.annotation_question_answer
           | (annotation_question_answer_id, annotation_question_id, text, value, help_text, date_created, date_updated)
           | values ($annotationId, '$annotation_question_id', '$text', '$value', '$help_text', current_date, current_date)
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

  case class AnnotationSet(annotation_set_id: Long, annotation_set_definition_id: Long,
                           cohort_name: String, cohort_source: String, cohort_id: Long,
                           owner: String, date_created: String, date_updated: String)
  object AnnotationSet {
    implicit val format: Format[AnnotationSet] = (
          (__ \ "annotation_set_id").format[Long] and
          (__ \ "annotation_set_definition_id").format[Long] and
          (__ \ "cohort_name").format[String] and
          (__ \ "cohort_source").format[String] and
          (__ \ "cohort_id").format[Long] and
          (__ \ "owner").format[String] and
          (__ \ "date_created").format[String] and
          (__ \ "date_updated").format[String]
      )(AnnotationSet.apply, unlift(AnnotationSet.unapply))
  }

  def getAnnotationSet(annotationSetId:Int) = Action {
    var annotationSet = List[AnnotationSet]()
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
        val owner = rs.getString("owner")
        val date_created = rs.getString("date_created")
        val date_updated = rs.getString("date_updated")
        annotationSet ::= AnnotationSet(annotationSetId,
          annotation_set_definition_id.toLong, cohort_name,
          cohort_source, cohort_id.toLong, owner, date_created, date_updated)
      }
    }
    finally {
      conn.close()
    }
    Ok(Json.toJson(annotationSet))
  }

  def getAllAnnotationSets() = Action {
    var annotationSet = List[AnnotationSet]()
    val conn = db.getConnection()
    val queryString = "select * from validation.annotation_set"
    try {
      val rs = conn.createStatement().executeQuery(queryString)
      while(rs.next()) {
        val annotation_set_id = rs.getString("annotation_set_id")
        val annotation_set_definition_id = rs.getString("annotation_set_definition_id")
        val cohort_name = rs.getString("cohort_name")
        val cohort_source = rs.getString("cohort_source")
        val cohort_id = rs.getString("cohort_id")
        val owner = rs.getString("owner")
        val date_created = rs.getString("date_created")
        val date_updated = rs.getString("date_updated")
        annotationSet ::= AnnotationSet(annotation_set_id.toLong,
          annotation_set_definition_id.toLong, cohort_name,
          cohort_source, cohort_id.toLong, owner, date_created, date_updated)
      }
    }
    finally {
      conn.close()
    }
    Ok(Json.toJson(annotationSet))
  }

  def getAnnotationSetByUsername(username:String) = Action {
    var annotationSet = List[AnnotationSet]()
    val conn = db.getConnection()
    val queryString = s"""select asd.annotation_set_definition_id, asd.name, asd.owner, s.annotation_set_id, s.cohort_name, s.cohort_id, s.cohort_source from validation.annotation_set_allocation asa inner join validation.annotation_set s on s.annotation_set_id = asa.annotation_set_id inner join validation.annotation_set_definition asd on asd.annotation_set_definition_id = s.annotation_set_definition_id inner join validation.validation_user vu on vu.user_id = asa.user_id where username = '$username'; """
    try {
      val rs = conn.createStatement().executeQuery(queryString)
      while(rs.next()) {
        val annotation_set_definition_id = rs.getString("annotation_set_definition_id")
        val name = rs.getString("name")
        val owner = rs.getString("owner")
        val annotation_set_id = rs.getString("annotation_set_id")
        val cohort_name = rs.getString("cohort_name")
        val cohort_id = rs.getString("cohort_id")
        val cohort_source = rs.getString("cohort_source")
        annotationSet ::= AnnotationSet(annotation_set_id.toLong,
          annotation_set_definition_id.toLong, cohort_name,
          cohort_source, cohort_id.toLong, owner, null, null)
      }
    } finally {
      conn.close()
    }
    Ok(Json.toJson(annotationSet))
  }

  case class AnnotationSetWithQuestions(annotation_set_id: Long, comment: String, subject_id: Long, user_id: Long, date_reviewed: String,
                         annotation_question_id: Long, question_name: String, answer_text: String,
                         annotation_question_answer_id: Long, answer_label: String)
  object AnnotationSetWithQuestions {
    implicit val format: Format[AnnotationSetWithQuestions] = (
      (__ \ "annotation_set_id").format[Long] and
      (__ \ "comment").format[String] and
      (__ \ "subject_id").format[Long] and
      (__ \ "user_id").format[Long] and
      (__ \ "date_reviewed").format[String] and
      (__ \ "annotation_question_id").format[Long] and
      (__ \ "question_name").format[String] and
      (__ \ "answer_text").format[String] and
      (__ \ "annotation_question_answer_id").format[Long] and
      (__ \ "answer_label").format[String])(AnnotationSetWithQuestions.apply, unlift(AnnotationSetWithQuestions.unapply))
  }

  def getAnnotationSetByUsernameAndSetID(username:String, validationSetId:Int) = Action {
    var annotationSetWithQuestion = List[AnnotationSetWithQuestions]()
    val conn = db.getConnection()
    val queryString = s"""select asr.annotation_set_id, asr.comment, asr.subject_id, asr.user_id, asr.date_reviewed, asr.annontation_question_id, aq.question_name,
                         asr.answer_text, asr.annotation_question_answer_id, aqa.text as answer_label
                         from validation.annotation_set_result asr
                         inner join validation.validation_user vu on vu.user_id = asr.user_id
                         inner join validation.annotation_question aq on aq.annotation_question_id = asr.annontation_question_id
                         left outer join validation.annotation_question_answer aqa on asr.annotation_question_answer_id = aqa.annotation_question_answer_id
                         where vu.username = '$username'
                         and asr.annotation_set_id = $validationSetId"""
    try {
      val rs = conn.createStatement().executeQuery(queryString)
      while(rs.next()) {
        val annotation_set_id = rs.getString("annotation_set_id").toLong
        val comment = rs.getString("comment")
        val subject_id = rs.getString("subject_id").toLong
        val user_id = rs.getString("user_id").toLong
        val date_reviewed = rs.getString("date_reviewed")
        val annotation_question_id = rs.getString("annontation_question_id").toLong
        val question_name = rs.getString("question_name")
        val answer_text = rs.getString("answer_text")
        val annotation_question_answer_id = rs.getString("annotation_question_answer_id")
        val answer_label = rs.getString("answer_label")
        annotationSetWithQuestion ::= AnnotationSetWithQuestions(annotation_set_id, comment, subject_id, user_id,
          date_reviewed, annotation_question_id, question_name, answer_text, 0, answer_label)
      }
    } finally {
      conn.close()
    }
    Ok(Json.toJson(annotationSetWithQuestion))
  }
}
