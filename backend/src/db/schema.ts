import { sql } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export type TableType = typeof UserTable | typeof TripTable;

// insert into "user" (name, email, password_hash) values ('Admin', 'admin@example.com', '');

const BcryptHashLength = 60;

export const UserTable = pgTable("user", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 100 }).notNull().unique(),
  password_hash: varchar({ length: BcryptHashLength }).notNull(),
});

export const TripTable = pgTable("trip", {
  id: uuid().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
});
