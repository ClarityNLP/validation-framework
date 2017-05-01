package controllers;

import org.pac4j.play.LogoutController;

public class CentralLogoutController extends LogoutController {

    public CentralLogoutController() {
        setDefaultUrl("/?defaulturlafterlogoutafteridp");
        setLocalLogout(false);
        setCentralLogout(true);
        setLogoutUrlPattern("/.*");
    }
}
