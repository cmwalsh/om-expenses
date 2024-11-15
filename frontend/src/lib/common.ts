import { assert } from "ts-essentials";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  sessionToken: string;
}

export interface QuerySort {
  sort: string;
  dir: "asc" | "desc";
}

export interface FetchParameters {
  skip: number;
  take: number;
  search: string;
  orderBy: Record<string, 'asc' | 'desc'>[];
}

export function normaliseError(err: Error) {
  // if (err instanceof AxiosError) {
  //   if (err.response?.data.message) {
  //     const newErr = new Error(err.response?.data.message);
  //     return newErr;
  //   }
  // }

  return err;
}

export type PropsOf<TComponent> = TComponent extends (props: infer T) => void ? T : never;

export function titleCase(str: string) {
  str = str.toLowerCase();

  const str2 = str.split(" ");

  for (var i = 0; i < str2.length; i++) {
    str2[i] = str2[i].charAt(0).toUpperCase() + str2[i].slice(1);
  }

  return str2.join(" ");
}

export function humanise(inputString: string) {
  const formattedString = inputString.replace(/[-_]/g, " ");

  const finalFormattedString = formattedString.replace(/([a-z])([A-Z])/g, "$1 $2");

  return finalFormattedString.replace(/\b\w/g, (match) => match.toUpperCase());
}

export function camelToPascal(camelCaseString: string) {
  return camelCaseString.charAt(0).toUpperCase() + camelCaseString.slice(1);
}

export function assertError(err: unknown): asserts err is Error {
  assert(err instanceof Error, "Error is not an instance of `Error`");
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
