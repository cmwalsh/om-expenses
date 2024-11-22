import { ExpenseCreateSchema, ExpenseUpdateSchema } from "common";
import { count, eq, getTableColumns, ilike, or } from "drizzle-orm";
import { assert } from "ts-essentials";
import * as uuid from "uuid";
import * as v from "valibot";
import { ExpenseTable, TripTable, UserTable } from "../db/schema";
import { assertOneRecord, db, PaginationSchema, toDrizzleOrderBy, UUID, withId } from "./common";
import { tRPC } from "./trpc";

export const ExpenseRouter = tRPC.router({
  Search: tRPC.ProtectedProcedure.input(v.parser(PaginationSchema)).query(
    async ({ input: { take, skip, orderBy, search } }) => {
      const condition = search
        ? or(ilike(ExpenseTable.merchant, `%${search}%`), ilike(TripTable.name, `%${search}%`))
        : undefined;

      const query = db
        .select({ ...getTableColumns(ExpenseTable), trip_name: TripTable.name, user_name: UserTable.name })
        .from(ExpenseTable)
        .innerJoin(TripTable, eq(ExpenseTable.trip_id, TripTable.id))
        .innerJoin(UserTable, eq(ExpenseTable.user_id, UserTable.id))
        .where(condition)
        .limit(take)
        .offset(skip)
        .orderBy(toDrizzleOrderBy(ExpenseTable, orderBy, { trip_name: TripTable.name, user_name: UserTable.name }));

      const rows = await query;

      const [{ count: total }] = await db
        .select({ count: count() })
        .from(ExpenseTable)
        .innerJoin(TripTable, eq(ExpenseTable.trip_id, TripTable.id));

      return { rows, total } as const;
    },
  ),

  One: tRPC.ProtectedProcedure.input(v.parser(UUID)).query(async ({ input }) => {
    return assertOneRecord(await db.select().from(ExpenseTable).where(eq(ExpenseTable.id, input)));
  }),

  Create: tRPC.ProtectedProcedure.input(v.parser(ExpenseCreateSchema)).mutation(async ({ ctx, input }) => {
    const { ...rest } = input;

    const user_id = ctx.session.userId;

    const status = "unapproved";

    const id = uuid.v4();
    await db.insert(ExpenseTable).values({ id, user_id, status, ...rest });
    return id;
  }),

  Update: tRPC.ProtectedProcedure.input(v.parser(withId(ExpenseUpdateSchema))).mutation(
    async ({ input: [id, fields] }) => {
      const { ...rest } = fields;

      const expense = assertOneRecord(await db.select().from(ExpenseTable).where(eq(ExpenseTable.id, id)));
      assert(expense.status === "unapproved", "Only unapproved expenses can be updated");

      await db
        .update(ExpenseTable)
        .set({ ...rest, updated: new Date() })
        .where(eq(ExpenseTable.id, id));
    },
  ),
});
