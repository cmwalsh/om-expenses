import { canApprove, ExpenseCreateSchema, ExpenseStatus, ExpenseType, ExpenseUpdateSchema } from "@om-expenses/common";
import { and, count, eq, getTableColumns, ilike, or } from "npm:drizzle-orm";
import { assert } from "npm:ts-essentials";
import * as uuid from "npm:uuid";
import * as v from "npm:valibot";
import { ExpenseTable, TripTable, UserTable } from "../db/schema.ts";
import { assertOneRecord, db, PaginationSchema, toDrizzleOrderBy, UUID, withId } from "./common.ts";
import { tRPC } from "./trpc.ts";

const ExpenseSearchSchema = v.intersect([
  PaginationSchema,
  v.partial(
    v.object({ user_id: UUID, trip_id: UUID, type: v.picklist(ExpenseType), status: v.picklist(ExpenseStatus) })
  ),
]);

export const ExpenseRouter = tRPC.router({
  Search: tRPC.ProtectedProcedure.input(v.parser(ExpenseSearchSchema)).query(
    async ({ ctx, input: { take, skip, orderBy, search, user_id, trip_id, type, status } }) => {
      const quickSearchCondition = search
        ? or(ilike(ExpenseTable.merchant, `%${search}%`), ilike(TripTable.name, `%${search}%`))
        : undefined;

      // Users can only see expenses belonging to them
      if (ctx.session.user.role !== "admin") {
        user_id = ctx.session.user.id;
      }

      const condition = and(
        quickSearchCondition,
        user_id ? eq(ExpenseTable.user_id, user_id) : undefined,
        trip_id ? eq(ExpenseTable.trip_id, trip_id) : undefined,
        type ? eq(ExpenseTable.type, type) : undefined,
        status ? eq(ExpenseTable.status, status) : undefined
      );

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
        .innerJoin(TripTable, eq(ExpenseTable.trip_id, TripTable.id))
        .where(condition);

      return { rows, total } as const;
    }
  ),

  One: tRPC.ProtectedProcedure.input(v.parser(UUID)).query(async ({ ctx, input }) => {
    const condition = and(
      eq(ExpenseTable.id, input),
      ctx.session.user.role !== "admin" ? eq(ExpenseTable.user_id, ctx.session.user.id) : undefined
    );

    return assertOneRecord(await db.select().from(ExpenseTable).where(condition));
  }),

  Create: tRPC.ProtectedProcedure.input(v.parser(ExpenseCreateSchema)).mutation(async ({ ctx, input }) => {
    const { ...rest } = input;

    const user_id = ctx.session.user.id;

    const status = "unapproved";

    const id = uuid.v4();
    await db.insert(ExpenseTable).values({ id, user_id, status, ...rest });
    return id;
  }),

  Update: tRPC.ProtectedProcedure.input(v.parser(withId(ExpenseUpdateSchema))).mutation(
    async ({ ctx, input: [id, fields] }) => {
      const { ...rest } = fields;

      await db.transaction(async (tx) => {
        const expense = assertOneRecord(await tx.select().from(ExpenseTable).where(eq(ExpenseTable.id, id)));
        // Admins can edit all, users can only edit own
        assert(ctx.session.user.role === "admin" || expense.user_id === ctx.session.user.id, "No permission");
        assert(expense.status === "unapproved", "Only unapproved expenses can be updated");

        await tx
          .update(ExpenseTable)
          .set({ ...rest, updated: new Date() })
          .where(eq(ExpenseTable.id, id));
      });
    }
  ),

  Delete: tRPC.ProtectedProcedure.input(v.parser(UUID)).mutation(async ({ ctx, input }) => {
    const expense = assertOneRecord(await db.select().from(ExpenseTable).where(eq(ExpenseTable.id, input)));
    // Admins can delete all, users can only delete own
    assert(ctx.session.user.role === "admin" || expense.user_id === ctx.session.user.id, "No permission");

    await db.delete(ExpenseTable).where(eq(ExpenseTable.id, input));
  }),

  Approve: tRPC.ProtectedProcedure.input(v.parser(UUID)).mutation(async ({ ctx, input }) => {
    await db.transaction(async (tx) => {
      const expense = assertOneRecord(await tx.select().from(ExpenseTable).where(eq(ExpenseTable.id, input)));

      const result = canApprove(ctx.session.user, expense);
      if (!result.success) throw new Error(result.message);

      await tx.update(ExpenseTable).set({ status: "approved" }).where(eq(ExpenseTable.id, input));
    });
  }),
});
