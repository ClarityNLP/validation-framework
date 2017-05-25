package modules

import java.sql.{Connection, DriverManager, ResultSet}

import com.roundeights.hasher.Implicits._

import scala.language.postfixOps
import org.pac4j.core.context.Pac4jConstants
import org.pac4j.core.context.WebContext
import org.pac4j.core.credentials.authenticator.Authenticator
import org.pac4j.core.profile.CommonProfile
import org.pac4j.core.util.CommonHelper
import org.pac4j.core.credentials.UsernamePasswordCredentials
import play.api.Configuration

  class UsernamePasswordAuthenticator(configuration: Configuration) extends Authenticator[UsernamePasswordCredentials]{

  override def validate(credentials: UsernamePasswordCredentials, context: WebContext) = {
    if (credentials == null) {
      throw new Exception("No credential")
    }
    val username = credentials.getUsername()
    val password = credentials.getPassword()

    if (CommonHelper.isBlank(username)) {
      throw new Exception("Username cannot be blank")
    }
    if (CommonHelper.isBlank(password)) {
      throw new Exception("Password cannot be blank")
    }

    val profile = new CommonProfile()
    val hashedPassword = hashPassword(password)
    var connection:Connection = null
    try {
      Class.forName("org.postgresql.Driver")
      val dbUrl = configuration.underlying.getString("db.default.url")
      val dbUsername = configuration.underlying.getString("db.default.username")
      val dbPassword = configuration.underlying.getString("db.default.password")
      connection = DriverManager.getConnection(dbUrl, dbUsername, dbPassword)

      val statement = connection.createStatement()
      val query = s"SELECT * FROM validation.validation_user WHERE username = '$username' AND authentication = '$hashedPassword'"
      val resultSet:ResultSet = statement.executeQuery(query)
      if (!resultSet.next()) {
        throw new Exception("Invalid username/password combination!")
      }
      profile.setId(resultSet.getString("user_id"))
      profile.addAttribute(Pac4jConstants.USERNAME, username)
    } finally {
      if (connection != null) {
        connection.close()
      }
    }

    // TODO map roles
    credentials.setUserProfile(profile)
  }

  def hashPassword(text:String) = {
    text.salt("4edb2891bdb3ae6a0830891d3e6a120405e93ee5636fdf6ca05ab22167482628f1f7611da3fa7318143b129ba9125d632d5f33291603bf3594cd8019d8e6cc96").sha512.hex
  }
}
