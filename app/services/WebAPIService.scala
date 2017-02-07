package services

import scala.collection.mutable.ListBuffer

import javax.inject.Inject
import models.PatientDemographics
import models.PatientRecord
import play.api.cache._
import play.api.libs.json._
import scalaj.http._
import models.PatientCohort
import models.PatientObservationPeriod
import scala.concurrent.duration._

class WebAPIService @Inject() (configuration: play.api.Configuration, cache: CacheApi) extends JsonMapper  {
 
  
  val baseUrl = configuration.underlying.getString("ohdsi.base_url");
  
  def getPersonData(personId:String):JsValue = {
    
    val key = "patient.demographics." + personId;
    val option = cache.get[JsValue](key)
    
    if (option.isEmpty) {
      val response: HttpResponse[String]  = try {
        Http(baseUrl + "person/" + personId).timeout(connTimeoutMs = 1000, readTimeoutMs = 10000).asString
      } catch {
        case e:Exception => e.printStackTrace()
        null
      }
      
      if (response == null) {
        JsObject(Seq(
          "valid" -> JsString("false")
          ))
      } else {
        val json = Json.parse(response.body)
//        val gender = (json \ "gender").get
//        val yearOfBirth = (json \ "yearOfBirth").get
//        val records = (json \ "records").get.as[JsArray].value.asInstanceOf[ListBuffer[PatientRecord]]
//        val cohorts = (json \ "cohorts").get.as[JsArray].value.asInstanceOf[ListBuffer[PatientCohort]]
//        val observationPeriods = (json \ "observationPeriods").get.as[JsArray].value.asInstanceOf[ListBuffer[PatientObservationPeriod]]
//        val demographics = PatientDemographics("", 0, 0, records, cohorts, observationPeriods)
        cache.set(key, json, 7.day)
        json
      }
    } else {
      option.get
    }
     
  }
}