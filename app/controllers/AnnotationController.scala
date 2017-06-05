package controllers

import javax.inject.Inject

import org.postgresql.util.PSQLException
import play.api.db.Database
import play.api.libs.json.{Format, JsError, Json}
import play.api.mvc._
import play.api.libs.json._
import play.api.libs.functional.syntax._
import au.com.bytecode.opencsv.CSVWriter
import scala.collection.JavaConversions._
import scala.collection.mutable.ListBuffer
import java.io._


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

  case class AnnotationQuestionAnswer(annotation_question_answer_id: Long, annotation_question_id: Long, index:Int,
                                      text: String, value: String, date_created: String, date_updated: String)
  object AnnotationQuestionAnswer {
    implicit val format: Format[AnnotationQuestionAnswer] = (
        (__ \ "annotation_question_answer_id").format[Long] and
        (__ \ "annotation_question_id").format[Long] and
          (__ \ "index").format[Int] and
        (__ \ "text").format[String] and
        (__ \ "value").format[String] and
        (__ \ "date_created").format[String] and
        (__ \ "date_updated").format[String]
      )(AnnotationQuestionAnswer.apply, unlift(AnnotationQuestionAnswer.unapply))
  }

  def getAnnotationQuestionAnswer(annotationQuestionId:Int) = Action {
    var annotationQuestionAnswers = List[AnnotationQuestionAnswer]()
    val queryString = "select * from validation.annotation_question_answer where annotation_question_id='" + annotationQuestionId + "' order by annotation_question_answer_id asc"
    val conn = db.getConnection()
    try {
      val stmt = conn.createStatement()
      val rs = stmt.executeQuery(queryString)
      var i = 0
      while(rs.next()) {
        val annotation_question_answer_id = rs.getLong("annotation_question_answer_id")
        val annotation_question_id = rs.getLong("annotation_question_id")
        val text = rs.getString("text")
        val value = rs.getString("value")
        val date_created = rs.getString("date_created")
        val date_updated = rs.getString("date_updated")
        i += 1
        annotationQuestionAnswers ::= AnnotationQuestionAnswer(annotation_question_answer_id, annotation_question_id,
                                                                i, text, value, date_created, date_updated)
      }
    } finally {
      conn.close()
    }
    Ok(Json.toJson(annotationQuestionAnswers));
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

  case class AnnotationSet(annotation_set_id: Long, annotation_set_definition_id: Long, name:String,
                           cohort_name: String, cohort_source: String, cohort_id: Long,
                           owner: String, date_created: String, date_updated: String)
  object AnnotationSet {
    implicit val format: Format[AnnotationSet] = (
          (__ \ "annotation_set_id").format[Long] and
          (__ \ "annotation_set_definition_id").format[Long] and
            (__ \ "name").format[String] and
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
          annotation_set_definition_id.toLong, "", cohort_name,
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
          annotation_set_definition_id.toLong, "", cohort_name,
          cohort_source, cohort_id.toLong, owner, date_created, date_updated)
      }
    }
    finally {
      conn.close()
    }
    Ok(Json.toJson(annotationSet))
  }

  def getAllAnnotationSetsByOwner(owner:String) = Action {
    var annotationSet = List[AnnotationSet]()
    val conn = db.getConnection()
    val queryString =
      s"""select asd.annotation_set_definition_id, asd.name, asd.owner, s.annotation_set_id, s.cohort_name, s.cohort_id,
                                       s.cohort_source, asd.date_created, asd.date_updated
         from validation.annotation_set s
         inner join validation.annotation_set_definition asd on asd.annotation_set_definition_id = s.annotation_set_definition_id
         where s.owner = '$owner'""".stripMargin
    try {
      val rs = conn.createStatement().executeQuery(queryString)
      while(rs.next()) {
        val annotation_set_id = rs.getString("annotation_set_id")
        val annotation_set_definition_id = rs.getString("annotation_set_definition_id")
        val cohort_name = rs.getString("cohort_name")
        val cohort_source = rs.getString("cohort_source")
        val cohort_id = rs.getString("cohort_id")
        val owner = rs.getString("owner")
        val name = rs.getString("name")
        val date_created = rs.getString("date_created")
        val date_updated = rs.getString("date_updated")
        annotationSet ::= AnnotationSet(annotation_set_id.toLong,
          annotation_set_definition_id.toLong, name, cohort_name,
          cohort_source, cohort_id.toLong, owner, date_created, date_updated)
      }
    }
    finally {
      conn.close()
    }
    Ok(Json.toJson(annotationSet))
  }

  // TODO just need to change to read username from the session
  def getAnnotationSetByUsername(username:String) = Action {
    var annotationSet = List[AnnotationSet]()
    val conn = db.getConnection()
    val queryString = s"""select asd.annotation_set_definition_id, asd.name, asd.owner, s.annotation_set_id, s.cohort_name, s.cohort_id,
                              s.cohort_source, asd.date_created, asd.date_updated
                        from validation.annotation_set_allocation asa
                        inner join validation.annotation_set s on s.annotation_set_id = asa.annotation_set_id
                        inner join validation.annotation_set_definition asd on asd.annotation_set_definition_id = s.annotation_set_definition_id
                        inner join validation.validation_user vu on vu.user_id = asa.user_id
                        where username = '$username'"""


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
        val date_created = rs.getString("date_created")
        val date_updated = rs.getString("date_updated")

        annotationSet ::= AnnotationSet(annotation_set_id.toLong,
          annotation_set_definition_id.toLong, name, cohort_name,
          cohort_source, cohort_id.toLong, owner, date_created, date_updated)
      }
    } finally {
      conn.close()
    }
    Ok(Json.toJson(annotationSet))
  }

  // TODO: Need a better name for this. It works but it looks hideous.
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

  def downloadAnnotationSetById(validationSetId:Long) = Action {
    val filename = "/tmp/" + validationSetId + "-results.csv"
    val outputFile = new BufferedWriter(new FileWriter(filename))
    val csvWriter = new CSVWriter(outputFile)
    val csvFields = Array("annotation_set_id", "comment", "subject_id", "user_id", "date_reviewed",
      "annontation_question_id", "question_name",
      "answer_text", "annotation_question_answer_id", "answer_label")

    val results = getAnnotationSetLookup(validationSetId)
    val iterator = results.iterator
    var listOfRecords = new ListBuffer[Array[String]]()
    listOfRecords += csvFields
    while (iterator.hasNext()) {
      val next = iterator.next()
      listOfRecords += Array(next.annotation_set_id.toString, next.comment, next.subject_id.toString, next.user_id.toString, next.date_reviewed.toString,
        next.annotation_question_id.toString, next.question_name,
        next.answer_text, next.annotation_question_answer_id.toString, next.answer_label)
    }
    csvWriter.writeAll(listOfRecords.toList)
    outputFile.close()

    Ok.sendFile(new java.io.File(filename))
  }

  def getAnnotationSetBySetID(validationSetId:Long) = Action {
    Ok(Json.toJson(getAnnotationSetLookup(validationSetId)))
  }

  def getAnnotationSetLookup(validationSetId:Long) = {
    var annotationSetWithQuestion = List[AnnotationSetWithQuestions]()
    val conn = db.getConnection()
    val queryString = s"""select asr.annotation_set_id, asr.comment, asr.subject_id, asr.user_id, asr.date_reviewed, asr.annontation_question_id, aq.question_name,
                         asr.answer_text, asr.annotation_question_answer_id, aqa.text as answer_label
                         from validation.annotation_set_result asr
                         inner join validation.annotation_question aq on aq.annotation_question_id = asr.annontation_question_id
                         left outer join validation.annotation_question_answer aqa on asr.annotation_question_answer_id = aqa.annotation_question_answer_id
                         where asr.annotation_set_id = $validationSetId"""
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
    annotationSetWithQuestion
  }

  case class AnnotationSetQuestion(annotation_question_id:Long, index:Int, question_name:String, question_type:String, help_text:String,
                                   constraints:String, date_created:String, date_updated:String)
  object AnnotationSetQuestion {
    implicit val format: Format[AnnotationSetQuestion] = (
      (__ \ "annotation_question_id").format[Long] and
        (__ \ "index").format[Int] and
        (__ \ "question_name").format[String] and
        (__ \ "question_type").format[String] and
        (__ \ "help_text").format[String] and
        (__ \ "constraints").format[String] and
        (__ \ "date_created").format[String] and
        (__ \ "date_updated").format[String]
      )(AnnotationSetQuestion.apply, unlift(AnnotationSetQuestion.unapply))
  }

  def getAnnotationSetQuestion(annotationSetDefinitionId:Long) = Action {
    val conn = db.getConnection()
    var annotationSetQuestion = List[AnnotationSetQuestion]()
    val queryString = s"""select aq.* from validation.annotation_set_question asq
                          inner join validation.annotation_question aq on aq.annotation_question_id = asq.annotation_question_id
                          where asq.annotation_set_definition_id = $annotationSetDefinitionId
                          order by aq.annotation_question_id asc"""
    try {
      val rs = conn.createStatement().executeQuery(queryString)
      var i = 1
      while(rs.next()) {
        annotationSetQuestion ::= AnnotationSetQuestion(rs.getLong("annotation_question_id"), i,
          rs.getString("question_name"), rs.getString("question_type"), rs.getString("help_text"),
          rs.getString("constraints"), rs.getString("date_created"), rs.getString("date_updated"))
        i += 1
      }
    } finally {
      conn.close()
    }
    Ok(Json.toJson(annotationSetQuestion))
  }

  case class AnnotationSetResult(annotation_set_result_id:Long, annotation_set_id:Long, comment:Option[String],
                                 annotation_question_answer_id:Option[Long], subject_id:Option[String], document_id:Option[String], user_id:Long,
                                date_reviewed:String, annotation_question_id:Long, answer_text:String)
  object AnnotationSetResult {
    implicit val format: Format[AnnotationSetResult] = (
        (__ \ "annotation_set_result_id").format[Long] and
        (__ \ "annotation_set_id").format[Long] and
        (__ \ "comment").formatNullable[String] and
        (__ \ "annotation_question_answer_id").formatNullable[Long] and
        (__ \ "subject_id").formatNullable[String] and
        (__ \ "document_id").formatNullable[String] and
        (__ \ "user_id").format[Long] and
        (__ \ "date_reviewed").format[String] and
        (__ \ "annotation_question_id").format[Long] and
        (__ \ "answer_text").format[String]
      )(AnnotationSetResult.apply, unlift(AnnotationSetResult.unapply))
    }

  def getAnnotationSetResults(annotationSetId:Long) = Action {
    var annotationSetResults = List[AnnotationSetResult]()
    val conn = db.getConnection()
    val queryString = s"""select * from validation.annotation_set_result where annotation_set_id='$annotationSetId'"""
    try {
      val rs = conn.createStatement().executeQuery(queryString)
      while(rs.next()) {
        annotationSetResults ::= AnnotationSetResult(rs.getLong("annotation_set_result_id"),
          rs.getLong("annotation_set_id"),
          Some(rs.getString("comment")),
          Some(rs.getLong("annotation_question_answer_id")),
          Some(rs.getString("subject_id")),
          Some(rs.getString("document_id")),
          rs.getLong("user_id"),
          rs.getString("date_reviewed"),
          rs.getLong("annotation_question_id"),
          rs.getString("answer_text"))
      }
    } finally {
      conn.close()
    }
    Ok(Json.toJson(annotationSetResults))
  }

  def putAnnotationSetResult() = Action { request =>
    val json = request.body.asJson.get
    val conn = db.getConnection()

    try {
      var annotationSetResultId = (json \ "annotation_set_result_id").as[Long]

      if (annotationSetResultId == -1) {
        val seqQuery = "select nextval('validation.annotation_set_result_seq')"
        val seqRs = conn.createStatement().executeQuery(seqQuery)
        while (seqRs.next()) {
          annotationSetResultId = seqRs.getLong(1)
        }
      }
      val annotation_set_id = (json \ "annotation_set_id").as[Long]
      val comment = (json \ "comment").asOpt[String].getOrElse(null)
      val annotation_question_answer_id = (json \ "annotation_question_answer_id").asOpt[Long].getOrElse(null)
      val subject_id = (json \ "subject_id").asOpt[String].getOrElse(null)
      val document_id = (json \ "document_id").asOpt[String].getOrElse(null)
      val user_id = (json \ "user_id").as[Long]
      val annotation_question_id = (json \ "annotation_question_id").as[Long]
      val answer_text = (json \ "answer_text").as[String]

      val insertString =
        s"""insert into validation.annotation_set_result
           | (annotation_set_result_id, annotation_set_id, comment, annotation_question_answer_id, subject_id, document_id, user_id, date_reviewed, annontation_question_id, answer_text)
           | values ($annotationSetResultId, $annotation_set_id, '$comment', $annotation_question_answer_id, '$subject_id', '$document_id', $user_id, current_date, $annotation_question_id, '$answer_text')
           | """.stripMargin

      conn.createStatement().execute(insertString)



    } finally {
      conn.close()
    }
    Created("{success:True}")
  }
}
