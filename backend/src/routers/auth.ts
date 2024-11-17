import { LoginDataSchema } from "common";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import * as v from "valibot";
import { UserTable } from "../db/schema";
import { assertOneRecord, db, SECRET_KEY, TokenPayload } from "./common";
import { tRPC } from "./trpc";

export const AuthRouter = tRPC.router({
  Login: tRPC.PublicProcedure.input(v.parser(LoginDataSchema)).mutation(async (opts) => {
    const { input } = opts;

    const user = assertOneRecord(await db.select().from(UserTable).where(eq(UserTable.email, input.email)));

    const payload: TokenPayload = { id: user.id };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" }); // Expires in 1 hour

    return {
      user,
      token,
    };
  }),
});
