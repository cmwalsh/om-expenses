import { TripAddUserSchema, TripCreateSchema, TripUpdateSchema } from "common";
import { and, eq, ilike, or } from "drizzle-orm";
import * as uuid from "uuid";
import * as v from "valibot";
import { TripTable, UserToTripTable } from "../db/schema";
import { assertOneRecord, assertRole, db, PaginationSchema, toDrizzleOrderBy, UUID, withId } from "./common";
import { tRPC } from "./trpc";

export const TripRouter = tRPC.router({
  Search: tRPC.ProtectedProcedure.input(v.parser(PaginationSchema)).query(
    async ({ input: { take, skip, orderBy, search } }) => {
      const condition = search ? or(ilike(TripTable.name, `%${search}%`)) : undefined;

      const query = db
        .select()
        .from(TripTable)
        .where(condition)
        .limit(take)
        .offset(skip)
        .orderBy(toDrizzleOrderBy(TripTable, orderBy));

      const rows = await query;
      const total = await db.$count(TripTable, condition);

      return { rows, total } as const;
    },
  ),

  One: tRPC.ProtectedProcedure.input(v.parser(UUID)).query(async ({ input }) => {
    return assertOneRecord(await db.select().from(TripTable).where(eq(TripTable.id, input)));
  }),

  Create: tRPC.ProtectedProcedure.input(v.parser(TripCreateSchema)).mutation(async ({ ctx, input }) => {
    assertRole(ctx, "admin");

    const { ...rest } = input;

    const id = uuid.v4();
    await db.insert(TripTable).values({ id, ...rest });
    return id;
  }),

  Update: tRPC.ProtectedProcedure.input(v.parser(withId(TripUpdateSchema))).mutation(
    async ({ ctx, input: [id, fields] }) => {
      assertRole(ctx, "admin");

      const { ...rest } = fields;

      await db
        .update(TripTable)
        .set({ ...rest, updated: new Date() })
        .where(eq(TripTable.id, id));
    },
  ),

  Delete: tRPC.ProtectedProcedure.input(v.parser(UUID)).mutation(async ({ ctx, input }) => {
    assertRole(ctx, "admin");

    await db.delete(TripTable).where(eq(TripTable.id, input));
  }),

  AddUser: tRPC.ProtectedProcedure.input(v.parser(TripAddUserSchema)).mutation(async ({ ctx, input }) => {
    assertRole(ctx, "admin");

    const { user_id, trip_id } = input;

    const id = uuid.v4();
    await db.insert(UserToTripTable).values({ id, user_id, trip_id });
    return id;
  }),

  RemoveUser: tRPC.ProtectedProcedure.input(v.parser(TripAddUserSchema)).mutation(async ({ ctx, input }) => {
    assertRole(ctx, "admin");

    const { user_id, trip_id } = input;

    await db
      .delete(UserToTripTable)
      .where(and(eq(UserToTripTable.user_id, user_id), eq(UserToTripTable.trip_id, trip_id)));
  }),
});
