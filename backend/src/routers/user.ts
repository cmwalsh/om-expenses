import bcrypt from "bcrypt";
import { UserCreateSchema, UserUpdateSchema } from "common";
import { and, eq, ilike, inArray, or } from "drizzle-orm";
import { assert } from "ts-essentials";
import * as uuid from "uuid";
import * as v from "valibot";
import { UserTable, UserToTripTable } from "../db/schema";
import { assertOneRecord, db, PaginationSchema, toDrizzleOrderBy, UUID, withId } from "./common";
import { tRPC } from "./trpc";

const SaltRounds = 10;

const UserSearchSchema = v.intersect([PaginationSchema, v.object({ trip_id: v.optional(UUID) })]);

export const UserRouter = tRPC.router({
  Search: tRPC.ProtectedProcedure.input(v.parser(UserSearchSchema)).query(
    async ({ input: { take, skip, orderBy, search, trip_id } }) => {
      const quickSearchCondition = search
        ? or(ilike(UserTable.email, `%${search}%`), ilike(UserTable.name, `%${search}%`))
        : and();

      let tripFilterCondition = and();

      if (trip_id) {
        const subQuery = db
          .select({ id: UserToTripTable.user_id })
          .from(UserToTripTable)
          .where(eq(UserToTripTable.trip_id, trip_id));

        tripFilterCondition = inArray(UserTable.id, subQuery);
      }

      const condition = and(quickSearchCondition, tripFilterCondition);

      const query = db
        .select()
        .from(UserTable)
        .where(condition)
        .limit(take)
        .offset(skip)
        .orderBy(toDrizzleOrderBy(UserTable, orderBy));

      const rows = await query;
      const total = await db.$count(UserTable, condition);

      return { rows, total } as const;
    },
  ),

  One: tRPC.ProtectedProcedure.input(v.parser(UUID)).query(async ({ input }) => {
    return assertOneRecord(await db.select().from(UserTable).where(eq(UserTable.id, input)));
  }),

  Create: tRPC.ProtectedProcedure.input(v.parser(UserCreateSchema)).mutation(async ({ input }) => {
    const { new_password, confirm_password, ...rest } = input;

    assert(new_password === confirm_password, "Passwords do not match");
    const password_hash = await bcrypt.hash(new_password, SaltRounds);

    rest.email = rest.email.toLowerCase();

    const id = uuid.v4();
    await db.insert(UserTable).values({ id, ...rest, password_hash });
    return id;
  }),

  Update: tRPC.ProtectedProcedure.input(v.parser(withId(UserUpdateSchema))).mutation(
    async ({ input: [id, fields] }) => {
      const { new_password, confirm_password, ...rest } = fields;

      if (rest.email) rest.email = rest.email.toLowerCase();

      return db.transaction(async (tx) => {
        await tx
          .update(UserTable)
          .set({ ...rest, updated: new Date() })
          .where(eq(UserTable.id, id));

        if (new_password) {
          assert(new_password === confirm_password, "Passwords do not match");
          const password_hash = await bcrypt.hash(new_password, SaltRounds);

          await tx.update(UserTable).set({ password_hash }).where(eq(UserTable.id, id));
        }
      });
    },
  ),
});
