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
  v.metadata(FieldMetadata({ icon: "@" }))
);

export const Password = (title: string, desc = "") =>
  v.pipe(v.string(), v.minLength(8), v.title(title), v.description(desc), v.metadata(FieldMetadata({ icon: "🔑" })));

export function pickPrefix<TObj extends object, TPrefix extends string>(obj: TObj, prefix: TPrefix) {
  return Object.fromEntries(Object.entries(obj).filter(([e]) => e.startsWith(prefix))) as Pick<
    TObj,
    PickPrefix<Extract<keyof TObj, string>, TPrefix>
  >;
}

type PickPrefix<S extends string, P extends string> = S extends `${P}${string}` ? S : never;

// const foo: { foo_one: number; foo_two: number } = pickPrefix({ foo_one: 1, foo_two: 2, bar_one: 1 }, "foo");
