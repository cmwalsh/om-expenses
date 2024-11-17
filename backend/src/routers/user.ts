import { UserCreateSchema, UserUpdateSchema } from "common";
import { eq } from "drizzle-orm";
import { v4 } from "uuid";
import * as v from "valibot";
import { UserTable } from "../db/schema";
import { assertOneRecord, db, PaginationSchema, toDrizzleOrderBy, UUID, withId } from "./common";
import { tRPC } from "./trpc";

export const UserRouter = tRPC.router({
  Search: tRPC.ProtectedProcedure.input(v.parser(PaginationSchema)).query(
    async ({ input: { take, skip, orderBy } }) => {
      const condition = undefined; //eq(UserTable.id, "1");

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
    const id = v4();
    await db.insert(UserTable).values({ ...input, id });
    return id;
  }),

  Update: tRPC.ProtectedProcedure.input(v.parser(withId(UserUpdateSchema))).mutation(
    async ({ input: [id, fields] }) => {
      await db.update(UserTable).set(fields).where(eq(UserTable.id, id));
    },
  ),
});
