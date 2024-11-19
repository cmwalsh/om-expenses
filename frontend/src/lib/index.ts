/* eslint-disable prettier/prettier */
import { createTRPCClient, httpBatchLink, TRPCClientError, TRPCLink } from "@trpc/client";
import { observable } from '@trpc/server/observable';
import type { AppRouter } from "backend";
import { SessionUser } from "./common";
import { SessionService } from "./session";

export * from "./common";
export * from "./toast";

interface CustomLinkOpts {
  onError: (err: Error) => void;
}

export const errorLink =
  (opts: CustomLinkOpts): TRPCLink<AppRouter> => () => {
    // here we just got initialized in the app - this happens once per app
    // useful for storing cache for instance
    return ({ next, op }) => {
      // this is when passing the result to the next link
      // each link needs to return an observable which propagates results
      return observable((observer) => {
        // console.log("performing operation:", op);

        const unsubscribe = next(op).subscribe({
          next(value) {
            // console.log("we received value", value);
            observer.next(value);
          },
          error(err) {
            // console.log("we received error", err);
            opts.onError(err);
            observer.error(err);
          },
          complete() {
            observer.complete();
          },
        });

        return unsubscribe;
      });
    };
  };

export class AppService {
  private static appService?: AppService;

  public static get() {
    if (this.appService) return this.appService;
    return (this.appService = new AppService());
  }

  public tRPC = createTRPCClient<AppRouter>({
    links: [
      errorLink({
        onError: (err) => {
          if (err instanceof TRPCClientError) {
            if (err.data && 'code' in err.data && err.data.code === 'UNAUTHORIZED') {
              this.sessionService.clearSession();
              window.location.href = '/login?reason=expired';
            }
          }
        }
      }),
      httpBatchLink({
        url: "http://localhost:3000",
        headers: () => {
          const session = this.sessionService.session();
          const headers: Record<string, string> = {};

          if (session) {
            headers.Authorization = session.sessionUser.sessionToken;
          }

          return headers;
        },
      }),
    ],
  });

  private sessionService = new SessionService();

  constructor() {
    console.log("AppService init");
  }

  public getCurrentUser(): SessionUser | null {
    const session = this.sessionService.session();

    return session?.sessionUser ?? null;
  }

  public async login(email: string, password: string) {
    const result = await this.tRPC.Auth.Login.mutate({ email, password });

    this.sessionService.newSession({
      id: result.user.id,
      role: result.user.role,
      email: result.user.email,
      name: result.user.name,
      sessionToken: result.token,
    });

    return result;
  }

  public logout() {
    this.sessionService.clearSession();
  }
}
