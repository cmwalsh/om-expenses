import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export type TableType = typeof UserTable | typeof TripTable;

export const UserTable = sqliteTable("user", {
  id: text({ length: 36 }).primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
});

export const TripTable = sqliteTable("trip", {
  id: text({ length: 36 }).primaryKey(),
  name: text().notNull(),
});
