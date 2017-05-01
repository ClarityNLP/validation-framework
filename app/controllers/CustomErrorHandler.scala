package controllers

import play.api.Logger
import play.api.http.HttpErrorHandler
import play.api.mvc.RequestHeader
import play.api.mvc.Results._

import scala.concurrent.Future

class CustomErrorHandler extends HttpErrorHandler {

  val log = Logger(this.getClass)

  def onClientError(request: RequestHeader, statusCode: Int, message: String) = {
    Future.successful(
      Status(statusCode)("A client error occurred: " + message)
    )
  }

  def onServerError(request: RequestHeader, exception: Throwable) = {
    Future.successful {
      log.error("Error occurrred", exception)
      InternalServerError(views.html.error500())
    }
  }
}
