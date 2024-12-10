import type { AppRouter } from "@om-expenses/backend";
import type { SearchResult } from "@om-expenses/common";
import type { ElementOf } from "npm:ts-essentials";

type InferSearchReturn<TRoute extends (req: never) => unknown> = InferReturn<TRoute> extends SearchResult<infer T>
  ? T
  : never;

export type InferReturn<TRoute extends (req: never) => unknown> = ReturnType<TRoute> extends PromiseLike<infer T>
  ? T
  : never;

export type UserSearchRecord = InferSearchReturn<AppRouter["User"]["Search"]>;
export type TripSearchRecord = InferSearchReturn<AppRouter["Trip"]["Search"]>;
export type ExpenseSearchRecord = InferSearchReturn<AppRouter["Expense"]["Search"]>;

export type UserRecord = InferReturn<AppRouter["User"]["One"]>;
export type TripRecord = InferReturn<AppRouter["Trip"]["One"]>;
export type ExpenseRecord = InferReturn<AppRouter["Expense"]["One"]>;

export type TripSummaryInfo = ElementOf<InferReturn<AppRouter["Stats"]["TripSummaries"]>>;
export type UserTripSummaryInfo = ElementOf<InferReturn<AppRouter["Stats"]["UserTripSummaries"]>>;
