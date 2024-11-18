import { assertError, includes, keys } from "common";
import { asc, desc, getTableColumns } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import * as v from "valibot";
import * as dbSchema from "../db/schema";

export const SECRET_KEY = v.parse(v.pipe(v.string(), v.minLength(16), v.title("SECRET_KEY")), process.env.SECRET_KEY);

export interface TokenPayload {
  id: string;
}

export type ValidToken = readonly ["valid", TokenPayload];
export type ExpiredToken = readonly ["expired", undefined];
export type InvalidToken = readonly ["invalid", undefined];
export type AnonymousNoToken = readonly ["anon", undefined];

export type TokenResponse = ValidToken | ExpiredToken | InvalidToken | AnonymousNoToken;

export function verifyToken(token: string | undefined): TokenResponse {
  if (!token) return ["anon", undefined];

  try {
    const payload = jwt.verify(token, SECRET_KEY) as TokenPayload;
    return ["valid", payload];
  } catch (err) {
    assertError(err);

    if (err instanceof TokenExpiredError) {
      return ["expired", undefined];
    }

    return ["invalid", undefined];
  }
}

export const db = drizzle(process.env.DATABASE_URL!, { schema: dbSchema });

export const PaginationSchema = v.object({
  take: v.pipe(v.number(), v.minValue(0)),
  skip: v.pipe(v.number(), v.minValue(0)),
  orderBy: v.array(v.pipe(v.tuple([v.string(), v.picklist(["asc", "desc"])]), v.readonly())),
  search: v.optional(v.string()),
});

export type Pagination = v.InferOutput<typeof PaginationSchema>;

export const UUID = v.pipe(v.string(), v.uuid());

/** Fail if anything other than a single record is returned in a query */
export function assertOneRecord<T>(records: readonly T[]): T {
  if (records.length === 1) return records[0];
  throw new Error(`Expect 1, found ${records.length}`);
}

export function toDrizzleOrderBy(table: dbSchema.TableType, orderBy: Pagination["orderBy"]) {
  let orderByClause = asc(table.id);

  if (orderBy.length > 0) {
    const [col, dir] = orderBy[0];

    if (includes(col, keys(getTableColumns(table)))) {
      if (dir === "asc") orderByClause = asc(table[col]);
      if (dir === "desc") orderByClause = desc(table[col]);
    }
  }

  return orderByClause;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withId<TSchema extends v.ObjectSchema<any, any>>(schema: TSchema) {
  return v.tuple([UUID, schema] as const);
}
