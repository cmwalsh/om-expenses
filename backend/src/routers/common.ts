import { assertError, includes, keys, type UserRole } from "@om-expenses/common";
import { scrypt } from "node:crypto";
import { asc, desc, getTableColumns } from "npm:drizzle-orm";
import { drizzle } from "npm:drizzle-orm/node-postgres";
import type { PgColumn } from "npm:drizzle-orm/pg-core";
// @deno-types="@types/jsonwebtoken"
import jwt from "jsonwebtoken";
import { assert } from "npm:ts-essentials";
import * as v from "npm:valibot";
import { Config } from "../config/index.ts";
import * as dbSchema from "../db/schema.ts";
import type { tRPC } from "./trpc.ts";

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
    const payload = jwt.verify(token, Config.OM_SECRET_KEY) as TokenPayload;
    return ["valid", payload];
  } catch (err) {
    assertError(err);

    if (err instanceof jwt.TokenExpiredError) {
      return ["expired", undefined];
    }

    return ["invalid", undefined];
  }
}

export const db = drizzle(Config.OM_DATABASE_URL, { schema: dbSchema });

export const PaginationSchema = v.object({
  take: v.pipe(v.number(), v.minValue(0)),
  skip: v.pipe(v.number(), v.minValue(0)),
  orderBy: v.array(v.pipe(v.tuple([v.string(), v.picklist(["asc", "desc"])]), v.readonly())),
  search: v.optional(v.string()),
});

export type Pagination = v.InferOutput<typeof PaginationSchema>;

export const UUID = v.pipe(v.string(), v.uuid());

export function assertRole(ctx: tRPC.Context, role: UserRole) {
  assert(ctx.session?.user.role === role, `Must be role of "${role}". You are "${ctx.session?.user.role ?? "Anon"}."`);
}

/** Fail if anything other than a single record is returned in a query */
export function assertOneRecord<T>(records: readonly T[]): T {
  if (records.length === 1) return records[0];
  throw new Error(`Expected a single record but found ${records.length}`);
}

export function toDrizzleOrderBy(
  table: dbSchema.TableType,
  orderBy: Pagination["orderBy"],
  joinColumns: Record<string, PgColumn> = {}
) {
  let orderByClause = asc(table.created);

  if (orderBy.length > 0) {
    const [colName, dir] = orderBy[0];

    let column: PgColumn | undefined;

    if (includes(colName, keys(getTableColumns(table)))) {
      column = table[colName];
    }

    if (colName in joinColumns) {
      column = joinColumns[colName];
    }

    if (column) {
      if (dir === "asc") orderByClause = asc(column);
      if (dir === "desc") orderByClause = desc(column);
    } else {
      console.warn("toDrizzleOrderBy: Could not resolve column:", colName);
    }
  }

  return orderByClause;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withId<TSchema extends v.ObjectSchema<any, any>>(schema: TSchema) {
  return v.tuple([UUID, schema] as const);
}

export function scryptAsync(password: string, salt: string) {
  return new Promise<string>((resolve, reject) => {
    scrypt(password, salt, dbSchema.ScryptKeyLength, (err, result) => {
      if (err) return reject(err);
      return resolve(result.toString("base64"));
    });
  });
}
