import { ElementOf } from "ts-essentials";

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
  orderBy: (readonly [string, "asc" | "desc"])[];
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

export const Colours = ["primary", "secondary", "success", "danger", "warning", "info"] as const;

export type Colour = ElementOf<typeof Colours>;
