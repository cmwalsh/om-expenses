import { sql } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export type TableType = typeof UserTable | typeof TripTable;

// insert into "user" (name, email) values ('Admin', 'admin@example.com');

export const UserTable = pgTable("user", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text().notNull(),
  email: text().notNull().unique(),
});

export const TripTable = pgTable("trip", {
  id: uuid().primaryKey(),
  name: text().notNull(),
});
