import { AuthRouter } from "./auth";
import { ExpenseRouter } from "./expense";
import { StatsRouter } from "./stats";
import { TripRouter } from "./trip";
import { tRPC } from "./trpc";
import { UserRouter } from "./user";

export * from "./trpc";

export const AppRouter = tRPC.router({
  Auth: AuthRouter,
  Expense: ExpenseRouter,
  Stats: StatsRouter,
  Trip: TripRouter,
  User: UserRouter,
});
