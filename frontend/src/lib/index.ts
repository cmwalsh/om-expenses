import { ApiService } from './api';
import { SessionUser } from './common';
import { SessionService } from './session';

export class AppService {
  private static appService?: AppService;

  public static get() {
    if (this.appService) return this.appService;
    return this.appService = new AppService();
  }

  public api;

  constructor() {
    console.log('AppService init');
    this.api = this.newApiService();
  }

  public getCurrentUser(): SessionUser | null {
    const session = SessionService.getSession();

    return session?.sessionUser ?? null;
  }

  public async login(email: string, password: string) {
    const api = new ApiService();
    const sessionUser = await api.login(email, password);

    SessionService.newSession(sessionUser);

    return sessionUser;
  }

  public logout() {
    SessionService.clearSession();
  }

  private newApiService() {
    const user = this.getCurrentUser();
    return new ApiService(user?.sessionToken);
  }
}
