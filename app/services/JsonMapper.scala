package services

import play.api.libs.json._

trait JsonMapper {
   implicit val documentWrites: Writes[models.Document] = Json.writes[models.Document]
   implicit val solrResultsWrites: Writes[models.SolrResults] = Json.writes[models.SolrResults]
   implicit val patientRecordWrites: Writes[models.PatientRecord] = Json.writes[models.PatientRecord]
   implicit val patientCohortWrites: Writes[models.PatientCohort]= Json.writes[models.PatientCohort]
   implicit val patientObsPeriodWrites: Writes[models.PatientObservationPeriod] = Json.writes[models.PatientObservationPeriod]
   implicit val patientDemographicWrites: Writes[models.PatientDemographics] = Json.writes[models.PatientDemographics]
   
   implicit val patientRecordReads = Json.reads[models.PatientRecord]
   implicit val patientCohortReads = Json.reads[models.PatientCohort]
   implicit val patientObsPeriodReads = Json.reads[models.PatientObservationPeriod]
   implicit val patientDemographicReads = Json.reads[models.PatientDemographics]
}