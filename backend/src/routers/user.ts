import bcrypt from "bcrypt";
import { UserCreateSchema, UserUpdateSchema } from "common";
import { eq, ilike, or } from "drizzle-orm";
import { assert } from "ts-essentials";
import * as uuid from "uuid";
import * as v from "valibot";
import { UserTable } from "../db/schema";
import { assertOneRecord, db, PaginationSchema, toDrizzleOrderBy, UUID, withId } from "./common";
import { tRPC } from "./trpc";

const saltRounds = 10;

export const UserRouter = tRPC.router({
  Search: tRPC.ProtectedProcedure.input(v.parser(PaginationSchema)).query(
    async ({ input: { take, skip, orderBy, search } }) => {
      const condition = search
        ? or(ilike(UserTable.email, `%${search}%`), ilike(UserTable.name, `%${search}%`))
        : undefined;

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
    const password_hash = await bcrypt.hash(new_password, saltRounds);

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
          .set({ ...rest })
          .where(eq(UserTable.id, id));

        if (new_password) {
          assert(new_password === confirm_password, "Passwords do not match");
          const password_hash = await bcrypt.hash(new_password, saltRounds);

          await tx.update(UserTable).set({ password_hash }).where(eq(UserTable.id, id));
        }
      });
    },
  ),
});
