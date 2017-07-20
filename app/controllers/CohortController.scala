package controllers

import javax.inject.Inject

import org.pac4j.core.config.Config
import org.pac4j.core.context.Pac4jConstants
import org.pac4j.core.profile._
import org.pac4j.play.PlayWebContext
import org.pac4j.play.scala._
import org.pac4j.play.store.PlaySessionStore
import org.webjars.play.RequireJS
import play.api.db.Database
import play.api.libs.functional.syntax._
import play.api.libs.json.{Format, _}
import play.api.mvc.{Action, Controller}
import play.libs.concurrent.HttpExecutionContext
import services.{JsonMapper, WebAPIService}


class CohortController @Inject() (val config: Config, val playSessionStore: PlaySessionStore, override val ec: HttpExecutionContext, configuration: play.api.Configuration, webJarAssets: WebJarAssets, requireJS: RequireJS, solrDAO: dao.SolrDAO, webAPIsvc:WebAPIService, db: Database) extends Controller with Security[CommonProfile] with JsonMapper {

  def index() = Secure("FormClient", "chart_review") { profiles =>
     Action { request =>
       val webContext = new PlayWebContext(request, playSessionStore)
       val csrfToken = webContext.getSessionAttribute(Pac4jConstants.CSRF_TOKEN).asInstanceOf[String]
       val sessionId = webContext.getSessionAttribute(Pac4jConstants.SESSION_ID).asInstanceOf[String]
       Ok(views.html.cohorts(true, profiles, csrfToken, sessionId, webJarAssets, requireJS, "Cohorts"))
     }
   }

   def cohortdetails(cohortId:Option[Int], setId:Option[Int], viewOnly:Option[Boolean], cohortType:Option[String]) = Secure("FormClient", "chart_review") { profiles =>
      Action { request =>
        val webContext = new PlayWebContext(request, playSessionStore)
        val csrfToken = webContext.getSessionAttribute(Pac4jConstants.CSRF_TOKEN).asInstanceOf[String]
        val sessionId = webContext.getSessionAttribute(Pac4jConstants.SESSION_ID).asInstanceOf[String]
        Ok(views.html.cohortdetails(true, profiles, csrfToken, sessionId, webJarAssets, requireJS, "Cohort Details",
          cohortId.getOrElse(-1), setId.getOrElse(-1), viewOnly.getOrElse(true), cohortType.getOrElse("LOCAL")))
      }
    }

  case class LocalCohort(validation_local_cohort_def_id: Long, validation_local_cohort_name: String,
                         config: String, owner: String, cohort_type: String,
                         date_created: String, date_updated: String,
                         use_patient_source: Boolean)
  object LocalCohort {
    implicit val format: Format[LocalCohort] = (
        (__ \ "validation_local_cohort_def_id").format[Long] and
        (__ \ "validation_local_cohort_name").format[String] and
        (__ \ "config").format[String] and
        (__ \ "owner").format[String] and
        (__ \ "cohort_type").format[String] and
        (__ \ "date_created").format[String] and
        (__ \ "date_updated").format[String] and
        (__ \ "use_patient_source").format[Boolean]
      )(LocalCohort.apply, unlift(LocalCohort.unapply))
  }

   def getLocalCohorts = Action {
     var localCohorts = List[LocalCohort]()
     val queryString = "SELECT * from validation.validation_local_cohort_definition"
     val conn = db.getConnection()
     try {
       val stmt = conn.createStatement()
       val rs = stmt.executeQuery(queryString)
       while (rs.next()) {
         val validation_local_cohort_def_id = rs.getLong("validation_local_cohort_def_id")
         val validation_local_cohort_name = rs.getString("validation_local_cohort_name")
         val config = rs.getString("config")
         val owner = rs.getString("owner")
         val cohort_type = rs.getString("cohort_type")
         val date_created = rs.getString("date_created")
         val date_updated = rs.getString("date_updated")
         val use_patient_source = rs.getBoolean("use_patient_source")

         localCohorts ::= LocalCohort(validation_local_cohort_def_id, validation_local_cohort_name, config, owner, cohort_type, date_created, date_updated, use_patient_source)
       }
     } finally {
       conn.close()
     }
     Ok(Json.toJson(localCohorts))
   }

