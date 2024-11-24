import { and, count, desc, eq, getTableColumns, isNotNull, or, sum } from "drizzle-orm";
import * as v from "valibot";
import { ExpenseTable, TripTable, UserTable, UserToTripTable } from "../db/schema";
import { db } from "./common";
import { tRPC } from "./trpc";

export const StatsRouter = tRPC.router({
  Stats: tRPC.ProtectedProcedure.input(v.parser(v.object({}))).query(async () => {
    const userCount = await db.$count(UserTable);
    const tripCount = await db.$count(TripTable);
    const expenseCount = await db.$count(ExpenseTable, eq(ExpenseTable.status, "unapproved"));

    return { userCount, tripCount, expenseCount };
  }),

  TripSummaries: tRPC.ProtectedProcedure.input(v.parser(v.object({}))).query(async () => {
    const users = db
      .select({
        trip_id: UserToTripTable.trip_id,
        count: count(UserToTripTable.id).as("user_count"),
      })
      .from(UserToTripTable)
      .groupBy(UserToTripTable.trip_id)
      .as("users");

    const unapproved = db
      .select({
        trip_id: ExpenseTable.trip_id,
        amount: sum(ExpenseTable.amount).as("unapproved_amount"),
        count: count(ExpenseTable.id).as("unapproved_count"),
      })
      .from(ExpenseTable)
      .where(eq(ExpenseTable.status, "unapproved"))
      .groupBy(ExpenseTable.trip_id)
      .as("expense_unapproved");

    const approved = db
      .select({
        trip_id: ExpenseTable.trip_id,
        amount: sum(ExpenseTable.amount).as("approved_amount"),
        count: count(ExpenseTable.id).as("approved_count"),
      })
      .from(ExpenseTable)
      .where(eq(ExpenseTable.status, "approved"))
      .groupBy(ExpenseTable.trip_id)
      .as("expense_approved");

    return db
      .select({
        ...getTableColumns(TripTable),
        user_count: users.count,
        unapproved: unapproved.amount,
        unapproved_count: unapproved.count,
        approved: approved.amount,
        approved_count: approved.count,
      })
      .from(TripTable)
      .leftJoin(users, eq(TripTable.id, users.trip_id))
      .leftJoin(unapproved, eq(TripTable.id, unapproved.trip_id))
      .leftJoin(approved, eq(TripTable.id, approved.trip_id))
      .where(or(isNotNull(unapproved.amount), isNotNull(approved.amount)))
      .orderBy(desc(unapproved.amount));
  }),

  UserTripSummaries: tRPC.ProtectedProcedure.input(v.parser(v.object({}))).query(async ({ ctx }) => {
    const tripsThisUserIsOn = eq(UserToTripTable.user_id, ctx.session.user.id);
    const expensesBelongingToThisUser = eq(ExpenseTable.user_id, ctx.session.user.id);

    const unapproved = db
      .select({
        trip_id: ExpenseTable.trip_id,
        amount: sum(ExpenseTable.amount).as("unapproved_amount"),
        count: count(ExpenseTable.id).as("unapproved_count"),
      })
      .from(ExpenseTable)
      .where(and(eq(ExpenseTable.status, "unapproved"), expensesBelongingToThisUser))
      .groupBy(ExpenseTable.trip_id)
      .as("expense_unapproved");

    const approved = db
      .select({
        trip_id: ExpenseTable.trip_id,
        amount: sum(ExpenseTable.amount).as("approved_amount"),
        count: count(ExpenseTable.id).as("approved_count"),
      })
      .from(ExpenseTable)
      .where(and(eq(ExpenseTable.status, "approved"), expensesBelongingToThisUser))
      .groupBy(ExpenseTable.trip_id)
      .as("expense_approved");

    return db
      .select({
        ...getTableColumns(TripTable),
        unapproved: unapproved.amount,
        unapproved_count: unapproved.count,
        approved: approved.amount,
        approved_count: approved.count,
      })
      .from(TripTable)
      .innerJoin(UserToTripTable, and(tripsThisUserIsOn, eq(TripTable.id, UserToTripTable.trip_id)))
      .leftJoin(unapproved, eq(TripTable.id, unapproved.trip_id))
      .leftJoin(approved, eq(TripTable.id, approved.trip_id))
      .orderBy(desc(unapproved.amount));
  }),
});
