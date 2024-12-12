import type { ElementOf } from "ts-essentials";
import * as v from "valibot";
import { assertConditions, FieldMetadata } from "./common.ts";
import type { UserInfo } from "./user.ts";

export const ExpenseType = ["food", "travel", "other"] as const;
export type ExpenseType = ElementOf<typeof ExpenseType>;

export const ExpenseStatus = ["unapproved", "approved", "rejected"] as const;
export type ExpenseStatus = ElementOf<typeof ExpenseStatus>;

export interface ExpenseInfo {
  id: string;
  type: ExpenseType;
  status: ExpenseStatus;
  user_id: string;
  trip_id: string;
  created: Date;
  updated: Date;
  merchant: string;
  amount: string;
}

export const ExpenseCreateSchema = v.object({
  trip_id: v.pipe(v.string(), v.uuid(), v.title("Trip"), v.metadata(FieldMetadata({ icon: "✈", lookup: "Trip" }))),
  type: v.pipe(v.picklist(ExpenseType), v.title("Type"), v.metadata(FieldMetadata({ icon: "❓" }))),
  merchant: v.pipe(v.string(), v.minLength(2), v.title("Merchant"), v.metadata(FieldMetadata({ icon: "🛍" }))),
  amount: v.pipe(v.string(), v.decimal(), v.title("Amount"), v.metadata(FieldMetadata({ icon: "💰" }))),
});

export type ExpenseCreate = v.InferInput<typeof ExpenseCreateSchema>;

export const ExpenseUpdateSchema = v.partial(ExpenseCreateSchema);

export type ExpenseUpdate = v.InferInput<typeof ExpenseUpdateSchema>;

export function canApprove(user: UserInfo, expense: ExpenseInfo) {
  return assertConditions({
    and: [
      [user.role === "admin", "User is an admin"],
      [expense.status === "unapproved", "Expense is unapproved"],
    ],
  });
}
