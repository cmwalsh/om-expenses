import { eq } from "drizzle-orm";
import * as v from "valibot";
import { ExpenseTable, TripTable, UserTable } from "../db/schema";
import { db } from "./common";
import { tRPC } from "./trpc";

export const StatsRouter = tRPC.router({
  Stats: tRPC.ProtectedProcedure.input(v.parser(v.object({}))).query(async () => {
    const userCount = await db.$count(UserTable);
    const tripCount = await db.$count(TripTable);
    const expenseCount = await db.$count(ExpenseTable, eq(ExpenseTable.status, "unapproved"));

    return { userCount, tripCount, expenseCount };
  }),
});
