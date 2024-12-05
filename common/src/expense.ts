import * as v from "valibot";
import { FieldMetadata } from "./common.ts";

export const ExpenseType = ["food", "travel", "other"] as const;

export const ExpenseStatus = ["unapproved", "approved", "rejected"] as const;

export const ExpenseCreateSchema = v.object({
  trip_id: v.pipe(v.string(), v.uuid(), v.title("Trip"), v.metadata(FieldMetadata({ icon: "✈", lookup: "Trip" }))),
  type: v.pipe(v.picklist(ExpenseType), v.title("Type"), v.metadata(FieldMetadata({ icon: "❓" }))),
  merchant: v.pipe(v.string(), v.minLength(2), v.title("Merchant"), v.metadata(FieldMetadata({ icon: "🛍" }))),
  amount: v.pipe(v.string(), v.decimal(), v.title("Amount"), v.metadata(FieldMetadata({ icon: "💰" }))),
});

export type ExpenseCreate = v.InferInput<typeof ExpenseCreateSchema>;

export const ExpenseUpdateSchema = v.partial(ExpenseCreateSchema);

export type ExpenseUpdate = v.InferInput<typeof ExpenseUpdateSchema>;
