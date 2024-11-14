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
    const sessionUser = await this.api.login(email, password);

    SessionService.newSession(sessionUser);

    // Need to create a new API for the granted session token
    this.api = this.newApiService();

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
