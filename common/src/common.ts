import * as v from "valibot";

export type SearchResult<T> = { rows: readonly T[]; total: number };

export type EntityType = "User" | "Trip";

export interface FieldMetadata {
  [key: string]: unknown;
  icon: string;
  lookup?: EntityType;
}

export const FieldMetadata = (m: FieldMetadata) => m;

export const EmailAddress = v.pipe(
  v.string(),
  v.email("Not a valid email address"),
  v.title("Email Address"),
  v.metadata(FieldMetadata({ icon: "@" })),
);

export const Password = (title: string, desc = "") =>
  v.pipe(v.string(), v.minLength(8), v.title(title), v.description(desc), v.metadata(FieldMetadata({ icon: "⋯" })));
