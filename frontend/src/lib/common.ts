import { ElementOf } from "ts-essentials";

export interface SessionUser {
  id: string;
  role: "admin" | "user";
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

export interface FetchResult<TRow> {
  rows: readonly TRow[];
  total: number;
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

export function getApiBaseUrl() {
  if (window.location.hostname === "localhost") {
    return `http://localhost:${parseInt(window.location.port, 10) - 1}`;
  } else {
    return window.location.origin.replace("://", "://api.");
  }
}
