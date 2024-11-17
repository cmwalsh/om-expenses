import { SessionUser } from "./common";

interface Session {
  sessionUser: SessionUser;
}

const SessionKey = "om-session";

export class SessionService {
  public static newSession(sessionUser: SessionUser) {
    const session: Session = { sessionUser };
    localStorage.setItem(SessionKey, JSON.stringify(session));
  }

  public static getSession() {
    const json = localStorage.getItem(SessionKey);
    if (!json) return null;

    return JSON.parse(json) as Session;
  }

  public static clearSession() {
    localStorage.removeItem(SessionKey);
  }
}
