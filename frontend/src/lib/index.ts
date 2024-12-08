import { assertUnreachable, EntityType } from "@om-expenses/common";
import type { AppRouter } from "backend";
import {
  CreateTRPCClient,
  createTRPCClient,
  httpBatchLink,
  TRPCClientError,
  TRPCLink,
} from "npm:@trpc/client@11.0.0-rc.648";
import { observable } from "npm:@trpc/server@11.0.0-rc.648/observable";
import superjson from "npm:superjson";
import { assert } from "npm:ts-essentials";
import * as v from "npm:valibot";
import { FetchParameters, getApiBaseUrl, SessionUser } from "./common.ts";
import { SessionService } from "./session.ts";
import { TripRecord, UserRecord } from "./types.ts";

export * from "./common.ts";
export * from "./toast.ts";
export * from "./types.ts";

interface CustomLinkOpts {
  onError: (err: Error) => void;
}

export const errorLink =
  (opts: CustomLinkOpts): TRPCLink<AppRouter> =>
  () => {
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

const ApiBaseUrl = getApiBaseUrl();

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
            if (err.data && "code" in err.data && err.data.code === "UNAUTHORIZED") {
              this.sessionService.clearSession();
              window.location.href = "/login?reason=expired";
            }
          }
        },
      }),
      httpBatchLink({
        url: ApiBaseUrl,
        headers: () => {
          const session = this.sessionService.session();
          const headers: Record<string, string> = {};

          if (session) {
            headers.Authorization = session.sessionUser.sessionToken;
          }

          return headers;
        },
        transformer: superjson,
      }),
    ],
  });

  public lookupService = new LookupService(this.tRPC);

  private sessionService = new SessionService();

  constructor() {
    console.log("AppService init");
  }

  public getCurrentUser(): SessionUser | null {
    const session = this.sessionService.session();

    return session?.sessionUser ?? null;
  }

  public mustGetCurrentUser(): SessionUser | null {
    const session = this.sessionService.session();
    assert(session, "mustGetCurrentUser: No session!");

    return session.sessionUser ?? null;
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

class LookupService {
  constructor(private api: CreateTRPCClient<AppRouter>) {}

  public async getOne(type: EntityType, id: string): Promise<unknown> {
    if (type === "User") {
      return this.api.User.One.query(id);
    } else if (type === "Trip") {
      return this.api.Trip.One.query(id);
    } else {
      assertUnreachable(type);
    }
  }

  public async getMany(
    type: EntityType,
    fetch: FetchParameters
  ): Promise<{ rows: readonly { id: string }[]; total: number }> {
    if (type === "User") {
      return this.api.User.Search.query(fetch);
    } else if (type === "Trip") {
      return this.api.Trip.Search.query(fetch);
    } else {
      assertUnreachable(type);
    }
  }

  public getName(type: EntityType, record: unknown) {
    if (type === "User") {
      const user = record as UserRecord;
      return user.name;
    } else if (type === "Trip") {
      const trip = record as TripRecord;
      return trip.name;
    } else {
      assertUnreachable(type);
    }
  }

  public getLookupTableSchema(type: EntityType) {
    if (type === "User") {
      return v.object({
        name: v.pipe(v.string(), v.title("Name")),
      });
    } else if (type === "Trip") {
      return v.object({
        name: v.pipe(v.string(), v.title("Name")),
      });
    } else {
      assertUnreachable(type);
    }
  }
}
