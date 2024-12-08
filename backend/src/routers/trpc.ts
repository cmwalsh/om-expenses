import { assertUnreachable } from "@om-expenses/common";
import type { IncomingMessage } from "node:http";
import { initTRPC, TRPCError } from "npm:@trpc/server@11.0.0-rc.648";
import type { CreateHTTPContextOptions } from "npm:@trpc/server@11.0.0-rc.648/adapters/standalone";
import { eq } from "npm:drizzle-orm";
import superjson from "npm:superjson@2.2.2";
import { UserTable } from "../db/schema.ts";
import { assertOneRecord, db, verifyToken } from "./common.ts";

export namespace tRPC {
  const tRPC = initTRPC.context<Context>().create({
    transformer: superjson,
  });

  export const createContext = async (opts: CreateHTTPContextOptions) => {
    const session = await getSession(opts.req);

    return {
      session,
    };
  };

  async function getSession(req: IncomingMessage) {
    const authorization = req.headers["authorization"];

    const verifyResponse = verifyToken(authorization);

    if (verifyResponse[0] === "expired") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Expired token",
      });
    }

    if (verifyResponse[0] === "invalid") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid token",
      });
    }

    if (verifyResponse[0] === "valid") {
      const userId = verifyResponse[1].id;

      const user = assertOneRecord(await db.select().from(UserTable).where(eq(UserTable.id, userId)));

      return {
        user,
      };
    }

    if (verifyResponse[0] === "anon") {
      return undefined;
    }

    assertUnreachable(verifyResponse);
  }

  export type Context = Awaited<ReturnType<typeof createContext>>;

  export const router = tRPC.router;

  export const mergeRouters = tRPC.mergeRouters;

  export const PublicProcedure = tRPC.procedure;

  export const ProtectedProcedure = tRPC.procedure.use((opts) => {
    if (!opts.ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }

    return opts.next({
      ctx: {
        // Infers the `session` as non-nullable
        session: opts.ctx.session,
      },
    });
  });
}
