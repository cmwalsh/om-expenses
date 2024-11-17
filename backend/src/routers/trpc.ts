import { initTRPC, TRPCError } from "@trpc/server";
import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { assertUnreachable } from "common";
import { IncomingMessage } from "node:http";
import { verifyToken } from "./common";

export namespace tRPC {
  const tRPC = initTRPC.context<Context>().create();

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
      return {
        userId: verifyResponse[1].id,
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