   def getOhdsiCohorts = Action {
     val cohorts = webAPIsvc.getCohortDefinitions()
     Ok(cohorts)
   }

  def getLocalCohortDefinition(cohortId:String): LocalCohort = {
    var localDefinition = LocalCohort(-1L, "", "", "", "", "", "", false)
    val queryString = "SELECT * from validation.validation_local_cohort_definition where validation_local_cohort_def_id =" + cohortId
    val conn = db.getConnection()
    try {
      val stmt = conn.createStatement()
      val rs = stmt.executeQuery(queryString)
      while (rs.next()) {
        val validation_local_cohort_def_id = rs.getLong("validation_local_cohort_def_id")
        val validation_local_cohort_name = rs.getString("validation_local_cohort_name")
        val config = rs.getString("config")
        val owner = rs.getString("owner")
        val cohort_type = rs.getString("cohort_type")
        val date_created = rs.getString("date_created")
        val date_updated = rs.getString("date_updated")
        val use_patient_source = rs.getBoolean("use_patient_source")

        localDefinition = LocalCohort(validation_local_cohort_def_id, validation_local_cohort_name, config, owner, cohort_type, date_created, date_updated, use_patient_source)
      }
    } finally {
      conn.close()
    }
    localDefinition
  }

  case class LocalCohortEntity(validation_local_cohort_def_id: Long, subject_id:Long, document_id:String,
                               start_date: String, end_date: String, comment: String)

  object LocalCohortEntity {
    implicit val format: Format[LocalCohortEntity] = (
      (__ \ "validation_local_cohort_def_id").format[Long] and
        (__ \ "subject_id").format[Long] and
        (__ \ "document_id").format[String] and
        (__ \ "start_date").format[String] and
        (__ \ "end_date").format[String] and
        (__ \ "comment").format[String]
      )(LocalCohortEntity.apply, unlift(LocalCohortEntity.unapply))
  }

  def getLocalCohortDemographics(cohortId:String) = Action {
    val cohortDef = getLocalCohortDefinition(cohortId)
    var demographicsMap: JsValue = JsObject(Seq())

  val conn = db.getConnection()
    try {
      val idsStmt = conn.createStatement()
      val idsRs = idsStmt.executeQuery(s"""select '''' || array_to_string(array(select subject_id from validation.validation_local_cohort where validation_local_cohort_def_id=$cohortId), ''',''') || '''' as id_string""")
      val ids = if (idsRs.next()) {
        idsRs.getString("id_string")
      } else {
        ""
      }
      demographicsMap = webAPIsvc.getMultiplePersonDemographics(ids, cohortDef.use_patient_source.toString)

    } finally {
      conn.close()
    }
    Ok(demographicsMap)
  }

  def getLocalCohortEntities(cohortId:String): List[LocalCohortEntity] = {
    val cohortDef = getLocalCohortDefinition(cohortId)
    var cohortEntities = List[LocalCohortEntity]()
    val queryString = s"""SELECT * from validation.validation_local_cohort where validation_local_cohort_def_id = $cohortId"""
    val conn = db.getConnection()
    try {
      val stmt = conn.createStatement()
      val rs = stmt.executeQuery(queryString)
      while (rs.next()) {
        val subject_id = rs.getLong("subject_id")
        val validation_local_cohort_def_id = rs.getLong("validation_local_cohort_def_id")
        val document_id = rs.getString("document_id")
        val start_date = rs.getString("start_date")
        val end_date = rs.getString("end_date")
        val comment = rs.getString("comment")

        cohortEntities ::= LocalCohortEntity(validation_local_cohort_def_id, subject_id, document_id, start_date, end_date, comment)
      }
    } finally {
      conn.close()
    }
    cohortEntities
  }

  def getCohortDefinition(cohortId:String, cohortType:String) = Action {
    if (cohortType == "WebAPI") {
      val cohort = webAPIsvc.getCohortDefinition(cohortId)
      Ok(cohort)
    } else {
      Ok(Json.toJson(getLocalCohortDefinition(cohortId)))
    }
  }

   def getCohortEntities(cohortId:String, cohortType:String) = Action {
     if (cohortType == "WebAPI") {
       val cohortEntities = webAPIsvc.getCohortEntities(cohortId)
       Ok(cohortEntities)
     } else {
       Ok(Json.toJson(getLocalCohortEntities(cohortId)))
     }
   }
}
