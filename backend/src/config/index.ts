import { pickPrefix } from "common";
import * as v from "valibot";

export const ConfigSchema = v.object({
  OM_DATABASE_URL: v.pipe(v.string(), v.startsWith("postgresql://")),
  OM_SECRET_KEY: v.pipe(v.string(), v.minLength(16)),
  OM_BACKEND_PORT: v.pipe(
    v.string(),
    v.decimal(),
    v.transform((s) => parseInt(s, 10)),
  ),
});

export const Config = v.parse(ConfigSchema, pickPrefix(process.env, "OM_"));
