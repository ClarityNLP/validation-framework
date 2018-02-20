package controllers

import javax.inject.Inject
import scala.util._
import play.api._
import play.api.db.Database
import play.api.libs.functional.syntax.unlift
import play.api.libs.json.{Format, Json, __}
import play.api.mvc.{Action, Controller}
import play.api.libs.functional.syntax._
import play.api.libs.json.Json
import play.mvc.Http

import java.sql.DriverManager
import java.sql.Connection

class AddCohortController @Inject() (db: Database) extends Controller {

  def addCohort(newCohortName:String, newCohortDescription:String) = Action(parse.tolerantText) { request =>
    //println(newCohortName)
    //println(newCohortDescription)
    val body = request.body
    val words = body.filter(!"\"".contains(_))

    val temp1 = words.stripPrefix("[").stripSuffix("]").trim
    val temp2 = temp1.split(",").map(_.trim)
    val patientIDs = temp2.map(x => x.toInt)
    var flag = false

    val username = play.Play.application.configuration.getString("dbuser")
    val password = play.Play.application.configuration.getString("dbpass")
    val driver = play.Play.application.configuration.getString("dbdriver")
    val url = play.Play.application.configuration.getString("dburl")


    try{

      // Connecting to database
      var connection:Connection = null
      var newCohortID = 0

      Class.forName(driver)
      connection = DriverManager.getConnection(url, username, password)
      val queryString = "select MAX(id) as result from ohdsi.cohort_definition"
      //val queryString = "delete from ohdsi.cohort where cohort_definition_id=38"
      val st = connection.createStatement()
      val rs = st.executeQuery(queryString)

      while(rs.next()){
			     newCohortID = rs.getInt("result") + 1
			  }

      val queryString2 = "insert into ohdsi.cohort_definition (id, name, description, expression_type, created_date) values(" + newCohortID + ",'" + newCohortName + "','" + newCohortDescription + "','EXTERNAL_SOURCED',current_timestamp)"
      st.executeUpdate(queryString2)

      val queryString3 = "insert into ohdsi.cohort_definition_details (id, expression) values(" + newCohortID + ", '{}' )"
      st.executeUpdate(queryString3)

      for(i <- 0 until patientIDs.length) {
        st.addBatch("insert into ohdsi.cohort (cohort_definition_id, subject_id, cohort_start_date, cohort_end_date) values(" + newCohortID + "," + patientIDs(i) + "," + "'2121-01-01'" + "," + "'2121-12-01'" + ")")
      }
      st.executeBatch()
      st.close()
      flag = true
      connection.close()
    }
    catch {
      case e : Throwable => e.printStackTrace
      flag = false
    }

    if (flag==true) {
      Ok("YES")
    }
    else {
      Ok("NO")
    }
  }
}
