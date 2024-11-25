import { AuthRouter } from "./auth.js";
import { ExpenseRouter } from "./expense.js";
import { StatsRouter } from "./stats.js";
import { TripRouter } from "./trip.js";
import { tRPC } from "./trpc.js";
import { UserRouter } from "./user.js";

export * from "./trpc.js";

export const AppRouter = tRPC.router({
  Auth: AuthRouter,
  Expense: ExpenseRouter,
  Stats: StatsRouter,
  Trip: TripRouter,
  User: UserRouter,
});
