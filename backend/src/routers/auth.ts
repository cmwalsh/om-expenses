import { LoginDataSchema } from "common";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { assert } from "ts-essentials";
import * as v from "valibot";
import { Config } from "../config/index.ts";
import { UserTable } from "../db/schema.ts";
import { assertOneRecord, db, scryptAsync, TokenPayload } from "./common.ts";
import { tRPC } from "./trpc.ts";

export const AuthRouter = tRPC.router({
  Login: tRPC.PublicProcedure.input(v.parser(LoginDataSchema)).mutation(async ({ input }) => {
    const user = assertOneRecord(
      await db.select().from(UserTable).where(eq(UserTable.email, input.email.toLowerCase())),
    );

    const result = (await scryptAsync(input.password, user.id)) === user.password_hash;
    assert(result, "Invalid password");

    const payload: TokenPayload = { id: user.id };

    const token = jwt.sign(payload, Config.OM_SECRET_KEY, { expiresIn: "1h" }); // Expires in 1 hour

    return { user, token };
  }),
});
