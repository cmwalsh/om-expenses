import { AuthRouter } from "./auth.ts";
import { ExpenseRouter } from "./expense.ts";
import { StatsRouter } from "./stats.ts";
import { TripRouter } from "./trip.ts";
import { tRPC } from "./trpc.ts";
import { UserRouter } from "./user.ts";

export * from "./trpc.ts";

export const AppRouter = tRPC.router({
  Auth: AuthRouter,
  Expense: ExpenseRouter,
  Stats: StatsRouter,
  Trip: TripRouter,
  User: UserRouter,
});
