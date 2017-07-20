package models

import java.util.Date


case class Document(reportId:String, source:String, subject:String, reportDate:Date, snippet:String, reportText:String)

case class SolrResults(documentsSize:Long, documents:scala.collection.mutable.ListBuffer[Document], subjectFacets:collection.mutable.Map[String, String])

case class Concept(conceptId:Long, conceptName:String, domainId:String, vocabularyId:String, conceptClassId:String, standardConcept:String, conceptCode:String, validStartDate:String, validEndDate:String, invalidReason:String)

case class PatientRecord(domain:String, conceptId:String, conceptName:String, startDate:Long, endDate:Long)

case class PatientCohort(personId:String, cohortDefinitionId:Int, startDate:Long, endDate:Long)

case class PatientObservationPeriod(id:Long, startDate:Long, endDate:Long, `type`:String)

case class PatientDemographics(personId: Int, personSourceValue: String, gender: String, yearOfBirth: Int, age: Int,
                               race: String, ethnicity: String)

