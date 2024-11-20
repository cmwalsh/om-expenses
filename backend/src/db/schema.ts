import { relations, sql } from "drizzle-orm";
import { pgEnum, pgTable, unique, uuid, varchar } from "drizzle-orm/pg-core";

export type TableType = typeof UserTable | typeof TripTable;

// insert into "user" (role, name, email, password_hash) values ('admin', 'Admin', 'admin@example.com', '');

const BcryptHashLength = 60;

export const UserRole = pgEnum("user_role", ["admin", "user"]);

export const UserTable = pgTable("user", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  role: UserRole().notNull(),
  name: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 100 }).notNull().unique(),
  password_hash: varchar({ length: BcryptHashLength }).notNull(),
});

export const UsersRelations = relations(UserTable, ({ many }) => ({
  trips: many(UserToTripTable),
}));

export const TripTable = pgTable("trip", {
  id: uuid().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
});

export const GroupRelations = relations(TripTable, ({ many }) => ({
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
  },
  (t) => {
    return {
      unq: unique().on(t.user_id, t.trip_id).nullsNotDistinct(),
    };
  },
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
