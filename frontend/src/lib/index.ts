import type { AppRouter } from "@om-expenses/backend";
import { assertUnreachable, type EntityType } from "@om-expenses/common";
import type { CreateTRPCClient } from "npm:@trpc/client@11.0.0-rc.648";
import type { Unsubscribable } from "npm:@trpc/server/observable";
import { assert } from "npm:ts-essentials";
import * as v from "npm:valibot";
import type { FetchParameters, SessionUser } from "./common.ts";
import { SessionService } from "./session.ts";
import { ToastService } from "./toast.ts";
import { getTrpcClient } from "./trpc.ts";
import type { TripRecord, UserRecord } from "./types.ts";

export * from "./common.ts";
export * from "./toast.ts";
export * from "./types.ts";

export class AppService {
  private static appService?: AppService;

  public static get() {
    if (this.appService) return this.appService;
    return (this.appService = new AppService());
  }

  public tRPC = getTrpcClient({
    getAuthorisation: () => this.sessionService.session()?.sessionUser.sessionToken,
    onSessionExpired: () => this.onSessionExpired(),
  });

  public lookupService = new LookupService(this.tRPC);
  public toastService = new ToastService();

  private sessionService = new SessionService();

  private activitySubscription: Unsubscribable | undefined;

  constructor() {
    console.log("AppService init");

    this.subscribeToActivity();
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

    this.subscribeToActivity();

    return result;
  }

  public logout() {
    this.sessionService.clearSession();
  }

  private onSessionExpired() {
    this.sessionService.clearSession();

    if (globalThis.location.pathname !== "/login") {
      globalThis.location.href = "/login?reason=expired";
    }
  }

  private subscribeToActivity() {
    if (this.getCurrentUser()) {
      if (this.activitySubscription) {
        this.activitySubscription.unsubscribe();
      }

      this.activitySubscription = this.tRPC.Auth.Activity.subscribe(undefined, {
        onData: (data) => {
          this.toastService.addToast({ title: "Data", message: data, life: 5000 });
        },
      });
    }
  }
}

class LookupService {
  constructor(private api: CreateTRPCClient<AppRouter>) {}

  public getOne(type: EntityType, id: string): Promise<unknown> {
    if (type === "User") {
      return this.api.User.One.query(id);
    } else if (type === "Trip") {
      return this.api.Trip.One.query(id);
    } else {
      assertUnreachable(type);
    }
  }

  public getMany(
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
