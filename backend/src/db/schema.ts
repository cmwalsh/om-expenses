import { relations, sql } from "npm:drizzle-orm";
import { decimal, pgEnum, pgTable, timestamp, unique, uuid, varchar } from "npm:drizzle-orm/pg-core";
import { ExpenseStatus, ExpenseType, UserRole } from "../../../common/src/index.ts"; // Drizzle Kit bodge

export type TableType = typeof UserTable | typeof TripTable | typeof ExpenseTable;

// insert into "user" (role, name, email, password_hash) values ('admin', 'Admin', 'admin@example.com', '');

export const ScryptKeyLength = 64;
const ScryptHashLength = 88; // Base64 length of 64 bytes

export const UserRoleEnum = pgEnum("user_role", UserRole);

export const UserTable = pgTable("user", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  role: UserRoleEnum().notNull(),
  name: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 100 }).notNull().unique(),
  password_hash: varchar({ length: ScryptHashLength }).notNull(),
  created: timestamp({ withTimezone: false, mode: "date" }).notNull().defaultNow(),
  updated: timestamp({ withTimezone: false, mode: "date" }).notNull().defaultNow(),
});

export const UsersRelations = relations(UserTable, ({ many }) => ({
  trips: many(UserToTripTable),
}));

export const TripTable = pgTable("trip", {
  id: uuid().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  location: varchar({ length: 100 }).notNull(),
  created: timestamp({ withTimezone: false, mode: "date" }).notNull().defaultNow(),
  updated: timestamp({ withTimezone: false, mode: "date" }).notNull().defaultNow(),
});

export const TripRelations = relations(TripTable, ({ many }) => ({
  users: many(UserToTripTable),
}));

export const UserToTripTable = pgTable(
  "user_to_trip",
  {
    id: uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    user_id: uuid("user_id")
      .notNull()
      .references(() => UserTable.id),
    trip_id: uuid("trip_id")
      .notNull()
      .references(() => TripTable.id),
    created: timestamp({ withTimezone: false, mode: "date" }).notNull().defaultNow(),
    updated: timestamp({ withTimezone: false, mode: "date" }).notNull().defaultNow(),
  },
  (t) => {
    return {
      unq: unique().on(t.user_id, t.trip_id).nullsNotDistinct(),
    };
  }
);

export const UserToTripRelations = relations(UserToTripTable, ({ one }) => ({
  trip: one(TripTable, {
    fields: [UserToTripTable.trip_id],
    references: [TripTable.id],
  }),
  user: one(UserTable, {
    fields: [UserToTripTable.user_id],
    references: [UserTable.id],
  }),
}));

export const ExpenseTypeEnum = pgEnum("expense_type", ExpenseType);

export const ExpenseStatusEnum = pgEnum("expense_status", ExpenseStatus);

export const ExpenseTable = pgTable("expense", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  user_id: uuid("user_id")
    .notNull()
    .references(() => UserTable.id),
  trip_id: uuid("trip_id")
    .notNull()
    .references(() => TripTable.id),
  type: ExpenseTypeEnum().notNull(),
  status: ExpenseStatusEnum().notNull(),
  merchant: varchar({ length: 100 }).notNull(),
  amount: decimal({ precision: 12, scale: 2 }).notNull(),
  created: timestamp({ withTimezone: false, mode: "date" }).notNull().defaultNow(),
  updated: timestamp({ withTimezone: false, mode: "date" }).notNull().defaultNow(),
});

export const ExpenseRelations = relations(ExpenseTable, ({ one }) => ({
  trip: one(TripTable, {
    fields: [ExpenseTable.trip_id],
    references: [TripTable.id],
  }),
  user: one(UserTable, {
    fields: [ExpenseTable.user_id],
    references: [UserTable.id],
  }),
}));
