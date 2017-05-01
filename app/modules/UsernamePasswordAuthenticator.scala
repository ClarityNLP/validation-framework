package modules

import com.roundeights.hasher.Implicits._
import scala.language.postfixOps

import org.pac4j.core.context.Pac4jConstants;
import org.pac4j.core.context.WebContext;
import org.pac4j.core.credentials.authenticator.Authenticator;
import org.pac4j.core.profile.CommonProfile;
import org.pac4j.core.util.CommonHelper;
import org.pac4j.core.credentials.UsernamePasswordCredentials;

class UsernamePasswordAuthenticator extends Authenticator[UsernamePasswordCredentials]{

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
//    if (CommonHelper.areNotEquals(username, password)) {
//      throw new Exception("Username : '" + username + "' does not match password");
//    }
    // TODO map to password in db
    // TODO map roles

    val profile = new CommonProfile()
    profile.setId(username)
    profile.addAttribute(Pac4jConstants.USERNAME, username)
    credentials.setUserProfile(profile)
  }

  def hashPassword(text:String) = {
    text.salt("paul").sha512.hex
  }
}
