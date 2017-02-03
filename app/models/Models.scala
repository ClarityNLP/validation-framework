package models

import java.util.Date

case class Document(reportId:String, source:String, subject:String, reportDate:Date, snippet:String, reportText:String)