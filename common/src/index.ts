import { assert } from "ts-essentials";

export * from "./trip";
export * from "./user";

export function assertError(err: unknown): asserts err is Error {
  assert(err instanceof Error, "Error is not an instance of `Error`");
}

export function assertUnreachable(x: never): never {
  console.error("assertUnreachable:", x);

  throw new Error(`An unreachable event has occurred: ${String(x)} / ${typeof x}`);
}

export function includes<T, L extends T>(t: T, list: readonly L[]): t is L {
  return list.includes(t as L);
}

export function keys<T extends object>(obj: T) {
  return Object.keys(obj) as unknown as readonly (keyof T)[];
}

export type PropsOf<TComponent> = TComponent extends (props: infer T) => void ? T : never;

export function titleCase(str: string) {
  str = str.toLowerCase();

  const str2 = str.split(" ");

  for (let i = 0; i < str2.length; i++) {
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

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
