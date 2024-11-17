import { AuthRouter } from "./auth";
import { tRPC } from "./trpc";
import { UserRouter } from "./user";

export * from "./trpc";

export const AppRouter = tRPC.router({
  Auth: AuthRouter,
  User: UserRouter,
});
